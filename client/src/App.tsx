import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from './contexts/CartContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { CustomerAuthProvider } from './contexts/CustomerAuthContext';
import { CustomerNotificationProvider } from './contexts/CustomerNotificationContext';
import { ToastProvider } from './contexts/ToastContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import Home from './components/Home';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import QnAPage from './pages/QnAPage';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFoundPage from './pages/NotFoundPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductList from './pages/admin/ProductList';
import ProductDetail from './pages/admin/ProductDetail';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import CategoryList from './pages/admin/CategoryList';
import AddCategory from './pages/admin/AddCategory';
import EditCategory from './pages/admin/EditCategory';
import UnitList from './pages/admin/UnitList';
import AddUnit from './pages/admin/AddUnit';
import EditUnit from './pages/admin/EditUnit';
import TagList from './pages/admin/TagList';
import AddTag from './pages/admin/AddTag';
import EditTag from './pages/admin/EditTag';
import VariantList from './pages/admin/VariantList';
import AddVariant from './pages/admin/AddVariant';
import EditVariant from './pages/admin/EditVariant';
import OrderList from './pages/admin/OrderList';
import OrderDetail from './pages/admin/OrderDetail';
// Customer imports
import CustomerLayout from './components/customer/CustomerLayout';
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerOrders from './pages/customer/Orders';
import CustomerOrderDetail from './pages/customer/OrderDetail';
import CustomerReviews from './pages/customer/Reviews';
import CustomerShoppingPoints from './pages/customer/ShoppingPoints';
import CustomerRecipes from './pages/customer/Recipes';
import CustomerProfile from './pages/customer/Profile';
import CustomerAddresses from './pages/customer/Addresses';
import CustomerSecurity from './pages/customer/Security';
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegister from './pages/CustomerRegister';

// Admin Customer imports
import CustomerList from './pages/admin/CustomerList';
import CustomerDetail from './pages/admin/CustomerDetail';
import EditCustomer from './pages/admin/EditCustomer';
import ReviewManagement from './pages/admin/ReviewManagement';
import OrderAnalytics from './pages/admin/OrderAnalytics';
import Settings from './pages/admin/Settings';
import SmtpSettings from './pages/admin/SmtpSettings';
import './index.css';

function AppContent() {
  const { settings } = useSettings();

  // Update document title and meta tags based on settings
  useEffect(() => {
    if (settings) {
      document.title = settings.metaTitle || settings.siteName || 'PasarAntar';
      
      // Update or create meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', settings.metaDescription || settings.siteDescription || 'Platform belanja online terpercaya');
      
      // Update or create OG meta tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', settings.metaTitle || settings.siteName || 'PasarAntar');
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', settings.metaDescription || settings.siteDescription || 'Platform belanja online terpercaya');
      }
      
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && settings.logoUrl) {
        ogImage.setAttribute('content', settings.logoUrl);
      }
    }
  }, [settings]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <HelmetProvider>
        <div className="min-h-screen bg-gray-50">
                  <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/qna" element={<QnAPage />} />
                <Route path="/recipes" element={<RecipesPage />} />
                <Route path="/recipes/:id" element={<RecipeDetailPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                
                {/* Customer Auth Routes */}
                <Route path="/customer/login" element={<CustomerLogin />} />
                <Route path="/customer/register" element={<CustomerRegister />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Customer Dashboard Routes */}
                <Route path="/customer" element={<CustomerLayout />}>
                  <Route path="dashboard" element={<CustomerDashboard />} />
                  <Route path="orders" element={<CustomerOrders />} />
                  <Route path="orders/:id" element={<CustomerOrderDetail />} />
                  <Route path="reviews" element={<CustomerReviews />} />
                  <Route path="shopping-points" element={<CustomerShoppingPoints />} />
                  <Route path="recipes" element={<CustomerRecipes />} />
                  <Route path="profile" element={<CustomerProfile />} />
                  <Route path="addresses" element={<CustomerAddresses />} />
                  <Route path="security" element={<CustomerSecurity />} />
                </Route>
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="products" element={<ProductList />} />
                  <Route path="products/:id" element={<ProductDetail />} />
                  <Route path="products/:id/edit" element={<EditProduct />} />
                  <Route path="products/new" element={<AddProduct />} />
                  <Route path="categories" element={<CategoryList />} />
                  <Route path="categories/new" element={<AddCategory />} />
                  <Route path="categories/:id/edit" element={<EditCategory />} />
                  <Route path="units" element={<UnitList />} />
                  <Route path="units/new" element={<AddUnit />} />
                  <Route path="units/:id/edit" element={<EditUnit />} />
                  <Route path="tags" element={<TagList />} />
                  <Route path="tags/new" element={<AddTag />} />
                  <Route path="tags/:id/edit" element={<EditTag />} />
                  <Route path="variants" element={<VariantList />} />
                  <Route path="variants/new" element={<AddVariant />} />
                  <Route path="variants/:id/edit" element={<EditVariant />} />
                  <Route path="orders" element={<OrderList />} />
                  <Route path="orders/:id" element={<OrderDetail />} />
                  <Route path="customers" element={<CustomerList />} />
                  <Route path="customers/:id" element={<CustomerDetail />} />
                  <Route path="customers/:id/edit" element={<EditCustomer />} />
                  <Route path="reviews" element={<ReviewManagement />} />
                  <Route path="analytics" element={<OrderAnalytics />} />
                  <Route path="settings" element={<Settings />} />
                  
                </Route>
                
                {/* 404 Page - Must be last */}
                <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </div>
            </HelmetProvider>
            </Router>
  );
}

function App() {
  return (
    <CartProvider>
      <SettingsProvider>
        <AdminAuthProvider>
          <CustomerAuthProvider>
            <CustomerNotificationProvider>
              <ToastProvider>
                <AppContent />
              </ToastProvider>
            </CustomerNotificationProvider>
          </CustomerAuthProvider>
        </AdminAuthProvider>
      </SettingsProvider>
    </CartProvider>
  );
}

export default App;
