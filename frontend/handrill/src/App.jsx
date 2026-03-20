import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CustomerHome from './pages/customer/CustomerHome';
import CustomerBookings from './pages/customer/CustomerBookings';
import BookingDetail from './pages/customer/BookingDetail';
import BookingFlow from './pages/customer/BookingFlow';
import CustomerProfile from './pages/customer/CustomerProfile';
import WorkerHome from './pages/worker/WorkerHome';
import WorkerJobs from './pages/worker/WorkerJobs';
import WorkerJobDetail from './pages/worker/WorkerJobDetail';
import WorkerStats from './pages/worker/WorkerStats';
import WorkerProfile from './pages/worker/WorkerProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminWorkers from './pages/admin/AdminWorkers';
import AdminSettings from './pages/admin/AdminSettings';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'CUSTOMER') return <Navigate to="/customer" replace />;
  if (user.role === 'WORKER') return <Navigate to="/worker" replace />;
  return <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/customer" element={<ProtectedRoute roles={['CUSTOMER']}><AppLayout><CustomerHome /></AppLayout></ProtectedRoute>} />
            <Route path="/customer/bookings" element={<ProtectedRoute roles={['CUSTOMER']}><AppLayout><CustomerBookings /></AppLayout></ProtectedRoute>} />
            <Route path="/customer/bookings/:id" element={<ProtectedRoute roles={['CUSTOMER']}><AppLayout><BookingDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/customer/book" element={<ProtectedRoute roles={['CUSTOMER']}><AppLayout><BookingFlow /></AppLayout></ProtectedRoute>} />
            <Route path="/customer/profile" element={<ProtectedRoute roles={['CUSTOMER']}><AppLayout><CustomerProfile /></AppLayout></ProtectedRoute>} />
            <Route path="/worker" element={<ProtectedRoute roles={['WORKER']}><AppLayout><WorkerHome /></AppLayout></ProtectedRoute>} />
            <Route path="/worker/jobs" element={<ProtectedRoute roles={['WORKER']}><AppLayout><WorkerJobs /></AppLayout></ProtectedRoute>} />
            <Route path="/worker/jobs/:id" element={<ProtectedRoute roles={['WORKER']}><AppLayout><WorkerJobDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/worker/stats" element={<ProtectedRoute roles={['WORKER']}><AppLayout><WorkerStats /></AppLayout></ProtectedRoute>} />
            <Route path="/worker/profile" element={<ProtectedRoute roles={['WORKER']}><AppLayout><WorkerProfile /></AppLayout></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute roles={['ADMIN']}><AppLayout><AdminBookings /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/workers" element={<ProtectedRoute roles={['ADMIN']}><AppLayout><AdminWorkers /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute roles={['ADMIN']}><AppLayout><AdminSettings /></AppLayout></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
