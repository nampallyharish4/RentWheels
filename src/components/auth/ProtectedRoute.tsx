import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const ProtectedRoute = () => {
  const profile = useAuthStore((state) => state.profile);

  if (!profile) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" />;
  }

  // Logged in, render child routes
  return <Outlet />;
};

export default ProtectedRoute;
