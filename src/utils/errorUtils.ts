/**
 * Extracts a user-friendly error message from an Axios error response.
 *
 * Checks multiple common response formats from the backend:
 *   { "error": "..." }
 *   { "message": "..." }
 *   { "detail": "..." }
 *   { "errors": { "field": "..." } }  (validation)
 *   { "violations": [{ "message": "..." }] }  (Symfony validator)
 */
import i18n from '../i18n';

export function getApiErrorMessage(error: any, fallback: string = i18n.t('common.genericError')): string {
    const data = error?.response?.data;

    if (!data) {
        return error?.message || fallback;
    }

    // Direct string response
    if (typeof data === 'string') {
        return data;
    }

    // Database Duplicate Entry (MySQL Error 1062)
    if (data.code === 1062) {
        return i18n.t('common.duplicateEntry');
    }

    // Common backend error field names
    if (data.error) return data.error;
    if (data.message) return data.message;
    if (data.detail) return data.detail;

    // Validation errors – join field messages
    if (data.errors && typeof data.errors === 'object') {
        const messages = Object.values(data.errors).flat();
        if (messages.length > 0) return messages.join(', ');
    }

    // Symfony-style violations
    if (Array.isArray(data.violations) && data.violations.length > 0) {
        return data.violations.map((v: any) => v.message || v.title).join(', ');
    }

    return fallback;
}

