import { useTranslation } from 'react-i18next';

export function useActionStyle() {
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