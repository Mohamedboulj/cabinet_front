import { useTranslation } from "react-i18next";
import { Card } from "primereact/card";

export const ActivityEmptyState = () => {
    const { t } = useTranslation();
    return (
        <Card className="shadow-2">
            <div className="text-center text-500 py-5">
                <i className="pi pi-history text-4xl mb-3" style={{ display: 'block' }}></i>
                {t('activityHistory.emptyState')}
            </div>
        </Card>
    );
}