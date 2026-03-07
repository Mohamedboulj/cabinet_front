import React from "react";
import { useTranslation } from "react-i18next";
import type { FieldChange } from "@/features/activity/utils/activityHistory.utils";
import { entityTypeToI18nKey } from "@/features/activity/utils/activityHistory.utils";

interface Props {
    changes: FieldChange[];
    entityType: string;
}

export const ActivityFieldDiff: React.FC<Props> = ({ changes, entityType }) => {
    const { t } = useTranslation();
    return (
        <div className="ml-2 mt-2" style={{ display: 'grid', gridTemplateColumns: '300px auto auto 1fr', gap: '0.25rem 3rem', alignItems: 'center' }}>
            {changes.map((change, idx) => (
                <React.Fragment key={idx}>
                    <span>{t(`activityHistory.fieldLabels.${entityTypeToI18nKey(entityType)}.${change.field}`, change.field)}</span>
                    <div className="text-gray-300 text-sm w-max-5">{change.oldValue ?? '—'}</div>
                    <i className="pi pi-arrow-right text-400" style={{ fontSize: '0.7rem' }}></i>
                    <div className="font-medium text-sm w-auto">{change.newValue ?? '—'}</div>
                </React.Fragment>
            ))}
        </div>
    );
};