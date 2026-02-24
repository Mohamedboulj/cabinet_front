const CURRENCY_KEY = 'currency';
const DEFAULT_CURRENCY = 'MAD';

export const getCurrency = (): string => {
    return localStorage.getItem(CURRENCY_KEY) || DEFAULT_CURRENCY;
};

export const setCurrency = (currency: string): void => {
    localStorage.setItem(CURRENCY_KEY, currency);
};

export const removeCurrency = (): void => {
    localStorage.removeItem(CURRENCY_KEY);
};

export const formatAmount = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ${getCurrency()}`;
};
