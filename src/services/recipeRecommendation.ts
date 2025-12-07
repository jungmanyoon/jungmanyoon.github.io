/**
 * AI 기반 레시피 추천 시스템
 * 사용자 선호도 학습 및 개인화된 추천 제공
 */

import { Recipe, RecipeCategory, DifficultyLevel, BreadMethod } from '@types/recipe.types'
import { getNutritionData } from '@data/nutritionDatabase'
import { CostCalculator } from '@data/costDatabase'

// === 사용자 프로필 및 선호도 ===
export interface UserProfile {
  id: string
  skillLevel: DifficultyLevel
  preferences: UserPreferences
  history: RecipeHistory[]
  dietaryRestrictions?: DietaryRestriction[]
  equipment?: BakingEquipment[]
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  categories: Record<RecipeCategory, number> // 0-1 선호도 점수
  methods: Record<BreadMethod, number>
  flavors: Record<FlavorProfile, number>
  ingredients: {
    liked: string[]
    disliked: string[]
  }
  nutritionGoals?: {
    maxCalories?: number
    minProtein?: number
    maxSugar?: number
    lowSodium?: boolean
  }
  budgetRange?: 'economy' | 'standard' | 'premium'
  timeAvailable?: number // 분 단위
}

export type FlavorProfile = 
  | 'sweet' | 'savory' | 'nutty' | 'fruity' 
  | 'chocolate' | 'vanilla' | 'spicy' | 'buttery'

export type DietaryRestriction = 
  | 'vegan' | 'vegetarian' | 'gluten-free' | 'dairy-free' 
  | 'nut-free' | 'egg-free' | 'sugar-free' | 'low-carb'

export type BakingEquipment = 
  | 'oven' | 'stand-mixer' | 'hand-mixer' | 'bread-machine' 
  | 'food-processor' | 'pasta-machine' | 'proofing-box'

export interface RecipeHistory {
  recipeId: string
  timestamp: Date
  rating?: number // 1-5
  completed: boolean
  notes?: string
}

// === 추천 결과 ===
export interface RecommendationResult {
  recipe: Recipe
  score: number // 0-100
  reasons: string[]
  matchFactors: {
    skillMatch: number
    categoryMatch: number
    methodMatch: number
    ingredientMatch: number
    nutritionMatch: number
    budgetMatch: number
    timeMatch: number
  }
}

// === 추천 엔진 ===
export class RecipeRecommendationEngine {
  private userProfile: UserProfile
  private recipes: Recipe[]
  private learningRate = 0.1 // 학습률

  constructor(userProfile: UserProfile, recipes: Recipe[]) {
    this.userProfile = userProfile
    this.recipes = recipes
  }

  /**
   * 개인화된 레시피 추천
   */
  recommend(
    count: number = 5,
    options?: {
      excludeHistory?: boolean
      categoryFilter?: RecipeCategory
      maxTime?: number
      maxBudget?: number
    }
  ): RecommendationResult[] {
    let eligibleRecipes = [...this.recipes]

    // 필터링
    if (options?.excludeHistory) {
      const historyIds = new Set(this.userProfile.history.map(h => h.recipeId))
      eligibleRecipes = eligibleRecipes.filter(r => !historyIds.has(r.id))
    }

    if (options?.categoryFilter) {
      eligibleRecipes = eligibleRecipes.filter(r => r.category === options.categoryFilter)
    }

    if (options?.maxTime) {
      eligibleRecipes = eligibleRecipes.filter(r => r.totalTime <= options.maxTime)
    }

    // 점수 계산
    const recommendations = eligibleRecipes.map(recipe => 
      this.calculateRecommendationScore(recipe)
    )

    // 정렬 및 상위 N개 반환
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
  }

  /**
   * 추천 점수 계산
   */
  private calculateRecommendationScore(recipe: Recipe): RecommendationResult {
    const factors = {
      skillMatch: this.calculateSkillMatch(recipe),
      categoryMatch: this.calculateCategoryMatch(recipe),
      methodMatch: this.calculateMethodMatch(recipe),
      ingredientMatch: this.calculateIngredientMatch(recipe),
      nutritionMatch: this.calculateNutritionMatch(recipe),
      budgetMatch: this.calculateBudgetMatch(recipe),
      timeMatch: this.calculateTimeMatch(recipe)
    }

    // 가중치 적용
    const weights = {
      skillMatch: 0.15,
      categoryMatch: 0.20,
      methodMatch: 0.15,
      ingredientMatch: 0.20,
      nutritionMatch: 0.10,
      budgetMatch: 0.10,
      timeMatch: 0.10
    }

    const score = Object.entries(factors).reduce((sum, [key, value]) => 
      sum + value * weights[key as keyof typeof weights], 0
    )

    const reasons = this.generateReasons(recipe, factors)

    return {
      recipe,
      score: Math.round(score),
      reasons,
      matchFactors: factors
    }
  }

