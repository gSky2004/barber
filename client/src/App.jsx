import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import CartDrawer from './components/CartDrawer';
import ScrollProgress from './components/ScrollProgress';
import SiteBackground from './components/SiteBackground';
import ProtectedRoute from './components/ProtectedRoute';
import { Skeleton } from './components/Skeleton';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Shop = lazy(() => import('./pages/Shop'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
const Book = lazy(() => import('./pages/Book'));
const Order = lazy(() => import('./pages/Order'));
const Contact = lazy(() => import('./pages/Contact'));
const CheckoutPay = lazy(() => import('./pages/CheckoutPay'));
const PayCallback = lazy(() => import('./pages/PayCallback'));
const Receipt = lazy(() => import('./pages/Receipt'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'));
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));
const AdminAudit = lazy(() => import('./pages/admin/AdminAudit'));

function PageLoader() {
  return (
    <div className="section pt-32 flex justify-center">
      <Skeleton className="h-8 w-48" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

function AppRoutes() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <SiteBackground />}
      <div className={isAdmin ? undefined : 'site-content'}>
      {!isAdmin && <Navbar />}
      {!isAdmin && <ScrollProgress />}
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/book" element={<Book />} />
          <Route path="/order" element={<Order />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pay/:sessionId" element={<CheckoutPay />} />
          <Route path="/pay/:sessionId/callback" element={<PayCallback />} />
          <Route path="/receipt/:orderId" element={<Receipt />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute><AdminLayout /></ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="audit" element={<AdminAudit />} />
          </Route>
        </Routes>
      </Suspense>
      {!isAdmin && (
        <>
          <Footer />
          <AuthModal />
          <CartDrawer />
        </>
      )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
        <CartProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </CartProvider>
      </CustomerAuthProvider>
    </AuthProvider>
  );
}
