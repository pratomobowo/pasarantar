import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Users, ChefHat, Star, ShoppingCart, Play, Facebook, Twitter, Instagram, Music, MessageCircle, ArrowLeft, Share2, Bookmark } from 'lucide-react';
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

export default function RecipeDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const { toast, hideToast } = useCart();

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
      image: 'https://picsum.photos/seed/ayam-bakar-madu/800/400.jpg',
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
      image: 'https://picsum.photos/seed/salmon-panggang/800/400.jpg',
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
      image: 'https://picsum.photos/seed/steak-lada-hitam/800/400.jpg',
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
      image: 'https://picsum.photos/seed/ayam-goreng-tepung/800/400.jpg',
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
      image: 'https://picsum.photos/seed/sup-ikan-batam/800/400.jpg',
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
      image: 'https://picsum.photos/seed/sate-maranggi/800/400.jpg',
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
      image: 'https://picsum.photos/seed/ayam-woku/800/400.jpg',
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
      image: 'https://picsum.photos/seed/pepes-ikan-mas/800/400.jpg',
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

  // Related recipes based on category
  const getRelatedRecipes = (currentRecipe: Recipe) => {
    return recipes
      .filter(r => r.id !== currentRecipe.id && r.category === currentRecipe.category)
      .slice(0, 3);
  };

  useEffect(() => {
    // Find recipe by ID
    const foundRecipe = recipes.find(r => r.id === id);
    if (foundRecipe) {
      setRecipe(foundRecipe);
    }
  }, [id]);

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleMenuClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (query: string) => {
    // Search functionality
  };

  const handleProductClick = (product: any) => {
    navigate(`/product/${product.slug}`);
  };


  const shareRecipe = (platform: string) => {
    if (recipe) {
      const url = window.location.href;
      const text = `Coba resep ${recipe.title} dari PasarAntar!`;
      
      let shareUrl = '';
      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
          break;
        case 'instagram':
          shareUrl = `https://www.instagram.com/`;
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${text} ${url}`;
          break;
        case 'tiktok':
          shareUrl = `https://www.tiktok.com/@yourusername`;
          break;
      }
      
      if (shareUrl) {
        window.open(shareUrl, '_blank');
      }
    }
    setShowShareOptions(false);
  };

  if (!recipe) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Resep tidak ditemukan</h2>
          <Link to="/recipes" className="text-orange-600 hover:text-orange-700 font-medium">
            Kembali ke halaman resep
          </Link>
        </div>
      </div>
    );
  }

  const relatedRecipes = getRelatedRecipes(recipe);

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

      {/* Recipe Hero Section */}
      <section className="relative">
        <div className="relative h-96 md:h-[500px]">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          
          {/* Back Button */}
          <Link
            to="/recipes"
            className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors duration-200"
          >
            <ArrowLeft size={20} className="text-gray-900" />
          </Link>
          
          {/* Recipe Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
                <span className="capitalize">{recipe.category}</span>
                <span>•</span>
                <span>{recipe.difficulty}</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                {recipe.title}
              </h1>
              <p className="text-lg text-white/90 max-w-3xl">
                {recipe.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recipe Info & Actions */}
      <section className="py-8 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <Clock className="text-orange-600 mx-auto mb-2" size={24} />
              <p className="text-sm font-medium text-gray-900">Waktu Masak</p>
              <p className="text-sm text-gray-600">{recipe.prepTime + recipe.cookTime} menit</p>
            </div>
            <div className="text-center">
              <Users className="text-orange-600 mx-auto mb-2" size={24} />
              <p className="text-sm font-medium text-gray-900">Porsi</p>
              <p className="text-sm text-gray-600">{recipe.servings} orang</p>
            </div>
            <div className="text-center">
              <ChefHat className="text-orange-600 mx-auto mb-2" size={24} />
              <p className="text-sm font-medium text-gray-900">Kesulitan</p>
              <p className="text-sm text-gray-600">{recipe.difficulty}</p>
            </div>
            <div className="text-center">
              <Star className="text-orange-600 mx-auto mb-2" size={24} />
              <p className="text-sm font-medium text-gray-900">Rating</p>
              <p className="text-sm text-gray-600">{recipe.rating}/5.0 ({recipe.reviews})</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            
            <div className="relative">
              <button
                onClick={() => setShowShareOptions(!showShareOptions)}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                <Share2 size={18} className="mr-2" />
                Bagikan
              </button>
              
              {showShareOptions && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10">
                  <div className="flex gap-2">
                    <button
                      onClick={() => shareRecipe('facebook')}
                      className="p-2 rounded hover:bg-gray-100 transition-colors"
                      title="Share on Facebook"
                    >
                      <Facebook size={18} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => shareRecipe('twitter')}
                      className="p-2 rounded hover:bg-gray-100 transition-colors"
                      title="Share on Twitter"
                    >
                      <Twitter size={18} className="text-sky-500" />
                    </button>
                    <button
                      onClick={() => shareRecipe('instagram')}
                      className="p-2 rounded hover:bg-gray-100 transition-colors"
                      title="Share on Instagram"
                    >
                      <Instagram size={18} className="text-pink-600" />
                    </button>
                    <button
                      onClick={() => shareRecipe('whatsapp')}
                      className="p-2 rounded hover:bg-gray-100 transition-colors"
                      title="Share on WhatsApp"
                    >
                      <MessageCircle size={18} className="text-green-600" />
                    </button>
                    <button
                      onClick={() => shareRecipe('tiktok')}
                      className="p-2 rounded hover:bg-gray-100 transition-colors"
                      title="Share on TikTok"
                    >
                      <Music size={18} className="text-black" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
              <Play size={18} className="mr-2" />
              Tonton Video
            </button>
            
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
              <Bookmark size={18} className="mr-2" />
              Cetak Resep
            </button>
          </div>
        </div>
      </section>

      {/* Recipe Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Ingredients */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Bahan-bahan</h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-600 mr-3 mt-1">•</span>
                    <span className="text-gray-700">{ingredient}</span>
                  </li>
                ))}
              </ul>
              
              {/* Products from PasarAntar */}
              <div className="mt-8 p-4 bg-orange-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Produk dari PasarAntar</h3>
                <div className="space-y-2">
                  {recipe.products.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{product}</span>
                      <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                        Beli Sekarang
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Instructions */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Instruksi</h2>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium mr-4 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          
          {/* Nutrition Information */}
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Informasi Nutrisi (per porsi)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-orange-600">{recipe.nutrition.calories}</p>
                <p className="text-gray-600">Kalori</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-600">{recipe.nutrition.protein}g</p>
                <p className="text-gray-600">Protein</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-600">{recipe.nutrition.carbs}g</p>
                <p className="text-gray-600">Karbohidrat</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-600">{recipe.nutrition.fat}g</p>
                <p className="text-gray-600">Lemak</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Recipes */}
      {relatedRecipes.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Resep Terkait</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedRecipes.map((relatedRecipe) => (
                <Link
                  key={relatedRecipe.id}
                  to={`/recipes/${relatedRecipe.id}`}
                  className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="relative">
                    <img
                      src={relatedRecipe.image}
                      alt={relatedRecipe.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                      {relatedRecipe.difficulty}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-200">
                      {relatedRecipe.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{relatedRecipe.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock size={14} className="mr-1" />
                        {relatedRecipe.prepTime + relatedRecipe.cookTime} menit
                      </div>
                      <div className="flex items-center">
                        <Star size={14} className="fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{relatedRecipe.rating}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Butuh Bahan-bahan Segar?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Dapatkan semua bahan segar untuk resep ini di PasarAntar. 
            Kualitas terjamin dengan pengantaran cepat!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex-1 sm:flex-none bg-white text-orange-600 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 text-lg shadow-xl flex items-center justify-center">
              <ShoppingCart size={24} className="mr-2" />
              Beli Bahan-bahan
            </button>
            <Link
              to="/recipes"
              className="flex-1 sm:flex-none bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-medium hover:bg-white hover:text-orange-600 transition-colors duration-200 text-lg flex items-center justify-center"
            >
              Lihat Resep Lainnya
            </Link>
          </div>
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