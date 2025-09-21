# Data Flow Architecture - Where's Wally AI Training Game

## Overview
This document describes the complete data flow architecture for the Where's Wally AI Training Game, showing how data moves through the system from user interactions to AI model training and predictions.

## 1. System Components Data Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   AI Engine     │
│   (React)       │    │   (Backend)     │    │ (TensorFlow.js) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │◄──────────────────────┼──────────────────────►│
         │                       │                       │
         │◄──────────────────────┤                       │
         │                       │                       │
```

## 2. User Annotation Data Flow

### Step 1: Image Loading
```
User Opens Game
       ↓
GameContainer.tsx initializes
       ↓
generateRandomImages() called
       ↓
Images loaded from assets/URLs
       ↓
GameState updated with image array
```

### Step 2: User Annotation Process
```
User draws bounding box on image
       ↓
BoundingBoxAnnotator captures coordinates
       ↓
handleAnnotate() called with BoundingBox data
       ↓
┌─────────────────────────────────────────┐
│ Parallel Processing:                    │
│ 1. Update UI state immediately          │
│ 2. Send to AI model for training        │
│ 3. Store in Supabase database          │
└─────────────────────────────────────────┘
```

### Step 3: Data Storage Flow
```javascript
// Frontend → Supabase
const annotationData = {
  imageId: string,
  imageUrl: string,
  hasObject: boolean,
  boundingBox: {x, y, width, height},
  actualLabel: boolean
}

trainingService.recordAnnotation(annotationData)
       ↓
Supabase Edge Function
       ↓
Database INSERT into annotations table
```

## 3. AI Model Training Data Flow

### Real-time Training Pipeline
```
User Annotation Complete
       ↓
aiModelService.addExample() called
       ↓
┌─────────────────────────────────────────┐
│ Image Processing Pipeline:              │
│ 1. Load image from URL                  │
│ 2. Crop to bounding box region          │
│ 3. Resize to standard dimensions        │
│ 4. Extract features with MobileNet      │
│ 5. Add to KNN classifier               │
└─────────────────────────────────────────┘
       ↓
Model example count updated
       ↓
UI confidence meter updated
```

### Training Data Structure
```typescript
// Data flowing into AI model
interface TrainingExample {
  imageData: HTMLCanvasElement | HTMLImageElement;
  label: string; // "Wally" or "not_Wally"
  boundingBox: BoundingBox | null;
  features: tf.Tensor; // MobileNet features
}
```

## 4. Model Prediction Data Flow

### Test Image Analysis Pipeline
```
handleTrainModel() triggered
       ↓
Test image loaded
       ↓
┌─────────────────────────────────────────┐
│ Grid Scanning Process:                  │
│ 1. Divide image into overlapping regions│
│ 2. Extract features for each region     │
│ 3. Run KNN prediction on each region    │
│ 4. Find highest confidence region       │
│ 5. Determine final prediction           │
└─────────────────────────────────────────┘
       ↓
Prediction result with confidence
       ↓
UI updated with visual feedback
```

### Prediction Data Structure
```typescript
interface PredictionResult {
  label: string;
  confidence: number;
  boundingBox?: BoundingBox;
  scanResults: Array<{
    region: BoundingBox;
    confidence: number;
    label: string;
  }>;
}
```

## 5. Database Data Flow

### Session Management
```
Game Start
       ↓
createSession() called
       ↓
INSERT into training_sessions
       ↓
Session ID returned and stored
       ↓
All subsequent annotations linked to session
```

### Training Job Flow
```
User clicks "Train Model"
       ↓
Edge Function: train-model
       ↓
┌─────────────────────────────────────────┐
│ Training Job Process:                   │
│ 1. Create training_jobs record          │
│ 2. Calculate accuracy from annotations  │
│ 3. Determine model state                │
│ 4. Update job with results              │
└─────────────────────────────────────────┘
       ↓
Results returned to frontend
       ↓
UI updated with accuracy metrics
```

## 6. State Management Data Flow

### GameState Updates
```typescript
// Central state management in GameContainer
const [gameState, setGameState] = useState<GameState>({
  currentLevel: 1,
  currentCategory: "Wally",
  images: [],
  modelAccuracy: 30,
  annotatedCount: 0,
  isTraining: false,
  hasTrainedModel: false,
  score: 0,
  modelState: 'underfitting'
});

// State update flow
User Action → Handler Function → setState → UI Re-render
```

### Reactive Updates
```
Annotation Added
       ↓
gameState.annotatedCount++
       ↓
Confidence meter position updated
       ↓
Button states updated
       ↓
Achievement popup triggered (if count >= 7)
```

## 7. Error Handling Data Flow

### Graceful Degradation
```
AI Model Load Failure
       ↓
aiModeStatus set to 'simulation'
       ↓
Fallback to simulation mode
       ↓
User experience continues seamlessly
```

### Database Connection Issues
```
Supabase Connection Failed
       ↓
isUsingRealTraining set to false
       ↓
Local-only mode activated
       ↓
Game continues without persistence
```

## 8. Performance Optimization Data Flow

### Lazy Loading
```
Image Request
       ↓
Check if image in viewport
       ↓
Load only visible images
       ↓
Cache loaded images
```

### Memory Management
```
TensorFlow.js Operations
       ↓
Create tensors for processing
       ↓
Process through model
       ↓
Dispose tensors immediately
       ↓
Prevent memory leaks
```

## 9. Real-time Feedback Loop

### Continuous Learning Cycle
```
┌─────────────────────────────────────────┐
│                                         │
│  User Annotation → AI Training →        │
│       ↑                    ↓            │
│  UI Feedback ← Model Prediction         │
│                                         │
└─────────────────────────────────────────┘
```

### Confidence Building Process
```
Annotation 1-3: "Learning basic features..."
       ↓
Annotation 4-6: "Getting better at recognition..."
       ↓
Annotation 7+: "High confidence achieved!"
       ↓
Achievement popup triggered
```

## 10. Data Security Flow

### Authentication Flow
```
User Access → Supabase Auth Check → JWT Token → RLS Policies → Data Access
```

### Data Isolation
```
User ID → Session Filter → User's Data Only → Secure Access
```

This data flow architecture ensures efficient, secure, and scalable data processing throughout the entire user experience.