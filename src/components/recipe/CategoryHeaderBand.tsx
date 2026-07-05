/**
 * CategoryHeaderBand - 레시피 카테고리 헤더밴드 (H2)
 *
 * 카테고리별 옅은 그라디언트 밴드 + 대형 lucide 아이콘. 카드/뷰 상단 장식.
 * 메타는 constants/recipeMeta 의 SSOT 를 단일 소스로 사용한다.
 * (사용자 결정: 완성품 이미지 필드 없이 아이콘 헤더밴드만 구현)
 */
import { getCategoryMeta } from '@/constants/recipeMeta'

interface CategoryHeaderBandProps {
  category?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_MAP = {
  sm: { band: 'h-14', icon: 'w-7 h-7' },
  md: { band: 'h-20', icon: 'w-10 h-10' },
  // lg(상세뷰): 아이콘만 있는 장식 밴드라 과도한 높이는 공간 낭비 -> 슬림하게
  lg: { band: 'h-20 md:h-24', icon: 'w-11 h-11 md:w-12 md:h-12' },
} as const

export default function CategoryHeaderBand({
  category,
  size = 'md',
  className = '',
}: CategoryHeaderBandProps) {
  const meta = getCategoryMeta(category)
  const Icon = meta.Icon
  const s = SIZE_MAP[size]

  return (
    <div
      className={`relative flex items-center justify-center ${meta.gradient} ${s.band} ${className}`}
      aria-hidden="true"
    >
      <Icon className={`${s.icon} ${meta.iconTint} opacity-80`} strokeWidth={1.5} />
    </div>
  )
}
