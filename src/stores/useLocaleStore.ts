/**
 * 언어 및 단위 설정 스토어
 * 국제화(i18n) 관련 사용자 설정 관리
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n, { SupportedLanguage, UnitSystem, UNIT_SYSTEMS } from '@/i18n';
import {
  TemperatureUnit,
  WeightUnit,
  VolumeUnit,
  LengthUnit,
  DEFAULT_UNIT_PREFERENCES,
  IMPERIAL_UNIT_PREFERENCES
} from '@/utils/unitConverter';

// ============ 타입 정의 ============

export interface LocaleSettings {
  // 언어 설정
  language: SupportedLanguage;

  // 단위 시스템
  unitSystem: UnitSystem;

  // 개별 단위 설정 (커스텀 오버라이드)
  temperature: TemperatureUnit;
  weight: WeightUnit;
  volume: VolumeUnit;
  length: LengthUnit;

  // 숫자 포맷
  decimalSeparator: '.' | ',';
  decimalPlaces: number;

  // 재료 표시
  showIngredientTranslation: boolean;  // 재료명에 번역 표시
}

export interface LocaleActions {
  // 언어 변경
  setLanguage: (language: SupportedLanguage) => void;

  // 단위 시스템 변경 (프리셋 적용)
  setUnitSystem: (system: UnitSystem) => void;

  // 개별 단위 변경
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setWeightUnit: (unit: WeightUnit) => void;
  setVolumeUnit: (unit: VolumeUnit) => void;
  setLengthUnit: (unit: LengthUnit) => void;

  // 숫자 포맷 변경
  setDecimalSeparator: (separator: '.' | ',') => void;
  setDecimalPlaces: (places: number) => void;

  // 재료 표시 설정
  setShowIngredientTranslation: (show: boolean) => void;

  // 전체 초기화
  resetToDefaults: () => void;
}

export type LocaleStore = LocaleSettings & LocaleActions;

// ============ 기본값 ============

const DEFAULT_LOCALE_SETTINGS: LocaleSettings = {
  language: 'ko',
  unitSystem: 'metric',
  temperature: 'celsius',
  weight: 'gram',
  volume: 'milliliter',
  length: 'centimeter',
  decimalSeparator: '.',
  decimalPlaces: 1,
  showIngredientTranslation: false
};

// ============ 스토어 생성 ============

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_LOCALE_SETTINGS,

      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });
      },

      setUnitSystem: (unitSystem) => {
        const systemConfig = UNIT_SYSTEMS[unitSystem];
        set({
          unitSystem,
          temperature: systemConfig.temperature,
          weight: systemConfig.weight === 'gram' ? 'gram' : 'ounce',
          volume: systemConfig.volume === 'milliliter' ? 'milliliter' : 'cup',
          length: unitSystem === 'imperial' ? 'inch' : 'centimeter'
        });
      },

      setTemperatureUnit: (temperature) => {
        set({ temperature, unitSystem: 'hybrid' }); // 개별 변경 시 hybrid로 전환
      },

      setWeightUnit: (weight) => {
        set({ weight, unitSystem: 'hybrid' });
      },

      setVolumeUnit: (volume) => {
        set({ volume, unitSystem: 'hybrid' });
      },

      setLengthUnit: (length) => {
        set({ length, unitSystem: 'hybrid' });
      },

      setDecimalSeparator: (decimalSeparator) => {
        set({ decimalSeparator });
      },

      setDecimalPlaces: (decimalPlaces) => {
        set({ decimalPlaces: Math.max(0, Math.min(3, decimalPlaces)) });
      },

      setShowIngredientTranslation: (showIngredientTranslation) => {
        set({ showIngredientTranslation });
      },

      resetToDefaults: () => {
        i18n.changeLanguage(DEFAULT_LOCALE_SETTINGS.language);
        set(DEFAULT_LOCALE_SETTINGS);
      }
    }),
    {
      name: 'recipe-locale-settings',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            ...DEFAULT_LOCALE_SETTINGS,
            ...persistedState
          };
        }
        return persistedState as LocaleStore;
      },
      onRehydrateStorage: () => (state) => {
        // 스토어 복원 시 i18n 언어 동기화
        if (state?.language) {
          i18n.changeLanguage(state.language);
        }
      }
    }
  )
);

// ============ 헬퍼 훅 ============

/**
 * 현재 언어 가져오기
 */
export function useCurrentLanguage(): SupportedLanguage {
  return useLocaleStore((state) => state.language);
}

/**
 * 현재 온도 단위 가져오기
 */
export function useTemperatureUnit(): TemperatureUnit {
  return useLocaleStore((state) => state.temperature);
}

/**
 * 현재 무게 단위 가져오기
 */
export function useWeightUnit(): WeightUnit {
  return useLocaleStore((state) => state.weight);
}

/**
 * 현재 부피 단위 가져오기
 */
export function useVolumeUnit(): VolumeUnit {
  return useLocaleStore((state) => state.volume);
}

/**
 * 현재 단위 시스템 가져오기 (metric/imperial/hybrid)
 */
export function useUnitSystem(): UnitSystem {
  return useLocaleStore((state) => state.unitSystem);
}

/**
 * 숫자 포맷 설정 가져오기
 */
export function useNumberFormat() {
  return useLocaleStore((state) => ({
    decimalSeparator: state.decimalSeparator,
    decimalPlaces: state.decimalPlaces
  }));
}

export default useLocaleStore;
