/**
 * AI 기반 레시피 추천 엔진
 * 사용자 선호도, 제빵 기술 수준, 재료 가용성을 학습하여 맞춤형 레시피 추천
 */

import NutritionCalculator from '../calculations/nutritionCalculator.js'
import CostCalculator from '../calculations/costCalculator.js'
import { BakersPercentage } from '../calculations/bakersPercentage.ts'

export class RecommendationEngine {
  constructor() {
    this.userProfile = this.loadUserProfile()
    this.recipeInteractions = this.loadInteractions()
    this.similarityWeights = {
      difficulty: 0.25,
      category: 0.20,
      ingredients: 0.15,
      nutrition: 0.15,
      cost: 0.10,
      method: 0.10,
      time: 0.05
    }
  }

  /**
   * 메인 추천 함수
   */
  recommendRecipes(recipes, targetRecipe = null, options = {}) {
    const {
      count = 5,
      excludeViewed = true,
      considerUserProfile = true,
      recommendationType = 'general' // general, similar, beginner, advanced, budget, healthy
    } = options

    let candidateRecipes = [...recipes]

    // 현재 보고 있는 레시피 제외
    if (targetRecipe) {
      candidateRecipes = candidateRecipes.filter(r => r.id !== targetRecipe.id)
    }

    // 이미 본 레시피 제외 (선택적)
    if (excludeViewed && considerUserProfile) {
      const viewedIds = this.userProfile.viewedRecipes || []
      candidateRecipes = candidateRecipes.filter(r => !viewedIds.includes(r.id))
    }

    // 추천 타입별 필터링 및 가중치 조정
    candidateRecipes = this.applyRecommendationType(candidateRecipes, recommendationType)

    // 각 레시피에 대한 추천 점수 계산
    const scoredRecipes = candidateRecipes.map(recipe => ({
      recipe,
      score: this.calculateRecommendationScore(recipe, targetRecipe, recommendationType),
      reasons: this.generateRecommendationReasons(recipe, targetRecipe, recommendationType)
    }))

    // 점수순 정렬 및 상위 N개 선택
    return scoredRecipes
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(item => ({
        ...item.recipe,
        recommendationScore: Math.round(item.score * 100) / 100,
        recommendationReasons: item.reasons
      }))
  }

  /**
   * 추천 점수 계산
   */
  calculateRecommendationScore(recipe, targetRecipe, recommendationType) {
    let score = 0
    const weights = { ...this.similarityWeights }

    // 추천 타입에 따른 가중치 조정
    this.adjustWeightsForRecommendationType(weights, recommendationType)

    // 1. 난이도 적합성
    score += this.calculateDifficultyScore(recipe) * weights.difficulty

    // 2. 카테고리 선호도
    score += this.calculateCategoryScore(recipe) * weights.category

    // 3. 재료 유사성 (타겟 레시피가 있는 경우)
    if (targetRecipe) {
      score += this.calculateIngredientSimilarity(recipe, targetRecipe) * weights.ingredients
    } else {
      score += this.calculateIngredientAvailabilityScore(recipe) * weights.ingredients
    }

    // 4. 영양 적합성
    score += this.calculateNutritionScore(recipe) * weights.nutrition

    // 5. 비용 적합성
    score += this.calculateCostScore(recipe) * weights.cost

    // 6. 제법 적합성
    if (targetRecipe) {
      score += this.calculateMethodSimilarity(recipe, targetRecipe) * weights.method
    } else {
      score += this.calculateMethodScore(recipe) * weights.method
    }

    // 7. 시간 적합성
    score += this.calculateTimeScore(recipe) * weights.time

    // 사용자 상호작용 기반 보너스
    score += this.calculateInteractionBonus(recipe)

    // 계절성 보너스
    score += this.calculateSeasonalBonus(recipe)

    return Math.max(0, Math.min(100, score))
  }

  /**
   * 난이도 점수 계산
   */
  calculateDifficultyScore(recipe) {
    const userLevel = this.userProfile.skillLevel || 'intermediate'
    const recipeLevel = recipe.difficulty || 'intermediate'

    const levelScores = {
      beginner: { beginner: 100, intermediate: 70, advanced: 30, professional: 10 },
      intermediate: { beginner: 80, intermediate: 100, advanced: 80, professional: 50 },
      advanced: { beginner: 60, intermediate: 90, advanced: 100, professional: 90 },
      professional: { beginner: 40, intermediate: 70, advanced: 95, professional: 100 }
    }

    return levelScores[userLevel][recipeLevel] || 50
  }

