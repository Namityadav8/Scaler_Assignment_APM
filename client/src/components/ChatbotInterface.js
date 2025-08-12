import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../contexts/ChatContext';
import { useLeads } from '../contexts/LeadContext';
import { 
  Send, 
  User, 
  Bot, 
  AlertCircle,
  TrendingUp,
  Info,
  Target,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const ChatbotInterface = () => {
  const {
    currentSession,
    messages,
    isTyping,
    leadInfo,
    recommendations,
    startChatSession,
    sendMessage,
    updateLeadInfo,
    clearSession
  } = useChat();

  const { createLead } = useLeads();

  const [inputMessage, setInputMessage] = useState('');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    goals: [],
    interests: []
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!currentSession) {
      startChatSession();
    }
  }, [currentSession, startChatSession]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentSession) return;

    await sendMessage(inputMessage.trim());
    setInputMessage('');
    inputRef.current?.focus();
  };

  const handleLeadFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const lead = await createLead({
        ...leadFormData,
        source: 'chatbot',
        sessionId: currentSession?.sessionId
      });

      if (lead) {
        await updateLeadInfo({
          experience: leadFormData.experience,
          goals: leadFormData.goals,
          interests: leadFormData.interests
        });

        setShowLeadForm(false);
        toast.success('Lead information saved successfully!');
        
        // Send follow-up message
        setTimeout(() => {
          sendMessage("I've saved your information. What specific aspect of Data Engineering would you like to learn about?");
        }, 1000);
      }
    } catch (error) {
      toast.error('Failed to save lead information');
    }
  };

  const quickReplies = [
    "Tell me about the curriculum",
    "What are the job prospects?",
    "How much does it cost?",
    "When does the next batch start?",
    "I want to register"
  ];

  const experienceOptions = ['beginner', 'intermediate', 'advanced'];
  const goalOptions = ['Career Change', 'Skill Enhancement', 'Job Promotion', 'Personal Interest'];
  const interestOptions = ['Big Data', 'Data Pipelines', 'Machine Learning', 'Cloud Computing', 'Database Design'];

  const getStageColor = (stage) => {
    switch (stage) {
      case 'hot': return 'bg-red-100 text-red-800';
      case 'warm': return 'bg-yellow-100 text-yellow-800';
      case 'cold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageIcon = (stage) => {
    switch (stage) {
      case 'hot': return <AlertCircle size={16} />;
      case 'warm': return <TrendingUp size={16} />;
      case 'cold': return <Info size={16} />;
      default: return <Info size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI-Powered Data Engineering Assistant
          </h1>
          <p className="text-gray-600">
            Get personalized guidance for your Data Engineering journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <Bot size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">Scaler AI Assistant</h3>
                      <p className="text-blue-100 text-sm">
                        {currentSession ? 'Session Active' : 'Starting session...'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm">Online</span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.sender === 'user' ? (
                            <User size={16} className="mt-1 flex-shrink-0" />
                          ) : (
                            <Bot size={16} className="mt-1 flex-shrink-0" />
                          )}
                          <p className="text-sm">{message.text}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl">
                      <div className="flex items-center space-x-2">
                        <Bot size={16} />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {messages.length > 0 && (
                <div className="px-6 pb-4">
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(reply)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors duration-200"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200">
                <div className="flex space-x-4">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!currentSession}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || !currentSession}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Send size={16} />
                    <span>Send</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lead Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <User size={20} />
                <span>Lead Info</span>
              </h3>
              
              {leadInfo ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stage:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStageColor(leadInfo.stage)}`}>
                      {getStageIcon(leadInfo.stage)}
                      <span className="capitalize">{leadInfo.stage}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Score:</span>
                    <span className="text-sm font-medium text-gray-900">{leadInfo.leadScore}/100</span>
                  </div>

                  {leadInfo.experience && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Experience:</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">{leadInfo.experience}</span>
                    </div>
                  )}

                  {leadInfo.goals && leadInfo.goals.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Goals:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {leadInfo.goals.map((goal, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-3">No lead information yet</p>
                  <button
                    onClick={() => setShowLeadForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Add Lead Info
                  </button>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {recommendations && recommendations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Target size={20} />
                  <span>Recommendations</span>
                </h3>
                
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 text-sm mb-1">{rec.title}</h4>
                      <p className="text-blue-700 text-xs">{rec.description}</p>
                      <div className="mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {rec.priority} priority
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Session Controls */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Controls</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowLeadForm(true)}
                  className="w-full px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <User size={16} />
                  <span>Update Lead Info</span>
                </button>
                
                <button
                  onClick={clearSession}
                  className="w-full px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <CheckCircle size={16} />
                  <span>End Session</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Form Modal */}
      <AnimatePresence>
        {showLeadForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowLeadForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Lead Information</h3>
              
              <form onSubmit={handleLeadFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={leadFormData.name}
                    onChange={(e) => setLeadFormData({ ...leadFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={leadFormData.email}
                    onChange={(e) => setLeadFormData({ ...leadFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={leadFormData.phone}
                    onChange={(e) => setLeadFormData({ ...leadFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                  <select
                    value={leadFormData.experience}
                    onChange={(e) => setLeadFormData({ ...leadFormData, experience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select experience level</option>
                    {experienceOptions.map(option => (
                      <option key={option} value={option} className="capitalize">{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Career Goals</label>
                  <div className="space-y-2">
                    {goalOptions.map(goal => (
                      <label key={goal} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={leadFormData.goals.includes(goal)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLeadFormData({
                                ...leadFormData,
                                goals: [...leadFormData.goals, goal]
                              });
                            } else {
                              setLeadFormData({
                                ...leadFormData,
                                goals: leadFormData.goals.filter(g => g !== goal)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
                  <div className="space-y-2">
                    {interestOptions.map(interest => (
                      <label key={interest} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={leadFormData.interests.includes(interest)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLeadFormData({
                                ...leadFormData,
                                interests: [...leadFormData.interests, interest]
                              });
                            } else {
                              setLeadFormData({
                                ...leadFormData,
                                interests: leadFormData.interests.filter(i => i !== interest)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{interest}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowLeadForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatbotInterface;
