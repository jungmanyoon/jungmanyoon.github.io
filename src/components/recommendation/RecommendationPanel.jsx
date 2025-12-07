import React, { useState, useEffect, useMemo } from 'react'
import { Sparkles, ThumbsUp, Clock, DollarSign, Heart, Star, TrendingUp } from 'lucide-react'
import RecommendationEngine from '../../utils/ai/recommendationEngine.js'

const RecommendationPanel = ({ 
  recipes = [], 
  currentRecipe = null, 
  onRecipeSelect,
  className = '' 
}) => {
  const [recommendationEngine] = useState(() => new RecommendationEngine())
  const [selectedType, setSelectedType] = useState('general')
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [likedIds, setLikedIds] = useState(() => new Set())
  const [ratings, setRatings] = useState({})

  const recommendationTypes = [
    { id: 'general', label: '추천', icon: Sparkles, description: '맞춤 추천' },
    { id: 'similar', label: '유사', icon: TrendingUp, description: '비슷한 레시피' },
    { id: 'beginner', label: '초급', icon: Heart, description: '쉬운 레시피' },
    { id: 'budget', label: '경제적', icon: DollarSign, description: '저렴한 레시피' },
    { id: 'healthy', label: '건강한', icon: Star, description: '영양 가득' },
    { id: 'quick', label: '빠른', icon: Clock, description: '빠른 제작' }
  ]

  // 추천 계산
  useEffect(() => {
    if (!recipes || recipes.length === 0) {
      setRecommendations([])
      setLoading(false)
      return
    }

    setLoading(true)
    
    // 비동기로 추천 계산 (UI 차단 방지)
    setTimeout(() => {
      try {
        const recommended = recommendationEngine.recommendRecipes(
          recipes,
          currentRecipe,
          {
            count: 6,
            recommendationType: selectedType,
            excludeViewed: selectedType === 'general'
          }
        )
        
        setRecommendations(recommended)
      } catch (error) {
        console.error('추천 계산 오류:', error)
        setRecommendations([])
      } finally {
        setLoading(false)
      }
    }, 100)
  }, [recipes, currentRecipe, selectedType, recommendationEngine])

  // 레시피 클릭 처리
  const handleRecipeClick = (recipe) => {
    // 상호작용 기록
    recommendationEngine.recordInteraction(recipe.id, 'view')
    
    if (onRecipeSelect) {
      onRecipeSelect(recipe)
    }
  }

  // 좋아요 처리
  const handleLike = (recipe, event) => {
    event.stopPropagation()
    recommendationEngine.recordInteraction(recipe.id, 'like', true)
    
    // UI 업데이트는 추후 구현 (좋아요 상태 표시)
    setLikedIds(prev => {
      const next = new Set(prev)
      if (next.has(recipe.id)) next.delete(recipe.id)
      else next.add(recipe.id)
      return next
    })
  }

  const handleCooked = (recipe, rating) => {
    recommendationEngine.recordInteraction(recipe.id, 'cook', true)
    recommendationEngine.recordInteraction(recipe.id, 'rate', rating)
    setRatings(prev => ({ ...prev, [recipe.id]: rating }))
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>추천할 레시피가 없습니다</p>
          <p className="text-sm mt-1">레시피를 추가해보세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI 추천</h3>
          </div>
          <div className="text-sm text-gray-500">
            {recommendations.length}개 추천
          </div>
        </div>

        {/* 추천 타입 선택 */}
        <div className="flex flex-wrap gap-2">
          {recommendationTypes.map(type => {
            const IconComponent = type.icon
            const isSelected = selectedType === type.id
            
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
                title={type.description}
              >
                <IconComponent className="w-3 h-3 mr-1" />
                {type.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 추천 목록 */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">추천할 수 있는 레시피가 없습니다</p>
            <p className="text-xs mt-1">다른 추천 타입을 선택해보세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((recipe, index) => (
              <div
                key={recipe.id}
                onClick={() => handleRecipeClick(recipe)}
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer group"
                role="button"
                aria-label={`추천 레시피 ${recipe.name}`}
              >
                {/* 순위 */}
                <div className="flex-shrink-0 mr-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                </div>

                {/* 레시피 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                        {recipe.name || recipe.nameKo}
                      </h4>
                      
                      {/* 추천 이유 */}
                      {recipe.recommendationReasons && recipe.recommendationReasons.length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {recipe.recommendationReasons.join(' • ')}
                          </p>
                        </div>
                      )}
                      
                      {/* 레시피 기본 정보 */}
                      <div className="flex items-center mt-2 text-xs text-gray-500 space-x-3">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {((recipe.prepTime || 0) + (recipe.bakingTime || 0))}분
                        </div>
                        
                        {recipe.difficulty && (
                          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            recipe.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                            recipe.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                            recipe.difficulty === 'advanced' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {recipe.difficulty === 'beginner' ? '초급' :
                             recipe.difficulty === 'intermediate' ? '중급' :
                             recipe.difficulty === 'advanced' ? '고급' : '전문가'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 추천 점수 및 액션 */}
                    <div className="flex items-center ml-3 space-x-2">
                      {/* 추천 점수 */}
                      {recipe.recommendationScore && (
                        <div className="text-right">
                          <div className="text-xs font-medium text-purple-600">
                            {Math.round(recipe.recommendationScore)}%
                          </div>
                          <div className="text-xs text-gray-500">매치</div>
                        </div>
                      )}
                      
                      {/* 좋아요 버튼 */}
                      <button
                        onClick={(e) => handleLike(recipe, e)}
                        className={`p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100 ${likedIds.has(recipe.id) ? 'bg-red-100 text-red-500' : 'hover:bg-red-100 text-gray-400 hover:text-red-500'}`}
                        title="좋아요"
                        aria-pressed={likedIds.has(recipe.id)}
                        aria-label="좋아요"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>

                      {/* 별점 */}
                      <div className="flex items-center space-x-0.5 ml-1" aria-label="별점">
                        {[1,2,3,4,5].map(star => (
                          <button
                            key={star}
                            className="p-0.5 rounded hover:bg-yellow-100"
                            title={`${star}점 주기`}
                            aria-label={`${star}점`}
                            onClick={(e) => { e.stopPropagation(); handleCooked(recipe, star) }}
                          >
                            <Star className={`w-3.5 h-3.5 ${((ratings[recipe.id] || 0) >= star) ? 'text-yellow-500 fill-yellow-400' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 푸터 */}
      {recommendations.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-600 text-center">
            AI가 당신의 선호도를 학습하여 더 나은 추천을 제공합니다
          </p>
        </div>
      )}
    </div>
  )
}

export default RecommendationPanel