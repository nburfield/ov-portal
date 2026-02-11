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
import AdminBusinessListPage from './pages/admin/AdminBusinessListPage.jsx'
import AdminBusinessDetailPage from './pages/admin/AdminBusinessDetailPage.jsx'
import AdminUserListPage from './pages/admin/AdminUserListPage.jsx'
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage.jsx'
import AdminHealthPage from './pages/admin/AdminHealthPage.jsx'
import RoleListPage from './pages/roles/RoleListPage.jsx'
import ServiceListPage from './pages/services/ServiceListPage.jsx'
import ServiceDetailPage from './pages/services/ServiceDetailPage.jsx'
import CertificationListPage from './pages/certifications/CertificationListPage.jsx'
import CustomerListPage from './pages/customers/CustomerListPage.jsx'
import LocationListPage from './pages/locations/LocationListPage.jsx'
import LocationDetailPage from './pages/locations/LocationDetailPage.jsx'
import FleetDetailPage from './pages/fleet/FleetDetailPage.jsx'
import WorkOrderListPage from './pages/workorders/WorkOrderListPage.jsx'
import WorkOrderForm from './pages/workorders/WorkOrderForm.jsx'
import WorkOrderDetailPage from './pages/workorders/WorkOrderDetailPage.jsx'
import WorkTaskListPage from './pages/worktasks/WorkTaskListPage.jsx'
import WorkTaskForm from './pages/worktasks/WorkTaskForm.jsx'
import WorkTaskDetailPage from './pages/worktasks/WorkTaskDetailPage.jsx'
import InvoiceListPage from './pages/invoices/InvoiceListPage.jsx'
import InvoiceDetailPage from './pages/invoices/InvoiceDetailPage.jsx'
import SubcontractorListPage from './pages/subcontractors/SubcontractorListPage.jsx'
import AuditLogPage from './pages/audit/AuditLogPage.jsx'
import ProfilePage from './pages/profile/ProfilePage.jsx'
import SettingsPage from './pages/settings/SettingsPage.jsx'

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
                        <LocationListPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="locations/:key"
                    element={
                      <RoleRoute minRole="manager">
                        <LocationDetailPage />
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
                        <FleetDetailPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="workorders"
                    element={
                      <RoleRoute minRole="worker">
                        <WorkOrderListPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="workorders/create"
                    element={
                      <RoleRoute minRole="worker">
                        <WorkOrderForm />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="workorders/:key/edit"
                    element={
                      <RoleRoute minRole="worker">
                        <WorkOrderForm />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="workorders/:key"
                    element={
                      <RoleRoute minRole="worker">
                        <WorkOrderDetailPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="worktasks"
                    element={
                      <RoleRoute minRole="worker">
                        <WorkTaskListPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="worktasks/create"
                    element={
                      <RoleRoute minRole="manager">
                        <WorkTaskForm />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="worktasks/:key"
                    element={
                      <RoleRoute minRole="worker">
                        <WorkTaskDetailPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="invoices"
                    element={
                      <RoleRoute minRole="customer">
                        <InvoiceListPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="invoices/:key"
                    element={
                      <RoleRoute minRole="customer">
                        <InvoiceDetailPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="subcontractors"
                    element={
                      <RoleRoute minRole="owner">
                        <SubcontractorListPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="subcontractors/:business_key"
                    element={
                      <RoleRoute minRole="owner">
                        <div>Subcontractor Detail</div>
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="audit"
                    element={
                      <RoleRoute minRole="owner">
                        <AuditLogPage />
                      </RoleRoute>
                    }
                  />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="settings" element={<SettingsPage />} />

                  {/* Super admin routes */}
                  <Route
                    path="admin/businesses"
                    element={
                      <AdminRoute>
                        <AdminBusinessListPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="admin/businesses/:key"
                    element={
                      <AdminRoute>
                        <AdminBusinessDetailPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="admin/users"
                    element={
                      <AdminRoute>
                        <AdminUserListPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="admin/users/:key"
                    element={
                      <AdminRoute>
                        <AdminUserDetailPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="admin/health"
                    element={
                      <AdminRoute>
                        <AdminHealthPage />
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
