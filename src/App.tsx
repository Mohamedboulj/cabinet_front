import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ProgressSpinner } from 'primereact/progressspinner';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import Login from '@/features/auth/components/Login';
import Dashboard from '@/features/dashboard/components/Dashboard';
import Patients from '@/features/patients/components/Patients';
import PatientDetail from '@/features/patients/components/PatientDetail';
import PatientImport from '@/features/patients/components/PatientImport';
import { Appointments } from '@/features/appointments';
import AppointmentDetail from '@/features/appointments/components/AppointmentDetail';
import Calendar from '@/features/appointments/components/Calendar';
import Consultations from '@/features/consultations/components/Consultations';
import ConsultationDetail from '@/features/consultations/components/ConsultationDetail';
import Invoices from '@/features/invoices/components/Invoices';
import InvoiceDetail from '@/features/invoices/components/InvoiceDetail';
import Prescriptions from '@/features/prescriptions/components/Prescriptions';
import Users from '@/features/users/components/Users';
import Settings from '@/features/settings/components/Settings';
import NotFound from '@/app/NotFound';

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
        <Route path="appointments/:id" element={<AppointmentDetail />} />
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
