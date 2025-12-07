/**
 * useLayoutSettings - 사용자 레이아웃 설정 저장/복원 Hook
 *
 * 저장 항목:
 * - 사이드바 너비
 * - 레시피 컨테이너 높이
 * - 공정 패널 높이
 * - 개별 공정 아이템 너비
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'recipe-dashboard-layout';

interface ProcessItemSize {
  width: number;
  minHeight?: number;
}

interface LayoutSettings {
  sidebarWidth: number;
  recipeContainerHeight: number;  // 레시피 테이블 영역 비율 (0-1)
  processRowHeight: number;       // 공정 행 높이
  processPanelHeight: number;     // 공정 패널 전체 높이
  processItems: Record<string, ProcessItemSize>;  // 공정 ID별 크기
}

const DEFAULT_SETTINGS: LayoutSettings = {
  sidebarWidth: 320,
  recipeContainerHeight: 0.6,  // 60%
  processRowHeight: 36,
  processPanelHeight: 256,
  processItems: {},
};

export function useLayoutSettings() {
  const [settings, setSettings] = useState<LayoutSettings>(() => {
    // 초기 로드 시 localStorage에서 복원
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...DEFAULT_SETTINGS, ...parsed };
        }
      } catch (e) {
        console.warn('레이아웃 설정 로드 실패:', e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  // 설정 변경 시 자동 저장 (디바운스)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (e) {
        console.warn('레이아웃 설정 저장 실패:', e);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [settings]);

  // 사이드바 너비 변경
  const setSidebarWidth = useCallback((width: number) => {
    setSettings(prev => ({
      ...prev,
      sidebarWidth: Math.max(200, Math.min(500, width)),
    }));
  }, []);

  // 레시피 컨테이너 높이 비율 변경
  const setRecipeContainerHeight = useCallback((ratio: number) => {
    setSettings(prev => ({
      ...prev,
      recipeContainerHeight: Math.max(0.3, Math.min(0.8, ratio)),
    }));
  }, []);

  // 공정 행 높이 변경
  const setProcessRowHeight = useCallback((height: number) => {
    setSettings(prev => ({
      ...prev,
      processRowHeight: Math.max(28, Math.min(80, height)),
    }));
  }, []);

  // 공정 패널 전체 높이 변경
  const setProcessPanelHeight = useCallback((height: number) => {
    setSettings(prev => ({
      ...prev,
      processPanelHeight: Math.max(120, Math.min(500, height)),
    }));
  }, []);

  // 개별 공정 아이템 크기 변경
  const setProcessItemSize = useCallback((id: string, size: Partial<ProcessItemSize>) => {
    setSettings(prev => ({
      ...prev,
      processItems: {
        ...prev.processItems,
        [id]: {
          ...prev.processItems[id],
          width: size.width ?? prev.processItems[id]?.width ?? 120,
          minHeight: size.minHeight ?? prev.processItems[id]?.minHeight,
        },
      },
    }));
  }, []);

  // 공정 아이템 크기 가져오기
  const getProcessItemSize = useCallback((id: string): ProcessItemSize => {
    return settings.processItems[id] || { width: 120 };
  }, [settings.processItems]);

  // 설정 초기화
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    settings,
    setSidebarWidth,
    setRecipeContainerHeight,
    setProcessRowHeight,
    setProcessPanelHeight,
    setProcessItemSize,
    getProcessItemSize,
    resetSettings,
  };
}

export type { LayoutSettings, ProcessItemSize };
