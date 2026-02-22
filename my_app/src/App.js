import 'bootstrap/dist/css/bootstrap.css'
import HomePage from './components/HomePage';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ChangePass from './components/ChangePass';
import Search from './components/Search';

import ClientHome from './components/client/ClientHome'
import ClientBook from './components/client/ClientBook'
import MyBookings from './components/client/MyBookings';
import Complaints from './components/client/Complaints';
import PhotoUpload from './components/client/PhotoUpload';
import EditProfile from './components/client/EditProfile';
import Footer from './components/client/Footer';
import Guidelines from './components/client/Guidelines';

import AdminDashboard from './components/admin/AdminDashboard';
import AdminProfile from './components/admin/AdminProfile';
import AdminUsers from './components/admin/AdminUsers';
import AdminBookings from './components/admin/AdminBookings';
import AdminComplaints from './components/admin/AdminComplaints';
import AdminPhotos from './components/admin/AdminPhotos';
import AdminRegister from './components/admin/AdminRegister';
import CreateAdmin from './components/admin/CreateAdmin';
import ForgotPassword from './components/ForgotPassword';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('userRole');

  if (!token) return <Navigate to="/" />;
  if (adminOnly && role !== 'admin') return <Navigate to="/client/clienthome" />;
  if (!adminOnly && role === 'admin') return <Navigate to="/admin/dashboard" />;

  return children;
};

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/change_pass' element={<ChangePass />} />
          <Route path='/search' element={<Search />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute adminOnly={true}><AdminProfile /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute adminOnly={true}><AdminBookings /></ProtectedRoute>} />
          <Route path="/admin/complaints" element={<ProtectedRoute adminOnly={true}><AdminComplaints /></ProtectedRoute>} />
          <Route path="/admin/photos" element={<ProtectedRoute adminOnly={true}><AdminPhotos /></ProtectedRoute>} />
          <Route path="/admin/register" element={<ProtectedRoute adminOnly={true}><AdminRegister /></ProtectedRoute>} />
          <Route path="/admin/create-admin" element={<ProtectedRoute adminOnly={true}><CreateAdmin /></ProtectedRoute>} />

          {/* Client Routes */}
          <Route path='client/clienthome' element={<ProtectedRoute><ClientHome /></ProtectedRoute>} />
          <Route path='client/clientbook' element={<ProtectedRoute><ClientBook /></ProtectedRoute>} />
          <Route path='client/clientbookings' element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path='client/photoupload' element={<ProtectedRoute><PhotoUpload /></ProtectedRoute>} />
          <Route path='client/complaints' element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
          <Route path='client/edit' element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path='client/footer' element={<ProtectedRoute><Footer /></ProtectedRoute>} />
          <Route path='client/guidelines' element={<ProtectedRoute><Guidelines /></ProtectedRoute>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;