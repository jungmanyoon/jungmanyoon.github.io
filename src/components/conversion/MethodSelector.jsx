import React from 'react'
import { useTranslation } from 'react-i18next'
import { METHODS } from '../../constants/methods'

function MethodSelector({ currentMethod, selectedMethod, onMethodChange }) {
  const { t } = useTranslation()
  const availableMethods = Object.values(METHODS).filter(
    method => method.id !== currentMethod
  )

  return (
    <div>
      <h3 className="mb-4">{t('components.methodSelector.title')}</h3>

      <div className="mb-4 p-4 bg-bread-100 rounded-lg">
        <p className="text-sm text-bread-700">
          {t('components.methodSelector.currentMethod')} <strong>{METHODS[currentMethod]?.name || currentMethod}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableMethods.map(method => (
          <div
            key={method.id}
            onClick={() => onMethodChange(method.id)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedMethod === method.id
                ? 'border-bread-500 bg-bread-50'
                : 'border-bread-200 hover:border-bread-300'
            }`}
          >
            <h4 className="font-medium text-bread-700 mb-2">{method.name}</h4>
            <p className="text-sm text-gray-600 mb-3">{method.description}</p>

            <div className="text-xs text-gray-500">
              <p className="mb-1">
                <strong>{t('components.methodSelector.fermentationTime')}</strong>{' '}
                {method.fermentationTime.sponge && t('components.methodSelector.preFerment', { time: method.fermentationTime.sponge }) + ', '}
                {method.fermentationTime.poolish && t('components.methodSelector.poolish', { time: method.fermentationTime.poolish }) + ', '}
                {method.fermentationTime.biga && t('components.methodSelector.biga', { time: method.fermentationTime.biga }) + ', '}
                {method.fermentationTime.mainDough && t('components.methodSelector.mainDough', { time: method.fermentationTime.mainDough })}
                {method.fermentationTime.total && t('components.methodSelector.total', { time: method.fermentationTime.total })}
              </p>

              <div className="mt-2">
                <p className="text-green-600">
                  {t('components.methodSelector.advantages')} {method.advantages.slice(0, 2).join(', ')}
                </p>
                <p className="text-red-600">
                  {t('components.methodSelector.disadvantages')} {method.disadvantages.slice(0, 2).join(', ')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">{t('components.methodSelector.guide.title')}</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>{t('components.methodSelector.guide.softBread')}</strong> {t('components.methodSelector.guide.softBreadMethod')}</li>
          <li>• <strong>{t('components.methodSelector.guide.handKneading')}</strong> {t('components.methodSelector.guide.handKneadingMethod')}</li>
          <li>• <strong>{t('components.methodSelector.guide.bestFlavor')}</strong> {t('components.methodSelector.guide.bestFlavorMethod')}</li>
          <li>• <strong>{t('components.methodSelector.guide.flexibility')}</strong> {t('components.methodSelector.guide.flexibilityMethod')}</li>
          <li>• <strong>{t('components.methodSelector.guide.basic')}</strong> {t('components.methodSelector.guide.basicMethod')}</li>
        </ul>
      </div>
    </div>
  )
}

export default MethodSelector