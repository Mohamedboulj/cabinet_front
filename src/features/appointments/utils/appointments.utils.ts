export const formatAppointmentDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const getStatusSeverity = (status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' => {
    const severityMap: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'secondary'> = {
        'SCHEDULED': 'info',
        'CONFIRMED': 'success',
        'IN_PROGRESS': 'warning',
        'COMPLETED': 'success',
        'CANCELLED': 'danger',
        'NO_SHOW': 'secondary',
    };
    return severityMap[status] || 'info';
};

export const getStatusTranslationKey = (status: string): string => {
    const keyMap: Record<string, string> = {
        'SCHEDULED': 'status.scheduled',
        'CONFIRMED': 'status.confirmed',
        'IN_PROGRESS': 'status.inProgress',
        'COMPLETED': 'status.completed',
        'CANCELLED': 'status.cancelled',
        'NO_SHOW': 'status.noShow',
    };
    return keyMap[status] || status;
};
