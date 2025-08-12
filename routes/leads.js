const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// In-memory storage for demo (use database in production)
let leads = new Map();
let leadHistory = [];

// Create new lead
router.post('/', (req, res) => {
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

    const leadId = uuidv4();
    const lead = {
      id: leadId,
      name,
      email,
      phone,
      experience,
      goals: goals || [],
      interests: interests || [],
      source: source || 'chatbot',
      sessionId,
      status: 'new',
      stage: 'cold',
      leadScore: 0,
      createdAt: new Date(),
      lastContact: new Date(),
      nextFollowUp: moment().add(1, 'day').toDate(),
      tags: [],
      notes: [],
      conversionProbability: 0.1
    };

    leads.set(leadId, lead);
    leadHistory.push({
      action: 'lead_created',
      leadId,
      timestamp: new Date(),
      details: { source, experience }
    });

    res.json({
      success: true,
      lead,
      message: "Lead created successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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

module.exports = router;
