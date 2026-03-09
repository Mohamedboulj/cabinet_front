import React from 'react';
import { Tag } from 'primereact/tag';
import { useTranslation } from 'react-i18next';
import { getStatusSeverity, getStatusTranslationKey } from '@/features/appointments/utils/appointments.utils';

interface Props {
    status: string;
}

export const AppointmentStatusTag: React.FC<Props> = ({ status }) => {
    const { t } = useTranslation();
    const severity = getStatusSeverity(status);
    const labelKey = getStatusTranslationKey(status);
    const label = labelKey !== status ? t(labelKey) : status;

    return <Tag value={label} severity={severity} />;
};
