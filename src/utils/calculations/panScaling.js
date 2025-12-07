/**
 * 팬 크기별 조정 계산 모듈
 * 다양한 팬 형태와 크기에 따른 재료량 자동 계산
 */

export class PanScaling {
  /**
   * 원형 팬 부피 계산
   * @param {number} diameter - 지름 (cm)
   * @param {number} height - 높이 (cm)
   * @returns {number} 부피 (cm³)
   */
  static calculateRoundPanVolume(diameter, height) {
    const radius = diameter / 2
    return Math.PI * radius * radius * height
  }

  /**
   * 사각 팬 부피 계산
   * @param {number} length - 길이 (cm)
   * @param {number} width - 너비 (cm)
   * @param {number} height - 높이 (cm)
   * @returns {number} 부피 (cm³)
   */
  static calculateSquarePanVolume(length, width, height) {
    return length * width * height
  }

  /**
   * 식빵틀 부피 계산 (사다리꼴 단면)
   * @param {number} topLength - 윗면 길이 (cm)
   * @param {number} bottomLength - 아랫면 길이 (cm)
   * @param {number} width - 너비 (cm)
   * @param {number} height - 높이 (cm)
   * @returns {number} 부피 (cm³)
   */
  static calculateLoafPanVolume(topLength, bottomLength, width, height) {
    const avgLength = (topLength + bottomLength) / 2
    return avgLength * width * height
  }

  /**
   * 쉬폰 케이크 틀 부피 계산 (중앙 구멍 있음)
   * @param {number} outerDiameter - 외경 (cm)
   * @param {number} innerDiameter - 내경 (cm)
   * @param {number} height - 높이 (cm)
   * @returns {number} 부피 (cm³)
   */
  static calculateChiffonPanVolume(outerDiameter, innerDiameter, height) {
    const outerVolume = this.calculateRoundPanVolume(outerDiameter, height)
    const innerVolume = this.calculateRoundPanVolume(innerDiameter, height)
    return outerVolume - innerVolume
  }

  /**
   * 반죽 부피 계산 (팬 부피 대비 적정 비율)
   * @param {number} panVolume - 팬 부피 (cm³)
   * @param {string} productType - 제품 유형
   * @returns {number} 권장 반죽 부피 (cm³)
   */
  static calculateDoughVolume(panVolume, productType) {
    const fillRatios = {
      'bread': 0.5,        // 식빵류 50%
      'cake': 0.65,        // 케이크류 65%
      'chiffon': 0.75,     // 쉬폰케이크 75%
      'pound': 0.7,        // 파운드케이크 70%
      'muffin': 0.75,      // 머핀 75%
      'roll': 0.6          // 롤케이크 60%
    }

    const ratio = fillRatios[productType] || 0.65
    return panVolume * ratio
  }

  /**
   * 스케일링 팩터 계산
   * @param {Object} originalPan - 원본 팬 정보
   * @param {Object} targetPan - 목표 팬 정보
   * @returns {number} 스케일링 팩터
   */
  static calculateScalingFactor(originalPan, targetPan) {
    const originalVolume = this.calculatePanVolume(originalPan)
    const targetVolume = this.calculatePanVolume(targetPan)
    
    return targetVolume / originalVolume
  }

  /**
   * 팬 타입에 따른 부피 계산
   * @param {Object} pan - 팬 정보 {type, dimensions}
   * @returns {number} 부피 (cm³)
   */
  static calculatePanVolume(pan) {
    const { type, dimensions } = pan

    switch (type) {
      case 'round':
        return this.calculateRoundPanVolume(
          dimensions.diameter,
          dimensions.height
        )
      
      case 'square':
      case 'rectangle':
        return this.calculateSquarePanVolume(
          dimensions.length,
          dimensions.width,
          dimensions.height
        )
      
      case 'loaf':
        return this.calculateLoafPanVolume(
          dimensions.topLength,
          dimensions.bottomLength,
          dimensions.width,
          dimensions.height
        )
      
      case 'chiffon':
        return this.calculateChiffonPanVolume(
          dimensions.outerDiameter,
          dimensions.innerDiameter,
          dimensions.height
        )
      
      default:
        throw new Error(`알 수 없는 팬 타입: ${type}`)
    }
  }

