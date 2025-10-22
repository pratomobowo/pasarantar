import { Product, ProductWithRelations } from 'shared/dist/types';
import { ShoppingCart, Star, Tag, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';
import { formatWeightWithUnit, formatWeightWithUnitForPrice } from '../utils/productUtils';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

// Force refresh

interface ProductCardProps {
  product: ProductWithRelations;
  onProductClick: (product: ProductWithRelations) => void;
  onAddToCartClick?: (product: ProductWithRelations) => void;
}

export default function ProductCard({ product, onProductClick, onAddToCartClick }: ProductCardProps) {
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

  const getPriceRange = () => {
    if (product.variants.length === 0) return formatPrice(0);
    
    const prices = product.variants.map(v => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return formatPrice(minPrice);
    }
    
    return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
  };

  const getWeightDisplay = () => {
    if (product.variants.length === 0) return 'N/A';
    
    if (product.variants.length === 1) {
      return formatWeightWithUnit(product.variants[0]);
    }
    
    // Display up to 3 weights, separated by comma
    const weights = product.variants.slice(0, 3).map(v => formatWeightWithUnit(v));
    return weights.join(', ');
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
      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center">
        <Tag size={12} className="mr-1" />
        {product.discountPercentage}% OFF
      </div>
    );
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-100"
      onClick={() => onProductClick(product)}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={getImageUrl(product.imageUrl, product.id, 400, 400)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => handleImageError(e, product.id, 400, 400)}
        />
        
        {/* Discount Badge */}
        {getDiscountDisplay()}
        
        {/* Stock Status */}
        {defaultVariant && !defaultVariant.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="bg-white text-gray-800 px-4 py-2 rounded-lg text-sm font-medium">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1 mr-2">
            {product.name}
          </h3>
        </div>
        
        <p className="text-xs text-gray-500 mb-2">
          {getWeightDisplay()}
        </p>

        <div className="flex items-center mb-3">
          {renderStars(product.rating)}
        </div>
        
        {/* Desktop Layout - Price and button side by side */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex-1">
            {/* Get the cheapest variant */}
            {(() => {
              const cheapestVariant = product.variants.reduce((min, v) => v.price < min.price ? v : min, product.variants[0]);
              const hasDiscount = product.isOnSale && cheapestVariant.originalPrice;
              
              return (
                <>
                  {/* Desktop Price Layout - Original price above discounted price */}
                  {hasDiscount && (
                    <p className="text-sm text-gray-400 line-through mb-1">
                      {formatPrice(cheapestVariant.originalPrice!)}
                    </p>
                  )}
                  <div className="flex items-center">
                    <p className="text-lg font-bold text-orange-600">
                      {formatPrice(cheapestVariant.price)}
                    </p>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatWeightWithUnitForPrice(cheapestVariant)}
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={!defaultVariant?.inStock}
            className={`p-2.5 rounded-xl transition-all duration-200 relative overflow-hidden flex-shrink-0 ml-2 ${
              defaultVariant?.inStock
                ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title={defaultVariant?.inStock ? 'Tambah ke keranjang' : 'Stok habis'}
          >
            <div className={`transition-all duration-300 ${isAdded ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
              <ShoppingCart size={18} />
            </div>
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isAdded ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
              <Check size={18} className="text-green-600" />
            </div>
          </button>
        </div>
        
        {/* Mobile Layout - Price above, button below */}
        <div className="sm:hidden">
          {/* Get the cheapest variant */}
          {(() => {
            const cheapestVariant = product.variants.reduce((min, v) => v.price < min.price ? v : min, product.variants[0]);
            const hasDiscount = product.isOnSale && cheapestVariant.originalPrice;
            
            return (
              <>
                {/* Mobile Price Layout - Original price above discounted price */}
                <div className="mb-3">
                  {hasDiscount && (
                    <p className="text-xs text-gray-400 line-through mb-1">
                      {formatPrice(cheapestVariant.originalPrice!)}
                    </p>
                  )}
                  <div className="flex items-center">
                    <p className="text-base font-bold text-orange-600">
                      {formatPrice(cheapestVariant.price)}
                    </p>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatWeightWithUnitForPrice(cheapestVariant)}
                    </span>
                  </div>
                </div>
                
                {/* Mobile Buy Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={!defaultVariant?.inStock}
                  className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                    defaultVariant?.inStock
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className={`flex items-center justify-center transition-all duration-300 ${isAdded ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                    <ShoppingCart size={14} className="mr-1.5" />
                    <span>{defaultVariant?.inStock ? 'Beli' : 'Stok Habis'}</span>
                  </div>
                  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isAdded ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                    <Check size={14} className="text-white" />
                  </div>
                </button>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}