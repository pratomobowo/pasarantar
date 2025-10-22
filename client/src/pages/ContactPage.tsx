import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Send, Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';
import MobileMenu from '../components/MobileMenu';
import CartDrawer from '../components/CartDrawer';

export default function ContactPage() {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { toast, hideToast } = useCart();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const {
    getFormattedPhone,
    createWhatsAppUrl,
    createTelUrl,
    getWhatsAppMessages,
    settings
  } = useSettings();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Alamat',
      content: settings?.contactAddress || 'Jl. Pasar Segar No. 123, Jakarta Selatan, 12345',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Phone,
      title: 'Telepon',
      content: getFormattedPhone(),
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Mail,
      title: 'Email',
      content: settings?.contactEmail || 'info@pasarantar.com',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Clock,
      title: 'Jam Operasional',
      content: 'Senin - Minggu, 08:00 - 22:00',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const socialMedia = [
    {
      icon: Facebook,
      name: 'Facebook',
      url: settings?.socialMediaLinks?.facebook || '#',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      icon: Instagram,
      name: 'Instagram',
      url: settings?.socialMediaLinks?.instagram || '#',
      color: 'bg-pink-600 hover:bg-pink-700'
    },
    {
      icon: Twitter,
      name: 'Twitter',
      url: settings?.socialMediaLinks?.twitter || '#',
      color: 'bg-sky-500 hover:bg-sky-600'
    },
    {
      icon: MessageCircle,
      name: 'WhatsApp',
      url: createWhatsAppUrl(),
      color: 'bg-green-600 hover:bg-green-700'
    }
  ];

  const faqs = [
    {
      question: 'Bagaimana cara memesan produk di PasarAntar?',
      answer: 'Anda dapat memesan produk melalui website kami atau aplikasi mobile. Pilih produk yang Anda inginkan, tambahkan ke keranjang, dan selesaikan pembayaran.'
    },
    {
      question: 'Apakah ada minimum order?',
      answer: 'Minimum order adalah Rp 50.000 untuk wilayah Jakarta dan Rp 100.000 untuk wilayah di luar Jakarta.'
    },
    {
      question: 'Berapa lama pengantaran?',
      answer: 'Pengantaran biasanya memakan waktu 1-3 jam tergantung lokasi dan kondisi lalu lintas.'
    },
    {
      question: 'Apakah produk dijamin segar?',
      answer: 'Ya, semua produk kami dijamin segar. Jika Anda menerima produk yang tidak segar, kami akan menggantinya atau mengembalikan uang Anda.'
    },
    {
      question: 'Metode pembayaran apa saja yang tersedia?',
      answer: 'Kami menerima transfer bank, e-wallet (OVO, GoPay, DANA), dan pembayaran tunai saat pengantaran (COD).'
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
              Hubungi <span className="text-orange-600">Kami</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Kami siap membantu Anda dengan pertanyaan, saran, atau informasi 
              tentang produk dan layanan PasarAntar.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${info.color}`}>
                    <Icon size={40} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{info.title}</h3>
                  <p className="text-gray-600">{info.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Kirim Pesan</h2>
              
              {submitSuccess && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  <p className="font-medium">Terima kasih! Pesan Anda telah terkirim.</p>
                  <p className="text-sm mt-1">Kami akan menghubungi Anda segera.</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="0812-3456-7890"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subjek *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Pilih Subjek</option>
                    <option value="pertanyaan">Pertanyaan Umum</option>
                    <option value="pesanan">Tentang Pesanan</option>
                    <option value="produk">Tentang Produk</option>
                    <option value="pengantaran">Tentang Pengantaran</option>
                    <option value="keluhan">Keluhan</option>
                    <option value="saran">Saran</option>
                    <option value="kerjasama">Kerjasama Bisnis</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Pesan *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Tuliskan pesan Anda di sini..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send size={20} className="mr-2" />
                      Kirim Pesan
                    </>
                  )}
                </button>
              </form>
            </div>
            
            {/* Map */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Lokasi Kami</h2>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="aspect-square">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.8195613507864!3d-6.194741395493371!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5390917b759%3A0x6b45e67356080477!2sMonas!5e0!3m2!1sen!2sid!4v1650000000000000!5m2!1sen!2sid"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="PasarAntar Location"
                  ></iframe>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">PasarAntar Store</h3>
                  <p className="text-gray-600 mb-4">
                    {(settings?.contactAddress || 'Jl. Pasar Segar No. 123, Jakarta Selatan, 12345').split(',').map((line, index) => (
                      <React.Fragment key={index}>
                        {line.trim()}{index < (settings?.contactAddress || 'Jl. Pasar Segar No. 123, Jakarta Selatan, 12345').split(',').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                    {(!settings?.contactAddress || !settings.contactAddress.includes('Indonesia')) && <><br />Indonesia</>}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://maps.google.com/?q=PasarAntar+Store"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors duration-200"
                    >
                      <MapPin size={16} className="mr-2" />
                      Buka di Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Ikuti Kami
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Dapatkan informasi terbaru tentang promo dan produk kami melalui media sosial
            </p>
          </div>
          
          <div className="flex justify-center space-x-6">
            {socialMedia.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-12 h-12 rounded-full ${social.color} text-white flex items-center justify-center transition-colors duration-200`}
                  aria-label={social.name}
                >
                  <Icon size={24} />
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Temukan jawaban untuk pertanyaan umum tentang PasarAntar
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <details key={index} className="bg-white rounded-lg shadow-md p-6">
                <summary className="font-semibold text-gray-900 cursor-pointer hover:text-orange-600 transition-colors duration-200">
                  {faq.question}
                </summary>
                <p className="mt-3 text-gray-600">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Butuh Bantuan Langsung?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Tim customer service kami siap membantu Anda Senin - Minggu, 08:00 - 22:00
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={createTelUrl()}
              className="bg-white text-orange-600 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 text-lg shadow-xl flex items-center justify-center"
            >
              <Phone size={24} className="mr-2" />
              {getFormattedPhone()}
            </a>
            <a
              href={createWhatsAppUrl(getWhatsAppMessages().GENERAL_INQUIRY)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 text-lg shadow-xl flex items-center justify-center"
            >
              <MessageCircle size={24} className="mr-2" />
              WhatsApp
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