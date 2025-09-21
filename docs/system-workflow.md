# System Workflow - Where's Wally AI Training Game

## Overview
This document describes the complete workflow of the Where's Wally AI Training Game, from user interaction to AI model training and prediction.

## 1. Game Initialization Workflow

```
User Opens Application
       ↓
GameContainer Component Loads
       ↓
┌─────────────────────────────────────────┐
│ Parallel Initialization:               │
│ 1. Load game images from assets        │
│ 2. Initialize AI model (MobileNet)     │
│ 3. Create Supabase training session    │
│ 4. Set up game state                   │
└─────────────────────────────────────────┘
       ↓
Display first training image
       ↓
User ready to start annotating
```

## 2. User Annotation Workflow

### Step 1: Image Interaction
```
User sees training image
       ↓
User clicks and drags on image
       ↓
BoundingBoxAnnotator captures coordinates
       ↓
┌─────────────────────────────────────────┐
│ Mouse Event Processing:                 │
│ • onMouseDown: Start drawing            │
│ • onMouseMove: Update box preview       │
│ • onMouseUp: Finalize bounding box      │
└─────────────────────────────────────────┘
       ↓
Bounding box coordinates calculated (%)
```

### Step 2: Annotation Processing
```
User completes bounding box OR clicks "No Wally"
       ↓
handleAnnotate() function triggered
       ↓
┌─────────────────────────────────────────┐
│ Parallel Processing:                    │
│ 1. Update UI state immediately          │
│ 2. Add example to AI model              │
│ 3. Record annotation in database        │
└─────────────────────────────────────────┘
       ↓
Auto-advance to next image
       ↓
Update progress indicators
```

## 3. AI Model Training Workflow

### Real-Time Learning Process
```
User Annotation Complete
       ↓
aiModelService.addExample() called
       ↓
┌─────────────────────────────────────────┐
│ Image Processing Pipeline:              │
│ 1. Load image from URL                  │
│ 2. Create HTML canvas element           │
│ 3. Crop to bounding box region          │
│ 4. Resize to standard dimensions        │
│ 5. Extract features with MobileNet      │
│ 6. Add to KNN classifier               │
└─────────────────────────────────────────┘
       ↓
Model example count updated
       ↓
Confidence meter position updated
       ↓
UI feedback provided to user
```

### Training Data Structure
```typescript
// Data flowing into AI model
interface TrainingExample {
  imageData: HTMLCanvasElement;
  label: "Wally" | "not_Wally";
  boundingBox: BoundingBox | null;
  features: tf.Tensor; // 1024-dimensional MobileNet features
}
```

## 4. Model Prediction Workflow

### Test Image Analysis
```
User clicks "Train Model" OR reaches 3+ annotations
       ↓
updateTestPredictions() triggered
       ↓
┌─────────────────────────────────────────┐
│ Grid Scanning Process:                  │
│ 1. Load test image                      │
│ 2. Divide into overlapping regions      │
│ 3. Extract features for each region     │
│ 4. Run KNN prediction on each region    │
│ 5. Find highest confidence region       │
│ 6. Determine final prediction           │
└─────────────────────────────────────────┘
       ↓
Display prediction result with confidence
       ↓
Update test image with visual feedback
```

### Prediction Algorithm
```javascript
// Grid scanning parameters
const scanSize = imageSize * 0.15;  // 15% of image
const step = scanSize * 0.5;        // 50% overlap

// For each grid position:
for (let x = 0; x <= width - scanSize; x += step) {
  for (let y = 0; y <= height - scanSize; y += step) {
    // Extract region → Get features → Predict → Store result
  }
}

// Find best prediction from all regions
const bestResult = results.reduce((best, current) => 
  current.confidence > best.confidence ? current : best
);
```

## 5. Database Persistence Workflow

### Session Management
```
Game Initialization
       ↓
Check user authentication
       ↓
Create training session in Supabase
       ↓
┌─────────────────────────────────────────┐
│ Session Data:                           │
│ • user_id: Current user                 │
│ • category: "Wally"                     │
│ • level: Current game level             │
│ • created_at: Timestamp                 │
└─────────────────────────────────────────┘
       ↓
Session ID stored for future annotations
```

