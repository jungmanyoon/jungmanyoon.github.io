/**
 * 제빵 제법 변환 모듈
 * 스트레이트법, 중종법, 폴리쉬법, 비가법 등 다양한 제법간 변환
 */

import { BakersPercentage } from './bakersPercentage.ts'

export class MethodConversion {
  /**
   * 스트레이트법을 중종법으로 변환
   * @param {Array} ingredients - 원본 재료 배열
   * @param {number} spongePortion - 중종 비율 (기본 70% - 전문가 표준)
   * @returns {Object} {sponge: [], mainDough: []}
   */
  static straightToSponge(ingredients, spongePortion = 0.7) {
    const flourTotal = ingredients
      .filter(ing => ing.type === 'flour')
      .reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)

    const liquidTotal = ingredients
      .filter(ing => ing.type === 'liquid' || ing.type === 'egg')
      .reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)

    const yeastTotal = ingredients
      .filter(ing => ing.type === 'yeast')
      .reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)

    // 중종용 재료 계산 (전문가 표준 기준)
    const spongeFlour = flourTotal * spongePortion
    const spongeLiquid = spongeFlour * 0.6 // 60% 수화율 (BAKERpedia 표준 58-65%)
    const spongeYeast = yeastTotal // 전체 이스트를 중종에 사용 (Wikipedia, ChainBaker 표준)
    
    // 중종 재료
    const sponge = []
    
    // 밀가루 분배
    const flourIngredients = ingredients.filter(ing => ing.type === 'flour')
    if (flourIngredients.length > 0) {
      sponge.push({
        name: flourIngredients[0].name,
        amount: spongeFlour.toFixed(1),
        unit: 'g',
        type: 'flour',
        percentage: 100
      })
    }
    
    // 액체 분배 - 기존 액체 재료에서 차감
    const liquidIngredients = ingredients.filter(ing => ing.type === 'liquid' || ing.type === 'egg')
    if (liquidIngredients.length > 0 && spongeLiquid <= liquidTotal) {
      const liquidRatio = spongeLiquid / liquidTotal
      liquidIngredients.forEach(liquid => {
        const liquidAmount = parseFloat(liquid.amount) || 0
        const spongeAmount = liquidAmount * liquidRatio
        if (spongeAmount > 0) {
          sponge.push({
            name: liquid.name,
            amount: spongeAmount.toFixed(1),
            unit: liquid.unit,
            type: liquid.type,
            percentage: (spongeAmount / spongeFlour * 100).toFixed(1)
          })
        }
      })
    }
    
    // 이스트 추가
    if (spongeYeast > 0) {
      sponge.push({
        name: '이스트',
        amount: spongeYeast.toFixed(2),
        unit: 'g',
        type: 'yeast',
        percentage: (spongeYeast / spongeFlour * 100).toFixed(1)
      })
    }

    // 본반죽 재료 계산
    const mainDough = ingredients.map(ingredient => {
      const newIngredient = { ...ingredient }
      const originalAmount = parseFloat(ingredient.amount) || 0
      
      if (ingredient.type === 'flour') {
        // 밀가루는 중종 사용량만큼 차감
        const ratio = originalAmount / flourTotal
        newIngredient.amount = (originalAmount - spongeFlour * ratio).toFixed(1)
      } else if (ingredient.type === 'liquid' || ingredient.type === 'egg') {
        // 액체는 중종에 사용된 비율만큼 차감
        const liquidRatio = spongeLiquid / liquidTotal
        newIngredient.amount = (originalAmount - originalAmount * liquidRatio).toFixed(1)
      } else if (ingredient.type === 'yeast') {
        // 이스트는 모두 중종에 사용되므로 본반죽에는 없음
        newIngredient.amount = '0'
      } else {
        newIngredient.amount = originalAmount.toFixed(1)
      }
      
      return newIngredient
    }).filter(ingredient => parseFloat(ingredient.amount) > 0)

    return {
      sponge,
      mainDough,
      method: 'sponge',
      fermentationTime: {
        sponge: '2-8시간 (24-29°C, 습도 60-80%)',
        mainDough: '1-2시간'
      },
      notes: [
        '중종법은 풍미와 기공 향상에 효과적',
        '중종 발효 시간이 길수록 복합적인 맛 발달',
        '전체 이스트를 중종에 사용하여 깊은 풍미 생성'
      ]
    }
  }

  /**
   * 스트레이트법을 폴리쉬법으로 변환
   * @param {Array} ingredients - 원본 재료 배열
   * @param {number} poolishPortion - 폴리쉬 비율 (기본 50%)
   * @returns {Object} {poolish: [], mainDough: []}
   */
  static straightToPoolish(ingredients, poolishPortion = 0.5) {
    const flourTotal = ingredients
      .filter(ing => ing.type === 'flour')
      .reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)
    
    const liquidTotal = ingredients
      .filter(ing => ing.type === 'liquid' || ing.type === 'egg')
      .reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)
    
    const yeastTotal = ingredients
      .filter(ing => ing.type === 'yeast')
      .reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)
    
    // 폴리쉬용 재료 계산
    const poolishFlour = flourTotal * poolishPortion
    const poolishLiquid = poolishFlour // 100% 수화율
    const poolishYeast = poolishFlour * 0.002 // 0.2%
    
    // 폴리쉬 재료
    const poolish = []
    
    // 밀가루 분배
    const flourIngredients = ingredients.filter(ing => ing.type === 'flour')
    if (flourIngredients.length > 0) {
      poolish.push({
        name: flourIngredients[0].name,
        amount: poolishFlour.toFixed(1),
        unit: 'g',
        type: 'flour',
        percentage: 100
      })
    }
    
    // 액체 분배 - 기존 액체 재료에서 차감
    const liquidIngredients = ingredients.filter(ing => ing.type === 'liquid' || ing.type === 'egg')
    if (liquidIngredients.length > 0 && poolishLiquid <= liquidTotal) {
      const liquidRatio = poolishLiquid / liquidTotal
      liquidIngredients.forEach(liquid => {
        const liquidAmount = parseFloat(liquid.amount) || 0
        const poolishAmount = liquidAmount * liquidRatio
        if (poolishAmount > 0) {
          poolish.push({
            name: liquid.name,
            amount: poolishAmount.toFixed(1),
            unit: liquid.unit,
            type: liquid.type,
            percentage: (poolishAmount / poolishFlour * 100).toFixed(1)
          })
        }
      })
    }
    
    // 이스트 추가
    poolish.push({
      name: '이스트',
      amount: poolishYeast.toFixed(2),
      unit: 'g',
      type: 'yeast',
      percentage: 0.2
    })

    // 본반죽 재료 계산
    const mainDough = ingredients.map(ingredient => {
      const newIngredient = { ...ingredient }
      const originalAmount = parseFloat(ingredient.amount) || 0
      
      if (ingredient.type === 'flour') {
        const ratio = originalAmount / flourTotal
        newIngredient.amount = (originalAmount - poolishFlour * ratio).toFixed(1)
      } else if (ingredient.type === 'liquid' || ingredient.type === 'egg') {
        const liquidRatio = poolishLiquid / liquidTotal
        newIngredient.amount = (originalAmount - originalAmount * liquidRatio).toFixed(1)
      } else if (ingredient.type === 'yeast') {
        newIngredient.amount = (originalAmount - poolishYeast).toFixed(2)
      } else {
        newIngredient.amount = originalAmount.toFixed(1)
      }
      
      return newIngredient
    }).filter(ingredient => parseFloat(ingredient.amount) > 0)

    return {
      poolish,
      mainDough,
      method: 'poolish',
      fermentationTime: {
        poolish: '12-16시간',
        mainDough: '1-2시간'
      }
    }
  }

  /**
   * 스트레이트법을 비가법으로 변환
   * @param {Array} ingredients - 원본 재료 배열
   * @param {number} bigaPortion - 비가 비율 (기본 60%)
   * @returns {Object} {biga: [], mainDough: []}
   */
  static straightToBiga(ingredients, bigaPortion = 0.6) {
    const flourTotal = ingredients
      .filter(ing => ing.type === 'flour')
      .reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)
    
    const liquidTotal = ingredients
      .filter(ing => ing.type === 'liquid' || ing.type === 'egg')
      .reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)
    
    const yeastTotal = ingredients
      .filter(ing => ing.type === 'yeast')
      .reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)
    
    // 비가용 재료 계산
    const bigaFlour = flourTotal * bigaPortion
    const bigaLiquid = bigaFlour * 0.5 // 50% 수화율
    const bigaYeast = bigaFlour * 0.001 // 0.1%
    
    // 비가 재료
    const biga = []
    
    // 밀가루 분배
    const flourIngredients = ingredients.filter(ing => ing.type === 'flour')
    if (flourIngredients.length > 0) {
      biga.push({
        name: flourIngredients[0].name,
        amount: bigaFlour.toFixed(1),
        unit: 'g',
        type: 'flour',
        percentage: 100
      })
    }
    
    // 액체 분배 - 기존 액체 재료에서 차감
    const liquidIngredients = ingredients.filter(ing => ing.type === 'liquid' || ing.type === 'egg')
    if (liquidIngredients.length > 0 && bigaLiquid <= liquidTotal) {
      const liquidRatio = bigaLiquid / liquidTotal
      liquidIngredients.forEach(liquid => {
        const liquidAmount = parseFloat(liquid.amount) || 0
        const bigaAmount = liquidAmount * liquidRatio
        if (bigaAmount > 0) {
          biga.push({
            name: liquid.name,
            amount: bigaAmount.toFixed(1),
            unit: liquid.unit,
            type: liquid.type,
            percentage: (bigaAmount / bigaFlour * 100).toFixed(1)
          })
        }
      })
    } else if (bigaLiquid > liquidTotal) {
      // 액체가 부족한 경우 경고
      console.warn('원본 레시피의 수화율이 너무 낮아 비가법 변환이 어렵습니다.')
    }
    
    // 이스트 추가
    biga.push({
      name: '이스트',
      amount: bigaYeast.toFixed(2),
      unit: 'g',
      type: 'yeast',
      percentage: 0.1
    })

    // 본반죽 재료 계산
    const mainDough = ingredients.map(ingredient => {
      const newIngredient = { ...ingredient }
      const originalAmount = parseFloat(ingredient.amount) || 0
      
      if (ingredient.type === 'flour') {
        const ratio = originalAmount / flourTotal
        newIngredient.amount = (originalAmount - bigaFlour * ratio).toFixed(1)
      } else if (ingredient.type === 'liquid' || ingredient.type === 'egg') {
        const liquidRatio = bigaLiquid / liquidTotal
        newIngredient.amount = (originalAmount - originalAmount * liquidRatio).toFixed(1)
      } else if (ingredient.type === 'yeast') {
        // 이스트가 없는 경우 추가
        if (originalAmount === 0) {
          newIngredient.amount = (flourTotal * 0.02 - bigaYeast).toFixed(2) // 전체 밀가루의 2%에서 비가 이스트 차감
        } else {
          newIngredient.amount = (originalAmount - bigaYeast).toFixed(2)
        }
      } else {
        newIngredient.amount = originalAmount.toFixed(1)
      }
      
      return newIngredient
    }).filter(ingredient => parseFloat(ingredient.amount) > 0)

    // 이스트가 없는 경우 본반죽에 추가
    if (!mainDough.some(ing => ing.type === 'yeast')) {
      mainDough.push({
        name: '이스트',
        amount: ((flourTotal - bigaFlour) * 0.02).toFixed(2),
        unit: 'g',
        type: 'yeast'
      })
    }

    return {
      biga,
      mainDough,
      method: 'biga',
      fermentationTime: {
        biga: '16-24시간',
        mainDough: '1-2시간'
      },
      notes: liquidTotal < bigaLiquid ? 
        '원본 레시피의 수화율이 낮아 일부 조정이 필요할 수 있습니다.' : null
    }
  }

  /**
   * 스트레이트법을 저온숙성법으로 변환
   * @param {Array} ingredients - 원본 재료 배열
   * @param {number} fermentationHours - 발효 시간 (기본 18시간)
   * @returns {Object} 저온숙성 레시피
   */
  static straightToColdFermentation(ingredients, fermentationHours = 18) {
    const flourTotal = ingredients
      .filter(ing => ing.type === 'flour')
      .reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)

    // 발효 시간에 따른 이스트 감소율 계산 (전문가 표준 기준)
    let yeastReductionFactor
    if (fermentationHours <= 12) {
      yeastReductionFactor = 0.5  // 50% (50% 감소)
    } else if (fermentationHours <= 24) {
      yeastReductionFactor = 0.35  // 35% (65% 감소) - Korean source: 1/3 권장
    } else {  // 24시간 이상
      yeastReductionFactor = 0.25  // 25% (75% 감소)
    }

    // 저온숙성법 레시피 조정 (전문가 자료 기반)
    const adjustedIngredients = ingredients.map(ingredient => {
      const newIngredient = { ...ingredient }
      const originalAmount = parseFloat(ingredient.amount) || 0

      if (ingredient.type === 'yeast') {
        // 이스트: 발효 시간에 따라 25-50% 수준으로 감소
        newIngredient.amount = (originalAmount * yeastReductionFactor).toFixed(2)
        newIngredient.note = `저온 ${fermentationHours}시간 발효를 위해 이스트량 ${Math.round((1-yeastReductionFactor)*100)}% 감소`
      } else if (ingredient.type === 'liquid') {
        // 물: 조정 불필요 (100% 유지) - 저온에서 수분 증발 최소
        newIngredient.amount = originalAmount.toFixed(1)
      } else if (ingredient.type === 'sugar') {
        // 설탕: 5% 증가 (삼투압 조정, 노화 방지) - 과도한 증가 방지
        newIngredient.amount = (originalAmount * 1.05).toFixed(1)
        newIngredient.note = '저온숙성 시 삼투압 조정 및 노화 방지 (최소 조정)'
      } else if (ingredient.type === 'fat') {
        // 버터/유지: 조정 불필요 (100% 유지) - 원본 풍미 유지
        newIngredient.amount = originalAmount.toFixed(1)
      } else {
        newIngredient.amount = originalAmount.toFixed(1)
      }

      return newIngredient
    })

    return {
      ingredients: adjustedIngredients,
      method: 'coldFermentation',
      fermentationTime: {
        cold: `${fermentationHours}시간 (4-7°C)`,
        room: '30-60분 (실온 복귀)',
        final: '40-60분 (최종 발효)'
      },
      instructions: [
        '모든 재료를 한번에 믹싱 (저속 3분, 중속 5-7분)',
        '반죽 온도 22-24°C로 맞추기 (저온 발효 시 낮은 초기 온도)',
        '반죽 완성 후 즉시 냉장고 보관 (4-7°C)',
        `${fermentationHours}시간 저온 숙성 (최소 12시간, 권장 18-24시간)`,
        '사용 30-60분 전 냉장고에서 꺼내 실온 적응',
        '가스 빼기 후 분할 및 성형',
        '40-60분 최종 발효 (28-30°C, 습도 75-80%)',
        '굽기 전 칼집 또는 증기 분사'
      ],
      advantages: [
        '풍미 향상: 장시간 발효로 복합적인 맛 발달',
        '작업 유연성: 원하는 시간에 굽기 가능',
        '노화 지연: 빵이 오래 부드러움 유지',
        '기공 개선: 촘촘하고 균일한 기공 형성'
      ],
      notes: [
        '반죽 온도가 높으면 냉장고에서도 과발효 가능',
        fermentationHours > 48 ? '48시간 이상 숙성 시 산미 발생 가능' : '',
        '재료 조정을 최소화하여 원본 레시피 풍미 유지',
        fermentationHours < 12 ? '12시간 이하 발효 시 풍미 발달 제한적' : ''
      ].filter(note => note !== '')
    }
  }

  /**
   * 탕종법으로 변환 (Water Roux Method)
   * 밀가루 일부를 뜨거운 물로 호화시켜 사용 - 부드럽고 촉촉한 식빵
   * @param {Array} ingredients - 원본 재료 배열
   * @param {number} tangzhongPortion - 탕종 비율 (기본 10%)
   * @returns {Object} {tangzhong: [], mainDough: []}
   */
  static straightToTangzhong(ingredients, tangzhongPortion = 0.1) {
    const flourTotal = ingredients
      .filter(ing => ing.type === 'flour')
      .reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)

    const liquidTotal = ingredients
      .filter(ing => ing.type === 'liquid' || ing.type === 'egg')
      .reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)

    // 탕종용 재료 계산 (밀가루 : 물 = 1 : 5 비율)
    const tangzhongFlour = flourTotal * tangzhongPortion
    const tangzhongLiquid = tangzhongFlour * 5 // 1:5 비율

    // 탕종 재료
    const tangzhong = []

    const flourIngredients = ingredients.filter(ing => ing.type === 'flour')
    if (flourIngredients.length > 0) {
      tangzhong.push({
        name: flourIngredients[0].name,
        amount: tangzhongFlour.toFixed(1),
        unit: 'g',
        type: 'flour',
        percentage: 100
      })
    }

    const liquidIngredients = ingredients.filter(ing => ing.type === 'liquid')
    if (liquidIngredients.length > 0 && tangzhongLiquid <= liquidTotal) {
      tangzhong.push({
        name: liquidIngredients[0].name,
        amount: tangzhongLiquid.toFixed(1),
        unit: 'g',
        type: 'liquid',
        percentage: 500
      })
    }

    // 본반죽 재료 계산
    const mainDough = ingredients.map(ingredient => {
      const newIngredient = { ...ingredient }
      const originalAmount = parseFloat(ingredient.amount) || 0

      if (ingredient.type === 'flour') {
        const ratio = originalAmount / flourTotal
        newIngredient.amount = (originalAmount - tangzhongFlour * ratio).toFixed(1)
      } else if (ingredient.type === 'liquid') {
        const ratio = originalAmount / liquidTotal
        newIngredient.amount = (originalAmount - tangzhongLiquid * ratio).toFixed(1)
      } else {
        newIngredient.amount = originalAmount.toFixed(1)
      }

      return newIngredient
    }).filter(ingredient => parseFloat(ingredient.amount) > 0)

    return {
      tangzhong,
      mainDough,
      method: 'tangzhong',
      fermentationTime: {
        tangzhong: '식힐 때까지 (30-60분)',
        mainDough: '1-2시간',
        final: '40-60분'
      },
      instructions: [
        '【탕종 만들기】',
        `밀가루 ${tangzhongFlour.toFixed(1)}g + 물 ${tangzhongLiquid.toFixed(1)}g를 냄비에 넣기`,
        '약불에서 저으며 65°C까지 가열 (젤처럼 걸쭉해짐)',
        '랩을 씌워 30-60분 식히기 (실온 또는 냉장)',
        '',
        '【본반죽】',
        '탕종 + 본반죽 재료를 모두 넣고 믹싱',
        '1차 발효 1-2시간',
        '분할 → 벤치타임 15분 → 성형',
        '2차 발효 40-60분',
        '굽기'
      ],
      advantages: [
        '✨ 엄청 부드럽고 촉촉함 (3-4일 지나도 부드러움)',
        '✨ 노화 방지 효과 탁월',
        '✨ 우유식빵, 생크림빵에 최적',
        '✨ 한국, 일본, 대만에서 가장 인기있는 방법'
      ],
      notes: [
        '탕종은 반드시 식혀서 사용 (뜨거우면 이스트 죽음)',
        '탕종은 냉장 보관 최대 2일',
        '일반 식빵보다 약간 더 쫀득한 식감'
      ]
    }
  }

  /**
   * 자가제분법으로 변환 (Autolyse Method)
   * 밀가루와 물을 먼저 섞어 휴지 - 반죽이 쉽고 식감 좋음
   * @param {Array} ingredients - 원본 재료 배열
   * @param {number} autolyseTime - 자가제분 시간 (기본 30분)
   * @returns {Object} 자가제분 레시피
   */
  static straightToAutolyse(ingredients, autolyseTime = 30) {
    const flourTotal = ingredients
      .filter(ing => ing.type === 'flour')
      .reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)

    const liquidTotal = ingredients
      .filter(ing => ing.type === 'liquid' || ing.type === 'egg')
      .reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)

    // 1단계: 밀가루 + 물만
    const autolyseStage = []
    ingredients.forEach(ingredient => {
      if (ingredient.type === 'flour' || ingredient.type === 'liquid') {
        autolyseStage.push({
          ...ingredient,
          amount: parseFloat(ingredient.amount).toFixed(1)
        })
      }
    })

    // 2단계: 나머지 재료 (이스트, 소금, 설탕, 버터 등)
    const finalStage = []
    ingredients.forEach(ingredient => {
      if (ingredient.type !== 'flour' && ingredient.type !== 'liquid') {
        finalStage.push({
          ...ingredient,
          amount: parseFloat(ingredient.amount).toFixed(1)
        })
      }
    })

    return {
      autolyseStage,
      finalStage,
      method: 'autolyse',
      fermentationTime: {
        autolyse: `${autolyseTime}분 (실온 휴지)`,
        mainDough: '1-2시간',
        final: '40-60분'
      },
      instructions: [
        '【1단계: 자가제분】',
        '밀가루 + 물(또는 우유)만 섞기',
        '글루텐이 보이지 않을 정도로만 대충 섞기',
        `랩을 씌워 ${autolyseTime}분 실온 휴지`,
        '→ 밀가루가 물을 자연스럽게 흡수하며 글루텐 형성',
        '',
        '【2단계: 본반죽】',
        '휴지한 반죽에 나머지 재료(이스트, 소금, 설탕, 버터) 넣기',
        '믹싱 (자가제분 덕분에 반죽 시간 30% 단축!)',
        '1차 발효 1-2시간',
        '분할 → 벤치타임 15분 → 성형',
        '2차 발효 40-60분',
        '굽기'
      ],
      advantages: [
        '✨ 반죽이 엄청 쉬워짐 (글루텐이 자연 형성)',
        '✨ 손반죽할 때 최고! (믹서 없어도 OK)',
        '✨ 반죽 시간 30% 단축',
        '✨ 식감이 쫄깃하고 부드러움',
        '✨ 바게트, 하드롤에 특히 좋음'
      ],
      notes: [
        '자가제분 시간: 20-60분 (길수록 효과 좋음)',
        '소금은 자가제분 단계에 넣으면 안됨 (글루텐 형성 방해)',
        '이스트도 나중에 넣는 게 좋음',
        '반죽 온도 24-26°C 유지'
      ]
    }
  }

  /**
   * 사워도우법으로 변환 (Sourdough / Natural Leaven)
   * 천연 발효종 사용 - 풍미 최고, 건강에 좋음
   * @param {Array} ingredients - 원본 재료 배열
   * @param {number} starterPortion - 스타터 비율 (기본 20%)
   * @returns {Object} 사워도우 레시피
   */
  static straightToSourdough(ingredients, starterPortion = 0.2) {
    const flourTotal = ingredients
      .filter(ing => ing.type === 'flour')
      .reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)

    const liquidTotal = ingredients
      .filter(ing => ing.type === 'liquid' || ing.type === 'egg')
      .reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)

    // 스타터 계산 (밀가루 20% 기준, 100% 수화율 스타터 가정)
    const starterFlour = flourTotal * starterPortion
    const starterLiquid = starterFlour // 100% 수화율

    // 본반죽 재료 계산
    const adjustedIngredients = ingredients.map(ingredient => {
      const newIngredient = { ...ingredient }
      const originalAmount = parseFloat(ingredient.amount) || 0

      if (ingredient.type === 'flour') {
        const ratio = originalAmount / flourTotal
        newIngredient.amount = (originalAmount - starterFlour * ratio).toFixed(1)
      } else if (ingredient.type === 'liquid') {
        const ratio = originalAmount / liquidTotal
        newIngredient.amount = (originalAmount - starterLiquid * ratio).toFixed(1)
      } else if (ingredient.type === 'yeast') {
        // 이스트는 사용하지 않음 (천연 발효종 사용)
        newIngredient.amount = '0'
      } else {
        newIngredient.amount = originalAmount.toFixed(1)
      }

      return newIngredient
    }).filter(ingredient => parseFloat(ingredient.amount) > 0)

    // 스타터 추가
    const starter = {
      name: '사워도우 스타터 (100% 수화율)',
      amount: (starterFlour * 2).toFixed(1), // 밀가루 + 물
      unit: 'g',
      type: 'starter',
      note: `밀가루 ${starterFlour.toFixed(1)}g + 물 ${starterLiquid.toFixed(1)}g`
    }

    return {
      ingredients: [starter, ...adjustedIngredients],
      method: 'sourdough',
      fermentationTime: {
        bulkFermentation: '4-6시간 (스트레치 앤 폴드 3-4회)',
        coldRetard: '12-48시간 (냉장, 선택사항)',
        final: '2-4시간'
      },
      instructions: [
        '【사워도우 스타터 준비】',
        '※ 스타터가 없다면 만들기: 밀가루+물 1:1로 7-14일 발효',
        '스타터를 전날 밤에 피딩 (1:1:1 비율)',
        '→ 다음날 아침 2-3배 부풀면 사용 가능',
        '',
        '【본반죽】',
        '스타터 + 본반죽 재료를 섞기',
        '30분 자가제분 (autolyse) → 소금 추가',
        '1차 발효 4-6시간 (30분마다 스트레치 앤 폴드)',
        '(선택) 냉장 숙성 12-48시간 - 풍미 더욱 향상',
        '분할 → 벤치타임 30분 → 성형',
        '2차 발효 2-4시간 (또는 냉장 12시간)',
        '칼집 → 증기 분사 → 굽기'
      ],
      advantages: [
        '✨ 풍미가 최고! 복합적이고 깊은 맛',
        '✨ 건강에 좋음 (소화 잘됨, GI 지수 낮음)',
        '✨ 천연 발효로 영양가 높음',
        '✨ 노화가 느림 (5-7일 보관 가능)',
        '✨ 이스트 알레르기 있어도 OK'
      ],
      warnings: [
        '⚠️ 시간이 오래 걸림 (최소 8-10시간, 보통 1-2일)',
        '⚠️ 스타터 관리 필요 (1주일에 1번 피딩)',
        '⚠️ 초보자에게는 어려울 수 있음',
        '⚠️ 온도와 시간 조절이 중요'
      ],
      notes: [
        '스타터 만들기: 밀가루 50g + 물 50g → 매일 피딩 7-14일',
        '스타터 보관: 냉장 1주일 OK, 냉동 3개월 OK',
        '산미 조절: 발효 시간 짧으면 덜 시큼, 길면 더 시큼',
        '사워도우는 바게트, 컨트리 브레드에 최적'
      ]
    }
  }

  /**
   * 제법 변환 추천
   * @param {string} currentMethod - 현재 제법
   * @param {Object} requirements - 요구사항 {time, flavor, texture}
   * @returns {string} 추천 제법
   */
  static recommendMethod(currentMethod, requirements) {
    const { time, flavor, texture } = requirements

    if (texture === 'soft' && texture === 'moist') {
      return 'tangzhong'
    }

    if (time === 'easy' || texture === 'chewy') {
      return 'autolyse'
    }

    if (flavor === 'complex' && time === 'long') {
      return 'sourdough'
    }

    if (flavor === 'mild' && texture === 'soft') {
      return 'poolish'
    }

    if (texture === 'chewy' && time === 'medium') {
      return 'sponge'
    }

    if (time === 'flexible') {
      return 'coldFermentation'
    }

    if (flavor === 'best') {
      return 'sourdough'
    }

    return currentMethod
  }
}

export default MethodConversion