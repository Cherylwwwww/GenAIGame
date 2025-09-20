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
        
        // Ensure minimum size for better feature extraction
        canvas.width = Math.max(cropWidth, 64); // Larger minimum for better Wally detection
        canvas.height = Math.max(cropHeight, 64);
        
        ctx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, canvas.width, canvas.height
        );
        
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

      // Extract features
      const activation = this.net.infer(img, true);
      
      // Make prediction
      const result = await this.classifier.predictClass(activation, 5); // Get more predictions for better analysis
      
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
    // Don't show confident messages with too few examples
    if (exampleCount < 3) {
      return "🤖 Learning to spot Wally's red-white striped shirt and bobble hat...";
    }
    
    if (exampleCount < 5) {
      return "🤔 Studying Wally's round glasses, blue jeans, and brown shoes...";
    }
    
    // Add more uncertainty when sample size is small  
    const uncertainty = Math.max(0, (8 - exampleCount) * 0.06);
    const adjustedConfidence = Math.max(0, confidence - uncertainty);
    
    if (adjustedConfidence < 0.4) {
      return "🤔 Where's Wally? Having trouble spotting his distinctive red-white striped shirt...";
    } else if (adjustedConfidence < 0.6) {
      return "🤷‍♂️ Hmm... maybe I see a bobble hat and glasses? Not quite sure...";
    } else if (adjustedConfidence < 0.75) {
      return "🧐 Getting better at recognizing horizontal red-white stripes and round glasses...";
    } else if (adjustedConfidence < 0.85) {
      return "😊 I can spot Wally's striped shirt, bobble hat, and round black glasses!";
    } else if (adjustedConfidence < 0.92) {
      return "😎 Found the red-white horizontal stripes, blue jeans, and brown shoes!";
    } else {
      return "🎯 Found Wally! Red-white striped shirt, bobble hat, round glasses, and blue jeans - perfect match!";
    }
  }
}

export const aiModelService = new AIModelService();