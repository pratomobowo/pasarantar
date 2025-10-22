import { useState } from 'react';
import { Bell, UserPlus, ShoppingBag, Check, X, Clock, Loader2 } from 'lucide-react';
import { useNotifications, Notification } from '../../contexts/NotificationContext';
import { formatRelativeTime } from '../../utils/formatters';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus className="h-4 w-4 text-blue-600" />;
      case 'new_order':
        return <ShoppingBag className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationIconBg = (type: Notification['type']) => {
    switch (type) {
      case 'user_registration':
        return 'bg-blue-100';
      case 'new_order':
        return 'bg-green-100';
      default:
        return 'bg-gray-100';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    onClose();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[60]">
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Notifikasi</h3>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-orange-600 hover:text-orange-500 font-medium"
          >
            Tandai semua dibaca
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Memuat notifikasi...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Belum ada notifikasi</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors ${
                !notification.isRead ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start">
                {/* Icon */}
                <div className={`flex-shrink-0 p-1 rounded-full ${getNotificationIconBg(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center mt-1">
                        <Clock className="h-3 w-3 text-gray-400 mr-1" />
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center ml-2 space-x-1">
                      {!notification.isRead && (
                        <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                      )}
                      <button
                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100">
          <button className="text-sm text-orange-600 hover:text-orange-500 font-medium">
            Lihat semua notifikasi
          </button>
        </div>
      )}
    </div>
  );
}