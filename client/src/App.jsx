import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

// Layouts & Protected Route
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import PublicContactPage from './pages/PublicContactPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import OverviewPage from './pages/OverviewPage.jsx';
import LeadsPage from './pages/LeadsPage.jsx';
import FollowUpsPage from './pages/FollowUpsPage.jsx';
import ConvertedClientsPage from './pages/ConvertedClientsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Landing & Inquiry Form */}
            <Route path="/" element={<PublicContactPage />} />
            <Route path="/contact" element={<PublicContactPage />} />

            {/* Admin Authentication */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Admin CRM Dashboard */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<OverviewPage />} />
                <Route path="/leads" element={<LeadsPage />} />
                <Route path="/follow-ups" element={<FollowUpsPage />} />
                <Route path="/converted" element={<ConvertedClientsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
