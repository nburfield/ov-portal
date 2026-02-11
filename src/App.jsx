import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { BusinessProvider } from './contexts/BusinessContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { ToastContainer } from 'react-toastify'
import PrivateRoute from './components/layout/PrivateRoute.jsx'
import RoleRoute from './components/layout/RoleRoute.jsx'
import PublicRoute from './components/layout/PublicRoute.jsx'
import AdminRoute from './components/layout/AdminRoute.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import NotFound from './components/layout/NotFound.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'
import DashboardPage from './pages/dashboard/DashboardPage.jsx'
import BusinessPage from './pages/business/BusinessPage.jsx'
import UserListPage from './pages/users/UserListPage.jsx'
import UserDetailPage from './pages/users/UserDetailPage.jsx'
import RoleListPage from './pages/roles/RoleListPage.jsx'
import ServiceListPage from './pages/services/ServiceListPage.jsx'
import ServiceDetailPage from './pages/services/ServiceDetailPage.jsx'
import CertificationListPage from './pages/certifications/CertificationListPage.jsx'
import CustomerListPage from './pages/customers/CustomerListPage.jsx'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <BusinessProvider>
            <ThemeProvider>
              <ToastContainer position="top-right" autoClose={5000} stacked />
              <Routes>
                {/* Public routes */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <RegisterPage />
                    </PublicRoute>
                  }
                />

                {/* Authenticated routes */}
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <AppLayout />
                    </PrivateRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route
                    path="dashboard"
                    element={
                      <RoleRoute minRole="manager">
                        <DashboardPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="business"
                    element={
                      <RoleRoute minRole="owner">
                        <BusinessPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="users"
                    element={
                      <RoleRoute minRole="manager">
                        <UserListPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="users/:key"
                    element={
                      <RoleRoute minRole="manager">
                        <UserDetailPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="roles"
                    element={
                      <RoleRoute minRole="owner">
                        <RoleListPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="services"
                    element={
                      <RoleRoute minRole="manager">
                        <ServiceListPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="services/:key"
                    element={
                      <RoleRoute minRole="manager">
                        <ServiceDetailPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="certifications"
                    element={
                      <RoleRoute minRole="manager">
                        <CertificationListPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="customers"
                    element={
                      <RoleRoute minRole="manager">
                        <CustomerListPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="customers/:key"
                    element={
                      <RoleRoute minRole="manager">
                        <div>Customer Detail</div>
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="locations"
                    element={
                      <RoleRoute minRole="manager">
                        <div>Locations</div>
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="locations/:key"
                    element={
                      <RoleRoute minRole="manager">
                        <div>Location Detail</div>
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="fleet"
                    element={
                      <RoleRoute minRole="manager">
                        <div>Fleet</div>
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="fleet/:key"
                    element={
                      <RoleRoute minRole="manager">
                        <div>Fleet Detail</div>
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="workorders"
                    element={
                      <RoleRoute minRole="worker">
                        <div>Work Orders</div>
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="workorders/:key"
                    element={
                      <RoleRoute minRole="worker">
                        <div>Work Order Detail</div>
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="worktasks"
                    element={
                      <RoleRoute minRole="worker">
                        <div>Work Tasks</div>
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="worktasks/:key"
                    element={
                      <RoleRoute minRole="worker">
                        <div>Work Task Detail</div>
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="invoices"
                    element={
                      <RoleRoute minRole="manager">
                        <div>Invoices</div>
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="invoices/:key"
                    element={
                      <RoleRoute minRole="manager">
                        <div>Invoice Detail</div>
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="subcontractors"
                    element={
                      <RoleRoute minRole="owner">
                        <div>Subcontractors</div>
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="audit"
                    element={
                      <RoleRoute minRole="owner">
                        <div>Audit</div>
                      </RoleRoute>
                    }
                  />
                  <Route path="profile" element={<div>Profile</div>} />
                  <Route path="settings" element={<div>Settings</div>} />

                  {/* Super admin routes */}
                  <Route
                    path="admin/businesses"
                    element={
                      <AdminRoute>
                        <div>Admin Businesses</div>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="admin/businesses/:key"
                    element={
                      <AdminRoute>
                        <div>Admin Business Detail</div>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="admin/users"
                    element={
                      <AdminRoute>
                        <div>Admin Users</div>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="admin/users/:key"
                    element={
                      <AdminRoute>
                        <div>Admin User Detail</div>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="admin/health"
                    element={
                      <AdminRoute>
                        <div>Admin Health</div>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="admin/data"
                    element={
                      <AdminRoute>
                        <div>Admin Data</div>
                      </AdminRoute>
                    }
                  />
                </Route>
              </Routes>
            </ThemeProvider>
          </BusinessProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
