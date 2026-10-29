import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { AppLogo } from './components/common/AppLogo';
import { DashboardPage } from './pages/DashboardPage';
import { RentalsPage } from './pages/RentalsPage';
import { RentalDetailPage } from './pages/RentalDetailPage';
import { InspectionPage } from './pages/InspectionPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { DisputesPage } from './pages/DisputesPage';
import { AuditReportPage } from './pages/AuditReportPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-container">
      {isAuthenticated && <Navbar />}
      <main className="main-content">
        {children}
      </main>
      <footer style={{
        textAlign: 'center',
        padding: '2rem 1.5rem',
        borderTop: '1px solid var(--border-medium)',
        fontSize: '0.82rem',
        color: 'var(--text-tertiary)',
        background: '#ffffff',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AppLogo size={20} />
            <span><strong>GharProof</strong> &copy; 2026. Cryptographically Verified Rental Inspections.</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>SHA-256 Tamper-Proof</span>
            <span>Dual Party Sign-Off</span>
            <span>Verifiable PDF Audits</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/rentals" element={<ProtectedRoute><RentalsPage /></ProtectedRoute>} />
              <Route path="/rentals/:rentalId" element={<ProtectedRoute><RentalDetailPage /></ProtectedRoute>} />
              <Route path="/rentals/:rentalId/inspections/:type" element={<ProtectedRoute><InspectionPage /></ProtectedRoute>} />
              <Route path="/rentals/:rentalId/comparison" element={<ProtectedRoute><ComparisonPage /></ProtectedRoute>} />
              <Route path="/rentals/:rentalId/disputes" element={<ProtectedRoute><DisputesPage /></ProtectedRoute>} />
              <Route path="/disputes" element={<ProtectedRoute><DisputesPage /></ProtectedRoute>} />
              <Route path="/rentals/:rentalId/report" element={<ProtectedRoute><AuditReportPage /></ProtectedRoute>} />
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AppLayout>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