  /**
   * 카테고리 선호도 점수
   */
  calculateCategoryScore(recipe) {
    const preferences = this.userProfile.categoryPreferences || {}
    const category = recipe.category || 'other'
    
    // 기본 점수 50점에서 시작
    let score = 50
    
    if (preferences[category]) {
      score = preferences[category] * 100
    }

    return score
  }

  /**
   * 재료 유사성 계산
   */
  calculateIngredientSimilarity(recipe1, recipe2) {
    const ingredients1 = new Set(recipe1.ingredients.map(i => i.name.toLowerCase()))
    const ingredients2 = new Set(recipe2.ingredients.map(i => i.name.toLowerCase()))
    
    const intersection = new Set([...ingredients1].filter(x => ingredients2.has(x)))
    const union = new Set([...ingredients1, ...ingredients2])
    
    // 자카드 유사도 계산
    const similarity = intersection.size / union.size
    
    return similarity * 100
  }

  /**
   * 재료 가용성 점수
   */
  calculateIngredientAvailabilityScore(recipe) {
    const availableIngredients = this.userProfile.availableIngredients || []
    const commonIngredients = ['강력분', '설탕', '소금', '물', '버터', '계란']
    
    let availabilityScore = 0
    let totalIngredients = recipe.ingredients.length

    recipe.ingredients.forEach(ingredient => {
      const name = ingredient.name.toLowerCase()
      
      if (availableIngredients.some(avail => avail.toLowerCase().includes(name))) {
        availabilityScore += 100
      } else if (commonIngredients.some(common => common.toLowerCase().includes(name))) {
        availabilityScore += 80
      } else {
        availabilityScore += 30 // 구하기 어려운 재료
      }
    })

    return availabilityScore / totalIngredients
  }

  /**
   * 영양 적합성 점수
   */
  calculateNutritionScore(recipe) {
    try {
      const totalNutrition = NutritionCalculator.calculateTotalNutrition(recipe.ingredients)
      const perServing = NutritionCalculator.calculatePerServingNutrition(
        totalNutrition, 
        recipe.servings || 1
      )
      
      const densityAnalysis = NutritionCalculator.analyzeNutritionDensity(perServing)
      
      // 사용자 영양 선호도
      const nutritionPrefs = this.userProfile.nutritionPreferences || {}
      let score = densityAnalysis.healthScore // 기본 건강 점수

      // 사용자 선호도 반영
      if (nutritionPrefs.preferLowSugar && perServing.sugar < 20) score += 10
      if (nutritionPrefs.preferHighProtein && densityAnalysis.proteinPercent > 15) score += 10
      if (nutritionPrefs.preferLowSodium && perServing.sodium < 400) score += 10
      if (nutritionPrefs.preferHighFiber && perServing.fiber > 3) score += 10

      return Math.min(100, score)
    } catch (error) {
      return 50 // 기본 점수
    }
  }

  /**
   * 비용 적합성 점수
   */
  calculateCostScore(recipe) {
    try {
      const costData = CostCalculator.calculateTotalCost(recipe)
      const costPerServing = costData.costPerServing
      
      const budgetPreference = this.userProfile.budgetPreference || 'medium'
      const budgetRanges = {
        low: { max: 3000, optimal: 2000 },
        medium: { max: 8000, optimal: 5000 },
        high: { max: 20000, optimal: 10000 }
      }
      
      const range = budgetRanges[budgetPreference]
      
      if (costPerServing <= range.optimal) {
        return 100
      } else if (costPerServing <= range.max) {
        return 100 - ((costPerServing - range.optimal) / (range.max - range.optimal)) * 50
      } else {
        return Math.max(0, 50 - ((costPerServing - range.max) / range.max) * 50)
      }
    } catch (error) {
      return 50
    }
  }

  /**
   * 제법 유사성 계산
   */
  calculateMethodSimilarity(recipe1, recipe2) {
    if (!recipe1.method || !recipe2.method) return 50

    const method1 = recipe1.method.method
    const method2 = recipe2.method.method

    // 직접적인 일치
    if (method1 === method2) return 100

    // 유사한 제법 그룹핑
    const methodGroups = {
      simple: ['straight', 'no-time'],
      preferment: ['sponge', 'poolish', 'biga'],
      advanced: ['sourdough', 'overnight']
    }

    for (const group of Object.values(methodGroups)) {
      if (group.includes(method1) && group.includes(method2)) {
        return 75
      }
    }

    return 25 // 완전히 다른 제법
  }

