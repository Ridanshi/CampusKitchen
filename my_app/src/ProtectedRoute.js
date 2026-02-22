import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('userRole');

  // Not logged in → redirect to home
  if (!token) {
    return <Navigate to="/" />;
  }

  // Logged in but trying to access admin page as student
  if (adminOnly && role !== 'admin') {
    return <Navigate to="/client/clienthome" />;
  }

  return children;
};

export default ProtectedRoute;