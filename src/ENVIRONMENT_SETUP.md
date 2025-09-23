# Environment Setup Guide for FridgeToFork

This guide will help you configure the environment variables needed to run FridgeToFork with full functionality.

## 🔧 Quick Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` with your actual credentials**

3. **Restart your development server** to load the new environment variables

## 📋 Required Environment Variables

### Firebase Configuration
Firebase is required for user authentication, data storage, and file uploads.

```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=1:your_messaging_sender_id:web:your_app_id
```

**How to get Firebase credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Go to Project Settings > General tab
4. Scroll down to "Your apps" section
5. Click "Web app" icon to add/configure web app
6. Copy the config values from the Firebase SDK snippet

### Google Vision API (Optional)
For AI-powered ingredient detection from fridge photos.

```bash
VITE_GOOGLE_VISION_API_KEY=your_google_vision_api_key_here
```

**How to get Google Vision API key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable the Vision API
4. Go to APIs & Services > Credentials
5. Create credentials > API key
6. Restrict the key to Vision API for security

### Email Service (Optional)
For sending notifications and welcome emails.

```bash
VITE_SENDGRID_API_KEY=your_sendgrid_api_key_here
VITE_EMAIL_FROM_ADDRESS=noreply@yourdomain.com
```

**How to get SendGrid API key:**
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Go to Settings > API Keys
3. Create an API key with Mail Send permissions

## 🚦 Environment Status Check

The app will show you the status of your environment variables in the browser console:

- ✅ **Production Mode**: All required environment variables are configured
- 🔧 **Demo Mode**: Using fallback demo data (some features won't work)

## 🔍 Troubleshooting

### "Firebase running in DEMO MODE" Error

This error appears when Firebase environment variables are not properly configured:

1. **Check your `.env.local` file exists** in the project root
2. **Verify variable names** start with `VITE_` prefix
3. **Restart your development server** after adding environment variables
4. **Check the browser console** for detailed environment variable status

### Common Issues

**❌ Environment variables not loading:**
- Make sure your `.env.local` file is in the project root (same level as `package.json`)
- Variable names must start with `VITE_` prefix
- No spaces around the `=` sign: `VITE_API_KEY=value` ✅ not `VITE_API_KEY = value` ❌

**❌ Firebase errors:**
- Double-check your Firebase project settings
- Ensure your domain is added to authorized domains in Firebase Console
- Verify all 6 Firebase environment variables are set

**❌ API quota errors:**
- Google Vision API has usage limits on free tier
- SendGrid has sending limits on free tier
- Monitor your usage in respective dashboards

## 🔒 Security Best Practices

1. **Never commit `.env.local`** to version control (it's in `.gitignore`)
2. **Use environment-specific values** (development vs production)
3. **Restrict API keys** to specific APIs and domains when possible
4. **Regularly rotate API keys** for production applications

## 🏃‍♂️ Running in Different Modes

### Demo Mode (No Setup Required)
- All features work with mock data
- No real authentication, storage, or API calls
- Perfect for testing and development

### Production Mode (Full Setup Required)
- Real Firebase authentication and storage
- AI-powered ingredient detection via Google Vision
- Email notifications via SendGrid
- All features fully functional

## 💡 Tips

- **Start with demo mode** to explore the app
- **Add services incrementally** (Firebase first, then APIs)
- **Check browser console** for helpful debugging info
- **Use `.env.example`** as reference for variable names

## 🆘 Need Help?

If you're still having issues:

1. Check the browser console for specific error messages
2. Verify your API keys are valid and have correct permissions
3. Ensure your Firebase project has the required services enabled
4. Double-check that your `.env.local` file has the correct variable names

The app is designed to work in demo mode even without configuration, so you can always fall back to that while setting up your environment.