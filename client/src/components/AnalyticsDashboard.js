import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Target, 
  BarChart3, 
  PieChart, 
  Activity,
  Eye,
  MousePointer,
  CreditCard,
  Calendar
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/funnel?startDate=${getStartDate()}&endDate=${getEndDate()}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const days = parseInt(dateRange);
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  };

  const getEndDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'hot': return 'bg-red-500';
      case 'warm': return 'bg-yellow-500';
      case 'cold': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor your funnel performance and conversion metrics</p>
        </div>

        {/* Date Range Selector */}
        <div className="mb-6">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.funnel?.visitors?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leads Generated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.funnel?.leads?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.funnel?.conversions?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.funnel?.overallConversionRate?.toFixed(1) || '0'}%
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Funnel Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Funnel Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
            
            <div className="space-y-4">
              {/* Visitors */}
              <div className="text-center">
                <div className="bg-blue-100 text-blue-800 px-4 py-3 rounded-lg">
                  <p className="text-sm font-medium">Visitors</p>
                  <p className="text-2xl font-bold">{analytics?.funnel?.visitors || 0}</p>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {analytics?.funnel?.visitorToLeadRate?.toFixed(1) || 0}% conversion
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="w-0.5 h-8 bg-gray-300"></div>
              </div>

              {/* Leads */}
              <div className="text-center">
                <div className="bg-green-100 text-green-800 px-4 py-3 rounded-lg">
                  <p className="text-sm font-medium">Leads</p>
                  <p className="text-2xl font-bold">{analytics?.funnel?.leads || 0}</p>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {analytics?.funnel?.leadToConversionRate?.toFixed(1) || 0}% conversion
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="w-0.5 h-8 bg-gray-300"></div>
              </div>

              {/* Conversions */}
              <div className="text-center">
                <div className="bg-purple-100 text-purple-800 px-4 py-3 rounded-lg">
                  <p className="text-sm font-medium">Conversions</p>
                  <p className="text-2xl font-bold">{analytics?.funnel?.conversions || 0}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Source Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
            
            <div className="space-y-3">
              {analytics?.sourceBreakdown && Object.entries(analytics.sourceBreakdown).map(([source, count]) => (
                <div key={source} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">{source}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / analytics.funnel.visitors) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Daily Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Trends</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {analytics?.dailyTrends && Object.entries(analytics.dailyTrends).slice(-7).map(([date, data]) => (
              <div key={date} className="text-center">
                <div className="text-xs text-gray-500 mb-2">
                  {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-blue-600">{data.visitors}</div>
                  <div className="text-xs text-green-600">{data.leads}</div>
                  <div className="text-xs text-purple-600">{data.conversions}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Performance Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Top Performing Sources</h4>
              <div className="space-y-2">
                {analytics?.sourceBreakdown && Object.entries(analytics.sourceBreakdown)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([source, count], index) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 capitalize">{source}</span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Conversion Insights</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Visitor to Lead</span>
                  <span className="text-sm font-medium text-green-600">
                    {analytics?.funnel?.visitorToLeadRate?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Lead to Conversion</span>
                  <span className="text-sm font-medium text-blue-600">
                    {analytics?.funnel?.leadToConversionRate?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Overall Rate</span>
                  <span className="text-sm font-medium text-purple-600">
                    {analytics?.funnel?.overallConversionRate?.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
