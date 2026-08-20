import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { ProgressSpinner } from 'primereact/progressspinner';
import MainLayout from '@/components/layout/MainLayout';

// Lazy-loaded feature components
const Login = lazy(() => import('@/features/auth'));
const Dashboard = lazy(() => import('@/features/dashboard'));
const Patients = lazy(() => import('@/features/patients/components/Patients'));
const PatientDetail = lazy(() => import('@/features/patients/components/PatientDetail'));
const PatientImport = lazy(() => import('@/features/patients/components/PatientImport'));
const Appointments = lazy(() => import('@/features/appointments/components/Appointments'));
const AppointmentDetail = lazy(() => import('@/features/appointments/components/AppointmentDetail'));
const Calendar = lazy(() => import('@/features/appointments/components/Calendar'));
const Consultations = lazy(() => import('@/features/consultations/components/Consultations'));
const ConsultationDetail = lazy(() => import('@/features/consultations/components/ConsultationDetail'));
const Invoices = lazy(() => import('@/features/invoices/components/Invoices'));
const InvoiceDetail = lazy(() => import('@/features/invoices/components/InvoiceDetail'));
const Prescriptions = lazy(() => import('@/features/prescriptions'));
const Users = lazy(() => import('@/features/users'));
const Settings = lazy(() => import('@/features/settings'));
const Pregnancies = lazy(() => import('@/features/pregnancy/components/Pregnancies'));
const PregnancyWizard = lazy(() => import('@/features/pregnancy/components/PregnancyWizard'));
const PregnancyDetail = lazy(() => import('@/features/pregnancy/components/PregnancyDetail'));
const NotFound = lazy(() => import('@/app/NotFound'));

const Spinner = () => (
    <div className="flex justify-content-center align-items-center h-screen">
        <ProgressSpinner />
    </div>
);

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string; anyRole?: string[] }> = ({
    children,
    requiredRole,
    anyRole
}) => {
    const { isAuthenticated, isLoading, hasRole } = useAuth();

    if (isLoading) return <Spinner />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (requiredRole && !hasRole(requiredRole)) return <Navigate to="/dashboard" replace />;
    if (anyRole && !anyRole.some(hasRole)) return <Navigate to="/dashboard" replace />;

    return <>{children}</>;
};

export function Router() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <Spinner />;

    return (
        <Suspense fallback={<Spinner />}>
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
                    <Route path="pregnancies" element={
                        <ProtectedRoute anyRole={['ROLE_MEDECIN', 'ROLE_ADMIN']}>
                            <Pregnancies />
                        </ProtectedRoute>
                    } />
                    <Route path="pregnancies/new" element={
                        <ProtectedRoute anyRole={['ROLE_MEDECIN', 'ROLE_ADMIN']}>
                            <PregnancyWizard />
                        </ProtectedRoute>
                    } />
                    <Route path="pregnancies/:id" element={
                        <ProtectedRoute anyRole={['ROLE_MEDECIN', 'ROLE_ADMIN']}>
                            <PregnancyDetail />
                        </ProtectedRoute>
                    } />
                    <Route path="users" element={
                        <ProtectedRoute requiredRole="ROLE_ADMIN">
                            <Users />
                        </ProtectedRoute>
                    } />
                    <Route path="settings" element={<Settings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
}