  /**
   * 난이도 매칭 점수
   */
  private calculateSkillMatch(recipe: Recipe): number {
    const userLevel = this.getDifficultyLevel(this.userProfile.skillLevel)
    const recipeLevel = this.getDifficultyLevel(recipe.difficulty)
    const diff = Math.abs(userLevel - recipeLevel)
    
    // 사용자 레벨과 정확히 일치하거나 약간 높은 레시피 선호
    if (diff === 0) return 100
    if (diff === 1 && recipeLevel > userLevel) return 80 // 도전적인 레시피
    if (diff === 1) return 70 // 쉬운 레시피
    return Math.max(0, 100 - diff * 30)
  }

  /**
   * 카테고리 매칭 점수
   */
  private calculateCategoryMatch(recipe: Recipe): number {
    const preference = this.userProfile.preferences.categories[recipe.category] || 0.5
    return preference * 100
  }

  /**
   * 제법 매칭 점수
   */
  private calculateMethodMatch(recipe: Recipe): number {
    const preference = this.userProfile.preferences.methods[recipe.method.method] || 0.5
    return preference * 100
  }

  /**
   * 재료 매칭 점수
   */
  private calculateIngredientMatch(recipe: Recipe): number {
    const { liked, disliked } = this.userProfile.preferences.ingredients
    const ingredients = recipe.ingredients.map(i => i.name.toLowerCase())
    
    let score = 50 // 기본 점수
    
    // 좋아하는 재료 포함
    for (const likedIngredient of liked) {
      if (ingredients.some(i => i.includes(likedIngredient.toLowerCase()))) {
        score += 10
      }
    }
    
    // 싫어하는 재료 포함
    for (const dislikedIngredient of disliked) {
      if (ingredients.some(i => i.includes(dislikedIngredient.toLowerCase()))) {
        score -= 20
      }
    }
    
    // 식이 제한 확인
    if (this.userProfile.dietaryRestrictions) {
      for (const restriction of this.userProfile.dietaryRestrictions) {
        if (!this.checkDietaryCompliance(recipe, restriction)) {
          score -= 30
        }
      }
    }
    
    return Math.max(0, Math.min(100, score))
  }

  /**
   * 영양 매칭 점수
   */
  private calculateNutritionMatch(recipe: Recipe): number {
    const goals = this.userProfile.preferences.nutritionGoals
    if (!goals) return 75 // 목표가 없으면 기본 점수
    
    let score = 100
    
    // 영양 정보 계산
    const nutrition = this.calculateRecipeNutrition(recipe)
    
    if (goals.maxCalories && nutrition.calories > goals.maxCalories) {
      score -= (nutrition.calories - goals.maxCalories) / goals.maxCalories * 50
    }
    
    if (goals.minProtein && nutrition.protein < goals.minProtein) {
      score -= (goals.minProtein - nutrition.protein) / goals.minProtein * 30
    }
    
    if (goals.maxSugar && nutrition.sugar > goals.maxSugar) {
      score -= (nutrition.sugar - goals.maxSugar) / goals.maxSugar * 40
    }
    
    if (goals.lowSodium && nutrition.sodium > 500) {
      score -= 20
    }
    
    return Math.max(0, Math.min(100, score))
  }

  /**
   * 예산 매칭 점수
   */
  private calculateBudgetMatch(recipe: Recipe): number {
    const budget = this.userProfile.preferences.budgetRange || 'standard'
    const cost = CostCalculator.calculateRecipeCost(
      recipe.ingredients,
      budget === 'economy' ? 'bulk' : budget === 'premium' ? 'retail' : 'wholesale'
    )
    
    const costPerServing = cost.totalCost / recipe.servings
    
    // 예산 범위별 적정 가격 (1인분 기준)
    const budgetRanges = {
      economy: { min: 500, max: 2000 },
      standard: { min: 1500, max: 4000 },
      premium: { min: 3000, max: 10000 }
    }
    
    const range = budgetRanges[budget]
    
    if (costPerServing >= range.min && costPerServing <= range.max) {
      return 100
    } else if (costPerServing < range.min) {
      return 80 // 저렴한 것도 괜찮음
    } else {
      // 예산 초과
      const overBudget = (costPerServing - range.max) / range.max
      return Math.max(0, 100 - overBudget * 100)
    }
  }

