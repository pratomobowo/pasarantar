import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { Check, ShoppingCart, X } from 'lucide-react';

// Force refresh

interface ToastProps {
  show: boolean;
  onClose: () => void;
  productName: string;
  productImage: string;
  variantInfo: string;
  onOpenCart?: () => void;
}

export default function Toast({ show, onClose, productName, productImage, variantInfo, onOpenCart }: ToastProps) {
  return (
    <>
      <Transition
        show={show}
        as={Fragment}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">
                  Berhasil ditambahkan!
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {productName} ({variantInfo}) telah dimasukkan ke keranjang
                </p>
                <div className="mt-3 flex space-x-7">
                  <button
                    type="button"
                    className="bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 px-3 py-1 rounded transition-colors duration-200"
                    onClick={() => {
                      if (onOpenCart) {
                        onOpenCart();
                      }
                      onClose();
                    }}
                  >
                    Lihat Keranjang
                  </button>
                  <button
                    type="button"
                    className="text-gray-500 text-sm hover:text-gray-700 transition-colors duration-200"
                    onClick={onClose}
                  >
                    Tutup
                  </button>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  type="button"
                  className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  onClick={onClose}
                >
                  <span className="sr-only">Tutup</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </>
  );
}