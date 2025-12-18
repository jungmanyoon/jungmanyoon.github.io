import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { COMMON_PANS, PAN_TYPES } from '../../constants/pans'
import { useLocalization } from '@/hooks/useLocalization'

function PanSelector({ onPanSelect }) {
  const { t } = useTranslation()
  const { getLocalizedPanName } = useLocalization()
  const [selectedPanId, setSelectedPanId] = useState(null)
  const [customPan, setCustomPan] = useState({
    type: PAN_TYPES.ROUND,
    dimensions: {}
  })
  const [useCustom, setUseCustom] = useState(false)

  const handlePanSelect = (panId) => {
    setSelectedPanId(panId)
    setUseCustom(false)
    onPanSelect(COMMON_PANS[panId])
  }

  const handleCustomPanChange = (field, value) => {
    const newCustomPan = {
      ...customPan,
      dimensions: {
        ...customPan.dimensions,
        [field]: parseFloat(value) || 0
      }
    }
    setCustomPan(newCustomPan)
    
    if (useCustom) {
      onPanSelect(newCustomPan)
    }
  }

  const pansByType = Object.entries(COMMON_PANS).reduce((acc, [id, pan]) => {
    if (!acc[pan.type]) acc[pan.type] = []
    acc[pan.type].push({ id, ...pan })
    return acc
  }, {})

  const getPanTypeLabel = (type) => {
    const typeMap = {
      [PAN_TYPES.ROUND]: 'round',
      [PAN_TYPES.MOUSSE]: 'mousse',
      [PAN_TYPES.SQUARE]: 'square',
      [PAN_TYPES.RECTANGLE]: 'rectangle',
      [PAN_TYPES.LOAF]: 'loaf',
      [PAN_TYPES.PULLMAN]: 'pullman',
      [PAN_TYPES.POUND]: 'pound',
      [PAN_TYPES.CHIFFON]: 'chiffon',
      [PAN_TYPES.MUFFIN]: 'muffin',
      [PAN_TYPES.SHEET]: 'sheet'
    }
    return t(`components.panSelector.panTypes.${typeMap[type] || 'round'}`)
  }

  return (
    <div>
      <h3 className="mb-4">{t('components.panSelector.title')}</h3>

      <div className="mb-6">
        <h4 className="font-medium text-bread-700 mb-3">{t('components.panSelector.commonPans')}</h4>

        {Object.entries(pansByType).map(([type, pans]) => (
          <div key={type} className="mb-4">
            <h5 className="text-sm font-medium text-gray-600 mb-2">
              {getPanTypeLabel(type)}
            </h5>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {pans.map(pan => (
                <button
                  key={pan.id}
                  type="button"
                  onClick={() => handlePanSelect(pan.id)}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-left ${
                    selectedPanId === pan.id && !useCustom
                      ? 'border-bread-500 bg-bread-50'
                      : 'border-bread-200 hover:border-bread-300'
                  }`}
                  aria-pressed={selectedPanId === pan.id && !useCustom}
                  aria-label={t('components.panSelector.selectAria', { name: getLocalizedPanName(pan), volume: pan.volume ? pan.volume + 'cm³' : '', weight: pan.weight || '', servings: pan.servings })}
                >
                  <p className="font-medium text-sm">{getLocalizedPanName(pan)}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {pan.volume && `${pan.volume}cm³`}
                    {pan.weight && ` • ${pan.weight}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {pan.servings}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-6">
        <h4 className="font-medium text-bread-700 mb-3">{t('components.panSelector.customPan')}</h4>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={useCustom}
              onChange={(e) => {
                setUseCustom(e.target.checked)
                if (e.target.checked) {
                  setSelectedPanId(null)
                  onPanSelect(customPan)
                }
              }}
              className="mr-2"
            />
            <span className="text-sm">{t('components.panSelector.useCustomPan')}</span>
          </label>
        </div>

        {useCustom && (
          <div className="p-4 bg-bread-50 rounded-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('components.panSelector.panType')}
              </label>
              <select
                value={customPan.type}
                onChange={(e) => setCustomPan({ ...customPan, type: e.target.value })}
                className="w-full px-3 py-2 border border-bread-300 rounded-md"
              >
                <option value={PAN_TYPES.ROUND}>{t('components.panSelector.panTypeOptions.round')}</option>
                <option value={PAN_TYPES.MOUSSE}>{t('components.panSelector.panTypeOptions.mousse')}</option>
                <option value={PAN_TYPES.SQUARE}>{t('components.panSelector.panTypeOptions.square')}</option>
                <option value={PAN_TYPES.RECTANGLE}>{t('components.panSelector.panTypeOptions.rectangle')}</option>
                <option value={PAN_TYPES.LOAF}>{t('components.panSelector.panTypeOptions.loaf')}</option>
                <option value={PAN_TYPES.PULLMAN}>{t('components.panSelector.panTypeOptions.pullman')}</option>
                <option value={PAN_TYPES.POUND}>{t('components.panSelector.panTypeOptions.pound')}</option>
                <option value={PAN_TYPES.CHIFFON}>{t('components.panSelector.panTypeOptions.chiffon')}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(customPan.type === PAN_TYPES.ROUND || customPan.type === PAN_TYPES.MOUSSE) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('components.panSelector.dimensions.diameter')}
                    </label>
                    <input
                      type="number"
                      value={customPan.dimensions.diameter || ''}
                      onChange={(e) => handleCustomPanChange('diameter', e.target.value)}
                      className="w-full px-3 py-2 border border-bread-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('components.panSelector.dimensions.height')}
                    </label>
                    <input
                      type="number"
                      value={customPan.dimensions.height || ''}
                      onChange={(e) => handleCustomPanChange('height', e.target.value)}
                      className="w-full px-3 py-2 border border-bread-300 rounded-md"
                    />
                  </div>
                </>
              )}

              {(customPan.type === PAN_TYPES.SQUARE || customPan.type === PAN_TYPES.RECTANGLE) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('components.panSelector.dimensions.length')}
                    </label>
                    <input
                      type="number"
                      value={customPan.dimensions.length || ''}
                      onChange={(e) => handleCustomPanChange('length', e.target.value)}
                      className="w-full px-3 py-2 border border-bread-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('components.panSelector.dimensions.width')}
                    </label>
                    <input
                      type="number"
                      value={customPan.dimensions.width || ''}
                      onChange={(e) => handleCustomPanChange('width', e.target.value)}
                      className="w-full px-3 py-2 border border-bread-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('components.panSelector.dimensions.height')}
                    </label>
                    <input
                      type="number"
                      value={customPan.dimensions.height || ''}
                      onChange={(e) => handleCustomPanChange('height', e.target.value)}
                      className="w-full px-3 py-2 border border-bread-300 rounded-md"
                    />
                  </div>
                </>
              )}

              {(customPan.type === PAN_TYPES.LOAF || customPan.type === PAN_TYPES.PULLMAN || customPan.type === PAN_TYPES.POUND) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {customPan.type === PAN_TYPES.POUND ? t('components.panSelector.dimensions.topLength') : t('components.panSelector.dimensions.length')}
                    </label>
                    <input
                      type="number"
                      value={customPan.dimensions[customPan.type === PAN_TYPES.POUND ? 'topLength' : 'length'] || ''}
                      onChange={(e) => handleCustomPanChange(customPan.type === PAN_TYPES.POUND ? 'topLength' : 'length', e.target.value)}
                      className="w-full px-3 py-2 border border-bread-300 rounded-md"
                    />
                  </div>
                  {customPan.type === PAN_TYPES.POUND && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('components.panSelector.dimensions.bottomLength')}
                      </label>
                      <input
                        type="number"
                        value={customPan.dimensions.bottomLength || ''}
                        onChange={(e) => handleCustomPanChange('bottomLength', e.target.value)}
                        className="w-full px-3 py-2 border border-bread-300 rounded-md"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('components.panSelector.dimensions.width')}
                    </label>
                    <input
                      type="number"
                      value={customPan.dimensions.width || ''}
                      onChange={(e) => handleCustomPanChange('width', e.target.value)}
                      className="w-full px-3 py-2 border border-bread-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('components.panSelector.dimensions.height')}
                    </label>
                    <input
                      type="number"
                      value={customPan.dimensions.height || ''}
                      onChange={(e) => handleCustomPanChange('height', e.target.value)}
                      className="w-full px-3 py-2 border border-bread-300 rounded-md"
                    />
                  </div>
                </>
              )}

              {customPan.type === PAN_TYPES.CHIFFON && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('components.panSelector.dimensions.outerDiameter')}
                    </label>
                    <input
                      type="number"
                      value={customPan.dimensions.outerDiameter || ''}
                      onChange={(e) => handleCustomPanChange('outerDiameter', e.target.value)}
                      className="w-full px-3 py-2 border border-bread-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('components.panSelector.dimensions.innerDiameter')}
                    </label>
                    <input
                      type="number"
                      value={customPan.dimensions.innerDiameter || ''}
                      onChange={(e) => handleCustomPanChange('innerDiameter', e.target.value)}
                      className="w-full px-3 py-2 border border-bread-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('components.panSelector.dimensions.height')}
                    </label>
                    <input
                      type="number"
                      value={customPan.dimensions.height || ''}
                      onChange={(e) => handleCustomPanChange('height', e.target.value)}
                      className="w-full px-3 py-2 border border-bread-300 rounded-md"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PanSelector