// Simple test script to verify chatbot functionality
const fetch = require('node-fetch');

async function testChatbot() {
  const baseUrl = process.env.TEST_URL || 'http://localhost:5000';
  
  console.log('🧪 Testing Chatbot API...');
  console.log(`📍 Testing against: ${baseUrl}`);
  console.log('');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log(`✅ Health: ${healthResponse.status} - ${healthData.status}`);
    console.log('');

    // Test 2: Start chat session
    console.log('2️⃣ Testing chat session start...');
    const startResponse = await fetch(`${baseUrl}/api/chatbot/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'test_user_123' })
    });
    const startData = await startResponse.json();
    
    if (startData.success) {
      console.log(`✅ Session started: ${startData.sessionId}`);
      const sessionId = startData.sessionId;
      console.log('');

      // Test 3: Send a message
      console.log('3️⃣ Testing message sending...');
      const messageResponse = await fetch(`${baseUrl}/api/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello, I want to learn about Data Engineering',
          sessionId: sessionId,
          userId: 'test_user_123'
        })
      });
      const messageData = await messageResponse.json();
      
      if (messageData.success) {
        console.log(`✅ Message sent successfully!`);
        console.log(`🤖 AI Response: ${messageData.message}`);
      } else {
        console.log(`❌ Message failed: ${messageData.error}`);
      }
    } else {
      console.log(`❌ Session start failed: ${startData.error}`);
    }

  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }

  console.log('');
  console.log('🎯 Test completed!');
  console.log('');
  console.log('📋 If all tests passed, your chatbot should work on Vercel!');
  console.log('📋 If tests failed, check the error messages above.');
}

// Run the test
testChatbot();
