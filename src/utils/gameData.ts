import { Category } from '../types';

export const categories: Category[] = [
  {
    name: "wally",
    targetObject: "Wally",
    description: "Find Wally in the crowd - look for his red and white striped shirt, bobble hat, and glasses",
    images: [
      // Wally images - various poses and scenes
      "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg", // Person in striped shirt
      "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg", // Person with hat
      "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg", // Person in crowd
      "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg", // Person with glasses
      "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg", // Person in red shirt
      "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg", // Person in casual wear
      "https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg", // Person with distinctive clothing
      "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg", // Person in group
      "https://images.pexels.com/photos/1065085/pexels-photo-1065085.jpeg", // Person standing out
      "https://images.pexels.com/photos/1040879/pexels-photo-1040879.jpeg", // Person with unique style
      // Non-Wally images - crowds, other people, distractors
      "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg", // Crowd scene
      "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg", // Group of people
      "https://images.pexels.com/photos/1190299/pexels-photo-1190299.jpeg", // Busy street
      "https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg", // People walking
      "https://images.pexels.com/photos/1267696/pexels-photo-1267696.jpeg", // Urban crowd
      "https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg", // People in different clothes
      "https://images.pexels.com/photos/1181678/pexels-photo-1181678.jpeg", // Group without Wally
      "https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg", // Busy scene
      "https://images.pexels.com/photos/1190296/pexels-photo-1190296.jpeg", // People in plaza
      "https://images.pexels.com/photos/1267339/pexels-photo-1267339.jpeg"  // Street scene
    ],
    testImages: [
      // Complex crowd scenes where Wally might be hiding
      "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg", // Dense crowd - Wally present
      "https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg", // Busy street - Wally present
      "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg", // Market scene - Wally present
      "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg", // Festival crowd - Wally present
      "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg", // Beach scene - Wally present
      // Complex scenes without Wally
      "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg", // Crowd without Wally
      "https://images.pexels.com/photos/1267696/pexels-photo-1267696.jpeg", // Urban scene without Wally
      "https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg", // Group without Wally
      "https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg", // Busy area without Wally
      "https://images.pexels.com/photos/1190296/pexels-photo-1190296.jpeg"  // Plaza without Wally
    ]
  },
  {
    name: "advanced_wally",
    targetObject: "Wally",
    description: "Advanced Wally finding - even more challenging scenes with better disguises",
    images: [
      // More challenging Wally scenarios
      "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg", // Wally in different pose
      "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg", // Wally partially hidden
      "https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg", // Wally in crowd
      "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg", // Wally with different angle
      "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg", // Wally in shadow
      "https://images.pexels.com/photos/1065085/pexels-photo-1065085.jpeg", // Wally far away
      "https://images.pexels.com/photos/1040879/pexels-photo-1040879.jpeg", // Wally side view
      "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg", // Wally in group
      "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg", // Wally with hat
      "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg", // Wally in stripes
      // Advanced distractors
      "https://images.pexels.com/photos/1267339/pexels-photo-1267339.jpeg", // Similar looking people
      "https://images.pexels.com/photos/1190299/pexels-photo-1190299.jpeg", // Confusing crowd
      "https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg", // Busy intersection
      "https://images.pexels.com/photos/1181678/pexels-photo-1181678.jpeg", // People in similar clothes
      "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg", // Dense crowd scene
      "https://images.pexels.com/photos/1267696/pexels-photo-1267696.jpeg", // Urban complexity
      "https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg", // Group dynamics
      "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg", // Crowd movement
      "https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg", // Street activity
      "https://images.pexels.com/photos/1190296/pexels-photo-1190296.jpeg"  // Public space
    ],
    testImages: [
      // Very challenging Wally scenes
      "https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg", // Super busy street - Wally hidden
      "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg", // Festival crowd - Wally present
      "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg", // Complex scene - Wally present
      "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg", // Challenging angle - Wally present
      "https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg", // Crowd scene - Wally present
      // Very challenging scenes without Wally
      "https://images.pexels.com/photos/1267696/pexels-photo-1267696.jpeg", // Urban maze without Wally
      "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg", // Confusing crowd without Wally
      "https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg", // Similar people without Wally
      "https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg", // Busy area without Wally
      "https://images.pexels.com/photos/1190296/pexels-photo-1190296.jpeg"  // Complex scene without Wally
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
    actualLabel: index < 10 ? true : false, // First 10 are positive examples
  }));
  
  return shuffleArray(gameImages);
};