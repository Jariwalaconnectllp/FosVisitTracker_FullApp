import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';
import PrivateRoute from './components/Layout/PrivateRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LogVisit from './pages/LogVisit';
import MyVisits from './pages/MyVisits';
import Targets from './pages/Targets';
import Dealers from './pages/Dealers';
import DealerDetail from './pages/DealerDetail';
import BMDashboard from './pages/BMDashboard';
import SetTargets from './pages/SetTargets';
import ManageSalesmen from './pages/ManageSalesmen';
import ManageDealers from './pages/ManageDealers';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import AdminPanel from './pages/AdminPanel';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-6 max-w-7xl mx-auto">
          <Routes>
            {/* Salesman Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute allowedRoles={['SALESMAN']}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/log-visit"
              element={
                <PrivateRoute allowedRoles={['SALESMAN', 'BM']}>
                  <LogVisit />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-visits"
              element={
                <PrivateRoute allowedRoles={['SALESMAN']}>
                  <MyVisits />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-targets"
              element={
                <PrivateRoute allowedRoles={['SALESMAN']}>
                  <Targets />
                </PrivateRoute>
              }
            />

            {/* BM Routes */}
            <Route
              path="/bm-dashboard"
              element={
                <PrivateRoute allowedRoles={['BM']}>
                  <BMDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/bm-log-visit"
              element={
                <PrivateRoute allowedRoles={['BM']}>
                  <LogVisit />
                </PrivateRoute>
              }
            />
            <Route
              path="/team-performance"
              element={
                <PrivateRoute allowedRoles={['BM']}>
                  <BMDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/set-targets"
              element={
                <PrivateRoute allowedRoles={['BM', 'ADMIN']}>
                  <SetTargets />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-salesmen"
              element={
                <PrivateRoute allowedRoles={['BM', 'ADMIN']}>
                  <ManageSalesmen />
                </PrivateRoute>
              }
            />

            {/* Shared Routes */}
            <Route
              path="/manage-dealers"
              element={
                <PrivateRoute allowedRoles={['BM', 'ADMIN']}>
                  <ManageDealers />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateRoute allowedRoles={['SALESMAN', 'BM', 'ADMIN']}>
                  <Reports />
                </PrivateRoute>
              }
            />
            <Route
              path="/dealers"
              element={
                <PrivateRoute allowedRoles={['SALESMAN', 'BM', 'ADMIN']}>
                  <Dealers />
                </PrivateRoute>
              }
            />
            <Route
              path="/dealers/:id"
              element={
                <PrivateRoute allowedRoles={['SALESMAN', 'BM', 'ADMIN']}>
                  <DealerDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <PrivateRoute allowedRoles={['SALESMAN', 'BM', 'ADMIN']}>
                  <Notifications />
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <AdminPanel />
                </PrivateRoute>
              }
            />

            {/* Default Redirects */}
            <Route
              path="/"
              element={<Navigate to={user?.role === 'ADMIN' ? '/admin' : user?.role === 'BM' ? '/bm-dashboard' : '/dashboard'} replace />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}

export default App;