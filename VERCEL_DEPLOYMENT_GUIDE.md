# Vercel Deployment Guide for Chatbot

This guide will help you deploy your chatbot application on Vercel and fix the common issues that prevent the chatbot from responding.

## 🚨 Important: Vercel Limitations

**Vercel's serverless functions have limitations for real-time applications:**
- No persistent WebSocket connections
- Function timeout limits (10-30 seconds)
- Cold starts can cause delays

**Our Solution:**
- Primary: Socket.IO with fallback to HTTP API
- Automatic fallback when WebSocket fails
- Optimized for Vercel's serverless environment

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup

**In Vercel Dashboard:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```env
# Required for chatbot functionality
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=your_mongodb_connection_string
ALLOWED_ORIGINS=https://your-app-name.vercel.app,http://localhost:3000

# Optional but recommended
NODE_ENV=production
PORT=3000
```

### 2. Update Client Environment

**In `client/production.env`:**
```env
REACT_APP_SERVER_URL=https://your-app-name.vercel.app
REACT_APP_ENVIRONMENT=production
```

**Replace `your-app-name` with your actual Vercel app name.**

## 🚀 Deployment Steps

### Step 1: Prepare Your Code

1. **Ensure all files are committed:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   ```

2. **Verify your `vercel.json` is correct:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       },
       {
         "src": "client/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "build"
         }
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/server.js"
       },
       {
         "src": "/socket.io/(.*)",
         "dest": "/server.js"
       },
       {
         "src": "/health",
         "dest": "/server.js"
       },
       {
         "src": "/(.*)",
         "dest": "/client/index.html"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     },
     "functions": {
       "server.js": {
         "maxDuration": 30
       }
     }
   }
   ```

### Step 2: Deploy to Vercel

1. **Install Vercel CLI (if not already installed):**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Follow the prompts:**
   - Link to existing project or create new
   - Confirm deployment settings

## 🔧 Post-Deployment Configuration

### 1. Set Environment Variables

After deployment, set your environment variables in Vercel dashboard:

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable:
   - `OPENAI_API_KEY`
   - `MONGODB_URI` (if using MongoDB)
   - `ALLOWED_ORIGINS`

### 2. Redeploy After Environment Variables

```bash
vercel --prod
```

## 🧪 Testing Your Deployment

### 1. Health Check
Visit: `https://your-app-name.vercel.app/health`
Should return: `{"status":"OK","timestamp":"...","environment":"production"}`

### 2. Chatbot Test
1. Open your app: `https://your-app-name.vercel.app`
2. Navigate to the chatbot
3. Try sending a message
4. Check browser console for connection status

### 3. Check Connection Mode
In browser console, look for:
- `"Connected to chatbot server"` (Socket.IO mode)
- `"Falling back to HTTP polling mode"` (Fallback mode)

## 🔍 Troubleshooting

### Issue 1: Chatbot Not Responding

**Symptoms:** Messages sent but no response received

**Solutions:**
1. **Check environment variables:**
   ```bash
   vercel env ls
   ```

2. **Check server logs:**
   ```bash
   vercel logs
   ```

3. **Test API endpoint directly:**
   ```bash
   curl -X POST https://your-app-name.vercel.app/api/chatbot/start \
     -H "Content-Type: application/json" \
     -d '{"userId":"test"}'
   ```

### Issue 2: Socket.IO Connection Fails

**Symptoms:** Console shows connection errors

**Solutions:**
1. **Check CORS settings in `server.js`**
2. **Verify `ALLOWED_ORIGINS` includes your Vercel domain**
3. **The app should automatically fallback to HTTP mode**

### Issue 3: Environment Variables Not Working

**Symptoms:** API calls fail with missing configuration

**Solutions:**
1. **Redeploy after setting environment variables:**
   ```bash
   vercel --prod
   ```

2. **Check variable names match exactly**
3. **Ensure no extra spaces in values**

### Issue 4: Build Errors

**Symptoms:** Deployment fails during build

**Solutions:**
1. **Check `package.json` scripts**
2. **Verify all dependencies are installed**
3. **Check for syntax errors in code**

## 📊 Monitoring

### 1. Vercel Analytics
- Go to your project dashboard
- Check "Analytics" tab for performance metrics

### 2. Function Logs
```bash
vercel logs --follow
```

### 3. Real-time Monitoring
- Check browser console for connection status
- Monitor API response times

## 🔄 Updates and Redeployment

### Making Changes
1. **Update your code**
2. **Commit changes:**
   ```bash
   git add .
   git commit -m "Update chatbot functionality"
   ```
3. **Redeploy:**
   ```bash
   vercel --prod
   ```

### Environment Variable Updates
1. **Update in Vercel dashboard**
2. **Redeploy:**
   ```bash
   vercel --prod
   ```

## 🎯 Best Practices

### 1. Performance
- Keep function execution time under 10 seconds
- Use caching for frequently accessed data
- Optimize database queries

### 2. Security
- Never commit API keys to git
- Use environment variables for all secrets
- Implement proper rate limiting

### 3. Monitoring
- Set up alerts for function failures
- Monitor response times
- Track user engagement metrics

## 🆘 Support

If you're still having issues:

1. **Check Vercel documentation:** https://vercel.com/docs
2. **Review function logs:** `vercel logs`
3. **Test locally first:** `npm run dev`
4. **Verify all environment variables are set**
5. **Check browser console for specific error messages**

## 📞 Common Error Messages

| Error | Solution |
|-------|----------|
| `OPENAI_API_KEY is not defined` | Set environment variable in Vercel |
| `CORS error` | Check `ALLOWED_ORIGINS` includes your domain |
| `Function timeout` | Optimize code or increase `maxDuration` |
| `Socket connection failed` | App will automatically use HTTP fallback |

Your chatbot should now work properly on Vercel! 🎉
