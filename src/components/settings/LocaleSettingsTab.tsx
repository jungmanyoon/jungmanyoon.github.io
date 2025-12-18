/**
 * 언어 및 단위 설정 탭
 * 국제화 관련 사용자 설정 UI
 */

import { useTranslation } from 'react-i18next';
import { useLocaleStore } from '@/stores/useLocaleStore';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, UnitSystem, UNIT_SYSTEMS } from '@/i18n';
import { TemperatureUnit, WeightUnit, VolumeUnit, LengthUnit, UNIT_SYMBOLS } from '@/utils/unitConverter';

export default function LocaleSettingsTab() {
  const { t } = useTranslation();
  const {
    language,
    unitSystem,
    temperature,
    weight,
    volume,
    length,
    decimalSeparator,
    decimalPlaces,
    showIngredientTranslation,
    setLanguage,
    setUnitSystem,
    setTemperatureUnit,
    setWeightUnit,
    setVolumeUnit,
    setLengthUnit,
    setDecimalSeparator,
    setDecimalPlaces,
    setShowIngredientTranslation,
    resetToDefaults
  } = useLocaleStore();

  return (
    <div className="space-y-8">
      {/* 언어 설정 */}
      <section className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">🌐</span>
          {t('settings.language')}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {t('settings.languageDescription')}
        </p>

        <div className="grid grid-cols-2 gap-3">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`p-4 rounded-lg border-2 transition-all ${
                language === lang
                  ? 'border-bread-500 bg-bread-50 text-bread-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="text-2xl mb-1">
                {lang === 'ko' ? '🇰🇷' : '🇺🇸'}
              </div>
              <div className="font-medium">{LANGUAGE_NAMES[lang]}</div>
            </button>
          ))}
        </div>
      </section>

      {/* 단위 시스템 */}
      <section className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">📏</span>
          {t('settings.unitSystem')}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {t('settings.unitSystemDescription')}
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {(Object.keys(UNIT_SYSTEMS) as UnitSystem[]).map((system) => (
            <button
              key={system}
              onClick={() => setUnitSystem(system)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                unitSystem === system
                  ? 'border-bread-500 bg-bread-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900">
                {language === 'ko' ? UNIT_SYSTEMS[system].nameKo : UNIT_SYSTEMS[system].name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {system === 'metric' && 'g, ml, °C'}
                {system === 'imperial' && 'oz, cups, °F'}
                {system === 'hybrid' && 'g, ml, °F'}
              </div>
            </button>
          ))}
        </div>

        {/* 개별 단위 설정 */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            {t('settings.individualUnitSettings')}
          </h4>

          <div className="grid grid-cols-2 gap-4">
            {/* 온도 */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t('settings.temperatureUnit')}
              </label>
              <select
                value={temperature}
                onChange={(e) => setTemperatureUnit(e.target.value as TemperatureUnit)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-bread-500 focus:border-bread-500"
              >
                <option value="celsius">°C (Celsius)</option>
                <option value="fahrenheit">°F (Fahrenheit)</option>
              </select>
            </div>

            {/* 무게 */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t('settings.weightUnit')}
              </label>
              <select
                value={weight}
                onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-bread-500 focus:border-bread-500"
              >
                <option value="gram">g (Gram)</option>
                <option value="ounce">oz (Ounce)</option>
                <option value="pound">lb (Pound)</option>
                <option value="kilogram">kg (Kilogram)</option>
              </select>
            </div>

            {/* 부피 */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t('settings.volumeUnit')}
              </label>
              <select
                value={volume}
                onChange={(e) => setVolumeUnit(e.target.value as VolumeUnit)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-bread-500 focus:border-bread-500"
              >
                <option value="milliliter">ml (Milliliter)</option>
                <option value="cup">cup (US Cup)</option>
                <option value="liter">L (Liter)</option>
                <option value="fluidOunce">fl oz (Fluid Ounce)</option>
              </select>
            </div>

            {/* 길이 */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t('settings.lengthUnit')}
              </label>
              <select
                value={length}
                onChange={(e) => setLengthUnit(e.target.value as LengthUnit)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-bread-500 focus:border-bread-500"
              >
                <option value="centimeter">cm (Centimeter)</option>
                <option value="inch">in (Inch)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 숫자 포맷 */}
      <section className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">🔢</span>
          {t('settings.numberFormat')}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* 소수점 구분자 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              {t('settings.decimalSeparator')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setDecimalSeparator('.')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                  decimalSeparator === '.'
                    ? 'border-bread-500 bg-bread-50 text-bread-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {t('settings.dot')}
              </button>
              <button
                onClick={() => setDecimalSeparator(',')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                  decimalSeparator === ','
                    ? 'border-bread-500 bg-bread-50 text-bread-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {t('settings.comma')}
              </button>
            </div>
          </div>

          {/* 소수점 자릿수 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              {t('settings.decimalPlaces')}
            </label>
            <select
              value={decimalPlaces}
              onChange={(e) => setDecimalPlaces(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-bread-500 focus:border-bread-500"
            >
              <option value={0}>0 (100)</option>
              <option value={1}>1 (100.5)</option>
              <option value={2}>2 (100.55)</option>
              <option value={3}>3 (100.555)</option>
            </select>
          </div>
        </div>
      </section>

      {/* 재료 표시 옵션 */}
      <section className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">🥖</span>
          {t('settings.ingredientDisplay')}
        </h3>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showIngredientTranslation}
            onChange={(e) => setShowIngredientTranslation(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-bread-500 focus:ring-bread-500"
          />
          <span className="text-gray-700">
            {t('settings.showIngredientTranslation')}
          </span>
        </label>

        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <div className="font-medium mb-1">
            {t('settings.example')}
          </div>
          {showIngredientTranslation
            ? t('settings.ingredientExampleWithTranslation')
            : t('settings.ingredientExampleWithoutTranslation')}
        </div>
      </section>

      {/* 미리보기 */}
      <section className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">👁️</span>
          {t('settings.preview')}
        </h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-gray-500 mb-1">
              {t('recipe.bakingTemp')}
            </div>
            <div className="font-medium">
              {temperature === 'celsius' ? '180°C' : '356°F'}
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-gray-500 mb-1">
              {t('ingredientCategory.flour')}
            </div>
            <div className="font-medium">
              {weight === 'gram' && '500g'}
              {weight === 'ounce' && '17.6oz'}
              {weight === 'pound' && '1.1lb'}
              {weight === 'kilogram' && '0.5kg'}
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-gray-500 mb-1">
              {t('ingredientCategory.liquid')}
            </div>
            <div className="font-medium">
              {volume === 'milliliter' && '300ml'}
              {volume === 'cup' && '1.3 cups'}
              {volume === 'liter' && '0.3L'}
              {volume === 'fluidOunce' && '10.1 fl oz'}
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-gray-500 mb-1">
              {t('settings.panDiameter')}
            </div>
            <div className="font-medium">
              {length === 'centimeter' ? '18cm' : '7in'}
            </div>
          </div>
        </div>
      </section>

      {/* 초기화 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {t('common.reset')}
        </button>
      </div>
    </div>
  );
}
