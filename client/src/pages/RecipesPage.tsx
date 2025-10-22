import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Clock, Users, ChefHat, BookOpen, Star, Filter, Grid, List, ShoppingCart, ArrowRight, Play } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { useCart } from '../contexts/CartContext';
import MobileMenu from '../components/MobileMenu';
import CartDrawer from '../components/CartDrawer';

interface Recipe {
  id: string;
  title: string;
  category: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  prepTime: number;
  cookTime: number;
  servings: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  products: string[];
}

export default function RecipesPage() {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast, hideToast } = useCart();

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleMenuClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleProductClick = (product: any) => {
    navigate(`/product/${product.slug}`);
  };


  // Dummy recipe data
  const recipes: Recipe[] = [
    {
      id: '1',
      title: 'Ayam Bakar Madu',
      category: 'ayam',
      difficulty: 'Mudah',
      prepTime: 30,
      cookTime: 45,
      servings: 4,
      rating: 4.8,
      reviews: 124,
      image: 'https://picsum.photos/seed/ayam-bakar-madu/400/300.jpg',
      description: 'Ayam bakar dengan bumbu madu yang manis dan gurih, sempurna untuk acara keluarga.',
      ingredients: [
        '1 kg daging ayam',
        '5 siung bawang putih',
        '3 sdm madu',
        '2 sdm kecap manis',
        '1 sdm minyak goreng',
        '1 sdt garam',
        '1/2 sdt merica',
        'Daun salam dan serai'
      ],
      instructions: [
        'Bersihkan ayam dan lumuri dengan garam dan merica',
        'Haluskan bawang putih dan campur dengan madu, kecap, dan minyak',
        'Marinasi ayam dengan bumbu selama minimal 30 menit',
        'Panggang ayam di oven dengan suhu 180°C selama 45 menit',
        'Balik ayam setiap 15 menit dan oles sisa bumbu',
        'Sajikan hangat dengan nasi dan lalapan'
      ],
      nutrition: {
        calories: 285,
        protein: 32,
        carbs: 12,
        fat: 14
      },
      products: ['Daging Ayam Segar']
    },
    {
      id: '2',
      title: 'Ikan Salmon Panggang',
      category: 'ikan',
      difficulty: 'Mudah',
      prepTime: 15,
      cookTime: 25,
      servings: 2,
      rating: 4.9,
      reviews: 89,
      image: 'https://picsum.photos/seed/salmon-panggang/400/300.jpg',
      description: 'Salmon panggang dengan lemon dan herbs yang sehat dan lezat.',
      ingredients: [
        '2 fillet ikan salmon',
        '1 buah lemon',
        '2 sdm olive oil',
        'Rosemary segar',
        'Garam dan merica',
        'Bawang merah'
      ],
      instructions: [
        'Panaskan oven hingga 200°C',
        'Lumuri salmon dengan olive oil, garam, dan merica',
        'Taruh di atas baking sheet dengan irisan lemon dan rosemary',
        'Panggang selama 12-15 menit',
        'Sajikan dengan sayuran panggang'
      ],
      nutrition: {
        calories: 320,
        protein: 35,
        carbs: 5,
        fat: 18
      },
      products: ['Ikan Salmon Segar']
    },
    {
      id: '3',
      title: 'Steak Daging Sapi Lada Hitam',
      category: 'daging-sapi',
      difficulty: 'Sedang',
      prepTime: 45,
      cookTime: 20,
      servings: 2,
      rating: 4.7,
      reviews: 156,
      image: 'https://picsum.photos/seed/steak-lada-hitam/400/300.jpg',
      description: 'Steak daging sapi dengan saus lada hitam yang khas dan lezat.',
      ingredients: [
        '300g daging sapi has dalam',
        '2 sdm lada hitam bubuk',
        '3 siung bawang putih',
        '1 sdm butter',
        'Kecap asin',
        'Garam',
        'Minyak goreng'
      ],
      instructions: [
        'Tumbuk kasar lada hitam',
        'Lumuri daging dengan lada, garam, dan minyak',
        'Diamkan selama 30 menit',
        'Panaskan wajan dan panggang daging sesuai tingkat kematangan',
        'Buat saus dengan menumis bawang putih, lada, dan butter',
        'Tuang saus di atas steak dan sajikan'
      ],
      nutrition: {
        calories: 410,
        protein: 42,
        carbs: 8,
        fat: 24
      },
      products: ['Daging Sapi Has Dalam']
    },
    {
      id: '4',
      title: 'Ayam Goreng Tepung Krispi',
      category: 'ayam',
      difficulty: 'Mudah',
      prepTime: 20,
      cookTime: 30,
      servings: 4,
      rating: 4.6,
      reviews: 203,
      image: 'https://picsum.photos/seed/ayam-goreng-tepung/400/300.jpg',
      description: 'Ayam goreng tepung yang krispi di luar dan juicy di dalam.',
      ingredients: [
        '1 kg daging ayam',
        '200g tepung terigu',
        '100g tepung maizena',
        '1 sdt baking powder',
        'Garam, merica, dan bumbu penyedap',
        'Es batu',
        'Minyak goreng'
      ],
      instructions: [
        'Potong ayam sesuai selera dan lumuri garam merica',
        'Buat adonan basah dengan mencampur tepung terigu, air es, dan bumbu',
        'Buat adonan kering dengan mencampur tepung terigu, maizena, dan baking powder',
        'Celupkan ayam ke adonan basah lalu ke adonan kering',
        'Goreng dalam minyak panas hingga kuning keemasan',
        'Tiriskan dan sajikan dengan saus'
      ],
      nutrition: {
        calories: 295,
        protein: 28,
        carbs: 18,
        fat: 14
      },
      products: ['Daging Ayam Segar']
    },
    {
      id: '5',
      title: 'Sup Ikan Batam',
      category: 'ikan',
      difficulty: 'Mudah',
      prepTime: 25,
      cookTime: 35,
      servings: 6,
      rating: 4.5,
      reviews: 67,
      image: 'https://picsum.photos/seed/sup-ikan-batam/400/300.jpg',
      description: 'Sup ikan segar dengan kuah asam pedas khas Batam.',
      ingredients: [
        '500g ikan kakap',
        '2 buah tomat',
        '1 buah nanas',
        'Cabai merah',
        'Bawang merah dan bawang putih',
        'Jeruk nipis',
        'Daun kemangi',
        'Garam dan gula'
      ],
      instructions: [
        'Bersihkan ikan dan potong sesuai selera',
        'Rebus air hingga mendidih',
        'Masukkan bawang merah, bawang putih, dan cabai',
        'Tambahkan tomat dan nanas',
        'Masukkan ikan dan masak hingga matang',
        'Tambahkan perasan jeruk nipis dan daun kemangi',
        'Bumbui dengan garam dan gula secukupnya'
      ],
      nutrition: {
        calories: 165,
        protein: 22,
        carbs: 8,
        fat: 5
      },
      products: ['Ikan Kakap Segar']
    },
    {
      id: '6',
      title: 'Sate Maranggi',
      category: 'daging-sapi',
      difficulty: 'Sedang',
      prepTime: 60,
      cookTime: 30,
      servings: 4,
      rating: 4.8,
      reviews: 142,
      image: 'https://picsum.photos/seed/sate-maranggi/400/300.jpg',
      description: 'Sate khas Purwakarta dengan bumbu kacang yang lezat.',
      ingredients: [
        '500g daging sapi has luar',
        '250g kacang tanah',
        'Kecap manis',
        'Cabai merah',
        'Bawang putih',
        'Jeruk limau',
        'Garam dan gula merah'
      ],
      instructions: [
        'Potong daging sapi bentuk dadu',
        'Marinasi dengan kecap dan bumbu halus selama 1 jam',
        'Tusuk daging ke tusuk sate',
        'Bakar di atas arang api sambil dioles kecap',
        'Buat bumbu kacang dengan menghaluskan kacang yang sudah digoreng',
        'Campur dengan cabai, bawang, dan kecap',
        'Sajikan sate dengan bumbu kacang dan jeruk limau'
      ],
      nutrition: {
        calories: 275,
        protein: 26,
        carbs: 15,
        fat: 14
      },
      products: ['Daging Sapi Has Luar']
    },
    {
      id: '7',
      title: 'Ayam Woku Kemangi',
      category: 'ayam',
      difficulty: 'Sedang',
      prepTime: 30,
      cookTime: 40,
      servings: 4,
      rating: 4.7,
      reviews: 98,
      image: 'https://picsum.photos/seed/ayam-woku/400/300.jpg',
      description: 'Ayam dengan bumbu woku khas Manado yang pedas dan aromatik.',
      ingredients: [
        '1 kg ayam',
        '2 ikat kemangi',
        'Daun jeruk, daun salam, daun kunyit',
        'Cabai rawit',
        'Bawang merah, bawang putih',
        'Jahe, kunyit, serai',
        'Jeruk nipis'
      ],
      instructions: [
        'Cuci bersih ayam dan potong sesuai selera',
        'Haluskan semua bumbu kecuali daun-daunan',
        'Tumis bumbu hingga harum',
        'Masukkan ayam dan aduk hingga berubah warna',
        'Tambahkan air dan masak hingga ayam empuk',
        'Masukkan daun-daunan dan kemangi',
        'Tambahkan perasan jeruk nipis sebelum diangkat'
      ],
      nutrition: {
        calories: 245,
        protein: 28,
        carbs: 10,
        fat: 12
      },
      products: ['Daging Ayam Segar']
    },
    {
      id: '8',
      title: 'Pepes Ikan Mas',
      category: 'ikan',
      difficulty: 'Mudah',
      prepTime: 35,
      cookTime: 45,
      servings: 4,
      rating: 4.6,
      reviews: 76,
      image: 'https://picsum.photos/seed/pepes-ikan-mas/400/300.jpg',
      description: 'Ikan mas dibungkus daun pisang dengan bumbu khas Sunda.',
      ingredients: [
        '4 ekor ikan mas',
        'Daun pisang',
        'Cabai merah',
        'Bawang merah, bawang putih',
        'Kencur, kunyit',
        'Kemangi',
        'Tomat',
        'Garam, gula, dan kaldu bubuk'
      ],
      instructions: [
        'Bersihkan ikan dan lumuri dengan jeruk nipis',
        'Haluskan semua bumbu',
        'Campur ikan dengan bumbu halus dan irisan tomat',
        'Ambil selembar daun pisang, taruh ikan dan bumbu',
        'Bungkus rapat dan semat dengan lidi',
        'Kukus selama 45 menit hingga matang',
        'Bakar sebentar di atas api agar lebih harum'
      ],
      nutrition: {
        calories: 195,
        protein: 24,
        carbs: 8,
        fat: 8
      },
      products: ['Ikan Mas Segar']
    }
  ];

  const categories = [
    { id: 'all', name: 'Semua', icon: '🍽️' },
    { id: 'ayam', name: 'Ayam', icon: '🐔' },
    { id: 'ikan', name: 'Ikan', icon: '🐟' },
    { id: 'daging-sapi', name: 'Daging Sapi', icon: '🐄' },
    { id: 'marinasi', name: 'Marinasi', icon: '🍖' }
  ];

  const difficulties = [
    { id: 'all', name: 'Semua Level' },
    { id: 'Mudah', name: 'Mudah' },
    { id: 'Sedang', name: 'Sedang' },
    { id: 'Sulit', name: 'Sulit' }
  ];

  // Filter recipes based on search, category, and difficulty
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || recipe.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 overflow-hidden">
        {/* Background Ornaments */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Wave pattern */}
          <svg className="absolute bottom-0 left-0 w-full h-32 text-orange-100 opacity-50" preserveAspectRatio="none" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
          </svg>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Resep <span className="text-orange-600">Masakan</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Temukan berbagai resep lezat dengan produk segar dari PasarAntar. 
              Dari ayam, ikan, hingga daging sapi, semua ada di sini!
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={24} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-lg"
                  placeholder="Cari resep masakan..."
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600">×</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                    selectedCategory === category.id
                      ? 'bg-orange-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty.id} value={difficulty.id}>
                    {difficulty.name}
                  </option>
                ))}
              </select>
              
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recipes Grid/List */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery ? `Hasil Pencarian: "${searchQuery}"` : 'Semua Resep'}
            </h2>
            <p className="text-gray-600">{filteredRecipes.length} resep ditemukan</p>
          </div>
          
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-16">
              <ChefHat size={64} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak ada resep ditemukan</h3>
              <p className="text-gray-600 mb-6">
                Tidak ada resep yang cocok dengan pencarian "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                }}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Hapus filter
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRecipes.map((recipe) => (
                <div key={recipe.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200">
                  <div className="relative">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                      {recipe.difficulty}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{recipe.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {recipe.prepTime + recipe.cookTime} menit
                      </div>
                      <div className="flex items-center">
                        <Users size={14} className="mr-1" />
                        {recipe.servings} porsi
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        <Star size={14} className="fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{recipe.rating}</span>
                        <span className="text-sm text-gray-500 ml-1">({recipe.reviews})</span>
                      </div>
                    </div>
                    
                    <Link
                      to={`/recipes/${recipe.id}`}
                      className="block w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200 text-center"
                    >
                      Lihat Resep
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecipes.map((recipe) => (
                <div key={recipe.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3">
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{recipe.title}</h3>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{recipe.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {recipe.prepTime + recipe.cookTime} menit
                        </div>
                        <div className="flex items-center">
                          <Users size={14} className="mr-1" />
                          {recipe.servings} porsi
                        </div>
                        <div className="flex items-center">
                          <ChefHat size={14} className="mr-1" />
                          {recipe.difficulty}
                        </div>
                        <div className="flex items-center">
                          <Star size={14} className="fill-yellow-400 text-yellow-400 mr-1" />
                          {recipe.rating} ({recipe.reviews})
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Link
                          to={`/recipes/${recipe.id}`}
                          className="flex-1 bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200 text-center"
                        >
                          Lihat Resep
                        </Link>
                        <button className="px-4 py-2 border border-orange-600 text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-colors duration-200">
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Butuh Bahan-bahan Segar?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Dapatkan semua bahan segar untuk resep favorit Anda di PasarAntar. 
            Kualitas terjamin dengan pengantaran cepat!
          </p>
          <Link
            to="/"
            className="inline-flex items-center bg-white text-orange-600 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 text-lg shadow-xl"
          >
            Belanja Sekarang
            <ArrowRight size={24} className="ml-2" />
          </Link>
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
}