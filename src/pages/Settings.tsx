import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { getApiErrorMessage } from '../utils/errorUtils';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { useTranslation } from 'react-i18next';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const toast = useRef<Toast>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: t('settings.security.mismatch'),
      });
      return;
    }

    setChangingPassword(true);
    try {
      await userService.resetPassword(
        user!.id,
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      toast.current?.show({
        severity: 'success',
        summary: t('common.success'),
        detail: t('settings.security.success'),
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: getApiErrorMessage(error),
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div>
      <Toast ref={toast} />

      <div className="mb-4">
        <h1 className="text-3xl font-bold m-0">{t('settings.title')}</h1>
      </div>

      <TabView>
        <TabPanel header={t('settings.tabs.profile')} leftIcon="pi pi-user mr-2">
          <Card className="shadow-2 max-w-2xl">
            <div className="flex flex-column gap-3">
              <div className="field">
                <label className="block font-medium mb-2">{t('settings.profile.lastName')}</label>
                <InputText value={user?.lastName || ''} className="w-full" disabled />
              </div>
              <div className="field">
                <label className="block font-medium mb-2">{t('settings.profile.firstName')}</label>
                <InputText value={user?.firstName || ''} className="w-full" disabled />
              </div>
              <div className="field">
                <label className="block font-medium mb-2">{t('settings.profile.email')}</label>
                <InputText value={user?.email || ''} className="w-full" disabled />
              </div>
              <div className="field">
                <label className="block font-medium mb-2">{t('settings.profile.phone')}</label>
                <InputText value={user?.phone || ''} className="w-full" disabled />
              </div>
              <div className="field">
                <label className="block font-medium mb-2">{t('settings.profile.specialty')}</label>
                <InputText value={user?.specialty || ''} className="w-full" disabled />
              </div>
            </div>
          </Card>
        </TabPanel>

        <TabPanel header={t('settings.tabs.security')} leftIcon="pi pi-lock mr-2">
          <Card className="shadow-2 max-w-2xl" title={t('settings.security.changePassword')}>
            <div className="flex flex-column gap-3">
              <div className="field">
                <label className="block font-medium mb-2">{t('settings.security.currentPassword')}</label>
                <Password
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full"
                  inputClassName="w-full"
                  toggleMask
                  feedback={false}
                />
              </div>
              <div className="field">
                <label className="block font-medium mb-2">{t('settings.security.newPassword')}</label>
                <Password
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full"
                  inputClassName="w-full"
                  toggleMask
                />
              </div>
              <div className="field">
                <label className="block font-medium mb-2">{t('settings.security.confirmPassword')}</label>
                <Password
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full"
                  inputClassName="w-full"
                  toggleMask
                  feedback={false}
                />
              </div>
              <Button
                label={t('settings.security.submit')}
                icon="pi pi-check"
                loading={changingPassword}
                onClick={handlePasswordChange}
                className="mt-2"
              />
            </div>
          </Card>
        </TabPanel>

        <TabPanel header={t('settings.tabs.application')} leftIcon="pi pi-cog mr-2">
          <Card className="shadow-2 max-w-2xl" title={t('settings.application.info')}>
            <div className="flex flex-column gap-2">
              <div><strong>{t('settings.application.version')}:</strong> 1.0.0</div>
              <div><strong>{t('settings.application.updateDate')}:</strong> 15/01/2024</div>
              <div><strong>{t('settings.application.database')}:</strong> PostgreSQL</div>
              <div><strong>{t('settings.application.backend')}:</strong> Symfony 6.4</div>
              <div><strong>{t('settings.application.frontend')}:</strong> React + PrimeReact</div>
            </div>
          </Card>
        </TabPanel>
      </TabView>
    </div>
  );
};

export default Settings;
