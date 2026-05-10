import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';
import { useWishlistStore } from './store/wishlistStore';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Spinner from './components/ui/Spinner';
import WhatsAppButton from './components/ui/WhatsAppButton';
import ChatBot from './components/ui/ChatBot';
import CookieBanner from './components/ui/CookieBanner';
import RequirePhoneGate from './components/ui/RequirePhoneGate';
import ThemeProvider from './theme/ThemeProvider';

// Lazy loading de páginas para code splitting
const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const Categories = lazy(() => import('./pages/Categories'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const CustomizeProduct = lazy(() => import('./pages/CustomizeProduct'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const PaymentResult = lazy(() => import('./pages/PaymentResult'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/legal/TermsConditions'));
const ReturnPolicy = lazy(() => import('./pages/legal/ReturnPolicy'));

// Customer pages
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'));
const OrderHistory = lazy(() => import('./pages/customer/OrderHistory'));
const OrderDetail = lazy(() => import('./pages/customer/OrderDetail'));
const Profile = lazy(() => import('./pages/customer/Profile'));
const Addresses = lazy(() => import('./pages/customer/Addresses'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const CustomersManager = lazy(() => import('./pages/admin/CustomersManager'));
const CategoriesManager = lazy(() => import('./pages/admin/CategoriesManager'));
const ProductsManager = lazy(() => import('./pages/admin/ProductsManager'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const OrdersManager = lazy(() => import('./pages/admin/OrdersManager'));
const ReviewsManager = lazy(() => import('./pages/admin/ReviewsManager'));
const MessagesManager = lazy(() => import('./pages/admin/MessagesManager'));
const SettingsManager = lazy(() => import('./pages/admin/SettingsManager'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
});

/** Fuerza el remount de Catalog cuando cambia el query string (search, filtros, página). */
function CatalogWithKey() {
  const location = useLocation();
  return <Catalog key={location.pathname + location.search} />;
}

function AppContent() {
  const { fetchUser, isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated]);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>}>
      <Routes>
        {/* Rutas públicas con layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<CatalogWithKey />} />
          <Route path="/catalogo/:categoriaSlug" element={<CatalogWithKey />} />
          <Route path="/categorias" element={<Categories />} />
          <Route path="/producto/:slug" element={<ProductDetail />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
          <Route path="/restablecer-contrasena" element={<ResetPassword />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/verificar-email" element={<VerifyEmail />} />
          <Route path="/politica-cookies" element={<CookiePolicy />} />
          <Route path="/politica-privacidad" element={<PrivacyPolicy />} />
          <Route path="/terminos-condiciones" element={<TermsConditions />} />
          <Route path="/politica-devoluciones" element={<ReturnPolicy />} />

          {/* Rutas protegidas - cliente */}
          <Route path="/personalizar/:slug" element={<ProtectedRoute><CustomizeProduct /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/pago/resultado" element={<ProtectedRoute><PaymentResult /></ProtectedRoute>} />
          <Route path="/lista-deseos" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/mi-cuenta" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/mi-cuenta/pedidos" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
          <Route path="/mi-cuenta/pedidos/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/mi-cuenta/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/mi-cuenta/direcciones" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
        </Route>

        {/* Rutas admin */}
        <Route element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/clientes" element={<CustomersManager />} />
          <Route path="/admin/categorias" element={<CategoriesManager />} />
          <Route path="/admin/productos" element={<ProductsManager />} />
          <Route path="/admin/productos/nuevo" element={<ProductForm />} />
          <Route path="/admin/productos/:id/editar" element={<ProductForm />} />
          <Route path="/admin/pedidos" element={<OrdersManager />} />
          <Route path="/admin/resenas" element={<ReviewsManager />} />
          <Route path="/admin/mensajes" element={<MessagesManager />} />
          <Route path="/admin/configuracion" element={<SettingsManager />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AppContent />
          <RequirePhoneGate />
          <ChatBot />
          <WhatsAppButton />
          <CookieBanner />
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
