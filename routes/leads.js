const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// In-memory storage for demo (use database in production)
const leads = new Map();
const leadHistory = [];

// Input validation middleware
const validateLead = (req, res, next) => {
  const { name, email, phone } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: 'Name and email are required'
    });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }
  
  next();
};

// Create new lead
router.post('/', validateLead, (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      experience,
      goals,
      interests,
      source,
      sessionId
    } = req.body;

    // Check if email already exists
    const existingLead = Array.from(leads.values()).find(lead => lead.email === email);
    if (existingLead) {
      return res.status(409).json({
        success: false,
        error: 'Lead with this email already exists'
      });
    }

    const leadId = uuidv4();
    const lead = {
      id: leadId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : null,
      experience: experience || 'beginner',
      goals: Array.isArray(goals) ? goals : [],
      interests: Array.isArray(interests) ? interests : [],
      source: source || 'chatbot',
      sessionId,
      status: 'new',
      stage: 'cold',
      leadScore: 0,
      createdAt: new Date().toISOString(),
      lastContact: new Date().toISOString(),
      nextFollowUp: moment().add(1, 'day').toISOString(),
      tags: [],
      notes: [],
      conversionProbability: 0.1,
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        referrer: req.get('Referrer')
      }
    };

    leads.set(leadId, lead);
    leadHistory.push({
      action: 'lead_created',
      leadId,
      timestamp: new Date().toISOString(),
      details: { source, experience, email: lead.email }
    });

    // Clean up old history entries
    cleanupOldHistory();

    res.status(201).json({
      success: true,
      lead: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        stage: lead.stage,
        leadScore: lead.leadScore,
        createdAt: lead.createdAt
      },
      message: "Lead created successfully"
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create lead',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all leads
router.get('/', (req, res) => {
  try {
    const { stage, status, source } = req.query;
    let filteredLeads = Array.from(leads.values());

    if (stage) {
      filteredLeads = filteredLeads.filter(lead => lead.stage === stage);
    }
    if (status) {
      filteredLeads = filteredLeads.filter(lead => lead.status === status);
    }
    if (source) {
      filteredLeads = filteredLeads.filter(lead => lead.source === source);
    }

    // Sort by lead score (highest first)
    filteredLeads.sort((a, b) => b.leadScore - a.leadScore);

    res.json({
      success: true,
      leads: filteredLeads,
      total: filteredLeads.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get lead by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const lead = leads.get(id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.json({
      success: true,
      lead
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update lead
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const lead = leads.get(id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const updateData = req.body;
    Object.assign(lead, updateData);
    lead.lastContact = new Date();

    // Update lead score and stage
    lead.leadScore = calculateLeadScore(lead);
    lead.stage = determineLeadStage(lead.leadScore);
    lead.conversionProbability = calculateConversionProbability(lead);

    leads.set(id, lead);
    leadHistory.push({
      action: 'lead_updated',
      leadId: id,
      timestamp: new Date(),
      details: updateData
    });

    res.json({
      success: true,
      lead,
      message: "Lead updated successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add note to lead
router.post('/:id/notes', (req, res) => {
  try {
    const { id } = req.params;
    const { note, type = 'general' } = req.body;
    const lead = leads.get(id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const noteObj = {
      id: uuidv4(),
      content: note,
      type,
      timestamp: new Date()
    };

    lead.notes.push(noteObj);
    leads.set(id, lead);

    res.json({
      success: true,
      note: noteObj,
      message: "Note added successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get lead analytics
router.get('/analytics/summary', (req, res) => {
  try {
    const allLeads = Array.from(leads.values());
    
    const analytics = {
      total: allLeads.length,
      byStage: {
        cold: allLeads.filter(l => l.stage === 'cold').length,
        warm: allLeads.filter(l => l.stage === 'warm').length,
        hot: allLeads.filter(l => l.stage === 'hot').length
      },
      bySource: {},
      averageScore: 0,
      conversionRate: 0
    };

    // Calculate source distribution
    allLeads.forEach(lead => {
      analytics.bySource[lead.source] = (analytics.bySource[lead.source] || 0) + 1;
    });

    // Calculate average lead score
    if (allLeads.length > 0) {
      analytics.averageScore = allLeads.reduce((sum, lead) => sum + lead.leadScore, 0) / allLeads.length;
    }

    // Calculate conversion rate (leads that moved to hot stage)
    const hotLeads = allLeads.filter(l => l.stage === 'hot').length;
    analytics.conversionRate = allLeads.length > 0 ? (hotLeads / allLeads.length) * 100 : 0;

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper functions
function calculateLeadScore(lead) {
  let score = 0;
  
  // Engagement score
  score += lead.notes.length * 3;
  
  // Experience level score
  if (lead.experience === 'beginner') score += 10;
  else if (lead.experience === 'intermediate') score += 20;
  else if (lead.experience === 'advanced') score += 15;
  
  // Goals score
  score += lead.goals.length * 5;
  
  // Interests score
  score += lead.interests.length * 3;
  
  // Source score
  if (lead.source === 'chatbot') score += 15;
  else if (lead.source === 'website') score += 10;
  else if (lead.source === 'social') score += 8;
  
  return Math.min(score, 100);
}

function determineLeadStage(score) {
  if (score >= 70) return 'hot';
  if (score >= 40) return 'warm';
  return 'cold';
}

function calculateConversionProbability(lead) {
  let probability = 0.1; // Base probability
  
  // Adjust based on stage
  if (lead.stage === 'hot') probability += 0.4;
  else if (lead.stage === 'warm') probability += 0.2;
  
  // Adjust based on engagement
  probability += Math.min(lead.notes.length * 0.05, 0.2);
  
  // Adjust based on experience
  if (lead.experience === 'intermediate') probability += 0.1;
  
  return Math.min(probability, 0.9);
}

// Cleanup old history entries to prevent memory leaks
function cleanupOldHistory() {
  const now = Date.now();
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  
  const filteredHistory = leadHistory.filter(entry => {
    const entryAge = now - new Date(entry.timestamp).getTime();
    return entryAge <= maxAge;
  });
  
  if (filteredHistory.length !== leadHistory.length) {
    leadHistory.length = 0;
    leadHistory.push(...filteredHistory);
  }
}

// Get leads with pagination
router.get('/paginated', (req, res) => {
  try {
    const { page = 1, limit = 10, stage, status, source, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    let filteredLeads = Array.from(leads.values());

    // Apply filters
    if (stage) {
      filteredLeads = filteredLeads.filter(lead => lead.stage === stage);
    }
    if (status) {
      filteredLeads = filteredLeads.filter(lead => lead.status === status);
    }
    if (source) {
      filteredLeads = filteredLeads.filter(lead => lead.source === source);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLeads = filteredLeads.filter(lead => 
        lead.name.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower)
      );
    }

    // Sort by lead score (highest first)
    filteredLeads.sort((a, b) => b.leadScore - a.leadScore);

    // Apply pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

    res.json({
      success: true,
      leads: paginatedLeads,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(filteredLeads.length / limitNum),
        totalLeads: filteredLeads.length,
        hasNextPage: endIndex < filteredLeads.length,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error getting paginated leads:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get leads' 
    });
  }
});

module.exports = router;
