import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ko from './locales/ko.json';
import en from './locales/en.json';

// 지원 언어 목록
export const SUPPORTED_LANGUAGES = ['ko', 'en'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// 언어 표시 이름
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  ko: '한국어',
  en: 'English'
};

// 단위 시스템 타입
export type UnitSystem = 'metric' | 'imperial' | 'hybrid';

// 단위 시스템 설정
export const UNIT_SYSTEMS: Record<UnitSystem, {
  name: string;
  nameKo: string;
  temperature: 'celsius' | 'fahrenheit';
  weight: 'gram' | 'ounce';
  volume: 'milliliter' | 'cup';
}> = {
  metric: {
    name: 'Metric',
    nameKo: '미터법',
    temperature: 'celsius',
    weight: 'gram',
    volume: 'milliliter'
  },
  imperial: {
    name: 'Imperial (US)',
    nameKo: '미국식',
    temperature: 'fahrenheit',
    weight: 'ounce',
    volume: 'cup'
  },
  hybrid: {
    name: 'Hybrid (g + °F)',
    nameKo: '혼합 (g + °F)',
    temperature: 'fahrenheit',
    weight: 'gram',
    volume: 'milliliter'
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en }
    },
    fallbackLng: 'ko',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
