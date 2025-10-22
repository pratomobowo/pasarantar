import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Search, HelpCircle, MessageCircle, Phone, Clock, Truck, Shield, CreditCard, Package, RefreshCw } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';
import MobileMenu from '../components/MobileMenu';
import CartDrawer from '../components/CartDrawer';

export default function QnAPage() {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const { toast, hideToast } = useCart();
  const {
    getFormattedPhone,
    createWhatsAppUrl,
    createTelUrl,
    getWhatsAppMessages
  } = useSettings();

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

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleAllCategories = () => {
    if (expandedCategories.length === faqCategories.length) {
      setExpandedCategories([]);
    } else {
      setExpandedCategories(faqCategories.map(cat => cat.id));
    }
  };

  const faqCategories = [
    {
      id: 'general',
      title: 'Informasi Umum',
      icon: HelpCircle,
      color: 'bg-blue-100 text-blue-600',
      questions: [
        {
          question: 'Apa itu PasarAntar?',
          answer: 'PasarAntar adalah platform e-commerce khusus produk protein segar yang menyediakan daging ayam, ikan, daging sapi, dan produk marinasi berkualitas tinggi dengan pengantaran cepat ke rumah Anda.'
        },
        {
          question: 'Di area mana saja PasarAntar beroperasi?',
          answer: 'Saat ini PasarAntar beroperasi di wilayah Jakarta, Bogor, Depok, Tangerang, dan Bekasi (Jabodetabek). Kami sedang dalam proses ekspansi ke kota-kota besar lainnya di Indonesia.'
        },
        {
          question: 'Apakah PasarAntar memiliki toko fisik?',
          answer: 'Ya, kami memiliki toko fisik di Jl. Pasar Segar No. 123, Jakarta Selatan. Anda dapat datang langsung untuk berbelanja atau mengambil pesanan yang telah dipesan online.'
        },
        {
          question: 'Bagaimana cara memastikan kualitas produk di PasarAntar?',
          answer: 'Kami bekerja sama dengan peternak dan supplier terpercaya yang telah melalui proses seleksi ketat. Semua produk melalui quality control sebelum dikirim kepada pelanggan dan kami menjamin kesegaran produk.'
        }
      ]
    },
    {
      id: 'ordering',
      title: 'Pemesanan',
      icon: Package,
      color: 'bg-green-100 text-green-600',
      questions: [
        {
          question: 'Bagaimana cara memesan produk di PasarAntar?',
          answer: 'Anda dapat memesan melalui website atau aplikasi PasarAntar. Pilih produk yang diinginkan, tambahkan ke keranjang, lengkapi data pengiriman, pilih metode pembayaran, dan konfirmasi pesanan.'
        },
        {
          question: 'Apakah ada minimum order?',
          answer: 'Minimum order adalah Rp 50.000 untuk wilayah Jakarta dan Rp 100.000 untuk wilayah di luar Jakarta. Minimum order dapat berubah sewaktu-waktu tergantung promo yang berlaku.'
        },
        {
          question: 'Bisakah saya memesan untuk hari yang sama?',
          answer: 'Ya, kami menerima pesanan same day dengan batas waktu pemesanan pukul 10:00 WIB untuk pengantaran hari yang sama. Pesanan setelah jam tersebut akan dikirimkan keesokan harinya.'
        },
        {
          question: 'Bisakah saya memesan untuk hari mendatang?',
          answer: 'Tentu saja. Anda dapat menjadwalkan pengantaran hingga 7 hari ke depan. Pilih opsi "Jadwalkan Pengantaran" saat checkout.'
        },
        {
          question: 'Bagaimana jika produk yang saya pesan habis?',
          answer: 'Jika produk yang Anda pesan habis, tim kami akan menghubungi Anda untuk menawarkan alternatif produk serupa atau memberikan opsi pembatalan pesanan.'
        }
      ]
    },
    {
      id: 'payment',
      title: 'Pembayaran',
      icon: CreditCard,
      color: 'bg-purple-100 text-purple-600',
      questions: [
        {
          question: 'Metode pembayaran apa saja yang tersedia?',
          answer: 'Kami menerima berbagai metode pembayaran: Transfer Bank (BCA, Mandiri, BNI, BRI), E-wallet (OVO, GoPay, DANA, ShopeePay), Kartu Kredit/Debit, dan Pembayaran Tunai (COD).'
        },
        {
          question: 'Apakah ada biaya tambahan untuk pembayaran dengan kartu kredit?',
          answer: 'Tidak, tidak ada biaya tambahan untuk pembayaran dengan kartu kredit. Harga yang tertera adalah harga final.'
        },
        {
          question: 'Bagaimana cara membayar dengan COD (Cash on Delivery)?',
          answer: 'Pilih metode pembayaran "Bayar di Tempat" saat checkout. Kurir kami akan menerima pembayaran tunai saat produk sampai. Pastikan Anda menyiapkan uang pas.'
        },
        {
          question: 'Apakah saya bisa menggunakan voucher atau promo?',
          answer: 'Ya, Anda dapat menggunakan voucher atau kode promo saat checkout. Masukkan kode promo di kolom yang tersedia sebelum melakukan pembayaran.'
        },
        {
          question: 'Bagaimana jika pembayaran saya gagal?',
          answer: 'Jika pembayaran gagal, Anda akan menerima notifikasi dan dapat mencoba kembali. Pesanan akan tetap aktif selama 1 jam untuk pembayaran ulang.'
        }
      ]
    },
    {
      id: 'delivery',
      title: 'Pengantaran',
      icon: Truck,
      color: 'bg-orange-100 text-orange-600',
      questions: [
        {
          question: 'Berapa lama waktu pengantaran?',
          answer: 'Waktu pengantaran bervariasi tergantung lokasi: Jakarta (1-3 jam), Bogor/Depok/Tangerang/Bekasi (2-4 jam). Waktu pengantaran dapat lebih lama saat jam sibuk atau kondisi lalu lintas padat.'
        },
        {
          question: 'Apakah ada biaya pengantaran?',
          answer: 'Biaya pengantaran bervariasi tergantung jarak: Jakarta (Rp 10.000), Jabodetabek (Rp 15.000-20.000). Pengantaran gratis untuk pembelian minimal Rp 200.000.'
        },
        {
          question: 'Jam operasional pengantaran?',
          answer: 'Kami mengantarkan pesanan setiap hari Senin-Minggu, pukul 08:00-22:00 WIB. Pesanan yang masuk setelah pukul 20:00 akan dikirimkan keesokan harinya.'
        },
        {
          question: 'Bagaimana jika saya tidak ada di rumah saat pengantaran?',
          answer: 'Kurir akan mencoba menghubungi Anda. Jika tidak dapat dihubungi, pesanan akan dikembalikan ke gudang dan dapat diantar kembali dengan biaya tambahan atau diambil di toko kami.'
        },
        {
          question: 'Bisakah saya melacak pesanan saya?',
          answer: 'Ya, Anda dapat melacak status pesanan melalui website atau aplikasi. Kami akan mengirimkan notifikasi saat pesanan diproses, dikirim, dan sampai di tujuan.'
        }
      ]
    },
    {
      id: 'products',
      title: 'Produk',
      icon: Package,
      color: 'bg-red-100 text-red-600',
      questions: [
        {
          question: 'Apakah semua produk dijamin halal?',
          answer: 'Ya, semua produk daging yang kami jual telah bersertifikat halal dari MUI. Kami sangat menjaga kehalalan produk yang kami jual.'
        },
        {
          question: 'Bagaimana cara menyimpan produk setelah diterima?',
          answer: 'Produk segar sebaiknya segera dimasukkan ke kulkas. Daging ayam dan ikan dapat disimpan di freezer hingga 3 bulan. Daging sapi hingga 6 bulan. Produk marinasi sebaiknya dikonsumsi dalam 2 hari.'
        },
        {
          question: 'Apakah produk sudah dibersihkan?',
          answer: 'Ya, semua produk sudah melalui proses pembersihan standar. Namun, kami tetap menyarankan untuk mencuci kembali produk sebelum diolah.'
        },
        {
          question: 'Apakah tersedia produk organik?',
          answer: 'Ya, kami menyediakan pilihan produk organik untuk ayam dan daging sapi. Produk organik memiliki label khusus dan harga yang berbeda.'
        },
        {
          question: 'Bisakah saya request potongan khusus?',
          answer: 'Ya, Anda dapat memberikan catatan khusus untuk potongan saat pemesanan. Kami akan berusaha memenuhi request sesuai ketersediaan.'
        }
      ]
    },
    {
      id: 'returns',
      title: 'Pengembalian & Refund',
      icon: RefreshCw,
      color: 'bg-yellow-100 text-yellow-600',
      questions: [
        {
          question: 'Apa kebijakan pengembalian produk?',
          answer: 'Kami menerima pengembalian produk jika produk tidak segar, salah kirim, atau rusak saat diterima. Pengembalian harus diajukan maksimal 2 jam setelah produk diterima.'
        },
        {
          question: 'Bagaimana cara mengajukan pengembalian?',
          answer: 'Hubungi customer service kami melalui WhatsApp atau telepon. Sertakan foto produk dan nomor pesanan. Tim kami akan memproses pengembalian Anda.'
        },
        {
          question: 'Berapa lama proses refund?',
          answer: 'Refund akan diproses dalam 2-3 hari kerja. Untuk pembayaran dengan e-wallet, refund lebih cepat (1-2 hari). Untuk transfer bank, 3-5 hari kerja.'
        },
        {
          question: 'Apakah semua produk bisa dikembalikan?',
          answer: 'Produk yang sudah dimasak atau diolah tidak dapat dikembalikan. Produk dengan kemasan yang sudah dibuka juga tidak dapat dikembalikan kecuali ada cacat produk.'
        },
        {
          question: 'Bagaimana jika saya tidak puas dengan produk?',
          answer: 'Jika Anda tidak puas dengan produk, silakan hubungi customer service kami. Kami akan memberikan solusi terbaik, bisa berupa penggantian produk atau refund.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Akun & Keamanan',
      icon: Shield,
      color: 'bg-indigo-100 text-indigo-600',
      questions: [
        {
          question: 'Apakah saya harus membuat akun untuk berbelanja?',
          answer: 'Anda dapat berbelanja sebagai tamu, namun kami merekomendasikan membuat akun untuk pengalaman berbelanja yang lebih baik dan tracking pesanan yang mudah.'
        },
        {
          question: 'Bagaimana cara membuat akun?',
          answer: 'Klik tombol "Daftar" di bagian atas website. Isi data diri Anda dengan lengkap dan valid. Anda akan menerima email verifikasi untuk mengaktifkan akun.'
        },
        {
          question: 'Lupa kata sandi? Bagaimana cara reset?',
          answer: 'Klik "Lupa Kata Sandi" di halaman login. Masukkan email Anda dan kami akan mengirimkan link untuk reset kata sandi.'
        },
        {
          question: 'Apakah data saya aman?',
          answer: 'Ya, kami menjaga keamanan data Anda dengan enkripsi SSL dan tidak akan membagikan data pribadi Anda kepada pihak ketiga tanpa persetujuan Anda.'
        },
        {
          question: 'Bisakah saya mengubah data akun?',
          answer: 'Ya, Anda dapat mengubah data akun melalui menu "Profil" setelah login. Beberapa data seperti email memerlukan verifikasi ulang.'
        }
      ]
    }
  ];

  // Filter questions based on search query
  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0 || !searchQuery);

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
              Pusat <span className="text-orange-600">Bantuan</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Temukan jawaban untuk pertanyaan umum tentang PasarAntar. 
              Jika tidak menemukan jawaban yang Anda cari, jangan ragu menghubungi kami.
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
                  placeholder="Cari pertanyaan..."
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <ChevronUp size={24} className="text-gray-400 hover:text-gray-600 rotate-45" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              to="/contact"
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <MessageCircle className="text-orange-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Hubungi Kami</h3>
                  <p className="text-sm text-gray-600">Butuh bantuan langsung?</p>
                </div>
              </div>
            </Link>
            
            <a
              href={createTelUrl()}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Phone className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Telepon</h3>
                  <p className="text-sm text-gray-600">{getFormattedPhone()}</p>
                </div>
              </div>
            </a>
            
            <a
              href={createWhatsAppUrl(getWhatsAppMessages().GENERAL_INQUIRY)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-green-600 p-3 rounded-lg">
                  <MessageCircle className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                  <p className="text-sm text-gray-600">Chat dengan kami</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {searchQuery ? `Hasil Pencarian: "${searchQuery}"` : 'Pertanyaan yang Sering Diajukan'}
            </h2>
            <button
              onClick={toggleAllCategories}
              className="text-orange-600 hover:text-orange-700 font-medium flex items-center"
            >
              {expandedCategories.length === faqCategories.length ? 'Tutup Semua' : 'Buka Semua'}
              {expandedCategories.length === faqCategories.length ? 
                <ChevronUp size={20} className="ml-2" /> : 
                <ChevronDown size={20} className="ml-2" />
              }
            </button>
          </div>
          
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <HelpCircle size={64} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak ada hasil</h3>
              <p className="text-gray-600 mb-6">
                Tidak ada pertanyaan yang cocok dengan pencarian "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Hapus pencarian
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredCategories.map((category) => {
                const Icon = category.icon;
                const isExpanded = expandedCategories.includes(category.id) || searchQuery;
                
                return (
                  <div key={category.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <button
                      onClick={() => !searchQuery && toggleCategory(category.id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${category.color}`}>
                          <Icon size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                        <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
                          {category.questions.length}
                        </span>
                      </div>
                      {!searchQuery && (
                        isExpanded ? 
                          <ChevronUp size={20} className="text-gray-400" /> : 
                          <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </button>
                    
                    {(isExpanded || searchQuery) && (
                      <div className="border-t border-gray-100">
                        {category.questions.map((item, index) => (
                          <details 
                            key={index} 
                            className="px-6 py-4 border-b border-gray-100 last:border-b-0"
                            open={searchQuery ? true : undefined}
                          >
                            <summary className="font-medium text-gray-900 cursor-pointer hover:text-orange-600 transition-colors duration-200 pr-8">
                              {item.question}
                            </summary>
                            <p className="mt-3 text-gray-600 leading-relaxed">
                              {item.answer}
                            </p>
                          </details>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Still Need Help Section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Masih Butuh Bantuan?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Tim customer service kami siap membantu Anda menjawab pertanyaan atau menyelesaikan masalah yang Anda hadapi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-orange-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200 text-lg shadow-xl flex items-center justify-center"
            >
              <MessageCircle size={24} className="mr-2" />
              Hubungi Kami
            </Link>
            <a
              href={createTelUrl()}
              className="bg-white text-orange-600 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 text-lg shadow-xl border-2 border-orange-600 flex items-center justify-center"
            >
              <Phone size={24} className="mr-2" />
              {getFormattedPhone()}
            </a>
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