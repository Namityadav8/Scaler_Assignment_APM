import React, { createContext, useContext, useReducer, useEffect } from 'react';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const ChatContext = createContext();

const initialState = {
  socket: null,
  isConnected: false,
  currentSession: null,
  messages: [],
  isTyping: false,
  leadInfo: null,
  recommendations: []
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SOCKET':
      return { ...state, socket: action.payload };
    
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };
    
    case 'SET_SESSION':
      return { ...state, currentSession: action.payload };
    
    case 'ADD_MESSAGE':
      return { 
        ...state, 
        messages: [...state.messages, action.payload],
        isTyping: false
      };
    
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    
    case 'SET_LEAD_INFO':
      return { ...state, leadInfo: action.payload };
    
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };
    
    case 'CLEAR_SESSION':
      return { 
        ...state, 
        currentSession: null, 
        messages: [], 
        leadInfo: null,
        recommendations: []
      };
    
    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  useEffect(() => {
    // Initialize Socket.IO connection
    const socket = io('http://localhost:5000');
    
    socket.on('connect', () => {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
      toast.success('Connected to chatbot server');
    });

    socket.on('disconnect', () => {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
      toast.error('Disconnected from chatbot server');
    });

    socket.on('ai_response', (data) => {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: Date.now(),
          text: data.message,
          sender: 'ai',
          timestamp: data.timestamp,
          sessionId: data.sessionId
        }
      });
    });

    socket.on('error', (error) => {
      toast.error(error.message || 'An error occurred');
    });

    dispatch({ type: 'SET_SOCKET', payload: socket });

    return () => {
      socket.disconnect();
    };
  }, []);

  const startChatSession = async () => {
    try {
      const response = await fetch('/api/chatbot/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: `user_${Date.now()}`
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'SET_SESSION', payload: data });
        
        // Join the chat room
        if (state.socket) {
          state.socket.emit('join_chat', {
            sessionId: data.sessionId,
            userId: data.userId
          });
        }

        // Add welcome message
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            id: Date.now(),
            text: "Hello! I'm Scaler's AI assistant. I'm here to help you learn about our Data Engineering masterclass. What would you like to know?",
            sender: 'ai',
            timestamp: new Date(),
            sessionId: data.sessionId
          }
        });

        return data;
      }
    } catch (error) {
      toast.error('Failed to start chat session');
      console.error('Error starting chat session:', error);
    }
  };

  const sendMessage = async (message) => {
    if (!state.currentSession || !state.socket) {
      toast.error('No active chat session');
      return;
    }

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
      sessionId: state.currentSession.sessionId
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_TYPING', payload: true });

    // Send message to server
    state.socket.emit('send_message', {
      message,
      sessionId: state.currentSession.sessionId,
      userId: state.currentSession.userId,
      userContext: state.leadInfo
    });
  };

  const updateLeadInfo = async (leadInfo) => {
    if (!state.currentSession) return;

    try {
      const response = await fetch('/api/chatbot/update-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: state.currentSession.sessionId,
          leadInfo
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'SET_LEAD_INFO', payload: data.session });
        
        // Get recommendations
        const recResponse = await fetch(`/api/chatbot/recommendations/${state.currentSession.sessionId}`);
        const recData = await recResponse.json();
        
        if (recData.success) {
          dispatch({ type: 'SET_RECOMMENDATIONS', payload: recData.recommendations });
        }
      }
    } catch (error) {
      toast.error('Failed to update lead information');
      console.error('Error updating lead info:', error);
    }
  };

  const clearSession = () => {
    dispatch({ type: 'CLEAR_SESSION' });
  };

  const value = {
    ...state,
    startChatSession,
    sendMessage,
    updateLeadInfo,
    clearSession
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
