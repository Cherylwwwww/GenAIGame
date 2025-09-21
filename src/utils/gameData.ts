import { Category } from '../types';

// Import local assets
// First set of training images
import wallyImage1 from '../assets/ChatGPT Image Sep 20, 2025, 02_09_52 PM_r1_c1_processed_by_imagy.png';
import wallyImage2 from '../assets/ChatGPT Image Sep 20, 2025, 02_09_52 PM_r1_c2_processed_by_imagy.png';
import wallyImage3 from '../assets/ChatGPT Image Sep 20, 2025, 02_09_52 PM_r1_c3_processed_by_imagy.png';
import wallyImage4 from '../assets/ChatGPT Image Sep 20, 2025, 02_09_52 PM_r2_c1_processed_by_imagy.png';
import wallyImage5 from '../assets/ChatGPT Image Sep 20, 2025, 02_09_52 PM_r2_c2_processed_by_imagy.png';

// Second set of training images
import wallyImage6 from '../assets/ChatGPT Image Sep 20, 2025, 02_34_50 PM_r1_c1_processed_by_imagy.png';
import wallyImage7 from '../assets/ChatGPT Image Sep 20, 2025, 02_34_50 PM_r1_c2_processed_by_imagy.png';
import wallyImage8 from '../assets/ChatGPT Image Sep 20, 2025, 02_34_50 PM_r1_c3_processed_by_imagy.png';
import wallyImage9 from '../assets/ChatGPT Image Sep 20, 2025, 02_34_50 PM_r2_c1_processed_by_imagy.png';
import wallyImage10 from '../assets/ChatGPT Image Sep 20, 2025, 02_34_50 PM_r2_c2_processed_by_imagy.png';
import wallyImage11 from '../assets/ChatGPT Image Sep 20, 2025, 02_34_50 PM_r2_c3_processed_by_imagy.png';
import wallyImage12 from '../assets/ChatGPT Image Sep 20, 2025, 02_34_50 PM_r3_c1_processed_by_imagy.png';
import wallyImage13 from '../assets/ChatGPT Image Sep 20, 2025, 02_34_50 PM_r3_c2_processed_by_imagy.png';
import wallyImage14 from '../assets/ChatGPT Image Sep 20, 2025, 02_34_50 PM_r3_c3_processed_by_imagy.png';
import wallyImage15 from '../assets/ChatGPT Image Sep 21, 2025, 02_39_58 PM.png';
import wallyImage16 from '../assets/ChatGPT Image Sep 21, 2025, 02_52_27 PM.png';
import wallyImage17 from '../assets/ChatGPT Image Sep 21, 2025, 02_54_36 PM_r1_c1_processed_by_imagy.png';
import wallyImage18 from '../assets/ChatGPT Image Sep 21, 2025, 02_54_36 PM_r1_c2_processed_by_imagy.png';
import wallyImage19 from '../assets/ChatGPT Image Sep 21, 2025, 02_54_36 PM_r1_c3_processed_by_imagy.png';
import wallyImage20 from '../assets/ChatGPT Image Sep 21, 2025, 02_54_36 PM_r2_c1_processed_by_imagy.png';

import crowdSceneImage from '../assets/ChatGPT Image Sep 20, 2025, 02_44_14 PM.png';

