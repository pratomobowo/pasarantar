import React, { useState } from 'react';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Clock, ChevronRight, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { getFormattedPhone, createWhatsAppUrl, createTelUrl, settings } = useSettings();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-orange-400 rounded-full mix-blend-multiply filter blur-2xl opacity-5 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <h3 className="text-3xl font-bold mb-4 flex items-center">
                  <span className="text-orange-500">Pasar</span>
                  <span className="text-white">Antar</span>
                </h3>
                <p className="text-gray-300 leading-relaxed max-w-md">
                  Platform e-commerce khusus produk protein segar dengan kualitas terjamin
                  dan pengantaran cepat ke seluruh wilayah Indonesia.
                </p>
              </div>
              
              {/* Contact Information */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-300">
                  <Phone size={18} className="text-orange-500 mr-3 flex-shrink-0" />
                  <span className="text-sm">{getFormattedPhone()}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Mail size={18} className="text-orange-500 mr-3 flex-shrink-0" />
                  <span className="text-sm">{settings?.contactEmail || 'info@pasarantar.com'}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPin size={18} className="text-orange-500 mr-3 flex-shrink-0" />
                  <span className="text-sm">{settings?.contactAddress || 'Jakarta, Indonesia'}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Clock size={18} className="text-orange-500 mr-3 flex-shrink-0" />
                  <span className="text-sm">Senin - Minggu: 06:00 - 23:00</span>
                </div>
              </div>
  
              {/* Social Media Links */}
              <div className="flex space-x-4">
                <a
                  href={settings?.socialMediaLinks?.facebook || '#'}
                  className="bg-gray-700 hover:bg-orange-600 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href={settings?.socialMediaLinks?.instagram || '#'}
                  className="bg-gray-700 hover:bg-orange-600 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href={settings?.socialMediaLinks?.twitter || '#'}
                  className="bg-gray-700 hover:bg-orange-600 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href={createWhatsAppUrl()}
                  className="bg-gray-700 hover:bg-orange-600 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="WhatsApp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Youtube size={18} />
                </a>
              </div>
            </div>
  
            {/* Support Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Layanan</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/help/cara-pemesanan" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 flex items-center group">
                    <ChevronRight size={16} className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Cara Pemesanan
                  </Link>
                </li>
                <li>
                  <Link to="/help/pengantaran" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 flex items-center group">
                    <ChevronRight size={16} className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Pengantaran
                  </Link>
                </li>
                <li>
                  <Link to="/help/pembayaran" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 flex items-center group">
                    <ChevronRight size={16} className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Pembayaran
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 flex items-center group">
                    <ChevronRight size={16} className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Hubungi Kami
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 flex items-center group">
                    <ChevronRight size={16} className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-orange-400 transition-colors duration-200 flex items-center group">
                    <ChevronRight size={16} className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Tentang Kami
                  </Link>
                </li>
              </ul>
            </div>
  
            {/* Newsletter Subscription */}
            <div>
              <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-3 text-white">Newsletter</h4>
                <p className="text-orange-100 text-sm mb-4">
                  Dapatkan penawaran spesial dan informasi produk terbaru langsung di email Anda
                </p>
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Anda"
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-sm"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-white text-orange-600 hover:bg-orange-50 px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center text-sm"
                  >
                    {isSubscribed ? 'Berhasil Berlangganan!' : 'Berlangganan Sekarang'}
                    {!isSubscribed && <Send size={16} className="ml-2" />}
                  </button>
                </form>
                {isSubscribed && (
                  <p className="text-green-100 text-xs mt-2">
                    Terima kasih telah berlangganan newsletter kami!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700">
          <div className="py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                © {new Date().getFullYear()} PasarAntar Digital Protein Market. All rights reserved.
              </div>
              <div className="flex flex-wrap items-center space-x-6 text-sm">
                <Link to="/privacy" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                  Kebijakan Privasi
                </Link>
                <Link to="/terms" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                  Syarat & Ketentuan
                </Link>
                <Link to="/refund" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                  Kebijakan Pengembalian
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}