/**
 * 웹 워커를 React에서 쉽게 사용하기 위한 커스텀 훅
 */

import { useEffect, useRef, useCallback, useState } from 'react'

export interface WorkerOptions {
  timeout?: number // 타임아웃 설정 (ms)
  onError?: (error: Error) => void
  onTimeout?: () => void
}

export interface WorkerResult<T> {
  data: T | null
  error: Error | null
  loading: boolean
}

/**
 * 웹 워커 사용을 위한 커스텀 훅
 */
export function useWorker<TInput, TOutput>(
  workerPath: string,
  options: WorkerOptions = {}
): {
  postMessage: (data: TInput) => Promise<TOutput>
  result: WorkerResult<TOutput>
  terminate: () => void
} {
  const workerRef = useRef<Worker | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [result, setResult] = useState<WorkerResult<TOutput>>({
    data: null,
    error: null,
    loading: false
  })

  // 워커 초기화
  useEffect(() => {
    workerRef.current = new Worker(
      new URL(workerPath, import.meta.url),
      { type: 'module' }
    )

    return () => {
      workerRef.current?.terminate()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [workerPath])

  // 메시지 전송 함수
  const postMessage = useCallback((data: TInput): Promise<TOutput> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'))
        return
      }

      setResult({ data: null, error: null, loading: true })

      // 타임아웃 설정
      if (options.timeout) {
        timeoutRef.current = setTimeout(() => {
          const error = new Error('Worker timeout')
          setResult({ data: null, error, loading: false })
          options.onTimeout?.()
          reject(error)
        }, options.timeout)
      }

      // 메시지 핸들러
      const handleMessage = (event: MessageEvent) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        if (event.data.type === 'ERROR') {
          const error = new Error(event.data.error)
          setResult({ data: null, error, loading: false })
          options.onError?.(error)
          reject(error)
        } else {
          setResult({ data: event.data.result, error: null, loading: false })
          resolve(event.data.result)
        }
      }

      // 에러 핸들러
      const handleError = (error: ErrorEvent) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        const err = new Error(error.message)
        setResult({ data: null, error: err, loading: false })
        options.onError?.(err)
        reject(err)
      }

      workerRef.current.addEventListener('message', handleMessage, { once: true })
      workerRef.current.addEventListener('error', handleError, { once: true })
      workerRef.current.postMessage(data)
    })
  }, [options])

  // 워커 종료 함수
  const terminate = useCallback(() => {
    workerRef.current?.terminate()
    workerRef.current = null
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setResult({ data: null, error: null, loading: false })
  }, [])

  return { postMessage, result, terminate }
}

/**
 * 계산 전용 워커 훅
 */
export function useCalculationWorker() {
  return useWorker<any, any>(
    '../workers/calculations.worker.ts',
    {
      timeout: 10000, // 10초 타임아웃
      onError: (error) => {
        console.error('Calculation worker error:', error)
      },
      onTimeout: () => {
        console.warn('Calculation worker timeout')
      }
    }
  )
}

/**
 * 워커 풀을 사용한 병렬 처리
 */
export function useWorkerPool<TInput, TOutput>(
  workerPath: string,
  poolSize: number = navigator.hardwareConcurrency || 4
): {
  process: (items: TInput[]) => Promise<TOutput[]>
  terminate: () => void
} {
  const workersRef = useRef<Worker[]>([])

  // 워커 풀 초기화
  useEffect(() => {
    for (let i = 0; i < poolSize; i++) {
      workersRef.current.push(
        new Worker(new URL(workerPath, import.meta.url), { type: 'module' })
      )
    }

    return () => {
      workersRef.current.forEach(worker => worker.terminate())
      workersRef.current = []
    }
  }, [workerPath, poolSize])

  // 병렬 처리 함수
  const process = useCallback(async (items: TInput[]): Promise<TOutput[]> => {
    const results: TOutput[] = new Array(items.length)
    const queue = items.map((item, index) => ({ item, index }))
    
    await Promise.all(
      workersRef.current.map(async (worker) => {
        while (queue.length > 0) {
          const task = queue.shift()
          if (!task) break

          const result = await new Promise<TOutput>((resolve, reject) => {
            const handleMessage = (event: MessageEvent) => {
              if (event.data.type === 'ERROR') {
                reject(new Error(event.data.error))
              } else {
                resolve(event.data.result)
              }
            }

            worker.addEventListener('message', handleMessage, { once: true })
            worker.postMessage(task.item)
          })

          results[task.index] = result
        }
      })
    )

    return results
  }, [])

  // 워커 풀 종료
  const terminate = useCallback(() => {
    workersRef.current.forEach(worker => worker.terminate())
    workersRef.current = []
  }, [])

  return { process, terminate }
}

/**
 * 캐시를 지원하는 워커 훅
 */
export function useCachedWorker<TInput, TOutput>(
  workerPath: string,
  getCacheKey: (input: TInput) => string
): {
  postMessage: (data: TInput) => Promise<TOutput>
  clearCache: () => void
} {
  const cacheRef = useRef<Map<string, TOutput>>(new Map())
  const { postMessage: workerPostMessage } = useWorker<TInput, TOutput>(workerPath)

  const postMessage = useCallback(async (data: TInput): Promise<TOutput> => {
    const cacheKey = getCacheKey(data)
    
    // 캐시 확인
    if (cacheRef.current.has(cacheKey)) {
      return cacheRef.current.get(cacheKey)!
    }

    // 워커 실행
    const result = await workerPostMessage(data)
    
    // 캐시 저장
    cacheRef.current.set(cacheKey, result)
    
    // 캐시 크기 제한 (최대 100개)
    if (cacheRef.current.size > 100) {
      const firstKey = cacheRef.current.keys().next().value
      cacheRef.current.delete(firstKey)
    }

    return result
  }, [workerPostMessage, getCacheKey])

  const clearCache = useCallback(() => {
    cacheRef.current.clear()
  }, [])

  return { postMessage, clearCache }
}