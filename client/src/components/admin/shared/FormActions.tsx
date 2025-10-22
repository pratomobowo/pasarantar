import { Link } from 'react-router-dom';
import { Save } from 'lucide-react';

interface FormActionsProps {
  cancelTo: string;
  cancelText?: string;
  submitText?: string;
  loading?: boolean;
  disabled?: boolean;
  loadingText?: string;
}

export default function FormActions({
  cancelTo,
  cancelText = 'Batal',
  submitText = 'Simpan',
  loading = false,
  disabled = false,
  loadingText = 'Menyimpan...',
}: FormActionsProps) {
  return (
    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
      <Link
        to={cancelTo}
        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
      >
        {cancelText}
      </Link>
      <button
        type="submit"
        disabled={loading || disabled}
        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {loadingText}
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            {submitText}
          </>
        )}
      </button>
    </div>
  );
}