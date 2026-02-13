import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthContext, AuthContextProvider } from './context/AuthContext.jsx';
import { UserProvider } from './context/UserContext.jsx';
import { BusinessContextProvider, BusinessContext } from './context/BusinessContext.jsx';
import { CampaignProvider } from './context/CampaignContext.jsx';
import { BrandProvider } from './context/BrandContext.jsx';
import { InvoiceProfileProvider } from './context/InvoiceProfileContext.jsx';
import { EventProvider } from './context/EventContext.jsx';
import Layout from './components/layout/Layout';
import Login from './pages/login/Login';
import PasswordReset from './pages/login/PasswordReset';
import Register from './pages/login/Register';
import Dashboard from './pages/dashboards/Dashboard';
import DashboardAdmin from './pages/dashboards/DashboardAdmin';
import QRCode from './pages/dashboards/QRCode';
import QuickText from './pages/quicktext/QuickText';
import EventList from './pages/events/EventList';
import EventPage from './pages/events/Event';
import EventReport from './pages/events/EventReport';
import CampaignList from './pages/campaigns/CampaignList';
import Campaign from './pages/campaigns/Campaign';
import BusinessList from './pages/businesses/BusinessList';
import Business from './pages/businesses/Business';
import BusinessSetup from './pages/businesses/BusinessSetup';
import UserList from './pages/users/UserList';
import User from './pages/users/User';
import AccountSettings from './pages/user/AccountSettings';
import Assets from './pages/Assets';

const ProtectedRoute = ({ children }) => {
  const { jwt } = useContext(AuthContext);
  return jwt ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  const { isGlobalAdmin } = useContext(AuthContext);
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/passwordreset" element={<PasswordReset />} />
        <Route path="/business-setup" element={
          <ProtectedRoute>
            <BusinessSetup />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={isGlobalAdmin ? <DashboardAdmin /> : <Dashboard />} />
          <Route path="qrcode" element={<QRCode />} />
          <Route path="quicktext" element={<QuickText />} />
          <Route path="events" element={<EventList />} />
          <Route path="events/view/:key" element={<EventPage />} />
          <Route path="events/:id/edit" element={<QuickText />} />
          <Route path="events/report/:key" element={<EventReport />} />
          <Route path="projects" element={<CampaignList />} />
          <Route path="projects/view/:key" element={<Campaign />} />
          <Route path="businesses" element={<BusinessList />} />
          <Route path="businesses/view/:key" element={<BusinessPageWithBrands />} />
          <Route path="users" element={<UserList />} />
          <Route path="users/view/:key" element={<User />} />
          <Route path="account" element={<AccountSettings />} />
          <Route path="assets" element={<Assets />} />
        </Route>
      </Routes>
    </Router>
  );
}

function BusinessPageWithBrands() {
  const { key } = useParams();
  return (
    <BrandProvider businessKey={key}>
      <InvoiceProfileProvider businessKey={key}>
        <Business />
      </InvoiceProfileProvider>
    </BrandProvider>
  );
}

function EventProviderWrapper({ children }) {
  const { selectedBusinessKey } = useContext(BusinessContext);
  return (
    <EventProvider selectedBusinessKey={selectedBusinessKey}>
      {children}
    </EventProvider>
  );
}

function App() {
  return (
    <AuthContextProvider>
      <UserProvider>
        <BusinessContextProvider>
          <CampaignProvider>
            <EventProviderWrapper>
              <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
              <AppRoutes />
            </EventProviderWrapper>
          </CampaignProvider>
        </BusinessContextProvider>
      </UserProvider>
    </AuthContextProvider>
  );
}

export default App;
