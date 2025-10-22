# Image Handling Documentation

## Overview
This document explains the image handling implementation in the PasarAntar application.

## Problem
Previously, the application was using dummy images from `picsum.photos` instead of actual product images from the database across multiple components including:
- ProductCard
- CartDrawer
- CheckoutPage
- ProductDetail

## Solution
Created a centralized utility function `getImageUrl` in `imageUtils.ts` that handles various image URL formats consistently.

## Implementation Details

### getImageUrl Function
```typescript
export const getImageUrl = (
  imageUrl: string | null | undefined,
  fallbackSeed: string,
  width: number = 400,
  height: number = 400
): string
```

This function handles:
1. Null/undefined image URLs → Returns fallback placeholder
2. Blob URLs → Returns fallback placeholder
3. Absolute URLs (http/https) → Returns as-is
4. Relative URLs with /uploads/ → Prepends server URL
5. Other relative URLs → Prepends server URL and /uploads/

### handleImageError Function
```typescript
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement>,
  fallbackSeed: string,
  width: number = 400,
  height: number = 400
): void
```

This function provides fallback image loading when the primary image fails to load.

## Components Updated
1. **ProductCard** - Now uses `getImageUrl` and `handleImageError`
2. **CartDrawer** - Now uses `getImageUrl` and `handleImageError`
3. **CheckoutPage** - Now uses `getImageUrl` and `handleImageError`
4. **ProductDetail** - Now uses `getImageUrl` and `handleImageError`
5. **CheckoutForm** - Fixed price calculation to use variant price instead of product price

## Additional Fixes
- Fixed promo products section to not be affected by category selection
- Fixed price calculation in CheckoutForm to use variant price

## Testing
Created `testImageHandling.ts` with test functions that can be run in the browser console:
- `window.testImageHandling.runTests()` - Runs all test cases
- `window.testImageHandling.testImage(imageUrl, fallbackSeed)` - Tests specific image loading

## Usage Example
```typescript
import { getImageUrl, handleImageError } from '../utils/imageUtils';

// In component
<img
  src={getImageUrl(product.imageUrl, product.id, 400, 400)}
  alt={product.name}
  onError={(e) => handleImageError(e, product.id, 400, 400)}
/>