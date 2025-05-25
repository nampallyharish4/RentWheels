import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import VehiclesPage from './pages/VehiclesPage';
import VehicleDetailsPage from './pages/VehicleDetailsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import DashboardPage from './pages/DashboardPage';
import { useAuthStore } from './store/authStore';

function App() {
  const { loadUser } = useAuthStore();
  
  useEffect(() => {
    loadUser();
  }, [loadUser]);
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="vehicles/:id" element={<VehicleDetailsPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="verify-email" element={<VerifyEmailPage />} />
          <Route path="booking/:id" element={<BookingPage />} />
          <Route path="booking/payment/:id" element={<PaymentPage />} />
          <Route path="booking/confirmation" element={<BookingConfirmationPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;