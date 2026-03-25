import type { AuditLog } from '@/types';
import { Card } from 'primereact/card';
import ActivityHistorySkeleton from '@/features/activity/components/skeletons/ActivityHistorySkeleton';
import { ActivityEmptyState } from '@/features/activity/components/ActivityEmptyState';
import { ActivityLogEntry } from '@/features/activity/components/ActivityLogEntry';
import { groupLogsByDate, formatDateHeader } from '@/features/activity/utils/activityHistory.utils';

interface ActivityHistoryProps {
    logs: AuditLog[];
    loading: boolean;
}

export default function ActivityHistory({ logs, loading }: ActivityHistoryProps) {

    if (loading) return <ActivityHistorySkeleton />;

    if (logs.length === 0) return <ActivityEmptyState />;  // could extract too

    const sorted = [...logs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const grouped = groupLogsByDate(sorted);

    return (
        <Card className="shadow-2">
            {Array.from(grouped.entries()).map(([dateKey, dateLogs]) => (
                <div key={dateKey} className="mb-4">
                    <div className="flex align-items-center gap-3 mb-3">
                        <span className="font-semibold text-800">{formatDateHeader(dateLogs[0].createdAt)}</span>
                        <hr className="flex-1 border-top-1 surface-border m-0" />
                    </div>
                    {dateLogs.map(log => <ActivityLogEntry key={log.id} log={log} />)}
                </div>
            ))}
        </Card>
    );
};;
