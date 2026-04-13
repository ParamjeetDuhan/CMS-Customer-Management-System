import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { PageLoader } from '../components/common/Loader';

// Pages
import Home        from '../pages/Home/Home';
import Login       from '../pages/Auth/Login';
import Signup      from '../pages/Auth/Signup';
import NearbyShops from '../pages/Shops/NearbyShops';
import ShopDetails from '../pages/Shops/ShopDetails';
import Products    from '../pages/Products/Products';
import Cart        from '../pages/Cart/Cart';
import Checkout    from '../pages/Cart/Checkout';
import Orders      from '../pages/Orders/Orders';
import OrderDetail from '../pages/Orders/OrderDetail';
import Profile     from '../pages/Profile/Profile';
import Payment     from '../pages/Payment/Payment';
import ForgotPassword from '../pages/Auth/Forgotpassword';
import ResetPassword from '../pages/Auth/Resetpassword';
import AddressBook from '../pages/Address/Addressbook.jsx';

/* ── Protected Route wrapper ── */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

/* ── Public only (redirect if authed) ── */
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (isAuthenticated)
    return <Navigate to={location.state?.from?.pathname || '/'} replace />;
  return children;
};

/* ── Page wrapper with Navbar + Footer ── */
const Layout = ({ children, noFooter }) => (
  <div className="min-h-screen flex flex-col bg-brand-bg">
    <Navbar />
    <main className="flex-1 pt-16">{children}</main>
    {!noFooter && <Footer />}
  </div>
);

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<Layout><Home /></Layout>} />
    <Route path="/shops" element={<Layout><NearbyShops /></Layout>} />
    <Route path="/shops/:id" element={<Layout><ShopDetails /></Layout>} />
    <Route path="/shops/:id/products" element={<Layout><Products /></Layout>} />

    {/* Guest only */}
    <Route path="/login"  element={<GuestRoute><Layout noFooter><Login  /></Layout></GuestRoute>} />
    <Route path="/signup" element={<GuestRoute><Layout noFooter><Signup /></Layout></GuestRoute>} />
    <Route path="/forgot-password"  element={<GuestRoute><Layout noFooter><ForgotPassword/></Layout></GuestRoute>} />
    <Route path="/reset-password"  element={<GuestRoute><Layout noFooter><ResetPassword/></Layout></GuestRoute>} />

    {/* Protected */}
    <Route path="/cart"     element={<ProtectedRoute><Layout><Cart /></Layout></ProtectedRoute>} />
    <Route path="/checkout" element={<ProtectedRoute><Layout noFooter><Checkout /></Layout></ProtectedRoute>} />
    <Route path="/payment"  element={<ProtectedRoute><Layout noFooter><Payment /></Layout></ProtectedRoute>} />
    <Route path="/orders"   element={<ProtectedRoute><Layout><Orders /></Layout></ProtectedRoute>} />
    <Route path="/orders/:id" element={<ProtectedRoute><Layout><OrderDetail /></Layout></ProtectedRoute>} />
    <Route path="/profile"  element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
    <Route path="/addresses" element={<ProtectedRoute><Layout><AddressBook /></Layout></ProtectedRoute>} />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
