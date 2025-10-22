import { Product, ProductWithRelations } from 'shared/dist/types';
import { ShoppingCart, Star, Tag, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';
import { formatWeightWithUnit, formatWeightWithUnitForPrice } from '../utils/productUtils';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

interface ProductListCardProps {
  product: ProductWithRelations;
  onProductClick: (product: ProductWithRelations) => void;
  onAddToCartClick?: (product: ProductWithRelations) => void;
}

export default function ProductListCard({ product, onProductClick, onAddToCartClick }: ProductListCardProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  
  // Get default variant
  const defaultVariant = product.variants.find(variant => variant.id === product.defaultVariantId);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If product has multiple variants, open product detail modal
    if (product.variants.length > 1 && onAddToCartClick) {
      onAddToCartClick(product);
      return;
    }
    
    // If product has only one variant, add directly to cart
    if (defaultVariant) {
      // Prevent multiple clicks during the feedback animation period
      if (isAdded) {
        return;
      }
      
      addToCart(product, defaultVariant);
      // Show check animation
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={12} className="text-yellow-500 fill-current" />
        ))}
        {hasHalfStar && (
          <Star size={12} className="text-yellow-500 fill-current opacity-50" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={12} className="text-gray-300 fill-current" />
        ))}
        <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
      </div>
    );
  };

  const getDiscountDisplay = () => {
    if (!product.isOnSale || !product.discountPercentage) return null;
    
    return (
      <div className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center w-fit">
        <Tag size={10} className="mr-1" />
        {product.discountPercentage}% OFF
      </div>
    );
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 mb-3"
      onClick={() => onProductClick(product)}
    >
      <div className="flex p-3">
        {/* Product Image */}
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
          <img
            src={getImageUrl(product.imageUrl, product.id, 150, 150)}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => handleImageError(e, product.id, 150, 150)}
          />
          
          {/* Discount Badge */}
          {getDiscountDisplay()}
          
          {/* Stock Status */}
          {defaultVariant && !defaultVariant.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="bg-white text-gray-800 px-2 py-1 rounded text-xs font-medium">
                Stok Habis
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="ml-3 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
              {product.name}
            </h3>
            
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
              {product.description || 'Produk segar berkualitas tinggi'}
            </p>

            <div className="flex items-center mb-2">
              {renderStars(product.rating)}
            </div>
          </div>
          
          {/* Price and Button */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Get the cheapest variant */}
              {(() => {
                const cheapestVariant = product.variants.reduce((min, v) => v.price < min.price ? v : min, product.variants[0]);
                const hasDiscount = product.isOnSale && cheapestVariant.originalPrice;
                
                return (
                  <>
                    {/* Original price above discounted price */}
                    {hasDiscount && (
                      <p className="text-xs text-gray-400 line-through mb-1">
                        {formatPrice(cheapestVariant.originalPrice!)}
                      </p>
                    )}
                    <div className="flex items-center">
                      <p className="text-sm font-bold text-orange-600">
                        {formatPrice(cheapestVariant.price)}
                      </p>
                      <span className="text-xs text-gray-500 ml-1">
                        /{formatWeightWithUnitForPrice(cheapestVariant)}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={!defaultVariant?.inStock}
              className={`p-2 rounded-lg transition-all duration-200 relative overflow-hidden flex-shrink-0 ml-2 ${
                defaultVariant?.inStock
                  ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title={defaultVariant?.inStock ? 'Tambah ke keranjang' : 'Stok habis'}
            >
              <div className={`transition-all duration-300 ${isAdded ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                <ShoppingCart size={16} />
              </div>
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isAdded ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                <Check size={16} className="text-green-600" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}