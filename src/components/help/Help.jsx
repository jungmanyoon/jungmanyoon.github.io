import React from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../common/Button.jsx'

function Help({ onClose }) {
  const { t } = useTranslation()

  return (
    <div className="max-w-5xl mx-auto">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-bread-700">{t('help.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-4">
          <section>
            <h3 className="text-lg font-semibold text-bread-600 mb-3">{t('help.gettingStarted.title')}</h3>
            <div className="prose text-gray-700">
              <p className="mb-2">{t('help.gettingStarted.intro')}</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>{t('help.gettingStarted.step1')}</li>
                <li>{t('help.gettingStarted.step2')}</li>
                <li>{t('help.gettingStarted.step3')}</li>
              </ol>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-bread-600 mb-3">{t('help.basicUsage.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-bread-700 mb-2">{t('help.basicUsage.newRecipe.title')}</h4>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                  <li>{t('help.basicUsage.newRecipe.step1')}</li>
                  <li>{t('help.basicUsage.newRecipe.step2')}</li>
                  <li>{t('help.basicUsage.newRecipe.step3')}</li>
                  <li>{t('help.basicUsage.newRecipe.step4')}</li>
                  <li>{t('help.basicUsage.newRecipe.step5')}</li>
                  <li>{t('help.basicUsage.newRecipe.step6')}</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium text-bread-700 mb-2">{t('help.basicUsage.methodConversion.title')}</h4>
                <p className="text-sm text-gray-700 mb-2">
                  {t('help.basicUsage.methodConversion.intro')}
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>{t('help.basicUsage.methodConversion.sponge')}</li>
                  <li>{t('help.basicUsage.methodConversion.poolish')}</li>
                  <li>{t('help.basicUsage.methodConversion.biga')}</li>
                  <li>{t('help.basicUsage.methodConversion.overnight')}</li>
                  <li>{t('help.basicUsage.methodConversion.notime')}</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ {t('help.basicUsage.methodConversion.warning')}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-bread-600 mb-3">{t('help.features.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-bread-50 rounded-lg">
                <h4 className="font-medium text-bread-700 mb-2">📏 {t('help.features.panScaling.title')}</h4>
                <p className="text-sm text-gray-600">
                  {t('help.features.panScaling.desc')}
                </p>
              </div>

              <div className="p-4 bg-bread-50 rounded-lg">
                <h4 className="font-medium text-bread-700 mb-2">✨ {t('help.features.advancedPan.title')}</h4>
                <p className="text-sm text-gray-600">
                  {t('help.features.advancedPan.desc')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-bread-50 rounded-lg">
                <h4 className="font-medium text-bread-700 mb-2">🌡️ {t('help.features.ddtCalc.title')}</h4>
                <p className="text-sm text-gray-600">
                  {t('help.features.ddtCalc.desc')}
                </p>
              </div>

              <div className="p-4 bg-bread-50 rounded-lg">
                <h4 className="font-medium text-bread-700 mb-2">🌍 {t('help.features.envAdjust.title')}</h4>
                <p className="text-sm text-gray-600">
                  {t('help.features.envAdjust.desc')}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-bread-600 mb-3">{t('help.advanced.title')}</h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-bread-700 mb-2">{t('help.advanced.magicNumber.title')}</h4>
                <p className="text-sm text-gray-700 mb-2">
                  {t('help.advanced.magicNumber.formula')}
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>{t('help.advanced.magicNumber.bread')}</li>
                  <li>{t('help.advanced.magicNumber.cake')}</li>
                  <li>{t('help.advanced.magicNumber.muffin')}</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-bread-700 mb-2">{t('help.advanced.multiPan.title')}</h4>
                <p className="text-sm text-gray-700">
                  {t('help.advanced.multiPan.desc')}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-bread-700 mb-2">{t('help.advanced.iceCalc.title')}</h4>
                <p className="text-sm text-gray-700">
                  {t('help.advanced.iceCalc.desc')}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-bread-600 mb-3">{t('help.bakersPercent.title')}</h3>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                {t('help.bakersPercent.desc')}
              </p>
              <p className="text-sm text-blue-800">
                {t('help.bakersPercent.example')}
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-bread-600 mb-3">{t('help.notes.title')}</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li>{t('help.notes.note1')}</li>
              <li>{t('help.notes.note2')}</li>
              <li>{t('help.notes.note3')}</li>
              <li>{t('help.notes.note4')}</li>
              <li>{t('help.notes.note5')}</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-bread-600 mb-3">{t('help.feedback.title')}</h3>
            <p className="text-sm text-gray-700">
              {t('help.feedback.desc')}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {t('help.feedback.version')}
            </p>
          </section>
        </div>

        <div className="mt-6 flex justify-end border-t pt-4">
          <Button onClick={onClose}>{t('common.close')}</Button>
        </div>
      </div>
    </div>
  )
}

export default Help