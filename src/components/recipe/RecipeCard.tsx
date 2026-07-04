import React, { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Recipe, BreadMethod, SourceType } from '@/types/recipe.types'
import { Pencil, Youtube, BookOpen, Globe, User, GraduationCap } from 'lucide-react'
import { toast } from '@utils/toast'
import { useLocalization } from '@/hooks/useLocalization'

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

// 제법 키 매핑 (i18n 키로 변환)
const METHOD_KEYS: Record<BreadMethod, string> = {
  straight: 'method.straight',
  sponge: 'method.sponge',
  poolish: 'method.poolish',
  biga: 'method.biga',
  tangzhong: 'method.tangzhong',
  autolyse: 'method.autolyse',
  overnight: 'method.retard',
  'no-time': 'method.straight',
  sourdough: 'productType.sourdough'
} as const

// 카테고리 키 매핑 (i18n 키로 변환)
const CATEGORY_KEYS: Record<string, string> = {
  bread: 'dashboard.bread',
  cake: 'dashboard.cake',
  cookie: 'productType.cookie',
  pastry: 'productType.danish',
  dessert: 'dashboard.cake',
  confectionery: 'dashboard.cake',
  savory: 'dashboard.bread'
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
  const { t } = useTranslation()
  const { getLocalizedSourceName, getLocalizedRecipeName } = useLocalization()

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
      const key = METHOD_KEYS[methodType as BreadMethod] || 'method.straight';
      return t(key);
    }
    // method가 문자열인 경우 (기존 형식)
    const key = METHOD_KEYS[recipe.method as BreadMethod] || 'method.straight';
    return t(key);
  }, [recipe.method, t])

  // 카테고리 이름 메모이제이션
  const categoryName = useMemo(() => {
    const key = CATEGORY_KEYS[recipe.category] || 'dashboard.bread';
    return t(key);
  }, [recipe.category, t])

  // 출처 정보 메모이제이션
  const sourceInfo = useMemo(() => {
    if (!recipe.source) return null
    const config = SOURCE_CONFIG[recipe.source.type] || SOURCE_CONFIG.other
    return {
      name: getLocalizedSourceName(recipe.source),
      type: recipe.source.type,
      url: recipe.source.url,
      Icon: config.icon,
      color: config.color,
      bgColor: config.bgColor
    }
  }, [recipe.source, getLocalizedSourceName])

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
    toast.success(t('message.recipeDeleted'), {
      duration: 5000,
      action: onRestore ? {
        label: t('message.undo'),
        onClick: () => {
          onRestore(recipeToRestore)
        }
      } : undefined
    })
  }, [recipe, onDelete, onRestore, t])

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
        className="relative bg-surface-paper border border-line rounded-lg p-3 hover:shadow-md hover:border-line transition-all"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-lg flex-shrink-0" aria-label={categoryName}>
              {categoryIcon}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-ink">
                {/* 카드 전체를 클릭 영역으로 확장하는 stretched button (중첩 인터랙티브 해소) */}
                <button
                  type="button"
                  onClick={handleSelect}
                  aria-label={getLocalizedRecipeName(recipe)}
                  className="block w-full truncate text-left cursor-pointer rounded-lg after:absolute after:inset-0 after:content-[''] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  {getLocalizedRecipeName(recipe)}
                </button>
              </h3>
              {sourceInfo && (
                <div className="relative z-10 flex items-center gap-1 mt-0.5 text-ink-subtle">
                  <sourceInfo.Icon size={10} className={sourceInfo.color} />
                  <span className="text-[10px] truncate">{sourceInfo.name}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-1 ml-2 relative z-10">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="text-ink-disabled hover:text-ink-muted transition-colors p-2 -m-1 flex items-center justify-center min-w-[44px] min-h-[44px]"
                aria-label={t('recipeList.editRecipe')}
                type="button"
              >
                <Pencil size={14} />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="text-ink-disabled hover:text-danger transition-colors text-lg leading-none p-2 -m-1 flex items-center justify-center min-w-[44px] min-h-[44px]"
              aria-label={t('recipeList.deleteRecipe')}
              type="button"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-ink-muted">
          <span>{methodName}</span>
          <span>{t('recipeList.ingredientCount', { count: ingredientCount })}</span>
        </div>
      </div>
    )
  }
  
  // 기본 카드 뷰 렌더링
  return (
    <div
      className="card relative hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          {/* 모바일: text-base(16px), 데스크톱: text-lg(18px) 유지 + 긴 이름 줄바꿈 처리 */}
          <h3 className="text-base sm:text-lg font-semibold text-ink break-words">
            {/* 카드 전체를 클릭 영역으로 확장하는 stretched button (중첩 인터랙티브 해소) */}
            <button
              type="button"
              onClick={handleSelect}
              aria-label={getLocalizedRecipeName(recipe)}
              className="block w-full text-left break-words cursor-pointer rounded-lg after:absolute after:inset-0 after:content-[''] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {getLocalizedRecipeName(recipe)}
            </button>
          </h3>
          {sourceInfo && (
            <div className="relative z-10 flex items-center gap-1 mt-1 text-ink-subtle">
              <sourceInfo.Icon size={12} className={sourceInfo.color} />
              <span className="text-xs">{sourceInfo.name}</span>
            </div>
          )}
        </div>
        <div className="flex gap-1 ml-2 relative z-10">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="text-ink-disabled hover:text-ink-muted transition-colors p-2 -m-1 flex items-center justify-center min-w-[44px] min-h-[44px]"
              aria-label={t('recipeList.editRecipe')}
              type="button"
            >
              <Pencil size={16} />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="text-ink-disabled hover:text-danger transition-colors text-lg leading-none p-2 -m-1 flex items-center justify-center min-w-[44px] min-h-[44px]"
            aria-label={t('recipeList.deleteRecipe')}
            type="button"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-xs px-2 py-1 bg-surface-muted text-ink-muted rounded">
          {categoryName}
        </span>
        <span className="text-xs px-2 py-1 bg-surface-muted text-ink-muted rounded">
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
        <p className="text-sm text-ink-muted mb-3 line-clamp-2">
          {recipe.notes}
        </p>
      )}

      <div className="text-xs text-ink-subtle space-y-1">
        <p>{t('recipeList.ingredients')}: {ingredientCount}</p>
        {recipe.totalTime && (
          <p>{t('recipeList.totalTime')}: {recipe.totalTime}{t('recipeList.minutes')}</p>
        )}
        {recipe.difficulty && (
          <p>{t('recipeList.difficulty')}: {recipe.difficulty}</p>
        )}
      </div>
    </div>
  )
})

RecipeCard.displayName = 'RecipeCard'

export default RecipeCard