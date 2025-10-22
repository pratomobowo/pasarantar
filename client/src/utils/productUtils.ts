import { ProductVariant } from 'shared/dist/types';

/**
 * Formats the weight with unit abbreviation for display
 * @param variant Product variant with weight and unit information
 * @returns Formatted weight string (e.g., "1Kg", "500gr")
 */
export const formatWeightWithUnit = (variant: ProductVariant): string => {
  if (!variant) return 'N/A';
  
  // If unitAbbreviation is available, combine weight with unit
  if (variant.unitAbbreviation) {
    return `${variant.weight}${variant.unitAbbreviation}`;
  }
  
  // Fallback to just weight if unit information is not available
  return variant.weight;
};

/**
 * Gets the full URL for a product image
 * @param imageUrl The image URL from the database
 * @param productId The product ID for fallback image
 * @returns Full URL for the image
 */
export const getImageUrl = (imageUrl: string | undefined, productId: string): string => {
  if (!imageUrl || imageUrl.startsWith('blob:')) {
    return `https://picsum.photos/seed/${productId}/600/600.jpg`;
  }
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Otherwise, prepend the server URL
  return `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}${imageUrl}`;
};

/**
 * Formats the weight with unit abbreviation for display in price context
 * @param variant Product variant with weight and unit information
 * @returns Formatted weight string with slash prefix (e.g., "/Kg", "/gr")
 */
export const formatWeightWithUnitForPrice = (variant: ProductVariant): string => {
  if (!variant) return '';
  
  // If unitAbbreviation is available, combine weight with unit
  if (variant.unitAbbreviation) {
    return `/${variant.weight}${variant.unitAbbreviation}`;
  }
  
  // Fallback to just weight if unit information is not available
  return `/${variant.weight}`;
};