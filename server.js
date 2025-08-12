const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// Import routes
const chatbotRoutes = require('./routes/chatbot');
const leadRoutes = require('./routes/leads');
const emailRoutes = require('./routes/email');
const analyticsRoutes = require('./routes/analytics');

// Routes
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_chat', (data) => {
    socket.join(data.sessionId);
    console.log(`User ${data.userId} joined chat session ${data.sessionId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      // Process message through AI chatbot
      const aiResponse = await processAIMessage(data.message, data.userContext);
      
      // Broadcast to all users in the session
      io.to(data.sessionId).emit('ai_response', {
        message: aiResponse,
        timestamp: new Date(),
        sessionId: data.sessionId
      });
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// AI Message Processing
async function processAIMessage(message, userContext) {
  // This would integrate with OpenAI GPT-4 in production
  // For now, using a rule-based system
  const responses = {
    greeting: [
      "Hello! I'm Scaler's AI assistant. I'm here to help you learn about our Data Engineering masterclass. What would you like to know?",
      "Hi there! Welcome to Scaler. I can help you understand our Data Engineering program and get you registered for our free masterclass."
    ],
    registration: [
      "Great! I'd love to help you register for our free Data Engineering masterclass. Can you tell me a bit about your background?",
      "Perfect! Let's get you signed up. What's your current experience level in tech?"
    ],
    pricing: [
      "The masterclass is completely FREE! It's our way of introducing you to the world of Data Engineering.",
      "No cost at all! This is a free session to help you understand if Data Engineering is the right path for you."
    ],
    schedule: [
      "Our next masterclass is scheduled for [DATE] at [TIME]. Would you like me to send you a calendar invite?",
      "We have sessions every week! Let me check the upcoming schedule and get you registered for the next available slot."
    ]
  };

  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
  } else if (lowerMessage.includes('register') || lowerMessage.includes('sign up')) {
    return responses.registration[Math.floor(Math.random() * responses.registration.length)];
  } else if (lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('free')) {
    return responses.pricing[Math.floor(Math.random() * responses.pricing.length)];
  } else if (lowerMessage.includes('when') || lowerMessage.includes('schedule') || lowerMessage.includes('time')) {
    return responses.schedule[Math.floor(Math.random() * responses.schedule.length)];
  } else {
    return "That's a great question! I'd be happy to help you learn more about our Data Engineering masterclass. What specific aspect would you like to know about?";
  }
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Scaler AI Funnel Server running on port ${PORT}`);
  console.log(`📱 Chatbot ready for lead qualification`);
  console.log(`📊 Analytics dashboard available at /api/analytics`);
});
