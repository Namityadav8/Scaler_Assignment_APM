# Scaler AI Funnel

An AI-led self-serve funnel for Scaler Data Engineering masterclass with chatbot, lead management, and analytics dashboard.

## Features

- 🤖 AI-powered chatbot for lead qualification
- 📊 Real-time analytics dashboard
- 📧 Email automation system
- 👥 Lead management system
- 💬 Real-time chat interface
- 🎨 Modern, responsive UI with Tailwind CSS

## Tech Stack

- **Backend**: Node.js, Express.js, Socket.IO
- **Frontend**: React.js, Tailwind CSS, Framer Motion
- **Real-time**: Socket.IO for live chat
- **Styling**: Tailwind CSS with custom components

## Local Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Scaler-Assignment
```

2. Install dependencies:
```bash
npm run install:all
```

3. Create environment variables:
```bash
cp env.example .env
# Edit .env with your configuration
```

4. Start development servers:
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Deployment to Vercel

### 1. Prepare for Deployment

1. Build the project locally to ensure no errors:
```bash
npm run build
```

2. Make sure all environment variables are set in Vercel dashboard

### 2. Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts and set your environment variables

### 3. Environment Variables for Vercel

Set these in your Vercel dashboard:

```
NODE_ENV=production
ALLOWED_ORIGINS=https://your-domain.vercel.app
OPENAI_API_KEY=your_openai_api_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
JWT_SECRET=your_jwt_secret
```

### 4. Custom Domain (Optional)

1. Add your custom domain in Vercel dashboard
2. Update `ALLOWED_ORIGINS` to include your custom domain

## Project Structure

```
Scaler-Assignment/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── index.js       # Entry point
│   ├── public/            # Static files
│   └── package.json       # Frontend dependencies
├── routes/                 # API routes
├── server.js              # Main server file
├── package.json           # Backend dependencies
└── vercel.json            # Vercel configuration
```

## API Endpoints

- `POST /api/chatbot/message` - Send chat message
- `GET /api/leads` - Get all leads
- `POST /api/leads` - Create new lead
- `GET /api/analytics` - Get analytics data
- `POST /api/email/send` - Send email

## Socket.IO Events

- `join_chat` - Join chat session
- `send_message` - Send message to AI
- `ai_response` - Receive AI response

## Troubleshooting

### Build Errors
- Ensure all dependencies are installed: `npm run install:all`
- Check for syntax errors in components
- Verify Tailwind CSS configuration

### Deployment Issues
- Check environment variables in Vercel
- Ensure build completes successfully locally
- Check Vercel function timeout settings

### CORS Issues
- Verify `ALLOWED_ORIGINS` environment variable
- Check frontend proxy configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@scaler.com or create an issue in this repository.
