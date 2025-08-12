import React from 'react';
import { 
  Mail, 
  Plus
} from 'lucide-react';

const EmailAutomation = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Automation</h1>
          <p className="text-gray-600">Create and manage personalized email campaigns for lead conversion</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Email Campaigns</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
              <Plus size={16} />
              <span>Create Campaign</span>
            </button>
          </div>

          <div className="text-center py-12">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-500 mb-4">Start building your email automation funnel to nurture leads and drive conversions.</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Create First Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailAutomation;
