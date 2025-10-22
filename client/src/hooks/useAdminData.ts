import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi';

interface UseAdminDataOptions<T> {
  fetchFn: (id: string) => Promise<{ success: boolean; data?: T; message?: string }>;
  redirectTo?: string;
  mapData?: (data: any) => T;
}

interface UseAdminDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAdminData<T>(
  id: string | undefined,
  options: UseAdminDataOptions<T>
): UseAdminDataReturn<T> {
  const navigate = useNavigate();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await options.fetchFn(id);
      
      if (response.success && response.data) {
        const mappedData = options.mapData ? options.mapData(response.data) : response.data;
        setData(mappedData);
      } else {
        setError(response.message || 'Data tidak ditemukan');
        if (options.redirectTo) {
          setTimeout(() => {
            navigate(options.redirectTo!);
          }, 2000);
        }
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Terjadi kesalahan saat mengambil data');
      if (options.redirectTo) {
        setTimeout(() => {
          navigate(options.redirectTo!);
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Specific hooks for different entity types
export function useUnit(id: string | undefined) {
  return useAdminData(id, {
    fetchFn: adminApi.getUnit.bind(adminApi),
    redirectTo: '/admin/units',
  });
}

export function useCategory(id: string | undefined) {
  return useAdminData(id, {
    fetchFn: adminApi.getCategory.bind(adminApi),
    redirectTo: '/admin/categories',
  });
}

export function useTag(id: string | undefined) {
  return useAdminData(id, {
    fetchFn: adminApi.getTag.bind(adminApi),
    redirectTo: '/admin/tags',
  });
}

export function useProduct(id: string | undefined) {
  return useAdminData(id, {
    fetchFn: adminApi.getProduct.bind(adminApi),
    redirectTo: '/admin/products',
  });
}

export function useVariant(id: string | undefined) {
  return useAdminData(id, {
    fetchFn: adminApi.getUnit.bind(adminApi), // Assuming there's a getVariant method
    redirectTo: '/admin/variants',
  });
}