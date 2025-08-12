import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Lazy load components for better performance
const LandingPage = lazy(() => import('./components/LandingPage'));
const ChatbotInterface = lazy(() => import('./components/ChatbotInterface'));
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));
const LeadManagement = lazy(() => import('./components/LeadManagement'));
const EmailAutomation = lazy(() => import('./components/EmailAutomation'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="pt-16">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <Routes>
              <Route 
                path="/" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LandingPage />
                    </motion.div>
                  </Suspense>
                } 
              />
              
              <Route 
                path="/chatbot" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChatbotInterface />
                    </motion.div>
                  </Suspense>
                } 
              />
              
              <Route 
                path="/analytics" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AnalyticsDashboard />
                    </motion.div>
                  </Suspense>
                } 
              />
              
              <Route 
                path="/leads" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LeadManagement />
                    </motion.div>
                  </Suspense>
                } 
              />
              
              <Route 
                path="/email" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <EmailAutomation />
                    </motion.div>
                  </Suspense>
                } 
              />
            </Routes>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;
