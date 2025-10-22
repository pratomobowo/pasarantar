import { Unit } from 'shared/dist/types';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { ProductFormData } from '../../../hooks/useEditProduct';

interface ProductVariantsProps {
  register: UseFormRegister<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
  watch: UseFormWatch<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  units: Unit[];
  variantFields: any[];
  removeVariant: (index: number) => void;
  toggleStockManagement: (index: number) => void;
}

export default function ProductVariants({
  register,
  setValue,
  watch,
  errors,
  units,
  variantFields,
  removeVariant,
  toggleStockManagement,
}: ProductVariantsProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Varian Produk</h2>
        <button
          type="button"
          onClick={() => {
            // This will be handled by the parent component
            const event = new CustomEvent('addVariant');
            window.dispatchEvent(event);
          }}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-3 w-3 mr-1" />
          Tambah Varian
        </button>
      </div>
      <div className="p-6">
        {variantFields.map((field, index) => (
          <div key={field.id} className={`border border-gray-200 rounded-lg p-4 mb-4 ${index > 0 ? 'mt-4' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Varian {index + 1}</h3>
              {variantFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Satuan <span className="text-red-500">*</span>
                </label>
                <select
                  {...register(`variants.${index}.unitId`)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                >
                  <option value="">Pilih Satuan</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} ({unit.abbreviation})
                    </option>
                  ))}
                </select>
                {errors.variants?.[index]?.unitId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.variants[index]?.unitId?.message}
                  </p>
                )}
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Berat/Jumlah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register(`variants.${index}.weight`)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Contoh: 500, 1, 2.5"
                />
                {errors.variants?.[index]?.weight && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.variants[index]?.weight?.message}
                  </p>
                )}
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  {...register(`variants.${index}.sku`)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Contoh: PRD-001-KG"
                />
              </div>

              {/* Barcode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode
                </label>
                <input
                  type="text"
                  {...register(`variants.${index}.barcode`)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Contoh: 1234567890123"
                />
              </div>

              {/* Price Section */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-4">
                {/* Discounted Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Diskon
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">Rp</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      {...register(`variants.${index}.price`, {
                        valueAsNumber: true,
                        onChange: (e) => {
                          const value = e.target.value;
                          if (value === '' || value === null || value === undefined) {
                            setValue(`variants.${index}.price`, 0);
                          } else {
                            setValue(`variants.${index}.price`, parseFloat(value));
                          }
                        }
                      })}
                      className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      placeholder="0 untuk tidak ada diskon"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Masukkan 0 atau kosongkan jika tidak ada diskon
                  </p>
                </div>

                {/* Normal Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Normal <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">Rp</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      {...register(`variants.${index}.originalPrice`, { valueAsNumber: true })}
                      className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      placeholder="0"
                    />
                  </div>
                  {errors.variants?.[index]?.originalPrice && (
                    <p className="mt-1 text-sm text-red-600">
                      Harga normal wajib diisi
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Settings */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                {/* Stock Management */}
                <div className="md:col-span-2">
                  <div className="space-y-4">
                    {/* Stock Management Toggle */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Kelola Stok</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Non-Aktif</span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            id={`variants.${index}.manageStock`}
                            {...register(`variants.${index}.manageStock`)}
                            className="sr-only"
                          />
                          <div
                            onClick={() => toggleStockManagement(index)}
                            className={`block w-10 h-6 rounded-full cursor-pointer transition-colors ${
                              watch(`variants.${index}.manageStock`) ? 'bg-orange-600' : 'bg-gray-300'
                            }`}
                          >
                            <div
                              className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                                watch(`variants.${index}.manageStock`) ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">Aktif</span>
                      </div>
                    </div>

                    {/* Stock Quantity - Show when managing stock */}
                    {watch(`variants.${index}.manageStock`) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Jumlah Stok
                          </label>
                          <input
                            type="number"
                            min="0"
                            {...register(`variants.${index}.stockQuantity`, { valueAsNumber: true })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status Ketersediaan
                          </label>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              watch(`variants.${index}.inStock`) ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span className="text-sm text-gray-700">
                              {watch(`variants.${index}.inStock`) ? 'Tersedia' : 'Habis'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-3 pt-6">
                  <input
                    type="checkbox"
                    id={`variants.${index}.isActive`}
                    {...register(`variants.${index}.isActive`)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`variants.${index}.isActive`} className="text-sm font-medium text-gray-700">
                    Aktif
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}

        {errors.variants && (
          <p className="mt-1 text-sm text-red-600">{errors.variants.message}</p>
        )}
      </div>
    </div>
  );
}