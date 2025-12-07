/**
 * 프리로드를 지원하는 지연 로딩 유틸리티
 * 사용자 인터랙션 전에 미리 컴포넌트를 로드할 수 있음
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react'

export interface PreloadableComponent<T extends ComponentType<any>> 
  extends LazyExoticComponent<T> {
  preload: () => Promise<void>
}

/**
 * 프리로드 가능한 지연 로딩 컴포넌트 생성
 */
export function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): PreloadableComponent<T> {
  const Component = lazy(factory) as PreloadableComponent<T>
  Component.preload = factory as () => Promise<void>
  return Component
}

/**
 * 여러 컴포넌트를 한번에 프리로드
 */
export async function preloadComponents(
  components: PreloadableComponent<any>[]
): Promise<void> {
  await Promise.all(components.map(component => component.preload()))
}

/**
 * 마우스 호버시 컴포넌트 프리로드
 */
export function useHoverPreload<T extends ComponentType<any>>(
  component: PreloadableComponent<T>
) {
  return {
    onMouseEnter: () => {
      component.preload()
    }
  }
}

/**
 * IntersectionObserver를 사용한 프리로드
 * 뷰포트에 가까워지면 자동으로 프리로드
 */
export function useIntersectionPreload<T extends ComponentType<any>>(
  component: PreloadableComponent<T>,
  rootMargin: string = '200px'
) {
  const preloadRef = (element: HTMLElement | null) => {
    if (!element) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            component.preload()
            observer.disconnect()
          }
        })
      },
      { rootMargin }
    )
    
    observer.observe(element)
    
    return () => observer.disconnect()
  }
  
  return preloadRef
}

/**
 * 네트워크 상태에 따른 조건부 프리로드
 */
export function preloadOnGoodConnection<T extends ComponentType<any>>(
  component: PreloadableComponent<T>
): void {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    
    // 4G 이상이거나 WiFi일 때만 프리로드
    if (
      connection.effectiveType === '4g' ||
      connection.type === 'wifi' ||
      connection.type === 'ethernet'
    ) {
      // 네트워크가 idle 상태일 때 프리로드
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          component.preload()
        })
      } else {
        // fallback: 1초 후 프리로드
        setTimeout(() => {
          component.preload()
        }, 1000)
      }
    }
  }
}

/**
 * 우선순위 기반 프리로드 큐
 */
class PreloadQueue {
  private queue: Array<{
    component: PreloadableComponent<any>
    priority: number
  }> = []
  
  private isProcessing = false
  
  add<T extends ComponentType<any>>(
    component: PreloadableComponent<T>,
    priority: number = 0
  ): void {
    this.queue.push({ component, priority })
    this.queue.sort((a, b) => b.priority - a.priority)
    
    if (!this.isProcessing) {
      this.process()
    }
  }
  
  private async process(): Promise<void> {
    this.isProcessing = true
    
    while (this.queue.length > 0) {
      const item = this.queue.shift()
      if (item) {
        await item.component.preload()
        // 다음 프리로드 전에 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    this.isProcessing = false
  }
}

export const preloadQueue = new PreloadQueue()

/**
 * 라우트 기반 프리로드 전략
 */
export function setupRoutePreloading(
  routes: Record<string, PreloadableComponent<any>>
): void {
  // 현재 라우트의 인접 라우트 프리로드
  const preloadAdjacentRoutes = (currentRoute: string) => {
    const routeKeys = Object.keys(routes)
    const currentIndex = routeKeys.indexOf(currentRoute)
    
    if (currentIndex !== -1) {
      // 이전/다음 라우트 프리로드
      if (currentIndex > 0) {
        preloadQueue.add(routes[routeKeys[currentIndex - 1]], 1)
      }
      if (currentIndex < routeKeys.length - 1) {
        preloadQueue.add(routes[routeKeys[currentIndex + 1]], 1)
      }
    }
  }
  
  // 사용 예시를 위한 더미 함수
  // 실제로는 라우터 변경 이벤트에 연결
  return { preloadAdjacentRoutes }
}