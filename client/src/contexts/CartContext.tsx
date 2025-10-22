import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Cart, CartItem, Product, ProductVariant, CustomerInfo, ProductWithRelations } from 'shared/dist/types';
import { orderApi } from '../services/orderApi';

interface ToastState {
  show: boolean;
  productName: string;
  productImage: string;
  variantInfo: string;
}

interface CartContextType {
  cart: Cart;
  addToCart: (product: ProductWithRelations, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  updateNote: (productId: string, variantId: string, note: string) => void;
  clearCart: () => void;
  createOrder: (customerInfo: CustomerInfo) => Promise<{ success: boolean; message: string; orderNumber?: string }>;
  toast: ToastState;
  showToast: (productName: string, productImage: string, variantInfo: string) => void;
  hideToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: ProductWithRelations; variant: ProductVariant; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string; variantId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; variantId: string; quantity: number } }
  | { type: 'UPDATE_NOTE'; payload: { productId: string; variantId: string; note: string } }
  | { type: 'CLEAR_CART' };

type ToastAction =
  | { type: 'SHOW_TOAST'; payload: { productName: string; productImage: string; variantInfo: string } }
  | { type: 'HIDE_TOAST' };

const cartReducer = (state: Cart, action: CartAction): Cart => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, variant, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.product.id === product.id && item.variant.id === variant.id
      );

      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        newItems = [...state.items];
        newItems[existingItemIndex].quantity += quantity;
      } else {
        newItems = [...state.items, { product, variant, quantity }];
      }

      const total = newItems.reduce(
        (sum, item) => sum + item.variant.price * item.quantity,
        0
      );
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case 'REMOVE_FROM_CART': {
      const { productId, variantId } = action.payload;
      const newItems = state.items.filter(
        item => !(item.product.id === productId && item.variant.id === variantId)
      );
      const total = newItems.reduce(
        (sum, item) => sum + item.variant.price * item.quantity,
        0
      );
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, variantId, quantity } = action.payload;
      
      // Clamp quantity to reasonable bounds
      const clampedQuantity = Math.max(1, Math.min(99, Math.floor(quantity)));
      
      if (clampedQuantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_FROM_CART', payload: { productId, variantId } });
      }

      const newItems = state.items.map(item =>
        (item.product.id === productId && item.variant.id === variantId)
          ? { ...item, quantity: clampedQuantity }
          : item
      );
      const total = newItems.reduce(
        (sum, item) => sum + item.variant.price * item.quantity,
        0
      );
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case 'UPDATE_NOTE': {
      const { productId, variantId, note } = action.payload;
      const newItems = state.items.map(item =>
        (item.product.id === productId && item.variant.id === variantId)
          ? { ...item, note }
          : item
      );

      return { ...state, items: newItems };
    }

    case 'CLEAR_CART':
      return { items: [], total: 0, itemCount: 0 };

    default:
      return state;
  }
};

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'SHOW_TOAST':
      return {
        show: true,
        productName: action.payload.productName,
        productImage: action.payload.productImage,
        variantInfo: action.payload.variantInfo,
      };
    case 'HIDE_TOAST':
      return {
        show: false,
        productName: '',
        productImage: '',
        variantInfo: '',
      };
    default:
      return state;
  }
};

const initialCartState: Cart = {
  items: [],
  total: 0,
  itemCount: 0,
};

const initialToastState: ToastState = {
  show: false,
  productName: '',
  productImage: '',
  variantInfo: '',
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Initialize cart state from localStorage if available
  const getInitialCartState = (): Cart => {
    try {
      const savedCart = localStorage.getItem('pasarantar-cart');
      if (savedCart) {
        return JSON.parse(savedCart);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
    return initialCartState;
  };

  const [cart, dispatch] = useReducer(cartReducer, getInitialCartState());
  const [toast, toastDispatch] = useReducer(toastReducer, initialToastState);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('pasarantar-cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  const addToCart = (product: ProductWithRelations, variant: ProductVariant, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, variant, quantity } });
    showToast(
      product.name, 
      `https://picsum.photos/seed/${product.id}/100/100.jpg`,
      `${variant.weight}`
    );
  };

  const removeFromCart = (productId: string, variantId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId, variantId } });
  };

  const updateQuantity = (productId: string, variantId: string, quantity: number) => {
    // Ensure quantity is within reasonable bounds
    const clampedQuantity = Math.max(1, Math.min(99, Math.floor(quantity)));
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, variantId, quantity: clampedQuantity } });
  };

  const updateNote = (productId: string, variantId: string, note: string) => {
    dispatch({ type: 'UPDATE_NOTE', payload: { productId, variantId, note } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const createOrder = async (customerInfo: CustomerInfo): Promise<{ success: boolean; message: string; orderNumber?: string }> => {
    try {
      // Prepare order items
      const orderItems = cart.items.map(item => ({
        productId: item.product.id,
        productVariantId: item.variant.id,
        quantity: item.quantity,
        notes: item.note,
      }));

      // Get customer ID if logged in
      let customerId: string | undefined;
      try {
        const customerUserStr = localStorage.getItem('customer-user');
        if (customerUserStr) {
          const customerUser = JSON.parse(customerUserStr);
          customerId = customerUser.id;
        }
      } catch (error) {
        console.error('Error getting customer ID:', error);
      }

      // Prepare order data
      const orderData = {
        customerName: customerInfo.name,
        customerWhatsapp: customerInfo.whatsapp,
        customerAddress: customerInfo.address,
        customerCoordinates: customerInfo.coordinates
          ? `${customerInfo.coordinates.latitude},${customerInfo.coordinates.longitude}`
          : undefined,
        shippingMethod: customerInfo.shippingMethod,
        deliveryDay: customerInfo.deliveryDay,
        paymentMethod: customerInfo.paymentMethod,
        customerId, // Include customer ID if available
        items: orderItems,
        notes: customerInfo.notes,
      };

      // Create order via API
      const response = await orderApi.createOrder(orderData);
      
      if (response.success) {
        // Clear cart on successful order creation
        clearCart();
        return {
          success: true,
          message: 'Pesanan berhasil dibuat!',
          orderNumber: response.data.orderNumber,
        };
      } else {
        return {
          success: false,
          message: response.message || 'Gagal membuat pesanan',
        };
      }
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat pesanan',
      };
    }
  };

  const showToast = (productName: string, productImage: string, variantInfo: string) => {
    toastDispatch({ type: 'SHOW_TOAST', payload: { productName, productImage, variantInfo } });
    
    // Auto-hide toast after 4 seconds
    setTimeout(() => {
      toastDispatch({ type: 'HIDE_TOAST' });
    }, 4000);
  };

  const hideToast = () => {
    toastDispatch({ type: 'HIDE_TOAST' });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateNote,
        clearCart,
        createOrder,
        toast,
        showToast,
        hideToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};