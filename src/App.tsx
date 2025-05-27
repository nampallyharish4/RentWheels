import React from 'react';
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
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<HomePage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="vehicles/:id" element={<VehicleDetailsPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="verify-email" element={<VerifyEmailPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<EditProfilePage />} />
            <Route path="vehicles/list" element={<VehicleListPage />} />
            <Route path="vehicles/add" element={<AddVehiclePage />} />
            <Route path="vehicles/edit/:id" element={<EditVehiclePage />} />
            <Route path="book-vehicle/:vehicleId" element={<BookingPage />} />
            <Route path="booking/payment/:id" element={<PaymentPage />} />
            <Route
              path="booking/confirmation/:bookingId"
              element={<BookingConfirmationPage />}
            />
            <Route
              path="booking-details/:bookingId"
              element={<BookingDetailsPage />}
            />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
