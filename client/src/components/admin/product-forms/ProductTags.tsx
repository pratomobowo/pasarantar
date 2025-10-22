import { Tag } from 'shared/dist/types';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { ProductFormData } from '../../../hooks/useEditProduct';
import { useEffect } from 'react';

interface ProductTagsProps {
  register: UseFormRegister<ProductFormData>;
  watch: UseFormWatch<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
  tags: Tag[];
  navigate: (to: string) => void;
}

export default function ProductTags({ register, watch, setValue, tags, navigate }: ProductTagsProps) {
  const selectedTagIds = watch('tagIds') || [];
  
  const handleTagChange = (tagId: string, checked: boolean) => {
    let newTagIds: string[];
    
    if (checked) {
      // Add tag if not already selected
      newTagIds = selectedTagIds.includes(tagId)
        ? selectedTagIds
        : [...selectedTagIds, tagId];
    } else {
      // Remove tag
      newTagIds = selectedTagIds.filter(id => id !== tagId);
    }
    
    setValue('tagIds', newTagIds);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-medium text-gray-900">Tag Produk</h2>
      </div>
      <div className="p-6">
        {tags.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`tag-${tag.id}`}
                  checked={selectedTagIds.includes(tag.id)}
                  onChange={(e) => handleTagChange(tag.id, e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor={`tag-${tag.id}`} className="ml-2 flex items-center cursor-pointer">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: tag.color }}
                  ></div>
                  <span className="text-sm text-gray-700">{tag.name}</span>
                </label>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Belum ada tag yang tersedia</p>
            <button
              type="button"
              onClick={() => navigate('/admin/tags/new')}
              className="mt-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Buat Tag Baru
            </button>
          </div>
        )}
      </div>
    </div>
  );
}