import enTranslation from './en.json';
import cnTranslation from './cn.json';

export const resources = {
    en: { translation: enTranslation },
    cn: { translation: cnTranslation },
};

export enum SupportedLanguages {
    ENGLISH = 'en',
    CHINESE = 'cn',
}

export const LanguageNameMap = {
    [SupportedLanguages.ENGLISH]: 'English',
    [SupportedLanguages.CHINESE]: '中文',
};

export const DEFAULT_LANGUAGE = SupportedLanguages.CHINESE;
