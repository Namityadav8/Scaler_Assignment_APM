const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory storage for demo (use database in production)
let chatSessions = new Map();
let leadData = new Map();

// Start new chat session
router.post('/start', (req, res) => {
  try {
    const sessionId = uuidv4();
    const userId = req.body.userId || uuidv4();
    
    const session = {
      sessionId,
      userId,
      startTime: new Date(),
      messages: [],
      leadScore: 0,
      stage: 'cold', // cold, warm, hot
      interests: [],
      experience: null,
      goals: []
    };
    
    chatSessions.set(sessionId, session);
    leadData.set(userId, session);
    
    res.json({
      success: true,
      sessionId,
      userId,
      message: "Chat session started successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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

module.exports = router;
