import * as mobilenet from '@tensorflow-models/mobilenet';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import * as tf from '@tensorflow/tfjs';
import { BoundingBox } from '../types';

export class AIModelService {
  private net: mobilenet.MobileNet | null = null;
  private classifier = knnClassifier.create();
  private isModelLoaded = false;
  private exampleCount = 0;

  async loadModel(): Promise<void> {
    if (this.isModelLoaded) return;
    
    try {
      console.log('🤖 Loading MobileNet model...');
      
      // Initialize TensorFlow.js backend
      await tf.setBackend('webgl');
      await tf.ready();
      console.log('✅ TensorFlow.js backend initialized');
      
      // Try to load MobileNet with retry logic
      this.net = await this.loadMobileNetWithRetry();
      this.isModelLoaded = true;
      console.log('✅ MobileNet loaded successfully!');
    } catch (error) {
      console.error('❌ Failed to load MobileNet:', error);
      throw error;
    }
  }

  private async loadMobileNetWithRetry(maxRetries: number = 3): Promise<mobilenet.MobileNet> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Loading MobileNet (attempt ${attempt}/${maxRetries})...`);
        
        // Try loading with default settings first
        const net = await mobilenet.load();
        console.log('✅ MobileNet loaded successfully on attempt', attempt);
        return net;
        
      } catch (error) {
        console.warn(`⚠️ MobileNet load attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          // On final attempt, try with alternative configuration
          try {
            console.log('🔄 Trying alternative MobileNet configuration...');
            const net = await mobilenet.load({
              version: 1,
              alpha: 0.25 // Smaller model, faster download
            });
            console.log('✅ MobileNet loaded with alternative config');
            return net;
          } catch (altError) {
            console.error('❌ All MobileNet load attempts failed');
            throw new Error(`Failed to load MobileNet after ${maxRetries} attempts. Please check your internet connection and try again.`);
          }
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Unexpected error in loadMobileNetWithRetry');
  }

  async addExample(imageUrl: string, boundingBox: BoundingBox | null, label: string): Promise<void> {
    if (!this.net) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    try {
      // Create image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      let processedImg: HTMLImageElement | HTMLCanvasElement = img;

      // If there's a bounding box, crop the image
      if (boundingBox) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calculate actual pixel coordinates
        const cropX = (boundingBox.x / 100) * img.width;
        const cropY = (boundingBox.y / 100) * img.height;
        const cropWidth = (boundingBox.width / 100) * img.width;
        const cropHeight = (boundingBox.height / 100) * img.height;
        
        // Ensure optimal size for Wally feature extraction
        const targetSize = 224; // MobileNet's optimal input size
        canvas.width = targetSize;
        canvas.height = targetSize;
        
        // Apply preprocessing for better Wally detection
        ctx.fillStyle = '#f0f0f0'; // Neutral background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw cropped image centered and scaled
        const scale = Math.min(targetSize / cropWidth, targetSize / cropHeight);
        const scaledWidth = cropWidth * scale;
        const scaledHeight = cropHeight * scale;
        const offsetX = (targetSize - scaledWidth) / 2;
        const offsetY = (targetSize - scaledHeight) / 2;
        
        ctx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,
          offsetX, offsetY, scaledWidth, scaledHeight
        );
        
        // Apply contrast enhancement for red-white stripes
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this.enhanceWallyFeatures(imageData);
        ctx.putImageData(imageData, 0, 0);
        
        processedImg = canvas;
      } else {
        // For negative examples, use full image but resize to optimal size
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = 224;
        canvas.height = 224;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        processedImg = canvas;
      }

      // Extract features with MobileNet
      const activation = this.net.infer(processedImg, true);
      
      // Add example to KNN classifier
      this.classifier.addExample(activation, label);
      this.exampleCount++;
      
      console.log(`✅ Added Wally training example: ${label === 'Wally' ? 'Found Wally with red stripes & bobble hat' : 'No Wally in this image'} (Total: ${this.exampleCount})`);
      
      // Clean up tensor
      activation.dispose();
      
    } catch (error) {
      console.error('❌ Failed to add example:', error);
      throw error;
    }
  }

  async predict(imageUrl: string): Promise<{ label: string; confidence: number; confidences: Record<string, number> } | null> {
    if (!this.net) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    if (this.classifier.getNumClasses() === 0) {
      console.log('⚠️ No training examples available for prediction');
      return null;
    }

    try {
      // Create image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Preprocess image for better Wally detection
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = 224;
      canvas.height = 224;
      
      // Draw and preprocess the full image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Apply the same preprocessing as training
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      this.enhanceWallyFeatures(imageData);
      ctx.putImageData(imageData, 0, 0);
      
      // Extract features from preprocessed image
      const activation = this.net.infer(canvas, true);
      
      // Make prediction with more neighbors for stability
      const result = await this.classifier.predictClass(activation, Math.min(this.exampleCount, 7));
      
      console.log('🔮 Wally Detection Result:', {
        prediction: result.label,
        confidence: Math.round(result.confidences[result.label] * 100) + '%',
        allConfidences: Object.entries(result.confidences).map(([label, conf]) => 
          `${label}: ${Math.round(conf * 100)}%`
        ).join(', ')
      });
      
      // Clean up tensor
      activation.dispose();
      
      return {
        label: result.label,
        confidence: result.confidences[result.label],
        confidences: result.confidences
      };
      
    } catch (error) {
      console.error('❌ Prediction failed:', error);
      return null;
    }
  }

  getExampleCount(): number {
    return this.exampleCount;
  }

  getNumClasses(): number {
    return this.classifier.getNumClasses();
  }

  isLoaded(): boolean {
    return this.isModelLoaded && this.net !== null;
  }

  reset(): void {
    this.classifier.dispose();
    this.classifier = knnClassifier.create();
    this.exampleCount = 0;
    console.log('🔄 AI model reset');
  }

  getConfidenceMessage(confidence: number, exampleCount: number): string {
    // More realistic confidence messages based on AI limitations
    if (exampleCount < 2) {
      return "🤖 Need more examples to learn Wally's features...";
    }
    
    if (exampleCount < 4) {
      return "🔍 Learning Wally's red-white stripes and bobble hat...";
    }
    
    if (exampleCount < 6) {
      return "📚 Studying patterns - need more examples for accuracy...";
    }
    
    // Adjust confidence based on training quality
    const trainingQuality = Math.min(exampleCount / 10, 1);
    const adjustedConfidence = confidence * trainingQuality;
    
    if (adjustedConfidence < 0.3) {
      return "❓ Very uncertain - might need better training examples...";
    } else if (adjustedConfidence < 0.5) {
      return "🤔 Low confidence - looking for red stripes and bobble hat...";
    } else if (adjustedConfidence < 0.7) {
      return "🧐 Moderate confidence - detecting some Wally-like features...";
    } else if (adjustedConfidence < 0.85) {
      return "😊 Good confidence - found red-white stripes and accessories!";
    } else {
      return "🎯 High confidence - strong Wally features detected!";
    }
  }
  
  // New method to enhance Wally-specific features
  private enhanceWallyFeatures(imageData: ImageData): void {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Enhance red-white stripe patterns
      const isRed = r > 150 && g < 100 && b < 100;
      const isWhite = r > 200 && g > 200 && b > 200;
      
      if (isRed) {
        // Boost red channel for red stripes
        data[i] = Math.min(255, r * 1.2);
        data[i + 1] = Math.max(0, g * 0.8);
        data[i + 2] = Math.max(0, b * 0.8);
      } else if (isWhite) {
        // Keep white stripes bright
        data[i] = Math.min(255, r * 1.1);
        data[i + 1] = Math.min(255, g * 1.1);
        data[i + 2] = Math.min(255, b * 1.1);
      }
      
      // Enhance contrast overall
      const brightness = (r + g + b) / 3;
      const contrast = 1.1;
      const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
      
      data[i] = Math.max(0, Math.min(255, factor * (r - 128) + 128));
      data[i + 1] = Math.max(0, Math.min(255, factor * (g - 128) + 128));
      data[i + 2] = Math.max(0, Math.min(255, factor * (b - 128) + 128));
    }
  }
}

export const aiModelService = new AIModelService();