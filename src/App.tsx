import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ProgressSpinner } from 'primereact/progressspinner';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import PatientImport from './pages/PatientImport';
import Appointments from './pages/Appointments';
import Calendar from './pages/Calendar';
import Consultations from './pages/Consultations';
import ConsultationDetail from './pages/ConsultationDetail';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import Prescriptions from './pages/Prescriptions';
import Users from './pages/Users';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({
  children,
  requiredRole
}) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-content-center align-items-center h-screen">
        <ProgressSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-content-center align-items-center h-screen">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/import" element={<PatientImport />} />
        <Route path="patients/:id" element={<PatientDetail />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="consultations" element={<Consultations />} />
        <Route path="consultations/:id" element={<ConsultationDetail />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="users" element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <Users />
          </ProtectedRoute>
        } />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
