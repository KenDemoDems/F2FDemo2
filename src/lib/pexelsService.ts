// Pexels API service for fetching food images
import { getEnvVar } from './env';

const PEXELS_API_KEY = getEnvVar('VITE_PEXELS_API_KEY', '');
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

interface PexelsPhoto {
  id: number;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  photographer: string;
  photographer_url: string;
}

interface PexelsResponse {
  photos: PexelsPhoto[];
  total_results: number;
  next_page?: string;
}

/**
 * Fetch a food image from Pexels based on recipe name or ingredients
 * @param query - Search query (recipe name or main ingredient)
 * @param size - Size of the image to return (default: 'medium')
 * @returns Image URL or fallback placeholder
 */
export const fetchFoodImage = async (
  query: string,
  size: 'large' | 'medium' | 'small' | 'landscape' = 'medium'
): Promise<string> => {
  try {
    // Check if API key is available
    if (!PEXELS_API_KEY) {
      console.warn('Pexels API key not found, using fallback image');
      return getFallbackImage();
    }

    // Clean up query - add "food" to get better results
    const searchQuery = `${query} food dish`;
    
    const response = await fetch(
      `${PEXELS_API_URL}?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error(`Pexels API error: ${response.status} ${response.statusText}`);
      return getFallbackImage();
    }

    const data: PexelsResponse = await response.json();

    if (data.photos && data.photos.length > 0) {
      const photo = data.photos[0];
      return photo.src[size] || photo.src.medium;
    }

    console.warn(`No images found for query: ${searchQuery}`);
    return getFallbackImage();
  } catch (error) {
    console.error('Error fetching image from Pexels:', error);
    return getFallbackImage();
  }
};

/**
 * Fetch multiple food images in parallel
 * @param queries - Array of search queries
 * @param size - Size of images to return
 * @returns Array of image URLs
 */
export const fetchMultipleFoodImages = async (
  queries: string[],
  size: 'large' | 'medium' | 'small' | 'landscape' = 'medium'
): Promise<string[]> => {
  try {
    const promises = queries.map(query => fetchFoodImage(query, size));
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error fetching multiple images:', error);
    return queries.map(() => getFallbackImage());
  }
};

/**
 * Get a fallback image URL when Pexels fails or returns no results
 */
const getFallbackImage = (): string => {
  // Placeholder image - you can replace this with a local asset
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="30" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ERecipe Image%3C/text%3E%3C/svg%3E';
};

/**
 * Clean recipe name for better search results
 * Removes special characters and simplifies the query
 */
export const cleanRecipeNameForSearch = (recipeName: string): string => {
  return recipeName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
};

export default fetchFoodImage;
