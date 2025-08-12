# 🚀 Vercel Deployment Checklist

## Pre-Deployment Checklist

- [ ] ✅ Project builds successfully locally (`npm run build`)
- [ ] ✅ All dependencies are installed (`npm run install:all`)
- [ ] ✅ Environment variables are configured
- [ ] ✅ Vercel CLI is installed (`npm i -g vercel`)

## Environment Variables to Set in Vercel

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

## Quick Deployment Commands

### Option 1: Use Deployment Scripts
```bash
# Windows (Command Prompt)
deploy.bat

# Windows (PowerShell)
.\deploy.ps1
```

### Option 2: Manual Deployment
```bash
# 1. Build the project
npm run build

# 2. Deploy to Vercel
vercel --prod

# 3. Follow the prompts
```

## Post-Deployment Checklist

- [ ] ✅ Application is accessible at the deployed URL
- [ ] ✅ API endpoints are working (`/api/chatbot`, `/api/leads`, etc.)
- [ ] ✅ Frontend routes are working
- [ ] ✅ Socket.IO connections are established
- [ ] ✅ Environment variables are properly set
- [ ] ✅ Custom domain is configured (if applicable)

## Troubleshooting Common Issues

### Build Errors
- Check for syntax errors in components
- Verify all dependencies are installed
- Ensure Tailwind CSS is properly configured

### CORS Issues
- Verify `ALLOWED_ORIGINS` environment variable
- Check frontend proxy configuration
- Ensure proper CORS headers in server

### API Errors
- Check environment variables in Vercel
- Verify API routes are properly configured
- Check server logs for errors

### Socket.IO Issues
- Ensure WebSocket connections are allowed
- Check CORS configuration for WebSockets
- Verify Socket.IO server is running

## Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Verify environment variables
3. Test locally first
4. Check the README.md for detailed instructions

## Useful Vercel Commands

```bash
# View deployment status
vercel ls

# View logs
vercel logs

# Open project in browser
vercel open

# Remove deployment
vercel remove
```
