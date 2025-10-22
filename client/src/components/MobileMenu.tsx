import { useState, useEffect } from 'react';
import { X, Home, Info, Phone, HelpCircle, BookOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const menuItems = [
    {
      id: 'home',
      label: 'Beranda',
      icon: Home,
      action: () => {
        navigate('/');
        onClose();
      }
    },
    {
      id: 'about',
      label: 'Tentang Kami',
      icon: Info,
      action: () => {
        navigate('/about');
        onClose();
      }
    },
    {
      id: 'contact',
      label: 'Hubungi Kami',
      icon: Phone,
      action: () => {
        navigate('/contact');
        onClose();
      }
    },
    {
      id: 'qna',
      label: 'QnA',
      icon: HelpCircle,
      action: () => {
        navigate('/qna');
        onClose();
      }
    },
    {
      id: 'recipes',
      label: 'Resep Masakan',
      icon: BookOpen,
      action: () => {
        navigate('/recipes');
        onClose();
      }
    }
  ];

  const handleMenuItemClick = (action: () => void) => {
    action();
    onClose();
  };

  // Add custom styles for staggered animation
  if (typeof window !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `;
    if (!document.head.querySelector('style[data-mobile-menu]')) {
      style.setAttribute('data-mobile-menu', 'true');
      document.head.appendChild(style);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sliding Menu */}
      <div className={`fixed top-0 h-full w-[70%] max-w-sm bg-white shadow-2xl z-50 transform transition-all duration-500 ease-out lg:left-auto lg:right-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-full'
      }`}>
        {/* Menu Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.action)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-all duration-200 group"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: isOpen ? `${isDesktop ? 'slideInRight' : 'slideInLeft'} 0.3s ease-out forwards` : 'none',
                  opacity: isOpen ? 1 : 0,
                  transform: isOpen ? 'translateX(0)' : (isDesktop ? 'translateX(20px)' : 'translateX(-20px)')
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-orange-100 text-orange-600 group-hover:bg-orange-200 transition-colors duration-200">
                    <Icon size={20} />
                  </div>
                  <span className="font-medium text-gray-900">{item.label}</span>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-orange-600 transition-colors duration-200" />
              </button>
            );
          })}
        </div>
        
        {/* Menu Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Butuh bantuan?</p>
            <button
              onClick={() => {
                navigate('/contact');
                onClose();
              }}
              className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors duration-200"
            >
              Hubungi Kami
            </button>
          </div>
        </div>
      </div>
    </>
  );
}