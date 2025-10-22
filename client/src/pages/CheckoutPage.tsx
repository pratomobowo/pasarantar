import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, User, MapPin, Phone, CreditCard, Wallet, Check, Edit3, X, Navigation, Calendar } from 'lucide-react';
import { CartItem, CustomerInfo } from 'shared/dist/types';
import { useCart } from '../contexts/CartContext';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { formatPrice } from '../utils/formatters';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, updateNote } = useCart();
  const { customer } = useCustomerAuth();
  
  // Initialize customer info from localStorage or logged-in customer data
  const getInitialCustomerInfo = (): CustomerInfo => {
    try {
      const savedInfo = localStorage.getItem('pasarantar-checkout-info');
      if (savedInfo) {
        const parsed = JSON.parse(savedInfo);
        // Ensure shippingMethod has a default value
        return {
          ...parsed,
          shippingMethod: parsed.shippingMethod || 'express'
        };
      }
    } catch (error) {
      console.error('Error loading checkout info from localStorage:', error);
    }
    
    // If customer is logged in, use their profile data
    if (customer) {
      return {
        name: customer.name || '',
        whatsapp: customer.whatsapp || '',
        address: customer.address || '',
        shippingMethod: 'express',
        paymentMethod: 'transfer'
      };
    }
    
    return {
      name: '',
      whatsapp: '',
      address: '',
      shippingMethod: 'express',
      paymentMethod: 'transfer'
    };
  };

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(getInitialCustomerInfo());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { createOrder } = useCart();

  // Save customer info to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('pasarantar-checkout-info', JSON.stringify(customerInfo));
    } catch (error) {
      console.error('Error saving checkout info to localStorage:', error);
    }
  }, [customerInfo]);

  // Update customer info when customer data changes
  useEffect(() => {
    if (customer && !customerInfo.name && !customerInfo.whatsapp && !customerInfo.address) {
      // Only update if form is empty (to avoid overwriting user changes)
      setCustomerInfo(prev => ({
        ...prev,
        name: customer.name || prev.name,
        whatsapp: customer.whatsapp || prev.whatsapp,
        address: customer.address || prev.address,
      }));
    }
  }, [customer]);

  // Redirect to home if cart is empty
  useEffect(() => {
    if (cart.items.length === 0 && !isSuccess) {
      navigate('/');
    }
  }, [cart.items.length, isSuccess, navigate]);

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(item.product.id, item.variant.id);
    } else {
      updateQuantity(item.product.id, item.variant.id, newQuantity);
    }
  };

  const handleNoteChange = (item: CartItem, note: string) => {
    updateNote(item.product.id, item.variant.id, note);
  };

  const toggleNoteField = (itemKey: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      return newSet;
    });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung fitur geolokasi');
      return;
    }

    setIsGettingLocation(true);

    // Try with high accuracy first
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleSetCoordinates(latitude, longitude);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location with high accuracy:', error);
        
        // Try again with lower accuracy settings
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            handleSetCoordinates(latitude, longitude);
            setIsGettingLocation(false);
          },
          (fallbackError) => {
            console.error('Error getting location with fallback:', fallbackError);
            setIsGettingLocation(false);
            
            let errorMessage = 'Gagal mendapatkan lokasi. ';
            switch (fallbackError.code) {
              case fallbackError.PERMISSION_DENIED:
                errorMessage += 'Izin lokasi ditolak. Silakan aktifkan izin lokasi di browser Anda dan refresh halaman.';
                break;
              case fallbackError.POSITION_UNAVAILABLE:
                errorMessage += 'Informasi lokasi tidak tersedia. Pastikan GPS Anda aktif atau coba lagi di area dengan sinyal lebih baik.';
                break;
              case fallbackError.TIMEOUT:
                errorMessage += 'Waktu habis untuk mendapatkan lokasi. Silakan coba lagi.';
                break;
              default:
                errorMessage += 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi atau masukkan koordinat secara manual.';
                break;
            }
            alert(errorMessage);
          },
          {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 600000 // 10 minutes
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSetCoordinates = (latitude: number, longitude: number) => {
    setCustomerInfo(prev => ({
      ...prev,
      coordinates: { latitude, longitude }
    }));
  };

  const handleCoordinatesChange = (value: string) => {
    // Parse coordinates from input
    const coords = value.split(',').map(coord => parseFloat(coord.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      // Validate latitude and longitude ranges
      if (coords[0] >= -90 && coords[0] <= 90 && coords[1] >= -180 && coords[1] <= 180) {
        handleSetCoordinates(coords[0], coords[1]);
      } else {
        alert('Format koordinat tidak valid. Latitude harus antara -90 dan 90, dan longitude harus antara -180 dan 180.');
      }
    } else if (value === '') {
      // Clear coordinates if input is empty
      setCustomerInfo(prev => ({
        ...prev,
        coordinates: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerInfo> = {};
    
    if (!customerInfo.name.trim()) {
      newErrors.name = 'Nama lengkap harus diisi';
    }
    
    if (!customerInfo.whatsapp.trim()) {
      newErrors.whatsapp = 'Nomor WhatsApp harus diisi';
    } else if (!/^08[0-9]{9,12}$/.test(customerInfo.whatsapp.replace(/[^0-9]/g, ''))) {
      newErrors.whatsapp = 'Format nomor WhatsApp tidak valid (contoh: 08123456789)';
    }
    
    if (!customerInfo.address.trim()) {
      newErrors.address = 'Alamat lengkap harus diisi';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const result = await createOrder(customerInfo);
      
      if (result.success) {
        setOrderNumber(result.orderNumber || '');
        setIsSuccess(true);
        
        // Clear checkout info from localStorage on successful order
        try {
          localStorage.removeItem('pasarantar-checkout-info');
        } catch (error) {
          console.error('Error clearing checkout info from localStorage:', error);
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    // Clear form data from localStorage and reset form
    try {
      localStorage.removeItem('pasarantar-checkout-info');
    } catch (error) {
      console.error('Error clearing checkout info from localStorage:', error);
    }
    
    setCustomerInfo({
      name: '',
      whatsapp: '',
      address: '',
      shippingMethod: 'express',
      paymentMethod: 'transfer'
    });
    navigate('/');
  };

  // If cart is empty and not showing success, render nothing or a loading state
  if (cart.items.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Berhasil!</h2>
            <p className="text-gray-600 mb-2">
              Terima kasih telah berbelanja di PasarAntar. Pesanan Anda sedang diproses dan akan segera dikirim.
            </p>
            {orderNumber && (
              <p className="text-lg font-semibold text-orange-600 mb-6">
                Nomor Pesanan: {orderNumber}
              </p>
            )}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-gray-900 mb-2">Ringkasan Pesanan:</h3>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Nama:</span> {customerInfo.name}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">WhatsApp:</span> {customerInfo.whatsapp}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Alamat:</span> {customerInfo.address}
              </p>
              {customerInfo.coordinates && (
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Koordinat:</span> {customerInfo.coordinates.latitude.toFixed(6)}, {customerInfo.coordinates.longitude.toFixed(6)}
                </p>
              )}
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Pengiriman:</span> {customerInfo.shippingMethod === 'express' ? 'PasarAntar Express' : 'Ambil ke Workshop (Baleendah)'}
              </p>
              {customerInfo.shippingMethod === 'express' && customerInfo.deliveryDay && (
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Hari Pengiriman:</span> {(() => {
                    const dayMap: { [key: string]: string } = {
                      'selasa': 'Selasa',
                      'kamis': 'Kamis',
                      'sabtu': 'Sabtu'
                    };
                    return dayMap[customerInfo.deliveryDay!] || customerInfo.deliveryDay;
                  })()}
                </p>
              )}
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Subtotal:</span> {formatPrice(cart.total)}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Biaya Pengiriman:</span> {customerInfo.shippingMethod === 'express' ? 'Rp 15.000' : 'Gratis'}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Total:</span> {formatPrice(cart.total + (customerInfo.shippingMethod === 'express' ? 15000 : 0))}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Pembayaran:</span> {customerInfo.paymentMethod === 'transfer' ? 'Transfer Bank' : 'COD (Bayar di Tempat)'}
              </p>
            </div>
            <button
              onClick={handleContinue}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft size={20} />
            <span className="ml-1">Kembali</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Keranjang Belanja</h2>
              
              {cart.items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Keranjang belanja kosong</p>
                  <Link 
                    to="/"
                    className="mt-4 inline-block text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Lanjut belanja
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={`${item.product.id}-${item.variant.id}`} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                      <div className="flex items-start space-x-4 mb-3">
                        <img
                          src={getImageUrl(item.product.imageUrl, item.product.id, 100, 100)}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => handleImageError(e, item.product.id, 100, 100)}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-gray-500 mb-1">{item.variant.weight}</p>
                          <p className="text-sm font-bold text-orange-600">
                            {formatPrice(item.variant.price)}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                          >
                            <Minus size={16} />
                          </button>
                          
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                          >
                            <Plus size={16} />
                          </button>
                          
                          <button
                            onClick={() => removeFromCart(item.product.id, item.variant.id)}
                            className="p-1 rounded-full text-red-500 hover:bg-red-50 ml-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Note Field */}
                      <div className="ml-24">
                        {item.note || expandedNotes.has(`${item.product.id}-${item.variant.id}`) ? (
                          <div className="relative">
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-medium text-gray-700">
                                Catatan untuk produk ini (opsional)
                              </label>
                              {!item.note && (
                                <button
                                  onClick={() => toggleNoteField(`${item.product.id}-${item.variant.id}`)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                            <textarea
                              value={item.note || ''}
                              onChange={(e) => handleNoteChange(item, e.target.value)}
                              onBlur={() => {
                                if (!item.note) {
                                  toggleNoteField(`${item.product.id}-${item.variant.id}`);
                                }
                              }}
                              rows={2}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="Contoh: Tanpa gula, ekstra pedas, dll."
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => toggleNoteField(`${item.product.id}-${item.variant.id}`)}
                            className="flex items-center text-xs text-orange-600 hover:text-orange-700 font-medium"
                          >
                            <Edit3 size={12} className="mr-1" />
                            Tambah catatan produk
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Information Form */}
            <form id="customer-form" onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Informasi Pelanggan</h2>
                {customer && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Data dari profil Anda
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={customerInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`pl-10 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* WhatsApp */}
                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor WhatsApp
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="whatsapp"
                      name="whatsapp"
                      value={customerInfo.whatsapp}
                      onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                      className={`pl-10 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        errors.whatsapp ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Contoh: 08123456789"
                    />
                  </div>
                  {errors.whatsapp && (
                    <p className="mt-1 text-sm text-red-500">{errors.whatsapp}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Pengiriman
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-start pointer-events-none pt-2">
                      <MapPin size={18} className="text-gray-400" />
                    </div>
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      value={customerInfo.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`pl-10 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Masukkan alamat lengkap (jalan, nomor, RT/RW, kelurahan, kecamatan, kota, kode pos)"
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                  )}
                </div>

                {/* Coordinates */}
                <div>
                  <label htmlFor="coordinates" className="block text-sm font-medium text-gray-700 mb-1">
                    Titik Koordinat
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Navigation size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="coordinates"
                      name="coordinates"
                      value={customerInfo.coordinates ?
                        `${customerInfo.coordinates.latitude.toFixed(6)}, ${customerInfo.coordinates.longitude.toFixed(6)}` :
                        ''
                      }
                      onChange={(e) => handleCoordinatesChange(e.target.value)}
                      className="pl-10 block w-full px-3 py-2 pr-24 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Contoh: -6.2088, 106.8456"
                    />
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isGettingLocation}
                      className="absolute right-2 top-2 bg-orange-100 text-orange-600 hover:bg-orange-200 disabled:bg-gray-100 disabled:text-gray-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center"
                    >
                      {isGettingLocation ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Mendeteksi...
                        </>
                      ) : (
                        <>
                          <Navigation size={12} className="mr-1" />
                          Lokasi Saya
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Klik "Lokasi Saya" untuk mendapatkan titik koordinat dari GPS Anda saat ini.
                    Jika gagal, Anda bisa memasukkan koordinat secara manual (format: latitude, longitude)
                  </p>
                </div>

                {/* Delivery Day - Only show for express shipping */}
                {customerInfo.shippingMethod === 'express' && (
                  <div>
                    <label htmlFor="deliveryDay" className="block text-sm font-medium text-gray-700 mb-1">
                      Hari Pengiriman
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar size={18} className="text-gray-400" />
                      </div>
                      <select
                        id="deliveryDay"
                        name="deliveryDay"
                        value={customerInfo.deliveryDay || ''}
                        onChange={(e) => handleInputChange('deliveryDay', e.target.value)}
                        className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                      >
                        <option value="">Pilih hari pengiriman</option>
                        {(() => {
                          const today = new Date();
                          // 0 = Sunday, 1 = Monday, etc.
                          const options: { value: string; label: string }[] = [];
                          
                          // Find next Tuesday, Thursday, and Saturday
                          for (let i = 1; i <= 7; i++) {
                            const futureDate = new Date(today);
                            futureDate.setDate(today.getDate() + i);
                            const dayOfWeek = futureDate.getDay();
                            
                            if (dayOfWeek === 2) { // Tuesday
                              const dateStr = futureDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
                              options.push({ value: 'selasa', label: `Selasa, ${dateStr}` });
                            } else if (dayOfWeek === 4) { // Thursday
                              const dateStr = futureDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
                              options.push({ value: 'kamis', label: `Kamis, ${dateStr}` });
                            } else if (dayOfWeek === 6) { // Saturday
                              const dateStr = futureDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
                              options.push({ value: 'sabtu', label: `Sabtu, ${dateStr}` });
                            }
                          }
                          
                          return options.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ));
                        })()}
                      </select>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      PasarAntar hanya menerima pengiriman pada hari Selasa, Kamis, dan Sabtu
                    </p>
                  </div>
                )}

              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            {/* Shipping Method */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Metode Pengiriman</h2>
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="express"
                    checked={customerInfo.shippingMethod === 'express'}
                    onChange={() => handleInputChange('shippingMethod', 'express')}
                    className="mr-3 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">PasarAntar Express</span>
                      <span className="text-sm font-bold text-orange-600">Rp 15.000</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Pengantaran langsung ke alamat Anda</p>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="pickup"
                    checked={customerInfo.shippingMethod === 'pickup'}
                    onChange={() => handleInputChange('shippingMethod', 'pickup')}
                    className="mr-3 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Ambil ke Workshop</span>
                      <span className="text-sm font-bold text-green-600">Gratis</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Ambil pesanan di Workshop (Baleendah)</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Metode Pembayaran</h2>
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="transfer"
                    checked={customerInfo.paymentMethod === 'transfer'}
                    onChange={() => handleInputChange('paymentMethod', 'transfer')}
                    className="mr-3 text-orange-600 focus:ring-orange-500"
                  />
                  <CreditCard size={18} className="text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Transfer Bank</span>
                </label>
                
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={customerInfo.paymentMethod === 'cod'}
                    onChange={() => handleInputChange('paymentMethod', 'cod')}
                    className="mr-3 text-orange-600 focus:ring-orange-500"
                  />
                  <Wallet size={18} className="text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">COD (Bayar di Tempat)</span>
                </label>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cart.itemCount} produk)</span>
                  <span className="font-medium text-gray-900">{formatPrice(cart.total)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Biaya Pengiriman</span>
                  <span className="font-medium text-gray-900">
                    {customerInfo.shippingMethod === 'express' ? 'Rp 15.000' : 'Gratis'}
                  </span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="text-lg font-bold text-orange-600">
                      {formatPrice(cart.total + (customerInfo.shippingMethod === 'express' ? 15000 : 0))}
                    </span>
                  </div>
                </div>
              </div>

              {customerInfo.shippingMethod === 'express' && (
                <div className="bg-orange-50 p-3 rounded-lg mb-4">
                  <p className="text-xs text-orange-800">
                    <span className="font-semibold">Semoga Allah</span> Terus melapangkan rizki kaka
                  </p>
                </div>
              )}

              <button
                type="submit"
                form="customer-form"
                disabled={isProcessing || cart.items.length === 0}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                  isProcessing || cart.items.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  'Buat Pesanan'
                )}
              </button>

              <Link
                to="/"
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 text-center block mt-3"
              >
                Kembali Belanja
              </Link>

              <div className="mt-4 text-xs text-gray-500">
                <p className="mb-1">Dengan membuat pesanan, Anda setuju dengan:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Syarat & ketentuan PasarAntar</li>
                  <li>Kebijakan pengembalian</li>
                  <li>Kebijakan privasi</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}