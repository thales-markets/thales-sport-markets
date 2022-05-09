import enTranslation from './en.json';

export const resources = {
    en: { translation: enTranslation },
};

export enum SupportedLanguages {
    ENGLISH = 'en',
}

export const LanguageNameMap = {
    [SupportedLanguages.ENGLISH]: 'English',
};

export const DEFAULT_LANGUAGE = SupportedLanguages.ENGLISH;