  /**
   * 반죽 무게를 부피로 변환
   * @param {number} weight - 반죽 무게 (g)
   * @param {number} density - 반죽 밀도 (g/cm³)
   * @returns {number} 부피 (cm³)
   */
  static weightToVolume(weight, density = 0.55) {
    return weight / density
  }

  /**
   * 부피를 반죽 무게로 변환
   * @param {number} volume - 부피 (cm³)
   * @param {number} density - 반죽 밀도 (g/cm³)
   * @returns {number} 반죽 무게 (g)
   */
  static volumeToWeight(volume, density = 0.55) {
    return volume * density
  }

  /**
   * 베이킹 시간 조정
   * @param {number} originalTime - 원본 베이킹 시간 (분)
   * @param {number} scalingFactor - 스케일링 팩터
   * @param {string} productType - 제품 유형
   * @returns {number} 조정된 베이킹 시간 (분)
   */
  static adjustBakingTime(originalTime, scalingFactor, productType) {
    // 부피가 2배가 되어도 시간은 약 1.3배만 증가
    const timeAdjustmentFactor = Math.pow(scalingFactor, 0.33)
    
    // 제품별 조정 계수
    const productFactors = {
      'bread': 1.0,
      'cake': 0.9,
      'chiffon': 0.85,
      'pound': 1.1,
      'muffin': 0.8,
      'roll': 0.7
    }

    const productFactor = productFactors[productType] || 1.0
    
    return Math.round(originalTime * timeAdjustmentFactor * productFactor)
  }

  /**
   * 베이킹 온도 조정
   * @param {number} originalTemp - 원본 온도 (°C)
   * @param {number} scalingFactor - 스케일링 팩터
   * @returns {number} 조정된 온도 (°C)
   */
  static adjustBakingTemperature(originalTemp, scalingFactor) {
    // 큰 팬: 온도 5-10도 감소
    // 작은 팬: 온도 5-10도 증가
    if (scalingFactor > 1.5) {
      return originalTemp - 10
    } else if (scalingFactor > 1.2) {
      return originalTemp - 5
    } else if (scalingFactor < 0.5) {
      return originalTemp + 10
    } else if (scalingFactor < 0.8) {
      return originalTemp + 5
    }
    
    return originalTemp
  }

  /**
   * 팬 추천
   * @param {number} doughWeight - 반죽 무게 (g)
   * @param {string} productType - 제품 유형
   * @returns {Array} 추천 팬 목록
   */
  static recommendPans(doughWeight, productType) {
    const doughVolume = this.weightToVolume(doughWeight)
    const requiredPanVolume = doughVolume / (this.getFillRatio(productType))

    // 일반적인 팬 크기 데이터베이스
    const commonPans = [
      { type: 'round', name: '6인치 원형', dimensions: { diameter: 15, height: 7 } },
      { type: 'round', name: '8인치 원형', dimensions: { diameter: 20, height: 7 } },
      { type: 'round', name: '10인치 원형', dimensions: { diameter: 25, height: 7 } },
      { type: 'square', name: '8인치 정사각', dimensions: { length: 20, width: 20, height: 5 } },
      { type: 'loaf', name: '미니 식빵틀', dimensions: { topLength: 15, bottomLength: 12, width: 8, height: 7 } },
      { type: 'loaf', name: '1근 식빵틀', dimensions: { topLength: 20, bottomLength: 17, width: 10, height: 10 } },
      { type: 'chiffon', name: '17cm 쉬폰틀', dimensions: { outerDiameter: 17, innerDiameter: 7, height: 8 } }
    ]

    return commonPans
      .map(pan => ({
        ...pan,
        volume: this.calculatePanVolume(pan),
        suitability: Math.abs(1 - (this.calculatePanVolume(pan) / requiredPanVolume))
      }))
      .filter(pan => pan.suitability < 0.3)
      .sort((a, b) => a.suitability - b.suitability)
  }

  /**
   * 제품별 적정 충전율 반환
   * @param {string} productType - 제품 유형
   * @returns {number} 충전율
   */
  static getFillRatio(productType) {
    const fillRatios = {
      'bread': 0.5,
      'cake': 0.65,
      'chiffon': 0.75,
      'pound': 0.7,
      'muffin': 0.75,
      'roll': 0.6
    }
    
    return fillRatios[productType] || 0.65
  }
}

export default PanScaling