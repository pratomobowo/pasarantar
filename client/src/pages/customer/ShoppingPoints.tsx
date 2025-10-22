import React, { useState } from 'react';
import {
  Coins,
  Gift,
  TrendingUp,
  Calendar,
  ArrowRight,
  Star
} from 'lucide-react';
import Pagination from '../../components/ui/Pagination';

export default function ShoppingPoints() {
  // Pagination states for points activity (when implemented)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(1);
  const [totalCount] = useState(0);
  const itemsPerPage = 10;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // TODO: Load points activity data for the selected page
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Poin Belanja</h1>
        <p className="text-gray-600 mt-1">Kelola dan tukar poin belanja Anda</p>
      </div>

      {/* Points Overview Card */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm font-medium">Total Poin Anda</p>
            <p className="text-3xl font-bold mt-2">1,250</p>
            <p className="text-orange-100 text-sm mt-1">Setara dengan Rp 12,500</p>
          </div>
          <div className="bg-white/20 p-4 rounded-lg">
            <Coins className="h-10 w-10 text-white" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Poin Didapat</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">320</p>
              <p className="text-sm text-green-600 mt-1">Bulan ini</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Poin Ditukar</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">150</p>
              <p className="text-sm text-blue-600 mt-1">Bulan ini</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Gift className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Kadaluarsa</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">50</p>
              <p className="text-sm text-red-600 mt-1">30 hari lagi</p>
            </div>
            <div className="p-3 rounded-lg bg-red-100">
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Coming Soon */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Coins className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Fitur Sedang Dalam Pengerjaan</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Kami sedang mengembangkan sistem poin belanja yang lengkap untuk Anda. Segera hadir dengan fitur tukar poin, reward, dan banyak lagi!
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-500" />
                <span>Kumpulkan poin dari setiap pembelian</span>
              </div>
              <div className="flex items-center">
                <Gift className="h-4 w-4 mr-1 text-blue-500" />
                <span>Tukar poin dengan hadiah menarik</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h2>
        </div>
        <div className="p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-500">Riwayat aktivitas poin akan tersedia segera</p>
        </div>
        
        {/* Pagination for Points Activity (when implemented) */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            className="mt-4"
          />
        )}
      </div>
    </div>
  );
}