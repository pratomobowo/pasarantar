import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ShoppingBag,
  ChevronDown,
  UserCircle,
  MessageSquare,
  BarChart3,
  Bell,
  CheckCircle,
  Package as PackageIcon
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { ToastProvider } from '../../contexts/ToastContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import NotificationBell from './NotificationBell';
import NotificationDropdown from './NotificationDropdown';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
  subItems?: {
    name: string;
    href: string;
    current: boolean;
  }[];
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout, isAuthenticated, isLoading } = useAdminAuth();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Close profile menu if clicking outside
      if (profileMenuOpen && !target.closest('.profile-dropdown')) {
        setProfileMenuOpen(false);
      }
      
      // Close notification menu if clicking outside
      if (notificationMenuOpen && !target.closest('.notification-dropdown')) {
        setNotificationMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen, notificationMenuOpen]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Don't render the layout if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const navigation: SidebarItem[] = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: Home,
      current: location.pathname === '/admin/dashboard',
    },
    {
      name: 'Produk',
      href: '/admin/products',
      icon: Package,
      current: location.pathname.startsWith('/admin/products'),
      subItems: [
        {
          name: 'Daftar Produk',
          href: '/admin/products',
          current: location.pathname === '/admin/products',
        },
        {
          name: 'Kategori',
          href: '/admin/categories',
          current: location.pathname.startsWith('/admin/categories'),
        },
        {
          name: 'Satuan',
          href: '/admin/units',
          current: location.pathname.startsWith('/admin/units'),
        },
        {
          name: 'Tag',
          href: '/admin/tags',
          current: location.pathname.startsWith('/admin/tags'),
        },
        {
          name: 'Varian Produk',
          href: '/admin/variants',
          current: location.pathname.startsWith('/admin/variants'),
        },
      ],
    },
    {
      name: 'Pesanan',
      href: '/admin/orders',
      icon: ShoppingBag,
      current: location.pathname.startsWith('/admin/orders'),
    },
    {
      name: 'Pelanggan',
      href: '/admin/customers',
      icon: Users,
      current: location.pathname.startsWith('/admin/customers'),
    },
    {
      name: 'Review Produk',
      href: '/admin/reviews',
      icon: MessageSquare,
      current: location.pathname.startsWith('/admin/reviews'),
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      current: location.pathname.startsWith('/admin/analytics'),
    },
    {
      name: 'Pengaturan',
      href: '/admin/settings',
      icon: Settings,
      current: location.pathname.startsWith('/admin/settings'),
      subItems: [
        {
          name: 'Umum',
          href: '/admin/settings',
          current: location.pathname === '/admin/settings',
        },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <ToastProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-gray-600 transition-opacity ${sidebarOpen ? 'opacity-75' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        <div className={`relative flex w-64 flex-1 flex-col bg-white transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => {
                        toggleExpanded(item.name);
                        setSidebarOpen(false);
                      }}
                      className={`w-full group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        item.current
                          ? 'bg-orange-100 text-orange-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${
                        expandedItems.includes(item.name) ? 'rotate-180' : ''
                      }`} />
                    </button>
                    {expandedItems.includes(item.name) && (
                      <div className="mt-1 ml-8 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            className={`block px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                              subItem.current
                                ? 'bg-orange-50 text-orange-600 font-medium'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      item.current
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center p-6 border-b">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-bold text-gray-900">PasarAntar</h2>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={`w-full group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        item.current
                          ? 'bg-orange-100 text-orange-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.name}
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${
                        expandedItems.includes(item.name) ? 'rotate-180' : ''
                      }`} />
                    </button>
                    {expandedItems.includes(item.name) && (
                      <div className="mt-1 ml-8 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            className={`block px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                              subItem.current
                                ? 'bg-orange-50 text-orange-600 font-medium'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      item.current
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-400 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1"></div>

            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative notification-dropdown">
                <NotificationBell
                  onClick={() => {
                    setNotificationMenuOpen(!notificationMenuOpen);
                    setProfileMenuOpen(false); // Close profile menu when opening notification menu
                  }}
                />
                {/* Notification Dropdown - Moved inside the relative container */}
                <NotificationDropdown
                  isOpen={notificationMenuOpen}
                  onClose={() => setNotificationMenuOpen(false)}
                />
              </div>

              {/* Profile dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => {
                    setProfileMenuOpen(!profileMenuOpen);
                    setNotificationMenuOpen(false); // Close notification menu when opening profile menu
                  }}
                  className="flex items-center space-x-3 text-sm rounded-lg p-2 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <UserCircle className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="hidden md:block font-medium text-gray-700">
                    {admin?.username || 'Admin'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{admin?.username}</p>
                      <p className="text-xs text-gray-500">{admin?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
    </NotificationProvider>
    </ToastProvider>
  );
}