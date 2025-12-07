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
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useRecipeStore } from '@/stores/useRecipeStore';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import ResizeHandle from '@/components/common/ResizeHandle';
import {
  ChevronDown, ChevronRight, ChevronUp, Plus, Minus, X,
  Save, Download, Flame, Scale, Wheat, Droplets,
  Cookie, Layers, ThermometerSun, Link, Unlink,
  Clock, ListOrdered, RotateCcw, GripVertical
} from 'lucide-react';

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
  type: 'straight' | 'sponge' | 'poolish' | 'biga' | 'levain';
  flourRatio: number;
  waterRatio: number;
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

// 제빵용 팬 데이터 (식빵류)
const BREAD_PAN_DATA = {
  식빵팬: [
    { name: '풀먼식빵팬', volume: 2350 },
    { name: '산형식빵팬', volume: 2350 },
    { name: '우유식빵(4구)', volume: 2580 },
    { name: '옥수수식빵(3구)', volume: 1821 },
    { name: '큐브식빵팬', volume: 857 },
  ],
  소형팬: [
    { name: '오란다(소)', volume: 322 },
    { name: '오란다(대)', volume: 662 },
    { name: '미니식빵팬', volume: 450 },
    { name: '실리콘큐브', volume: 125 },
  ],
  파운드팬: [
    { name: '파운드팬(소)', volume: 980 },
    { name: '파운드팬(중)', volume: 1456 },
    { name: '파운드팬(대)', volume: 2100 },
  ],
};

// 제과용 팬 데이터 (케이크류) - 나중에 별도 화면에서 사용
const CAKE_PAN_DATA = {
  원형팬: [
    { name: '높은원형틀 1호', volume: 1325 },
    { name: '높은원형틀 2호', volume: 1909 },
    { name: '높은원형틀 3호', volume: 2598 },
    { name: '원형무스링1호', volume: 1237 },
    { name: '원형무스링2호', volume: 1781 },
  ],
  타르트팬: [
    { name: '타르트팬1호', volume: 265 },
    { name: '타르트팬2호', volume: 428 },
    { name: '타르트팬3호', volume: 620 },
  ],
  쉬폰팬: [
    { name: '쉬폰팬 1호', volume: 1253 },
    { name: '쉬폰팬 2호', volume: 1990 },
    { name: '쉬폰팬 3호', volume: 3175 },
  ],
  정사각틀: [
    { name: '정사각틀 1호', volume: 820 },
    { name: '정사각틀 2호', volume: 1225 },
  ],
};

// 현재 화면은 제빵용이므로 BREAD_PAN_DATA 사용
const PAN_DATA = BREAD_PAN_DATA;

// 제빵용 비용적 (cm³/g)
const BREAD_SPECIFIC_VOLUMES: Record<string, number> = {
  '풀먼식빵': 4.2,
  '산형식빵': 3.4,
  '버터톱식빵': 4.2,
  '옥수수식빵': 3.95,
  '우유식빵': 4.0,
  '모닝빵': 3.2,
  '베이글': 2.8,
  '브리오슈': 3.5,
  '치아바타': 4.5,
  '바게트': 5.0,
};

// 제과용 비용적 - 나중에 제과 화면에서 사용
const CAKE_SPECIFIC_VOLUMES: Record<string, number> = {
  '파운드케이크': 2.4,
  '레이어케이크': 2.96,
  '엔젤푸드케이크': 4.7,
  '스펀지케이크': 5.8,
  '시폰케이크': 5.5,
  '무스케이크': 2.0,
};

// 현재 화면은 제빵용
const SPECIFIC_VOLUMES = BREAD_SPECIFIC_VOLUMES;

const METHOD_RATIOS: Record<string, { flour: number; water: number }> = {
  straight: { flour: 0, water: 0 },
  sponge: { flour: 0.5, water: 1.0 },
  poolish: { flour: 0.6, water: 0.7 },
  biga: { flour: 0.5, water: 0.3 },
  levain: { flour: 0.2, water: 0.2 },
};

const METHOD_LABELS: Record<string, string> = {
  straight: '스트레이트', sponge: '중종법', poolish: '폴리쉬',
  biga: '비가', levain: '르방',
};

