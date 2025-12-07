import React, { useState } from 'react'
import { COMMON_PANS, PAN_TYPES } from '../../constants/pans'

function PanSelector({ onPanSelect }) {
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

  return (
    <div>
      <h3 className="mb-4">팬 선택</h3>

      <div className="mb-6">
        <h4 className="font-medium text-bread-700 mb-3">일반 팬</h4>
        
        {Object.entries(pansByType).map(([type, pans]) => (
          <div key={type} className="mb-4">
            <h5 className="text-sm font-medium text-gray-600 mb-2">
              {type === PAN_TYPES.ROUND && '원형 팬'}
              {type === PAN_TYPES.MOUSSE && '무스링'}
              {type === PAN_TYPES.SQUARE && '사각 팬'}
              {type === PAN_TYPES.RECTANGLE && '직사각 팬'}
              {type === PAN_TYPES.LOAF && '식빵틀'}
              {type === PAN_TYPES.PULLMAN && '풀먼틀'}
              {type === PAN_TYPES.POUND && '파운드틀'}
              {type === PAN_TYPES.CHIFFON && '쉬폰틀'}
              {type === PAN_TYPES.MUFFIN && '머핀틀'}
              {type === PAN_TYPES.SHEET && '시트팬'}
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
                  aria-label={`${pan.name} 선택, ${pan.volume ? pan.volume + 'cm³' : ''} ${pan.weight || ''} ${pan.servings}`}
                >
                  <p className="font-medium text-sm">{pan.name}</p>
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
        <h4 className="font-medium text-bread-700 mb-3">사용자 정의 팬</h4>
        
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
            <span className="text-sm">사용자 정의 팬 사용</span>
          </label>
        </div>

        {useCustom && (
          <div className="p-4 bg-bread-50 rounded-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                팬 종류
              </label>
              <select
                value={customPan.type}
                onChange={(e) => setCustomPan({ ...customPan, type: e.target.value })}
                className="w-full px-3 py-2 border border-bread-300 rounded-md"
              >
                <option value={PAN_TYPES.ROUND}>원형</option>
                <option value={PAN_TYPES.MOUSSE}>무스링</option>
                <option value={PAN_TYPES.SQUARE}>정사각형</option>
                <option value={PAN_TYPES.RECTANGLE}>직사각형</option>
                <option value={PAN_TYPES.LOAF}>식빵틀</option>
                <option value={PAN_TYPES.PULLMAN}>풀먼틀</option>
                <option value={PAN_TYPES.POUND}>파운드틀</option>
                <option value={PAN_TYPES.CHIFFON}>쉬폰틀</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(customPan.type === PAN_TYPES.ROUND || customPan.type === PAN_TYPES.MOUSSE) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      지름 (cm)
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
                      높이 (cm)
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
                      길이 (cm)
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
                      너비 (cm)
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
                      높이 (cm)
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
                      {customPan.type === PAN_TYPES.POUND ? '윗길이 (cm)' : '길이 (cm)'}
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
                        아래길이 (cm)
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
                      너비 (cm)
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
                      높이 (cm)
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
                      외경 (cm)
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
                      내경 (cm)
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
                      높이 (cm)
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