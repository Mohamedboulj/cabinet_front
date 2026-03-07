import type { AuditLog } from '@/types';
import { useTranslation } from 'react-i18next';
import { useActionStyle } from '@/features/activity/hooks/useActionStyle';
import { getChanges, getTimeForLog } from '@/features/activity/utils/activityHistory.utils';
import { ActivityFieldDiff } from '@/features/activity/components/ActivityFieldDiff';

interface Props {
    log: AuditLog;
}

export const ActivityLogEntry: React.FC<Props> = ({ log }) => {
    const { t } = useTranslation();
    const getActionStyle = useActionStyle();
    const style = getActionStyle(log.action);
    const changes = log.action === 'UPDATE' ? getChanges(log.oldValues, log.newValues) : [];

    return (
        <div className="ml-3 mb-3 pb-3 surface-border">
            <div className="flex align-items-center gap-2 mb-2">
                <span className={`inline-flex ... ${style.bgClass}`}>
                    <i className={style.icon} />
                    {style.label}
                </span>
                <span className="text-600 text-sm">
                    {t('activityHistory.performer')} <strong>{log.user}</strong> {t('activityHistory.at')} {getTimeForLog(log)}
                </span>
            </div>
            {changes.length > 0 && <ActivityFieldDiff changes={changes} entityType={log.entityType} />}
        </div>
    );
};