import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Plus, Minus, Trash2, Edit3 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { CartItem } from 'shared/dist/types';
import { formatPrice } from '../utils/formatters';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, updateNote } = useCart();
  const navigate = useNavigate();
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

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

  const handleCheckout = () => {
    // Close drawer and navigate to checkout page
    onClose();
    navigate('/checkout');
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-6 border-b">
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        Keranjang Belanja
                      </Dialog.Title>
                      <button
                        type="button"
                        className="rounded-md p-2 text-gray-400 hover:text-gray-500"
                        onClick={onClose}
                      >
                        <X size={24} />
                      </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto px-4 py-6">
                      {cart.items.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-500">Keranjang belanja kosong</p>
                          <button
                            onClick={onClose}
                            className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
                          >
                            Lanjut belanja
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {cart.items.map((item) => (
                            <div key={`${item.product.id}-${item.variant.id}`} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                              <div className="flex items-center space-x-4 mb-2">
                                <img
                                  src={getImageUrl(item.product.imageUrl, item.product.id, 80, 80)}
                                  alt={item.product.name}
                                  className="w-20 h-20 object-cover rounded-lg"
                                  onError={(e) => handleImageError(e, item.product.id, 80, 80)}
                                />
                                
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {item.product.name}
                                  </h4>
                                  <p className="text-xs text-gray-500">{item.variant.weight}</p>
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
                                  
                                  <input
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const newQuantity = parseInt(e.target.value);
                                      if (!isNaN(newQuantity) && newQuantity > 0) {
                                        handleQuantityChange(item, Math.min(newQuantity, 99));
                                      }
                                    }}
                                    className="w-12 text-center text-sm font-medium border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    inputMode="numeric"
                                  />
                                  
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
                                        Catatan (opsional)
                                      </label>
                                      {!item.note && (
                                        <button
                                          onClick={() => toggleNoteField(`${item.product.id}-${item.variant.id}`)}
                                          className="text-gray-400 hover:text-gray-600"
                                        >
                                          <X size={12} />
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
                                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                      placeholder="Contoh: Tanpa gula, ekstra pedas"
                                    />
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => toggleNoteField(`${item.product.id}-${item.variant.id}`)}
                                    className="flex items-center text-xs text-orange-600 hover:text-orange-700 font-medium"
                                  >
                                    <Edit3 size={10} className="mr-1" />
                                    Tambah catatan
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {cart.items.length > 0 && (
                      <div className="border-t px-4 py-6 space-y-4">
                        <div className="flex justify-between text-lg font-medium">
                          <span>Total:</span>
                          <span className="text-orange-600">{formatPrice(cart.total)}</span>
                        </div>
                        
                        <button
                          onClick={handleCheckout}
                          className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200"
                        >
                          Checkout
                        </button>
                        
                        <button
                          onClick={onClose}
                          className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                        >
                          Lanjut Belanja
                        </button>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}