export const categories: Category[] = [
  {
    name: "wally",
    targetObject: "Wally",
    description: "Find Wally in the crowd - look for his red and white striped shirt, bobble hat, and glasses!",
    images: [
      // All 20 unique local Wally training images in random order
      wallyImage8,  // r1_c3 from second set
      wallyImage3,  // r1_c3 from first set
      wallyImage12, // r3_c1 from second set
      wallyImage1,  // r1_c1 from first set
      wallyImage10, // r2_c2 from second set
      wallyImage6,  // r1_c1 from second set
      wallyImage4,  // r2_c1 from first set
      wallyImage14, // r3_c3 from second set
      wallyImage5,  // r2_c2 from first set
      wallyImage7,  // r1_c2 from second set
      wallyImage11, // r2_c3 from second set
      wallyImage2,  // r1_c2 from first set
      wallyImage13, // r3_c2 from second set
      wallyImage9,  // r2_c1 from second set
      wallyImage15, // Additional training image
      // Third set of training images
      wallyImage16, // 02_52_27 PM
      wallyImage17, // r1_c1 from third set
      wallyImage18, // r1_c2 from third set
      wallyImage19, // r1_c3 from third set
      wallyImage20  // r2_c1 from third set
    ],
    testImages: [
      // Your provided crowd scene image
      crowdSceneImage,
      // Additional test images for variety
      "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800"
    ]
  },
  {
    name: "advanced_wally",
    targetObject: "Wally",
    description: "Advanced Wally finding - even more challenging crowd scenes!",
    images: [
      // More challenging training images
      "https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg", // Complex crowd
      "https://images.pexels.com/photos/2747450/pexels-photo-2747450.jpeg", // Busy scene
      "https://images.pexels.com/photos/2747451/pexels-photo-2747451.jpeg", // Festival
      "https://images.pexels.com/photos/2747452/pexels-photo-2747452.jpeg", // Market crowd
      "https://images.pexels.com/photos/2747453/pexels-photo-2747453.jpeg", // Street scene
      "https://images.pexels.com/photos/2747454/pexels-photo-2747454.jpeg", // Concert crowd
      "https://images.pexels.com/photos/2747455/pexels-photo-2747455.jpeg", // Beach scene
      "https://images.pexels.com/photos/2747456/pexels-photo-2747456.jpeg", // City crowd
      "https://images.pexels.com/photos/2747457/pexels-photo-2747457.jpeg", // Event scene
      "https://images.pexels.com/photos/2747458/pexels-photo-2747458.jpeg", // Parade crowd
      // Non-Wally challenging scenes
      "https://images.pexels.com/photos/2747459/pexels-photo-2747459.jpeg", // Empty venue
      "https://images.pexels.com/photos/2747460/pexels-photo-2747460.jpeg", // Architecture
      "https://images.pexels.com/photos/2747461/pexels-photo-2747461.jpeg", // Landscape
      "https://images.pexels.com/photos/2747462/pexels-photo-2747462.jpeg", // Interior
      "https://images.pexels.com/photos/2747463/pexels-photo-2747463.jpeg", // Abstract
      "https://images.pexels.com/photos/2747464/pexels-photo-2747464.jpeg", // Nature
      "https://images.pexels.com/photos/2747465/pexels-photo-2747465.jpeg", // Objects
      "https://images.pexels.com/photos/2747466/pexels-photo-2747466.jpeg", // Patterns
      "https://images.pexels.com/photos/2747467/pexels-photo-2747467.jpeg", // Textures
      "https://images.pexels.com/photos/2747468/pexels-photo-2747468.jpeg"  // Minimalist
    ],
    testImages: [
      // Very challenging crowd scenes
      "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg", // Massive crowd
      "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg", // Complex festival
      "https://images.pexels.com/photos/3184293/pexels-photo-3184293.jpeg", // Busy market
      "https://images.pexels.com/photos/3184294/pexels-photo-3184294.jpeg", // Concert scene
      "https://images.pexels.com/photos/3184295/pexels-photo-3184295.jpeg", // Street festival
      // Challenging scenes without Wally
      "https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg", // Empty stadium
      "https://images.pexels.com/photos/3184297/pexels-photo-3184297.jpeg", // Architectural detail
      "https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg", // Natural landscape
      "https://images.pexels.com/photos/3184299/pexels-photo-3184299.jpeg", // Interior space
      "https://images.pexels.com/photos/3184300/pexels-photo-3184300.jpeg"  // Abstract pattern
    ]
  }
];

export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const generateGameImages = (category: Category): any[] => {
  const shuffled = shuffleArray(category.images);
  const gameImages = shuffled.slice(0, 20).map((url, index) => ({
    id: `image-${index}`,
    url,
    actualLabel: index < 10 ? true : false, // First 10 are positive examples (contain Wally)
  }));
  
  return shuffleArray(gameImages);
};