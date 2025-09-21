# GitHub Project Setup Instructions

## Overview
This section provides comprehensive instructions for users who want to download and run the Where's Wally AI Training Game project from GitHub. These instructions are designed for users with varying levels of technical expertise.

## Prerequisites Check

Before beginning the installation process, users must verify their system meets the following requirements:

### System Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, or Ubuntu 18.04+
- **RAM**: Minimum 4GB (8GB recommended for optimal AI model performance)
- **Storage**: 2GB free disk space
- **Internet Connection**: Stable broadband connection for downloading dependencies
- **Browser**: Modern browser with WebGL 2.0 support (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### Required Software Installation

#### Step 1: Install Node.js
1. **Navigate to Node.js Website**
   - Open your web browser
   - Go to: https://nodejs.org/
   - Click on the "LTS" (Long Term Support) version download button

2. **Download and Install**
   - **Windows Users**: Download the `.msi` installer and run it
   - **macOS Users**: Download the `.pkg` installer and follow the installation wizard
   - **Linux Users**: Use the package manager or download from the website

3. **Verify Installation**
   ```bash
   # Open terminal/command prompt and run:
   node --version
   # Should display: v18.x.x or higher
   
   npm --version
   # Should display: 9.x.x or higher
   ```

#### Step 2: Install Git
1. **Download Git**
   - Visit: https://git-scm.com/downloads
   - Select your operating system
   - Download the appropriate installer

2. **Install Git**
   - Run the downloaded installer
   - Accept default settings during installation
   - Ensure "Git from the command line" option is selected

3. **Verify Git Installation**
   ```bash
   git --version
   # Should display: git version 2.x.x
   ```

## Project Download and Setup

### Step 1: Clone the Repository

1. **Create Project Directory**
   ```bash
   # Navigate to your desired location (e.g., Documents folder)
   cd ~/Documents  # macOS/Linux
   cd C:\Users\YourUsername\Documents  # Windows
   
   # Create a projects folder
   mkdir Projects
   cd Projects
   ```

2. **Clone the Repository**
   ```bash
   # Replace 'your-username' and 'repository-name' with actual values
   git clone https://github.com/your-username/wheres-wally-ai-game.git
   
   # Navigate into the project directory
   cd wheres-wally-ai-game
   ```

3. **Verify Project Structure**
   ```bash
   # List project contents
   ls -la  # macOS/Linux
   dir     # Windows
   
   # You should see these key files and folders:
   # - src/
   # - public/
   # - package.json
   # - README.md
   # - .env.example
   ```

### Step 2: Install Project Dependencies

1. **Clear npm Cache (Preventive)**
   ```bash
   npm cache clean --force
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # This process may take 5-10 minutes depending on internet speed
   # The system will download approximately 1000+ packages
   ```

3. **Verify Installation Success**
   ```bash
   # Check if node_modules folder was created
   ls node_modules/  # Should show many package folders
   
   # Verify key dependencies
   npm list react
   npm list @tensorflow/tfjs
   npm list @supabase/supabase-js
   ```

### Step 3: Environment Configuration

1. **Create Environment File**
   ```bash
   # Copy the example environment file
   cp .env.example .env  # macOS/Linux
   copy .env.example .env  # Windows
   ```

2. **Configure Basic Settings**
   Open the `.env` file in a text editor and ensure it contains:
   ```env
   # Basic configuration (required)
   VITE_APP_NAME=Wheres Wally AI Game
   VITE_APP_VERSION=1.0.0
   
   # Supabase configuration (optional - see Database Setup)
   VITE_SUPABASE_URL=your_supabase_project_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

   **Note**: The application will function in local-only mode without Supabase configuration, but with limited data persistence features.

## Database Setup (Optional but Recommended)

### Step 1: Create Supabase Account

1. **Sign Up for Supabase**
   - Navigate to: https://supabase.com/
   - Click "Start your project"
   - Sign up using GitHub, Google, or email
   - Verify your email address if required

2. **Create New Project**
   - Click "New Project" in the dashboard
   - Choose or create an organization
   - Fill in project details:
     - **Name**: `wheres-wally-ai-game`
     - **Database Password**: Create a strong password (save this!)
     - **Region**: Select the region closest to your location
   - Click "Create new project"
   - Wait 2-3 minutes for project initialization

### Step 2: Configure Database Connection

1. **Get Project Credentials**
   - In your Supabase project dashboard, click "Settings" → "API"
   - Copy the following information:
     - **Project URL** (format: https://xxx.supabase.co)
     - **anon public key** (long string starting with "eyJ...")

2. **Update Environment File**
   ```env
   # Update your .env file with actual values
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Set Up Database Schema**
   - In Supabase dashboard, go to "SQL Editor"
   - Click "New query"
   - Copy the entire content from `supabase/migrations/20250912071952_black_smoke.sql`
   - Paste into the SQL editor and click "Run"
   - Verify tables are created by checking "Table Editor"

## Running the Application

### Step 1: Start Development Server

1. **Launch the Application**
   ```bash
   # In the project root directory, run:
   npm run dev
   
   # You should see output similar to:
   # VITE v4.x.x ready in xxx ms
   # ➜  Local:   http://localhost:5173/
   # ➜  Network: use --host to expose
   ```

2. **Verify Server Status**
   - The development server should start without errors
   - Note the local URL (typically http://localhost:5173)

### Step 2: Access the Application

1. **Open in Browser**
   - Open your preferred modern browser
   - Navigate to: http://localhost:5173
   - Wait for initial loading (30-60 seconds for AI models to download)

2. **Monitor Loading Process**
   - Press F12 to open Developer Tools
   - Click the "Console" tab
   - Look for these success messages:
     ```
     🤖 Loading MobileNet model...
     ✅ TensorFlow.js backend initialized
     ✅ MobileNet loaded successfully!
     ```

## Verification and Testing

### Interface Verification Checklist

Confirm the following elements are visible and functional:

- [ ] **Header Section**: Wally game logo and title
- [ ] **Level Indicator**: Shows "Level 1" 
- [ ] **Training Image Area**: Left side panel with image display
- [ ] **Test Image Area**: Right side panel (initially blurred/disabled)
- [ ] **Confidence Meter**: Red ball on progress track
- [ ] **Navigation Controls**: Previous/Next buttons
- [ ] **Annotation Button**: "No Wally Here" button

### Functionality Testing

1. **Test Image Annotation**
   - Click and drag on the training image to create a bounding box
   - Verify red dashed border appears while dragging
   - Confirm border becomes solid red when released
   - Check that the system auto-advances to the next image

2. **Test Negative Annotation**
   - Click the "No Wally Here" button
   - Verify the system advances to the next image
   - Confirm the annotation counter increases

3. **Test AI Training Process**
   - Annotate at least 3 images (mix of positive and negative)
   - Watch the confidence meter red ball move to the right
   - Observe the test image area become active
   - Verify AI predictions appear on test images

### Database Functionality (if configured)

1. **Verify Data Storage**
   - Go to your Supabase project dashboard
   - Navigate to "Table Editor"
   - Check the "annotations" table for new records
   - Confirm data is being stored correctly

## Troubleshooting Common Issues

### Issue 1: Node.js Version Compatibility
**Problem**: Error message "Node version not supported"
**Solution**:
```bash
# Check current Node.js version
node --version

# If version is below 18.x, download and install latest from nodejs.org
# Or use Node Version Manager (nvm):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
nvm use node
```

### Issue 2: npm Installation Failures
**Problem**: Permission errors or network timeouts during `npm install`
**Solution**:
```bash
# Clear npm cache and retry
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# For permission issues (macOS/Linux):
sudo chown -R $(whoami) ~/.npm

# For network issues in China:
npm config set registry https://registry.npmmirror.com
npm install
```

### Issue 3: Port Already in Use
**Problem**: "Port 5173 is already in use"
**Solution**:
```bash
# Find and kill the process using the port
# Windows:
netstat -ano | findstr :5173
taskkill /PID [PID_NUMBER] /F

# macOS/Linux:
lsof -ti:5173 | xargs kill -9

# Or use a different port:
npm run dev -- --port 3000
```

### Issue 4: AI Models Fail to Load
**Problem**: Console shows "Failed to load MobileNet"
**Solution**:
- Check internet connection stability
- Clear browser cache (Ctrl+Shift+Delete)
- Try a different browser
- Disable browser extensions temporarily
- Check firewall/antivirus settings

### Issue 5: Images Not Displaying
**Problem**: Training images show as broken links
**Solution**:
- Verify all image files exist in `src/assets/` directory
- Check image file paths in `src/utils/gameData.ts`
- Ensure images are in supported formats (PNG, JPG, JPEG)

## Performance Optimization

### Browser Settings
1. **Enable WebGL Acceleration**
   - Chrome: Go to `chrome://flags/`, search "WebGL", enable "WebGL 2.0"
   - Firefox: Go to `about:config`, set `webgl.force-enabled` to `true`

2. **Monitor Memory Usage**
   ```javascript
   // In browser console, monitor performance:
   console.log('Memory usage:', performance.memory);
   
   // Enable debug mode for detailed logs:
   localStorage.setItem('debug', 'true');
   // Refresh page to see detailed logs
   ```

## Final Verification Checklist

Before considering the installation complete, verify:

- [ ] Node.js 18+ installed and verified
- [ ] Git installed and configured  
- [ ] Project cloned successfully from GitHub
- [ ] All dependencies installed without errors
- [ ] Environment file created and configured
- [ ] Development server starts successfully
- [ ] Application loads in browser at http://localhost:5173
- [ ] AI models load successfully (check console messages)
- [ ] Training images display correctly
- [ ] Bounding box annotation functionality works
- [ ] Confidence meter updates with annotations
- [ ] Test image predictions appear after 3+ annotations
- [ ] Database connection works (if Supabase configured)
- [ ] No critical errors in browser console

## Getting Started with the Game

Once installation is complete:

1. **Begin Training**: Start by drawing bounding boxes around Wally in the training images
2. **Negative Examples**: Use "No Wally Here" for images without Wally
3. **Watch AI Learn**: Observe the confidence meter increase as you provide more training data
4. **Test Predictions**: After 3+ annotations, see AI predictions on test images
5. **Level Progression**: Advance to next level when AI confidence reaches 85%+

## Support and Additional Resources

- **React Documentation**: https://react.dev/
- **TensorFlow.js Guide**: https://www.tensorflow.org/js
- **Supabase Documentation**: https://supabase.com/docs
- **Project Repository**: [Your GitHub Repository URL]

This comprehensive setup process ensures that users can successfully download, install, and run the Where's Wally AI Training Game from GitHub, regardless of their technical background.