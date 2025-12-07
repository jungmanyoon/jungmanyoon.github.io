import React, { useState, useEffect } from 'react'
import { Settings, User, Clock, DollarSign, Heart, ChefHat } from 'lucide-react'
import RecommendationEngine from '../../utils/ai/recommendationEngine.js'

const PreferenceSettings = ({ isOpen, onClose }) => {
  const [recommendationEngine] = useState(() => new RecommendationEngine())
  const [preferences, setPreferences] = useState({})
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // 현재 설정 로드
      setPreferences(recommendationEngine.userProfile)
      setHasChanges(false)
    }
  }, [isOpen, recommendationEngine])

  const handleSave = () => {
    // 각 설정을 개별적으로 업데이트
    Object.keys(preferences).forEach(key => {
      if (preferences[key] !== recommendationEngine.userProfile[key]) {
        recommendationEngine.updateUserProfile(key, preferences[key])
      }
    })
    
    setHasChanges(false)
    alert('설정이 저장되었습니다!')
  }

  const handlePreferenceChange = (category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  const handleSimpleChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
    setHasChanges(true)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Settings className="w-6 h-6 mr-3 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">AI 추천 설정</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 기본 프로필 */}
          <div className="p-6 border-b">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 mr-2 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">기본 프로필</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제빵 기술 수준
                </label>
                <select
                  value={preferences.skillLevel || 'intermediate'}
                  onChange={(e) => handleSimpleChange('skillLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="beginner">초급 - 기본적인 빵만 만들어봤어요</option>
                  <option value="intermediate">중급 - 여러 종류의 빵을 만들어봤어요</option>
                  <option value="advanced">고급 - 복잡한 기법도 시도해봤어요</option>
                  <option value="professional">전문가 - 제빵 업계에서 일하고 있어요</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시간 선호도
                </label>
                <select
                  value={preferences.timePreference || 'medium'}
                  onChange={(e) => handleSimpleChange('timePreference', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="short">빠른 제작 (1-2시간)</option>
                  <option value="medium">보통 시간 (3-6시간)</option>
                  <option value="long">시간 여유 (8시간 이상)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  예산 선호도
                </label>
                <select
                  value={preferences.budgetPreference || 'medium'}
                  onChange={(e) => handleSimpleChange('budgetPreference', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="low">경제적 (개당 3,000원 이하)</option>
                  <option value="medium">보통 (개당 3,000-8,000원)</option>
                  <option value="high">프리미엄 (개당 8,000원 이상)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 카테고리 선호도 */}
          <div className="p-6 border-b">
            <div className="flex items-center mb-4">
              <ChefHat className="w-5 h-5 mr-2 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">카테고리 선호도</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">좋아하는 제빵 카테고리를 선택해주세요 (1-5점)</p>
            
            <div className="space-y-3">
              {[
                { id: 'bread', name: '식빵/빵류', description: '식빵, 바게트, 호밀빵 등' },
                { id: 'pastry', name: '페이스트리', description: '크루아상, 데니시, 파이 등' },
                { id: 'cake', name: '케이크', description: '스펀지케이크, 파운드케이크 등' },
                { id: 'cookie', name: '쿠키/비스킷', description: '쿠키, 마카롱, 비스킷 등' },
                { id: 'dessert', name: '디저트', description: '타르트, 푸딩, 무스 등' },
                { id: 'savory', name: '짭짤한 빵', description: '피자, 포카치아, 프레첼 등' }
              ].map(category => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{category.name}</div>
                    <div className="text-sm text-gray-600">{category.description}</div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {[1, 2, 3, 4, 5].map(score => (
                      <button
                        key={score}
                        onClick={() => handlePreferenceChange(
                          'categoryPreferences', 
                          category.id, 
                          score / 5
                        )}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all ${
                          ((preferences.categoryPreferences?.[category.id] || 0.6) * 5) >= score
                            ? 'bg-purple-500 border-purple-500 text-white'
                            : 'border-gray-300 text-gray-600 hover:border-purple-300'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 영양 선호도 */}
          <div className="p-6 border-b">
            <div className="flex items-center mb-4">
              <Heart className="w-5 h-5 mr-2 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">건강 선호도</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">건강한 레시피를 선호하시나요?</p>
            
            <div className="space-y-3">
              {[
                { 
                  id: 'preferLowSugar', 
                  name: '저당 선호', 
                  description: '설탕 함량이 적은 레시피를 선호합니다' 
                },
                { 
                  id: 'preferHighProtein', 
                  name: '고단백 선호', 
                  description: '단백질 함량이 높은 레시피를 선호합니다' 
                },
                { 
                  id: 'preferLowSodium', 
                  name: '저나트륨 선호', 
                  description: '나트륨 함량이 적은 레시피를 선호합니다' 
                },
                { 
                  id: 'preferHighFiber', 
                  name: '고식이섬유 선호', 
                  description: '식이섬유가 풍부한 레시피를 선호합니다' 
                }
              ].map(pref => (
                <label key={pref.id} className="flex items-start">
                  <input
                    type="checkbox"
                    checked={preferences.nutritionPreferences?.[pref.id] || false}
                    onChange={(e) => handlePreferenceChange(
                      'nutritionPreferences',
                      pref.id,
                      e.target.checked
                    )}
                    className="mt-1 mr-3 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{pref.name}</div>
                    <div className="text-sm text-gray-600">{pref.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 보유 재료 */}
          <div className="p-6">
            <div className="flex items-center mb-4">
              <DollarSign className="w-5 h-5 mr-2 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">자주 사용하는 재료</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              집에 항상 구비하고 있거나 자주 구매하는 재료를 선택해주세요
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                '강력분', '중력분', '박력분', '설탕', '흑설탕', '소금',
                '버터', '무염버터', '식용유', '올리브유', '우유', '생크림',
                '계란', '이스트', '베이킹파우더', '바닐라익스트랙',
                '꿀', '아몬드가루', '호두', '건포도'
              ].map(ingredient => (
                <label key={ingredient} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(preferences.availableIngredients || []).includes(ingredient)}
                    onChange={(e) => {
                      const current = preferences.availableIngredients || []
                      const updated = e.target.checked
                        ? [...current, ingredient]
                        : current.filter(item => item !== ingredient)
                      handleSimpleChange('availableIngredients', updated)
                    }}
                    className="mr-2 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{ingredient}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <p className="text-sm text-gray-600">
            설정을 저장하면 AI가 더 정확한 추천을 제공합니다
          </p>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                hasChanges
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreferenceSettings