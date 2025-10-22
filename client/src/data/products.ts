import { Product, ProductReview } from "shared/dist/types";

if (import.meta.env.DEV) {
  console.log('WARNING: client/src/data/products.ts contains mock data that should not be used in production');
}

export const mockReviews: ProductReview[] = [
  // Reviews for Ayam Kampung Segar
  {
    id: "review-001",
    productId: "ayam-001",
    customerName: "Budi Santoso",
    rating: 5,
    comment: "Ayam kampungnya sangat segar dan empuk. Cocok untuk membuat sop ayam yang sehat untuk keluarga.",
    date: "2024-01-15",
    verified: true,
  },
  {
    id: "review-002",
    productId: "ayam-001",
    customerName: "Siti Nurhaliza",
    rating: 4,
    comment: "Kualitas bagus, pengantaran tepat waktu. Hanya saja kadang ukuran tidak selalu sama.",
    date: "2024-01-10",
    verified: true,
  },
  // Reviews for Ikan Salmon Segar
  {
    id: "review-003",
    productId: "ikan-001",
    customerName: "Ahmad Fauzi",
    rating: 5,
    comment: "Salmonnya sangat segar! Tidak ada bau amis sama sekali. Sudah repeat order beberapa kali.",
    date: "2024-01-12",
    verified: true,
  },
  {
    id: "review-004",
    productId: "ikan-001",
    customerName: "Diana Putri",
    rating: 4,
    comment: "Kualitas premium, memang sesuai dengan harga. Packing sangat rapi dan higienis.",
    date: "2024-01-08",
    verified: true,
  },
  // Reviews for Daging Sapi Has Dalam
  {
    id: "review-005",
    productId: "sapi-001",
    customerName: "Rudi Hermawan",
    rating: 5,
    comment: "Daging sapi has dalam premium, sangat empuk dan tidak alot. Sempurna untuk steak!",
    date: "2024-01-14",
    verified: true,
  },
  {
    id: "review-006",
    productId: "sapi-001",
    customerName: "Maya Sari",
    rating: 4,
    comment: "Kualitas daging sangat baik, lemaknya pas. Recommended untuk yang suka daging berkualitas.",
    date: "2024-01-11",
    verified: true,
  },
  // Reviews for Ayam Bakar Madu
  {
    id: "review-007",
    productId: "marinasi-001",
    customerName: "Joko Widodo",
    rating: 5,
    comment: "Bumbu marinasi madunya meresap sempurna. Tinggal bakar, jadi praktis untuk acara keluarga.",
    date: "2024-01-13",
    verified: true,
  },
];

