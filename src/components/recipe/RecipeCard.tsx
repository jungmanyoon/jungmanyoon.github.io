import React, { memo, useCallback, useMemo } from 'react'
import { Recipe, BreadMethod, SourceType } from '@types/recipe.types'
import { Pencil, Youtube, BookOpen, Globe, User, GraduationCap } from 'lucide-react'
import { toast } from '@utils/toast'

interface RecipeCardProps {
  recipe: Recipe
  onSelect: () => void
  onDelete: () => void
  onEdit?: () => void
  onRestore?: (recipe: Recipe) => void
  compact?: boolean
}

// 카테고리 아이콘 상수로 분리
const CATEGORY_ICONS: Record<string, string> = {
  bread: '🍞',
  cake: '🍰',
  cookie: '🍪',
  pastry: '🥐',
  dessert: '🍮',
  confectionery: '🍬',
  savory: '🥖'
} as const

// 제법 이름 매핑 상수로 분리
const METHOD_NAMES: Record<BreadMethod, string> = {
  straight: '스트레이트',
  sponge: '중종법',
  poolish: '폴리쉬',
  biga: '비가',
  overnight: '저온숙성',
  'no-time': '노타임',
  sourdough: '사워도우'
} as const

// 카테고리 이름 매핑
const CATEGORY_NAMES: Record<string, string> = {
  bread: '빵',
  cake: '케이크',
  cookie: '쿠키',
  pastry: '페이스트리',
  dessert: '디저트',
  confectionery: '제과',
  savory: '세이보리'
} as const

// 출처 타입별 아이콘 및 색상
const SOURCE_CONFIG: Record<SourceType, { icon: React.ElementType; color: string; bgColor: string }> = {
  youtube: { icon: Youtube, color: 'text-red-600', bgColor: 'bg-red-50' },
  blog: { icon: Globe, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  book: { icon: BookOpen, color: 'text-amber-700', bgColor: 'bg-amber-50' },
  website: { icon: Globe, color: 'text-green-600', bgColor: 'bg-green-50' },
  personal: { icon: User, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  school: { icon: GraduationCap, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  other: { icon: Globe, color: 'text-gray-600', bgColor: 'bg-gray-50' }
} as const

// RecipeCard 컴포넌트 최적화
const RecipeCard = memo<RecipeCardProps>(({
  recipe,
  onSelect,
  onDelete,
  onEdit,
  onRestore,
  compact = false
}) => {
  // 카테고리 아이콘 메모이제이션
  const categoryIcon = useMemo(() =>
    CATEGORY_ICONS[recipe.category] || '🍞',
    [recipe.category]
  )

  // 제법 이름 메모이제이션 (method가 객체일 수 있음)
  const methodName = useMemo(() => {
    // method가 객체인 경우 (새 저장 형식)
    if (typeof recipe.method === 'object' && recipe.method !== null) {
      const methodType = (recipe.method as any).method || (recipe.method as any).type;
      return METHOD_NAMES[methodType as BreadMethod] || methodType || '스트레이트';
    }
    // method가 문자열인 경우 (기존 형식)
    return METHOD_NAMES[recipe.method as BreadMethod] || recipe.method || '스트레이트';
  }, [recipe.method])

  // 카테고리 이름 메모이제이션
  const categoryName = useMemo(() =>
    CATEGORY_NAMES[recipe.category] || recipe.category,
    [recipe.category]
  )

  // 출처 정보 메모이제이션
  const sourceInfo = useMemo(() => {
    if (!recipe.source) return null
    const config = SOURCE_CONFIG[recipe.source.type] || SOURCE_CONFIG.other
    return {
      name: recipe.source.name,
      type: recipe.source.type,
      url: recipe.source.url,
      Icon: config.icon,
      color: config.color,
      bgColor: config.bgColor
    }
  }, [recipe.source])

  // 재료 개수 메모이제이션
  const ingredientCount = useMemo(() =>
    recipe.ingredients?.length || 0,
    [recipe.ingredients?.length]
  )

  // 삭제 핸들러 최적화
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const recipeToRestore = recipe

    onDelete()
    toast.success('레시피가 삭제되었습니다', {
      duration: 5000,
      action: onRestore ? {
        label: '되돌리기',
        onClick: () => {
          onRestore(recipeToRestore)
        }
      } : undefined
    })
  }, [recipe, onDelete, onRestore])

  // 수정 핸들러 최적화
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit()
    }
  }, [onEdit])

  // 선택 핸들러 최적화
  const handleSelect = useCallback(() => {
    onSelect()
  }, [onSelect])
  
  // Compact 뷰 렌더링
  if (compact) {
    return (
      <div 
        className="bg-white border border-bread-200 rounded-lg p-3 hover:shadow-md hover:border-bread-300 transition-all cursor-pointer"
        onClick={handleSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleSelect()
          }
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-lg flex-shrink-0" aria-label={categoryName}>
              {categoryIcon}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-bread-700 truncate">
                {recipe.name}
              </h3>
              {sourceInfo && (
                <div className={`flex items-center gap-1 mt-0.5 ${sourceInfo.color}`}>
                  <sourceInfo.Icon size={10} />
                  <span className="text-[10px] truncate">{sourceInfo.name}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-1 ml-2">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="text-gray-400 hover:text-bread-600 transition-colors p-1"
                aria-label="레시피 수정"
                type="button"
              >
                <Pencil size={14} />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
              aria-label="레시피 삭제"
              type="button"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-gray-600">
          <span>{methodName}</span>
          <span>재료 {ingredientCount}개</span>
        </div>
      </div>
    )
  }
  
  // 기본 카드 뷰 렌더링
  return (
    <div 
      className="card hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleSelect()
        }
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-bread-700">
            {recipe.name}
          </h3>
          {sourceInfo && (
            <div className={`flex items-center gap-1 mt-1 ${sourceInfo.color}`}>
              <sourceInfo.Icon size={12} />
              <span className="text-xs">{sourceInfo.name}</span>
            </div>
          )}
        </div>
        <div className="flex gap-1 ml-2">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="text-gray-400 hover:text-bread-600 transition-colors p-1"
              aria-label="레시피 수정"
              type="button"
            >
              <Pencil size={16} />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label="레시피 삭제"
            type="button"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-xs px-2 py-1 bg-bread-100 text-bread-600 rounded">
          {categoryName}
        </span>
        <span className="text-xs px-2 py-1 bg-bread-100 text-bread-600 rounded">
          {methodName}
        </span>
        {sourceInfo && (
          <span className={`text-xs px-2 py-1 ${sourceInfo.bgColor} ${sourceInfo.color} rounded flex items-center gap-1`}>
            <sourceInfo.Icon size={10} />
            {sourceInfo.type === 'youtube' ? 'YouTube' : sourceInfo.type}
          </span>
        )}
      </div>

      {recipe.notes && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {recipe.notes}
        </p>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>재료: {ingredientCount}개</p>
        {recipe.totalTime && (
          <p>소요시간: {recipe.totalTime}분</p>
        )}
        {recipe.difficulty && (
          <p>난이도: {recipe.difficulty}</p>
        )}
      </div>
    </div>
  )
})

RecipeCard.displayName = 'RecipeCard'

export default RecipeCard