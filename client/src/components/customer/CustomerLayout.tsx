import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
  Package,
  MapPin,
  Settings,
  Shield,
  ChevronRight,
  UserCircle,
  ChevronDown,
  Bell,
  CheckCircle,
  Star,
  MessageSquare,
  Coins,
  BookOpen
} from 'lucide-react';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useCustomerNotifications } from '../../contexts/CustomerNotificationContext';
import CustomerNotificationDropdown from './CustomerNotificationDropdown';

const CustomerLayout: React.FC = () => {
  const { customer, logout, isAuthenticated } = useCustomerAuth();
  const { unreadCount } = useCustomerNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [settingsSubmenuOpen, setSettingsSubmenuOpen] = useState(false);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
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

  // Auto-open settings submenu when accessing sub pages
  React.useEffect(() => {
    const isSubPage = location.pathname.startsWith('/customer/profile') ||
                     location.pathname.startsWith('/customer/addresses') ||
                     location.pathname.startsWith('/customer/security');
    if (isSubPage) {
      setSettingsSubmenuOpen(true);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/customer/dashboard',
      icon: Home,
      current: location.pathname === '/customer/dashboard'
    },
    {
      name: 'Pesanan Saya',
      href: '/customer/orders',
      icon: ShoppingBag,
      current: location.pathname === '/customer/orders'
    },
    {
      name: 'Ulasan',
      href: '/customer/reviews',
      icon: MessageSquare,
      current: location.pathname === '/customer/reviews'
    },
    {
      name: 'Poin Belanja',
      href: '/customer/shopping-points',
      icon: Coins,
      current: location.pathname === '/customer/shopping-points'
    },
    {
      name: 'Bagikan Resep',
      href: '/customer/recipes',
      icon: BookOpen,
      current: location.pathname === '/customer/recipes'
    },
    {
      name: 'Pengaturan',
      href: '#',
      icon: Settings,
      current: location.pathname.startsWith('/customer/profile') ||
                location.pathname.startsWith('/customer/addresses') ||
                location.pathname.startsWith('/customer/security'),
      subItems: [
        {
          name: 'Profile',
          href: '/customer/profile',
          icon: User,
          current: location.pathname === '/customer/profile'
        },
        {
          name: 'Alamat Pengiriman',
          href: '/customer/addresses',
          icon: MapPin,
          current: location.pathname === '/customer/addresses'
        },
        {
          name: 'Keamanan',
          href: '/customer/security',
          icon: Shield,
          current: location.pathname === '/customer/security'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-gray-600 transition-opacity ${sidebarOpen ? 'opacity-75' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        <div className={`relative flex w-64 flex-1 flex-col bg-white transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-bold text-gray-900">PasarAntar</h2>
                <p className="text-xs text-gray-500">Customer Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasSubItems = 'subItems' in item && item.subItems;
              
              if (hasSubItems) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setSettingsSubmenuOpen(!settingsSubmenuOpen)}
                      className={`group w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        item.current
                          ? 'bg-orange-100 text-orange-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                        settingsSubmenuOpen ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {settingsSubmenuOpen && (
                      <div className="mt-1 ml-4 space-y-1">
                        {item.subItems?.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <Link
                              key={subItem.name}
                              to={subItem.href}
                              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                subItem.current
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              <SubIcon className="mr-3 h-4 w-4" />
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    item.current
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center p-6 border-b">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-bold text-gray-900">PasarAntar</h2>
                <p className="text-xs text-gray-500">Customer Dashboard</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasSubItems = 'subItems' in item && item.subItems;
              
              if (hasSubItems) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setSettingsSubmenuOpen(!settingsSubmenuOpen)}
                      className={`group w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        item.current
                          ? 'bg-orange-100 text-orange-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.name}
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                        settingsSubmenuOpen ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {settingsSubmenuOpen && (
                      <div className="mt-1 ml-4 space-y-1">
                        {item.subItems?.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <Link
                              key={subItem.name}
                              to={subItem.href}
                              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                subItem.current
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                            >
                              <SubIcon className="mr-3 h-4 w-4 flex-shrink-0" />
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    item.current
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
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
              {isAuthenticated && (
                <div className="relative notification-dropdown">
                  <button
                    onClick={() => {
                      setNotificationMenuOpen(!notificationMenuOpen);
                      setProfileMenuOpen(false); // Close profile menu when opening notification menu
                    }}
                    className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>

                  <CustomerNotificationDropdown
                    isOpen={notificationMenuOpen}
                    onClose={() => setNotificationMenuOpen(false)}
                  />
                </div>
              )}

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
                    {customer?.avatarUrl ? (
                      <img
                        src={customer.avatarUrl}
                        alt={customer.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <UserCircle className="h-5 w-5 text-orange-600" />
                    )}
                  </div>
                  <span className="hidden md:block font-medium text-gray-700">
                    {customer?.name || 'Customer'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{customer?.name}</p>
                      <p className="text-xs text-gray-500">{customer?.email}</p>
                    </div>
                    <Link
                      to="/customer/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Profil Saya
                    </Link>
                    <Link
                      to="/customer/addresses"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Alamat Pengiriman
                    </Link>
                    <Link
                      to="/customer/security"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Keamanan
                    </Link>
                    <hr className="my-1" />
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
  );
};

export default CustomerLayout;