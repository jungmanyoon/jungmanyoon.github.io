/**
 * AdvancedDashboard - 제과제빵 전문가용 통합 레시피 변환 대시보드 v2
 *
 * 페르소나: --persona-frontend (UI/UX) + --persona-backend (데이터) + 제과제빵 도메인 전문가
 *
 * v2 개선사항:
 * - 팬 설정 변경 → 배수 자동 연동
 * - 동적 크기 최적화 (20-25개 재료 기준)
 * - 메모/공정 별도 하단 패널
 * - 사이드바 너비 확대
 * - 레시피 테이블 컴팩트화
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useRecipeStore } from '@/stores/useRecipeStore';
import { useToastStore } from '@/stores/useToastStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import { useLocalization } from '@/hooks/useLocalization';
import ResizeHandle from '@/components/common/ResizeHandle';
import AutocompleteInput from '@/components/common/AutocompleteInput';
import BulkIngredientInput from '@/components/common/BulkIngredientInput';
import YieldLossCalculator from '@/components/common/YieldLossCalculator';
import PhaseIngredientsView from '@/components/recipe/PhaseIngredientsView';
import { ProcessStageSelection, DEFAULT_STAGE_SELECTION } from '@/utils/calculations/yieldLoss';
import { findIngredientInfo } from '@/data/ingredientDatabase';
import {
  ChevronDown, ChevronRight, ChevronUp, Plus, Minus, X,
  Save, Flame, Scale, Wheat, Droplets, TrendingDown,
  Cookie, Layers, ThermometerSun, Link, Unlink,
  Clock, ListOrdered, RotateCcw, GripVertical, Copy, FileText,
  Youtube, Globe, BookOpen, User, GraduationCap
} from 'lucide-react';
import { SourceType } from '@types/recipe.types';

// ============================================
// 타입 정의
// ============================================

interface PanEntry {
  id: string;
  mode: 'pan' | 'count';  // 팬 모드 / 개수 모드
  // 팬 모드 필드
  category: string;
  type: string;
  quantity: number;
  divisionCount: number;
  panWeight: number;
  divisionWeight: number;
  // 개수 모드 필드 (모닝빵 등)
  unitCount?: number;    // 개수
  unitWeight?: number;   // 개당 중량(g)
}

interface OvenSettings {
  type: 'convection' | 'deck' | 'airfryer';
  level: string;
  firstBake: { topTemp: number; bottomTemp: number; time: number };
  secondBake: { topTemp: number; bottomTemp: number; time: number };
}

interface MethodSettings {
  type: 'straight' | 'sponge' | 'poolish' | 'biga' | 'tangzhong' | 'autolyse' | 'levain' | 'coldFerment' | 'retard';
  flourRatio: number;
  waterRatio: number;
  yeastAdjustment: number;      // 전체 이스트 조정 계수 (1.0 = 100%)
  prefermentYeastRatio: number; // 사전반죽에 들어가는 이스트 비율 (0.0~1.0)
}

interface IngredientEntry {
  id: string;
  order: number;
  category: 'flour' | 'liquid' | 'wetOther' | 'other';
  subCategory: string;
  name: string;
  ratio: number;
  amount: number;
  note: string;
  moistureContent?: number;
  phase?: string;  // 'tangzhong', 'preferment', 'main', 'topping' 등
  phaseOrder?: number;  // 단계 내 순서
}

interface ProcessStep {
  id: string;
  order: number;
  description: string;
  time?: number;
  temp?: number;
}

// ============================================
// 상수 데이터
// ============================================

// 팬 데이터는 컴포넌트 내부에서 useSettingsStore를 통해 동적으로 생성됨
// (PAN_DATA는 AdvancedDashboard 컴포넌트 내 useMemo로 관리)

// 제빵용 비용적 (cm³/g) - 학술 기준 참조
// 비용적이 높을수록 가볍고 에어리, 낮을수록 조밀함
const BREAD_SPECIFIC_VOLUMES: Record<string, number> = {
  '풀먼식빵': 3.4,      // 뚜껑 덮어 구움 → 조밀 (제과기능장 기준)
  '산형식빵': 4.2,      // 자유롭게 부풀음 → 에어리 (4.0~4.5)
  '버터톱식빵': 4.0,    // 산형 계열
  '옥수수식빵': 3.8,    // 중간
  '우유식빵': 4.0,      // 산형 계열
  '모닝빵': 3.2,        // 소형빵
  '베이글': 2.5,        // 매우 조밀 (삶는 공정)
  '브리오슈': 3.5,      // 버터 풍부, 중간 밀도
  '치아바타': 5.0,      // 고수화율 80%, 큰 기공
  '바게트': 5.5,        // 크러스트 비율 높음, 에어리
};

// 제과용 반죽 비중 (Specific Gravity) - 국내 제과제빵 기준
// 반죽 비중 = 반죽 무게 ÷ 물 무게 (같은 컵 사용), 낮을수록 공기 많음
const CAKE_BATTER_SPECIFIC_GRAVITY: Record<string, number> = {
  '파운드케이크': 0.83,     // 대한제과협회: 0.80-0.85 범위 중간값
  '레이어케이크': 0.83,     // 반죽형 케이크: 0.80-0.85
  '스펀지케이크': 0.55,     // 버터 스펀지(제누와즈): 0.50-0.60
  '시폰케이크': 0.45,       // 시폰/롤케이크: 0.40-0.50
  '엔젤푸드케이크': 0.40,   // 가장 가벼운 반죽 (추정)
  '무스케이크': 0.90,       // 무거운 반죽 (추정)
};

// 제과용 구운 후 비용적 (cm³/g) - 팬 계산용
// 반죽 비중 → 구운 후 비용적 변환 (대략적 추정)
const CAKE_SPECIFIC_VOLUMES: Record<string, number> = {
  '파운드케이크': 2.5,      // ScienceDirect 2025: 2.1-2.8 범위
  '레이어케이크': 2.5,      // 에멀전 케이크: 2.2-2.3
  '스펀지케이크': 2.3,      // 반죽비중 0.55 기준 추정
  '시폰케이크': 3.2,        // 반죽비중 0.45 기준 추정
  '엔젤푸드케이크': 4.5,    // 가장 가벼운 케이크
  '무스케이크': 1.8,        // 매우 조밀함
};

// 제과 제품 판별 헬퍼 함수
const isPastryProduct = (productName: string): boolean => {
  return Object.keys(CAKE_BATTER_SPECIFIC_GRAVITY).includes(productName);
};

// 현재 화면은 제빵용 - 동적 비용적은 컴포넌트 내부에서 useMemo로 생성됨
// (기본값 BREAD_SPECIFIC_VOLUMES + 설정 스토어의 오버라이드)

// 팬 카테고리/타입 유효성 검증 헬퍼 함수는 컴포넌트 내부에서 동적 PAN_DATA와 함께 정의됨

// 제법 비율 (ChainBaker, Weekend Bakery 참조)
// flour: 전체 밀가루 중 사전반죽에 사용할 비율
// water: 사전반죽 밀가루 대비 수분 비율 (베이커스 퍼센트)
const METHOD_RATIOS: Record<string, { flour: number; water: number }> = {
  straight: { flour: 0, water: 0 },
  sponge: { flour: 0.5, water: 0.6 },       // 중종법: 밀가루 50%, 수분 60% (50-80%)
  poolish: { flour: 0.3, water: 1.0 },      // 폴리쉬: 밀가루 30%, 수분 100% (1:1 액종)
  biga: { flour: 0.3, water: 0.55 },        // 비가: 밀가루 30%, 수분 55% (건조한 반죽)
  tangzhong: { flour: 0.1, water: 5.0 },    // 탕종법: 밀가루 10%, 물 500% (1:5 호화)
  autolyse: { flour: 1.0, water: 0.65 },    // 오토리즈: 전체 밀가루, 수분 65%
  levain: { flour: 0.2, water: 1.0 },       // 르방: 밀가루 20%, 수분 100% (1:1 사워도우)
  coldFerment: { flour: 0, water: 0 },      // 저온발효: 사전반죽 없음 (냉장 발효)
  retard: { flour: 0, water: 0 },           // 저온숙성: 사전반죽 없음 (성형 후 냉장)
};

// 제법별 이스트 조정 기본값 (설정 스토어 fallback용)
// yeastAdjustment: 전체 이스트 조정 계수
// prefermentYeastRatio: 사전반죽에 들어가는 이스트 비율
const DEFAULT_METHOD_YEAST: Record<string, { yeastAdjustment: number; prefermentYeastRatio: number }> = {
  straight: { yeastAdjustment: 1.0, prefermentYeastRatio: 0 },
  sponge: { yeastAdjustment: 0.75, prefermentYeastRatio: 1.0 },    // 중종법: 이스트 75%, 전량 사전반죽
  poolish: { yeastAdjustment: 0.66, prefermentYeastRatio: 0.15 },  // 폴리쉬: 이스트 66% (SFBI 권장), 15% 사전반죽
  biga: { yeastAdjustment: 0.50, prefermentYeastRatio: 0.1 },      // 비가: 이스트 50% (SFBI 권장), 10% 사전반죽
  tangzhong: { yeastAdjustment: 1.0, prefermentYeastRatio: 0 },    // 탕종: 이스트 동일, 사전반죽 없음
  autolyse: { yeastAdjustment: 1.0, prefermentYeastRatio: 0 },     // 오토리즈: 이스트 동일, 사전반죽 없음
  levain: { yeastAdjustment: 0, prefermentYeastRatio: 0 },         // 르방: 상업 이스트 미사용
  coldFerment: { yeastAdjustment: 0.4, prefermentYeastRatio: 0 },  // 저온발효: 이스트 40% (장시간 발효로 감량)
  retard: { yeastAdjustment: 1.0, prefermentYeastRatio: 0 },       // 저온숙성: 성형 후 숙성이라 이스트 동일
};

// Translation keys for method labels (used with t() function)
const METHOD_KEYS: Record<string, string> = {
  straight: 'method.straight', sponge: 'method.sponge', poolish: 'method.poolish',
  biga: 'method.biga', tangzhong: 'method.tangzhong', autolyse: 'method.autolyse', levain: 'method.levain',
  coldFerment: 'method.coldFerment', retard: 'method.retard',
};

// Translation keys for category labels (used with t() function)
const CATEGORY_KEYS: Record<string, string> = {
  flour: 'dashboard.flour', liquid: 'dashboard.liquid', wetOther: 'dashboard.fat', other: 'dashboard.other',
};

// 단계(Phase) 메타데이터 - 구분선 표시용 (labelKey for translation)
const PHASE_META: Record<string, { icon: string; labelKey: string; bgColor: string; textColor: string; borderColor: string }> = {
  tangzhong: { icon: '🍜', labelKey: 'phase.tangzhong', bgColor: 'bg-pink-50', textColor: 'text-pink-700', borderColor: 'border-pink-200' },
  preferment: { icon: '🧪', labelKey: 'phase.preferment', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  poolish: { icon: '🧪', labelKey: 'phase.poolish', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  biga: { icon: '🧪', labelKey: 'phase.biga', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  sponge: { icon: '🧪', labelKey: 'phase.sponge', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  levain: { icon: '🥖', labelKey: 'phase.levain', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  autolyse: { icon: '⏳', labelKey: 'phase.autolyse', bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-200' },
  main: { icon: '🍞', labelKey: 'phase.mainDough', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
  topping: { icon: '✨', labelKey: 'phase.topping', bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' },
  filling: { icon: '🎂', labelKey: 'phase.filling', bgColor: 'bg-rose-50', textColor: 'text-rose-700', borderColor: 'border-rose-200' },
  frosting: { icon: '🍰', labelKey: 'phase.frosting', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700', borderColor: 'border-indigo-200' },
  glaze: { icon: '💧', labelKey: 'phase.glaze', bgColor: 'bg-cyan-50', textColor: 'text-cyan-700', borderColor: 'border-cyan-200' },
  other: { icon: '📦', labelKey: 'ingredientCategory.other', bgColor: 'bg-gray-50', textColor: 'text-gray-700', borderColor: 'border-gray-200' },
};

// 동적 크기 계산 (20-25개 재료 기준) - v2.2: 컴팩트 버전
const MAX_INGREDIENTS = 25;
const getDynamicStyles = (ingredientCount: number) => {
  const count = Math.max(ingredientCount, 6);
  const rowHeight = count > 15 ? 'py-0.5' : count > 10 ? 'py-1' : 'py-1';
  const fontSize = count > 20 ? 'text-xs' : count > 15 ? 'text-xs' : 'text-sm';
  return { rowHeight, fontSize };
};

// ============================================
// 접을 수 있는 섹션 컴포넌트
// ============================================

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  badgeColor?: string;
  onReset?: () => void;  // 초기화 콜백
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title, icon, defaultOpen = true, badge, badgeColor = 'bg-amber-100 text-amber-700', onReset, children
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <div className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center gap-2 text-sm font-semibold text-gray-700 text-left"
        >
          {icon}
          <span>{title}</span>
          {badge && (
            <span className={`px-1.5 py-0.5 text-xs rounded ${badgeColor}`}>
              {badge}
            </span>
          )}
        </button>
        <div className="flex items-center gap-1">
          {onReset && (
            <button
              onClick={(e) => { e.stopPropagation(); onReset(); }}
              className="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
              title="초기화"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={() => setIsOpen(!isOpen)} className="p-1">
            {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      </div>
      {isOpen && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
};

// ============================================
// 메인 컴포넌트
// ============================================

const AdvancedDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { translateIngredient, translateProcessStep, getLocalizedPanCategory, getLocalizedPanName, getLocalizedProductName } = useLocalization();
  const { addRecipe, updateRecipe, currentRecipe, recipes } = useRecipeStore();
  const { addToast } = useToastStore();
  const { pan: panSettings, product: productSettings, method: methodSettings } = useSettingsStore();

  // 설정에서 비용적 데이터를 동적으로 생성 (기본값 + 오버라이드)
  const SPECIFIC_VOLUMES = useMemo(() => {
    // 기본값을 복사하고 설정 스토어의 오버라이드 적용
    return {
      ...BREAD_SPECIFIC_VOLUMES,
      ...CAKE_SPECIFIC_VOLUMES,  // 🆕 제과 비용적 추가
      ...productSettings.breadVolumes,
      // 커스텀 제품 추가
      ...productSettings.customProducts
        .filter(p => p.category === 'bread' || p.category === 'pastry')
        .reduce((acc, p) => ({ ...acc, [p.name]: p.specificVolume }), {} as Record<string, number>)
    };
  }, [productSettings.breadVolumes, productSettings.customProducts]);

  // 설정에서 팬 데이터를 동적으로 생성 (카테고리별 그룹화)
  const PAN_DATA = useMemo(() => {
    const grouped: Record<string, { name: string; volume: number }[]> = {};

    // 설정의 모든 팬을 카테고리별로 그룹화
    panSettings.myPans.forEach(pan => {
      const category = pan.category || '기타';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
        name: pan.name,
        volume: pan.volume
      });
    });

    // 빈 카테고리 방지: 최소 하나의 기본 카테고리 보장
    if (Object.keys(grouped).length === 0) {
      grouped['식빵틀'] = [{ name: '기본 식빵틀', volume: 2350 }];
    }

    return grouped;
  }, [panSettings.myPans]);

  // 번역된 카테고리 라벨 (동적으로 생성)
  const CATEGORY_LABELS = useMemo(() => ({
    flour: t('dashboard.flour'),
    liquid: t('dashboard.liquid'),
    wetOther: t('dashboard.fat'),
    other: t('dashboard.other'),
  }), [t]);

  // 번역된 제법 라벨 (동적으로 생성)
  const METHOD_LABELS = useMemo(() => ({
    straight: t('method.straight'),
    sponge: t('method.sponge'),
    poolish: t('method.poolish'),
    biga: t('method.biga'),
    tangzhong: t('method.tangzhong'),
    autolyse: t('method.autolyse'),
    levain: t('method.levain'),
    coldFerment: t('method.coldFerment'),
    retard: t('method.retard'),
  }), [t]);

  // 팬 카테고리 목록 (동적으로 생성)
  const panCategories = useMemo(() => Object.keys(PAN_DATA), [PAN_DATA]);

  // 기본 카테고리 및 팬 타입
  const defaultCategory = panCategories[0] || '식빵틀';
  const defaultPanType = PAN_DATA[defaultCategory]?.[0]?.name || '옥수수 식빵틀 (22.5cm)';
  const defaultPanVolume = PAN_DATA[defaultCategory]?.[0]?.volume || 2350;

  // 팬 카테고리 유효성 검증 헬퍼 함수 (동적 PAN_DATA 사용)
  const getValidPanCategory = useCallback((category: string | undefined): string => {
    if (category && panCategories.includes(category)) {
      return category;
    }
    return defaultCategory;
  }, [panCategories, defaultCategory]);

  // 팬 타입 유효성 검증 헬퍼 함수 (동적 PAN_DATA 사용)
  const getValidPanType = useCallback((category: string, type: string | undefined): string => {
    const panList = PAN_DATA[category];
    if (panList && type) {
      const found = panList.find((p: { name: string; volume: number }) => p.name === type);
      if (found) return type;
    }
    return panList?.[0]?.name || defaultPanType;
  }, [PAN_DATA, defaultPanType]);

  // 레이아웃 설정 (localStorage 자동 저장)
  const {
    settings: layoutSettings,
    setSidebarWidth,
    setProcessPanelHeight,
    setProcessItemSize,
    getProcessItemSize,
    resetSettings: resetLayoutSettings,
  } = useLayoutSettings();

  // 제품 정보
  const [productName, setProductName] = useState(t('advDashboard.defaultRecipeName'));
  const [productType, setProductType] = useState<'bread' | 'pastry'>('bread');

  // 출처 정보
  const [source, setSource] = useState<{
    name: string;
    type: SourceType;
    url?: string;
    author?: string;
  }>({
    name: '',
    type: 'personal',
    url: '',
    author: ''
  });

  // 원래 팬 설정 (레시피 원본) - 비용적으로 계산된 초기값 사용
  // 기본 팬 용량 및 무게 계산 (동적 설정에서 가져옴)
  const initialPanVolume = defaultPanVolume || 2350;
  const defaultPanWeight = Math.round(initialPanVolume / 3.4);  // 비용적 3.4 기준
  const [originalPan, setOriginalPan] = useState({
    mode: 'pan' as 'pan' | 'count',
    category: defaultCategory, type: defaultPanType, quantity: 1, panWeight: defaultPanWeight,
    divisionCount: 1, divisionWeight: defaultPanWeight,  // 분할 정보
    unitCount: 10, unitWeight: 50,  // 개수 모드용
  });

  // 변환 팬 설정 (목표)
  const [pans, setPans] = useState<PanEntry[]>([
    { id: '1', mode: 'pan', category: defaultCategory, type: defaultPanType, quantity: 1, divisionCount: 1, panWeight: defaultPanWeight, divisionWeight: defaultPanWeight, unitCount: 10, unitWeight: 50 }
  ]);

  // 비용적 설정
  const [originalProduct, setOriginalProduct] = useState('산형식빵');
  const [convertedProduct, setConvertedProduct] = useState('산형식빵');

  // 오븐 설정
  const [oven, setOven] = useState<OvenSettings>({
    type: 'convection',
    level: '',  // 빈 값으로 초기화
    firstBake: { topTemp: 200, bottomTemp: 170, time: 24 },
    secondBake: { topTemp: 0, bottomTemp: 0, time: 0 },
  });

  // 제법 설정
  const [method, setMethod] = useState<MethodSettings>({
    type: 'straight',
    flourRatio: 0,
    waterRatio: 0,
    yeastAdjustment: 1.0,
    prefermentYeastRatio: 0
  });
  const [usePreferment, setUsePreferment] = useState(false);

  // 재료 (기본 예시: 식빵 레시피)
  const [ingredients, setIngredients] = useState<IngredientEntry[]>([
    { id: '1', order: 1, category: 'flour', subCategory: '가루', name: '강력분', ratio: 100, amount: 500, note: '' },
    { id: '2', order: 2, category: 'liquid', subCategory: '수분', name: '물', ratio: 70, amount: 350, note: '' },
    { id: '3', order: 3, category: 'other', subCategory: '기타', name: '소금', ratio: 2, amount: 10, note: '' },
    { id: '4', order: 4, category: 'other', subCategory: '기타', name: '이스트', ratio: 1, amount: 5, note: '' },
    { id: '5', order: 5, category: 'other', subCategory: '기타', name: '설탕', ratio: 6, amount: 30, note: '' },
    { id: '6', order: 6, category: 'wetOther', subCategory: '유지', name: '버터', ratio: 10, amount: 50, note: '' },
  ]);

  // 공정 (프로세스)
  const [processes, setProcesses] = useState<ProcessStep[]>([
    { id: '1', order: 1, description: '재료 계량', time: 10 },
    { id: '2', order: 2, description: '1차 믹싱 (저속 3분 → 중속 5분)', time: 8 },
    { id: '3', order: 3, description: '1차 발효 (27°C, 75%)', time: 60, temp: 27 },
    { id: '4', order: 4, description: '분할 및 둥글리기' },
    { id: '5', order: 5, description: '중간 발효', time: 15 },
    { id: '6', order: 6, description: '성형 및 패닝' },
    { id: '7', order: 7, description: '2차 발효 (35°C, 85%)', time: 50, temp: 35 },
    { id: '8', order: 8, description: '굽기', time: 24, temp: 200 },
  ]);

  // 메모
  const [memo, setMemo] = useState('');

  // 현재 편집 중인 공정 ID (편집 중일 때는 원본 표시, 아닐 때는 번역 표시)
  const [editingProcessId, setEditingProcessId] = useState<string | null>(null);

  // 수율 예측 공정 선택 상태
  const [yieldStageSelection, setYieldStageSelection] = useState<ProcessStageSelection>({
    ...DEFAULT_STAGE_SELECTION
  });

  // 중복 로드 방지를 위한 ref (ID + updatedAt으로 변경 감지)
  const lastLoadedRecipeKey = useRef<string | null>(null);

  // ============================================
  // currentRecipe 로드
  // ============================================
  useEffect(() => {
    if (currentRecipe) {
      // ID + updatedAt으로 고유 키 생성 (저장 후 변경사항 반영)
      const recipeKey = `${currentRecipe.id}-${currentRecipe.updatedAt?.toString() || ''}`;

      if (recipeKey === lastLoadedRecipeKey.current) {
        return; // 이미 로드된 동일한 레시피
      }
      lastLoadedRecipeKey.current = recipeKey;

      // 레시피 이름 로드
      setProductName(currentRecipe.name || t('advDashboard.defaultRecipeName'));

      // 제품 타입 로드 (기본값: bread)
      setProductType((currentRecipe as any).productType || 'bread');

      // 출처 정보 로드
      if (currentRecipe.source) {
        setSource({
          name: currentRecipe.source.name || '',
          type: currentRecipe.source.type || 'personal',
          url: currentRecipe.source.url || '',
          author: currentRecipe.source.author || ''
        });
      } else {
        setSource({ name: '', type: 'personal', url: '', author: '' });
      }

      // 재료 로드 (phases가 있으면 phases에서, 없으면 ingredients에서)
      const loadedIngredients: IngredientEntry[] = [];

      // phases가 있는 레시피 (탕종, 사전반죽 등)
      if (currentRecipe.phases && Array.isArray(currentRecipe.phases) && currentRecipe.phases.length > 0) {
        let globalOrder = 1;
        currentRecipe.phases.forEach((phase: any) => {
          if (phase.ingredients && Array.isArray(phase.ingredients)) {
            phase.ingredients.forEach((ing: any, ingIdx: number) => {
              const cat = ing.category || 'other';
              let dashboardCategory: 'flour' | 'liquid' | 'wetOther' | 'other' = 'other';
              let subCat = '기타';

              if (cat === 'flour' || ing.isFlour) {
                dashboardCategory = 'flour';
                subCat = '가루';
              } else if (cat === 'liquid') {
                dashboardCategory = 'liquid';
                subCat = '수분';
              } else if (cat === 'fat') {
                dashboardCategory = 'wetOther';
                subCat = '유지';
              }

              loadedIngredients.push({
                id: ing.id || `${Date.now()}-${phase.id}-${ingIdx}`,
                order: globalOrder++,
                category: dashboardCategory,
                subCategory: subCat,
                name: ing.name || '',
                ratio: ing.percentage || 0,
                amount: parseFloat(ing.amount) || 0,
                note: ing.note || '',
                moistureContent: ing.moistureContent,
                phase: phase.type || phase.id || 'main',  // 단계 타입
                phaseOrder: phase.order || 0,  // 단계 순서
              });
            });
          }
        });
      }
      // phases가 없는 레시피 (일반 레시피)
      else if (currentRecipe.ingredients && Array.isArray(currentRecipe.ingredients)) {
        currentRecipe.ingredients.forEach((ing: any, idx: number) => {
          const cat = ing.category || ing.type || 'other';
          let dashboardCategory: 'flour' | 'liquid' | 'wetOther' | 'other' = 'other';
          let subCat = '기타';

          if (cat === 'flour' || ing.isFlour) {
            dashboardCategory = 'flour';
            subCat = '가루';
          } else if (cat === 'liquid') {
            dashboardCategory = 'liquid';
            subCat = '수분';
          } else if (cat === 'fat') {
            dashboardCategory = 'wetOther';
            subCat = '유지';
          }

          loadedIngredients.push({
            id: ing.id || `${Date.now()}-${idx}`,
            order: idx + 1,
            category: dashboardCategory,
            subCategory: subCat,
            name: ing.name || '',
            ratio: ing.percentage || 0,
            amount: parseFloat(ing.amount) || 0,
            note: ing.note || '',
            moistureContent: ing.moistureContent,
            phase: 'main',  // 기본값: 본반죽
            phaseOrder: 0,
          });
        });
      }

      if (loadedIngredients.length > 0) {
        setIngredients(loadedIngredients);
      }

      // 공정 로드
      if (currentRecipe.steps && Array.isArray(currentRecipe.steps)) {
        const loadedProcesses: ProcessStep[] = currentRecipe.steps.map((step: any, idx: number) => ({
          id: step.id || `${Date.now()}-${idx}`,
          order: step.order || idx + 1,
          description: step.instruction || step.action || step.description || '',
          time: step.duration?.target || step.time,
          temp: step.temperature?.target || step.temp,
        }));
        if (loadedProcesses.length > 0) {
          setProcesses(loadedProcesses);
        }
      }

      // 오븐 설정 로드
      if (currentRecipe.ovenSettings) {
        const ovenData = currentRecipe.ovenSettings as any;
        const secondBakeData = ovenData.secondBake;
        setOven({
          type: ovenData.mode === 'deck' ? 'deck' :
                ovenData.mode === 'airfryer' ? 'airfryer' : 'convection',
          level: ovenData.deck || '',
          firstBake: {
            topTemp: ovenData.temperature || 200,
            bottomTemp: ovenData.bottomTemperature || ovenData.temperature || 170,  // 하부 온도 로드
            time: ovenData.duration || 24,  // 저장된 굽기 시간 로드
          },
          secondBake: secondBakeData ? {
            topTemp: secondBakeData.topTemp || 0,
            bottomTemp: secondBakeData.bottomTemp || 0,
            time: secondBakeData.time || 0,
          } : { topTemp: 0, bottomTemp: 0, time: 0 },
        });
      }

      // 제법 설정 로드
      if (currentRecipe.method) {
        const methodData = currentRecipe.method as any;
        let methodType = methodData.method || methodData.type || 'straight';
        // sourdough는 levain으로 매핑 (동일한 개념)
        if (methodType === 'sourdough') methodType = 'levain';
        // 유효한 제법 타입으로 제한
        const validMethods = ['straight', 'sponge', 'poolish', 'biga', 'tangzhong', 'autolyse', 'levain', 'coldFerment', 'retard'];
        if (!validMethods.includes(methodType)) methodType = 'straight';

        // 설정 스토어에서 해당 제법의 이스트 조정값 가져오기 (없으면 로컬 기본값 사용)
        const methodConfig = methodSettings?.methods?.[methodType];
        const defaultYeast = DEFAULT_METHOD_YEAST[methodType] || { yeastAdjustment: 1.0, prefermentYeastRatio: 0 };
        setMethod({
          type: methodType as 'straight' | 'sponge' | 'poolish' | 'biga' | 'tangzhong' | 'autolyse' | 'levain' | 'coldFerment' | 'retard',
          flourRatio: methodData.prefermentRatio || 0,
          waterRatio: methodData.waterRatio || 0,
          yeastAdjustment: methodConfig?.yeastAdjustment ?? defaultYeast.yeastAdjustment,
          prefermentYeastRatio: methodConfig?.prefermentYeastRatio ?? defaultYeast.prefermentYeastRatio,
        });
        // 중종법, 폴리쉬법 등이면 발효종 사용 활성화
        setUsePreferment(methodType !== 'straight');
      }

      // 팬 설정 로드
      if (currentRecipe.panConfig) {
        const panData = currentRecipe.panConfig as any;
        // 카테고리 유효성 검증 - PAN_DATA에 없는 카테고리는 기본값으로 fallback
        const rawCategory = panData.name || panData.category || defaultCategory;
        const panCategory = getValidPanCategory(rawCategory);
        // 팬 타입 유효성 검증 - 해당 카테고리에 없는 타입은 첫 번째 팬으로 fallback
        const rawType = panData.type || defaultPanType;
        const panType = getValidPanType(panCategory, rawType);
        const panQuantity = panData.quantity || 1;
        const panMode = panData.mode || 'pan';

        // 저장된 팬 무게가 있으면 사용, 없으면 계산
        let panWeight = panData.panWeight;
        if (!panWeight) {
          // 팬 볼륨 찾기
          let panVolume = defaultPanVolume; // 설정의 기본 팬 볼륨
          for (const [, panList] of Object.entries(PAN_DATA)) {
            const found = (panList as any[]).find(p => p.name === panType);
            if (found) {
              panVolume = found.volume;
              break;
            }
          }
          // 비용적 기반 팬 무게 계산 (산형식빵 기준: 4.2)
          const specificVolume = SPECIFIC_VOLUMES[convertedProduct] || 4.2;
          panWeight = Math.round(panVolume / specificVolume);
        }

        // 원래 팬 설정 (저장된 originalPan이 있으면 사용) + 유효성 검증
        if (panData.originalPan) {
          const op = panData.originalPan;
          const unitCount = Math.max(1, op.unitCount || 10);
          const unitWeight = Math.max(1, op.unitWeight || 50);

          // 카테고리/타입 유효성 검증
          const opCategory = getValidPanCategory(op.category);
          const opType = getValidPanType(opCategory, op.type);

          // count 모드일 때 panWeight를 unitCount × unitWeight로 재계산
          let calculatedPanWeight = Math.abs(op.panWeight || 500);
          if (op.mode === 'count') {
            calculatedPanWeight = unitCount * unitWeight;
          }

          setOriginalPan({
            ...op,
            category: opCategory,
            type: opType,
            panWeight: calculatedPanWeight,
            quantity: Math.max(1, Math.abs(op.quantity || 1)),
            divisionCount: Math.max(1, op.divisionCount || 1),
            divisionWeight: Math.abs(op.divisionWeight || calculatedPanWeight || 500),
            unitCount: unitCount,
            unitWeight: unitWeight,
          });
        } else {
          setOriginalPan(prev => ({
            ...prev,
            mode: panMode as 'pan' | 'count',
            category: panCategory,
            type: panType,
            quantity: Math.max(1, panQuantity),
            panWeight: Math.abs(panWeight || 500),
            divisionWeight: Math.abs(panWeight || 500),
          }));
        }

        // 변환 팬 설정 (저장된 전체 팬 배열이 있으면 사용)
        if (panData.pans && Array.isArray(panData.pans) && panData.pans.length > 0) {
          // 저장된 팬 배열 복원 + 유효성 검증 (음수 방지 + 카테고리/타입 검증)
          const validatedPans = panData.pans.map((p: any) => {
            const pUnitCount = Math.max(1, p.unitCount || 10);
            const pUnitWeight = Math.max(1, p.unitWeight || 50);
            // 카테고리/타입 유효성 검증
            const pCategory = getValidPanCategory(p.category);
            const pType = getValidPanType(pCategory, p.type);
            // count 모드일 때 panWeight를 unitCount × unitWeight로 재계산
            let pPanWeight = Math.abs(p.panWeight || 500);
            if (p.mode === 'count') {
              pPanWeight = pUnitCount * pUnitWeight;
            }
            return {
              ...p,
              category: pCategory,
              type: pType,
              panWeight: pPanWeight,
              quantity: Math.max(1, Math.abs(p.quantity || 1)),
              divisionCount: Math.max(1, p.divisionCount || 1),
              divisionWeight: Math.abs(p.divisionWeight || pPanWeight || 500),
              unitCount: pUnitCount,
              unitWeight: pUnitWeight,
            };
          });
          setPans(validatedPans);
        } else {
          // 이전 형식 호환: 단일 팬으로 복원
          setPans([{
            id: '1',
            mode: panMode as 'pan' | 'count',
            category: panCategory,
            type: panType,
            quantity: Math.max(1, panQuantity),
            divisionCount: 1,
            panWeight: Math.abs(panWeight || 500),
            divisionWeight: Math.abs(panWeight || 500),
            unitCount: 10,
            unitWeight: 50,
          }]);
        }
      }

      // 비용적 설정 로드
      if (currentRecipe.specificVolume) {
        const svData = currentRecipe.specificVolume as any;
        if (svData.original) setOriginalProduct(svData.original);
        if (svData.converted) setConvertedProduct(svData.converted);
      } else if (currentRecipe.tags && Array.isArray(currentRecipe.tags)) {
        // 이전 형식: tags에서 비용적 추출 시도
        const svFromTags = currentRecipe.tags.find((t: string) =>
          SPECIFIC_VOLUMES[t] !== undefined
        );
        if (svFromTags) {
          setOriginalProduct(svFromTags);
          setConvertedProduct(svFromTags);
        }
      }

      // 배수 설정 로드 + 유효성 검증 (음수/0 방지)
      if (currentRecipe.multiplierConfig) {
        const mcData = currentRecipe.multiplierConfig as any;
        if (typeof mcData.multiplier === 'number') {
          // 배수는 최소 0.01 이상 보장
          setMultiplier(Math.max(0.01, Math.abs(mcData.multiplier) || 1));
        }
        if (typeof mcData.isPanLinked === 'boolean') setIsPanLinked(mcData.isPanLinked);
      }

      // 메모 로드
      if (currentRecipe.notes) {
        setMemo(currentRecipe.notes);
      }

      // 수율 예측 공정 선택 상태 로드
      if ((currentRecipe as any).yieldStageSelection) {
        setYieldStageSelection({
          ...DEFAULT_STAGE_SELECTION,
          ...(currentRecipe as any).yieldStageSelection
        });
      } else {
        // 저장된 상태가 없으면 기본값으로 리셋
        setYieldStageSelection({ ...DEFAULT_STAGE_SELECTION });
      }

      // 로드 완료 알림
      addToast({ type: 'success', message: t('advDashboard.recipeLoaded', { name: currentRecipe.name }) });
    }
  }, [currentRecipe]);

  // 배수 및 연동 설정
  const [multiplier, setMultiplier] = useState(1);
  const [isPanLinked, setIsPanLinked] = useState(true); // 팬-배수 연동 여부
  const [multiplierInput, setMultiplierInput] = useState('1'); // 배수 입력 필드

  /**
   * 배수 입력 파싱 (다양한 형식 지원)
   * x2, 2x, 2배, ×2, *2 → 2
   * /2, 1/2, ÷2 → 0.5
   * 0.5, .5 → 0.5
   */
  const parseMultiplierInput = useCallback((input: string): number | null => {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return null;

    // x2, 2x, ×2, *2, 2배 형식
    let match = trimmed.match(/^[x×*]?\s*(\d+\.?\d*)\s*[x×배]?$/);
    if (match) {
      const val = parseFloat(match[1]);
      if (!isNaN(val) && val > 0) return val;
    }

    // /2, ÷2 형식 (나누기)
    match = trimmed.match(/^[/÷]\s*(\d+\.?\d*)$/);
    if (match) {
      const val = parseFloat(match[1]);
      if (!isNaN(val) && val > 0) return 1 / val;
    }

    // 1/2, 1/3 분수 형식
    match = trimmed.match(/^(\d+)\s*[/÷]\s*(\d+)$/);
    if (match) {
      const num = parseFloat(match[1]);
      const den = parseFloat(match[2]);
      if (!isNaN(num) && !isNaN(den) && den > 0) return num / den;
    }

    // 순수 숫자
    const numVal = parseFloat(trimmed);
    if (!isNaN(numVal) && numVal > 0) return numVal;

    return null;
  }, []);

  // 배수 입력 처리
  const handleMultiplierInputChange = useCallback((value: string) => {
    setMultiplierInput(value);
  }, []);

  // 배수 입력 확정 (Enter 또는 blur)
  const handleMultiplierInputConfirm = useCallback(() => {
    const parsed = parseMultiplierInput(multiplierInput);
    if (parsed !== null) {
      const clamped = Math.max(0.01, Math.min(100, parsed));
      setMultiplier(Math.round(clamped * 100) / 100);
      setMultiplierInput(String(Math.round(clamped * 100) / 100));
    } else {
      // 파싱 실패 시 현재 값으로 복원
      setMultiplierInput(String(multiplier));
    }
  }, [multiplierInput, multiplier, parseMultiplierInput]);

  // 빠른 배수 클릭
  const handleQuickMultiplier = useCallback((value: number) => {
    setMultiplier(value);
    setMultiplierInput(String(value));
  }, []);

  // ============================================
  // 계산 함수
  // ============================================

  const flourTotal = useMemo(() =>
    ingredients.filter(i => i.category === 'flour').reduce((sum, i) => sum + i.amount, 0),
    [ingredients]
  );

  const liquidTotal = useMemo(() =>
    ingredients.filter(i => i.category === 'liquid').reduce((sum, i) => sum + i.amount, 0),
    [ingredients]
  );

  const wetOtherMoisture = useMemo(() =>
    ingredients.filter(i => i.category === 'wetOther' && i.moistureContent)
      .reduce((sum, i) => sum + (i.amount * (i.moistureContent || 0)), 0),
    [ingredients]
  );

  const totalWeight = useMemo(() =>
    ingredients.reduce((sum, i) => sum + i.amount, 0),
    [ingredients]
  );

  // 재료를 단계(phase)별로 그룹화 - 구분선 표시용
  const ingredientsByPhase = useMemo(() => {
    // 단계 순서 정의 (사전반죽 계열 먼저, 본반죽, 그 다음 토핑 등)
    const phaseOrder: Record<string, number> = {
      tangzhong: 0, preferment: 1, poolish: 1, biga: 1, sponge: 1, levain: 1, autolyse: 2,
      main: 10, topping: 20, filling: 21, frosting: 22, glaze: 23, other: 99
    };

    // 카테고리 순서 정의 (밀가루 → 수분 → 유지 → 기타)
    const categoryOrder: Record<string, number> = {
      flour: 0, liquid: 1, wetOther: 2, other: 3
    };

    // 재료를 단계별로 그룹화
    const grouped = ingredients.reduce((acc, ing) => {
      const phase = ing.phase || 'main';
      if (!acc[phase]) {
        acc[phase] = [];
      }
      acc[phase].push(ing);
      return acc;
    }, {} as Record<string, IngredientEntry[]>);

    // 단계 순서대로 정렬하여 배열로 변환 (각 단계 내에서 카테고리별 정렬)
    const sortedPhases = Object.entries(grouped)
      .sort(([a], [b]) => (phaseOrder[a] ?? 50) - (phaseOrder[b] ?? 50))
      .map(([phase, items]) => ({
        phase,
        items: items.sort((a, b) =>
          (categoryOrder[a.category] ?? 99) - (categoryOrder[b.category] ?? 99)
        )
      }));

    return sortedPhases;
  }, [ingredients]);

  // 단계가 2개 이상인지 (구분선 표시 여부 결정)
  const hasMultiplePhases = ingredientsByPhase.length > 1;

  const hydration = useMemo(() =>
    flourTotal === 0 ? 0 : Math.round(((liquidTotal + wetOtherMoisture) / flourTotal) * 1000) / 10,
    [flourTotal, liquidTotal, wetOtherMoisture]
  );

  // 원래 팬 합계 (레시피 원본 기준) - 음수 방지
  const originalPanTotalWeight = useMemo(() => {
    // count 모드일 때는 unitCount × unitWeight로 직접 계산
    if (originalPan.mode === 'count') {
      return Math.max((originalPan.unitCount || 10) * (originalPan.unitWeight || 50), 1);
    }
    // 팬 모드일 때는 panWeight × quantity
    const weight = Math.abs(originalPan.panWeight || 500);
    const qty = Math.max(1, Math.abs(originalPan.quantity || 1));
    return Math.max(weight * qty, 1);  // 최소 1g
  }, [originalPan.panWeight, originalPan.quantity, originalPan.mode, originalPan.unitCount, originalPan.unitWeight]);

  // 변환 팬 합계 (목표) - 음수 방지
  const panTotalWeight = useMemo(() => {
    const total = pans.reduce((sum, p) => {
      // count 모드일 때는 unitCount × unitWeight로 직접 계산
      if (p.mode === 'count') {
        return sum + ((p.unitCount || 10) * (p.unitWeight || 50));
      }
      // 팬 모드일 때는 panWeight × quantity
      const weight = Math.abs(p.panWeight || 0);
      const qty = Math.abs(p.quantity || 1);
      return sum + (weight * qty);
    }, 0);
    return Math.max(total, 0);
  }, [pans]);

  // 자동 계산된 배수 (팬 연동 시 사용)
  // 핵심: 원래팬 → 변환팬의 비율이 배수가 됨
  // 안전장치: 배수는 항상 양수 (최소 0.01)
  const autoMultiplier = useMemo(() => {
    // 0 또는 음수 방지
    const origWeight = Math.abs(originalPanTotalWeight) || 1;
    const targetWeight = Math.abs(panTotalWeight) || 1;
    if (origWeight === 0) return 1;
    const ratio = targetWeight / origWeight;
    // 최소 0.01, 최대 제한 없음
    return Math.max(0.01, Math.round(ratio * 100) / 100);
  }, [panTotalWeight, originalPanTotalWeight]);

  // 실제 사용할 배수: 연동 시 자동계산, 비연동 시 수동입력
  const effectiveMultiplier = isPanLinked ? autoMultiplier : multiplier;

  // 비용적(convertedProduct) 변경 시 팬 모드인 팬만 panWeight 재계산
  useEffect(() => {
    setPans(prev => prev.map(pan => {
      // 개수 모드는 비용적 영향 없음
      if (pan.mode === 'count') return pan;

      const panInfo = PAN_DATA[pan.category as keyof typeof PAN_DATA]?.find(p => p.name === pan.type);
      if (panInfo) {
        const newWeight = Math.round(panInfo.volume / (SPECIFIC_VOLUMES[convertedProduct] || 3.4));
        return {
          ...pan,
          panWeight: newWeight,
          divisionWeight: Math.round(newWeight / pan.divisionCount)
        };
      }
      return pan;
    }));
  }, [convertedProduct]);

  // 원래 팬 비용적(originalProduct) 변경 시 originalPan의 panWeight 재계산
  useEffect(() => {
    // 개수 모드는 비용적 영향 없음
    if (originalPan.mode === 'count') return;

    const panInfo = PAN_DATA[originalPan.category as keyof typeof PAN_DATA]?.find(p => p.name === originalPan.type);
    if (panInfo) {
      const newWeight = Math.round(panInfo.volume / (SPECIFIC_VOLUMES[originalProduct] || 3.4));
      setOriginalPan(prev => ({
        ...prev,
        panWeight: newWeight,
        divisionWeight: Math.round(newWeight / prev.divisionCount)
      }));
    }
  }, [originalProduct, originalPan.mode, originalPan.category, originalPan.type]);

  // 원래 팬 모드 변경 시 변환 팬도 같은 모드로 변경
  useEffect(() => {
    setPans(prev => prev.map(pan => {
      if (pan.mode === originalPan.mode) return pan;

      const updated = { ...pan, mode: originalPan.mode };

      if (originalPan.mode === 'count') {
        // 개수 모드로 변경: unitCount * unitWeight
        updated.panWeight = (updated.unitCount || 10) * (updated.unitWeight || 50);
        updated.divisionCount = 1;
        updated.divisionWeight = updated.panWeight;
      } else {
        // 팬 모드로 변경: 팬 볼륨 / 비용적
        const panInfo = PAN_DATA[updated.category as keyof typeof PAN_DATA]?.find(p => p.name === updated.type);
        if (panInfo) {
          updated.panWeight = Math.round(panInfo.volume / (SPECIFIC_VOLUMES[convertedProduct] || 3.4));
          updated.divisionWeight = Math.round(updated.panWeight / updated.divisionCount);
        }
      }

      return updated;
    }));
  }, [originalPan.mode, convertedProduct]);

  const convertedTotal = useMemo(() => Math.round(totalWeight * effectiveMultiplier), [totalWeight, effectiveMultiplier]);

  // 손실률 계산
  const lossRate = useMemo(() => {
    if (convertedTotal === 0) return 0;
    return Math.round((panTotalWeight / convertedTotal) * 1000) / 10;
  }, [panTotalWeight, convertedTotal]);

  // 변환된 재료
  const convertedIngredients = useMemo(() =>
    ingredients.map(ing => ({
      ...ing,
      convertedAmount: Math.round(ing.amount * effectiveMultiplier * 10) / 10,
    })),
    [ingredients, effectiveMultiplier]
  );

  // 사전반죽 재료
  // 핵심: 각 밀가루를 개별적으로 처리하여 비율대로 분배
  const prefermentIngredients = useMemo(() => {
    if (!usePreferment || method.type === 'straight') return [];
    const result: any[] = [];

    // 1. 각 밀가루를 개별적으로 처리 (강력분, 옥수수전분 등 각각)
    const flourItems = ingredients.filter(i => i.category === 'flour');

    if (flourItems.length === 0) return [];

    // 2. 각 밀가루에 flourRatio 적용하여 사전반죽 밀가루 생성
    flourItems.forEach(flour => {
      const prefermentFlourAmount = Math.round(flour.amount * method.flourRatio * effectiveMultiplier * 10) / 10;
      if (prefermentFlourAmount > 0) {
        result.push({
          id: `pref-${flour.id}`,
          name: flour.name,
          category: 'flour',
          convertedAmount: prefermentFlourAmount,
        });
      }
    });

    // 3. 사전반죽 수분 = 사전반죽 밀가루(배수적용전) × waterRatio (단일 항목)
    const totalFlour = flourItems.reduce((sum, flour) => sum + flour.amount, 0);
    const prefermentFlourBase = totalFlour * method.flourRatio;
    const prefermentWaterAmount = Math.round(prefermentFlourBase * method.waterRatio * effectiveMultiplier * 10) / 10;
    if (prefermentWaterAmount > 0) {
      result.push({
        id: 'pref-water',
        name: '물',
        category: 'liquid',
        convertedAmount: prefermentWaterAmount,
      });
    }

    // 4. 이스트 - 제법별 설정 사용 (prefermentYeastRatio)
    // - 오토리즈, 탕종, 르방: 사전반죽에 이스트 없음 (prefermentYeastRatio = 0)
    // - 중종법: 전량(100%) 사전반죽에 (prefermentYeastRatio = 1.0)
    // - 폴리쉬/비가: 극소량(10-15%) 사전반죽에
    const totalYeast = ingredients
      .filter(i => i.name.includes('이스트'))
      .reduce((sum, ing) => sum + ing.amount, 0);

    // 제법별 사전반죽 이스트 비율 (method.prefermentYeastRatio 사용)
    const prefermentYeastRatio = method.prefermentYeastRatio ?? 0;

    if (totalYeast > 0 && prefermentYeastRatio > 0) {
      const yeast = ingredients.find(i => i.name.includes('이스트'));
      // 1) 전체 이스트 조정 (yeastAdjustment 적용)
      const adjustedTotalYeast = totalYeast * (method.yeastAdjustment ?? 1.0);
      // 2) 사전반죽에 들어가는 양
      const prefermentYeastAmount = adjustedTotalYeast * prefermentYeastRatio;

      result.push({
        id: 'pref-yeast',
        name: yeast?.name || '인스턴트 드라이이스트',
        category: 'other',
        convertedAmount: Math.round(prefermentYeastAmount * effectiveMultiplier * 10) / 10,
      });
    }

    return result;
  }, [ingredients, method, usePreferment, effectiveMultiplier]);

  // 본반죽 재료
  // 핵심: 같은 카테고리 재료를 합산 후 사전반죽 차감량 계산 (중복 방지)
  const mainDoughIngredients = useMemo(() => {
    if (!usePreferment || method.type === 'straight') return convertedIngredients;

    const result: any[] = [];

    // 1. 총량 계산
    const totalFlour = ingredients.filter(i => i.category === 'flour').reduce((sum, ing) => sum + ing.amount, 0);
    const totalWater = ingredients.filter(i => i.category === 'liquid' && i.name === '물').reduce((sum, ing) => sum + ing.amount, 0);
    const totalYeast = ingredients.filter(i => i.name.includes('이스트')).reduce((sum, ing) => sum + ing.amount, 0);

    // 2. 사전반죽에 들어간 양 계산
    const prefermentFlour = totalFlour * method.flourRatio;
    const prefermentWater = prefermentFlour * method.waterRatio;

    // 제법별 이스트 조정 적용
    const yeastAdjustment = method.yeastAdjustment ?? 1.0;
    const prefermentYeastRatio = method.prefermentYeastRatio ?? 0;
    // 조정된 전체 이스트량
    const adjustedTotalYeast = totalYeast * yeastAdjustment;
    // 사전반죽에 들어간 이스트
    const prefermentYeast = adjustedTotalYeast * prefermentYeastRatio;

    // 3. 본반죽 밀가루 - 각 밀가루를 개별적으로 처리 (강력분, 옥수수전분 등)
    const flourItems = ingredients.filter(i => i.category === 'flour');
    flourItems.forEach(flour => {
      const prefermentAmount = flour.amount * method.flourRatio;
      const mainFlourAmount = Math.round((flour.amount - prefermentAmount) * 10) / 10;
      if (mainFlourAmount > 0) {
        result.push({
          id: `main-${flour.id}`,
          name: flour.name,
          category: 'flour',
          amount: mainFlourAmount,
          convertedAmount: Math.round(mainFlourAmount * effectiveMultiplier * 10) / 10,
        });
      }
    });

    // 4. 본반죽 물 (총량 - 사전반죽) = 단일 항목
    const mainWaterAmount = Math.round((totalWater - Math.min(totalWater, prefermentWater)) * 10) / 10;
    if (mainWaterAmount > 0) {
      result.push({
        id: 'main-water',
        name: '물',
        category: 'liquid',
        amount: mainWaterAmount,
        convertedAmount: Math.round(mainWaterAmount * effectiveMultiplier * 10) / 10,
      });
    }

    // 5. 나머지 수분(우유 등) - 그대로 포함
    ingredients.filter(i => i.category === 'liquid' && i.name !== '물').forEach(ing => {
      result.push({
        ...ing,
        id: `main-${ing.id}`,
        convertedAmount: Math.round(ing.amount * effectiveMultiplier * 10) / 10,
      });
    });

    // 6. 나머지 재료 (밀가루, 물, 이스트 제외)
    ingredients.filter(i =>
      i.category !== 'flour' &&
      !(i.category === 'liquid' && i.name === '물') &&
      !i.name.includes('이스트')
    ).filter(i => i.category !== 'liquid').forEach(ing => {
      result.push({
        ...ing,
        id: `main-${ing.id}`,
        convertedAmount: Math.round(ing.amount * effectiveMultiplier * 10) / 10,
      });
    });

    // 7. 본반죽 이스트 = 조정된 전체 이스트 - 사전반죽 이스트
    // 예: 폴리쉬 (yeastAdjustment=0.55, prefermentYeastRatio=0.15)
    //     → 본반죽 = 원래이스트 × 0.55 × (1 - 0.15) = 46.75%
    const mainYeastAmount = Math.round((adjustedTotalYeast - prefermentYeast) * 10) / 10;
    if (mainYeastAmount > 0) {
      const yeast = ingredients.find(i => i.name.includes('이스트'));
      result.push({
        id: 'main-yeast',
        name: yeast?.name || '인스턴트 드라이이스트',
        category: 'other',
        amount: mainYeastAmount,
        convertedAmount: Math.round(mainYeastAmount * effectiveMultiplier * 10) / 10,
      });
    }

    return result;
  }, [ingredients, method, usePreferment, effectiveMultiplier, convertedIngredients]);

  const prefermentTotal = useMemo(() =>
    prefermentIngredients.reduce((sum, i) => sum + (i.convertedAmount || 0), 0),
    [prefermentIngredients]
  );

  const mainDoughTotal = useMemo(() =>
    mainDoughIngredients.reduce((sum, i) => sum + (i.convertedAmount || 0), 0),
    [mainDoughIngredients]
  );

  // 원본 레시피의 제법 타입 감지 (phase 속성 기반)
  const originalMethodType = useMemo(() => {
    const prefermentPhases = ['tangzhong', 'poolish', 'biga', 'sponge', 'levain', 'autolyse', 'preferment'];
    const foundPhase = ingredients.find(ing => ing.phase && prefermentPhases.includes(ing.phase));
    return foundPhase?.phase || 'straight';
  }, [ingredients]);

  // 원본 제법과 선택 제법이 같은지 확인
  const isSameMethod = originalMethodType === method.type ||
    (originalMethodType === 'straight' && method.type === 'straight');

  // 변환 재료를 단계별로 그룹화 (사전반죽 + 본반죽을 하나의 테이블에 표시)
  const convertedIngredientsByPhase = useMemo(() => {
    const phaseOrder: Record<string, number> = {
      tangzhong: 0, preferment: 1, poolish: 1, biga: 1, sponge: 1, levain: 1, autolyse: 2,
      main: 10, topping: 20, filling: 21, frosting: 22, glaze: 23, other: 99
    };

    // 카테고리 순서 정의 (밀가루 → 수분 → 유지 → 기타)
    const categoryOrder: Record<string, number> = {
      flour: 0, liquid: 1, wetOther: 2, other: 3
    };

    // 스트레이트법: 모든 재료를 합산하여 'main' 하나로 통합
    if (!usePreferment || method.type === 'straight') {
      const combinedItems: any[] = [];

      // 밀가루 개별 표시 (합산하지 않음 - 강력분, 옥수수전분 등 각각 표시)
      const flourItems = convertedIngredients.filter(i => i.category === 'flour');
      flourItems.forEach(flour => {
        if (flour.convertedAmount > 0) {
          combinedItems.push({
            id: `straight-${flour.id}`,
            name: flour.name,
            category: 'flour',
            convertedAmount: Math.round(flour.convertedAmount * 10) / 10,
          });
        }
      });

      // 수분 합산 (물 / 우유 / 기타 각각)
      const liquidNames = [...new Set(convertedIngredients.filter(i => i.category === 'liquid').map(i => i.name))];
      liquidNames.forEach(name => {
        const total = convertedIngredients
          .filter(i => i.category === 'liquid' && i.name === name)
          .reduce((sum, ing) => sum + ing.convertedAmount, 0);
        if (total > 0) {
          combinedItems.push({
            id: `straight-${name}`,
            name,
            category: 'liquid',
            convertedAmount: Math.round(total * 10) / 10,
          });
        }
      });

      // 나머지 재료 - 같은 이름끼리 합산
      const otherNames = [...new Set(convertedIngredients
        .filter(i => i.category !== 'flour' && i.category !== 'liquid')
        .map(i => i.name))];
      otherNames.forEach(name => {
        const items = convertedIngredients.filter(i => i.name === name && i.category !== 'flour' && i.category !== 'liquid');
        const total = items.reduce((sum, ing) => sum + ing.convertedAmount, 0);
        if (total > 0) {
          combinedItems.push({
            id: `straight-${name}`,
            name,
            category: items[0]?.category || 'other',
            convertedAmount: Math.round(total * 10) / 10,
          });
        }
      });

      // 카테고리별로 정렬
      combinedItems.sort((a, b) =>
        (categoryOrder[a.category] ?? 99) - (categoryOrder[b.category] ?? 99)
      );

      return [{ phase: 'main', items: combinedItems }];
    }

    // ★ 핵심: 원본 제법과 선택 제법이 같으면 원본 그대로 유지
    if (isSameMethod && originalMethodType !== 'straight') {
      // convertedIngredients를 원본 phase 기준으로 그룹화 (값은 이미 effectiveMultiplier 적용됨)
      const grouped = convertedIngredients.reduce((acc, ing) => {
        const phase = ing.phase || 'main';
        if (!acc[phase]) acc[phase] = [];
        acc[phase].push(ing);
        return acc;
      }, {} as Record<string, typeof convertedIngredients>);

      return Object.entries(grouped)
        .sort(([a], [b]) => (phaseOrder[a] ?? 50) - (phaseOrder[b] ?? 50))
        .map(([phase, items]) => ({
          phase,
          items: items.sort((a, b) =>
            (categoryOrder[a.category] ?? 99) - (categoryOrder[b.category] ?? 99)
          )
        }));
    }

    // 제법이 다를 때: prefermentIngredients + mainDoughIngredients 사용
    const result: { phase: string; items: any[] }[] = [];

    if (prefermentIngredients.length > 0) {
      const sortedPreferment = [...prefermentIngredients].sort((a, b) =>
        (categoryOrder[a.category] ?? 99) - (categoryOrder[b.category] ?? 99)
      );
      result.push({
        phase: method.type,
        items: sortedPreferment.map(ing => ({ ...ing, phase: method.type }))
      });
    }

    const mainItems = mainDoughIngredients.filter(ing => (ing.convertedAmount || 0) > 0);
    if (mainItems.length > 0) {
      const sortedMain = mainItems.sort((a, b) =>
        (categoryOrder[a.category] ?? 99) - (categoryOrder[b.category] ?? 99)
      );
      result.push({
        phase: 'main',
        items: sortedMain.map(ing => ({ ...ing, phase: 'main' }))
      });
    }

    return result;
  }, [convertedIngredients, prefermentIngredients, mainDoughIngredients, usePreferment, method.type, isSameMethod, originalMethodType]);

  // 변환 재료에 단계가 2개 이상인지
  const convertedHasMultiplePhases = convertedIngredientsByPhase.length > 1;

  // 동적 스타일
  const dynamicStyles = useMemo(() => getDynamicStyles(ingredients.length), [ingredients.length]);

  // PhaseIngredientsView용 Recipe 객체 생성
  const recipeForPhaseView = useMemo(() => ({
    id: currentRecipe?.id || 'temp',
    name: productName,
    ingredients: ingredients.map(ing => ({
      id: ing.id,
      name: ing.name,
      category: ing.category === 'wetOther' ? 'fat' : ing.category,
      amount: ing.amount,
      unit: 'g' as const,
      bakersPercentage: ing.ratio,
      isFlour: ing.category === 'flour'
    })),
    // phases가 있으면 currentRecipe에서 가져옴
    phases: currentRecipe?.phases
  }), [currentRecipe, productName, ingredients]);

  // ============================================
  // 이벤트 핸들러
  // ============================================

  const handleMethodChange = useCallback((type: string) => {
    const ratios = METHOD_RATIOS[type] || { flour: 0, water: 0 };
    // 설정 스토어에서 해당 제법의 이스트 조정값 가져오기 (없으면 로컬 기본값 사용)
    const methodConfig = methodSettings?.methods?.[type];
    const defaultYeast = DEFAULT_METHOD_YEAST[type] || { yeastAdjustment: 1.0, prefermentYeastRatio: 0 };
    const yeastAdjustment = methodConfig?.yeastAdjustment ?? defaultYeast.yeastAdjustment;
    const prefermentYeastRatio = methodConfig?.prefermentYeastRatio ?? defaultYeast.prefermentYeastRatio;

    setMethod({
      type: type as any,
      flourRatio: ratios.flour,
      waterRatio: ratios.water,
      yeastAdjustment,
      prefermentYeastRatio
    });
    setUsePreferment(type !== 'straight');
    // 원본 레시피(ingredients)는 수정하지 않음
    // 변환 레시피는 prefermentIngredients와 mainDoughIngredients useMemo에서 자동 계산
  }, [methodSettings]);

  // 원래 팬 업데이트
  const updateOriginalPan = useCallback((field: string, value: any) => {
    setOriginalPan(prev => {
      const updated = { ...prev, [field]: value };

      // 모드 변경 시 panWeight 재계산
      if (field === 'mode') {
        if (value === 'count') {
          // 개수 모드: unitCount * unitWeight
          updated.panWeight = (updated.unitCount || 10) * (updated.unitWeight || 50);
        } else {
          // 팬 모드: 팬 볼륨 / 비용적
          const panInfo = PAN_DATA[updated.category as keyof typeof PAN_DATA]?.find(pan => pan.name === updated.type);
          if (panInfo) {
            updated.panWeight = Math.round(panInfo.volume / (SPECIFIC_VOLUMES[originalProduct] || 3.4));
          }
        }
      }

      // 팬 타입 변경 시 panWeight 자동 계산 (팬 모드일 때만)
      if (field === 'type' && updated.mode === 'pan') {
        const panInfo = PAN_DATA[updated.category as keyof typeof PAN_DATA]?.find(pan => pan.name === value);
        if (panInfo) {
          updated.panWeight = Math.round(panInfo.volume / (SPECIFIC_VOLUMES[originalProduct] || 3.4));
        }
      }

      // 카테고리 변경 시 첫 번째 타입으로 설정 (팬 모드일 때만)
      if (field === 'category' && updated.mode === 'pan') {
        const types = PAN_DATA[value as keyof typeof PAN_DATA];
        if (types?.length > 0) {
          updated.type = types[0].name;
          updated.panWeight = Math.round(types[0].volume / (SPECIFIC_VOLUMES[originalProduct] || 3.4));
        }
      }

      // 개수 모드: unitCount 또는 unitWeight 변경 시 panWeight 재계산
      if (updated.mode === 'count' && (field === 'unitCount' || field === 'unitWeight')) {
        updated.panWeight = (updated.unitCount || 0) * (updated.unitWeight || 0);
      }

      // 팬 모드: divisionWeight 계산 (panWeight / divisionCount)
      if (updated.mode === 'pan' && updated.divisionCount > 0) {
        updated.divisionWeight = Math.round(updated.panWeight / updated.divisionCount);
      }

      return updated;
    });
  }, [originalProduct]);

  const addPan = useCallback(() => {
    // 설정의 첫 번째 팬 볼륨 사용, 변환 대상 제품 비용적으로 계산
    const newPanVolume = PAN_DATA[defaultCategory]?.[0]?.volume || 2350;
    const calculatedWeight = Math.round(newPanVolume / (SPECIFIC_VOLUMES[convertedProduct] || 3.4));

    setPans(prev => [...prev, {
      id: Date.now().toString(),
      mode: 'pan',
      category: defaultCategory, type: defaultPanType,
      quantity: 1, divisionCount: 1, panWeight: calculatedWeight, divisionWeight: calculatedWeight,
      unitCount: 10, unitWeight: 50,
    }]);
  }, [convertedProduct, defaultCategory, defaultPanType, PAN_DATA]);

  const removePan = useCallback((id: string) => {
    setPans(prev => prev.length > 1 ? prev.filter(p => p.id !== id) : prev);
  }, []);

  // ===== 초기화 함수들 =====
  // 팬 설정 초기화: 변환 팬을 원래 팬과 동일하게
  const resetPanSettings = useCallback(() => {
    setPans([{
      id: '1',
      mode: originalPan.mode,
      category: originalPan.category,
      type: originalPan.type,
      quantity: originalPan.quantity,
      divisionCount: originalPan.divisionCount,
      panWeight: originalPan.panWeight,
      divisionWeight: originalPan.divisionWeight,
      unitCount: originalPan.unitCount,
      unitWeight: originalPan.unitWeight,
    }]);
    setIsPanLinked(true);
  }, [originalPan]);

  // 비용적 초기화: 변환 비용적을 원래 비용적과 동일하게
  const resetSpecificVolume = useCallback(() => {
    setConvertedProduct(originalProduct);
  }, [originalProduct]);

  // 오븐 초기화: 기본값으로
  const resetOvenSettings = useCallback(() => {
    setOven({
      type: 'convection',
      level: '',
      firstBake: { topTemp: 200, bottomTemp: 170, time: 24 },
      secondBake: { topTemp: 0, bottomTemp: 0, time: 0 },
    });
  }, []);

  // 전체 변환 초기화
  const resetAllConversion = useCallback(() => {
    resetPanSettings();
    resetSpecificVolume();
    resetOvenSettings();
    setMultiplier(1);
  }, [resetPanSettings, resetSpecificVolume, resetOvenSettings]);

  // 레시피 저장 (실제 저장 로직)
  const saveRecipeData = useCallback((overwriteId?: string) => {
    // 저장할 재료 데이터 - 원래 레시피 그대로 저장 (변환값 아님!)
    const ingredientsToSave = ingredients.map((ing, idx) => ({
      id: ing.id || `ing-${Date.now()}-${idx}`,
      name: ing.name,
      amount: ing.amount,  // 원래 레시피 양 저장 (convertedAmount 아님!)
      percentage: ing.ratio,  // 베이커스 퍼센트 저장
      unit: 'g',
      category: ing.category === 'flour' ? 'flour' :
                ing.category === 'liquid' ? 'liquid' :
                ing.category === 'wetOther' ? 'fat' : 'other',
      isFlour: ing.category === 'flour',
      note: ing.note || '',  // 메모 저장
      moistureContent: ing.moistureContent,  // 수분 함량 저장
    }));

    // 저장할 공정 데이터 (로드 형식과 일치하도록)
    const stepsToSave = processes.map((p, idx) => ({
      id: p.id || `step-${Date.now()}-${idx}`,
      order: p.order || idx + 1,
      instruction: p.description,
      time: p.time,
      temp: p.temp,
    }));

    // 저장할 오븐 설정 (로드 형식과 일치하도록)
    const ovenSettingsToSave = {
      temperature: oven.firstBake.topTemp,
      bottomTemperature: oven.firstBake.bottomTemp,  // 하부 온도 추가
      mode: oven.type === 'deck' ? 'deck' : oven.type === 'airfryer' ? 'airfryer' : 'conventional',
      preheating: true,
      deck: oven.level || 'middle',
      duration: oven.firstBake.time,
      // 2차 굽기 설정 추가
      secondBake: oven.secondBake.time > 0 ? {
        topTemp: oven.secondBake.topTemp,
        bottomTemp: oven.secondBake.bottomTemp,
        time: oven.secondBake.time,
      } : null,
    };

    const recipeData = {
      name: productName || t('advDashboard.defaultRecipeName'),
      nameKo: productName,
      productType: productType,  // 🆕 제품 타입 (제빵/제과)
      category: 'bread' as const,
      difficulty: 'intermediate' as const,
      servings: pans.reduce((s, p) => s + p.quantity, 0),
      prepTime: 30,
      totalTime: 60 + oven.firstBake.time + oven.secondBake.time,
      ingredients: ingredientsToSave,
      steps: stepsToSave,
      ovenSettings: ovenSettingsToSave,
      method: {
        method: method.type,
        prefermentRatio: method.flourRatio,
        waterRatio: method.waterRatio,  // 수분 비율 저장 추가
      },
      panConfig: {
        type: pans[0]?.type || defaultPanType,
        name: pans[0]?.category || defaultCategory,  // 카테고리 저장
        quantity: pans.reduce((s, p) => s + p.quantity, 0),
        panWeight: pans[0]?.panWeight,  // 팬 무게 저장
        mode: pans[0]?.mode || 'pan',  // 모드 저장 (pan/count)
        originalPan: originalPan,  // 원래 팬 설정 저장
        pans: pans,  // 전체 팬 배열 저장 (개별 팬 수량 유지)
      },
      // 비용적 설정 저장
      specificVolume: {
        original: originalProduct,
        converted: convertedProduct,
      },
      // 배수 설정 저장
      multiplierConfig: {
        multiplier: multiplier,
        isPanLinked: isPanLinked,
      },
      // 출처 정보
      source: source.name ? {
        name: source.name,
        type: source.type,
        url: source.url || undefined,
        author: source.author || undefined,
      } : undefined,
      tags: [convertedProduct, METHOD_LABELS[method.type]].filter(Boolean),
      notes: memo,
      // 수율 예측 공정 선택 상태
      yieldStageSelection: yieldStageSelection,
      updatedAt: new Date(),
    };

    // 덮어쓰기 또는 현재 레시피 업데이트
    const targetId = overwriteId || currentRecipe?.id;
    if (targetId) {
      updateRecipe(targetId, recipeData as any);
      addToast({ type: 'success', message: t('advDashboard.recipeUpdated', { name: productName }) });
    } else {
      const newRecipe = {
        ...recipeData,
        id: `recipe-${Date.now()}`,
        createdAt: new Date(),
      };
      addRecipe(newRecipe as any);
      addToast({ type: 'success', message: t('advDashboard.recipeSaved', { name: productName }) });
    }
  }, [productName, source, pans, oven, usePreferment, mainDoughIngredients, convertedIngredients, processes, memo, convertedProduct, method, yieldStageSelection, currentRecipe, addRecipe, updateRecipe, addToast]);

  // 레시피 저장 (중복 이름 확인)
  const handleSaveRecipe = useCallback(() => {
    const trimmedName = (productName || t('advDashboard.defaultRecipeName')).trim();

    // 동일한 이름의 기존 레시피 찾기 (현재 편집 중인 레시피 제외)
    const existingRecipe = recipes.find(
      r => r.name?.trim() === trimmedName && r.id !== currentRecipe?.id
    );

    if (existingRecipe) {
      // 중복 이름 발견 - 사용자에게 선택지 제공
      const choice = window.confirm(
        t('advDashboard.duplicateRecipeConfirm', { name: trimmedName })
      );

      if (choice) {
        // 덮어쓰기 선택
        saveRecipeData(existingRecipe.id);
      }
      // 취소 선택 시 아무것도 하지 않음
    } else {
      // 중복 없음 - 바로 저장
      saveRecipeData();
    }
  }, [productName, recipes, currentRecipe?.id, saveRecipeData]);

  // 레시피 내보내기 (JSON)
  const handleExportRecipe = useCallback(() => {
    const exportData = {
      name: productName,
      source: source.name ? source : undefined,
      exportedAt: new Date().toISOString(),
      version: '1.0',
      settings: {
        multiplier: effectiveMultiplier,
        originalTotal: totalWeight,
        convertedTotal,
        panSettings: {
          original: originalPan,
          converted: pans,
        },
        oven,
        method,
        specificVolume: {
          original: originalProduct,
          converted: convertedProduct,
        },
      },
      originalIngredients: ingredients.map(ing => ({
        name: ing.name,
        category: ing.category,
        amount: ing.amount,
        ratio: ing.ratio,
      })),
      convertedIngredients: (usePreferment ? mainDoughIngredients : convertedIngredients).map(ing => ({
        name: ing.name,
        category: ing.category,
        amount: ing.convertedAmount,
      })),
      prefermentIngredients: usePreferment ? prefermentIngredients.map(ing => ({
        name: ing.name,
        amount: ing.convertedAmount,
      })) : [],
      processes: processes.map(p => ({
        description: p.description,
        time: p.time,
        temp: p.temp,
      })),
      memo,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${productName || 'recipe'}_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast({ type: 'success', message: t('advDashboard.recipeExported') });
  }, [productName, source, effectiveMultiplier, totalWeight, convertedTotal, originalPan, pans, oven, method, originalProduct, convertedProduct, ingredients, usePreferment, mainDoughIngredients, convertedIngredients, prefermentIngredients, processes, memo, addToast]);

  // 텍스트로 복사 (일반 사용자용)
  const handleCopyAsText = useCallback(async () => {
    const categoryNames: Record<string, string> = {
      flour: t('ingredientCategory.flour'),
      liquid: t('ingredientCategory.liquid'),
      yeast: t('ingredientCategory.yeast'),
      fat: t('ingredientCategory.fat'),
      sugar: t('ingredientCategory.sugar'),
      dairy: t('ingredientCategory.dairy'),
      egg: t('ingredientCategory.egg'),
      salt: t('ingredientCategory.salt'),
      other: t('ingredientCategory.other')
    };

    const ingredientList = (usePreferment ? mainDoughIngredients : convertedIngredients);

    let text = `🍞 ${productName}\n`;
    text += `${'─'.repeat(30)}\n\n`;

    // 기본 정보
    text += `📊 ${t('advDashboard.basicInfo')}\n`;
    text += `• ${t('advDashboard.multiplier')}: ×${effectiveMultiplier}\n`;
    text += `• ${t('advDashboard.original')}: ${totalWeight}g → ${t('advDashboard.converted')}: ${convertedTotal}g\n`;
    text += `• ${t('advDashboard.pan')}: ${pans.map(p => `${p.type} ${p.quantity}`).join(', ')}\n`;
    text += `• ${t('advDashboard.method')}: ${METHOD_LABELS[method.type]}\n\n`;

    // 사전반죽 (있는 경우)
    if (usePreferment && prefermentIngredients.length > 0) {
      text += `🥣 ${t('advDashboard.prefermentIngredients')} (${METHOD_LABELS[method.type]})\n`;
      prefermentIngredients.forEach(ing => {
        text += `• ${translateIngredient(ing.name)}: ${ing.convertedAmount}g\n`;
      });
      text += `\n`;
    }

    // 본반죽 재료
    text += usePreferment ? `🍞 ${t('advDashboard.mainDoughIngredients')}\n` : `🍞 ${t('advDashboard.ingredients')}\n`;
    const categories = [...new Set(ingredientList.map(i => i.category))];
    categories.forEach(cat => {
      const items = ingredientList.filter(i => i.category === cat);
      if (items.length > 0) {
        text += `[${categoryNames[cat] || cat}]\n`;
        items.forEach(ing => {
          text += `• ${translateIngredient(ing.name)}: ${ing.convertedAmount}g\n`;
        });
      }
    });
    text += `\n`;

    // 오븐 설정
    text += `🔥 ${t('advDashboard.ovenSettings')}\n`;
    const ovenType = t(`advDashboard.ovenTypes.${oven.type}`);
    if (oven.type === 'deck') {
      text += `• ${ovenType}: ${t('advDashboard.topHeat')} ${oven.firstBake.topTemp}°C / ${t('advDashboard.bottomHeat')} ${oven.firstBake.bottomTemp}°C, ${oven.firstBake.time}${t('units.minute')}\n`;
    } else {
      text += `• ${ovenType}: ${oven.firstBake.topTemp}°C, ${oven.firstBake.time}${t('units.minute')}\n`;
    }
    if (oven.secondBake.time > 0) {
      text += `• ${t('advDashboard.secondBake')}: ${oven.secondBake.topTemp}°C, ${oven.secondBake.time}${t('units.minute')}\n`;
    }
    text += `\n`;

    // 공정
    text += `📝 ${t('advDashboard.processSteps')}\n`;
    processes.forEach((p, i) => {
      let step = `${i + 1}. ${translateProcessStep(p.description)}`;
      if (p.time) step += ` (${p.time}${t('units.minute')})`;
      if (p.temp) step += ` [${p.temp}°C]`;
      text += `${step}\n`;
    });

    // 메모 (있는 경우)
    if (memo) {
      text += `\n📌 ${t('advDashboard.memo')}\n${memo}\n`;
    }

    text += `\n${'─'.repeat(30)}\n`;
    text += `${t('advDashboard.createdDate')}: ${new Date().toLocaleDateString()}\n`;

    try {
      await navigator.clipboard.writeText(text);
      addToast({ type: 'success', message: t('advDashboard.recipeCopied') });
    } catch (err) {
      // 클립보드 실패 시 다운로드
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${productName || 'recipe'}_${new Date().toISOString().slice(0,10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast({ type: 'success', message: t('advDashboard.recipeSavedAsText') });
    }
  }, [productName, effectiveMultiplier, totalWeight, convertedTotal, pans, method, usePreferment, prefermentIngredients, mainDoughIngredients, convertedIngredients, oven, processes, memo, addToast, translateIngredient, translateProcessStep, t]);

  const updatePan = useCallback((id: string, field: keyof PanEntry, value: any) => {
    setPans(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, [field]: value };

      // 모드 변경 시 panWeight 재계산
      if (field === 'mode') {
        if (value === 'count') {
          // 개수 모드: unitCount * unitWeight
          updated.panWeight = (updated.unitCount || 10) * (updated.unitWeight || 50);
          updated.divisionCount = 1;
          updated.divisionWeight = updated.panWeight;
        } else {
          // 팬 모드: 팬 볼륨 / 비용적
          const panInfo = PAN_DATA[updated.category as keyof typeof PAN_DATA]?.find(pan => pan.name === updated.type);
          if (panInfo) {
            updated.panWeight = Math.round(panInfo.volume / (SPECIFIC_VOLUMES[convertedProduct] || 3.4));
          }
        }
      }

      // 팬 타입 변경 시 panWeight 자동 계산 (변환 대상 비용적 사용)
      if (field === 'type' && updated.mode === 'pan') {
        const panInfo = PAN_DATA[updated.category as keyof typeof PAN_DATA]?.find(pan => pan.name === value);
        if (panInfo) {
          updated.panWeight = Math.round(panInfo.volume / (SPECIFIC_VOLUMES[convertedProduct] || 3.4));
        }
      }

      // 카테고리 변경 시 첫 번째 타입으로 설정
      if (field === 'category' && updated.mode === 'pan') {
        const types = PAN_DATA[value as keyof typeof PAN_DATA];
        if (types?.length > 0) {
          updated.type = types[0].name;
          updated.panWeight = Math.round(types[0].volume / (SPECIFIC_VOLUMES[convertedProduct] || 3.4));
        }
      }

      // 개수 모드: unitCount 또는 unitWeight 변경 시 panWeight 재계산
      if (updated.mode === 'count' && (field === 'unitCount' || field === 'unitWeight')) {
        updated.panWeight = (updated.unitCount || 0) * (updated.unitWeight || 0);
        updated.divisionWeight = updated.panWeight;
      }

      // 팬 모드: divisionWeight는 항상 panWeight / divisionCount로 계산
      if (updated.mode === 'pan' && updated.divisionCount > 0) {
        updated.divisionWeight = Math.round(updated.panWeight / updated.divisionCount);
      }

      return updated;
    }));
  }, [convertedProduct]);

  // 일괄 입력 모달 상태
  const [isBulkInputOpen, setIsBulkInputOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'phase'>('table'); // 뷰 모드: 테이블 vs 단계

  const addIngredient = useCallback(() => {
    const newOrder = Math.max(...ingredients.map(i => i.order), 0) + 1;
    setIngredients(prev => [...prev, {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,  // ✅ 고유 ID 보장 (타임스탬프 + 랜덤)
      order: newOrder, category: 'other', subCategory: '기타',
      name: '', ratio: 0, amount: 0, note: '',
    }]);
  }, [ingredients]);

  // 일괄 입력으로 재료 추가
  const handleBulkImport = useCallback((importedIngredients: Array<{ name: string; amount: number; category: string }>) => {
    const startOrder = Math.max(...ingredients.map(i => i.order), 0) + 1;
    const newIngredients = importedIngredients.map((ing, idx) => ({
      id: `bulk-${Date.now()}-${idx}`,
      order: startOrder + idx,
      category: ing.category as any,
      subCategory: '',
      name: ing.name,
      ratio: 0,
      amount: ing.amount,
      note: ''
    }));
    setIngredients(prev => [...prev, ...newIngredients]);
    addToast({ type: 'success', message: t('advDashboard.ingredientsAdded', { count: newIngredients.length }) });
  }, [ingredients, addToast]);

  const removeIngredient = useCallback((id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateIngredient = useCallback((id: string, field: keyof IngredientEntry, value: any) => {
    setIngredients(prev => prev.map(ing => {
      if (ing.id !== id) return ing;
      const updated = { ...ing, [field]: value };
      if (field === 'category') updated.subCategory = CATEGORY_LABELS[value] || '기타';
      // 무게 변경 시 비율 자동 계산
      if (field === 'amount') {
        const flour = prev.filter(i => i.category === 'flour').reduce((s, i) => s + (i.id === id ? value : i.amount), 0);
        if (flour > 0 && ing.category !== 'flour') {
          updated.ratio = Math.round((value / flour) * 1000) / 10;
        }
      }
      return updated;
    }));
  }, []);

  const addProcess = useCallback(() => {
    const newOrder = Math.max(...processes.map(p => p.order), 0) + 1;
    setProcesses(prev => [...prev, { id: Date.now().toString(), order: newOrder, description: '' }]);
  }, [processes]);

  const removeProcess = useCallback((id: string) => {
    setProcesses(prev => prev.filter(p => p.id !== id));
  }, []);

  const updateProcess = useCallback((id: string, field: keyof ProcessStep, value: any) => {
    setProcesses(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  }, []);

  // 공정 순서 이동
  const moveProcess = useCallback((id: string, direction: 'up' | 'down') => {
    setProcesses(prev => {
      const index = prev.findIndex(p => p.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;

      const newArr = [...prev];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      [newArr[index], newArr[swapIndex]] = [newArr[swapIndex], newArr[index]];

      // order 값 재정렬
      return newArr.map((p, i) => ({ ...p, order: i + 1 }));
    });
  }, []);

  // ============================================
  // 렌더링
  // ============================================

  return (
    <div className="h-screen flex flex-col bg-gray-100 text-sm">
      {/* ===== 상단 헤더 ===== */}
      <div className="bg-white border-b shadow-sm px-4 py-2 flex items-center justify-between gap-4 flex-shrink-0">
        {/* 좌측: 제품 정보 + 출처 */}
        <div className="flex items-center gap-3">
          <Cookie className="w-5 h-5 text-amber-600" />
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="text-lg font-bold w-36 border-b border-transparent hover:border-gray-300 focus:border-amber-500 focus:outline-none"
            placeholder={t('advDashboard.productName')}
          />
          {/* 제품 타입 선택 */}
          <div className="flex items-center gap-1 border-l pl-3">
            <button
              onClick={() => setProductType('bread')}
              className={`px-3 py-1 text-xs rounded-l ${
                productType === 'bread'
                  ? 'bg-amber-500 text-white font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={t('advDashboard.productTypeBread')}
            >
              {t('advDashboard.productTypeBread')}
            </button>
            <button
              onClick={() => setProductType('pastry')}
              className={`px-3 py-1 text-xs rounded-r ${
                productType === 'pastry'
                  ? 'bg-amber-500 text-white font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={t('advDashboard.productTypePastry')}
            >
              {t('advDashboard.productTypePastry')}
            </button>
          </div>
          <div className="flex items-center gap-1 text-xs border-l pl-3">
            <select
              value={source.type}
              onChange={(e) => setSource({ ...source, type: e.target.value as SourceType })}
              className="bg-gray-50 border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:border-amber-400"
              title={t('advDashboard.sourceType')}
            >
              <option value="youtube">📺 {t('advDashboard.sourceTypes.youtube')}</option>
              <option value="blog">🌐 {t('advDashboard.sourceTypes.blog')}</option>
              <option value="book">📖 {t('advDashboard.sourceTypes.book')}</option>
              <option value="website">🔗 {t('advDashboard.sourceTypes.website')}</option>
              <option value="personal">👤 {t('advDashboard.sourceTypes.personal')}</option>
              <option value="school">🎓 {t('advDashboard.sourceTypes.school')}</option>
              <option value="other">📌 {t('advDashboard.sourceTypes.other')}</option>
            </select>
            <input
              type="text"
              value={source.name}
              onChange={(e) => setSource({ ...source, name: e.target.value })}
              className="w-24 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-400"
              placeholder={t('advDashboard.sourceName')}
              title={t('advDashboard.sourceNamePlaceholder')}
            />
          </div>
        </div>

        {/* 중앙: 배수 조절 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPanLinked(!isPanLinked)}
            className={`p-1.5 rounded flex items-center gap-1 ${isPanLinked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
            title={isPanLinked ? t('advDashboard.multiplierLinked') : t('advDashboard.multiplierUnlinked')}
          >
            {isPanLinked ? <Link className="w-4 h-4" /> : <Unlink className="w-4 h-4" />}
            <span className="text-xs">{isPanLinked ? t('advDashboard.auto') : t('advDashboard.manual')}</span>
          </button>
          <span className="text-xs text-gray-500">{t('advDashboard.multiplier')}:</span>
          {isPanLinked ? (
            /* 연동 모드: 자동 계산된 배수 표시 (읽기 전용) */
            <div className="flex items-center border border-green-300 rounded overflow-hidden bg-green-50">
              <div className="px-4 py-1 font-bold text-sm text-green-700 w-20 text-center">
                ×{effectiveMultiplier}
              </div>
            </div>
          ) : (
            /* 수동 모드: 배수 입력 가능 (x2, /2, 1/2 등 다양한 형식) */
            <div className="flex items-center border rounded overflow-hidden bg-white">
              <button onClick={() => handleQuickMultiplier(Math.max(0.1, multiplier - 0.5))} className="px-2 py-1 hover:bg-gray-100 border-r">
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={multiplierInput}
                onChange={(e) => handleMultiplierInputChange(e.target.value)}
                onBlur={handleMultiplierInputConfirm}
                onKeyDown={(e) => e.key === 'Enter' && handleMultiplierInputConfirm()}
                className="w-20 text-center py-1 font-bold text-sm"
                placeholder={t('advDashboard.multiplierPlaceholder')}
                title={t('advDashboard.multiplierHint')}
              />
              <button onClick={() => handleQuickMultiplier(Math.min(20, multiplier + 0.5))} className="px-2 py-1 hover:bg-gray-100 border-l">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
          {!isPanLinked && (
            <div className="flex gap-1 flex-wrap">
              {[0.25, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5].map(m => (
                <button
                  key={m}
                  onClick={() => handleQuickMultiplier(m)}
                  className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                    multiplier === m
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {m < 1 ? `1/${Math.round(1/m)}` : `×${m}`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 우측: 요약 + 액션 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded">
            <span>{t('advDashboard.original')}:<b className="text-gray-700 ml-1">{totalWeight}g</b></span>
            <span className="text-gray-300">→</span>
            <span>{t('advDashboard.converted')}:<b className="text-blue-600 ml-1">{convertedTotal}g</b></span>
            <span className="text-gray-300">|</span>
            <span>{t('advDashboard.hydration')}:<b className="ml-1">{hydration}%</b></span>
            <span className="text-gray-300">|</span>
            <span>{t('advDashboard.pan')}:<b className="ml-1">{panTotalWeight}g</b></span>
            <span className="text-gray-300">|</span>
            <span>{t('advDashboard.lossRate')}:<b className={`ml-1 ${lossRate > 100 ? 'text-red-500' : lossRate < 95 ? 'text-orange-500' : 'text-green-600'}`}>{lossRate}%</b></span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={resetAllConversion}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 border border-gray-300"
              title={t('advDashboard.resetConversion')}
            >
              <RotateCcw className="w-4 h-4" />{t('advDashboard.reset')}
            </button>
            <button
              onClick={handleSaveRecipe}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-amber-500 text-white rounded hover:bg-amber-600"
              title={t('advDashboard.saveRecipe')}
            >
              <Save className="w-4 h-4" />{t('advDashboard.save')}
            </button>
            <button
              onClick={handleCopyAsText}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              title={t('advDashboard.copyAsText')}
            >
              <Copy className="w-4 h-4" />{t('advDashboard.copy')}
            </button>
            <button
              onClick={handleExportRecipe}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-200 rounded hover:bg-gray-300"
              title={t('advDashboard.exportJson')}
            >
              <FileText className="w-4 h-4" />{t('advDashboard.json')}
            </button>
          </div>
        </div>
      </div>

      {/* ===== 메인 콘텐츠 ===== */}
      <div className="flex-1 flex overflow-hidden">
        {/* ===== 좌측 사이드바 (리사이즈 가능) ===== */}
        <div
          className="bg-white border-r flex-shrink-0 overflow-y-auto"
          style={{ width: layoutSettings.sidebarWidth }}
        >

          {/* 팬/틀 설정 */}
          <CollapsibleSection
            title={t('advDashboard.panSettings')}
            icon={<Layers className="w-4 h-4" />}
            badge={`${originalPan.quantity}${t('advDashboard.pan')}→${pans.reduce((s, p) => s + p.quantity, 0)}${t('advDashboard.pan')}`}
            badgeColor="bg-blue-100 text-blue-700"
            onReset={resetPanSettings}
          >
            <div className="space-y-3">
              {/* 원래 팬 (레시피 원본) */}
              <div className="bg-gray-100 rounded p-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-600">📋 {t('advDashboard.originalPan')}</span>
                  {/* 팬/개수 모드 토글 */}
                  <div className="flex text-xs">
                    <button
                      onClick={() => updateOriginalPan('mode', 'pan')}
                      className={`px-2 py-0.5 rounded-l border ${originalPan.mode === 'pan' ? 'bg-gray-500 text-white border-gray-500' : 'bg-white text-gray-600 border-gray-300'}`}
                    >🍞 {t('advDashboard.panMode')}</button>
                    <button
                      onClick={() => updateOriginalPan('mode', 'count')}
                      className={`px-2 py-0.5 rounded-r border-l-0 border ${originalPan.mode === 'count' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300'}`}
                    >🔢 {t('advDashboard.countMode')}</button>
                  </div>
                </div>

                {/* 팬 모드 */}
                {originalPan.mode === 'pan' && (
                  <>
                    <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                      <select value={originalPan.category} onChange={(e) => updateOriginalPan('category', e.target.value)}
                        className="text-xs border rounded px-2 py-1 bg-white">
                        {Object.keys(PAN_DATA).map(cat => <option key={cat} value={cat}>{getLocalizedPanCategory(cat)}</option>)}
                      </select>
                      <select value={originalPan.type} onChange={(e) => updateOriginalPan('type', e.target.value)}
                        className="text-xs border rounded px-2 py-1 bg-white">
                        {PAN_DATA[originalPan.category as keyof typeof PAN_DATA]?.map(p =>
                          <option key={p.name} value={p.name}>{getLocalizedPanName(p)}</option>
                        )}
                      </select>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 text-xs">
                      <div>
                        <label className="text-xs text-gray-500 block">{t('advDashboard.quantity')}</label>
                        <input type="number" value={originalPan.quantity}
                          onChange={(e) => updateOriginalPan('quantity', parseInt(e.target.value) || 1)}
                          className="w-full border rounded px-1.5 py-1 text-center bg-white" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block">{t('advDashboard.division')}</label>
                        <input type="number" value={originalPan.divisionCount}
                          onChange={(e) => updateOriginalPan('divisionCount', parseInt(e.target.value) || 1)}
                          className="w-full border rounded px-1.5 py-1 text-center bg-white" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block">{t('advDashboard.panWeight')}</label>
                        <input type="number" value={originalPan.panWeight}
                          onChange={(e) => updateOriginalPan('panWeight', parseInt(e.target.value) || 0)}
                          className="w-full border rounded px-1.5 py-1 text-center bg-white" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block">{t('advDashboard.divisionWeight')}</label>
                        <div className="text-center py-1 font-mono bg-white rounded border">{originalPan.divisionWeight}</div>
                      </div>
                    </div>
                  </>
                )}

                {/* 개수 모드 */}
                {originalPan.mode === 'count' && (
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    <div>
                      <label className="text-xs text-gray-500 block">{t('advDashboard.count')}</label>
                      <input type="number" value={originalPan.unitCount || 10}
                        onChange={(e) => updateOriginalPan('unitCount', parseInt(e.target.value) || 0)}
                        className="w-full border rounded px-1.5 py-1 text-center bg-white" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block">{t('advDashboard.weightPerPiece')}</label>
                      <input type="number" value={originalPan.unitWeight || 50}
                        onChange={(e) => updateOriginalPan('unitWeight', parseInt(e.target.value) || 0)}
                        className="w-full border rounded px-1.5 py-1 text-center bg-white" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block">{t('advDashboard.total')}</label>
                      <div className="text-center py-1 font-mono bg-white rounded border font-semibold">
                        {(originalPan.unitCount || 10) * (originalPan.unitWeight || 50)}g
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-1 text-right">
                  {t('advDashboard.total')}: <b>{originalPan.mode === 'count'
                    ? (originalPan.unitCount || 10) * (originalPan.unitWeight || 50)
                    : originalPan.panWeight * originalPan.quantity}g</b>
                </div>
              </div>

              {/* 화살표 */}
              <div className="flex justify-center text-gray-400">
                <ChevronDown className="w-5 h-5" />
              </div>

              {/* 변환 팬 (목표) */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-blue-600">🎯 {t('advDashboard.convertedPan')}</div>
                {pans.map((pan, idx) => (
                  <div key={pan.id} className="bg-blue-50 rounded p-2 border border-blue-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-blue-700">{t('advDashboard.pan')} {idx + 1}</span>
                        {/* 팬/개수 모드 토글 */}
                        <div className="flex text-xs">
                          <button
                            onClick={() => updatePan(pan.id, 'mode', 'pan')}
                            className={`px-2 py-0.5 rounded-l border ${pan.mode === 'pan' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-300'}`}
                          >🍞 {t('advDashboard.panMode')}</button>
                          <button
                            onClick={() => updatePan(pan.id, 'mode', 'count')}
                            className={`px-2 py-0.5 rounded-r border-l-0 border ${pan.mode === 'count' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300'}`}
                          >🔢 {t('advDashboard.countMode')}</button>
                        </div>
                      </div>
                      {pans.length > 1 && (
                        <button onClick={() => removePan(pan.id)} className="text-red-400 hover:text-red-600">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* 팬 모드 */}
                    {pan.mode === 'pan' && (
                      <>
                        <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                          <select value={pan.category} onChange={(e) => updatePan(pan.id, 'category', e.target.value)}
                            className="text-xs border rounded px-2 py-1 bg-white">
                            {Object.keys(PAN_DATA).map(cat => <option key={cat} value={cat}>{getLocalizedPanCategory(cat)}</option>)}
                          </select>
                          <select value={pan.type} onChange={(e) => updatePan(pan.id, 'type', e.target.value)}
                            className="text-xs border rounded px-2 py-1 bg-white">
                            {PAN_DATA[pan.category as keyof typeof PAN_DATA]?.map(p =>
                              <option key={p.name} value={p.name}>{getLocalizedPanName(p)}</option>
                            )}
                          </select>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 text-xs">
                          <div>
                            <label className="text-xs text-gray-500 block">{t('advDashboard.quantity')}</label>
                            <input type="number" value={pan.quantity}
                              onChange={(e) => updatePan(pan.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full border rounded px-1.5 py-1 text-center bg-white" step="0.5" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block">{t('advDashboard.division')}</label>
                            <input type="number" value={pan.divisionCount}
                              onChange={(e) => updatePan(pan.id, 'divisionCount', parseInt(e.target.value) || 1)}
                              className="w-full border rounded px-1.5 py-1 text-center bg-white" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block">{t('advDashboard.panWeight')}</label>
                            <input type="number" value={pan.panWeight}
                              onChange={(e) => updatePan(pan.id, 'panWeight', parseInt(e.target.value) || 0)}
                              className="w-full border rounded px-1.5 py-1 text-center bg-white" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block">{t('advDashboard.divisionWeight')}</label>
                            <div className="text-center py-1 font-mono bg-white rounded border">{pan.divisionWeight}</div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* 개수 모드 (모닝빵 등) */}
                    {pan.mode === 'count' && (
                      <div className="grid grid-cols-3 gap-1.5 text-xs">
                        <div>
                          <label className="text-xs text-gray-500 block">{t('advDashboard.count')}</label>
                          <input type="number" value={pan.unitCount || 10}
                            onChange={(e) => updatePan(pan.id, 'unitCount', parseInt(e.target.value) || 0)}
                            className="w-full border rounded px-1.5 py-1 text-center bg-white" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block">{t('advDashboard.weightPerPiece')}</label>
                          <input type="number" value={pan.unitWeight || 50}
                            onChange={(e) => updatePan(pan.id, 'unitWeight', parseInt(e.target.value) || 0)}
                            className="w-full border rounded px-1.5 py-1 text-center bg-white" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block">{t('advDashboard.total')}</label>
                          <div className="text-center py-1 font-mono bg-white rounded border font-semibold">
                            {(pan.unitCount || 10) * (pan.unitWeight || 50)}g
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={addPan} className="w-full text-xs text-blue-600 hover:text-blue-700 py-1.5 border border-dashed border-blue-300 rounded">
                  {t('advDashboard.addPan')}
                </button>
                <div className="text-xs text-blue-700 text-right">
                  {t('advDashboard.total')}: <b>{panTotalWeight}g</b>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* 비용적/비중 설정 */}
          <CollapsibleSection title={t('advDashboard.specificVolume')} icon={<Scale className="w-4 h-4" />} defaultOpen={false} onReset={resetSpecificVolume}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">{t('advDashboard.originalProduct')}</label>
                <select value={originalProduct} onChange={(e) => setOriginalProduct(e.target.value)}
                  className="w-full text-xs border rounded px-2 py-1">
                  {Object.keys(SPECIFIC_VOLUMES).map(p => <option key={p} value={p}>{getLocalizedProductName(p)}</option>)}
                </select>
                <div className="text-xs text-gray-400 mt-1">
                  {isPastryProduct(originalProduct)
                    ? `비중: ${CAKE_BATTER_SPECIFIC_GRAVITY[originalProduct]}`
                    : `비용적: ${SPECIFIC_VOLUMES[originalProduct]} cm³/g`
                  }
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">{t('advDashboard.convertedProduct')}</label>
                <select value={convertedProduct} onChange={(e) => setConvertedProduct(e.target.value)}
                  className="w-full text-xs border rounded px-2 py-1">
                  {Object.keys(SPECIFIC_VOLUMES).map(p => <option key={p} value={p}>{getLocalizedProductName(p)}</option>)}
                </select>
                <div className="text-xs text-gray-400 mt-1">
                  {isPastryProduct(convertedProduct)
                    ? `비중: ${CAKE_BATTER_SPECIFIC_GRAVITY[convertedProduct]}`
                    : `비용적: ${SPECIFIC_VOLUMES[convertedProduct]} cm³/g`
                  }
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* 수율 손실 예측 - 제빵 전용 */}
          {productType === 'bread' && (
            <CollapsibleSection
              title={t('advDashboard.yieldPrediction')}
              icon={<TrendingDown className="w-4 h-4" />}
              defaultOpen={false}
              badge={`${Math.round((1 - 0.19) * totalWeight)}g ${t('advDashboard.expectedYield')}`}
            >
              <YieldLossCalculator
                inputWeight={totalWeight}
                category={originalProduct === '쉬폰케이크' || originalProduct === '제누와즈' || originalProduct === '파운드케이크' ? 'cake'
                  : originalProduct === '크루아상' || originalProduct === '데니쉬' ? 'pastry'
                  : originalProduct === '쿠키' ? 'cookie'
                  : 'bread'}
                productType={
                  originalProduct === '풀먼식빵' ? 'pullman'
                  : originalProduct === '산형식빵' ? 'mountain'
                  : originalProduct === '브리오슈' ? 'brioche'
                  : originalProduct === '제누와즈' ? 'genoise'
                  : originalProduct === '쉬폰케이크' ? 'chiffon'
                  : originalProduct === '파운드케이크' ? 'pound'
                  : originalProduct === '크루아상' ? 'croissant'
                  : undefined
                }
                stageSelection={yieldStageSelection}
                onStageSelectionChange={setYieldStageSelection}
                compact={false}
                className="border-0 shadow-none"
              />
            </CollapsibleSection>
          )}

          {/* 오븐 설정 */}
          <CollapsibleSection
            title={t('advDashboard.oven')}
            icon={<Flame className="w-4 h-4" />}
            badge={(() => {
              const typeLabel = t(`advDashboard.ovenTypes.${oven.type}`);
              const levelInfo = oven.type === 'convection' && oven.level ? ` ${oven.level}${t('advDashboard.level')}` : '';
              const tempInfo = oven.type === 'deck'
                ? `${oven.firstBake.topTemp}/${oven.firstBake.bottomTemp}°C`
                : `${oven.firstBake.topTemp}°C`;
              const firstBake = `${tempInfo} ${oven.firstBake.time}${t('units.minute')}`;
              // 2차 굽기가 있으면 추가 표시
              const secondBake = oven.secondBake.time > 0
                ? oven.type === 'deck'
                  ? ` → ${oven.secondBake.topTemp}/${oven.secondBake.bottomTemp}°C ${oven.secondBake.time}${t('units.minute')}`
                  : ` → ${oven.secondBake.topTemp}°C ${oven.secondBake.time}${t('units.minute')}`
                : '';
              return `${typeLabel}${levelInfo} ${firstBake}${secondBake}`;
            })()}
            badgeColor="bg-orange-100 text-orange-700"
            onReset={resetOvenSettings}
          >
            <div className="space-y-2">
              <div className="flex gap-1.5">
                {(['convection', 'deck', 'airfryer'] as const).map(type => (
                  <button key={type} onClick={() => setOven({ ...oven, type })}
                    className={`flex-1 px-2 py-1 text-xs rounded ${oven.type === type ? 'bg-amber-500 text-white' : 'bg-gray-100'}`}>
                    {t(`advDashboard.ovenTypes.${type}`)}
                  </button>
                ))}
              </div>
              {/* 컨벡션 오븐일 때만 단 선택 표시 */}
              {oven.type === 'convection' && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">{t('advDashboard.levelSelect')}:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(level => {
                      const levels = oven.level ? oven.level.split(',').map(s => s.trim()) : [];
                      const isSelected = levels.includes(String(level));
                      return (
                        <button
                          key={level}
                          onClick={() => {
                            let newLevels: string[];
                            if (isSelected) {
                              newLevels = levels.filter(l => l !== String(level));
                            } else {
                              newLevels = [...levels, String(level)].sort((a, b) => Number(a) - Number(b));
                            }
                            setOven({ ...oven, level: newLevels.join(', ') });
                          }}
                          className={`w-6 h-6 rounded text-xs font-medium ${isSelected ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                  {oven.level && <span className="text-amber-600 font-medium">{oven.level}{t('advDashboard.level')}</span>}
                </div>
              )}
              <div className="bg-orange-50 rounded p-2">
                <div className="text-xs font-medium text-orange-700 mb-1.5">{t('advDashboard.firstBake')}</div>
                {oven.type === 'deck' ? (
                  /* 데크 오븐: 윗불/아랫불 분리 */
                  <div className="grid grid-cols-3 gap-1.5">
                    <div><label className="text-xs text-gray-500">{t('advDashboard.topHeat')}</label>
                      <input type="number" value={oven.firstBake.topTemp}
                        onChange={(e) => setOven({ ...oven, firstBake: { ...oven.firstBake, topTemp: parseInt(e.target.value) || 0 } })}
                        className="w-full text-xs border rounded px-1.5 py-1 text-center" /></div>
                    <div><label className="text-xs text-gray-500">{t('advDashboard.bottomHeat')}</label>
                      <input type="number" value={oven.firstBake.bottomTemp}
                        onChange={(e) => setOven({ ...oven, firstBake: { ...oven.firstBake, bottomTemp: parseInt(e.target.value) || 0 } })}
                        className="w-full text-xs border rounded px-1.5 py-1 text-center" /></div>
                    <div><label className="text-xs text-gray-500">{t('advDashboard.timeMin')}</label>
                      <input type="number" value={oven.firstBake.time}
                        onChange={(e) => setOven({ ...oven, firstBake: { ...oven.firstBake, time: parseInt(e.target.value) || 0 } })}
                        className="w-full text-xs border rounded px-1.5 py-1 text-center" /></div>
                  </div>
                ) : (
                  /* 컨벡션/에어프라이: 단일 온도 */
                  <div className="grid grid-cols-2 gap-1.5">
                    <div><label className="text-xs text-gray-500">{t('advDashboard.temperature')}</label>
                      <input type="number" value={oven.firstBake.topTemp}
                        onChange={(e) => {
                          const temp = parseInt(e.target.value) || 0;
                          setOven({ ...oven, firstBake: { ...oven.firstBake, topTemp: temp, bottomTemp: temp } });
                        }}
                        className="w-full text-xs border rounded px-1.5 py-1 text-center" /></div>
                    <div><label className="text-xs text-gray-500">{t('advDashboard.timeMin')}</label>
                      <input type="number" value={oven.firstBake.time}
                        onChange={(e) => setOven({ ...oven, firstBake: { ...oven.firstBake, time: parseInt(e.target.value) || 0 } })}
                        className="w-full text-xs border rounded px-1.5 py-1 text-center" /></div>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-xs text-gray-500 mb-1.5">{t('advDashboard.secondBake')}</div>
                {oven.type === 'deck' ? (
                  /* 데크 오븐: 윗불/아랫불 분리 */
                  <div className="grid grid-cols-3 gap-1.5">
                    <input type="number" value={oven.secondBake.topTemp || ''}
                      onChange={(e) => setOven({ ...oven, secondBake: { ...oven.secondBake, topTemp: parseInt(e.target.value) || 0 } })}
                      className="text-xs border rounded px-1.5 py-1 text-center" placeholder={t('advDashboard.topHeat')} />
                    <input type="number" value={oven.secondBake.bottomTemp || ''}
                      onChange={(e) => setOven({ ...oven, secondBake: { ...oven.secondBake, bottomTemp: parseInt(e.target.value) || 0 } })}
                      className="text-xs border rounded px-1.5 py-1 text-center" placeholder={t('advDashboard.bottomHeat')} />
                    <input type="number" value={oven.secondBake.time || ''}
                      onChange={(e) => setOven({ ...oven, secondBake: { ...oven.secondBake, time: parseInt(e.target.value) || 0 } })}
                      className="text-xs border rounded px-1.5 py-1 text-center" placeholder={t('units.time')} />
                  </div>
                ) : (
                  /* 컨벡션/에어프라이: 단일 온도 */
                  <div className="grid grid-cols-2 gap-1.5">
                    <input type="number" value={oven.secondBake.topTemp || ''}
                      onChange={(e) => {
                        const temp = parseInt(e.target.value) || 0;
                        setOven({ ...oven, secondBake: { ...oven.secondBake, topTemp: temp, bottomTemp: temp } });
                      }}
                      className="text-xs border rounded px-1.5 py-1 text-center" placeholder={t('advDashboard.temperature')} />
                    <input type="number" value={oven.secondBake.time || ''}
                      onChange={(e) => setOven({ ...oven, secondBake: { ...oven.secondBake, time: parseInt(e.target.value) || 0 } })}
                      className="text-xs border rounded px-1.5 py-1 text-center" placeholder={t('units.time')} />
                  </div>
                )}
              </div>
            </div>
          </CollapsibleSection>

          {/* 제법/사전반죽 - 제빵 전용 */}
          {productType === 'bread' && (
            <CollapsibleSection
              title={t('advDashboard.method')}
              icon={<Wheat className="w-4 h-4" />}
              badge={t(METHOD_KEYS[method.type])}
              badgeColor={method.type === 'straight' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}
            >
              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-1">
                  {Object.entries(METHOD_KEYS).map(([key, labelKey]) => (
                    <button key={key} onClick={() => handleMethodChange(key)}
                      className={`px-1.5 py-1 text-xs rounded ${method.type === key ? 'bg-amber-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      {t(labelKey)}
                    </button>
                  ))}
                </div>
                {/* 저온발효/저온숙성: 이스트 조정 정보 표시 */}
                {(method.type === 'coldFerment' || method.type === 'retard') && (
                  <div className="bg-blue-50 rounded p-2">
                    <div className="text-xs font-medium text-blue-700 mb-1">
                      {method.type === 'coldFerment' ? `❄️ ${t('advDashboard.coldFerment')}` : `🌙 ${t('advDashboard.coldRetard')}`}
                    </div>
                    <div className="text-xs text-blue-600">
                      {method.type === 'coldFerment'
                        ? t('advDashboard.coldFermentDesc', { percent: Math.round(method.yeastAdjustment * 100) })
                        : t('advDashboard.coldRetardDesc')
                      }
                    </div>
                  </div>
                )}
                {/* 사전반죽이 있는 제법만 비율 조정 표시 (coldFerment/retard 제외) */}
                {method.type !== 'straight' && method.type !== 'coldFerment' && method.type !== 'retard' && (
                  <div className="bg-amber-50 rounded p-2">
                    <div className="text-xs font-medium text-amber-700 mb-1.5">{t('advDashboard.prefermentRatio')}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="text-xs text-gray-500">{t('advDashboard.flourPercent')}</label>
                        <input type="number" value={Math.round(method.flourRatio * 100)}
                          onChange={(e) => setMethod({ ...method, flourRatio: (parseFloat(e.target.value) || 0) / 100 })}
                          className="w-full text-xs border rounded px-1.5 py-1 text-center" step="10" /></div>
                      <div><label className="text-xs text-gray-500">{t('advDashboard.waterPercent')}</label>
                        <input type="number" value={Math.round(method.waterRatio * 100)}
                          onChange={(e) => setMethod({ ...method, waterRatio: (parseFloat(e.target.value) || 0) / 100 })}
                          className="w-full text-xs border rounded px-1.5 py-1 text-center" step="10" /></div>
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* 레이아웃 초기화 버튼 */}
          <div className="p-2 border-t">
            <button
              onClick={resetLayoutSettings}
              className="w-full flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-700 py-1"
              title={t('advDashboard.layoutReset')}
            >
              <RotateCcw className="w-3 h-3" />
              {t('advDashboard.layoutReset')}
            </button>
          </div>
        </div>

        {/* 사이드바 리사이즈 핸들 */}
        <ResizeHandle
          direction="horizontal"
          onResize={(delta) => setSidebarWidth(layoutSettings.sidebarWidth + delta)}
          className="hover:bg-blue-100"
        />

        {/* ===== 중앙: 레시피 테이블 (컴팩트) ===== */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 overflow-auto p-1 min-h-0">
            <div className="grid gap-1 h-full grid-cols-2">

              {/* 원래 레시피 */}
              <div className="bg-white rounded shadow-sm border flex flex-col overflow-hidden min-w-0">
                <div className="bg-gray-50 border-b px-2 py-0.5 flex items-center justify-between flex-shrink-0">
                  <span className="font-semibold text-gray-700 flex items-center gap-1 text-[11px]">
                    <Droplets className="w-3 h-3" />{t('advDashboard.originalRecipe')}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setIsBulkInputOpen(true)} className="text-[10px] text-blue-600 hover:text-blue-700 font-medium">📋 {t('advDashboard.bulkInput')}</button>
                    <button onClick={addIngredient} className="text-[10px] text-amber-600 hover:text-amber-700 font-medium">{t('advDashboard.addIngredient')}</button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr className={`text-gray-500 ${dynamicStyles.fontSize}`}>
                        <th className="px-1.5 py-1 text-left w-16">{t('advDashboard.category')}</th>
                        <th className="px-1.5 py-1 text-left">{t('advDashboard.ingredients')}</th>
                        <th className="px-1.5 py-1 text-right w-10">{t('advDashboard.tableHeaderPercent')}</th>
                        <th className="px-1.5 py-1 text-right w-14">{t('advDashboard.tableHeaderGram')}</th>
                        <th className="w-5"></th>
                      </tr>
                    </thead>
                    <tbody className={dynamicStyles.fontSize}>
                      {ingredientsByPhase.map(({ phase, items }, phaseIndex) => {
                        const phaseMeta = PHASE_META[phase] || PHASE_META.other;
                        return (
                          <React.Fragment key={phase}>
                            {/* 단계 구분선 (2개 이상 단계가 있을 때만 표시) */}
                            {hasMultiplePhases && (
                              <tr className={`${phaseMeta.bgColor} ${phaseMeta.borderColor} border-y-2`}>
                                <td colSpan={5} className={`px-2 py-1 ${phaseMeta.textColor} font-semibold text-xs`}>
                                  <span className="flex items-center gap-1">
                                    <span>{phaseMeta.icon}</span>
                                    <span>{t(phaseMeta.labelKey)}</span>
                                    <span className="text-[10px] font-normal opacity-60">({t('advDashboard.itemCount', { count: items.length })})</span>
                                  </span>
                                </td>
                              </tr>
                            )}
                            {/* 해당 단계의 재료들 */}
                            {items.map(ing => (
                              <tr key={ing.id} className={`border-b border-gray-100 hover:bg-gray-50 ${dynamicStyles.rowHeight}`}>
                                <td className="px-1.5">
                                  <select value={ing.category} onChange={(e) => updateIngredient(ing.id, 'category', e.target.value)}
                                    className="w-full text-xs border-0 bg-transparent p-0 focus:outline-none appearance-none cursor-pointer">
                                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                  </select>
                                </td>
                                <td className="px-1.5">
                                  <AutocompleteInput
                                    value={ing.name}
                                    displayValue={translateIngredient(ing.name)}
                                    onChange={(value) => updateIngredient(ing.id, 'name', value)}
                                    onSelect={(value) => {
                                      // 재료 선택 시 카테고리도 자동 설정
                                      const info = findIngredientInfo(value);
                                      if (info) {
                                        updateIngredient(ing.id, 'name', value);
                                        // 카테고리 매핑
                                        const categoryMap: Record<string, string> = {
                                          flour: 'flour', liquid: 'liquid', fat: 'wetOther',
                                          sugar: 'other', egg: 'wetOther', dairy: 'liquid',
                                          leavening: 'other', salt: 'other', flavoring: 'other',
                                          nut: 'other', fruit: 'other', chocolate: 'other', other: 'other'
                                        };
                                        updateIngredient(ing.id, 'category', categoryMap[info.category] || 'other');
                                      }
                                    }}
                                    placeholder={t('advDashboard.name')}
                                    className="!border-0 !p-0 !ring-0 text-sm bg-transparent"
                                    maxSuggestions={6}
                                  />
                                </td>
                                <td className="px-1.5 text-right font-mono text-gray-400 text-xs">{ing.ratio}</td>
                                <td className="px-1.5">
                                  <input type="number" value={ing.amount} onChange={(e) => updateIngredient(ing.id, 'amount', parseFloat(e.target.value) || 0)}
                                    className="w-full text-right font-mono bg-transparent border-0 p-0 focus:outline-none text-sm" />
                                </td>
                                <td className="px-0.5">
                                  <button onClick={() => removeIngredient(ing.id)} className="text-red-300 hover:text-red-500">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="bg-gray-50 border-t px-2 py-0.5 text-[11px] flex-shrink-0">
                  <span>{t('advDashboard.total')}: <b>{totalWeight}g</b></span>
                </div>
              </div>

              {/* 변환 레시피 (단계별 구분선 포함) */}
              <div className="bg-white rounded shadow-sm border border-blue-200 flex flex-col overflow-hidden min-w-0">
                <div className="bg-blue-50 border-b border-blue-200 px-2 py-0.5 flex items-center justify-between flex-shrink-0">
                  <span className="font-semibold text-blue-700 flex items-center gap-1 text-[11px]">
                    <ThermometerSun className="w-3 h-3" />{t('advDashboard.convertedRecipe')}
                  </span>
                  {effectiveMultiplier !== 1 && <span className="text-[9px] bg-blue-200 text-blue-700 px-1 py-0.5 rounded font-medium">×{effectiveMultiplier}</span>}
                </div>
                <div className="flex-1 overflow-auto">
                  <table className="w-full">
                    <thead className="bg-blue-50 sticky top-0">
                      <tr className={`text-blue-700 ${dynamicStyles.fontSize}`}>
                        <th className="px-2 py-1 text-left">{t('advDashboard.category')}</th>
                        <th className="px-2 py-1 text-left">{t('advDashboard.ingredients')}</th>
                        <th className="px-2 py-1 text-right w-16">{t('advDashboard.tableHeaderGram')}</th>
                      </tr>
                    </thead>
                    <tbody className={dynamicStyles.fontSize}>
                      {convertedIngredientsByPhase.map(({ phase, items }) => {
                        const phaseMeta = PHASE_META[phase] || PHASE_META.other;
                        return (
                          <React.Fragment key={phase}>
                            {/* 단계 구분선 (2개 이상 단계가 있을 때만 표시) */}
                            {convertedHasMultiplePhases && (
                              <tr className={`${phaseMeta.bgColor} ${phaseMeta.borderColor} border-y-2`}>
                                <td colSpan={3} className={`px-2 py-1 ${phaseMeta.textColor} font-semibold text-xs`}>
                                  <span className="flex items-center gap-1">
                                    <span>{phaseMeta.icon}</span>
                                    <span>{t(phaseMeta.labelKey)}</span>
                                    <span className="text-[10px] font-normal opacity-60">({t('advDashboard.itemCount', { count: items.length })})</span>
                                  </span>
                                </td>
                              </tr>
                            )}
                            {/* 해당 단계의 재료들 */}
                            {items.map((ing: any) => (
                              <tr key={ing.id} className={`border-b border-blue-100 ${dynamicStyles.rowHeight}`}>
                                <td className="px-2 text-blue-600">{CATEGORY_LABELS[ing.category]}</td>
                                <td className="px-2">{translateIngredient(ing.name)}</td>
                                <td className="px-2 text-right font-mono font-medium text-blue-700">{ing.convertedAmount}</td>
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="bg-blue-50 border-t border-blue-200 px-2 py-0.5 text-[11px] flex-shrink-0">
                  <span className="text-blue-700">{t('advDashboard.total')}: <b>{Math.round(prefermentTotal + mainDoughTotal)}g</b></span>
                </div>
              </div>
            </div>
          </div>

          {/* 공정 패널 리사이즈 핸들 */}
          <ResizeHandle
            direction="vertical"
            onResize={(delta) => setProcessPanelHeight(layoutSettings.processPanelHeight - delta)}
            className="hover:bg-blue-100"
          />

          {/* ===== 하단: 공정 패널 (리사이즈 가능) ===== */}
          <div
            className="bg-white border-t flex-shrink-0 overflow-hidden flex flex-col"
            style={{ height: layoutSettings.processPanelHeight }}
          >
            <div className="bg-gray-50 border-b px-3 py-1 flex items-center justify-between flex-shrink-0">
              <span className="font-semibold text-gray-700 flex items-center gap-1.5 text-sm">
                <ListOrdered className="w-4 h-4" />{t('advDashboard.processMemo')}
                <span className="text-xs font-normal text-gray-500 ml-1">
                  {t('advDashboard.totalMinutes', { minutes: processes.reduce((s, p) => s + (p.time || 0), 0) })}
                </span>
              </span>
              <button onClick={addProcess} className="text-xs text-amber-600 hover:text-amber-700 font-medium">{t('advDashboard.addProcess')}</button>
            </div>
            <div className="flex-1 overflow-auto px-2 py-1.5">
              <div className="flex gap-1.5 flex-wrap items-start">
                {processes.map((proc, idx) => {
                  const itemSize = getProcessItemSize(proc.id);
                  return (
                  <div
                    key={proc.id}
                    className="flex items-center gap-1 bg-gray-50 border rounded px-1.5 py-1 text-xs group hover:bg-gray-100 relative"
                    style={{ minWidth: itemSize.width || 120 }}
                  >
                    {/* 순서 변경 버튼 */}
                    <div className="flex flex-col opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => moveProcess(proc.id, 'up')}
                        className="text-gray-400 hover:text-gray-600 -mb-0.5"
                        disabled={idx === 0}
                        title={t('advDashboard.moveUp')}
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => moveProcess(proc.id, 'down')}
                        className="text-gray-400 hover:text-gray-600 -mt-0.5"
                        disabled={idx === processes.length - 1}
                        title={t('advDashboard.moveDown')}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-gray-400 font-mono text-[11px] w-4">{idx + 1}.</span>
                    <input
                      type="text"
                      value={editingProcessId === proc.id ? proc.description : translateProcessStep(proc.description || '')}
                      onChange={(e) => updateProcess(proc.id, 'description', e.target.value)}
                      onFocus={() => setEditingProcessId(proc.id)}
                      onBlur={() => setEditingProcessId(null)}
                      className="bg-transparent border-0 p-0 focus:outline-none text-xs flex-1 min-w-0"
                      placeholder={t('advDashboard.processPlaceholder')}
                    />
                    {/* 시간: 값이 있을 때 뱃지 표시 + 삭제 버튼 */}
                    {proc.time ? (
                      <div className="flex items-center gap-0.5 text-[11px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded group/time">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <input
                          type="number"
                          value={proc.time}
                          onChange={(e) => updateProcess(proc.id, 'time', parseInt(e.target.value) || 0)}
                          className="w-8 bg-transparent border-0 p-0 text-center focus:outline-none"
                        />
                        <span className="text-[10px] flex-shrink-0">{t('units.minute')}</span>
                        <button
                          onClick={() => updateProcess(proc.id, 'time', undefined)}
                          className="text-blue-400 hover:text-blue-600 opacity-0 group-hover/time:opacity-100 ml-0.5 flex-shrink-0"
                          title={t('advDashboard.deleteTime')}
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => updateProcess(proc.id, 'time', 1)}
                        className="opacity-0 group-hover:opacity-60 hover:opacity-100 text-blue-400 bg-blue-50 px-1 py-0.5 rounded"
                        title={t('advDashboard.addTime')}
                      >
                        <Clock className="w-3 h-3" />
                      </button>
                    )}
                    {/* 온도: 값이 있을 때 뱃지 표시 + 삭제 버튼 */}
                    {proc.temp ? (
                      <div className="flex items-center gap-0.5 text-[11px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded group/temp">
                        <ThermometerSun className="w-3 h-3 flex-shrink-0" />
                        <input
                          type="number"
                          value={proc.temp}
                          onChange={(e) => updateProcess(proc.id, 'temp', parseInt(e.target.value) || 0)}
                          className="w-8 bg-transparent border-0 p-0 text-center focus:outline-none"
                        />
                        <span className="text-[10px] flex-shrink-0">{t('units.celsius')}</span>
                        <button
                          onClick={() => updateProcess(proc.id, 'temp', undefined)}
                          className="text-orange-400 hover:text-orange-600 opacity-0 group-hover/temp:opacity-100 ml-0.5 flex-shrink-0"
                          title={t('advDashboard.deleteTemp')}
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => updateProcess(proc.id, 'temp', 27)}
                        className="opacity-0 group-hover:opacity-60 hover:opacity-100 text-orange-400 bg-orange-50 px-1 py-0.5 rounded"
                        title={t('advDashboard.addTemp')}
                      >
                        <ThermometerSun className="w-3 h-3" />
                      </button>
                    )}
                    <button onClick={() => removeProcess(proc.id)} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {/* 너비 조절 핸들 */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize opacity-0 group-hover:opacity-100 hover:bg-blue-400 transition-colors"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const startX = e.clientX;
                        const startWidth = itemSize.width || 120;

                        const handleMouseMove = (moveE: MouseEvent) => {
                          const delta = moveE.clientX - startX;
                          const newWidth = Math.max(80, Math.min(400, startWidth + delta));
                          setProcessItemSize(proc.id, { width: newWidth });
                        };

                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                          document.body.style.cursor = '';
                          document.body.style.userSelect = '';
                        };

                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                        document.body.style.cursor = 'col-resize';
                        document.body.style.userSelect = 'none';
                      }}
                      title={t('advDashboard.resizeWidth')}
                    >
                      <GripVertical className="w-2 h-full text-gray-300 group-hover:text-blue-400" />
                    </div>
                  </div>
                  );
                })}
              </div>
              {/* 메모 입력 */}
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500">📌 {t('advDashboard.memo')}</span>
                  {memo && <span className="text-[10px] text-gray-400">({t('advDashboard.memoCharCount', { count: memo.length })})</span>}
                </div>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder={t('advDashboard.memoPlaceholder')}
                  className="w-full text-xs border rounded px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-amber-500"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 일괄 입력 모달 */}
      <BulkIngredientInput
        isOpen={isBulkInputOpen}
        onClose={() => setIsBulkInputOpen(false)}
        onImport={handleBulkImport}
      />
    </div>
  );
};

export default AdvancedDashboard;