  /**
   * 시간 매칭 점수
   */
  private calculateTimeMatch(recipe: Recipe): number {
    const availableTime = this.userProfile.preferences.timeAvailable
    if (!availableTime) return 75 // 시간 제약 없으면 기본 점수
    
    if (recipe.totalTime <= availableTime) {
      return 100
    } else {
      const overtime = (recipe.totalTime - availableTime) / availableTime
      return Math.max(0, 100 - overtime * 50)
    }
  }

  /**
   * 추천 이유 생성
   */
  private generateReasons(recipe: Recipe, factors: RecommendationResult['matchFactors']): string[] {
    const reasons: string[] = []
    
    if (factors.skillMatch >= 80) {
      reasons.push('난이도가 적절합니다')
    }
    
    if (factors.categoryMatch >= 80) {
      reasons.push(`선호하는 ${recipe.category} 카테고리입니다`)
    }
    
    if (factors.ingredientMatch >= 80) {
      reasons.push('좋아하는 재료가 포함되어 있습니다')
    }
    
    if (factors.nutritionMatch >= 90) {
      reasons.push('영양 목표에 잘 맞습니다')
    }
    
    if (factors.budgetMatch >= 90) {
      reasons.push('예산 범위에 적합합니다')
    }
    
    if (factors.timeMatch === 100) {
      reasons.push('시간 내에 완성 가능합니다')
    }
    
    // 특별한 특징
    if (recipe.difficulty === 'beginner') {
      reasons.push('초보자도 쉽게 만들 수 있습니다')
    }
    
    return reasons
  }

  /**
   * 사용자 선호도 학습 (피드백 반영)
   */
  updatePreferences(recipeId: string, rating: number, completed: boolean): void {
    const recipe = this.recipes.find(r => r.id === recipeId)
    if (!recipe) return
    
    // 히스토리 추가
    this.userProfile.history.push({
      recipeId,
      timestamp: new Date(),
      rating,
      completed
    })
    
    // 선호도 업데이트
    const adjustment = (rating - 3) / 2 * this.learningRate // -1 ~ +1 범위
    
    // 카테고리 선호도 조정
    const currentCategoryPref = this.userProfile.preferences.categories[recipe.category] || 0.5
    this.userProfile.preferences.categories[recipe.category] = 
      Math.max(0, Math.min(1, currentCategoryPref + adjustment))
    
    // 제법 선호도 조정
    const currentMethodPref = this.userProfile.preferences.methods[recipe.method.method] || 0.5
    this.userProfile.preferences.methods[recipe.method.method] = 
      Math.max(0, Math.min(1, currentMethodPref + adjustment))
    
    // 재료 선호도 조정 (평점 4 이상이면 좋아하는 재료로 추가)
    if (rating >= 4) {
      const mainIngredients = recipe.ingredients
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3)
        .map(i => i.name)
      
      for (const ingredient of mainIngredients) {
        if (!this.userProfile.preferences.ingredients.liked.includes(ingredient)) {
          this.userProfile.preferences.ingredients.liked.push(ingredient)
        }
      }
    }
    
