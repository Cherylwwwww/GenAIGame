import { Category } from '../types';

export const categories: Category[] = [
  {
    name: "cats",
    targetObject: "cats",
    description: "Identify whether the image contains cats",
    images: [
      "https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg",
      "https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg",
      "https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg",
      "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg",
      "https://images.pexels.com/photos/596590/pexels-photo-596590.jpeg",
      "https://images.pexels.com/photos/774731/pexels-photo-774731.jpeg",
      "https://images.pexels.com/photos/1056251/pexels-photo-1056251.jpeg",
      "https://images.pexels.com/photos/156934/pexels-photo-156934.jpeg",
      "https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg",
      "https://images.pexels.com/photos/1643457/pexels-photo-1643457.jpeg",
      // Non-cat images
      "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",
      "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg",
      "https://images.pexels.com/photos/164186/pexels-photo-164186.jpeg",
      "https://images.pexels.com/photos/302743/pexels-photo-302743.jpeg",
      "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg",
      "https://images.pexels.com/photos/371589/pexels-photo-371589.jpeg",
      "https://images.pexels.com/photos/158028/bellingrath-gardens-alabama-landscape-scenic-158028.jpeg",
      "https://images.pexels.com/photos/460621/pexels-photo-460621.jpeg",
      "https://images.pexels.com/photos/135620/pexels-photo-135620.jpeg",
      "https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg"
    ],
    testImages: [
      // Complex scenes with cats
      "https://images.pexels.com/photos/2071882/pexels-photo-2071882.jpeg", // Cat in garden
      "https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg", // Cat on street
      "https://images.pexels.com/photos/1276553/pexels-photo-1276553.jpeg", // Cat in room
      "https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg", // Cat with furniture
      "https://images.pexels.com/photos/1444321/pexels-photo-1444321.jpeg", // Cat outdoors
      // Complex scenes without cats
      "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg", // Dog in park
      "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg", // Living room
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg", // Kitchen scene
      "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg", // Outdoor scene
      "https://images.pexels.com/photos/1438761/pexels-photo-1438761.jpeg"  // Street scene
    ]
  },
  {
    name: "dogs",
    targetObject: "dogs",
    description: "Identify whether the image contains dogs",
    images: [
      "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",
      "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg",
      "https://images.pexels.com/photos/551628/pexels-photo-551628.jpeg",
      "https://images.pexels.com/photos/356378/pexels-photo-356378.jpeg",
      "https://images.pexels.com/photos/374906/pexels-photo-374906.jpeg",
      "https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg",
      "https://images.pexels.com/photos/58997/pexels-photo-58997.jpeg",
      "https://images.pexels.com/photos/164186/pexels-photo-164186.jpeg",
      "https://images.pexels.com/photos/237988/pexels-photo-237988.jpeg",
      "https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg",
      // Non-dog images
      "https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg",
      "https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg",
      "https://images.pexels.com/photos/302743/pexels-photo-302743.jpeg",
      "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg",
      "https://images.pexels.com/photos/371589/pexels-photo-371589.jpeg",
      "https://images.pexels.com/photos/158028/bellingrath-gardens-alabama-landscape-scenic-158028.jpeg",
      "https://images.pexels.com/photos/460621/pexels-photo-460621.jpeg",
      "https://images.pexels.com/photos/135620/pexels-photo-135620.jpeg",
      "https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg",
      "https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg"
    ],
    testImages: [
      // Complex scenes with dogs
      "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg", // Dog in living room
      "https://images.pexels.com/photos/1444321/pexels-photo-1444321.jpeg", // Dog outdoors
      "https://images.pexels.com/photos/1276553/pexels-photo-1276553.jpeg", // Dog in complex scene
      "https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg", // Dog with people
      "https://images.pexels.com/photos/2071882/pexels-photo-2071882.jpeg", // Dog in garden
      // Complex scenes without dogs
      "https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg", // Cat scene
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg", // Kitchen
      "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg", // Nature
      "https://images.pexels.com/photos/1438761/pexels-photo-1438761.jpeg", // Street
      "https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg"   // Landscape
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