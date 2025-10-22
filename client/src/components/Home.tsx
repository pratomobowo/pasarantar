import React, { useState, useEffect } from 'react';
import { Product, ProductWithRelations } from 'shared/dist/types';
import Header from './Header';
import ProductCard from './ProductCard';
import CategoryProductSection from './CategoryProductSection';
import CartDrawer from './CartDrawer';
import Toast from './Toast';
import MobileMenu from './MobileMenu';
import Footer from './Footer';
import { Truck, Shield, Clock, Star, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [currentDiscountSlideIndex, setCurrentDiscountSlideIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<Array<{id: string, name: string, icon: string}>>([]);
  const [loading, setLoading] = useState(true);
  const { toast, hideToast } = useCart();

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/products');
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/categories');
        const data = await response.json();
        
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to default categories if API fails
        setCategories([
          { id: 'ayam', name: 'Ayam', icon: '🐔' },
          { id: 'ikan', name: 'Ikan', icon: '🐟' },
          { id: 'daging-sapi', name: 'Daging Sapi', icon: '🐄' },
          { id: 'marinasi', name: 'Marinasi', icon: '🍖' },
        ]);
      }
    };

    // Fetch both products and categories
    Promise.all([fetchProducts(), fetchCategories()]).finally(() => {
      setLoading(false);
    });
  }, []);


  // Get discounted products (from all products, not filtered)
  const discountedProducts = React.useMemo(() => {
    return products.filter(product => product.isOnSale);
  }, [products]);

  // Group discounted products into slides
  // 4 products for desktop, 2 products for mobile
  const desktopDiscountSlides = [];
  const mobileDiscountSlides = [];
  
  for (let i = 0; i < discountedProducts.length; i += 4) {
    desktopDiscountSlides.push(discountedProducts.slice(i, i + 4));
  }
  
  for (let i = 0; i < discountedProducts.length; i += 2) {
    mobileDiscountSlides.push(discountedProducts.slice(i, i + 2));
  }


  const features = [
    {
      icon: Truck,
      title: 'Pengantaran Cepat',
      description: 'Pesanan sampai di hari yang sama'
    },
    {
      icon: Shield,
      title: 'Kualitas Terjamin',
      description: 'Produk segar dan berkualitas'
    },
    {
      icon: Clock,
      title: 'Operasional 24/7',
      description: 'Siap melayani kapan saja'
    },
    {
      icon: Star,
      title: 'Harga Terbaik',
      description: 'Kualitas premium dengan harga bersaing'
    }
  ];

  const nextFeature = () => {
    setCurrentFeatureIndex((prev) => (prev + 1) % features.length);
  };

  const prevFeature = () => {
    setCurrentFeatureIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  const nextDiscountSlide = () => {
    const slides = isMobile ? mobileDiscountSlides : desktopDiscountSlides;
    setCurrentDiscountSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const prevDiscountSlide = () => {
    const slides = isMobile ? mobileDiscountSlides : desktopDiscountSlides;
    setCurrentDiscountSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleProductClick = (product: ProductWithRelations) => {
    navigate(`/product/${product.slug}`);
  };
  
  const handleAddToCartClick = (product: ProductWithRelations) => {
    navigate(`/product/${product.slug}`);
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
  };


  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header
        onCartClick={handleCartClick}
        onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMenuOpen={isMobileMenuOpen}
        onSearch={handleSearch}
        onProductClick={handleProductClick}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 overflow-hidden">
        {/* Background Ornaments */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large circle decoration */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Medium circles */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse" style={{ animationDelay: '3s' }}></div>
          
          {/* Small decorative dots */}
          <div className="absolute top-10 left-10 w-4 h-4 bg-orange-400 rounded-full opacity-60"></div>
          <div className="absolute top-20 left-32 w-3 h-3 bg-red-400 rounded-full opacity-50"></div>
          <div className="absolute top-32 left-20 w-2 h-2 bg-yellow-400 rounded-full opacity-70"></div>
          <div className="absolute top-16 right-20 w-3 h-3 bg-orange-400 rounded-full opacity-50"></div>
          <div className="absolute top-40 right-32 w-4 h-4 bg-red-400 rounded-full opacity-60"></div>
          <div className="absolute top-28 right-16 w-2 h-2 bg-yellow-400 rounded-full opacity-70"></div>
          
          {/* Bottom decorative dots */}
          <div className="absolute bottom-20 left-16 w-3 h-3 bg-yellow-400 rounded-full opacity-60"></div>
          <div className="absolute bottom-32 left-40 w-2 h-2 bg-orange-400 rounded-full opacity-50"></div>
          <div className="absolute bottom-16 right-24 w-4 h-4 bg-red-400 rounded-full opacity-60"></div>
          <div className="absolute bottom-40 right-16 w-3 h-3 bg-yellow-400 rounded-full opacity-70"></div>
          
          {/* Wave pattern */}
          <svg className="absolute bottom-0 left-0 w-full h-32 text-orange-100 opacity-50" preserveAspectRatio="none" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
          </svg>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          {/* Desktop Layout - Image on the right */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Protein Segar
                <span className="block text-orange-600">Langsung Antar</span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-lg">
                Dapatkan daging ayam, ikan, dan daging sapi segar berkualitas tinggi 
                dengan pengantaran cepat ke rumah Anda.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-orange-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200 shadow-lg hover:shadow-xl">
                  Belanja Sekarang
                </button>
                <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-medium border-2 border-orange-600 hover:bg-orange-50 transition-colors duration-200">
                  Lihat Katalog
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square overflow-hidden">
                <img
                  src="http://localhost:3000/uploads/banner-image.webp"
                  alt="Fresh Protein Products"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Mobile Layout - Image on top */}
          <div className="lg:hidden flex flex-col space-y-8">
            <div className="relative">
              <div className="aspect-square overflow-hidden">
                <img
                  src="http://localhost:3000/uploads/banner-image.webp"
                  alt="Fresh Protein Products"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Protein Segar
                <span className="block text-orange-600">Langsung Antar</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                Dapatkan daging ayam, ikan, dan daging sapi segar berkualitas tinggi 
                dengan pengantaran cepat ke rumah Anda.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-orange-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200 shadow-lg hover:shadow-xl">
                  Belanja Sekarang
                </button>
                <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-medium border-2 border-orange-600 hover:bg-orange-50 transition-colors duration-200">
                  Lihat Katalog
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop View - Grid */}
          <div className="hidden lg:grid grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-orange-600" size={32} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Mobile View - Carousel */}
          <div className="lg:hidden">
            <div className="relative">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentFeatureIndex * 100}%)` }}
                >
                  {features.map((feature, index) => (
                    <div key={index} className="w-full flex-shrink-0 px-4">
                      <div className="text-center">
                        <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <feature.icon className="text-orange-600" size={40} />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-lg">{feature.title}</h3>
                        <p className="text-gray-600 text-base">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Controls */}
              <button
                onClick={prevFeature}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white rounded-full p-2 shadow-lg border border-gray-200"
                aria-label="Previous feature"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <button
                onClick={nextFeature}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white rounded-full p-2 shadow-lg border border-gray-200"
                aria-label="Next feature"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>

              {/* Carousel Indicators */}
              <div className="flex justify-center mt-6 space-x-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeatureIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      index === currentFeatureIndex ? 'bg-orange-600' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to feature ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discount Products Section */}
      {discountedProducts.length > 0 && (
        <section className="py-12 lg:py-16 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="mb-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Promo Spesial
                </h2>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Jangan lewatkan penawaran menarik untuk produk pilihan kami. Diskon terbatas!
              </p>
            </div>

            {/* Carousel with responsive products per slide */}
            <div className="relative">
              <div className="overflow-hidden">
                {/* Desktop Carousel - 4 products per slide */}
                <div className="hidden lg:block">
                  <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentDiscountSlideIndex * 100}%)` }}
                  >
                    {desktopDiscountSlides.map((slide, slideIndex) => (
                      <div key={slideIndex} className="w-full flex-shrink-0">
                        <div className="grid grid-cols-4 gap-6">
                          {slide.map((product) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              onProductClick={handleProductClick}
                              onAddToCartClick={handleAddToCartClick}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Mobile Carousel - 2 products per slide */}
                <div className="lg:hidden">
                  <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentDiscountSlideIndex * 100}%)` }}
                  >
                    {mobileDiscountSlides.map((slide, slideIndex) => (
                      <div key={slideIndex} className="w-full flex-shrink-0">
                        <div className="grid grid-cols-2 gap-4">
                          {slide.map((product) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              onProductClick={handleProductClick}
                              onAddToCartClick={handleAddToCartClick}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Carousel Controls - Only show if more than 1 slide */}
              {(desktopDiscountSlides.length > 1 || mobileDiscountSlides.length > 1) && (
                <>
                  <button
                    onClick={prevDiscountSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-4 bg-white rounded-full p-2 shadow-lg border border-gray-200 z-10"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={20} className="text-gray-600" />
                  </button>
                  <button
                    onClick={nextDiscountSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-4 bg-white rounded-full p-2 shadow-lg border border-gray-200 z-10"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={20} className="text-gray-600" />
                  </button>
                </>
              )}

              {/* Carousel Indicators - Only show if more than 1 slide */}
              {(desktopDiscountSlides.length > 1 || mobileDiscountSlides.length > 1) && (
                <div className="flex justify-center mt-6 space-x-2">
                  {(isMobile ? mobileDiscountSlides : desktopDiscountSlides).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentDiscountSlideIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        index === currentDiscountSlideIndex ? 'bg-red-500' : 'bg-gray-300'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Unified Category and Products Section */}
      <CategoryProductSection
        products={products}
        categories={categories}
        onProductClick={handleProductClick}
        onAddToCartClick={handleAddToCartClick}
        searchQuery={searchQuery}
        onSearch={handleSearch}
      />

      {/* CTA Section */}
      <section className="relative py-16 lg:py-20 bg-gradient-to-r from-orange-600 to-orange-700 overflow-hidden">
        {/* Background Ornaments */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large circle decoration */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Medium circles */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse" style={{ animationDelay: '3s' }}></div>
          
          {/* Small decorative dots */}
          <div className="absolute top-10 left-10 w-4 h-4 bg-orange-300 rounded-full opacity-60"></div>
          <div className="absolute top-20 left-32 w-3 h-3 bg-red-300 rounded-full opacity-50"></div>
          <div className="absolute top-32 left-20 w-2 h-2 bg-yellow-300 rounded-full opacity-70"></div>
          <div className="absolute top-16 right-20 w-3 h-3 bg-orange-300 rounded-full opacity-50"></div>
          <div className="absolute top-40 right-32 w-4 h-4 bg-red-300 rounded-full opacity-60"></div>
          <div className="absolute top-28 right-16 w-2 h-2 bg-yellow-300 rounded-full opacity-70"></div>
          
          {/* Bottom decorative dots */}
          <div className="absolute bottom-20 left-16 w-3 h-3 bg-yellow-300 rounded-full opacity-60"></div>
          <div className="absolute bottom-32 left-40 w-2 h-2 bg-orange-300 rounded-full opacity-50"></div>
          <div className="absolute bottom-16 right-24 w-4 h-4 bg-red-300 rounded-full opacity-60"></div>
          <div className="absolute bottom-40 right-16 w-3 h-3 bg-yellow-300 rounded-full opacity-70"></div>
          
          {/* Wave pattern */}
          <svg className="absolute top-0 left-0 w-full h-24 text-orange-500 opacity-20 transform rotate-180" preserveAspectRatio="none" viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" fill="currentColor"></path>
          </svg>
          
          <svg className="absolute bottom-0 left-0 w-full h-24 text-orange-500 opacity-20" preserveAspectRatio="none" viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,64,1152,69.3C1248,75,1344,75,1392,74.7L1440,74.7L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="currentColor"></path>
          </svg>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            Siap Menikmati Protein Segar?
          </h2>
          <p className="text-lg sm:text-xl text-orange-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan pelanggan yang telah merasakan kemudahan
            berbelanja protein segar berkualitas di PasarAntar.
          </p>
          <button className="bg-white text-orange-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 text-base sm:text-lg shadow-xl">
            Mulai Berbelanja Sekarang
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />



      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        onClose={hideToast}
        productName={toast.productName}
        productImage={toast.productImage}
        variantInfo={toast.variantInfo}
        onOpenCart={handleCartClick}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat produk...</p>
        </div>
      </div>
    );
  }
}