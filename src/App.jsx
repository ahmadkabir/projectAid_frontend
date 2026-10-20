import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop';

// Layouts
import AdminLayout from './app/admin/layout/AdminLayout';
import PageLayout from './components/layout/PageLayout';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import VerifyEmail from './pages/Auth/VerifyEmail';

// Admin Pages
import AdminDashboard from './app/admin/dashboard/AdminDashboard';
import AdminProjects from './pages/Dashboard/AdminProjects';
import AdminProjectView from './pages/Dashboard/AdminProjectView';
import AdminProjectAttachments from './pages/Dashboard/AdminProjectAttachments';
import AdminDocumentPreview from './pages/Dashboard/AdminDocumentPreview';
import AdminOrders from './pages/Dashboard/AdminOrders';
import AdminUsers from './pages/Dashboard/AdminUsers';
import AdminSupport from './pages/Dashboard/AdminSupport';

// User Pages
import Home from './pages/Home/Home';
import Projects from './pages/Projects/Projects';
import ProjectDetails from './pages/ProjectDetails/ProjectDetails';
import DocumentPreview from './pages/ProjectDetails/DocumentPreview';
import Dashboard from './pages/Dashboard/Dashboard';
import MyOrders from './pages/Dashboard/MyOrders';
import SupportRequests from './pages/Dashboard/SupportRequests';
import Profile from './pages/Dashboard/Profile';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  try {
    const admin = isAdmin();
    return admin ? children : <Navigate to="/" />;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return <Navigate to="/" />;
  }
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      {/* Public Landing & Projects */}
      <Route
        path="/"
        element={
          <PageLayout>
            <Home />
          </PageLayout>
        }
      />
      <Route
        path="/projects"
        element={
          <PageLayout>
            <Projects />
          </PageLayout>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <PrivateRoute>
            <PageLayout>
              <ProjectDetails />
            </PageLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/projects/:id/preview"
        element={
          <PageLayout>
            <DocumentPreview />
          </PageLayout>
        }
      />

      {/* Admin Routes - Wrapped in AdminLayout */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/projects"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminProjects />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/projects/:id/view"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminProjectView />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/projects/:id/attachments"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminProjectAttachments />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/projects/:id/doc-preview"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminDocumentPreview />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminOrders />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/support"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminSupport />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </AdminRoute>
        }
      />

      {/* User Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <PageLayout>
              <Dashboard />
            </PageLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/orders"
        element={
          <PrivateRoute>
            <PageLayout>
              <MyOrders />
            </PageLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/support"
        element={
          <PrivateRoute>
            <PageLayout>
              <SupportRequests />
            </PageLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/profile"
        element={
          <PrivateRoute>
            <PageLayout>
              <Profile />
            </PageLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
