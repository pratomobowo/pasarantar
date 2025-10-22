import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useCart();

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleMenuClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (query: string) => {
    // Handle search if needed
    console.log('Search query:', query);
  };

  const handleProductClick = (product: any) => {
    navigate(`/product/${product.slug}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header
        onCartClick={handleCartClick}
        onMenuClick={handleMenuClick}
        isMenuOpen={isMobileMenuOpen}
        onSearch={handleSearch}
        onProductClick={handleProductClick}
      />

      {/* 404 Content */}
      <section className="relative min-h-screen overflow-hidden flex items-center justify-center">
        {/* Background Ornaments */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large circle decoration */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Medium circles */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse" style={{ animationDelay: '3s' }}></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-8xl lg:text-9xl font-bold text-orange-600 opacity-20">
              404
            </h1>
          </div>
          
          {/* Error Message */}
          <div className="mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Halaman Tidak Ditemukan
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan. 
              Mari kita kembali dan temukan produk protein segar berkualitas.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              to="/"
              className="inline-flex items-center justify-center px-8 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <Home size={20} className="mr-2" />
              Kembali ke Beranda
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-orange-600 rounded-lg font-medium border-2 border-orange-600 hover:bg-orange-50 transition-colors duration-200"
            >
              <ArrowLeft size={20} className="mr-2" />
              Kembali ke Halaman Sebelumnya
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}