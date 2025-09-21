# Where's Wally AI Training Game - Comprehensive Installation Guide

## 📋 Table of Contents
1. [System Requirements](#system-requirements)
2. [Prerequisites Installation](#prerequisites-installation)
3. [Project Setup](#project-setup)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup (Optional)](#database-setup-optional)
6. [Running the Application](#running-the-application)
7. [Verification & Testing](#verification--testing)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Configuration](#advanced-configuration)

---

## System Requirements

### Minimum Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, or Ubuntu 18.04+
- **RAM**: 4GB (8GB recommended for optimal AI model performance)
- **Storage**: 2GB free space
- **Internet**: Stable connection for downloading dependencies and AI models
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

### Hardware Requirements
- **CPU**: Modern multi-core processor (Intel i5/AMD Ryzen 5 or better)
- **GPU**: WebGL 2.0 compatible graphics (for TensorFlow.js acceleration)
- **Network**: Broadband internet connection (for initial setup)

---

## Prerequisites Installation

### Step 1: Install Node.js

#### For Windows:
1. **Download Node.js**
   - Visit: https://nodejs.org/
   - Click "Download for Windows" (LTS version recommended)
   - Download the `.msi` installer file

2. **Install Node.js**
   ```
   1. Double-click the downloaded .msi file
   2. Click "Next" through the welcome screen
   3. Accept the license agreement
   4. Choose installation directory (default: C:\Program Files\nodejs\)
   5. Select components (keep all defaults selected)
   6. Check "Automatically install the necessary tools" if prompted
   7. Click "Install" and wait for completion
   8. Click "Finish"
   ```

3. **Verify Installation**
   ```bash
   # Open Command Prompt (Win + R, type "cmd", press Enter)
   node --version
   # Should display: v18.x.x or higher
   
   npm --version
   # Should display: 9.x.x or higher
   ```

#### For macOS:
1. **Option A: Direct Download**
   - Visit: https://nodejs.org/
   - Download the `.pkg` installer
   - Double-click and follow installation wizard

2. **Option B: Using Homebrew (Recommended)**
   ```bash
   # Install Homebrew first (if not installed)
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install Node.js
   brew install node
   ```

3. **Verify Installation**
   ```bash
   # Open Terminal (Cmd + Space, type "Terminal")
   node --version
   npm --version
   ```

#### For Linux (Ubuntu/Debian):
```bash
# Update package index
sudo apt update

# Install Node.js from NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 2: Install Git

#### For Windows:
1. **Download Git**
   - Visit: https://git-scm.com/download/windows
   - Download the installer

2. **Install Git**
   ```
   1. Run the installer
   2. Choose installation location
   3. Select components (keep defaults)
   4. Choose default editor (VS Code recommended)
   5. Choose PATH environment (select "Git from command line and 3rd-party software")
   6. Choose HTTPS transport backend (OpenSSL)
   7. Configure line ending conversions (Checkout Windows-style, commit Unix-style)
   8. Choose terminal emulator (MinTTY recommended)
   9. Complete installation
   ```

#### For macOS:
```bash
# Using Homebrew
brew install git

# Or download from: https://git-scm.com/download/mac
```

#### For Linux:
```bash
# Ubuntu/Debian
sudo apt install git

# CentOS/RHEL
sudo yum install git
```

### Step 3: Verify Git Installation
```bash
git --version
# Should display: git version 2.x.x

# Configure Git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 4: Install Code Editor (Recommended)

#### Visual Studio Code:
1. **Download**: https://code.visualstudio.com/
2. **Install** following platform-specific instructions
3. **Install Extensions** (optional but helpful):
   ```
   - ES7+ React/Redux/React-Native snippets
   - TypeScript Importer
   - Prettier - Code formatter
   - Auto Rename Tag
   - Bracket Pair Colorizer
   - GitLens
   ```

---

## Project Setup

### Step 1: Create Project Directory
```bash
# Windows
cd C:\Users\%USERNAME%\Documents
mkdir Projects
cd Projects

# macOS/Linux
cd ~/Documents
mkdir Projects
cd Projects
```

### Step 2: Clone the Repository
```bash
# Replace with your actual repository URL
git clone https://github.com/yourusername/wheres-wally-ai-game.git

# Navigate to project directory
cd wheres-wally-ai-game

# Verify project structure
ls -la
# You should see:
# - src/
# - public/
# - package.json
# - README.md
# - .env.example
# - etc.
```

### Step 3: Install Project Dependencies

#### Clear npm cache (preventive measure):
```bash
npm cache clean --force
```

#### Install dependencies:
```bash
# This will install all required packages
npm install

# The installation process will:
# 1. Download ~1000+ packages (may take 5-10 minutes)
# 2. Create node_modules/ directory
# 3. Generate package-lock.json file
# 4. Install TensorFlow.js, React, Supabase client, and other dependencies
```

#### Verify installation:
```bash
# Check if node_modules was created
ls -la node_modules/

# Check if package-lock.json exists
ls -la package-lock.json

# Verify key dependencies
npm list @tensorflow/tfjs
npm list react
npm list @supabase/supabase-js
```

---

## Environment Configuration

### Step 1: Create Environment File
```bash
# Copy the example environment file
cp .env.example .env

# Windows users can use:
copy .env.example .env
```

### Step 2: Basic Configuration
Open the `.env` file in your code editor and configure:

```env
# Basic configuration (required)
VITE_APP_NAME=Wheres Wally AI Game
VITE_APP_VERSION=1.0.0

# Supabase configuration (optional - see Database Setup section)
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Note**: The application will work in local-only mode without Supabase configuration, but with limited data persistence features.

---

## Database Setup (Optional)

> **Important**: This section is optional. The application will work without Supabase in local-only mode.

### Step 1: Create Supabase Account
1. **Sign Up**
   - Visit: https://supabase.com/
   - Click "Start your project"
   - Sign up using GitHub, Google, or email
   - Verify your email if required

2. **Create New Project**
   ```
   1. Click "New Project" in dashboard
   2. Choose or create organization
   3. Fill project details:
      - Name: wheres-wally-ai-game
      - Database Password: [Create strong password - SAVE THIS!]
      - Region: [Choose closest to your location]
   4. Click "Create new project"
   5. Wait 2-3 minutes for project creation
   ```

### Step 2: Get Project Credentials
1. **Access Project Settings**
   ```
   1. Go to project dashboard
   2. Click "Settings" in left sidebar
   3. Click "API" tab
   4. Copy the following:
      - Project URL (https://xxx.supabase.co)
      - anon public key (long string starting with "eyJ...")
   ```

2. **Update Environment File**
   ```env
   # Update your .env file
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 3: Set Up Database Schema
1. **Open SQL Editor**
   ```
   1. In Supabase dashboard, click "SQL Editor"
   2. Click "New query"
   ```

2. **Run Migration Script**
   ```sql
   -- Copy and paste the entire content from:
   -- supabase/migrations/20250912071952_black_smoke.sql
   -- Then click "Run" to execute
   ```

3. **Verify Tables Created**
   ```
   1. Click "Table Editor" in left sidebar
   2. You should see these tables:
      - training_sessions
      - annotations
      - training_jobs
      - model_predictions
   ```

---

## Running the Application

### Step 1: Start Development Server
```bash
# In the project root directory
npm run dev

# You should see output like:
# VITE v4.x.x ready in xxx ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

### Step 2: Open in Browser
1. **Access Application**
   - Open your browser
   - Navigate to: http://localhost:5173
   - Wait for initial loading (30-60 seconds for AI models)

2. **Check Browser Console**
   ```
   1. Press F12 to open Developer Tools
   2. Click "Console" tab
   3. Look for these success messages:
      - "🤖 Loading MobileNet model..."
      - "✅ TensorFlow.js backend initialized"
      - "✅ MobileNet loaded successfully!"
   ```

---

## Verification & Testing

### Step 1: Interface Verification
Check that these elements are visible and working:
- [ ] Wally game header with logo
- [ ] Level indicator (Level 1)
- [ ] Training image area (left side)
- [ ] Test image area (right side)
- [ ] Confidence meter with red ball
- [ ] Navigation buttons
- [ ] "No Wally Here" button

### Step 2: Functionality Testing

#### Test Image Annotation:
1. **Bounding Box Drawing**
   ```
   1. Click and drag on training image
   2. Should see red dashed border while dragging
   3. Release mouse - border becomes solid
   4. Should auto-advance to next image
   ```

2. **Negative Annotation**
   ```
   1. Click "No Wally Here" button
   2. Should auto-advance to next image
   3. Progress counter should increment
   ```

#### Test AI Training:
1. **Annotate Multiple Images**
   ```
   1. Annotate at least 3 images
   2. Watch confidence meter red ball move right
   3. Observe test image area changes
   4. Should see AI predictions appear
   ```

#### Test Database (if configured):
1. **Check Supabase Dashboard**
   ```
   1. Go to Supabase Table Editor
   2. Check "annotations" table for new records
   3. Verify data is being stored correctly
   ```

### Step 3: Performance Verification
```bash
# Check for memory leaks in browser console
# Should see tensor disposal messages like:
# "✅ Tensor disposed successfully"

# Monitor network requests
# Should see successful API calls to Supabase (if configured)
```

---

## Troubleshooting

### Common Issue 1: Node.js Version Error
**Problem**: "Node version not supported"
```bash
# Check current version
node --version

# If below v18, update Node.js:
# - Download latest from nodejs.org
# - Or use nvm (Node Version Manager)

# Install nvm (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install latest Node.js
nvm install node
nvm use node
```

### Common Issue 2: npm Install Failures
**Problem**: Permission errors or network timeouts
```bash
# Fix permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Clear cache and retry
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Use different registry (China users)
npm config set registry https://registry.npmmirror.com
npm install
```

### Common Issue 3: Port Already in Use
**Problem**: "Port 5173 is already in use"
```bash
# Find and kill process using port
# Windows
netstat -ano | findstr :5173
taskkill /PID [PID_NUMBER] /F

# macOS/Linux
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### Common Issue 4: AI Model Loading Failure
**Problem**: "Failed to load MobileNet"
```bash
# Solutions:
1. Check internet connection
2. Clear browser cache (Ctrl+Shift+Delete)
3. Disable browser extensions temporarily
4. Try different browser
5. Check firewall/antivirus settings
6. Use VPN if in restricted network
```

### Common Issue 5: Images Not Loading
**Problem**: Broken image icons or 404 errors
```bash
# Check image files exist
ls -la src/assets/

# Verify image imports in gameData.ts
# Make sure all imported images exist in assets folder

# If images missing, contact project maintainer
```

### Common Issue 6: Supabase Connection Issues
**Problem**: Database operations failing
```bash
# Verify environment variables
cat .env

# Check Supabase project status
# - Visit supabase.com dashboard
# - Ensure project is active
# - Verify URL and keys are correct

# Test connection in browser console
# Should see either:
# "✅ Supabase training session created successfully"
# or "❌ User not authenticated, falling back to simulation mode"
```

---

## Advanced Configuration

### Development Environment Setup

#### Install Additional Tools:
```bash
# TypeScript (if needed globally)
npm install -g typescript

# Prettier for code formatting
npm install --save-dev prettier

# Create .prettierrc file
echo '{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}' > .prettierrc
```

#### Browser Extensions:
- **React Developer Tools**: For debugging React components
- **Redux DevTools**: For state management debugging (if using Redux)
- **TensorFlow.js Debugger**: For AI model debugging

### Performance Optimization

#### Browser Settings:
```javascript
// Enable WebGL in Chrome
// Go to: chrome://flags/
// Search: "WebGL"
// Enable: "WebGL 2.0"

// Firefox WebGL
// Go to: about:config
// Search: "webgl.force-enabled"
// Set to: true
```

#### Memory Monitoring:
```javascript
// In browser console, monitor memory usage
console.log('Memory usage:', performance.memory);

// Enable debug mode
localStorage.setItem('debug', 'true');
// Refresh page to see detailed logs
```

### Production Build

#### Create Production Version:
```bash
# Build for production
npm run build

# Files will be created in 'dist' directory
ls -la dist/

# Preview production build
npm run preview
```

#### Deploy Options:
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **Cloud Platforms**: AWS S3, Google Cloud Storage
- **Traditional Hosting**: Any web server supporting static files

---

## Final Verification Checklist

Before considering the installation complete, verify:

- [ ] Node.js 18+ installed and verified
- [ ] Git installed and configured
- [ ] Project cloned successfully
- [ ] All dependencies installed (`npm install` completed)
- [ ] Environment file created and configured
- [ ] Development server starts without errors
- [ ] Application loads in browser at http://localhost:5173
- [ ] AI models load successfully (check console)
- [ ] Training images display correctly
- [ ] Bounding box annotation works
- [ ] Confidence meter updates with annotations
- [ ] Test image predictions appear after 3+ annotations
- [ ] Database connection works (if Supabase configured)
- [ ] No critical errors in browser console

## 🎉 Installation Complete!

Congratulations! Your Where's Wally AI Training Game is now fully installed and ready to use. The system combines computer vision, machine learning, and interactive gameplay to create an educational experience about AI training.

### Getting Started:
1. Start by annotating training images (draw boxes around Wally)
2. Use "No Wally Here" for images without Wally
3. Watch the AI confidence improve with more annotations
4. See predictions appear on test images
5. Progress to next level when confidence reaches 85%+

### Support:
If you encounter any issues not covered in this guide, please:
1. Check the browser console for error messages
2. Verify all prerequisites are correctly installed
3. Ensure environment variables are properly configured
4. Try the troubleshooting steps for common issues

Happy Wally hunting! 🔍👓