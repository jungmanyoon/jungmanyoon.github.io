export interface Environment {
  temp: number
  humidity: number
  altitude: number
}

export class EnvironmentalTS {
  static calculatePressure(altitude: number): number {
    // 단순 모델 (kPa)
    return Math.round((101.325 * Math.exp(-altitude / 8434)) * 100) / 100
  }

  static calculateBoilingPoint(altitude: number): number {
    // 기압에 따른 물 끓는점 근사(°C)
    const pressure = this.calculatePressure(altitude)
    return Math.round((49.161 * Math.log(pressure) + 44.932) * 10) / 10
  }

  static adjustFlourForHumidity(humidity: number, flourAmount: number): number {
    if (humidity <= 40) return Math.round((flourAmount * 1.02) * 100) / 100
    if (humidity >= 70) return Math.round((flourAmount * 0.98) * 100) / 100
    return flourAmount
  }

  static adjustLiquidForHumidity(humidity: number, liquidAmount: number): number {
    if (humidity <= 40) return Math.round((liquidAmount * 1.02) * 100) / 100
    if (humidity >= 70) return Math.round((liquidAmount * 0.98) * 100) / 100
    return liquidAmount
  }

  static adjustYeastForTemperature(temp: number, yeastAmount: number): number {
    const diff = temp - 25
    const factor = diff > 0 ? Math.pow(0.975, diff / 2) : Math.pow(1.05, Math.abs(diff) / 2)
    return Math.round(yeastAmount * factor * 100) / 100
  }

  static adjustRecipeForEnvironment(recipe: any, environment: Environment) {
    const { temp, humidity, altitude } = environment
    const adjusted = JSON.parse(JSON.stringify(recipe))
    const pressure = this.calculatePressure(altitude)
    const boilingPoint = this.calculateBoilingPoint(altitude)

    adjusted.ingredients.forEach((ing: any) => {
      if (ing.type === 'flour') {
        ing.amount = this.adjustFlourForHumidity(humidity, ing.amount)
      } else if (ing.type === 'liquid') {
        ing.amount = this.adjustLiquidForHumidity(humidity, ing.amount)
      } else if (ing.type === 'yeast') {
        ing.amount = this.adjustYeastForTemperature(temp, ing.amount)
      }
    })

    if (adjusted.bakingTemp) {
      adjusted.bakingTemp = Math.round((adjusted.bakingTemp + (altitude > 1000 ? 10 : 0)) * 10) / 10
    }
    if (adjusted.bakingTime) {
      adjusted.bakingTime = Math.round(adjusted.bakingTime * (altitude > 1000 ? 1.1 : 1))
    }

    adjusted.adjustments = {
      temperature: { pressure, boilingPoint },
      humidity: { humidity },
      altitude: { altitude }
    }

    return adjusted
  }
}

export default EnvironmentalTS

