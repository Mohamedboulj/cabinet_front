import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { dashboardService } from '@/features/dashboard/api/dashboard.api';
import { useAuth } from '@/app/providers/AuthProvider';
import type { DashboardStats } from '@/types';
import { Card } from 'primereact/card';
import DashboardSkeleton from '@/features/dashboard/components/skeletons/DashboardSkeleton';
import ListItemSkeleton from '@/components/skeletons/ListItemSkeleton';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { getCurrency } from '@/utils/currencyUtils';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { hasRole } = useAuth();
  const canViewPregnancies = hasRole('ROLE_MEDECIN') || hasRole('ROLE_ADMIN');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pregnancyStats, setPregnancyStats] = useState<{ ongoing: number; highRisk: number; dueThisMonth: number; criticalAlerts: number } | null>(null);

  useEffect(() => {
    loadStats();
    if (canViewPregnancies) {
      dashboardService.getPregnancyStats().then(setPregnancyStats).catch(() => setPregnancyStats(null));
    }
  }, []);

  const loadStats = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    subtitle?: string;
    icon: string;
    color: string;
    onClick?: () => void;
  }> = ({ title, value, subtitle, icon, color, onClick }) => (
    <Card className={`shadow-2 hover:shadow-4 transition-all transition-duration-300 ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <div className="flex justify-content-between align-items-start">
        <div>
          <p className="text-500 font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-900 m-0">{value}</h3>
          {subtitle && <p className="text-500 text-sm mt-1">{subtitle}</p>}
        </div>
        <div
          className="flex justify-content-center align-items-center border-circle"
          style={{ width: '3rem', height: '3rem', backgroundColor: color }}
        >
          <i className={`pi ${icon} text-white text-xl`}></i>
        </div>
      </div>
    </Card>
  );

  return (
    <div>
      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="text-3xl font-bold m-0">{t('dashboard.title')}</h1>
        <Button
          icon="pi pi-refresh"
          className="p-button-text"
          onClick={loadStats}
          tooltip={t('common.refresh')}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid">
        {/* Patients */}
        <div className="col-12 md:col-6 lg:col-3">
          <StatCard
            title={t('dashboard.totalPatients')}
            value={stats?.patients.total || 0}
            subtitle={t('dashboard.newThisMonth', { count: stats?.patients.newThisMonth || 0 })}
            icon="pi-users"
            color="#3B82F6"
            onClick={() => navigate('/patients')}
          />
        </div>

        {/* Appointments Today */}
        <div className="col-12 md:col-6 lg:col-3">
          <StatCard
            title={t('dashboard.appointmentsToday')}
            value={stats?.appointments.today || 0}
            subtitle={t('dashboard.completedThisMonth', { count: stats?.appointments.thisMonth.completed || 0 })}
            icon="pi-calendar"
            color="#10B981"
            onClick={() => navigate('/appointments')}
          />
        </div>

        {/* Consultations Today */}
        <div className="col-12 md:col-6 lg:col-3">
          <StatCard
            title={t('dashboard.consultationsTitle')}
            value={stats?.consultations.today || 0}
            subtitle={t('dashboard.unpaidCount', { count: stats?.consultations.thisMonth.unpaid || 0 })}
            icon="pi-heart"
            color="#F59E0B"
            onClick={() => navigate('/consultations')}
          />
        </div>

        {/* Revenue */}
        <div className="col-12 md:col-6 lg:col-3">
          <StatCard
            title={t('dashboard.monthlyRevenue')}
            value={`${(stats?.invoices.thisMonth.paidAmount || 0).toLocaleString()} ${getCurrency()}`}
            subtitle={t('dashboard.unpaidInvoices', { count: stats?.invoices.unpaidCount || 0 })}
            icon="pi-money-bill"
            color="#8B5CF6"
            onClick={() => navigate('/invoices')}
          />
        </div>

        {/* Pregnancies (ongoing) */}
        {canViewPregnancies && pregnancyStats && (
          <div className="col-12 md:col-6 lg:col-3">
            <StatCard
              title={t('pregnancy.filters.active')}
              value={pregnancyStats.ongoing}
              subtitle={`${pregnancyStats.highRisk} ${t('pregnancy.enums.riskLevel.HIGH').toLowerCase()} · ${pregnancyStats.criticalAlerts} ${t('pregnancy.alerts.title').toLowerCase()}`}
              icon="pi-heart-fill"
              color="#EC4899"
              onClick={() => navigate('/pregnancies')}
            />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-5">
        <h2 className="text-xl font-semibold mb-3">{t('dashboard.quickActions')}</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            label={t('dashboard.newPatient')}
            icon="pi pi-user-plus"
            className="p-button-success"
            onClick={() => navigate('/patients', { state: { openNew: true } })}
          />
          <Button
            label={t('dashboard.newAppointment')}
            icon="pi pi-calendar-plus"
            className="p-button-info"
            onClick={() => navigate('/calendar', { state: { openNew: true } })}
          />
          <Button
            label={t('dashboard.newConsultation')}
            icon="pi pi-file-edit"
            className="p-button-warning"
            onClick={() => navigate('/consultations', { state: { openNew: true } })}
          />
          <Button
            label={t('dashboard.newInvoice')}
            icon="pi pi-file-o"
            className="p-button-help"
            onClick={() => navigate('/invoices', { state: { openNew: true } })}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid mt-5">
        <div className="col-12 lg:col-6">
          <Card title={t('dashboard.upcomingAppointments')} className="shadow-2 h-full">
            <UpcomingAppointments />
          </Card>
        </div>
        <div className="col-12 lg:col-6">
          <Card title={t('dashboard.unpaidInvoicesTitle')} className="shadow-2 h-full">
            <UnpaidInvoices />
          </Card>
        </div>
      </div>
    </div>
  );
};

const UpcomingAppointments: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await dashboardService.getUpcomingAppointments();
      setAppointments(data.data.slice(0, 5));
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ListItemSkeleton count={3} />;
  }

  if (appointments.length === 0) {
    return <p className="text-500 text-center py-3">{t('dashboard.noUpcoming')}</p>;
  }

  return (
    <div className="flex flex-column gap-2">
      {appointments.map((apt) => (
        <div
          key={apt.id}
          className="flex justify-content-between align-items-center p-2 surface-hover border-round cursor-pointer hover:surface-200 transition-colors"
          onClick={() => navigate(`/appointments`)}
        >
          <div>
            <div className="font-medium">{apt.patient.fullName}</div>
            <div className="text-sm text-500">
              {new Date(apt.startAt).toLocaleString('fr-FR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
          <div className="flex align-items-center gap-2">
            <span className={`px-2 py-1 text-xs border-round ${apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
              {apt.status === 'CONFIRMED' ? t('dashboard.confirmed') : t('dashboard.scheduled')}
            </span>
            <i className="pi pi-chevron-right text-400"></i>
          </div>
        </div>
      ))}
    </div>
  );
};

const UnpaidInvoices: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await dashboardService.getUnpaidInvoices();
      setInvoices(data.data.slice(0, 5));
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ListItemSkeleton count={3} />;
  }

  if (invoices.length === 0) {
    return <p className="text-500 text-center py-3">{t('dashboard.noUnpaid')}</p>;
  }

  return (
    <div className="flex flex-column gap-2">
      {invoices.map((inv) => (
        <div
          key={inv.id}
          className="flex justify-content-between align-items-center p-2 surface-hover border-round cursor-pointer hover:surface-200 transition-colors"
          onClick={() => navigate(`/invoices/${inv.id}`)}
        >
          <div>
            <div className="font-medium">{inv.patient.lastName + ' ' + inv.patient.firstName}</div>
            <div className="text-sm text-500">{inv.invoiceNumber}</div>
          </div>
          <div className="flex align-items-center gap-2">
            <span className="font-semibold text-red-500">
              {parseFloat(inv.totalAmount).toLocaleString()} {getCurrency()}
            </span>
            <i className="pi pi-chevron-right text-400"></i>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
