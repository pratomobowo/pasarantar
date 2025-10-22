import React, { useState, useRef, useEffect } from 'react';
import { Product, ProductWithRelations } from 'shared/dist/types';
import ProductCard from './ProductCard';
import ProductListCard from './ProductListCard';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface CategoryProductSectionProps {
  products: ProductWithRelations[];
  categories: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  onProductClick: (product: ProductWithRelations) => void;
  onAddToCartClick: (product: ProductWithRelations) => void;
  searchQuery: string;
  onSearch: (query: string) => void;
}

export default function CategoryProductSection({
  products,
  categories,
  onProductClick,
  onAddToCartClick,
  searchQuery,
  onSearch
}: CategoryProductSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [displayedProducts, setDisplayedProducts] = useState<ProductWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const PRODUCTS_PER_PAGE = 8;
  const loader = useRef<HTMLDivElement>(null);

  // Filter products based on selected category and search query
  const filteredProducts = React.useMemo(() => {
    let filtered = products;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => {
        const matchByCategory = product.category === selectedCategory;
        const matchByCategoryId = product.categoryId === selectedCategory;
        return matchByCategory || matchByCategoryId;
      });
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        (product.name ? product.name.toLowerCase().includes(query) : false) ||
        (product.description ? product.description.toLowerCase().includes(query) : false) ||
        (product.category ? product.category.toLowerCase().includes(query) : false) ||
        (product.variants ? product.variants.some(variant =>
          variant.weight ? variant.weight.toLowerCase().includes(query) : false
        ) : false)
      );
    }
    
    return filtered;
  }, [products, selectedCategory, searchQuery]);

  // Handle category click
  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Reset products when category or search query changes
  useEffect(() => {
    if (products.length > 0) {
      setDisplayedProducts([]);
      setPage(0);
      setHasMore(true);
      loadMoreProducts(true);
    }
  }, [selectedCategory, searchQuery]);

  // Load initial products when component first mounts
  useEffect(() => {
    if (products.length > 0 && displayedProducts.length === 0) {
      loadMoreProducts(true);
    }
  }, [products.length]);

  // Load more products
  const loadMoreProducts = (reset = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const currentPage = reset ? 0 : page;
      const startIndex = currentPage * PRODUCTS_PER_PAGE;
      const endIndex = startIndex + PRODUCTS_PER_PAGE;
      const newProducts = filteredProducts.slice(startIndex, endIndex);
      
      if (reset) {
        setDisplayedProducts(newProducts);
      } else {
        setDisplayedProducts(prev => [...prev, ...newProducts]);
      }
      
      setPage(prev => currentPage + 1);
      setHasMore(endIndex < filteredProducts.length);
      setIsLoading(false);
    }, 500);
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const currentLoader = loader.current;
    if (!currentLoader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentLoader);
    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, isLoading, page]);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Produk Segar Pilihan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Temukan berbagai produk protein segar berkualitas tinggi dengan harga terbaik
          </p>
        </div>

        {/* Categories and Products Container */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Categories Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 lg:p-8">
            <h3 className="text-white text-xl font-semibold mb-6">Kategori Produk</h3>
            
            {/* Mobile Categories - Horizontal Scroll */}
            <div className="lg:hidden">
              <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => handleCategoryClick('all')}
                  className={`flex-shrink-0 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    selectedCategory === 'all'
                      ? 'bg-white text-orange-600 shadow-lg'
                      : 'bg-white text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Semua
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`flex-shrink-0 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-white text-orange-600 shadow-lg'
                        : 'bg-white text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Categories - Grid */}
            <div className="hidden lg:grid grid-cols-5 gap-4">
              <button
                onClick={() => handleCategoryClick('all')}
                className={`p-4 rounded-xl transition-all duration-200 ${
                  selectedCategory === 'all'
                    ? 'bg-white text-orange-600 shadow-lg transform -translate-y-1'
                    : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="font-medium">Semua Produk</span>
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`p-4 rounded-xl transition-all duration-200 flex flex-col items-center justify-center ${
                    selectedCategory === category.id
                      ? 'bg-white text-orange-600 shadow-lg transform -translate-y-1'
                      : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span className="font-medium text-center">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Products Section */}
          <div className="p-6 lg:p-8">
            {/* Products Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery.trim()
                    ? `Hasil Pencarian: "${searchQuery}"`
                    : selectedCategory === 'all'
                      ? 'Semua Produk'
                      : categories.find(c => c.id === selectedCategory)?.name || 'Produk'
                  }
                </h3>
                <p className="text-sm text-gray-500">
                  {searchQuery.trim()
                    ? `Menampilkan ${filteredProducts.length} produk`
                    : selectedCategory === 'all'
                      ? 'Temukan semua produk protein segar berkualitas'
                      : `Pilihan terbaik ${categories.find(c => c.id === selectedCategory)?.name?.toLowerCase()} segar`
                  }
                </p>
              </div>
              
              {/* Product Count Badge */}
              <div className="mt-4 sm:mt-0 bg-orange-100 text-orange-800 px-4 py-2 rounded-lg text-sm font-medium">
                {filteredProducts.length} Produk
              </div>
            </div>

            {/* Products Grid */}
            {displayedProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg mb-4">
                  {searchQuery.trim()
                    ? `Tidak ada produk yang ditemukan untuk "${searchQuery}"`
                    : 'Tidak ada produk dalam kategori ini'
                  }
                </p>
                {searchQuery.trim() && (
                  <button
                    onClick={() => {
                      onSearch('');
                    }}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Hapus pencarian
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Mobile View - List Layout */}
                <div className="lg:hidden">
                  {displayedProducts.map((product) => (
                    <ProductListCard
                      key={product.id}
                      product={product}
                      onProductClick={onProductClick}
                      onAddToCartClick={onAddToCartClick}
                    />
                  ))}
                </div>
                
                {/* Desktop View - Grid Layout */}
                <div className="hidden lg:grid grid-cols-4 gap-6">
                  {displayedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onProductClick={onProductClick}
                      onAddToCartClick={onAddToCartClick}
                    />
                  ))}
                </div>
                
                {/* Loader for infinite scroll */}
                {hasMore && (
                  <div ref={loader} className="flex justify-center mt-8">
                    <div className="flex flex-col items-center">
                      <Loader2 className="animate-spin text-orange-600 mb-2" size={24} />
                      <p className="text-sm text-gray-500">Memuat produk lainnya...</p>
                    </div>
                  </div>
                )}
                
                {/* End message */}
                {!hasMore && displayedProducts.length > 0 && (
                  <div className="text-center mt-8">
                    <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Semua produk telah ditampilkan
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}