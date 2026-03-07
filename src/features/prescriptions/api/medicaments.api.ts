import api from '@/lib/axios';

export interface Medicament {
    id: number;
    code: string;
    nom: string;
    dci1: string;
    dosage1: string;
    uniteDosage1: string;
    forme: string;
    presentation: string;
    ppv: string;
    ph: string;
    prixBr: string;
    princepsGenerique: string;
    tauxRemboursement: string;
}

interface MedicamentSearchResponse {
    '@context': string;
    '@id': string;
    '@type': string;
    totalItems: number;
    member: Medicament[];
}

export const medicamentService = {
    async searchMedicaments(query: string): Promise<Medicament[]> {
        if (!query || query.length < 2) return [];
        const response = await api.get<MedicamentSearchResponse>('/medicaments/search', {
            params: { q: query },
        });
        return response.data.member || response.data as any;
    },

    async getMedicament(id: number): Promise<Medicament> {
        const response = await api.get<Medicament>(`/medicaments/${id}`);
        return response.data;
    },
};
