export type PanType = 'round' | 'square' | 'rectangular' | 'loaf' | 'chiffon'

export interface PanDimensions {
  diameter?: number
  height?: number
  length?: number
  width?: number
  topLength?: number
  bottomLength?: number
  outerDiameter?: number
  innerDiameter?: number
}

export interface PanConfigTS {
  type: PanType
  dimensions: PanDimensions
}

export class PanScalingTS {
  static calculateRoundPanVolume(diameter: number, height: number): number {
    const radius = diameter / 2
    return Math.PI * radius * radius * height
  }

  static calculateSquarePanVolume(length: number, width: number, height: number): number {
    return length * width * height
  }

  static calculateLoafPanVolume(topLength: number, bottomLength: number, width: number, height: number): number {
    const avgLength = (topLength + bottomLength) / 2
    return avgLength * width * height
  }

  static calculateChiffonPanVolume(outerDiameter: number, innerDiameter: number, height: number): number {
    const outerVolume = this.calculateRoundPanVolume(outerDiameter, height)
    const innerVolume = this.calculateRoundPanVolume(innerDiameter, height)
    return outerVolume - innerVolume
  }

  static calculatePanVolume(pan: PanConfigTS): number {
    const { type, dimensions } = pan
    switch (type) {
      case 'round':
        return this.calculateRoundPanVolume(dimensions.diameter!, dimensions.height!)
      case 'square':
      case 'rectangular':
        return this.calculateSquarePanVolume(dimensions.length!, dimensions.width!, dimensions.height!)
      case 'loaf':
        return this.calculateLoafPanVolume(dimensions.topLength!, dimensions.bottomLength!, dimensions.width!, dimensions.height!)
      case 'chiffon':
        return this.calculateChiffonPanVolume(dimensions.outerDiameter!, dimensions.innerDiameter!, dimensions.height!)
      default:
        throw new Error(`알 수 없는 팬 타입: ${type}`)
    }
  }

  static weightToVolume(weight: number, density: number = 0.55): number {
    return weight / density
  }

  static volumeToWeight(volume: number, density: number = 0.55): number {
    return volume * density
  }
}

export default PanScalingTS

