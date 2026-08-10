import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SellerRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-container" style={{ textAlign: 'center', padding: '60px' }}>Checking permissions...</div>;
  }

  // Check if authenticated AND has seller or admin role
  if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default SellerRoute;
