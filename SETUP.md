# WALLY! isHERE! - AI Training Game - Complete Setup Guide

## 🎯 Overview
This guide will help you set up the WALLY! isHERE! AI Training Game on your local machine. The project is a React-based web application that uses AI/ML technologies to create an interactive learning experience.

## 📋 Prerequisites

### Required Software
Before starting, ensure you have the following installed:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

4. **Modern Web Browser**
   - Chrome, Firefox, Safari, or Edge (latest versions)
   - WebGL support required for TensorFlow.js

### System Requirements
- **RAM**: Minimum 4GB (8GB recommended for smooth AI model loading)
- **Storage**: At least 500MB free space
- **Internet Connection**: Required for initial setup and AI model downloads

## 🚀 Step-by-Step Setup Instructions

### Step 1: Clone the Repository
```bash
# Clone the project repository
git clone [YOUR_REPOSITORY_URL]

# Navigate to project directory
cd wheres-wally-ai-game
```

### Step 2: Install Dependencies
```bash
# Install all required packages
npm install

# This will install:
# - React and React DOM
# - TensorFlow.js and AI models
# - Supabase client
# - Tailwind CSS
# - TypeScript
# - And other dependencies
```

### Step 3: Environment Configuration

#### Create Environment File
```bash
# Copy the example environment file
cp .env.example .env
```

#### Configure Environment Variables
Open the `.env` file and add your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note**: If you don't have Supabase credentials, the app will run in local-only mode with limited features.

### Step 4: Database Setup (Optional)

#### If you want full functionality with data persistence:

1. **Create Supabase Account**
   - Go to https://supabase.com/
   - Sign up for a free account
   - Create a new project

2. **Run Database Migrations**
   ```bash
   # If you have Supabase CLI installed
   supabase db push
   
   # Or manually run the SQL migration file:
   # Copy content from supabase/migrations/20250912071952_black_smoke.sql
   # and run it in your Supabase SQL editor
   ```

3. **Update Environment Variables**
   - Copy your Supabase URL and anon key from your project settings
   - Update the `.env` file with these values

### Step 5: Start the Development Server
```bash
# Start the development server
npm run dev

# The application will be available at:
# http://localhost:5173
```

## 🔧 Troubleshooting Common Issues

### Issue 1: Node.js Version Compatibility
**Problem**: "Node version not supported" error
**Solution**: 
```bash
# Check your Node.js version
node --version

# If version is below 18, update Node.js
# Download latest version from nodejs.org
```

### Issue 2: Package Installation Failures
**Problem**: npm install fails with permission errors
**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Try installing again
npm install

# On macOS/Linux, you might need:
sudo npm install
```

### Issue 3: TensorFlow.js Loading Issues
**Problem**: AI models fail to load
**Solution**:
- Ensure you have a stable internet connection
- Check browser console for WebGL support
- Try refreshing the page
- Clear browser cache

### Issue 4: Supabase Connection Issues
**Problem**: Database operations fail
**Solution**:
- Verify your `.env` file has correct Supabase credentials
- Check Supabase project status
- The app will automatically fall back to local mode if Supabase is unavailable

### Issue 5: Image Loading Problems
**Problem**: Training images don't display
**Solution**:
- Check that all image files exist in `src/assets/` directory
- Verify image file paths in `src/utils/gameData.ts`
- Ensure images are in supported formats (PNG, JPG, JPEG)

## 📁 Project Structure Overview

```
wheres-wally-ai-game/
├── src/
│   ├── components/          # React components
│   ├── services/           # AI and database services
│   ├── utils/              # Game logic and data
│   ├── assets/             # Images and static files
│   ├── lib/                # Library configurations
│   └── types.ts            # TypeScript type definitions
├── supabase/
│   ├── functions/          # Edge functions
│   └── migrations/         # Database schema
├── docs/                   # Documentation files
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables
└── README.md              # Project overview
```

## 🎮 First Time Usage

### 1. Open the Application
- Navigate to http://localhost:5173 in your browser
- Wait for the AI models to load (may take 30-60 seconds on first load)

### 2. Start Playing
- The game will automatically start with Level 1
- You'll see training images where you need to find Wally
- Draw bounding boxes around Wally when you find him
- Click "No Wally Here" if Wally is not in the image

### 3. Train the AI
- After annotating 3+ images, the AI will start making predictions
- Continue annotating to improve AI confidence
- Watch the confidence meter increase with more training data

### 4. Progress Through Levels
- When AI confidence reaches 85%+, you can advance to the next level
- Each level presents new challenges and images

## 🔒 Security Notes

### Environment Variables
- Never commit your `.env` file to version control
- Keep your Supabase keys secure
- The anon key is safe for client-side use, but service role key should never be exposed

### Browser Security
- The app requires WebGL for AI model execution
- Some browser security settings might block AI model downloads
- Ensure JavaScript is enabled

## 🚀 Production Deployment

### Build for Production
```bash
# Create production build
npm run build

# The built files will be in the 'dist' directory
```

### Deploy Options
1. **Static Hosting**: Netlify, Vercel, GitHub Pages
2. **Cloud Platforms**: AWS S3, Google Cloud Storage
3. **Traditional Hosting**: Any web server that can serve static files

## 📞 Getting Help

### Common Resources
- **React Documentation**: https://react.dev/
- **TensorFlow.js Guide**: https://www.tensorflow.org/js
- **Supabase Documentation**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

### Debug Mode
Enable detailed logging by opening browser developer tools:
```javascript
// In browser console, enable verbose logging
localStorage.setItem('debug', 'true');
// Refresh the page to see detailed logs
```

### Performance Monitoring
Monitor AI model performance:
- Check browser console for memory usage warnings
- Watch for TensorFlow.js tensor disposal messages
- Monitor network requests for model downloads

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Application loads at http://localhost:5173
- [ ] Training images display correctly
- [ ] Bounding box annotation works (click and drag)
- [ ] "No Wally Here" button functions
- [ ] AI confidence meter updates with annotations
- [ ] Test image predictions appear after 3+ annotations
- [ ] Database connection status shows (if Supabase configured)
- [ ] Browser console shows no critical errors

## 🎉 You're Ready!

Congratulations! Your WALLY! isHERE! AI Training Game is now set up and ready to use. The system combines computer vision, machine learning, and interactive gameplay to create an educational experience about AI training.

Enjoy training your AI to find Wally! 🔍👓