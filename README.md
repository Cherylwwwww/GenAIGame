# Where's Wally AI Training Game

An interactive educational game that teaches machine learning concepts through the classic "Where's Wally" challenge. Players annotate images to train an AI model to recognize Wally, demonstrating human-in-the-loop machine learning.

## 🎯 Overview

This project combines computer vision, machine learning, and interactive gameplay to create an educational experience about AI training. Players draw bounding boxes around Wally in training images, and watch as the AI learns to identify Wally's distinctive features (red-white striped shirt, bobble hat, and round glasses).

## 🚀 Quick Start Guide

### Step 1: Download the Project
1. Go to this GitHub repository page
2. Click the green "Code" button
3. Select "Download ZIP" or use `git clone [repository-url]`
4. Extract the ZIP file to your desired location (e.g., Desktop or Documents folder)

### Step 2: Install Required Software
Before opening the project, ensure you have:
- **Node.js** (version 18 or higher) - Download from https://nodejs.org/
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Step 3: Open Terminal/Command Prompt
- **Windows**: Press `Win + R`, type `cmd`, press Enter
- **macOS**: Press `Cmd + Space`, type "Terminal", press Enter  
- **Linux**: Press `Ctrl + Alt + T`

### Step 4: Navigate to Project Folder
```bash
cd path/to/wheres-wally-ai-game
# Example: cd Desktop/wheres-wally-ai-game
```

### Step 5: Install Dependencies
Run this command in the project folder:
```bash
npm install
```
Wait for the installation to complete (may take 2-5 minutes).

### Step 6: Start the Development Server
Run this command:
```bash
npm run dev
```

### Step 7: Open the Website
1. After running `npm run dev`, you'll see output like:
   ```
   Local: http://localhost:5173/
   ```
2. Open your web browser
3. Go to: **http://localhost:5173**
4. The Where's Wally AI Training Game will load automatically

### Step 8: Wait for AI Models to Load
- The first time you open the website, it may take 30-60 seconds to download AI models
- You'll see loading messages in the browser console
- Once loaded, you can start playing the game immediately

## 🎮 How to Play

### What You'll See:
- Wally game interface with training images on the left
- Test images on the right (initially blurred)
- Confidence meter showing AI learning progress
- Instructions to draw bounding boxes around Wally

### Game Instructions:
1. **Find Wally**: Look for Wally's red-white striped shirt, bobble hat, and round glasses
2. **Draw Bounding Box**: Click and drag around Wally when you find him
3. **Mark No Wally**: Click "No Wally Here" if Wally isn't in the image
4. **Watch AI Learn**: Observe the confidence meter increase as you provide more training data
5. **Test AI**: After 3+ annotations, see AI predictions on test images
6. **Level Up**: When AI confidence reaches 85%+, advance to the next level

## 🛠️ Technical Features

- **Frontend**: React with TypeScript
- **AI/ML**: TensorFlow.js with MobileNet and KNN Classifier
- **Database**: Supabase (optional, falls back to local mode)
- **Styling**: Tailwind CSS
- **Real-time Training**: Immediate AI model updates with each annotation

## 📋 System Requirements

### Minimum Requirements:
- **Operating System**: Windows 10/11, macOS 10.15+, or Ubuntu 18.04+
- **RAM**: 4GB (8GB recommended for optimal AI model performance)
- **Storage**: 2GB free space
- **Internet**: Stable connection for downloading dependencies and AI models
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

## 🔧 Troubleshooting

### If Something Goes Wrong:
- **Check Node.js**: Make sure Node.js is installed correctly: `node --version`
- **Clear Cache**: Try clearing cache: `npm cache clean --force`
- **Restart Server**: Stop with `Ctrl+C`, then run `npm run dev` again
- **Check Port**: If port 5173 is busy, the system will automatically use another port
- **Browser Console**: Press F12 to check for error messages

### Common Issues:
1. **"Node version not supported"**: Update Node.js to version 18+
2. **"npm install fails"**: Clear cache with `npm cache clean --force`
3. **"Port already in use"**: Kill the process or use a different port
4. **"AI models fail to load"**: Check internet connection and browser console

## 🌟 Optional Database Setup

For full features including data persistence:

1. **Create Supabase Account**: Go to https://supabase.com/
2. **Create New Project**: Follow Supabase setup wizard
3. **Get Credentials**: Copy Project URL and API Key
4. **Configure Environment**: 
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials
5. **Run Migration**: Execute the SQL file in `supabase/migrations/`

**Note**: The game works perfectly without database setup in local-only mode!

## 📁 Project Structure

```
wheres-wally-ai-game/
├── src/
│   ├── components/          # React components
│   ├── services/           # AI and database services
│   ├── utils/              # Game logic and data
│   ├── assets/             # Images and static files
│   └── types.ts            # TypeScript definitions
├── docs/                   # Documentation
├── supabase/              # Database functions and migrations
└── package.json           # Dependencies and scripts
```

## 🎯 Educational Goals

This project demonstrates:
- **Human-in-the-loop Machine Learning**: How human annotations improve AI
- **Computer Vision**: Feature extraction and image classification
- **Progressive Learning**: AI confidence building with more data
- **Real-time Feedback**: Immediate results from training data

## 🚀 Getting Started

Once everything is set up, the website game will be running locally on your computer at **http://localhost:5173**. Start annotating images and watch the AI learn to find Wally!

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check browser console for error messages
4. Ensure stable internet connection for AI model downloads

Happy Wally hunting! 🔍👓