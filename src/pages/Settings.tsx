import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const toast = useRef<Toast>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Les mots de passe ne correspondent pas',
      });
      return;
    }

    toast.current?.show({
      severity: 'success',
      summary: 'Succès',
      detail: 'Mot de passe modifié avec succès',
    });
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div>
      <Toast ref={toast} />

      <div className="mb-4">
        <h1 className="text-3xl font-bold m-0">Paramètres</h1>
      </div>

      <TabView>
        <TabPanel header="Profil" leftIcon="pi pi-user mr-2">
          <Card className="shadow-2 max-w-2xl">
            <div className="flex flex-column gap-3">
              <div className="field">
                <label className="block font-medium mb-2">Nom</label>
                <InputText value={user?.lastName || ''} className="w-full" disabled />
              </div>
              <div className="field">
                <label className="block font-medium mb-2">Prénom</label>
                <InputText value={user?.firstName || ''} className="w-full" disabled />
              </div>
              <div className="field">
                <label className="block font-medium mb-2">Email</label>
                <InputText value={user?.email || ''} className="w-full" disabled />
              </div>
              <div className="field">
                <label className="block font-medium mb-2">Téléphone</label>
                <InputText value={user?.phone || ''} className="w-full" disabled />
              </div>
              <div className="field">
                <label className="block font-medium mb-2">Spécialité</label>
                <InputText value={user?.specialty || ''} className="w-full" disabled />
              </div>
            </div>
          </Card>
        </TabPanel>

        <TabPanel header="Sécurité" leftIcon="pi pi-lock mr-2">
          <Card className="shadow-2 max-w-2xl" title="Changer le mot de passe">
            <div className="flex flex-column gap-3">
              <div className="field">
                <label className="block font-medium mb-2">Mot de passe actuel</label>
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
                <label className="block font-medium mb-2">Nouveau mot de passe</label>
                <Password
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full"
                  inputClassName="w-full"
                  toggleMask
                />
              </div>
              <div className="field">
                <label className="block font-medium mb-2">Confirmer le mot de passe</label>
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
                label="Changer le mot de passe"
                icon="pi pi-check"
                onClick={handlePasswordChange}
                className="mt-2"
              />
            </div>
          </Card>
        </TabPanel>

        <TabPanel header="Application" leftIcon="pi pi-cog mr-2">
          <Card className="shadow-2 max-w-2xl" title="Informations">
            <div className="flex flex-column gap-2">
              <div><strong>Version:</strong> 1.0.0</div>
              <div><strong>Date de mise à jour:</strong> 15/01/2024</div>
              <div><strong>Base de données:</strong> PostgreSQL</div>
              <div><strong>Backend:</strong> Symfony 6.4</div>
              <div><strong>Frontend:</strong> React + PrimeReact</div>
            </div>
          </Card>
        </TabPanel>
      </TabView>
    </div>
  );
};

export default Settings;
