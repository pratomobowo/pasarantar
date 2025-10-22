/**
 * Test script to verify image handling functionality
 * This can be run in the browser console to test image URL generation
 */

import { getImageUrl } from './imageUtils';

// Test cases for getImageUrl function
const testCases = [
  {
    name: 'Null image URL',
    imageUrl: null,
    expected: 'https://picsum.photos/seed/test-product/400/400.jpg'
  },
  {
    name: 'Undefined image URL',
    imageUrl: undefined,
    expected: 'https://picsum.photos/seed/test-product/400/400.jpg'
  },
  {
    name: 'Blob URL',
    imageUrl: 'blob:http://localhost:3000/abc123',
    expected: 'https://picsum.photos/seed/test-product/400/400.jpg'
  },
  {
    name: 'Absolute HTTP URL',
    imageUrl: 'http://example.com/image.jpg',
    expected: 'http://example.com/image.jpg'
  },
  {
    name: 'Absolute HTTPS URL',
    imageUrl: 'https://example.com/image.jpg',
    expected: 'https://example.com/image.jpg'
  },
  {
    name: 'Relative URL with /uploads/',
    imageUrl: '/uploads/kUvSnMxP59I_in6qJjxmI.png',
    expected: 'http://localhost:3000/uploads/kUvSnMxP59I_in6qJjxmI.png'
  },
  {
    name: 'Relative URL with leading slash',
    imageUrl: '/image.jpg',
    expected: 'http://localhost:3000/image.jpg'
  },
  {
    name: 'Relative URL without leading slash',
    imageUrl: 'image.jpg',
    expected: 'http://localhost:3000/uploads/image.jpg'
  }
];

/**
 * Run all test cases and log results
 */
export const runImageTests = () => {
  console.group('🧪 Testing Image URL Generation');
  
  testCases.forEach((testCase, index) => {
    const result = getImageUrl(testCase.imageUrl, 'test-product', 400, 400);
    const passed = result === testCase.expected;
    
    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log(`  Input: ${testCase.imageUrl}`);
    console.log(`  Expected: ${testCase.expected}`);
    console.log(`  Got: ${result}`);
    console.log(`  Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    
    if (!passed) {
      console.error(`  ❌ Test failed! Expected "${testCase.expected}" but got "${result}"`);
    }
  });
  
  console.groupEnd();
};

/**
 * Test image loading in the browser
 * This function can be called to verify that images load correctly
 */
export const testImageLoading = (imageUrl: string, fallbackSeed: string) => {
  const img = new Image();
  const url = getImageUrl(imageUrl, fallbackSeed, 400, 400);
  
  console.log(`Testing image load for: ${url}`);
  
  img.onload = () => {
    console.log(`✅ Image loaded successfully: ${url}`);
  };
  
  img.onerror = () => {
    console.log(`❌ Image failed to load: ${url}`);
  };
  
  img.src = url;
  
  return img;
};

// Auto-run tests if this file is imported in a browser environment
if (typeof window !== 'undefined') {
  // Make test functions available globally for easy access in browser console
  (window as any).testImageHandling = {
    runTests: runImageTests,
    testImage: testImageLoading
  };
  
  console.log('🔧 Image handling test functions available at window.testImageHandling');
  console.log('  - Run tests: window.testImageHandling.runTests()');
  console.log('  - Test image: window.testImageHandling.testImage(imageUrl, fallbackSeed)');
}