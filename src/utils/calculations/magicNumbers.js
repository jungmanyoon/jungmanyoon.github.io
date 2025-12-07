/**
 * 매직넘버 시스템
 * 팬 크기와 빵 종류에 따른 최적 반죽량 계산
 */

export class MagicNumbers {
  /**
   * 제품별 기본 매직넘버
   * 팬 부피(cm³) ÷ 매직넘버 = 반죽 무게(g)
   */
  static DEFAULT_MAGIC_NUMBERS = {
    // 빵류
    'white_bread': 1.78,      // 일반 식빵
    'whole_wheat': 1.85,      // 통밀빵 (밀도 높음)
    'brioche': 1.65,          // 브리오슈 (버터 많음)
    'sandwich_loaf': 1.75,    // 샌드위치용 식빵
    'milk_bread': 1.70,       // 우유식빵
    'sourdough': 1.82,        // 사워도우
    
    // 케이크류
    'sponge_cake': 1.33,      // 스펀지 케이크
    'butter_cake': 1.45,      // 버터 케이크
    'pound_cake': 1.55,       // 파운드 케이크
    'chiffon_cake': 1.25,     // 쉬폰 케이크
    'genoise': 1.30,          // 제누아즈
    'chocolate_cake': 1.50,   // 초콜릿 케이크
    
    // 기타
    'muffin': 1.40,           // 머핀
    'cupcake': 1.35,          // 컵케이크
    'banana_bread': 1.60,     // 바나나 브레드
    'carrot_cake': 1.48,      // 당근 케이크
    'red_velvet': 1.42,       // 레드벨벳
    'cheesecake': 1.65        // 치즈케이크
  }

  /**
   * 팬 재질별 조정 계수
   */
  static MATERIAL_ADJUSTMENTS = {
    'aluminum': 1.0,          // 기준
    'dark_metal': 0.95,       // 어두운 금속 (열 흡수 좋음)
    'glass': 1.05,            // 유리 (열전도 느림)
    'ceramic': 1.08,          // 세라믹 (열전도 매우 느림)
    'silicone': 1.10,         // 실리콘 (열전도 가장 느림)
    'carbon_steel': 0.98      // 탄소강 (열전도 빠름)
  }

  /**
   * 고도별 조정 계수
   */
  static ALTITUDE_ADJUSTMENTS = {
    0: 1.0,        // 해수면
    500: 0.98,     // 500m
    1000: 0.96,    // 1000m
    1500: 0.94,    // 1500m
    2000: 0.92,    // 2000m
    2500: 0.90     // 2500m
  }

  /**
   * 매직넘버로 반죽량 계산
   * @param {number} panVolume - 팬 부피 (cm³)
   * @param {string} productType - 제품 종류
   * @param {Object} options - 추가 옵션 {material, altitude}
   * @returns {number} 권장 반죽량 (g)
   */
  static calculateDoughWeight(panVolume, productType, options = {}) {
    const baseMagicNumber = this.DEFAULT_MAGIC_NUMBERS[productType] || 1.5
    
    // 재질 조정
    const materialAdjustment = options.material ? 
      this.MATERIAL_ADJUSTMENTS[options.material] || 1.0 : 1.0
    
    // 고도 조정
    const altitudeAdjustment = options.altitude ? 
      this.getAltitudeAdjustment(options.altitude) : 1.0
    
    // 최종 매직넘버
    const adjustedMagicNumber = baseMagicNumber * materialAdjustment * altitudeAdjustment
    
    // 반죽량 계산
    const doughWeight = panVolume / adjustedMagicNumber
    
    return Math.round(doughWeight)
  }

  /**
   * 반죽량으로 필요한 팬 부피 계산
   * @param {number} doughWeight - 반죽 무게 (g)
   * @param {string} productType - 제품 종류
   * @param {Object} options - 추가 옵션
   * @returns {number} 필요한 팬 부피 (cm³)
   */
  static calculateRequiredVolume(doughWeight, productType, options = {}) {
    const baseMagicNumber = this.DEFAULT_MAGIC_NUMBERS[productType] || 1.5
    
    const materialAdjustment = options.material ? 
      this.MATERIAL_ADJUSTMENTS[options.material] || 1.0 : 1.0
    
    const altitudeAdjustment = options.altitude ? 
      this.getAltitudeAdjustment(options.altitude) : 1.0
    
    const adjustedMagicNumber = baseMagicNumber * materialAdjustment * altitudeAdjustment
    
    return Math.round(doughWeight * adjustedMagicNumber)
  }

