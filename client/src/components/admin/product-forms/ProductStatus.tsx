import { ProductWithVariants } from 'shared/dist/types';

interface ProductStatusProps {
  product: ProductWithVariants | null;
}

export default function ProductStatus({ product }: ProductStatusProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-medium text-gray-900">Status Produk</h2>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Status Aktif</span>
            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              Aktif
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Varian Aktif</span>
            <span className="text-sm text-gray-900">
              {product?.variants?.filter(v => v.isActive !== false).length || 0} dari {product?.variants?.length || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Stok Tersedia</span>
            <span className="text-sm text-gray-900">
              {product?.variants?.filter(v => v.inStock !== false).length || 0} dari {product?.variants?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}