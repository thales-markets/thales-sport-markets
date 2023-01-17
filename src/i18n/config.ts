import enTranslation from './en.json';
import cnTranslation from './cn.json';
import frTranslation from './fr.json';
import deTranslation from './de.json';
// import itTranslation from './it.json';
// import ruTranslation from './ru.json';
import esTranslation from './es.json';
import thTranslation from './th.json';

export const resources = {
    en: { translation: enTranslation },
    cn: { translation: cnTranslation },
    fr: { translation: frTranslation },
    de: { translation: deTranslation },
    // it: { translation: itTranslation },
    // ru: { translation: ruTranslation },
    es: { translation: esTranslation },
    th: { translation: thTranslation },
};

export enum SupportedLanguages {
    ENGLISH = 'en',
    CHINESE = 'cn',
    FRENCH = 'fr',
    GERMAN = 'de',
    // ITALIAN = 'it',
    // RUSSIAN = 'ru',
    SPANISH = 'es',
    THAI = 'th',
}

export const LanguageNameMap = {
    [SupportedLanguages.ENGLISH]: 'English',
    [SupportedLanguages.CHINESE]: '中国语文',
    [SupportedLanguages.FRENCH]: 'Français',
    [SupportedLanguages.GERMAN]: 'Deutsch',
    // [SupportedLanguages.ITALIAN]: 'Italiano',
    // [SupportedLanguages.RUSSIAN]: 'русский',
    [SupportedLanguages.SPANISH]: 'Español',
    [SupportedLanguages.THAI]: 'ภาษาไทย',
};

export const DEFAULT_LANGUAGE = SupportedLanguages.ENGLISH;
