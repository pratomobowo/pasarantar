import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { customerApi } from '../services/customerApi';
import { useCustomerAuth } from './CustomerAuthContext';
import { CustomerNotification } from 'shared/dist/types';

interface CustomerNotificationContextType {
  notifications: CustomerNotification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const CustomerNotificationContext = createContext<CustomerNotificationContextType | undefined>(undefined);

interface CustomerNotificationProviderProps {
  children: ReactNode;
}

export function CustomerNotificationProvider({ children }: CustomerNotificationProviderProps) {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useCustomerAuth();

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const response = await customerApi.getNotifications();
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch customer notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await customerApi.getUnreadCount();
      if (response.success && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await customerApi.markNotificationAsRead(id);
      
      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await customerApi.markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await customerApi.deleteNotification(id);
      
      // Update local state
      const deletedNotification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      
      // Update unread count if the deleted notification was unread
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const refreshNotifications = async () => {
    await Promise.all([
      fetchNotifications(),
      fetchUnreadCount()
    ]);
  };

  // Initial fetch and auto-refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial fetch
    refreshNotifications();

    // Auto-refresh notifications every 30 seconds
    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const value: CustomerNotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };

  return (
    <CustomerNotificationContext.Provider value={value}>
      {children}
    </CustomerNotificationContext.Provider>
  );
}

export function useCustomerNotifications() {
  const context = useContext(CustomerNotificationContext);
  if (context === undefined) {
    throw new Error('useCustomerNotifications must be used within a CustomerNotificationProvider');
  }
  return context;
}