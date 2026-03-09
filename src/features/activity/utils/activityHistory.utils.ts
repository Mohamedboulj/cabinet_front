import type { AuditLog } from '@/types';

export interface FieldChange {
    field: string;
    oldValue: any;
    newValue: any;
}


export function entityTypeToI18nKey(entityType: string): string {
    const map: Record<string, string> = {
        'App\\Entity\\Patient': 'patient',
        'App\\Entity\\Appointment': 'appointment',
        'App\\Entity\\Consultation': 'consultation',
    };
    return map[entityType] ?? entityType.toLowerCase();
}
export function getChanges(oldValues: Record<string, any>, newValues: Record<string, any>): FieldChange[] {
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

export function formatDateHeader(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getTimeForLog(log: AuditLog): string {
    if (log.action === 'UPDATE' && log.newValues?.updatedAt) {
        const d = new Date(log.newValues.updatedAt);
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    const d = new Date(log.createdAt);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function groupLogsByDate(logs: AuditLog[]): Map<string, AuditLog[]> {
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