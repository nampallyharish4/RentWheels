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
import BookingDetailsPage from './pages/BookingDetailsPage';
import DashboardPage from './pages/DashboardPage';
import VehicleListPage from './pages/VehicleListPage';
import AddVehiclePage from './pages/AddVehiclePage';
import EditVehiclePage from './pages/EditVehiclePage';
import EditProfilePage from './pages/EditProfilePage';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import VerifyEmailRoute from './components/auth/VerifyEmailRoute';

function App() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    // Initial session check
    loadUser();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadUser();
      } else {
        useAuthStore.setState({ user: null, profile: null });
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [loadUser]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public routes */}
          <Route index element={<HomePage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="vehicles/:id" element={<VehicleDetailsPage />} />

          {/* Auth routes - only accessible when not logged in */}
          <Route element={<PublicRoute />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
          </Route>

          {/* Verify email route - accessible after signup */}
          <Route path="verify-email" element={<VerifyEmailPage />} />

          {/* Protected routes - only accessible when logged in and email is confirmed */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile/edit" element={<EditProfilePage />} />
            <Route path="bookings/:id" element={<BookingDetailsPage />} />
            <Route path="vehicles/:id/book" element={<BookingPage />} />
            <Route path="vehicles/:id/edit" element={<EditVehiclePage />} />
            <Route path="vehicles/add" element={<VehicleListPage />} />
            <Route path="vehicles/new" element={<AddVehiclePage />} />
            <Route
              path="bookings/:id/confirmation"
              element={<BookingConfirmationPage />}
            />
            <Route path="bookings/:id/payment" element={<PaymentPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
