import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import SuggestPricePage from './pages/SuggestPricePage';
import AccountPage from './pages/AccountPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import OrderDetailPage from "@/pages/OrderDetailPage.jsx"; // 👈 добавлено

export default function App() {
  return (
    <AuthProvider> {/* 👈 обёртка контекста авторизации */}
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/suggest-price" element={<SuggestPricePage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/orders/:orderId" element={<OrderDetailPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