    this.userProfile.updatedAt = new Date()
  }

  /**
   * 유사한 레시피 찾기
   */
  findSimilarRecipes(recipeId: string, count: number = 3): Recipe[] {
    const targetRecipe = this.recipes.find(r => r.id === recipeId)
    if (!targetRecipe) return []
    
    const similarities = this.recipes
      .filter(r => r.id !== recipeId)
      .map(recipe => ({
        recipe,
        similarity: this.calculateSimilarity(targetRecipe, recipe)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, count)
    
    return similarities.map(s => s.recipe)
  }

  /**
   * 레시피 유사도 계산
   */
  private calculateSimilarity(recipe1: Recipe, recipe2: Recipe): number {
    let similarity = 0
    
    // 카테고리 일치
    if (recipe1.category === recipe2.category) similarity += 30
    
    // 제법 일치
    if (recipe1.method.method === recipe2.method.method) similarity += 20
    
    // 난이도 유사성
    const diffDiff = Math.abs(
      this.getDifficultyLevel(recipe1.difficulty) - 
      this.getDifficultyLevel(recipe2.difficulty)
    )
    similarity += Math.max(0, 20 - diffDiff * 10)
    
    // 재료 겹침
    const ingredients1 = new Set(recipe1.ingredients.map(i => i.name.toLowerCase()))
    const ingredients2 = new Set(recipe2.ingredients.map(i => i.name.toLowerCase()))
    const intersection = new Set([...ingredients1].filter(x => ingredients2.has(x)))
    const union = new Set([...ingredients1, ...ingredients2])
    const jaccard = intersection.size / union.size
    similarity += jaccard * 30
    
    return similarity
  }

  // === 헬퍼 메서드 ===
  
  private getDifficultyLevel(difficulty: DifficultyLevel): number {
    const levels = { beginner: 1, intermediate: 2, advanced: 3, professional: 4 }
    return levels[difficulty]
  }

  private checkDietaryCompliance(recipe: Recipe, restriction: DietaryRestriction): boolean {
    const ingredients = recipe.ingredients.map(i => i.name.toLowerCase())
    
    switch (restriction) {
      case 'vegan':
        return !ingredients.some(i => 
          i.includes('계란') || i.includes('우유') || i.includes('버터') || 
          i.includes('크림') || i.includes('치즈') || i.includes('꿀')
        )
      case 'gluten-free':
        return !ingredients.some(i => 
          i.includes('밀가루') || i.includes('강력분') || i.includes('중력분') || 
          i.includes('박력분')
        )
      case 'dairy-free':
        return !ingredients.some(i => 
          i.includes('우유') || i.includes('버터') || i.includes('크림') || 
          i.includes('치즈') || i.includes('요거트')
        )
      case 'nut-free':
        return !ingredients.some(i => 
          i.includes('아몬드') || i.includes('호두') || i.includes('피스타치오') || 
          i.includes('땅콩') || i.includes('견과')
        )
      case 'egg-free':
        return !ingredients.some(i => i.includes('계란'))
      case 'sugar-free':
        return !ingredients.some(i => 
          i.includes('설탕') || i.includes('황설탕') || i.includes('꿀') || 
          i.includes('시럽')
        )
      default:
        return true
    }
  }

  private calculateRecipeNutrition(recipe: Recipe): {
    calories: number
    protein: number
    carbohydrates: number
    fat: number
    sugar: number
    sodium: number
  } {
    let totals = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      sugar: 0,
      sodium: 0
    }
    
    for (const ingredient of recipe.ingredients) {
      const nutrition = getNutritionData(ingredient.name)
      if (nutrition) {
        const ratio = ingredient.amount / 100
        totals.calories += nutrition.calories * ratio
        totals.protein += nutrition.protein * ratio
        totals.carbohydrates += nutrition.carbohydrates * ratio
        totals.fat += nutrition.fat * ratio
        totals.sugar += nutrition.sugar * ratio
        totals.sodium += nutrition.sodium * ratio
      }
    }
    
    // 1인분 기준으로 변환
    const servings = recipe.servings || 1
    return {
      calories: Math.round(totals.calories / servings),
      protein: Math.round(totals.protein / servings * 10) / 10,
      carbohydrates: Math.round(totals.carbohydrates / servings * 10) / 10,
      fat: Math.round(totals.fat / servings * 10) / 10,
      sugar: Math.round(totals.sugar / servings * 10) / 10,
      sodium: Math.round(totals.sodium / servings)
    }
  }
}

/**
 * 초보자를 위한 추천
 */
export function getBeginnerRecommendations(recipes: Recipe[]): Recipe[] {
  return recipes
    .filter(r => r.difficulty === 'beginner')
    .sort((a, b) => a.totalTime - b.totalTime)
    .slice(0, 5)
}

/**
 * 빠른 레시피 추천
 */
export function getQuickRecipes(recipes: Recipe[], maxTime: number = 60): Recipe[] {
  return recipes
    .filter(r => r.totalTime <= maxTime)
    .sort((a, b) => a.totalTime - b.totalTime)
    .slice(0, 5)
}

/**
 * 건강한 레시피 추천
 */
export function getHealthyRecipes(recipes: Recipe[]): Recipe[] {
  return recipes.map(recipe => {
    const nutrition = recipes.map(r => {
      let totalCalories = 0
      let totalSugar = 0
      
      for (const ingredient of r.ingredients) {
        const data = getNutritionData(ingredient.name)
        if (data) {
          totalCalories += data.calories * (ingredient.amount / 100)
          totalSugar += data.sugar * (ingredient.amount / 100)
        }
      }
      
      return {
        recipe: r,
        caloriesPerServing: totalCalories / r.servings,
        sugarPerServing: totalSugar / r.servings
      }
    })
    
    return nutrition
      .filter(n => n.caloriesPerServing < 300 && n.sugarPerServing < 20)
      .sort((a, b) => a.caloriesPerServing - b.caloriesPerServing)
      .slice(0, 5)
      .map(n => n.recipe)
  }).flat()
}