export const mockProducts: Product[] = [
  // Ayam Products
  {
    id: "ayam-001",
    name: "Ayam Kampung Segar",
    category: "ayam",
    basePrice: 35000,
    description: "Ayam kampung segar berkualitas tinggi, tanpa pengawet. Dipelihara secara alami dengan pakan organik, menghasilkan daging yang lebih sehat dan bergizi. Cocok untuk berbagai masakan tradisional Indonesia.",
    image: "/api/placeholder/300/300",
    defaultVariantId: "ayam-001-500g",
    rating: 4.5,
    reviewCount: 28,
    isOnSale: true,
    discountPercentage: 15,
    variants: [
      {
        id: "ayam-001-250g",
        weight: "250g",
        price: 8500,
        originalPrice: 10000,
        inStock: true,
      },
      {
        id: "ayam-001-500g",
        weight: "500g",
        price: 15300,
        originalPrice: 18000,
        inStock: true,
      },
      {
        id: "ayam-001-1kg",
        weight: "1kg",
        price: 29750,
        originalPrice: 35000,
        inStock: true,
      },
    ],
  },
  {
    id: "ayam-002",
    name: "Filet Dada Ayam",
    category: "ayam",
    basePrice: 45000,
    description: "Filet dada ayam tanpa tulang, siap masak. Diproses secara higienis dan tanpa tambahan bahan pengawat. Tinggi protein dan rendah lemak, ideal untuk diet sehat.",
    image: "/api/placeholder/300/300",
    defaultVariantId: "ayam-002-500g",
    rating: 4.7,
    reviewCount: 35,
    isOnSale: false,
    variants: [
      {
        id: "ayam-002-250g",
        weight: "250g",
        price: 13000,
        inStock: true,
      },
      {
        id: "ayam-002-500g",
        weight: "500g",
        price: 25000,
        inStock: true,
      },
      {
        id: "ayam-002-1kg",
        weight: "1kg",
        price: 45000,
        inStock: true,
      },
    ],
  },
  {
    id: "ayam-003",
    name: "Sayap Ayam Frozen",
    category: "ayam",
    basePrice: 28000,
    description: "Sayap ayam frozen, praktis untuk berbagai masakan. Dibekukan secara profesional untuk menjaga kesegaran dan kualitas daging. Cocok untuk ayam goreng, bakar, atau grill.",
    image: "/api/placeholder/300/300",
    defaultVariantId: "ayam-003-500g",
    rating: 4.3,
    reviewCount: 22,
    isOnSale: false,
    variants: [
      {
        id: "ayam-003-250g",
        weight: "250g",
        price: 8000,
        inStock: true,
      },
      {
        id: "ayam-003-500g",
        weight: "500g",
        price: 15000,
        inStock: true,
      },
      {
        id: "ayam-003-1kg",
        weight: "1kg",
        price: 28000,
        inStock: true,
      },
    ],
  },
  {
    id: "ayam-004",
    name: "Paha Ayam Atas",
    category: "ayam",
    basePrice: 32000,
    description: "Paha ayam atas berkualitas, daging tebal dan juicy. Bagian paha ayam yang paling favorit karena dagingnya yang tebal dan tidak kering. Sempurna untuk berbagai jenis masakan.",
    image: "/api/placeholder/300/300",
    defaultVariantId: "ayam-004-500g",
    rating: 4.6,
    reviewCount: 31,
    isOnSale: true,
    discountPercentage: 20,
    variants: [
      {
        id: "ayam-004-250g",
        weight: "250g",
        price: 7200,
        originalPrice: 9000,
        inStock: true,
      },
      {
        id: "ayam-004-500g",
        weight: "500g",
        price: 13600,
        originalPrice: 17000,
        inStock: true,
      },
      {
        id: "ayam-004-1kg",
        weight: "1kg",
        price: 25600,
        originalPrice: 32000,
        inStock: true,
      },
    ],
  },

  // Ikan Products
  {
    id: "ikan-001",
    name: "Ikan Salmon Segar",
    category: "ikan",
    basePrice: 120000,
    description: "Ikan salmon segar impor, kaya omega-3. Dipilih dari salmon terbaik yang dibekukan saat masih segar untuk menjaga kualitas nutrisi. Sangat baik untuk kesehatan jantung dan otak.",
    image: "/api/placeholder/300/300",
    defaultVariantId: "ikan-001-500g",
    rating: 4.8,
    reviewCount: 45,
    isOnSale: true,
    discountPercentage: 25,
    variants: [
      {
        id: "ikan-001-250g",
        weight: "250g",
        price: 26250,
        originalPrice: 35000,
        inStock: true,
      },
      {
        id: "ikan-001-500g",
        weight: "500g",
        price: 48750,
        originalPrice: 65000,
        inStock: true,
      },
      {
        id: "ikan-001-1kg",
        weight: "1kg",
        price: 90000,
        originalPrice: 120000,
        inStock: true,
      },
    ],
  },
  {
    id: "ikan-002",
    name: "Ikan Tuna Filet",
    category: "ikan",
    basePrice: 85000,
    description: "Filet ikan tuna segar, tanpa tulang. Tuna pilihan yang kaya protein dan rendah lemak. Diproses secara higienis dan siap untuk berbagai masakan dari steak hingga sushi.",
    image: "/api/placeholder/300/300",
    defaultVariantId: "ikan-002-500g",
    rating: 4.5,
    reviewCount: 38,
    isOnSale: false,
    variants: [
      {
        id: "ikan-002-250g",
        weight: "250g",
        price: 25000,
        inStock: true,
      },
      {
        id: "ikan-002-500g",
        weight: "500g",
        price: 45000,
        inStock: true,
      },
      {
        id: "ikan-002-1kg",
        weight: "1kg",
        price: 85000,
        inStock: true,
      },
    ],
  },
  {
    id: "ikan-003",
    name: "Ikan Lele Segar",
    category: "ikan",
    basePrice: 25000,
    description: "Ikan lele segar lokal, daging empuk. Dibudidayakan secara alami tanpa bahan kimia. Dagingnya yang empuk dan gurih membuatnya favorit untuk masakan pecel lele.",
    image: "/api/placeholder/300/300",
    defaultVariantId: "ikan-003-500g",
    rating: 4.2,
    reviewCount: 19,
    isOnSale: false,
    variants: [
      {
        id: "ikan-003-250g",
        weight: "250g",
        price: 7000,
        inStock: true,
      },
      {
        id: "ikan-003-500g",
        weight: "500g",
        price: 13000,
        inStock: true,
      },
      {
        id: "ikan-003-1kg",
        weight: "1kg",
        price: 25000,
        inStock: true,
      },
    ],
  },
  {
    id: "ikan-004",
    name: "Ikan Kakap Merah",
    category: "ikan",
    basePrice: 95000,
    description: "Ikan kakap merah segar, daging putih padat. Kakap pilihan yang dagingnya putih bersih dengan tekstur padat. Sangat cocok untuk digoreng, bakar, atau sup.",
    image: "/api/placeholder/300/300",
    defaultVariantId: "ikan-004-500g",
    rating: 4.4,
    reviewCount: 27,
    isOnSale: true,
    discountPercentage: 10,
    variants: [
      {
        id: "ikan-004-250g",
        weight: "250g",
        price: 25200,
        originalPrice: 28000,
        inStock: true,
      },
      {
        id: "ikan-004-500g",
        weight: "500g",
        price: 45000,
        originalPrice: 50000,
        inStock: true,
      },
      {
        id: "ikan-004-1kg",
        weight: "1kg",
        price: 85500,
        originalPrice: 95000,
        inStock: true,
      },
    ],
  },

  // Daging Sapi Products
  {
    id: "sapi-001",
    name: "Daging Sapi Has Dalam",
    category: "daging-sapi",
    basePrice: 150000,
    description: "Daging sapi has dalam premium, empuk dan juicy. Bagian pilihan dari sapi berkualitas tinggi dengan marbling yang sempurna. Ideal untuk steak, rendang, atau semur.",
    image: "/api/placeholder/300/300",
    defaultVariantId: "sapi-001-500g",
    rating: 4.7,
    reviewCount: 52,
    isOnSale: true,
    discountPercentage: 20,
    variants: [
      {
        id: "sapi-001-250g",
        weight: "250g",
        price: 36000,
        originalPrice: 45000,
        inStock: true,
      },
      {
        id: "sapi-001-500g",
        weight: "500g",
        price: 64000,
        originalPrice: 80000,
        inStock: true,
      },
      {
        id: "sapi-001-1kg",
        weight: "1kg",
        price: 120000,
        originalPrice: 150000,
        inStock: true,
      },
    ],
  },
  {
    id: "sapi-002",
    name: "Daging Sapi Giling",
    category: "daging-sapi",
    basePrice: 110000,
    description: "Daging sapi giling segar, tanpa campuran. Dibuat dari pilihan daging sapi berkualitas dengan perbandingan lemak dan daging yang sempurna. Cocok untuk burger, meatball, atau bolognese.",
    image: "/api/placeholder/300/300",
    defaultVariantId: "sapi-002-500g",
    rating: 4.3,
    reviewCount: 29,
    isOnSale: false,
    variants: [
      {
        id: "sapi-002-250g",
        weight: "250g",
        price: 32000,
        inStock: true,
      },
      {
        id: "sapi-002-500g",
        weight: "500g",
        price: 58000,
        inStock: true,
      },
      {
        id: "sapi-002-1kg",
        weight: "1kg",
        price: 110000,
        inStock: true,
      },
    ],
  },
  {
    id: "sapi-003",
    name: "Iga Sapi Segar",
    category: "daging-sapi",
    basePrice: 135000,
    description: "Iga sapi segar dengan daging yang melimpah. Iga pilihan dengan kualitas terbaik, daging tebal dan tulang yang kuat. Sempurna untuk sup iga, bakar iga, atau BBQ.",
    image: "/api/placeholder/300/300",
    defaultVariantId: "sapi-003-500g",
    rating: 4.6,
    reviewCount: 41,
    isOnSale: false,
    variants: [
      {
        id: "sapi-003-250g",
        weight: "250g",
        price: 40000,
        inStock: true,
      },
      {
        id: "sapi-003-500g",
        weight: "500g",
        price: 70000,
        inStock: true,
      },
      {
        id: "sapi-003-1kg",
        weight: "1kg",
        price: 135000,
        inStock: true,
      },
    ],
  },
  {
    id: "sapi-004",
    name: "Sirloin Steak",
    category: "daging-sapi",
    basePrice: 180000,
    description: "Sirloin steak premium, cocok untuk grill. Potongan sirloin pilihan dengan kualitas restoran, marbling sempurna untuk rasa dan kelembutan maksimal.",
    image: "/api/placeholder/300/300",
    defaultVariantId: "sapi-004-500g",
    rating: 4.9,
    reviewCount: 58,
    isOnSale: false,
    variants: [
      {
        id: "sapi-004-250g",
        weight: "250g",
        price: 55000,
        inStock: true,
      },
      {
        id: "sapi-004-500g",
        weight: "500g",
        price: 95000,
        inStock: true,
      },
      {
        id: "sapi-004-1kg",
        weight: "1kg",
        price: 180000,
        inStock: true,
      },
    ],
  },

  // Marinasi Products
  {
    id: "marinasi-001",
    name: "Ayam Bakar Madu",
    category: "marinasi",
    basePrice: 42000,
    description: "Ayam dengan marinasi madu, siap bakar. Dibumbui dengan resep rahasia kombinasi madu asli dan rempah pilihan. Praktis untuk acara keluarga atau gathering.",
    image: "/api/placeholder/300/300",
    defaultVariantId: "marinasi-001-500g",
    rating: 4.8,
    reviewCount: 33,
    isOnSale: true,
    discountPercentage: 30,
    variants: [
      {
        id: "marinasi-001-250g",
        weight: "250g",
        price: 8400,
        originalPrice: 12000,
        inStock: true,
      },
      {
        id: "marinasi-001-500g",
        weight: "500g",
        price: 15400,
        originalPrice: 22000,
        inStock: true,
      },
      {
        id: "marinasi-001-1kg",
        weight: "1kg",
        price: 29400,
        originalPrice: 42000,
        inStock: true,
      },
    ],
  },
  {
    id: "marinasi-002",
    name: "Ayam Goreng Bumbu",
    category: "marinasi",
    basePrice: 38000,
    description: "Ayam dengan bumbu goreng tradisional. Menggunakan bumbu rempah nusantara asli yang telah dihaluskan sempurna. Cukup goreng dan sajikan dengan nasi hangat.",
    image: "/api/placeholder/300/300",
    defaultVariantId: "marinasi-002-500g",
    rating: 4.5,
    reviewCount: 26,
    isOnSale: false,
    variants: [
      {
        id: "marinasi-002-250g",
        weight: "250g",
        price: 11000,
        inStock: true,
      },
      {
        id: "marinasi-002-500g",
        weight: "500g",
        price: 20000,
        inStock: true,
      },
      {
        id: "marinasi-002-1kg",
        weight: "1kg",
        price: 38000,
        inStock: true,
      },
    ],
  },
  {
    id: "marinasi-003",
    name: "Ikan Bakar Rica",
    category: "marinasi",
    basePrice: 55000,
    description: "Ikan dengan bumbu rica pedas khas Manado. Perpaduan ikan segar dengan bumbu rica yang pedas dan gurih. Cocok untuk pecinta makanan pedas.",
    image: "/api/placeholder/300/300",
    defaultVariantId: "marinasi-003-500g",
    rating: 4.4,
    reviewCount: 21,
    isOnSale: false,
    variants: [
      {
        id: "marinasi-003-250g",
        weight: "250g",
        price: 16000,
        inStock: true,
      },
      {
        id: "marinasi-003-500g",
        weight: "500g",
        price: 28000,
        inStock: true,
      },
      {
        id: "marinasi-003-1kg",
        weight: "1kg",
        price: 55000,
        inStock: true,
      },
    ],
  },
  {
    id: "marinasi-004",
    name: "Sate Maranggi",
    category: "marinasi",
    basePrice: 65000,
    description: "Sate maranggi khas Purwakarta, siap bakar. Daging sapi pilihan dengan bumbu kacang khas Purwakarta yang autentik. Praktis untuk acara atau jualan.",
    image: "/api/placeholder/300/300",
    defaultVariantId: "marinasi-004-10tusuk",
    rating: 4.7,
    reviewCount: 37,
    isOnSale: false,
    variants: [
      {
        id: "marinasi-004-5tusuk",
        weight: "5 tusuk",
        price: 35000,
        inStock: true,
      },
      {
        id: "marinasi-004-10tusuk",
        weight: "10 tusuk",
        price: 65000,
        inStock: true,
      },
      {
        id: "marinasi-004-20tusuk",
        weight: "20 tusuk",
        price: 120000,
        inStock: true,
      },
    ],
  },
];

export const getProductByCategory = (category: string) => {
  return mockProducts.filter(product => product.category === category);
};

export const getProductById = (id: string) => {
  return mockProducts.find(product => product.id === id);
};

export const getVariantById = (productId: string, variantId: string) => {
  const product = getProductById(productId);
  if (!product) return null;
  return product.variants.find(variant => variant.id === variantId);
};

export const getReviewsByProductId = (productId: string) => {
  return mockReviews.filter(review => review.productId === productId);
};

export const getDiscountedProducts = () => {
  return mockProducts.filter(product => product.isOnSale);
};

export const getAllCategories = [
  { id: "ayam", name: "Ayam", icon: "🍗" },
  { id: "ikan", name: "Ikan", icon: "🐟" },
  { id: "daging-sapi", name: "Daging Sapi", icon: "🥩" },
  { id: "marinasi", name: "Marinasi", icon: "🍖" },
];