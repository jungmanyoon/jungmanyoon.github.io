/**
 * 레시피 카테고리 메타 SSOT (Single Source Of Truth)
 *
 * 기존에 RecipeCard.tsx / HomePage.tsx 에 이모지 CATEGORY_ICONS 가 중복·불일치로
 * 정의돼 있던 것을 하나로 통합한다. 아이콘은 lucide 컴포넌트 참조(값)로 저장하므로
 * JSX 렌더가 아니라 .ts 로 충분하다.
 *
 * 색상 전략: "하이브리드 미세 tint" - 뉴트럴/amber 기조를 유지하되 카테고리별로
 * 옅은 그라디언트 tint(100 -> 50)만 차등을 둔다. de-amber 정책과 정합.
 *
 * CRITICAL: gradient/iconTint 는 반드시 완전한 리터럴 클래스 문자열이어야 한다.
 * Tailwind purge 는 소스의 정적 문자열만 스캔하므로 `from-${x}` 식 보간은 빌드에서 유실된다.
 */
import type { LucideIcon } from 'lucide-react'
import { Wheat, Croissant, CakeSlice, Cookie, IceCream, Candy, Soup } from 'lucide-react'
import type { RecipeCategory } from '@/types/recipe.types'

export interface RecipeCategoryMeta {
  /** i18n 라벨 키 (category.*) */
  labelKey: string
  /** lucide 아이콘 컴포넌트 참조 */
  Icon: LucideIcon
  /** 헤더밴드용 전체 그라디언트 클래스 (리터럴) */
  gradient: string
  /** 아이콘 색 클래스 (리터럴) */
  iconTint: string
}

export const RECIPE_CATEGORY_META: Record<RecipeCategory, RecipeCategoryMeta> = {
  bread: {
    labelKey: 'category.bread',
    Icon: Wheat,
    gradient: 'bg-gradient-to-br from-amber-100 to-amber-50',
    iconTint: 'text-amber-700',
  },
  pastry: {
    labelKey: 'category.pastry',
    Icon: Croissant,
    gradient: 'bg-gradient-to-br from-orange-100 to-amber-50',
    iconTint: 'text-orange-700',
  },
  cake: {
    labelKey: 'category.cake',
    Icon: CakeSlice,
    gradient: 'bg-gradient-to-br from-rose-100 to-pink-50',
    iconTint: 'text-rose-700',
  },
  cookie: {
    labelKey: 'category.cookie',
    // 빵(amber)과 구분되도록 구운 비스킷 톤(stone/tan)으로 분리 - 웜톤 군집서 명확히 차별
    Icon: Cookie,
    gradient: 'bg-gradient-to-br from-stone-200 to-amber-50',
    iconTint: 'text-stone-600',
  },
  dessert: {
    labelKey: 'category.dessert',
    Icon: IceCream,
    gradient: 'bg-gradient-to-br from-purple-100 to-fuchsia-50',
    iconTint: 'text-purple-700',
  },
  confectionery: {
    labelKey: 'category.confectionery',
    Icon: Candy,
    gradient: 'bg-gradient-to-br from-pink-100 to-rose-50',
    iconTint: 'text-pink-700',
  },
  savory: {
    labelKey: 'category.savory',
    Icon: Soup,
    gradient: 'bg-gradient-to-br from-emerald-100 to-teal-50',
    iconTint: 'text-emerald-700',
  },
}

/** 미지 카테고리 폴백 (bread 기조 = 브랜드 amber) */
export const DEFAULT_CATEGORY_META: RecipeCategoryMeta = RECIPE_CATEGORY_META.bread

/** 카테고리 메타 조회 (미지 값이면 폴백) */
export const getCategoryMeta = (category?: string): RecipeCategoryMeta =>
  RECIPE_CATEGORY_META[category as RecipeCategory] ?? DEFAULT_CATEGORY_META
