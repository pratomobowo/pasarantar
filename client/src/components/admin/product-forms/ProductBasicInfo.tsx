import { Category } from 'shared/dist/types';
import { UseFormRegister, FieldErrors, Control } from 'react-hook-form';
import { ProductFormData } from '../../../hooks/useEditProduct';

interface ProductBasicInfoProps {
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  categories: Category[];
  control?: Control<ProductFormData>;
  watch?: (name: any) => any;
  setValue?: (name: any, value: any) => void;
}

// Function to generate slug from product name
const generateSlug = (productName: string): string => {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

export default function ProductBasicInfo({ register, errors, categories, control, watch, setValue }: ProductBasicInfoProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-medium text-gray-900">Informasi Dasar</h2>
      </div>
      <div className="p-6 space-y-6">
        {/* Product Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nama Produk <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            {...register('name')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            placeholder="Contoh: Ayam Kampung Segar"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Product Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
            Slug <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              id="slug"
              {...register('slug')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="Contoh: ayam-kampung-segar"
            />
            {watch && setValue && (
              <button
                type="button"
                onClick={() => {
                  const nameValue = watch('name');
                  if (nameValue) {
                    const generatedSlug = generateSlug(nameValue);
                    setValue('slug', generatedSlug);
                  }
                }}
                className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                title="Generate ulang slug dari nama produk"
              >
                🔄
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Slug akan digenerate otomatis dari nama produk. Anda bisa mengeditnya secara manual.
          </p>
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
            Kategori <span className="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            {...register('categoryId')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          >
            <option value="">Pilih Kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={4}
            {...register('description')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            placeholder="Deskripsikan produk Anda secara detail..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}