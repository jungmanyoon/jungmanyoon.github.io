/**
 * 한글 초성 검색 유틸리티
 * "박ㄹ" → "박력분" 같은 초성 검색 지원
 */

// 한글 유니코드 범위
const HANGUL_START = 0xAC00
const HANGUL_END = 0xD7A3
const CHO_COUNT = 588 // 21 * 28

// 초성 목록
const CHO_LIST = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
]

/**
 * 한글 문자인지 확인
 */
export function isHangul(char: string): boolean {
  const code = char.charCodeAt(0)
  return code >= HANGUL_START && code <= HANGUL_END
}

/**
 * 초성인지 확인
 */
export function isChosung(char: string): boolean {
  return CHO_LIST.includes(char)
}

/**
 * 한글 문자에서 초성 추출
 */
export function getChosung(char: string): string {
  const code = char.charCodeAt(0)
  if (code >= HANGUL_START && code <= HANGUL_END) {
    const choIndex = Math.floor((code - HANGUL_START) / CHO_COUNT)
    return CHO_LIST[choIndex]
  }
  return char
}

/**
 * 문자열에서 초성만 추출
 */
export function extractChosung(text: string): string {
  return text.split('').map(getChosung).join('')
}

/**
 * 초성 패턴 매칭 검사
 * "ㅂㄹㅂ" 패턴이 "박력분"과 매칭되는지 확인
 */
export function matchChosung(text: string, pattern: string): boolean {
  const textChosungs = extractChosung(text)
  const patternLower = pattern.toLowerCase()

  let textIdx = 0
  let patternIdx = 0

  while (textIdx < text.length && patternIdx < pattern.length) {
    const textChar = text[textIdx]
    const patternChar = pattern[patternIdx]

    // 패턴이 초성인 경우
    if (isChosung(patternChar)) {
      // 텍스트가 한글이면 초성 비교
      if (isHangul(textChar)) {
        if (getChosung(textChar) === patternChar) {
          textIdx++
          patternIdx++
        } else {
          return false
        }
      } else {
        return false
      }
    }
    // 패턴이 완성된 한글인 경우
    else if (isHangul(patternChar)) {
      if (textChar.toLowerCase() === patternChar.toLowerCase()) {
        textIdx++
        patternIdx++
      } else {
        return false
      }
    }
    // 그 외 (영문, 숫자 등)
    else {
      if (textChar.toLowerCase() === patternChar.toLowerCase()) {
        textIdx++
        patternIdx++
      } else {
        return false
      }
    }
  }

  // 패턴을 모두 소비했으면 매칭 성공
  return patternIdx === pattern.length
}

/**
 * 검색어로 재료 목록 필터링
 * 초성 검색 + 일반 검색 모두 지원
 */
export function searchIngredients(
  ingredients: string[],
  query: string
): string[] {
  if (!query.trim()) return ingredients

  const queryLower = query.toLowerCase().trim()

  return ingredients.filter(ingredient => {
    const ingredientLower = ingredient.toLowerCase()

    // 1. 일반 포함 검색
    if (ingredientLower.includes(queryLower)) {
      return true
    }

    // 2. 초성 검색 (시작 부분 매칭)
    if (matchChosung(ingredient, query)) {
      return true
    }

    // 3. 초성 패턴이 포함되어 있는지 검사
    const textChosungs = extractChosung(ingredient)
    const queryChosungs = extractChosung(query)
    if (textChosungs.includes(queryChosungs)) {
      return true
    }

    return false
  })
}

/**
 * 검색 결과 정렬 (관련도순)
 * 시작 부분 매칭 > 포함 매칭 > 초성 매칭
 */
export function sortByRelevance(
  ingredients: string[],
  query: string
): string[] {
  const queryLower = query.toLowerCase().trim()

  return [...ingredients].sort((a, b) => {
    const aLower = a.toLowerCase()
    const bLower = b.toLowerCase()

    // 시작 부분 매칭 우선
    const aStartsWith = aLower.startsWith(queryLower) || matchChosung(a, query)
    const bStartsWith = bLower.startsWith(queryLower) || matchChosung(b, query)

    if (aStartsWith && !bStartsWith) return -1
    if (!aStartsWith && bStartsWith) return 1

    // 포함 매칭
    const aIncludes = aLower.includes(queryLower)
    const bIncludes = bLower.includes(queryLower)

    if (aIncludes && !bIncludes) return -1
    if (!aIncludes && bIncludes) return 1

    // 길이순 (짧은 것 우선)
    return a.length - b.length
  })
}
