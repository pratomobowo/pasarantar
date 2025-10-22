import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Mail, Clock, Heart, Users, Award, Truck } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';
import MobileMenu from '../components/MobileMenu';
import CartDrawer from '../components/CartDrawer';

export default function AboutPage() {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { toast, hideToast } = useCart();
  const { getFormattedPhone, createTelUrl, settings } = useSettings();

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

  const values = [
    {
      icon: Heart,
      title: 'Kualitas Terjamin',
      description: 'Kami hanya menyediakan produk protein segar berkualitas tinggi yang telah melalui seleksi ketat.'
    },
    {
      icon: Users,
      title: 'Pelayanan Terbaik',
      description: 'Tim kami selalu siap membantu Anda dengan pelayanan yang ramah dan profesional.'
    },
    {
      icon: Award,
      title: 'Harga Bersaing',
      description: 'Dapatkan produk premium dengan harga yang kompetitif dan transparan.'
    },
    {
      icon: Truck,
      title: 'Pengantaran Cepat',
      description: 'Pesanan Anda akan diantar dengan cepat dan aman langsung ke rumah Anda.'
    }
  ];

  const milestones = [
    {
      year: '2020',
      title: 'Awal Perjalanan',
      description: 'PasarAntar didirikan dengan visi menyediakan protein segar berkualitas untuk masyarakat.'
    },
    {
      year: '2021',
      title: 'Ekspansi Produk',
      description: 'Menambah berbagai jenis produk protein dan memperluas jangkauan pengantaran.'
    },
    {
      year: '2022',
      title: 'Digitalisasi',
      description: 'Meluncurkan platform online untuk memudahkan pelanggan berbelanja dari rumah.'
    },
    {
      year: '2023',
      title: 'Inovasi Layanan',
      description: 'Menambahkan fitur pelacakan pesanan real-time dan sistem pembayaran yang lebih aman.'
    },
    {
      year: '2024',
      title: 'Pertumbuhan Pesat',
      description: 'Melayani ribuan pelanggan setia di seluruh wilayah dengan kepuasan tertinggi.'
    }
  ];

  const team = [
    {
      name: 'Ahmad Wijaya',
      position: 'CEO & Founder',
      description: 'Berpengalaman lebih dari 10 tahun di industri makanan dan minuman.'
    },
    {
      name: 'Siti Nurhaliza',
      position: 'COO',
      description: 'Ahli dalam manajemen operasional dan rantai pasokan produk segar.'
    },
    {
      name: 'Budi Santoso',
      position: 'Head of Quality',
      description: 'Memastikan semua produk memenuhi standar kualitas tertinggi.'
    },
    {
      name: 'Dewi Kartika',
      position: 'Customer Experience Manager',
      description: 'Bertanggung jawab atas kepuasan pelanggan dan pengembangan layanan.'
    }
  ];

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
              Tentang <span className="text-orange-600">PasarAntar</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Platform e-commerce terpercaya untuk produk protein segar berkualitas tinggi 
              dengan pengantaran cepat dan pelayanan terbaik.
            </p>
          </div>
        </div>
      </section>

      {/* About Us Content */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Cerita Kami
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                PasarAntar lahir dari keinginan sederhana untuk menyediakan akses mudah 
                kepada produk protein segar berkualitas tinggi bagi masyarakat Indonesia.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Kami memahami betapa pentingnya kualitas dan kesegaran dalam setiap produk 
                yang Anda konsumsi. Oleh karena itu, kami bekerja sama dengan peternak dan 
                supplier terpercaya untuk memastikan setiap produk yang kami tawarkan 
                memenuhi standar kualitas tertinggi.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Dengan teknologi dan sistem logistik yang modern, kami berkomitmen untuk 
                menghadirkan pengalaman berbelanja yang nyaman, aman, dan menyenangkan 
                bagi setiap pelanggan.
              </p>
              <Link
                to="/"
                className="inline-flex items-center bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200"
              >
                Mulai Berbelanja
                <ArrowRight className="ml-2" size={20} />
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src="https://picsum.photos/seed/pasarantar-about/600/600.jpg"
                  alt="About PasarAntar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nilai-Nilai Kami
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Prinsip yang memandu setiap langkah kami dalam melayani Anda
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="text-orange-600" size={40} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Perjalanan Kami
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Milestone penting dalam evolusi PasarAntar
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-orange-200"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative lg:grid lg:grid-cols-2 gap-8 items-center ${index % 2 === 0 ? '' : 'lg:grid-flow-col-dense'}`}>
                  {/* Timeline Dot */}
                  <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-600 rounded-full border-4 border-white shadow-lg"></div>
                  
                  {/* Content */}
                  <div className={`bg-white p-6 rounded-xl shadow-lg ${index % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12 lg:justify-self-end'}`}>
                    <div className="text-orange-600 font-bold text-lg mb-2">{milestone.year}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                  
                  {/* Empty space for alternating layout */}
                  <div className={index % 2 === 0 ? 'lg:justify-self-end' : 'lg:justify-self-start'}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Tim Kami
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Orang-orang di balik kesuksesan PasarAntar
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={`https://picsum.photos/seed/team-${index}/400/400.jpg`}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-orange-600 font-medium mb-3">{member.position}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Hubungi Kami
            </h2>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              Ada pertanyaan atau ingin berkolaborasi dengan kami? Jangan ragu untuk menghubungi.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Alamat</h3>
              <p className="text-orange-100">
                {settings?.address || 'Jl. Pasar Segar No. 123<br />Jakarta Selatan, 12345'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Telepon</h3>
              <p className="text-orange-100">
                <a
                  href={createTelUrl()}
                  className="hover:text-white transition-colors"
                >
                  {getFormattedPhone()}
                </a>
                <br />
                Senin - Minggu, 08:00 - 22:00
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Email</h3>
              <p className="text-orange-100">
                {settings?.email || 'info@pasarantar.com'}<br />
                {settings?.supportEmail || 'support@pasarantar.com'}
              </p>
            </div>
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