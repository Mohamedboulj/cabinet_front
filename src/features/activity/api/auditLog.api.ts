import api from '@/lib/axios';
import type { AuditLog, ApiResponse } from '@/types';

export const auditLogService = {
    async getAuditLogs(entityType: string, entityId: number): Promise<ApiResponse<AuditLog[]>> {
        const response = await api.get(`/audit-logs/${entityType}/${entityId}`);
        return response.data;
    },
};
