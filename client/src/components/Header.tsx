import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, MapPin, Phone, ChevronDown, LogOut } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Product } from 'shared/dist/types';
import { customerApi } from '../services/customerApi';
import { Modal } from './ui/Modal';
import { CustomerAuthModal } from './auth/CustomerAuthModal';

// Force refresh

interface HeaderProps {
  onCartClick: () => void;
  onMenuClick: () => void;
  isMenuOpen: boolean;
  onSearch: (query: string) => void;
  onProductClick: (product: Product) => void;
}

export default function Header({ onCartClick, onMenuClick, isMenuOpen, onSearch, onProductClick }: HeaderProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register'>('login');
  const [isSearching, setIsSearching] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { cart } = useCart();
  const { customer, isAuthenticated, logout } = useCustomerAuth();
  const { settings } = useSettings();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setIsSearchFocused(false);
  };

  // Search products from database
  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const response = await customerApi.getProducts(searchQuery);
          if (response.success && response.data) {
            // Limit to 5 results for dropdown
            setSearchResults(response.data.slice(0, 5));
          }
        } catch (error) {
          console.error('Error searching products:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside the search dropdown
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        // Also check if the click is not on the search input itself
        const target = event.target as Node;
        const searchInput = document.querySelector('input[type="text"]');
        if (searchInput && !searchInput.contains(target)) {
          setIsSearchFocused(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProductClick = (product: Product) => {
    // Open product detail modal
    onProductClick(product);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
  };

  const handleSeeAllResults = () => {
    onSearch(searchQuery);
    setIsSearchFocused(false);
  };

  const handleCustomerLogin = useCallback(() => {
    setAuthModalView('login');
    setIsAuthModalOpen(true);
  }, []);

  const handleCustomerRegister = useCallback(() => {
    setAuthModalView('register');
    setIsAuthModalOpen(true);
  }, []);

  const handleAuthModalClose = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const handleCustomerDashboard = () => {
    navigate('/customer/dashboard');
    setIsUserMenuOpen(false);
  };

  const handleCustomerOrders = () => {
    navigate('/customer/orders');
    setIsUserMenuOpen(false);
  };

  const handleCustomerProfile = () => {
    navigate('/customer/profile');
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Header */}
        <div className="flex items-center justify-between h-16 sm:h-18 md:h-20 lg:h-24 xl:h-28 transition-all duration-300">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl.startsWith('http') ? settings.logoUrl : `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}${settings.logoUrl}`}
                  alt={settings.siteName}
                  className="w-36 lg:w-44 h-auto object-contain mr-3 transition-all duration-300 hover:scale-105"
                />
              ) : null}
              {!settings?.hideSiteNameAndDescription && (
                <div>
                  <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-orange-600">
                    {settings?.siteName ? (
                      <>
                        {settings.siteName.split(' ')[0]}<span className="text-gray-900">{settings.siteName.split(' ').slice(1).join(' ')}</span>
                      </>
                    ) : (
                      <>
                        Pasar<span className="text-gray-900">Antar</span>
                      </>
                    )}
                  </h1>
                  <p className="hidden lg:block text-xs text-gray-500 -mt-1">
                    {settings?.siteDescription || 'Protein Segar Langsung Antar'}
                  </p>
                </div>
              )}
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8" ref={searchDropdownRef}>
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <div className={`relative w-full transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={20} className={isSearchFocused ? 'text-orange-600' : 'text-gray-400'} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onClick={() => setIsSearchFocused(true)}
                  className={`block w-full pl-12 pr-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                    isSearchFocused ? 'border-orange-500 bg-white shadow-lg' : 'border-gray-200'
                  }`}
                  placeholder="Cari daging ayam, ikan, sapi segar..."
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      onSearch('');
                      setSearchResults([]);
                    }}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <X size={18} className="text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              
              {/* Search Dropdown */}
              {isSearchFocused && (isSearching || searchResults.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                        <span className="ml-2 text-sm text-gray-500">Mencari produk...</span>
                      </div>
                    ) : (
                      searchResults.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleProductClick(product);
                        }}
                        className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                      >
                        <img
                          src={product.imageUrl ?
                            (product.imageUrl.startsWith('http') ? product.imageUrl : `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}${product.imageUrl}`) :
                            `https://picsum.photos/seed/${product.id}/60/60.jpg`
                          }
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 text-left">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                            {product.name}
                          </h4>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {product.variants[0]?.weight} • {product.variants[0]?.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                          </p>
                        </div>
                      </button>
                    ))
                    )}
                  </div>
                  {!isSearching && searchResults.length > 0 && (
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleSeeAllResults}
                        className="w-full text-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Lihat semua hasil untuk "{searchQuery}"
                      </button>
                    </div>
                  )}
                  {!isSearching && searchResults.length === 0 && searchQuery.trim() && (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <p className="text-sm">Tidak ada produk yang ditemukan untuk "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Mobile User Account */}
            <div className="lg:hidden relative" ref={userMenuRef}>
              {isAuthenticated ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                >
                  {customer?.avatarUrl ? (
                    <img
                      src={customer.avatarUrl}
                      alt={customer.name}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <User size={24} />
                  )}
                </button>
              ) : (
                <button
                  onClick={handleCustomerLogin}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                >
                  <User size={24} />
                </button>
              )}

              {/* User dropdown menu */}
              {isAuthenticated && isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{customer?.name}</p>
                    <p className="text-xs text-gray-500">{customer?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleCustomerDashboard}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User size={16} className="mr-3" />
                      Dashboard
                    </button>
                    <button
                      onClick={handleCustomerOrders}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ShoppingCart size={16} className="mr-3" />
                      Pesanan Saya
                    </button>
                    <button
                      onClick={handleCustomerProfile}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User size={16} className="mr-3" />
                      Profil Saya
                    </button>
                  </div>
                  <div className="py-1 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-3" />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop User Account */}
            <div className="hidden lg:block relative" ref={userMenuRef}>
              {isAuthenticated ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                >
                  {customer?.avatarUrl ? (
                    <img
                      src={customer.avatarUrl}
                      alt={customer.name}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <User size={20} />
                  )}
                  <span className="text-sm font-medium">{customer?.name}</span>
                  <ChevronDown size={16} />
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCustomerLogin}
                    className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors duration-200"
                  >
                    Masuk
                  </button>
                  <button
                    onClick={handleCustomerRegister}
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors duration-200"
                  >
                    Daftar
                  </button>
                </div>
              )}

              {/* User dropdown menu */}
              {isAuthenticated && isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{customer?.name}</p>
                    <p className="text-xs text-gray-500">{customer?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleCustomerDashboard}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User size={16} className="mr-3" />
                      Dashboard
                    </button>
                    <button
                      onClick={handleCustomerOrders}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ShoppingCart size={16} className="mr-3" />
                      Pesanan Saya
                    </button>
                    <button
                      onClick={handleCustomerProfile}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User size={16} className="mr-3" />
                      Profil Saya
                    </button>
                  </div>
                  <div className="py-1 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-3" />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>


            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              <ShoppingCart size={24} />
              {cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cart.itemCount > 99 ? '99+' : cart.itemCount}
                </span>
              )}
            </button>

            {/* Desktop Menu Button */}
            <button
              onClick={onMenuClick}
              className="hidden lg:flex p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>


          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-4" ref={searchDropdownRef}>
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                onClick={() => setIsSearchFocused(true)}
                className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                placeholder="Cari produk segar..."
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    onSearch('');
                    setSearchResults([]);
                  }}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <X size={18} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            {/* Mobile Search Dropdown */}
            {isSearchFocused && (isSearching || searchResults.length > 0) && (
              <div className="absolute top-full left-4 right-4 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                      <span className="ml-2 text-sm text-gray-500">Mencari produk...</span>
                    </div>
                  ) : (
                    searchResults.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleProductClick(product);
                      }}
                      className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                    >
                      <img
                        src={product.imageUrl ?
                          (product.imageUrl.startsWith('http') ? product.imageUrl : `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}${product.imageUrl}`) :
                          `https://picsum.photos/seed/${product.id}/60/60.jpg`
                        }
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 text-left">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {product.variants[0]?.weight} • {product.variants[0]?.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                        </p>
                      </div>
                    </button>
                  ))
                  )}
                </div>
                {!isSearching && searchResults.length > 0 && (
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleSeeAllResults}
                      className="w-full text-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Lihat semua hasil
                    </button>
                  </div>
                )}
                {!isSearching && searchResults.length === 0 && searchQuery.trim() && (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <p className="text-sm">Tidak ada produk yang ditemukan untuk "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Customer Auth Modal */}
      <Modal
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        title="Masuk atau Daftar"
        size="md"
        showCloseButton={true}
      >
        <CustomerAuthModal
          isOpen={isAuthModalOpen}
          onClose={handleAuthModalClose}
          initialView={authModalView}
        />
      </Modal>
    </header>
  );
}