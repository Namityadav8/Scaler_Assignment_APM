import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, MessageCircle, BarChart3, Users, Mail, Home, Settings, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/chatbot', label: 'Chatbot', icon: MessageCircle },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/leads', label: 'Lead Management', icon: Users },
    { path: '/email', label: 'Email Automation', icon: Mail },
  ];

  const secondaryItems = [
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-lg font-bold text-gray-900">Scaler AI</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6">
              <div className="px-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Main Navigation
                </h3>
                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'text-blue-600 bg-blue-50 border border-blue-200'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="w-1 h-6 bg-blue-600 rounded-full ml-auto"
                          />
                        )}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-8">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Other
                  </h3>
                  <nav className="space-y-2">
                    {secondaryItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={onClose}
                          className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? 'text-blue-600 bg-blue-50 border border-blue-200'
                              : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          <Icon size={18} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">System Status</p>
                  <p className="text-xs text-gray-500">All systems operational</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
