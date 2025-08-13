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

// HTTP API endpoint for sending messages (fallback for Vercel)
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId, userId, userContext } = req.body;
    
    if (!message || !sessionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message and session ID are required' 
      });
    }
    
    const session = chatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        error: 'Session not found' 
      });
    }
    
    // Update session activity
    session.lastActivity = new Date().toISOString();
    session.messages.push({
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    });
    
    // Process the message and generate AI response
    const aiResponse = await processMessage(message, session, userContext);
    
    // Add AI response to session
    session.messages.push({
      id: Date.now() + 1,
      text: aiResponse,
      sender: 'ai',
      timestamp: new Date().toISOString()
    });
    
    // Update lead scoring
    updateLeadScore(session, message);
    
    res.json({
      success: true,
      message: aiResponse,
      timestamp: new Date().toISOString(),
      sessionId: sessionId
    });
    
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
async function processMessage(message, session, userContext) {
  try {
    // Simple AI response logic for demo
    // In production, this would call OpenAI API
    const responses = [
      "That's a great question! Our Data Engineering masterclass covers exactly that. Would you like to learn more about the curriculum?",
      "I'm glad you're interested! We have both beginner and advanced modules. What's your current experience level?",
      "Excellent! Our course includes hands-on projects with real-world datasets. Are you looking to switch careers or upskill?",
      "Perfect! We offer flexible learning schedules. When would you like to start your Data Engineering journey?",
      "That's exactly what we focus on! Our instructors are industry experts. Would you like to see a sample lesson?",
      "Great question! We provide job placement assistance and career guidance. What are your career goals?",
      "Absolutely! Our course is designed for working professionals. How much time can you dedicate weekly?",
      "That's a common concern! We offer a money-back guarantee. What specific skills are you looking to develop?",
      "Excellent! We have both online and hybrid options. Which format works better for you?",
      "Perfect! Our next batch starts soon. Would you like to schedule a free consultation call?"
    ];
    
    // Simple keyword-based responses
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fee')) {
      return "Our Data Engineering masterclass is priced competitively at $999. We also offer flexible payment plans and early bird discounts. Would you like to know more about our pricing options?";
    }
    
    if (lowerMessage.includes('duration') || lowerMessage.includes('time') || lowerMessage.includes('length')) {
      return "The complete Data Engineering masterclass runs for 6 months with flexible learning schedules. You can complete it at your own pace. What's your preferred timeline?";
    }
    
    if (lowerMessage.includes('job') || lowerMessage.includes('career') || lowerMessage.includes('placement')) {
      return "We have a 95% job placement rate! Our career services include resume building, interview preparation, and direct connections with hiring partners. What's your target role?";
    }
    
    if (lowerMessage.includes('curriculum') || lowerMessage.includes('syllabus') || lowerMessage.includes('topics')) {
      return "Our curriculum covers: Big Data Processing, ETL Pipeline Design, Data Warehousing, Cloud Platforms (AWS/Azure), and Real-time Analytics. Which area interests you most?";
    }
    
    if (lowerMessage.includes('experience') || lowerMessage.includes('level') || lowerMessage.includes('beginner')) {
      return "We welcome all experience levels! Our course starts with fundamentals and progresses to advanced concepts. What's your current background in technology?";
    }
    
    // Return a random response if no keywords match
    return responses[Math.floor(Math.random() * responses.length)];
    
  } catch (error) {
    console.error('Error processing message:', error);
    return "I apologize, but I'm having trouble processing your message right now. Please try again or contact our support team.";
  }
}

function updateLeadScore(session, message) {
  // Update lead score based on message content and engagement
  let scoreIncrease = 2; // Base score for each message
  
  const lowerMessage = message.toLowerCase();
  
  // Increase score for specific keywords indicating interest
  if (lowerMessage.includes('price') || lowerMessage.includes('cost')) scoreIncrease += 5;
  if (lowerMessage.includes('enroll') || lowerMessage.includes('register')) scoreIncrease += 10;
  if (lowerMessage.includes('curriculum') || lowerMessage.includes('syllabus')) scoreIncrease += 3;
  if (lowerMessage.includes('job') || lowerMessage.includes('career')) scoreIncrease += 5;
  if (lowerMessage.includes('when') || lowerMessage.includes('start')) scoreIncrease += 4;
  
  session.leadScore = Math.min(100, session.leadScore + scoreIncrease);
  session.stage = determineLeadStage(session.leadScore);
}

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