const CATEGORY_LABELS: Record<string, string> = {
  flour: '가루', liquid: '수분', wetOther: '유지', other: '기타',
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
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title, icon, defaultOpen = true, badge, badgeColor = 'bg-amber-100 text-amber-700', children
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 text-left"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          {icon}
          <span>{title}</span>
          {badge && (
            <span className={`px-1.5 py-0.5 text-xs rounded ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>
      {isOpen && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
};

// ============================================
// 메인 컴포넌트
// ============================================

const AdvancedDashboard: React.FC = () => {
  const { recipes } = useRecipeStore();

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
  const [productName, setProductName] = useState('새 레시피');
  const [author, setAuthor] = useState('');

  // 원래 팬 설정 (레시피 원본) - 비용적으로 계산된 초기값 사용
  const defaultPanWeight = Math.round(2350 / 3.4);  // 풀먼식빵팬(2350) / 산형식빵(3.4) = 691g
  const [originalPan, setOriginalPan] = useState({
    mode: 'pan' as 'pan' | 'count',
    category: '식빵팬', type: '풀먼식빵팬', quantity: 1, panWeight: defaultPanWeight,
    divisionCount: 1, divisionWeight: defaultPanWeight,  // 분할 정보
    unitCount: 10, unitWeight: 50,  // 개수 모드용
  });

  // 변환 팬 설정 (목표)
  const [pans, setPans] = useState<PanEntry[]>([
    { id: '1', mode: 'pan', category: '식빵팬', type: '풀먼식빵팬', quantity: 1, divisionCount: 1, panWeight: defaultPanWeight, divisionWeight: defaultPanWeight, unitCount: 10, unitWeight: 50 }
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
  const [method, setMethod] = useState<MethodSettings>({ type: 'straight', flourRatio: 0, waterRatio: 0 });
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

  // 배수 및 연동 설정
  const [multiplier, setMultiplier] = useState(1);
  const [isPanLinked, setIsPanLinked] = useState(true); // 팬-배수 연동 여부

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

  const hydration = useMemo(() =>
    flourTotal === 0 ? 0 : Math.round(((liquidTotal + wetOtherMoisture) / flourTotal) * 1000) / 10,
    [flourTotal, liquidTotal, wetOtherMoisture]
  );

  // 원래 팬 합계 (레시피 원본 기준)
  const originalPanTotalWeight = useMemo(() =>
    originalPan.panWeight * (originalPan.mode === 'pan' ? originalPan.quantity : 1),
    [originalPan.panWeight, originalPan.quantity, originalPan.mode]
  );

  // 변환 팬 합계 (목표)
  const panTotalWeight = useMemo(() =>
    pans.reduce((sum, p) => sum + (p.panWeight * p.quantity), 0),
    [pans]
  );

  // 자동 계산된 배수 (팬 연동 시 사용)
  // 핵심: 원래팬 → 변환팬의 비율이 배수가 됨
  const autoMultiplier = useMemo(() => {
    if (originalPanTotalWeight === 0 || panTotalWeight === 0) return 1;
    return Math.round((panTotalWeight / originalPanTotalWeight) * 100) / 100;
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
  const prefermentIngredients = useMemo(() => {
    if (!usePreferment || method.type === 'straight') return [];
    const result: any[] = [];

    ingredients.filter(i => i.category === 'flour').forEach(ing => {
      const amount = Math.round(ing.amount * method.flourRatio * effectiveMultiplier * 10) / 10;
      if (amount > 0) result.push({ ...ing, id: `pref-${ing.id}`, convertedAmount: amount });
    });

    ingredients.filter(i => i.category === 'liquid').forEach(ing => {
      const amount = Math.round(ing.amount * method.waterRatio * effectiveMultiplier * 10) / 10;
      if (amount > 0) result.push({ ...ing, id: `pref-${ing.id}`, convertedAmount: amount });
    });

    const yeast = ingredients.find(i => i.name.includes('이스트'));
    if (yeast) {
      result.push({ ...yeast, id: `pref-${yeast.id}`, convertedAmount: Math.round(yeast.amount * 0.3 * effectiveMultiplier * 10) / 10 });
    }

    return result;
  }, [ingredients, method, usePreferment, effectiveMultiplier]);

  // 본반죽 재료
  const mainDoughIngredients = useMemo(() => {
    if (!usePreferment || method.type === 'straight') return convertedIngredients;

    return ingredients.map(ing => {
      let deduction = 0;
      if (ing.category === 'flour') deduction = ing.amount * method.flourRatio;
      else if (ing.category === 'liquid') deduction = ing.amount * method.waterRatio;
      else if (ing.name.includes('이스트')) deduction = ing.amount * 0.3;

      const mainAmount = Math.round((ing.amount - deduction) * 10) / 10;
      return {
        ...ing,
        id: `main-${ing.id}`,
        amount: mainAmount,
        convertedAmount: Math.round(mainAmount * effectiveMultiplier * 10) / 10,
      };
    });
  }, [ingredients, method, usePreferment, effectiveMultiplier, convertedIngredients]);

  const prefermentTotal = useMemo(() =>
    prefermentIngredients.reduce((sum, i) => sum + (i.convertedAmount || 0), 0),
    [prefermentIngredients]
  );

  const mainDoughTotal = useMemo(() =>
    mainDoughIngredients.reduce((sum, i) => sum + (i.convertedAmount || 0), 0),
    [mainDoughIngredients]
  );

  // 동적 스타일
  const dynamicStyles = useMemo(() => getDynamicStyles(ingredients.length), [ingredients.length]);

  // ============================================
  // 이벤트 핸들러
  // ============================================

  const handleMethodChange = useCallback((type: string) => {
    const ratios = METHOD_RATIOS[type] || { flour: 0, water: 0 };
    setMethod({ type: type as any, flourRatio: ratios.flour, waterRatio: ratios.water });
    setUsePreferment(type !== 'straight');
  }, []);

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
    // 풀먼식빵팬 볼륨: 2350, 변환 대상 제품 비용적으로 계산
    const defaultPanVolume = PAN_DATA['식빵팬']?.find(p => p.name === '풀먼식빵팬')?.volume || 2350;
    const calculatedWeight = Math.round(defaultPanVolume / (SPECIFIC_VOLUMES[convertedProduct] || 3.4));

    setPans(prev => [...prev, {
      id: Date.now().toString(),
      mode: 'pan',
      category: '식빵팬', type: '풀먼식빵팬',
      quantity: 1, divisionCount: 1, panWeight: calculatedWeight, divisionWeight: calculatedWeight,
      unitCount: 10, unitWeight: 50,
    }]);
  }, [convertedProduct]);

  const removePan = useCallback((id: string) => {
    setPans(prev => prev.length > 1 ? prev.filter(p => p.id !== id) : prev);
  }, []);

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

  const addIngredient = useCallback(() => {
    const newOrder = Math.max(...ingredients.map(i => i.order), 0) + 1;
    setIngredients(prev => [...prev, {
      id: Date.now().toString(),
      order: newOrder, category: 'other', subCategory: '기타',
      name: '', ratio: 0, amount: 0, note: '',
    }]);
  }, [ingredients]);

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
        {/* 좌측: 제품 정보 */}
        <div className="flex items-center gap-3">
          <Cookie className="w-5 h-5 text-amber-600" />
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="text-lg font-bold w-36 border-b border-transparent hover:border-gray-300 focus:border-amber-500 focus:outline-none"
            placeholder="제품명"
          />
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="text-xs text-gray-400 w-20 border-b border-transparent hover:border-gray-300 focus:outline-none"
            placeholder="작성자"
          />
        </div>

        {/* 중앙: 배수 조절 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPanLinked(!isPanLinked)}
            className={`p-1.5 rounded flex items-center gap-1 ${isPanLinked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
            title={isPanLinked ? '팬-배수 자동 연동 중 (클릭: 수동 모드)' : '수동 배수 모드 (클릭: 자동 연동)'}
          >
            {isPanLinked ? <Link className="w-4 h-4" /> : <Unlink className="w-4 h-4" />}
            <span className="text-xs">{isPanLinked ? '자동' : '수동'}</span>
          </button>
          <span className="text-xs text-gray-500">배수:</span>
          {isPanLinked ? (
            /* 연동 모드: 자동 계산된 배수 표시 (읽기 전용) */
            <div className="flex items-center border border-green-300 rounded overflow-hidden bg-green-50">
              <div className="px-4 py-1 font-bold text-sm text-green-700 w-20 text-center">
                ×{effectiveMultiplier}
              </div>
            </div>
          ) : (
            /* 수동 모드: 배수 입력 가능 */
            <div className="flex items-center border rounded overflow-hidden bg-white">
              <button onClick={() => setMultiplier(Math.max(0.1, multiplier - 0.5))} className="px-2 py-1 hover:bg-gray-100 border-r">
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={multiplier}
                onChange={(e) => setMultiplier(Math.max(0.1, parseFloat(e.target.value) || 1))}
                className="w-16 text-center py-1 font-bold text-sm"
                step="0.1"
              />
              <button onClick={() => setMultiplier(Math.min(20, multiplier + 0.5))} className="px-2 py-1 hover:bg-gray-100 border-l">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
          {!isPanLinked && (
            <div className="flex gap-1">
              {[0.5, 1, 1.5, 2, 3].map(m => (
                <button
                  key={m}
                  onClick={() => setMultiplier(m)}
                  className={`px-2 py-1 text-xs rounded ${multiplier === m ? 'bg-amber-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  ×{m}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 우측: 요약 + 액션 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded">
            <span>원량:<b className="text-gray-700 ml-1">{totalWeight}g</b></span>
            <span className="text-gray-300">→</span>
            <span>변환:<b className="text-blue-600 ml-1">{convertedTotal}g</b></span>
            <span className="text-gray-300">|</span>
            <span>수화율:<b className="ml-1">{hydration}%</b></span>
            <span className="text-gray-300">|</span>
            <span>팬:<b className="ml-1">{panTotalWeight}g</b></span>
            <span className="text-gray-300">|</span>
            <span>손실률:<b className={`ml-1 ${lossRate > 100 ? 'text-red-500' : lossRate < 95 ? 'text-orange-500' : 'text-green-600'}`}>{lossRate}%</b></span>
          </div>
          <div className="flex gap-1.5">
            <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-amber-500 text-white rounded hover:bg-amber-600">
              <Save className="w-4 h-4" />저장
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-200 rounded hover:bg-gray-300">
              <Download className="w-4 h-4" />내보내기
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
            title="팬/틀 설정"
            icon={<Layers className="w-4 h-4" />}
            badge={`${originalPan.quantity}팬→${pans.reduce((s, p) => s + p.quantity, 0)}팬`}
            badgeColor="bg-blue-100 text-blue-700"
          >
            <div className="space-y-3">
              {/* 원래 팬 (레시피 원본) */}
              <div className="bg-gray-100 rounded p-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-600">📋 원래 팬 (레시피)</span>
                  {/* 팬/개수 모드 토글 */}
                  <div className="flex text-xs">
                    <button
                      onClick={() => updateOriginalPan('mode', 'pan')}
                      className={`px-2 py-0.5 rounded-l border ${originalPan.mode === 'pan' ? 'bg-gray-500 text-white border-gray-500' : 'bg-white text-gray-600 border-gray-300'}`}
                    >🍞 팬</button>
                    <button
                      onClick={() => updateOriginalPan('mode', 'count')}
                      className={`px-2 py-0.5 rounded-r border-l-0 border ${originalPan.mode === 'count' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300'}`}
                    >🔢 개수</button>
                  </div>
                </div>

                {/* 팬 모드 */}
                {originalPan.mode === 'pan' && (
                  <>
                    <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                      <select value={originalPan.category} onChange={(e) => updateOriginalPan('category', e.target.value)}
                        className="text-xs border rounded px-2 py-1 bg-white">
                        {Object.keys(PAN_DATA).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <select value={originalPan.type} onChange={(e) => updateOriginalPan('type', e.target.value)}
                        className="text-xs border rounded px-2 py-1 bg-white">
                        {PAN_DATA[originalPan.category as keyof typeof PAN_DATA]?.map(p =>
                          <option key={p.name} value={p.name}>{p.name}</option>
                        )}
                      </select>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 text-xs">
                      <div>
                        <label className="text-xs text-gray-500 block">수량</label>
                        <input type="number" value={originalPan.quantity}
                          onChange={(e) => updateOriginalPan('quantity', parseInt(e.target.value) || 1)}
                          className="w-full border rounded px-1.5 py-1 text-center bg-white" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block">분할</label>
                        <input type="number" value={originalPan.divisionCount}
                          onChange={(e) => updateOriginalPan('divisionCount', parseInt(e.target.value) || 1)}
                          className="w-full border rounded px-1.5 py-1 text-center bg-white" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block">팬중량</label>
                        <input type="number" value={originalPan.panWeight}
                          onChange={(e) => updateOriginalPan('panWeight', parseInt(e.target.value) || 0)}
                          className="w-full border rounded px-1.5 py-1 text-center bg-white" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block">분할g</label>
                        <div className="text-center py-1 font-mono bg-white rounded border">{originalPan.divisionWeight}</div>
                      </div>
                    </div>
                  </>
                )}

                {/* 개수 모드 */}
                {originalPan.mode === 'count' && (
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    <div>
                      <label className="text-xs text-gray-500 block">개수</label>
                      <input type="number" value={originalPan.unitCount || 10}
                        onChange={(e) => updateOriginalPan('unitCount', parseInt(e.target.value) || 0)}
                        className="w-full border rounded px-1.5 py-1 text-center bg-white" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block">개당 g</label>
                      <input type="number" value={originalPan.unitWeight || 50}
                        onChange={(e) => updateOriginalPan('unitWeight', parseInt(e.target.value) || 0)}
                        className="w-full border rounded px-1.5 py-1 text-center bg-white" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block">합계</label>
                      <div className="text-center py-1 font-mono bg-white rounded border font-semibold">{originalPan.panWeight}g</div>
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-1 text-right">
                  합계: <b>{originalPan.panWeight * (originalPan.mode === 'pan' ? originalPan.quantity : 1)}g</b>
                </div>
              </div>

              {/* 화살표 */}
              <div className="flex justify-center text-gray-400">
                <ChevronDown className="w-5 h-5" />
              </div>

              {/* 변환 팬 (목표) */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-blue-600">🎯 변환 팬 (목표)</div>
                {pans.map((pan, idx) => (
                  <div key={pan.id} className="bg-blue-50 rounded p-2 border border-blue-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-blue-700">팬 {idx + 1}</span>
                        {/* 팬/개수 모드 토글 */}
                        <div className="flex text-xs">
                          <button
                            onClick={() => updatePan(pan.id, 'mode', 'pan')}
                            className={`px-2 py-0.5 rounded-l border ${pan.mode === 'pan' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-300'}`}
                          >🍞 팬</button>
                          <button
                            onClick={() => updatePan(pan.id, 'mode', 'count')}
                            className={`px-2 py-0.5 rounded-r border-l-0 border ${pan.mode === 'count' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300'}`}
                          >🔢 개수</button>
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
                            {Object.keys(PAN_DATA).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                          <select value={pan.type} onChange={(e) => updatePan(pan.id, 'type', e.target.value)}
                            className="text-xs border rounded px-2 py-1 bg-white">
                            {PAN_DATA[pan.category as keyof typeof PAN_DATA]?.map(p =>
                              <option key={p.name} value={p.name}>{p.name}</option>
                            )}
                          </select>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 text-xs">
                          <div>
                            <label className="text-xs text-gray-500 block">수량</label>
                            <input type="number" value={pan.quantity}
                              onChange={(e) => updatePan(pan.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full border rounded px-1.5 py-1 text-center bg-white" step="0.5" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block">분할</label>
                            <input type="number" value={pan.divisionCount}
                              onChange={(e) => updatePan(pan.id, 'divisionCount', parseInt(e.target.value) || 1)}
                              className="w-full border rounded px-1.5 py-1 text-center bg-white" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block">팬중량</label>
                            <input type="number" value={pan.panWeight}
                              onChange={(e) => updatePan(pan.id, 'panWeight', parseInt(e.target.value) || 0)}
                              className="w-full border rounded px-1.5 py-1 text-center bg-white" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block">분할g</label>
                            <div className="text-center py-1 font-mono bg-white rounded border">{pan.divisionWeight}</div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* 개수 모드 (모닝빵 등) */}
                    {pan.mode === 'count' && (
                      <div className="grid grid-cols-3 gap-1.5 text-xs">
                        <div>
                          <label className="text-xs text-gray-500 block">개수</label>
                          <input type="number" value={pan.unitCount || 10}
                            onChange={(e) => updatePan(pan.id, 'unitCount', parseInt(e.target.value) || 0)}
                            className="w-full border rounded px-1.5 py-1 text-center bg-white" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block">개당 g</label>
                          <input type="number" value={pan.unitWeight || 50}
                            onChange={(e) => updatePan(pan.id, 'unitWeight', parseInt(e.target.value) || 0)}
                            className="w-full border rounded px-1.5 py-1 text-center bg-white" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block">합계</label>
                          <div className="text-center py-1 font-mono bg-white rounded border font-semibold">{pan.panWeight}g</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={addPan} className="w-full text-xs text-blue-600 hover:text-blue-700 py-1.5 border border-dashed border-blue-300 rounded">
                  + 팬 추가
                </button>
                <div className="text-xs text-blue-700 text-right">
                  합계: <b>{panTotalWeight}g</b>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* 비용적 설정 */}
          <CollapsibleSection title="비용적" icon={<Scale className="w-4 h-4" />} defaultOpen={false}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">원제품</label>
                <select value={originalProduct} onChange={(e) => setOriginalProduct(e.target.value)}
                  className="w-full text-xs border rounded px-2 py-1">
                  {Object.keys(SPECIFIC_VOLUMES).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <div className="text-xs text-gray-400 mt-1">{SPECIFIC_VOLUMES[originalProduct]} cm³/g</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">변경제품</label>
                <select value={convertedProduct} onChange={(e) => setConvertedProduct(e.target.value)}
                  className="w-full text-xs border rounded px-2 py-1">
                  {Object.keys(SPECIFIC_VOLUMES).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <div className="text-xs text-gray-400 mt-1">{SPECIFIC_VOLUMES[convertedProduct]} cm³/g</div>
              </div>
            </div>
          </CollapsibleSection>

          {/* 오븐 설정 */}
          <CollapsibleSection
            title="오븐"
            icon={<Flame className="w-4 h-4" />}
            badge={(() => {
              const typeLabel = { convection: '컨벡션', deck: '데크', airfryer: '에어프라이' }[oven.type];
              const levelInfo = oven.type === 'convection' && oven.level ? ` ${oven.level}단` : '';
              const tempInfo = oven.type === 'deck'
                ? `${oven.firstBake.topTemp}/${oven.firstBake.bottomTemp}°C`
                : `${oven.firstBake.topTemp}°C`;
              const firstBake = `${tempInfo} ${oven.firstBake.time}분`;
              // 2차 굽기가 있으면 추가 표시
              const secondBake = oven.secondBake.time > 0
                ? oven.type === 'deck'
                  ? ` → ${oven.secondBake.topTemp}/${oven.secondBake.bottomTemp}°C ${oven.secondBake.time}분`
                  : ` → ${oven.secondBake.topTemp}°C ${oven.secondBake.time}분`
                : '';
              return `${typeLabel}${levelInfo} ${firstBake}${secondBake}`;
            })()}
            badgeColor="bg-orange-100 text-orange-700"
          >
            <div className="space-y-2">
              <div className="flex gap-1.5">
                {(['convection', 'deck', 'airfryer'] as const).map(type => (
                  <button key={type} onClick={() => setOven({ ...oven, type })}
                    className={`flex-1 px-2 py-1 text-xs rounded ${oven.type === type ? 'bg-amber-500 text-white' : 'bg-gray-100'}`}>
                    {{ convection: '컨벡션', deck: '데크', airfryer: '에어프라이' }[type]}
                  </button>
                ))}
              </div>
              {/* 컨벡션 오븐일 때만 단 선택 표시 */}
              {oven.type === 'convection' && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">단 선택:</span>
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
                  {oven.level && <span className="text-amber-600 font-medium">{oven.level}단</span>}
                </div>
              )}
              <div className="bg-orange-50 rounded p-2">
                <div className="text-xs font-medium text-orange-700 mb-1.5">1차 굽기</div>
                {oven.type === 'deck' ? (
                  /* 데크 오븐: 윗불/아랫불 분리 */
                  <div className="grid grid-cols-3 gap-1.5">
                    <div><label className="text-xs text-gray-500">윗불</label>
                      <input type="number" value={oven.firstBake.topTemp}
                        onChange={(e) => setOven({ ...oven, firstBake: { ...oven.firstBake, topTemp: parseInt(e.target.value) || 0 } })}
                        className="w-full text-xs border rounded px-1.5 py-1 text-center" /></div>
                    <div><label className="text-xs text-gray-500">아랫불</label>
                      <input type="number" value={oven.firstBake.bottomTemp}
                        onChange={(e) => setOven({ ...oven, firstBake: { ...oven.firstBake, bottomTemp: parseInt(e.target.value) || 0 } })}
                        className="w-full text-xs border rounded px-1.5 py-1 text-center" /></div>
                    <div><label className="text-xs text-gray-500">시간(분)</label>
                      <input type="number" value={oven.firstBake.time}
                        onChange={(e) => setOven({ ...oven, firstBake: { ...oven.firstBake, time: parseInt(e.target.value) || 0 } })}
                        className="w-full text-xs border rounded px-1.5 py-1 text-center" /></div>
                  </div>
                ) : (
                  /* 컨벡션/에어프라이: 단일 온도 */
                  <div className="grid grid-cols-2 gap-1.5">
                    <div><label className="text-xs text-gray-500">온도</label>
                      <input type="number" value={oven.firstBake.topTemp}
                        onChange={(e) => {
                          const temp = parseInt(e.target.value) || 0;
                          setOven({ ...oven, firstBake: { ...oven.firstBake, topTemp: temp, bottomTemp: temp } });
                        }}
                        className="w-full text-xs border rounded px-1.5 py-1 text-center" /></div>
                    <div><label className="text-xs text-gray-500">시간(분)</label>
                      <input type="number" value={oven.firstBake.time}
                        onChange={(e) => setOven({ ...oven, firstBake: { ...oven.firstBake, time: parseInt(e.target.value) || 0 } })}
                        className="w-full text-xs border rounded px-1.5 py-1 text-center" /></div>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-xs text-gray-500 mb-1.5">2차 굽기 (선택)</div>
                {oven.type === 'deck' ? (
                  /* 데크 오븐: 윗불/아랫불 분리 */
                  <div className="grid grid-cols-3 gap-1.5">
                    <input type="number" value={oven.secondBake.topTemp || ''}
                      onChange={(e) => setOven({ ...oven, secondBake: { ...oven.secondBake, topTemp: parseInt(e.target.value) || 0 } })}
                      className="text-xs border rounded px-1.5 py-1 text-center" placeholder="윗불" />
                    <input type="number" value={oven.secondBake.bottomTemp || ''}
                      onChange={(e) => setOven({ ...oven, secondBake: { ...oven.secondBake, bottomTemp: parseInt(e.target.value) || 0 } })}
                      className="text-xs border rounded px-1.5 py-1 text-center" placeholder="아랫불" />
                    <input type="number" value={oven.secondBake.time || ''}
                      onChange={(e) => setOven({ ...oven, secondBake: { ...oven.secondBake, time: parseInt(e.target.value) || 0 } })}
                      className="text-xs border rounded px-1.5 py-1 text-center" placeholder="시간" />
                  </div>
                ) : (
                  /* 컨벡션/에어프라이: 단일 온도 */
                  <div className="grid grid-cols-2 gap-1.5">
                    <input type="number" value={oven.secondBake.topTemp || ''}
                      onChange={(e) => {
                        const temp = parseInt(e.target.value) || 0;
                        setOven({ ...oven, secondBake: { ...oven.secondBake, topTemp: temp, bottomTemp: temp } });
                      }}
                      className="text-xs border rounded px-1.5 py-1 text-center" placeholder="온도" />
                    <input type="number" value={oven.secondBake.time || ''}
                      onChange={(e) => setOven({ ...oven, secondBake: { ...oven.secondBake, time: parseInt(e.target.value) || 0 } })}
                      className="text-xs border rounded px-1.5 py-1 text-center" placeholder="시간" />
                  </div>
                )}
              </div>
            </div>
          </CollapsibleSection>

          {/* 제법/사전반죽 */}
          <CollapsibleSection
            title="제법"
            icon={<Wheat className="w-4 h-4" />}
            badge={METHOD_LABELS[method.type]}
            badgeColor={method.type === 'straight' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}
          >
            <div className="space-y-2">
              <div className="grid grid-cols-5 gap-1">
                {Object.entries(METHOD_LABELS).map(([key, label]) => (
                  <button key={key} onClick={() => handleMethodChange(key)}
                    className={`px-1.5 py-1 text-xs rounded ${method.type === key ? 'bg-amber-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    {label}
                  </button>
                ))}
              </div>
              {method.type !== 'straight' && (
                <div className="bg-amber-50 rounded p-2">
                  <div className="text-xs font-medium text-amber-700 mb-1.5">사전반죽 비율</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-xs text-gray-500">밀가루 %</label>
                      <input type="number" value={method.flourRatio * 100}
                        onChange={(e) => setMethod({ ...method, flourRatio: (parseFloat(e.target.value) || 0) / 100 })}
                        className="w-full text-xs border rounded px-1.5 py-1 text-center" step="10" /></div>
                    <div><label className="text-xs text-gray-500">수분 %</label>
                      <input type="number" value={method.waterRatio * 100}
                        onChange={(e) => setMethod({ ...method, waterRatio: (parseFloat(e.target.value) || 0) / 100 })}
                        className="w-full text-xs border rounded px-1.5 py-1 text-center" step="10" /></div>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* 레이아웃 초기화 버튼 */}
          <div className="p-2 border-t">
            <button
              onClick={resetLayoutSettings}
              className="w-full flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-700 py-1"
              title="레이아웃 설정 초기화"
            >
              <RotateCcw className="w-3 h-3" />
              레이아웃 초기화
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
            <div className={`grid gap-1 h-full ${usePreferment ? 'grid-cols-3' : 'grid-cols-2'}`}>

              {/* 원래 레시피 */}
              <div className="bg-white rounded shadow-sm border flex flex-col overflow-hidden min-w-0">
                <div className="bg-gray-50 border-b px-2 py-0.5 flex items-center justify-between flex-shrink-0">
                  <span className="font-semibold text-gray-700 flex items-center gap-1 text-[11px]">
                    <Droplets className="w-3 h-3" />원래 레시피
                  </span>
                  <button onClick={addIngredient} className="text-[10px] text-amber-600 hover:text-amber-700 font-medium">+ 재료</button>
                </div>
                <div className="flex-1 overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr className={`text-gray-500 ${dynamicStyles.fontSize}`}>
                        <th className="px-1.5 py-1 text-left w-16">분류</th>
                        <th className="px-1.5 py-1 text-left">재료</th>
                        <th className="px-1.5 py-1 text-right w-10">%</th>
                        <th className="px-1.5 py-1 text-right w-14">g</th>
                        <th className="w-5"></th>
                      </tr>
                    </thead>
                    <tbody className={dynamicStyles.fontSize}>
                      {ingredients.map(ing => (
                        <tr key={ing.id} className={`border-b border-gray-100 hover:bg-gray-50 ${dynamicStyles.rowHeight}`}>
                          <td className="px-1.5">
                            <select value={ing.category} onChange={(e) => updateIngredient(ing.id, 'category', e.target.value)}
                              className="w-full text-xs border-0 bg-transparent p-0 focus:outline-none appearance-none cursor-pointer">
                              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                          </td>
                          <td className="px-1.5">
                            <input type="text" value={ing.name} onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                              className="w-full bg-transparent border-0 p-0 focus:outline-none text-sm" placeholder="재료명" />
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
                    </tbody>
                  </table>
                </div>
                <div className="bg-gray-50 border-t px-2 py-0.5 text-[11px] flex-shrink-0">
                  <span>합계: <b>{totalWeight}g</b></span>
                </div>
              </div>

              {/* 사전반죽 */}
              {usePreferment && (
                <div className="bg-white rounded shadow-sm border border-amber-200 flex flex-col overflow-hidden min-w-0">
                  <div className="bg-amber-50 border-b border-amber-200 px-2 py-0.5 flex-shrink-0">
                    <span className="font-semibold text-amber-700 flex items-center gap-1 text-[11px]">
                      <Wheat className="w-3 h-3" />사전반죽
                      <span className="text-[9px] font-normal text-amber-500">({METHOD_LABELS[method.type]})</span>
                    </span>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <table className="w-full">
                      <thead className="bg-amber-50 sticky top-0">
                        <tr className={`text-amber-700 ${dynamicStyles.fontSize}`}>
                          <th className="px-2 py-1 text-left">분류</th>
                          <th className="px-2 py-1 text-left">재료</th>
                          <th className="px-2 py-1 text-right w-16">g</th>
                        </tr>
                      </thead>
                      <tbody className={dynamicStyles.fontSize}>
                        {prefermentIngredients.map(ing => (
                          <tr key={ing.id} className={`border-b border-amber-100 ${dynamicStyles.rowHeight}`}>
                            <td className="px-2 text-amber-600">{CATEGORY_LABELS[ing.category]}</td>
                            <td className="px-2">{ing.name}</td>
                            <td className="px-2 text-right font-mono font-medium text-amber-700">{ing.convertedAmount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-amber-50 border-t border-amber-200 px-2 py-0.5 text-[11px] flex-shrink-0">
                    <span className="text-amber-700">합계: <b>{Math.round(prefermentTotal)}g</b></span>
                  </div>
                </div>
              )}

              {/* 본반죽/변환 레시피 */}
              <div className="bg-white rounded shadow-sm border border-blue-200 flex flex-col overflow-hidden min-w-0">
                <div className="bg-blue-50 border-b border-blue-200 px-2 py-0.5 flex items-center justify-between flex-shrink-0">
                  <span className="font-semibold text-blue-700 flex items-center gap-1 text-[11px]">
                    <ThermometerSun className="w-3 h-3" />
                    {usePreferment ? '본반죽' : '변환 레시피'}
                  </span>
                  {effectiveMultiplier !== 1 && <span className="text-[9px] bg-blue-200 text-blue-700 px-1 py-0.5 rounded font-medium">×{effectiveMultiplier}</span>}
                </div>
                <div className="flex-1 overflow-auto">
                  <table className="w-full">
                    <thead className="bg-blue-50 sticky top-0">
                      <tr className={`text-blue-700 ${dynamicStyles.fontSize}`}>
                        <th className="px-2 py-1 text-left">분류</th>
                        <th className="px-2 py-1 text-left">재료</th>
                        <th className="px-2 py-1 text-right w-16">g</th>
                      </tr>
                    </thead>
                    <tbody className={dynamicStyles.fontSize}>
                      {mainDoughIngredients.map(ing => (
                        <tr key={ing.id} className={`border-b border-blue-100 ${dynamicStyles.rowHeight}`}>
                          <td className="px-2 text-blue-600">{CATEGORY_LABELS[ing.category]}</td>
                          <td className="px-2">{ing.name}</td>
                          <td className="px-2 text-right font-mono font-medium text-blue-700">{ing.convertedAmount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-blue-50 border-t border-blue-200 px-2 py-0.5 text-[11px] flex-shrink-0">
                  <div className="flex justify-between">
                    <span className="text-blue-700">합계: <b>{Math.round(mainDoughTotal)}g</b></span>
                    {usePreferment && <span className="text-blue-500 text-[9px]">전체: {Math.round(prefermentTotal + mainDoughTotal)}g</span>}
                  </div>
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
                <ListOrdered className="w-4 h-4" />공정/메모
                <span className="text-xs font-normal text-gray-500 ml-1">
                  총 {processes.reduce((s, p) => s + (p.time || 0), 0)}분
                </span>
              </span>
              <button onClick={addProcess} className="text-xs text-amber-600 hover:text-amber-700 font-medium">+ 공정</button>
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
                        title="위로 이동"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => moveProcess(proc.id, 'down')}
                        className="text-gray-400 hover:text-gray-600 -mt-0.5"
                        disabled={idx === processes.length - 1}
                        title="아래로 이동"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-gray-400 font-mono text-[11px] w-4">{idx + 1}.</span>
                    <input
                      type="text"
                      value={proc.description}
                      onChange={(e) => updateProcess(proc.id, 'description', e.target.value)}
                      className="bg-transparent border-0 p-0 focus:outline-none text-xs flex-1 min-w-0"
                      placeholder="공정 설명"
                    />
                    {/* 시간: 값이 있을 때 뱃지 표시 + 삭제 버튼 */}
                    {proc.time ? (
                      <div className="flex items-center gap-0.5 text-[11px] text-blue-600 bg-blue-50 px-1 py-0.5 rounded group/time">
                        <Clock className="w-3 h-3" />
                        <input
                          type="number"
                          value={proc.time}
                          onChange={(e) => updateProcess(proc.id, 'time', parseInt(e.target.value) || 0)}
                          className="w-5 bg-transparent border-0 p-0 text-center focus:outline-none"
                        />
                        <span className="text-[9px]">분</span>
                        <button
                          onClick={() => updateProcess(proc.id, 'time', undefined)}
                          className="text-blue-400 hover:text-blue-600 opacity-0 group-hover/time:opacity-100 ml-0.5"
                          title="시간 삭제"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => updateProcess(proc.id, 'time', 1)}
                        className="opacity-0 group-hover:opacity-60 hover:opacity-100 text-blue-400 bg-blue-50 px-1 py-0.5 rounded"
                        title="시간 추가"
                      >
                        <Clock className="w-3 h-3" />
                      </button>
                    )}
                    {/* 온도: 값이 있을 때 뱃지 표시 + 삭제 버튼 */}
                    {proc.temp ? (
                      <div className="flex items-center gap-0.5 text-[11px] text-orange-600 bg-orange-50 px-1 py-0.5 rounded group/temp">
                        <ThermometerSun className="w-3 h-3" />
                        <input
                          type="number"
                          value={proc.temp}
                          onChange={(e) => updateProcess(proc.id, 'temp', parseInt(e.target.value) || 0)}
                          className="w-5 bg-transparent border-0 p-0 text-center focus:outline-none"
                        />
                        <span className="text-[9px]">°C</span>
                        <button
                          onClick={() => updateProcess(proc.id, 'temp', undefined)}
                          className="text-orange-400 hover:text-orange-600 opacity-0 group-hover/temp:opacity-100 ml-0.5"
                          title="온도 삭제"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => updateProcess(proc.id, 'temp', 27)}
                        className="opacity-0 group-hover:opacity-60 hover:opacity-100 text-orange-400 bg-orange-50 px-1 py-0.5 rounded"
                        title="온도 추가"
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
                      title="너비 조절"
                    >
                      <GripVertical className="w-2 h-full text-gray-300 group-hover:text-blue-400" />
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDashboard;