  /**
   * 제법 점수 계산
   */
  calculateMethodScore(recipe) {
    const userLevel = this.userProfile.skillLevel || 'intermediate'
    const method = recipe.method?.method || 'straight'

    const methodDifficulty = {
      straight: 1,
      'no-time': 1,
      sponge: 2,
      poolish: 2,
      biga: 3,
      overnight: 3,
      sourdough: 4
    }

    const userLevelScore = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      professional: 4
    }

    const methodLevel = methodDifficulty[method] || 2
    const userScore = userLevelScore[userLevel] || 2

    // 적절한 난이도면 100점, 너무 쉽거나 어려우면 점수 차감
    const diff = Math.abs(methodLevel - userScore)
    return Math.max(30, 100 - (diff * 20))
  }

  /**
   * 시간 적합성 점수
   */
  calculateTimeScore(recipe) {
    const totalTime = (recipe.prepTime || 0) + (recipe.bakingTime || 0)
    const timePreference = this.userProfile.timePreference || 'medium'
    
    const timeRanges = {
      short: { optimal: 60, max: 120 },  // 1-2시간
      medium: { optimal: 180, max: 360 }, // 3-6시간
      long: { optimal: 480, max: 1440 }   // 8-24시간
    }

    const range = timeRanges[timePreference]
    
    if (totalTime <= range.optimal) {
      return 100
    } else if (totalTime <= range.max) {
      return 100 - ((totalTime - range.optimal) / (range.max - range.optimal)) * 50
    } else {
      return Math.max(10, 50 - ((totalTime - range.max) / range.max) * 40)
    }
  }

  /**
   * 상호작용 기반 보너스
   */
  calculateInteractionBonus(recipe) {
    const interactions = this.recipeInteractions[recipe.id] || {}
    let bonus = 0

    // 긍정적 상호작용
    if (interactions.liked) bonus += 15
    if (interactions.cooked) bonus += 10
    if (interactions.saved) bonus += 5
    if (interactions.shared) bonus += 5

    // 부정적 상호작용
    if (interactions.skipped > 2) bonus -= 10
    if (interactions.rated && interactions.rated < 3) bonus -= 15

    return Math.max(-20, Math.min(20, bonus))
  }

  /**
   * 계절성 보너스
   */
  calculateSeasonalBonus(recipe) {
    const currentMonth = new Date().getMonth()
    const season = this.getCurrentSeason(currentMonth)
    const recipeTags = recipe.tags || []
    
    const seasonalTags = {
      spring: ['상큼한', '가벼운', '과일'],
      summer: ['시원한', '아이스', '레몬'],
      autumn: ['따뜻한', '견과류', '계피'],
      winter: ['진한', '초콜릿', '향신료']
    }

    const currentSeasonTags = seasonalTags[season] || []
    const matchingTags = recipeTags.filter(tag => 
      currentSeasonTags.some(seasonTag => tag.includes(seasonTag))
    )

    return matchingTags.length * 2 // 태그당 2점 보너스
  }

  /**
   * 추천 이유 생성
   */
  generateRecommendationReasons(recipe, targetRecipe, recommendationType) {
    const reasons = []

    // 추천 타입별 이유
    switch (recommendationType) {
      case 'similar':
        if (targetRecipe) {
          reasons.push(`${targetRecipe.name}와 비슷한 재료를 사용합니다`)
        }
        break
      case 'beginner':
        if (recipe.difficulty === 'beginner') {
          reasons.push('초보자도 쉽게 만들 수 있습니다')
        }
        break
      case 'budget':
        reasons.push('경제적인 재료로 만들 수 있습니다')
        break
      case 'healthy':
        reasons.push('영양가가 높고 건강한 레시피입니다')
        break
    }

    // 난이도 적합성
    const userLevel = this.userProfile.skillLevel || 'intermediate'
    if (recipe.difficulty === userLevel) {
      reasons.push(`${this.translateLevel(userLevel)} 수준에 적합합니다`)
    }

    // 시간 적합성
    const totalTime = (recipe.prepTime || 0) + (recipe.bakingTime || 0)
    if (totalTime <= 120) {
      reasons.push('빠른 시간에 만들 수 있습니다')
    }

    // 영양적 장점
    try {
      const totalNutrition = NutritionCalculator.calculateTotalNutrition(recipe.ingredients)
      const perServing = NutritionCalculator.calculatePerServingNutrition(
        totalNutrition, 
        recipe.servings || 1
      )
      
      if (perServing.protein > 10) reasons.push('단백질이 풍부합니다')
      if (perServing.fiber > 3) reasons.push('식이섬유가 풍부합니다')
      if (perServing.sodium < 400) reasons.push('나트륨이 적습니다')
    } catch (error) {
      // 영양 계산 실패시 무시
    }

    return reasons.slice(0, 3) // 최대 3개 이유만 표시
  }

  /**
   * 사용자 상호작용 기록
   */
  recordInteraction(recipeId, interactionType, value = true) {
    if (!this.recipeInteractions[recipeId]) {
      this.recipeInteractions[recipeId] = {}
    }

    const interaction = this.recipeInteractions[recipeId]

    switch (interactionType) {
      case 'view':
        interaction.views = (interaction.views || 0) + 1
        this.updateUserProfile('viewedRecipes', recipeId)
        break
      case 'like':
        interaction.liked = value
        break
      case 'cook':
        interaction.cooked = value
        interaction.cookCount = (interaction.cookCount || 0) + 1
        break
      case 'save':
        interaction.saved = value
        break
      case 'share':
        interaction.shared = value
        break
      case 'skip':
        interaction.skipped = (interaction.skipped || 0) + 1
        break
      case 'rate':
        interaction.rated = value
        break
    }

    this.saveInteractions()
  }

  /**
   * 사용자 프로필 업데이트
   */
  updateUserProfile(key, value) {
    if (key === 'viewedRecipes') {
      if (!this.userProfile.viewedRecipes) {
        this.userProfile.viewedRecipes = []
      }
      if (!this.userProfile.viewedRecipes.includes(value)) {
        this.userProfile.viewedRecipes.push(value)
        // 최근 100개만 유지
        if (this.userProfile.viewedRecipes.length > 100) {
          this.userProfile.viewedRecipes.shift()
        }
      }
    } else {
      this.userProfile[key] = value
    }
    
    this.saveUserProfile()
  }

  /**
   * 헬퍼 메서드들
   */
  getCurrentSeason(month) {
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'autumn'
    return 'winter'
  }

  translateLevel(level) {
    const translations = {
      beginner: '초급',
      intermediate: '중급',
      advanced: '고급',
      professional: '전문가'
    }
    return translations[level] || level
  }

  adjustWeightsForRecommendationType(weights, type) {
    switch (type) {
      case 'similar':
        weights.ingredients = 0.4
        weights.method = 0.2
        weights.category = 0.15
        break
      case 'beginner':
        weights.difficulty = 0.4
        weights.time = 0.15
        weights.cost = 0.15
        break
      case 'budget':
        weights.cost = 0.4
        weights.ingredients = 0.2
        break
      case 'healthy':
        weights.nutrition = 0.4
        weights.ingredients = 0.2
        break
    }
  }

  applyRecommendationType(recipes, type) {
    switch (type) {
      case 'beginner':
        return recipes.filter(r => ['beginner', 'intermediate'].includes(r.difficulty))
      case 'advanced':
        return recipes.filter(r => ['advanced', 'professional'].includes(r.difficulty))
      default:
        return recipes
    }
  }

  // 저장/로드 메서드들
  saveUserProfile() {
    try {
      localStorage.setItem('ai-user-profile', JSON.stringify(this.userProfile))
    } catch (error) {
      console.warn('사용자 프로필 저장 실패:', error)
    }
  }

  loadUserProfile() {
    try {
      const saved = localStorage.getItem('ai-user-profile')
      return saved ? JSON.parse(saved) : this.getDefaultUserProfile()
    } catch (error) {
      return this.getDefaultUserProfile()
    }
  }

  saveInteractions() {
    try {
      localStorage.setItem('ai-recipe-interactions', JSON.stringify(this.recipeInteractions))
    } catch (error) {
      console.warn('상호작용 데이터 저장 실패:', error)
    }
  }

  loadInteractions() {
    try {
      const saved = localStorage.getItem('ai-recipe-interactions')
      return saved ? JSON.parse(saved) : {}
    } catch (error) {
      return {}
    }
  }

  getDefaultUserProfile() {
    return {
      skillLevel: 'intermediate',
      categoryPreferences: {},
      timePreference: 'medium',
      budgetPreference: 'medium',
      nutritionPreferences: {},
      availableIngredients: [],
      viewedRecipes: []
    }
  }
}

export default RecommendationEngine