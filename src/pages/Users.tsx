import { useState, useEffect, useRef } from 'react';
import { getApiErrorMessage } from '../utils/errorUtils';
import type { User } from '../types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { userService } from "../services/userService.ts";

const Users: React.FC = () => {
  const toast = useRef<Toast>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers();
      setUsers(response.data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de charger les utilisateurs',
      });
    } finally {
      setLoading(false);
    }
  };

  const roleBodyTemplate = (rowData: User) => {
    const roleLabels: Record<string, string> = {
      'ROLE_ADMIN': 'Administrateur',
      'ROLE_MEDECIN': 'Médecin',
      'ROLE_SECRETAIRE': 'Secrétaire',
    };
    return (
      <div className="flex gap-1">
        {rowData.roles.map((role) => (
          <Tag key={role} value={roleLabels[role] || role} className="text-xs" />
        ))}
      </div>
    );
  };

  const statusBodyTemplate = (rowData: User) => {
    return rowData.isActive ? (
      <Tag value="Actif" severity="success" />
    ) : (
      <Tag value="Inactif" severity="danger" />
    );
  };

  const openNewDialog = () => {
    setEditingUser(null);
    setFormData({ isActive: true, roles: ['ROLE_SECRETAIRE'] });
    setDialogVisible(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({ ...user });
    setDialogVisible(true);
  };

  const confirmDelete = (user: User) => {
    confirmDialog({
      message: `Êtes-vous sûr de vouloir supprimer ${user.firstName} ${user.lastName} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        toast.current?.show({
          severity: 'success',
          summary: 'Succès',
          detail: 'Utilisateur supprimé',
        });
      },
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editingUser) {
        // await userService.updateUser(editingUser.id, formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Succès',
          detail: 'Utilisateur mis à jour',
        });
      } else {
        await userService.createUser(formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Succès',
          detail: 'Utilisateur créé',
        });
      }
      setDialogVisible(false);
      loadUsers();
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: getApiErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Annuler"
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => setDialogVisible(false)}
      />
      <Button
        label={editingUser ? 'Modifier' : 'Créer'}
        icon="pi pi-check"
        loading={submitting}
        onClick={handleSubmit}
      />
    </div>
  );

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="text-3xl font-bold m-0">Gestion des Utilisateurs</h1>
        <Button
          label="Nouvel utilisateur"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={openNewDialog}
        />
      </div>

      <DataTable
        value={users}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucun utilisateur trouvé"
        className="shadow-2"
      >
        <Column field="id" header="ID" sortable style={{ width: '5rem' }} />
        <Column field="lastName" header="Nom" sortable />
        <Column field="firstName" header="Prénom" sortable />
        <Column field="email" header="Email" sortable />
        <Column field="phone" header="Téléphone" />
        <Column field="specialty" header="Spécialité" />
        <Column field="roles" header="Rôles" body={roleBodyTemplate} />
        <Column field="isActive" header="Statut" body={statusBodyTemplate} sortable />
        <Column
          body={(rowData) => (
            <div className="flex gap-1">
              <Button
                icon="pi pi-pencil"
                className="p-button-rounded p-button-warning p-button-sm"
                onClick={() => openEditDialog(rowData)}
              />
              <Button
                icon="pi pi-trash"
                className="p-button-rounded p-button-danger p-button-sm"
                onClick={() => confirmDelete(rowData)}
              />
            </div>
          )}
          header="Actions"
          style={{ width: '8rem' }}
        />
      </DataTable>

      {/* User Dialog */}
      <Dialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        header={editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        className="w-11/12 md:w-6 lg:w-8"
        footer={dialogFooter}
      >
        <div className="flex flex-column gap-3">
          <div className="grid">
            <div className="col-6 field">
              <label className="block font-medium mb-2">Nom *</label>
              <InputText
                value={formData.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="col-6 field">
              <label className="block font-medium mb-2">Prénom *</label>
              <InputText
                value={formData.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
          <div className="field">
            <label className="block font-medium mb-2">Email *</label>
            <InputText
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="field">
            <label className="block font-medium mb-2">Téléphone</label>
            <InputText
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="field">
            <label className="block font-medium mb-2">Spécialité</label>
            <InputText
              value={formData.specialty || ''}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="w-full"
              placeholder="Pour les médecins"
            />
          </div>
          <div className="field">
            <label className="block font-medium mb-2">Numéro de licence</label>
            <InputText
              value={formData.licenseNumber || ''}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              className="w-full"
              placeholder="Pour les médecins"
            />
          </div>
          <div className="field">
            <label className="block font-medium mb-2">Rôles *</label>
            <MultiSelect
              value={formData.roles || []}
              options={[
                { label: 'Administrateur', value: 'ROLE_ADMIN' },
                { label: 'Médecin', value: 'ROLE_MEDECIN' },
                { label: 'Secrétaire', value: 'ROLE_SECRETAIRE' },
              ]}
              onChange={(e) => setFormData({ ...formData, roles: e.value })}
              placeholder="Sélectionner les rôles"
              className="w-full"
            />
          </div>
          {!editingUser && (
            <div className="field">
              <label className="block font-medium mb-2">Mot de passe *</label>
              <InputText
                type="password"
                className="w-full"
                placeholder="Mot de passe"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default Users;
