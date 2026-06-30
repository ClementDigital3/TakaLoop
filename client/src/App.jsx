import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/citizen/Dashboard';
import CitizenPoints from './pages/citizen/Points';
import CitizenReports from './pages/citizen/Reports';
import BusinessDashboard from './pages/business/Dashboard';
import BusinessListings from './pages/business/Listings';
import BusinessAudit from './pages/business/Audit';
import Marketplace from './pages/Marketplace';
import OfficerDashboard from './pages/officer/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import ImpactDashboard from './pages/ImpactDashboard';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
};

const DashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  const routes = { citizen: '/citizen', collector: '/business', business: '/business', recycler: '/business', officer: '/officer', admin: '/admin' };
  return <Navigate to={routes[user.role] || '/citizen'} />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/impact" element={<ImpactDashboard />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
          
          {/* Citizen */}
          <Route path="/citizen" element={<ProtectedRoute roles={['citizen']}><CitizenDashboard /></ProtectedRoute>} />
          <Route path="/citizen/points" element={<ProtectedRoute roles={['citizen']}><CitizenPoints /></ProtectedRoute>} />
          <Route path="/citizen/reports" element={<ProtectedRoute roles={['citizen']}><CitizenReports /></ProtectedRoute>} />
          
          {/* Business/Collector/Recycler */}
          <Route path="/business" element={<ProtectedRoute roles={['business','collector','recycler']}><BusinessDashboard /></ProtectedRoute>} />
          <Route path="/business/listings" element={<ProtectedRoute roles={['business','collector']}><BusinessListings /></ProtectedRoute>} />
          <Route path="/business/audit" element={<ProtectedRoute roles={['business','recycler']}><BusinessAudit /></ProtectedRoute>} />
          
          {/* Officer */}
          <Route path="/officer" element={<ProtectedRoute roles={['officer','admin']}><OfficerDashboard /></ProtectedRoute>} />
          
          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin','officer']}><AdminDashboard /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
