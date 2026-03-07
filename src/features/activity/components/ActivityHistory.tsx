import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AuditLog } from '@/types';
import { Card } from 'primereact/card';
import ActivityHistorySkeleton from '@/features/activity/components/skeletons/ActivityHistorySkeleton';

interface ActivityHistoryProps {
    logs: AuditLog[];
    loading: boolean;
}

interface FieldChange {
    field: string;
    oldValue: any;
    newValue: any;
}

/**
 * Map entityType (from backend) to the i18n key segment.
 */
function entityTypeToI18nKey(entityType: string): string {
    const map: Record<string, string> = {
        'App\\Entity\\Patient': 'patient',
        'App\\Entity\\Appointment': 'appointment',
        'App\\Entity\\Consultation': 'consultation',
    };
    return map[entityType] ?? entityType.toLowerCase();
}

/**
 * Compare oldValues and newValues from an audit log entry.
 * Only scalar fields are compared; arrays and objects are skipped.
 */
function getChanges(oldValues: Record<string, any>, newValues: Record<string, any>): FieldChange[] {
    const changes: FieldChange[] = [];
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

    for (const key of allKeys) {
        const oldVal = oldValues[key];
        const newVal = newValues[key];

        // Skip arrays and nested objects
        if (
            Array.isArray(oldVal) || Array.isArray(newVal) ||
            (oldVal !== null && typeof oldVal === 'object') ||
            (newVal !== null && typeof newVal === 'object')
        ) {
            continue;
        }

        if (oldVal !== newVal) {
            changes.push({ field: key, oldValue: oldVal, newValue: newVal });
        }
    }

    return changes;
}

/**
 * Format a date string into "Mar 3, 2026" style.
 */
function formatDateHeader(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Extract the time portion (HH:mm) from either createdAt or the updatedAt in newValues.
 */
function getTimeForLog(log: AuditLog): string {
    if (log.action === 'UPDATE' && log.newValues?.updatedAt) {
        const d = new Date(log.newValues.updatedAt);
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    const d = new Date(log.createdAt);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Get the display label, icon, and background class for an action.
 */
function useActionStyle() {
    const { t } = useTranslation();
    return (action: string): { label: string; icon: string; bgClass: string } => {
        switch (action) {
            case 'CREATE':
                return { label: t('activityHistory.action.create'), icon: 'pi pi-plus', bgClass: 'bg-green-50 text-green-700' };
            case 'IMPORT':
                return { label: t('activityHistory.action.import'), icon: 'pi pi-plus', bgClass: 'bg-green-50 text-green-700' };
            case 'UPDATE':
                return { label: t('activityHistory.action.update'), icon: 'pi pi-pencil', bgClass: 'bg-yellow-50 text-yellow-700' };
            case 'DELETE':
                return { label: t('activityHistory.action.delete'), icon: 'pi pi-trash', bgClass: 'bg-red-50 text-red-700' };
            default:
                return { label: action, icon: 'pi pi-info-circle', bgClass: 'surface-100 text-700' };
        }
    };
}

/**
 * Group logs by date string (day granularity).
 */
function groupLogsByDate(logs: AuditLog[]): Map<string, AuditLog[]> {
    const groups = new Map<string, AuditLog[]>();
    for (const log of logs) {
        const dateKey = new Date(log.createdAt).toDateString();
        if (!groups.has(dateKey)) {
            groups.set(dateKey, []);
        }
        groups.get(dateKey)!.push(log);
    }
    return groups;
}

const ActivityHistory: React.FC<ActivityHistoryProps> = ({ logs, loading }) => {
    const { t } = useTranslation();
    const getActionStyle = useActionStyle();

    if (loading) {
        return <ActivityHistorySkeleton />;
    }

    if (logs.length === 0) {
        return (
            <Card className="shadow-2">
                <div className="text-center text-500 py-5">
                    <i className="pi pi-history text-4xl mb-3" style={{ display: 'block' }}></i>
                    {t('activityHistory.emptyState')}
                </div>
            </Card>
        );
    }

    // Sort descending by createdAt (new to old)
    const sorted = [...logs].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const grouped = groupLogsByDate(sorted);

    return (
        <Card className="shadow-2">
            {Array.from(grouped.entries()).map(([dateKey, dateLogs]) => (
                <div key={dateKey} className="mb-4">
                    {/* Date header with line */}
                    <div className="flex align-items-center gap-3 mb-3">
                        <span className="font-semibold text-800 white-space-nowrap">
                            {formatDateHeader(dateLogs[0].createdAt)}
                        </span>
                        <hr className="flex-1 border-top-1 surface-border m-0" />
                    </div>

                    {/* Log entries for this date */}
                    {dateLogs.map((log) => {
                        const style = getActionStyle(log.action);
                        const changes = log.action === 'UPDATE' ? getChanges(log.oldValues, log.newValues) : [];

                        return (
                            <div key={log.id} className="ml-3 mb-3 pb-3  surface-border">
                                {/* Action chip + performer */}
                                <div className="flex align-items-center gap-2 mb-2">
                                    <span
                                        className={`inline-flex align-items-center gap-1 px-2 py-1 border-round text-sm font-medium ${style.bgClass}`}
                                    >
                                        <i className={style.icon} style={{ fontSize: '0.8rem' }}></i>
                                        {style.label}
                                    </span>
                                    <span className="text-600 text-sm">
                                        {t('activityHistory.performer')} <strong>{log.user}</strong> {t('activityHistory.at')} {getTimeForLog(log)}
                                    </span>
                                </div>

                                {/* Field diffs for UPDATE */}
                                {log.action === 'UPDATE' && changes.length > 0 && (
                                    <div className="ml-2 mt-2" style={{ display: 'grid', gridTemplateColumns: '300px auto auto 1fr', gap: '0.25rem 3rem', alignItems: 'center' }}>
                                        {changes.map((change, idx) => (
                                            <React.Fragment key={idx}>
                                                <span className="font-medium text-700 text-sm">{t(`activityHistory.fieldLabels.${entityTypeToI18nKey(log.entityType)}.${change.field}`, change.field)}</span>
                                                <div className="text-gray-300 text-sm w-max-5">{change.oldValue ?? '—'}</div>
                                                <i className="pi pi-arrow-right text-400" style={{ fontSize: '0.7rem' }}></i>
                                                <div className="font-medium text-sm w-auto">{change.newValue ?? '—'}</div>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </Card>
    );
};

export default ActivityHistory;
