import { Category } from '../types';

export const categories: Category[] = [
  {
    name: "wally",
    targetObject: "Wally",
    description: "Find Wally in the crowd - look for his red and white striped shirt, bobble hat, and glasses!",
    images: [
      // Training images with people in striped shirts (Wally-like characters)
      "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg", // Person in striped shirt
      "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg", // Person with glasses
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg", // Person in casual wear
      "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg", // Person in striped clothing
      "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg", // Person with hat
      "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg", // Person in red shirt
      "https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg", // Person in casual outfit
      "https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg", // Person with accessories
      "https://images.pexels.com/photos/1681012/pexels-photo-1681012.jpeg", // Person in distinctive clothing
      "https://images.pexels.com/photos/1222273/pexels-photo-1222273.jpeg", // Person in crowd-like setting
      // Non-Wally images (people without Wally characteristics)
      "https://images.pexels.com/photos/1040883/pexels-photo-1040883.jpeg", // Person in plain clothes
      "https://images.pexels.com/photos/1239293/pexels-photo-1239293.jpeg", // Person in different style
      "https://images.pexels.com/photos/1681014/pexels-photo-1681014.jpeg", // Person in business attire
      "https://images.pexels.com/photos/1222275/pexels-photo-1222275.jpeg", // Person in dark clothing
      "https://images.pexels.com/photos/1043475/pexels-photo-1043475.jpeg", // Person in different outfit
      "https://images.pexels.com/photos/1040885/pexels-photo-1040885.jpeg", // Person without distinctive features
      "https://images.pexels.com/photos/1239295/pexels-photo-1239295.jpeg", // Person in regular clothes
      "https://images.pexels.com/photos/1681016/pexels-photo-1681016.jpeg", // Person in different style
      "https://images.pexels.com/photos/1222277/pexels-photo-1222277.jpeg", // Person in casual wear
      "https://images.pexels.com/photos/1043477/pexels-photo-1043477.jpeg"  // Person in different outfit
    ],
    testImages: [
      // Complex crowd scenes where Wally might be hiding
      "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg", // Crowd scene
      "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg", // Busy street scene
      "https://images.pexels.com/photos/1190299/pexels-photo-1190299.jpeg", // Festival crowd
      "https://images.pexels.com/photos/1190300/pexels-photo-1190300.jpeg", // Market scene
      "https://images.pexels.com/photos/1190301/pexels-photo-1190301.jpeg", // Beach crowd
      // Complex scenes without Wally
      "https://images.pexels.com/photos/1190302/pexels-photo-1190302.jpeg", // Empty landscape
      "https://images.pexels.com/photos/1190303/pexels-photo-1190303.jpeg", // Building scene
      "https://images.pexels.com/photos/1190304/pexels-photo-1190304.jpeg", // Nature scene
      "https://images.pexels.com/photos/1190305/pexels-photo-1190305.jpeg", // Indoor scene
      "https://images.pexels.com/photos/1190306/pexels-photo-1190306.jpeg"  // Abstract scene
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