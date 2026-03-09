/**
 * App-level configuration constants
 */

export const APP_CONFIG = {
    APP_NAME: 'Bệnh viện Hoàn Mỹ',
    APP_VERSION: '1.0.0',
    DEFAULT_TIMEOUT_MS: 30000,
    DEFAULT_PAGE_SIZE: 10,
    DEFAULT_PAGE_INDEX: 1,
    TOKEN_KEY: 'jwt_token',
    USER_KEY: 'current_user',
} as const;

export const DATE_FORMATS = {
    DISPLAY: 'dd/MM/yyyy',
    DISPLAY_FULL: 'dd/MM/yyyy HH:mm',
    ISO: 'yyyy-MM-dd',
} as const;
