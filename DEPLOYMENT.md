# Deployment Guide for IT Consultation Platform

## 🚀 Coolify Deployment

### Prerequisites
- Coolify instance running
- Domain with SSL certificate (required for camera access)
- Agora.io account with App ID and Certificate

### Step 1: Prepare Environment Variables

In Coolify, set these environment variables:

```bash
# Required Agora Configuration
AGORA_APP_ID=your_actual_app_id_here
AGORA_APP_CERTIFICATE=your_actual_certificate_here
TOKEN_EXPIRATION_TIME=3600

# Flask Configuration
FLASK_ENV=production
FLASK_APP=app.py
HOST=0.0.0.0
PORT=5000
```

### Step 2: Deploy with Docker

1. **Create new service** in Coolify
2. **Select "Docker Compose"** as deployment type
3. **Upload your docker-compose.yml** or paste the content
4. **Set environment variables** in Coolify dashboard
5. **Enable HTTPS/SSL** (crucial for camera access)
6. **Deploy the service**

### Step 3: Configure Domain and SSL

**IMPORTANT**: Camera/microphone access requires HTTPS in production.

1. **Add your domain** in Coolify
2. **Enable SSL certificate** (Let's Encrypt)
3. **Verify HTTPS is working** before testing video calls

### Step 4: Test Deployment

1. **Access your domain**: `https://yourdomain.com`
2. **Open browser console** (F12 → Console)
3. **Run diagnostics**: Type `runDiagnostics()` in console
4. **Test camera**: Click "Test Camera" button
5. **Join call**: Click "Join Call" button

## 🔧 Troubleshooting Cloud Deployment Issues

### Issue 1: "Browser does not support camera/microphone access"

**Cause**: Not using HTTPS or browser compatibility

**Solutions**:
1. ✅ **Ensure HTTPS is enabled** (most common fix)
2. ✅ **Use modern browser** (Chrome, Firefox, Safari)
3. ✅ **Check domain configuration** in Coolify
4. ✅ **Verify SSL certificate** is valid

### Issue 2: "Agora client not initialized"

**Cause**: Agora SDK failed to load

**Solutions**:
1. ✅ **Check internet connectivity** from server
2. ✅ **Verify CDN access** (Agora SDK loads from CDN)
3. ✅ **Check browser console** for SDK loading errors
4. ✅ **Try refreshing the page** (fallback CDN will load)

### Issue 3: "Connection failed" or "Token errors"

**Cause**: Incorrect Agora credentials or configuration

**Solutions**:
1. ✅ **Verify environment variables** in Coolify
2. ✅ **Check Agora App ID** and **Certificate** are correct
3. ✅ **Ensure Agora project** is active in Agora Console
4. ✅ **Check token generation** endpoint: `/api/token?channel=test`

### Issue 4: Camera permission denied

**Cause**: Browser security or user permissions

**Solutions**:
1. ✅ **Click camera icon** in browser address bar
2. ✅ **Allow camera/microphone** permissions
3. ✅ **Refresh page** after granting permissions
4. ✅ **Try incognito/private mode** to reset permissions

## 📋 Deployment Checklist

### Before Deployment:
- [ ] Agora.io account created
- [ ] App ID and Certificate obtained
- [ ] Domain configured with SSL
- [ ] Environment variables prepared

### During Deployment:
- [ ] Docker image builds successfully
- [ ] Environment variables set in Coolify
- [ ] HTTPS/SSL enabled
- [ ] Service starts without errors

### After Deployment:
- [ ] Homepage loads correctly
- [ ] HTTPS is working (green lock icon)
- [ ] Browser console shows no errors
- [ ] Camera test works
- [ ] Video call connects successfully
- [ ] Multiple users can join same room

## 🌐 Alternative Deployment Platforms

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

### DigitalOcean App Platform
1. Connect GitHub repository
2. Set environment variables
3. Enable HTTPS
4. Deploy

### Heroku
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set AGORA_APP_ID=your_app_id
heroku config:set AGORA_APP_CERTIFICATE=your_certificate
git push heroku main
```

## 🔍 Debug Commands

### Check if Agora SDK loaded:
```javascript
console.log('Agora SDK:', typeof AgoraRTC !== 'undefined' ? 'Loaded' : 'Not loaded');
```

### Run full diagnostics:
```javascript
runDiagnostics();
```

### Test camera without Agora:
```javascript
navigator.mediaDevices.getUserMedia({video: true, audio: true})
  .then(stream => console.log('Camera works!'))
  .catch(err => console.error('Camera failed:', err));
```

### Check environment variables:
Visit: `https://yourdomain.com/api/token?channel=test`

## 📞 Support

If you continue having issues:

1. **Check browser console** for detailed error messages
2. **Verify HTTPS** is properly configured
3. **Test with different browsers** (Chrome recommended)
4. **Ensure Agora credentials** are correct and active
5. **Check Coolify logs** for server-side errors

The most common issue is **missing HTTPS** - camera access requires secure context in production!
