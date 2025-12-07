import React, { useState, useEffect } from 'react'
import Button from '../common/Button.jsx'
import LocalStorageService from '../../utils/storage/localStorage.js'
import { toast } from '@utils/toast'

function Settings({ onClose }) {
  const [settings, setSettings] = useState({
    theme: 'light',
    defaultMethod: 'straight',
    defaultUnit: 'metric',
    autoSave: true,
    language: 'ko'
  })

  useEffect(() => {
    const savedSettings = LocalStorageService.getSettings()
    setSettings(savedSettings)
  }, [])

  const handleSave = () => {
    LocalStorageService.saveSettings(settings)
    toast.success('설정이 저장되었습니다.')
    onClose()
  }

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-bread-700">설정</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              기본 제법
            </label>
            <select
              value={settings.defaultMethod}
              onChange={(e) => handleChange('defaultMethod', e.target.value)}
              className="w-full px-3 py-2 border border-bread-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bread-400"
            >
              <option value="straight">스트레이트법</option>
              <option value="sponge">중종법</option>
              <option value="poolish">폴리쉬법</option>
              <option value="biga">비가법</option>
              <option value="coldFermentation">저온숙성법</option>
              <option value="noTime">노타임법</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              단위 시스템
            </label>
            <select
              value={settings.defaultUnit}
              onChange={(e) => handleChange('defaultUnit', e.target.value)}
              className="w-full px-3 py-2 border border-bread-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bread-400"
            >
              <option value="metric">미터법 (g, ml)</option>
              <option value="imperial">야드파운드법 (oz, cups)</option>
            </select>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => handleChange('autoSave', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                자동 저장 활성화
              </span>
            </label>
          </div>

          <div>
            <h3 className="text-lg font-medium text-bread-700 mb-3">데이터 관리</h3>
            <div className="space-y-2">
              <Button 
                variant="secondary" 
                size="small"
                onClick={() => {
                  const recipes = LocalStorageService.getAllRecipes()
                  const data = JSON.stringify(recipes, null, 2)
                  const blob = new Blob([data], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `recipes_${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                }}
              >
                레시피 내보내기
              </Button>
              
              <Button
                variant="danger"
                size="small"
                onClick={() => {
                  toast.warning('모든 데이터가 삭제됩니다. 계속하시겠습니까?', {
                    duration: 7000,
                    action: {
                      label: '삭제',
                      onClick: () => {
                        localStorage.clear()
                        toast.success('모든 데이터가 삭제되었습니다. 페이지를 새로고침합니다.')
                        setTimeout(() => window.location.reload(), 1000)
                      }
                    }
                  })
                }}
              >
                모든 데이터 삭제
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button onClick={handleSave}>저장</Button>
        </div>
      </div>
    </div>
  )
}

export default Settings