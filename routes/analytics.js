const express = require('express');
const router = express.Router();
const moment = require('moment');

// In-memory storage for demo (use database in production)
let funnelData = {
  visitors: [],
  leads: [],
  conversions: [],
  sessions: []
};

// Track visitor
router.post('/track-visitor', (req, res) => {
  try {
    const {
      source,
      page,
      userAgent,
      timestamp = new Date()
    } = req.body;

    const visitor = {
      id: `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source,
      page,
      userAgent,
      timestamp,
      sessionId: null
    };

    funnelData.visitors.push(visitor);

    res.json({
      success: true,
      visitorId: visitor.id,
      message: "Visitor tracked successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Track lead conversion
router.post('/track-lead', (req, res) => {
  try {
    const {
      visitorId,
      leadId,
      stage,
      source,
      timestamp = new Date()
    } = req.body;

    const lead = {
      id: leadId,
      visitorId,
      stage,
      source,
      timestamp,
      conversionPath: []
    };

    funnelData.leads.push(lead);

    // Update visitor with lead info
    const visitor = funnelData.visitors.find(v => v.id === visitorId);
    if (visitor) {
      visitor.sessionId = leadId;
    }

    res.json({
      success: true,
      message: "Lead conversion tracked successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Track conversion event
router.post('/track-conversion', (req, res) => {
  try {
    const {
      leadId,
      eventType,
      value,
      timestamp = new Date()
    } = req.body;

    const conversion = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      leadId,
      eventType,
      value,
      timestamp
    };

    funnelData.conversions.push(conversion);

    res.json({
      success: true,
      message: "Conversion tracked successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get funnel analytics
router.get('/funnel', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let start = startDate ? moment(startDate) : moment().subtract(30, 'days');
    let end = endDate ? moment(endDate) : moment();

    // Filter data by date range
    const visitors = funnelData.visitors.filter(v => 
      moment(v.timestamp).isBetween(start, end, 'day', '[]')
    );
    
    const leads = funnelData.leads.filter(l => 
      moment(l.timestamp).isBetween(start, end, 'day', '[]')
    );
    
    const conversions = funnelData.conversions.filter(c => 
      moment(c.timestamp).isBetween(start, end, 'day', '[]')
    );

    // Calculate funnel metrics
    const totalVisitors = visitors.length;
    const totalLeads = leads.length;
    const totalConversions = conversions.length;

    const funnelMetrics = {
      visitors: totalVisitors,
      leads: totalLeads,
      conversions: totalConversions,
      visitorToLeadRate: totalVisitors > 0 ? (totalLeads / totalVisitors) * 100 : 0,
      leadToConversionRate: totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0,
      overallConversionRate: totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0
    };

    // Source breakdown
    const sourceBreakdown = {};
    visitors.forEach(visitor => {
      sourceBreakdown[visitor.source] = (sourceBreakdown[visitor.source] || 0) + 1;
    });

    // Daily trends
    const dailyTrends = {};
    for (let day = start.clone(); day.isSameOrBefore(end); day.add(1, 'day')) {
      const dayStr = day.format('YYYY-MM-DD');
      dailyTrends[dayStr] = {
        visitors: visitors.filter(v => moment(v.timestamp).format('YYYY-MM-DD') === dayStr).length,
        leads: leads.filter(l => moment(l.timestamp).format('YYYY-MM-DD') === dayStr).length,
        conversions: conversions.filter(c => moment(c.timestamp).format('YYYY-MM-DD') === dayStr).length
      };
    }

    res.json({
      success: true,
      funnel: funnelMetrics,
      sourceBreakdown,
      dailyTrends,
      dateRange: {
        start: start.format('YYYY-MM-DD'),
        end: end.format('YYYY-MM-DD')
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get real-time metrics
router.get('/realtime', (req, res) => {
  try {
    const now = moment();
    const lastHour = now.clone().subtract(1, 'hour');
    const last24Hours = now.clone().subtract(24, 'hours');

    // Real-time metrics
    const realtimeMetrics = {
      currentHour: {
        visitors: funnelData.visitors.filter(v => 
          moment(v.timestamp).isAfter(lastHour)
        ).length,
        leads: funnelData.leads.filter(l => 
          moment(l.timestamp).isAfter(lastHour)
        ).length,
        conversions: funnelData.conversions.filter(c => 
          moment(c.timestamp).isAfter(lastHour)
        ).length
      },
      last24Hours: {
        visitors: funnelData.visitors.filter(v => 
          moment(v.timestamp).isAfter(last24Hours)
        ).length,
        leads: funnelData.leads.filter(l => 
          moment(l.timestamp).isAfter(last24Hours)
        ).length,
        conversions: funnelData.conversions.filter(c => 
          moment(c.timestamp).isAfter(last24Hours)
        ).length
      },
      activeSessions: funnelData.visitors.filter(v => 
        moment(v.timestamp).isAfter(now.clone().subtract(30, 'minutes'))
      ).length
    };

    res.json({
      success: true,
      realtime: realtimeMetrics,
      timestamp: now.toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get performance insights
router.get('/insights', (req, res) => {
  try {
    const insights = [];

    // Calculate conversion rates by source
    const sourcePerformance = {};
    const sources = [...new Set(funnelData.visitors.map(v => v.source))];
    
    sources.forEach(source => {
      const sourceVisitors = funnelData.visitors.filter(v => v.source === source).length;
      const sourceLeads = funnelData.leads.filter(l => 
        funnelData.visitors.find(v => v.id === l.visitorId)?.source === source
      ).length;
      
      sourcePerformance[source] = {
        visitors: sourceVisitors,
        leads: sourceLeads,
        conversionRate: sourceVisitors > 0 ? (sourceLeads / sourceVisitors) * 100 : 0
      };
    });

    // Find best performing source
    const bestSource = Object.entries(sourcePerformance)
      .sort(([,a], [,b]) => b.conversionRate - a.conversionRate)[0];

    if (bestSource) {
      insights.push({
        type: 'performance',
        title: 'Best Performing Source',
        description: `${bestSource[0]} has the highest conversion rate at ${bestSource[1].conversionRate.toFixed(1)}%`,
        priority: 'high'
      });
    }

    // Time-based insights
    const hourlyPerformance = {};
    for (let hour = 0; hour < 24; hour++) {
      const hourVisitors = funnelData.visitors.filter(v => 
        moment(v.timestamp).hour() === hour
      ).length;
      
      if (hourVisitors > 0) {
        hourlyPerformance[hour] = hourVisitors;
      }
    }

    const peakHour = Object.entries(hourlyPerformance)
      .sort(([,a], [,b]) => b - a)[0];

    if (peakHour) {
      insights.push({
        type: 'timing',
        title: 'Peak Traffic Hour',
        description: `Hour ${peakHour[0]}:00 sees the most visitors (${peakHour[1]} visitors)`,
        priority: 'medium'
      });
    }

    // Conversion funnel insights
    const visitorToLeadRate = funnelData.visitors.length > 0 ? 
      (funnelData.leads.length / funnelData.visitors.length) * 100 : 0;
    
    if (visitorToLeadRate < 5) {
      insights.push({
        type: 'optimization',
        title: 'Low Lead Conversion',
        description: `Only ${visitorToLeadRate.toFixed(1)}% of visitors become leads. Consider improving your landing page or chatbot engagement.`,
        priority: 'high'
      });
    }

    res.json({
      success: true,
      insights,
      sourcePerformance,
      hourlyPerformance
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get A/B test results (mock data for demo)
router.get('/ab-testing', (req, res) => {
  try {
    const abTestResults = {
      landingPage: {
        variantA: {
          visitors: 150,
          leads: 12,
          conversionRate: 8.0
        },
        variantB: {
          visitors: 145,
          leads: 18,
          conversionRate: 12.4
        },
        winner: 'B',
        confidence: 95.2
      },
      chatbot: {
        variantA: {
          visitors: 200,
          leads: 25,
          conversionRate: 12.5
        },
        variantB: {
          visitors: 195,
          leads: 32,
          conversionRate: 16.4
        },
        winner: 'B',
        confidence: 98.7
      }
    };

    res.json({
      success: true,
      abTests: abTestResults
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
