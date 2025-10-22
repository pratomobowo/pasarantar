import { useState, FormEvent } from 'react';
import { Dialog } from '@headlessui/react';
import { X, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { CustomerInfo } from 'shared/dist/types';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

interface CheckoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToCart: () => void;
}

export default function CheckoutForm({ isOpen, onClose, onBackToCart }: CheckoutFormProps) {
  const { cart, clearCart } = useCart();
  const [formData, setFormData] = useState<CustomerInfo>({
    name: '',
    whatsapp: '',
    address: '',
    paymentMethod: 'transfer',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate order processing
    setTimeout(() => {
      // In a real app, you would send this data to your server
      console.log('Order placed:', {
        customerInfo: formData,
        items: cart.items,
        total: cart.total,
      });

      // Clear cart and close form
      clearCart();
      setIsSubmitting(false);
      onClose();
      
      // Show success message (in a real app, you might use a toast notification)
      alert('Pesanan berhasil dibuat! Kami akan menghubungi Anda segera.');
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center">
              <button
                onClick={onBackToCart}
                className="p-2 rounded-full hover:bg-gray-100 mr-3"
              >
                <ArrowLeft size={20} />
              </button>
              <Dialog.Title className="text-xl font-bold text-gray-900">
                Checkout
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Order Summary */}
          <div className="p-6 border-b bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-3">Ringkasan Pesanan</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {cart.items.map((item) => (
                <div key={`${item.product.id}-${item.variant.id}`} className="flex justify-between text-sm">
                  <span>{item.product.name} ({item.variant.weight}) x {item.quantity}</span>
                  <span className="font-medium">
                    {formatPrice(item.variant.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-lg font-bold mt-3 pt-3 border-t">
              <span>Total:</span>
              <span className="text-orange-600">{formatPrice(cart.total)}</span>
            </div>
          </div>

          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor WhatsApp *
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  required
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Contoh: 08123456789"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat Pengantaran *
                </label>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Masukkan alamat lengkap untuk pengantaran"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metode Pembayaran *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transfer"
                      checked={formData.paymentMethod === 'transfer'}
                      onChange={handleInputChange}
                      className="mr-2 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm">Transfer Bank</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="mr-2 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm">Bayar di Tempat (COD)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Memproses...' : 'Lanjutkan Pembayaran'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}