### Annotation Storage
```
User Completes Annotation
       ↓
trainingService.recordAnnotation() called
       ↓
┌─────────────────────────────────────────┐
│ Database Record:                        │
│ • session_id: Link to training session  │
│ • image_url: Source image URL           │
│ • image_id: Unique identifier           │
│ • has_object: Boolean (Wally present)   │
│ • bounding_box: JSON coordinates        │
│ • actual_label: Ground truth            │
└─────────────────────────────────────────┘
       ↓
Data persisted with Row Level Security
```

## 6. Progress Tracking Workflow

### Confidence Building System
```
Annotation Count: 0
       ↓
Red ball position: 15%
Message: "Learning basic features..."

Annotation Count: 3
       ↓
Red ball position: 45%
Message: "Getting better at recognition..."

Annotation Count: 7
       ↓
Red ball position: 85%
Message: "High confidence achieved!"
       ↓
Achievement popup triggered
```

### Level Progression
```
User reaches 7+ annotations
       ↓
Model accuracy ≥ 70%
       ↓
"Next Level" button enabled
       ↓
User clicks "Next Level"
       ↓
┌─────────────────────────────────────────┐
│ Level Transition:                       │
│ 1. Show achievement popup (if 7+ annot) │
│ 2. Reset game state                     │
│ 3. Load new image set                   │
│ 4. Increment level counter              │
│ 5. Reset AI model                       │
└─────────────────────────────────────────┘
       ↓
New level begins
```

## 7. Error Handling Workflow

### AI Model Fallback
```
MobileNet Load Attempt
       ↓
Success? → Continue with real AI
       ↓
Failure? → Switch to simulation mode
       ↓
┌─────────────────────────────────────────┐
│ Simulation Mode:                        │
│ • Use mathematical confidence formulas  │
│ • Simulate realistic AI behavior        │
│ • Maintain user experience              │
└─────────────────────────────────────────┘
       ↓
Game continues seamlessly
```

### Database Connection Issues
```
Supabase Connection Test
       ↓
Success? → Enable real training mode
       ↓
Failure? → Local-only mode
       ↓
┌─────────────────────────────────────────┐
│ Local Mode:                             │
│ • Store data in browser memory          │
│ • Disable persistence features          │
│ • Continue with AI training             │
└─────────────────────────────────────────┘
       ↓
User experience preserved
```

## 8. Performance Optimization Workflow

### Memory Management
```
TensorFlow.js Operation
       ↓
Create tensor for processing
       ↓
Process through MobileNet
       ↓
Extract features
       ↓
tensor.dispose() // Critical cleanup
       ↓
Prevent memory leaks
```

### Image Loading Optimization
```
Image Request
       ↓
Check if in viewport
       ↓
Load only visible images
       ↓
Cache in browser memory
       ↓
Reuse for subsequent operations
```

## 9. User Experience Workflow

### Feedback Loop
```
┌─────────────────────────────────────────┐
│                                         │
│  User Action → Immediate UI Feedback →  │
│       ↑                    ↓            │
│  Achievement ← AI Learning Process      │
│                                         │
└─────────────────────────────────────────┘
```

### Progressive Disclosure
```
New User
       ↓
Simple annotation interface
       ↓
Basic instructions shown
       ↓
As user progresses:
• More detailed feedback
• Advanced metrics
• Achievement celebrations
       ↓
Expert user experience
```

## 10. Technical Architecture Workflow

### Component Communication
```
GameContainer (State Manager)
       ↓
┌─────────────────┬─────────────────┐
│   Header        │  AnnotationPanel │
│   (Display)     │  (User Input)    │
└─────────────────┴─────────────────┘
       ↓
┌─────────────────┬─────────────────┐
│  AIModelService │ TrainingService  │
│  (ML Processing)│ (Data Storage)   │
└─────────────────┴─────────────────┘
```

This workflow ensures a smooth, educational, and engaging user experience while maintaining robust AI training and data management capabilities.