import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Upload } from 'lucide-react';
import { ProductFormData } from '../../../hooks/useEditProduct';
import { getImageUrl } from '../../../utils/productUtils';

interface ProductImageProps {
  register: UseFormRegister<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
  watch: UseFormWatch<ProductFormData>;
  selectedImage: string | null;
  onImageUpload: (file: File) => void;
  onImageUrlChange: (url: string) => void;
}

export default function ProductImage({
  register,
  setValue,
  watch,
  selectedImage,
  onImageUpload,
  onImageUrlChange,
}: ProductImageProps) {
  const watchImageUrl = watch('imageUrl');

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-medium text-gray-900">Gambar Produk</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="flex justify-center">
            {selectedImage ? (
              <img
                src={getImageUrl(selectedImage) || ''}
                alt="Product preview"
                className="h-48 w-48 object-cover rounded-lg border border-gray-200"
              />
            ) : (
              <div className="h-48 w-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <Upload className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Image URL Input */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
              URL Gambar
            </label>
            <input
              type="text"
              id="imageUrl"
              {...register('imageUrl')}
              value={watchImageUrl || ''}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="https://example.com/image.jpg"
              onChange={(e) => {
                setValue('imageUrl', e.target.value);
                onImageUrlChange(e.target.value);
              }}
            />
          </div>

          {/* Upload Button */}
          <div>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onImageUpload(file);
                }
              }}
            />
            <button
              type="button"
              onClick={() => document.getElementById('imageUpload')?.click()}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Gambar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}