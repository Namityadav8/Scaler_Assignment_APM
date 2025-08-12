const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// In-memory storage for demo (use database in production)
let emailCampaigns = new Map();
let emailTemplates = new Map();
let emailQueue = [];

// Initialize default email templates
const defaultTemplates = {
  welcome: {
    id: 'welcome',
    name: 'Welcome to Scaler',
    subject: 'Welcome to Scaler - Your Data Engineering Journey Starts Here!',
    body: `
      <h2>Hi {{name}},</h2>
      <p>Welcome to Scaler! We're excited to have you join our community of aspiring Data Engineers.</p>
      <p>Here's what you can expect from our free masterclass:</p>
      <ul>
        <li>🎯 Clear roadmap to Data Engineering</li>
        <li>💡 Industry insights from experts</li>
        <li>🚀 Hands-on learning opportunities</li>
        <li>📚 Free resources to get started</li>
      </ul>
      <p><strong>Your masterclass is scheduled for: {{sessionDate}} at {{sessionTime}}</strong></p>
      <p>We'll send you a calendar invite shortly. In the meantime, check out our <a href="{{resourceLink}}">pre-session materials</a>.</p>
      <p>Best regards,<br>The Scaler Team</p>
    `,
    variables: ['name', 'sessionDate', 'sessionTime', 'resourceLink']
  },
  reminder: {
    id: 'reminder',
    name: 'Session Reminder',
    subject: '🚀 Your Data Engineering Masterclass Starts in {{hoursLeft}} Hours!',
    body: `
      <h2>Hi {{name}},</h2>
      <p>Just a friendly reminder that your Data Engineering masterclass starts in <strong>{{hoursLeft}} hours</strong>!</p>
      <p>📅 <strong>Date:</strong> {{sessionDate}}<br>
      🕐 <strong>Time:</strong> {{sessionTime}}<br>
      🔗 <strong>Link:</strong> <a href="{{sessionLink}}">Join Session</a></p>
      <p>Don't forget to:</p>
      <ul>
        <li>✅ Test your internet connection</li>
        <li>📝 Have questions ready</li>
        <li>💻 Join 10 minutes early</li>
      </ul>
      <p>Can't make it? <a href="{{rescheduleLink}}">Reschedule here</a></p>
      <p>See you soon!<br>The Scaler Team</p>
    `,
    variables: ['name', 'hoursLeft', 'sessionDate', 'sessionTime', 'sessionLink', 'rescheduleLink']
  },
  followUp: {
    id: 'followUp',
    name: 'Post-Session Follow-up',
    subject: 'How was your Data Engineering Masterclass?',
    body: `
      <h2>Hi {{name}},</h2>
      <p>We hope you enjoyed your Data Engineering masterclass yesterday!</p>
      <p>🎯 <strong>Next Steps:</strong></p>
      <ul>
        <li>📚 Review the session recording</li>
        <li>💡 Complete the practice exercises</li>
        <li>🚀 Join our community forum</li>
        <li>📖 Explore our premium courses</li>
      </ul>
      <p>We'd love to hear your feedback! <a href="{{feedbackLink}}">Share your thoughts here</a>.</p>
      <p>Ready to take the next step? Check out our <a href="{{courseLink}}">premium Data Engineering program</a>.</p>
      <p>Best regards,<br>The Scaler Team</p>
    `,
    variables: ['name', 'feedbackLink', 'courseLink']
  }
};

// Initialize templates
Object.values(defaultTemplates).forEach(template => {
  emailTemplates.set(template.id, template);
});

// Create email campaign
router.post('/campaigns', (req, res) => {
  try {
    const {
      name,
      templateId,
      targetAudience,
      schedule,
      subject,
      body
    } = req.body;

    const campaignId = uuidv4();
    const campaign = {
      id: campaignId,
      name,
      templateId,
      targetAudience,
      schedule,
      subject,
      body,
      status: 'draft',
      createdAt: new Date(),
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
      conversionCount: 0
    };

    emailCampaigns.set(campaignId, campaign);

    res.json({
      success: true,
      campaign,
      message: "Email campaign created successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all campaigns
router.get('/campaigns', (req, res) => {
  try {
    const campaigns = Array.from(emailCampaigns.values());
    res.json({
      success: true,
      campaigns
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send personalized email
router.post('/send', (req, res) => {
  try {
    const {
      leadId,
      templateId,
      customData,
      priority = 'normal'
    } = req.body;

    const template = emailTemplates.get(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const emailId = uuidv4();
    const email = {
      id: emailId,
      leadId,
      templateId,
      customData,
      priority,
      status: 'queued',
      createdAt: new Date(),
      scheduledFor: new Date(),
      sentAt: null,
      openedAt: null,
      clickedAt: null
    };

    emailQueue.push(email);

    // Process email queue (in production, this would use a job queue)
    processEmailQueue();

    res.json({
      success: true,
      email,
      message: "Email queued for sending"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get email templates
router.get('/templates', (req, res) => {
  try {
    const templates = Array.from(emailTemplates.values());
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create custom email template
router.post('/templates', (req, res) => {
  try {
    const {
      name,
      subject,
      body,
      variables = []
    } = req.body;

    const templateId = uuidv4();
    const template = {
      id: templateId,
      name,
      subject,
      body,
      variables,
      createdAt: new Date(),
      isCustom: true
    };

    emailTemplates.set(templateId, template);

    res.json({
      success: true,
      template,
      message: "Email template created successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get email analytics
router.get('/analytics', (req, res) => {
  try {
    const campaigns = Array.from(emailCampaigns.values());
    const emails = Array.from(emailQueue);
    
    const analytics = {
      totalCampaigns: campaigns.length,
      totalEmails: emails.length,
      sentEmails: emails.filter(e => e.status === 'sent').length,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      byStatus: {
        queued: emails.filter(e => e.status === 'queued').length,
        sent: emails.filter(e => e.status === 'sent').length,
        opened: emails.filter(e => e.status === 'opened').length,
        clicked: emails.filter(e => e.status === 'clicked').length
      }
    };

    // Calculate rates
    if (analytics.sentEmails > 0) {
      analytics.openRate = (analytics.byStatus.opened / analytics.sentEmails) * 100;
      analytics.clickRate = (analytics.byStatus.clicked / analytics.sentEmails) * 100;
    }

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Process email queue (simplified for demo)
function processEmailQueue() {
  // In production, this would use a proper job queue system
  // For demo purposes, we'll just mark emails as sent
  emailQueue.forEach(email => {
    if (email.status === 'queued') {
      email.status = 'sent';
      email.sentAt = new Date();
      
      // Simulate email opening and clicking
      setTimeout(() => {
        if (Math.random() > 0.3) { // 70% open rate
          email.status = 'opened';
          email.openedAt = new Date();
        }
      }, Math.random() * 60000); // Random time within 1 minute
      
      setTimeout(() => {
        if (email.status === 'opened' && Math.random() > 0.5) { // 50% click rate
          email.status = 'clicked';
          email.clickedAt = new Date();
        }
      }, Math.random() * 120000); // Random time within 2 minutes
    }
  });
}

module.exports = router;
