const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory storage for demo (use database in production)
// In production, this should be replaced with Redis or a database
const chatSessions = new Map();
const leadData = new Map();

// Rate limiting for production
const rateLimit = require('express-rate-limit');

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many chat requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to chat endpoints
router.use(chatLimiter);

// Start new chat session
router.post('/start', (req, res) => {
  try {
    // Input validation
    const { userId, userInfo } = req.body;
    
    if (!userId && !userInfo) {
      return res.status(400).json({ 
        success: false, 
        error: 'User information is required' 
      });
    }
    
    const sessionId = uuidv4();
    const finalUserId = userId || uuidv4();
    
    const session = {
      sessionId,
      userId: finalUserId,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      messages: [],
      leadScore: 0,
      stage: 'cold', // cold, warm, hot
      interests: [],
      experience: null,
      goals: [],
      userInfo: userInfo || {},
      status: 'active'
    };
    
    chatSessions.set(sessionId, session);
    leadData.set(finalUserId, session);
    
    // Clean up old sessions (memory management)
    cleanupOldSessions();
    
    res.status(201).json({
      success: true,
      sessionId,
      userId: finalUserId,
      message: "Chat session started successfully",
      session: {
        sessionId,
        userId: finalUserId,
        startTime: session.startTime,
        stage: session.stage
      }
    });
  } catch (error) {
    console.error('Error starting chat session:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to start chat session',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get chat session
router.get('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = chatSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update lead information
router.post('/update-lead', (req, res) => {
  try {
    const { sessionId, leadInfo } = req.body;
    const session = chatSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    // Update lead data
    Object.assign(session, leadInfo);
    
    // Calculate lead score based on engagement
    session.leadScore = calculateLeadScore(session);
    
    // Determine stage
    session.stage = determineLeadStage(session.leadScore);
    
    chatSessions.set(sessionId, session);
    
    res.json({
      success: true,
      session,
      message: "Lead information updated successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get lead recommendations
router.get('/recommendations/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = chatSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    const recommendations = generateRecommendations(session);
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper functions
function calculateLeadScore(session) {
  let score = 0;
  
  // Engagement score
  score += session.messages.length * 2;
  
  // Experience level score
  if (session.experience === 'beginner') score += 10;
  else if (session.experience === 'intermediate') score += 20;
  else if (session.experience === 'advanced') score += 15;
  
  // Goals score
  score += session.goals.length * 5;
  
  // Interests score
  score += session.interests.length * 3;
  
  // Time-based engagement (recent activity gets higher score)
  if (session.lastActivity) {
    const hoursSinceLastActivity = (Date.now() - new Date(session.lastActivity).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastActivity < 1) score += 10;
    else if (hoursSinceLastActivity < 24) score += 5;
  }
  
  return Math.min(score, 100);
}

function determineLeadStage(score) {
  if (score >= 70) return 'hot';
  if (score >= 40) return 'warm';
  return 'cold';
}

function generateRecommendations(session) {
  const recommendations = [];
  
  if (session.stage === 'cold') {
    recommendations.push({
      type: 'content',
      title: 'Data Engineering Fundamentals',
      description: 'Start with our beginner-friendly introduction',
      priority: 'high'
    });
  } else if (session.stage === 'warm') {
    recommendations.push({
      type: 'registration',
      title: 'Free Masterclass Registration',
      description: 'Join our upcoming live session',
      priority: 'high'
    });
  } else if (session.stage === 'hot') {
    recommendations.push({
      type: 'upsell',
      title: 'Premium Data Engineering Course',
      description: 'Take your skills to the next level',
      priority: 'high'
    });
  }
  
  return recommendations;
}

// Cleanup old sessions to prevent memory leaks
function cleanupOldSessions() {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [sessionId, session] of chatSessions.entries()) {
    const sessionAge = now - new Date(session.startTime).getTime();
    if (sessionAge > maxAge) {
      chatSessions.delete(sessionId);
      if (session.userId) {
        leadData.delete(session.userId);
      }
    }
  }
}

// Get session statistics
router.get('/stats', (req, res) => {
  try {
    const stats = {
      totalSessions: chatSessions.size,
      activeSessions: Array.from(chatSessions.values()).filter(s => s.status === 'active').length,
      totalLeads: leadData.size,
      stageDistribution: {
        cold: 0,
        warm: 0,
        hot: 0
      }
    };
    
    // Calculate stage distribution
    for (const session of chatSessions.values()) {
      if (stats.stageDistribution[session.stage] !== undefined) {
        stats.stageDistribution[session.stage]++;
      }
    }
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get statistics' 
    });
  }
});

module.exports = router;
