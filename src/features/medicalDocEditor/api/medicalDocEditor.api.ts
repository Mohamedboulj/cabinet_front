import api from '@/lib/axios';

export interface UserExtraInfo {
    fullName: string;
    email: string;
    phone: string;
    nameAr: string;
    address: string;
    addressAr: string;
    city: string;
    cityAr: string;
}

export const medicalDocEditorApi = {
  // saveDraft: (draft: DocumentDraft) => api.post('/documents/drafts', draft),
  // loadDraft: (id: string) => api.get(`/documents/drafts/${id}`),
  getUserExtraInfo: async (userId: string | number): Promise<{ data: UserExtraInfo }> => {
    const response = await api.get(`/users/${userId}/extra-info`);
    return response.data;
  }
};
