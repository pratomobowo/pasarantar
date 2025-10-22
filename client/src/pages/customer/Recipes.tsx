import React from 'react';
import {
  BookOpen,
  Clock,
  Users,
  ChefHat,
  Star,
  Heart,
  Search,
  Filter,
  ArrowRight,
  Plus,
  Share2,
  Upload,
  Camera
} from 'lucide-react';

export default function Recipes() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bagikan Resep</h1>
          <p className="text-gray-600 mt-1">Bagikan resep masakan Anda dengan komunitas PasarAntar</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Resep Baru
        </button>
      </div>

      {/* My Recipes Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resep Saya</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">12</p>
              <p className="text-sm text-gray-500 mt-1">Total dibagikan</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">1,245</p>
              <p className="text-sm text-green-600 mt-1">Bulan ini</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disukai</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">89</p>
              <p className="text-sm text-blue-600 mt-1">Total likes</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dibagikan</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">45</p>
              <p className="text-sm text-purple-600 mt-1">Kali dibagikan</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <Share2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Coming Soon */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Share2 className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Fitur Sedang Dalam Pengerjaan</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Kami sedang mengembangkan platform berbagi resep yang memungkinkan Anda untuk berbagi resep masakan dengan komunitas PasarAntar, lengkap dengan foto, video tutorial, dan interaksi dengan pengguna lain.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Upload className="h-4 w-4 mr-1 text-blue-500" />
                <span>Upload foto dan video</span>
              </div>
              <div className="flex items-center">
                <Camera className="h-4 w-4 mr-1 text-green-500" />
                <span>Langkah demi langkah</span>
              </div>
              <div className="flex items-center">
                <Share2 className="h-4 w-4 mr-1 text-purple-500" />
                <span>Bagikan ke sosial media</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Recipes Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Resep Saya</h2>
            <button className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center">
              Lihat Semua
              <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">Belum ada resep yang dibagikan</p>
          <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700">
            <Plus className="h-4 w-4 mr-2" />
            Bagikan Resep Pertama
          </button>
        </div>
      </div>

      {/* Community Recipes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Resep Komunitas</h2>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cari resep..."
                  className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-500">Resep komunitas akan tersedia segera</p>
        </div>
      </div>
    </div>
  );
}