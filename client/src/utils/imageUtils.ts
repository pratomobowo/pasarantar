/**
 * Utility functions for handling image URLs consistently across the application
 */

/**
 * Constructs a proper image URL from various input formats
 * @param imageUrl - The image URL from the database (can be relative, absolute, or null)
 * @param fallbackSeed - Seed to use for fallback placeholder image
 * @param width - Width for the fallback placeholder image
 * @param height - Height for the fallback placeholder image
 * @returns Properly formatted image URL
 */
export const getImageUrl = (
  imageUrl: string | null | undefined,
  fallbackSeed: string,
  width: number = 400,
  height: number = 400
): string => {
  // If no image URL is provided, return fallback
  if (!imageUrl || imageUrl.startsWith('blob:')) {
    return `https://picsum.photos/seed/${fallbackSeed}/${width}/${height}.jpg`;
  }

  // If it's already an absolute URL (starts with http), return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // If it's a relative path starting with /uploads/, prepend server URL
  if (imageUrl.startsWith('/uploads/')) {
    return `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}${imageUrl}`;
  }

  // If it's a relative path without /uploads/, assume it's an uploads path
  if (imageUrl.startsWith('/')) {
    return `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}${imageUrl}`;
  }

  // If it's a relative path without leading slash, assume it's an uploads path
  return `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}/uploads/${imageUrl}`;
};

/**
 * Handles image error by falling back to a placeholder image
 * @param event - The error event from the img element
 * @param fallbackSeed - Seed to use for fallback placeholder image
 * @param width - Width for the fallback placeholder image
 * @param height - Height for the fallback placeholder image
 */
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement>,
  fallbackSeed: string,
  width: number = 400,
  height: number = 400
): void => {
  const target = event.target as HTMLImageElement;
  const fallbackUrl = `https://picsum.photos/seed/${fallbackSeed}/${width}/${height}.jpg`;
  
  // Only update if not already using the fallback
  if (!target.src.includes('picsum.photos')) {
    target.src = fallbackUrl;
  }
};