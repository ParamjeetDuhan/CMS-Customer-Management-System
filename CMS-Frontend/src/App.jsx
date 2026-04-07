import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppRoutes from './routes/AppRoutes';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#242424',
              color: '#f5f5f5',
              border: '1px solid #333333',
              borderRadius: '12px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#f97316', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
