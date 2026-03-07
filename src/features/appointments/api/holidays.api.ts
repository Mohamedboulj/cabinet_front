import api from '@/lib/axios';
import type { Holiday } from '@/types';

export const holidayService = {
    async getHolidays(year: number): Promise<Holiday[]> {
        const response = await api.get(`/holidays/${year}`);
        return response.data;
    },
};