  /**
   * 고도에 따른 조정값 계산
   * @param {number} altitude - 고도 (m)
   * @returns {number} 조정 계수
   */
  static getAltitudeAdjustment(altitude) {
    const altitudes = Object.keys(this.ALTITUDE_ADJUSTMENTS)
      .map(Number)
      .sort((a, b) => a - b)
    
    // 정확한 값이 있으면 반환
    if (this.ALTITUDE_ADJUSTMENTS[altitude]) {
      return this.ALTITUDE_ADJUSTMENTS[altitude]
    }
    
    // 보간법으로 계산
    for (let i = 0; i < altitudes.length - 1; i++) {
      if (altitude >= altitudes[i] && altitude <= altitudes[i + 1]) {
        const lower = altitudes[i]
        const upper = altitudes[i + 1]
        const lowerAdj = this.ALTITUDE_ADJUSTMENTS[lower]
        const upperAdj = this.ALTITUDE_ADJUSTMENTS[upper]
        
        const ratio = (altitude - lower) / (upper - lower)
        return lowerAdj + (upperAdj - lowerAdj) * ratio
      }
    }
    
    // 범위 밖이면 가장 가까운 값 반환
    return altitude > 2500 ? 0.88 : 1.0
  }

  /**
   * 제품 카테고리별 매직넘버 범위
   * @param {string} category - 카테고리 (bread, cake, etc)
   * @returns {Object} {min, max, average}
   */
  static getMagicNumberRange(category) {
    const ranges = {
      'bread': { min: 1.65, max: 1.85, average: 1.75 },
      'cake': { min: 1.25, max: 1.55, average: 1.40 },
      'muffin': { min: 1.35, max: 1.45, average: 1.40 },
      'specialty': { min: 1.40, max: 1.65, average: 1.52 }
    }
    
    return ranges[category] || { min: 1.3, max: 1.8, average: 1.5 }
  }

  /**
   * 사용자 정의 매직넘버 검증
   * @param {number} magicNumber - 사용자 입력 매직넘버
   * @param {string} productType - 제품 종류
   * @returns {Object} {valid: boolean, message: string}
   */
  static validateMagicNumber(magicNumber, productType) {
    const defaultValue = this.DEFAULT_MAGIC_NUMBERS[productType]
    
    if (!defaultValue) {
      return {
        valid: magicNumber >= 1.0 && magicNumber <= 2.5,
        message: '일반적인 매직넘버는 1.0에서 2.5 사이입니다.'
      }
    }
    
    const tolerance = 0.3 // 30% 허용 오차
    const min = defaultValue * (1 - tolerance)
    const max = defaultValue * (1 + tolerance)
    
    if (magicNumber < min || magicNumber > max) {
      return {
        valid: false,
        message: `${productType}의 권장 범위는 ${min.toFixed(2)} ~ ${max.toFixed(2)}입니다.`
      }
    }
    
    return {
      valid: true,
      message: '적절한 매직넘버입니다.'
    }
  }

  /**
   * 다중 팬 계산
   * @param {number} totalDough - 전체 반죽량 (g)
   * @param {Array} pans - 팬 정보 배열 [{volume, count}]
   * @param {string} productType - 제품 종류
   * @returns {Array} 각 팬별 반죽량
   */
  static distributeToMultiplePans(totalDough, pans, productType) {
    const magicNumber = this.DEFAULT_MAGIC_NUMBERS[productType] || 1.5
    
    // 각 팬의 이상적인 반죽량 계산
    const idealAmounts = pans.map(pan => ({
      ...pan,
      idealAmount: (pan.volume / magicNumber) * pan.count,
      actualAmount: 0
    }))
    
    // 전체 이상적인 양
    const totalIdeal = idealAmounts.reduce((sum, pan) => sum + pan.idealAmount, 0)
    
    // 비율에 따라 분배
    let remainingDough = totalDough
    idealAmounts.forEach((pan, index) => {
      const ratio = pan.idealAmount / totalIdeal
      const amount = index === idealAmounts.length - 1 
        ? remainingDough 
        : Math.round(totalDough * ratio)
      
      pan.actualAmount = amount
      pan.perPan = Math.round(amount / pan.count)
      remainingDough -= amount
    })
    
    return idealAmounts
  }
}

export default MagicNumbers