const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Trust proxy for rate limiting (important for Vercel deployment)
app.set('trust proxy', 1);

// Security and performance middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for Socket.IO compatibility
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Configure CORS for production
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import routes
const chatbotRoutes = require('./routes/chatbot');
const leadRoutes = require('./routes/leads');
const emailRoutes = require('./routes/email');
const analyticsRoutes = require('./routes/analytics');

// API Routes
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the build directory
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle chat session joining
  socket.on('join_chat', (data) => {
    try {
      if (!data.sessionId) {
        socket.emit('error', { message: 'Session ID is required' });
        return;
      }
      
      socket.join(data.sessionId);
      console.log(`User ${data.userId || 'anonymous'} joined chat session ${data.sessionId}`);
      
      // Send confirmation
      socket.emit('joined_session', { 
        sessionId: data.sessionId, 
        message: 'Successfully joined chat session' 
      });
    } catch (error) {
      console.error('Error joining chat session:', error);
      socket.emit('error', { message: 'Failed to join chat session' });
    }
  });

  // Handle message sending
  socket.on('send_message', async (data) => {
    try {
      if (!data.message || !data.sessionId) {
        socket.emit('error', { message: 'Message and session ID are required' });
        return;
      }

      // Process message through AI chatbot
      const aiResponse = await processAIMessage(data.message, data.userContext);
      
      // Broadcast to all users in the session
      io.to(data.sessionId).emit('ai_response', {
        message: aiResponse,
        timestamp: new Date().toISOString(),
        sessionId: data.sessionId,
        originalMessage: data.message
      });
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('error', { 
        message: 'Failed to process message',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(data.sessionId).emit('user_typing', {
      userId: data.userId,
      sessionId: data.sessionId
    });
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// AI Message Processing
async function processAIMessage(message, userContext = {}) {
  try {
    // This would integrate with OpenAI GPT-4 in production
    // For now, using an enhanced rule-based system
    const responses = {
      greeting: [
        "Hello! I'm Scaler's AI assistant. I'm here to help you learn about our Data Engineering masterclass. What would you like to know?",
        "Hi there! Welcome to Scaler. I can help you understand our Data Engineering program and get you registered for our free masterclass.",
        "Greetings! I'm here to guide you through our Data Engineering masterclass. How can I assist you today?"
      ],
      registration: [
        "Great! I'd love to help you register for our free Data Engineering masterclass. Can you tell me a bit about your background?",
        "Perfect! Let's get you signed up. What's your current experience level in tech?",
        "Excellent choice! To better assist you, could you share your current technical background and learning goals?"
      ],
      pricing: [
        "The masterclass is completely FREE! It's our way of introducing you to the world of Data Engineering.",
        "No cost at all! This is a free session to help you understand if Data Engineering is the right path for you.",
        "The best part? It's absolutely free! We believe in making quality education accessible to everyone."
      ],
      schedule: [
        "Our next masterclass is scheduled for this Saturday at 2 PM IST. Would you like me to send you a calendar invite?",
        "We have sessions every week! Let me check the upcoming schedule and get you registered for the next available slot.",
        "We offer multiple sessions throughout the week. What time works best for you?"
      ],
      curriculum: [
        "Our Data Engineering masterclass covers: Data Modeling, ETL Processes, Big Data Technologies, and Real-world Projects. What interests you most?",
        "The curriculum includes hands-on projects with tools like Apache Spark, Kafka, and modern data warehouses. Sound exciting?",
        "We focus on practical skills: SQL, Python, Data Pipeline Design, and Cloud Platforms. Which area would you like to explore?"
      ],
      career: [
        "Data Engineering is one of the fastest-growing tech careers with excellent salary prospects. Would you like to learn more about career opportunities?",
        "Our graduates have landed roles at top companies like Google, Amazon, and Microsoft. Ready to start your journey?",
        "Data Engineers are in high demand! Average salaries range from $80K to $150K+. Shall we discuss your career path?"
      ]
    };

    const lowerMessage = message.toLowerCase().trim();
    
    // Enhanced keyword matching with context awareness
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return getRandomResponse(responses.greeting);
    } else if (lowerMessage.includes('register') || lowerMessage.includes('sign up') || lowerMessage.includes('join')) {
      return getRandomResponse(responses.registration);
    } else if (lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('free') || lowerMessage.includes('money')) {
      return getRandomResponse(responses.pricing);
    } else if (lowerMessage.includes('when') || lowerMessage.includes('schedule') || lowerMessage.includes('time') || lowerMessage.includes('date')) {
      return getRandomResponse(responses.schedule);
    } else if (lowerMessage.includes('learn') || lowerMessage.includes('teach') || lowerMessage.includes('curriculum') || lowerMessage.includes('course')) {
      return getRandomResponse(responses.curriculum);
    } else if (lowerMessage.includes('job') || lowerMessage.includes('career') || lowerMessage.includes('salary') || lowerMessage.includes('work')) {
      return getRandomResponse(responses.career);
    } else {
      // Fallback with context-aware response
      const fallbackResponses = [
        "That's a great question! I'd be happy to help you learn more about our Data Engineering masterclass. What specific aspect would you like to know about?",
        "Interesting! Let me help you understand how our Data Engineering program can benefit you. Could you tell me more about what you're looking for?",
        "I'd love to help you with that! Our masterclass covers various aspects of Data Engineering. What would you like to explore first?"
      ];
      return getRandomResponse(fallbackResponses);
    }
  } catch (error) {
    console.error('Error in AI message processing:', error);
    return "I apologize, but I'm having trouble processing your message right now. Please try again in a moment.";
  }
}

// Helper function to get random response
function getRandomResponse(responseArray) {
  return responseArray[Math.floor(Math.random() * responseArray.length)];
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Scaler AI Funnel Server running on port ${PORT}`);
  console.log(`📱 Chatbot ready for lead qualification`);
  console.log(`📊 Analytics dashboard available at /api/analytics`);
});
