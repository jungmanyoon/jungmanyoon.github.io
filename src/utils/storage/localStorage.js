/**
 * LocalStorage 유틸리티
 * 레시피 데이터를 브라우저에 저장하고 관리
 */

const STORAGE_KEYS = {
  RECIPES: 'recipeBook_recipes',
  SETTINGS: 'recipeBook_settings',
  CURRENT_RECIPE: 'recipeBook_currentRecipe',
  VERSION: 'recipeBook_version'
}

export class LocalStorageService {
  static VERSION = 2

  static ensureVersion() {
    try {
      const ver = parseInt(localStorage.getItem(STORAGE_KEYS.VERSION) || '0', 10)
      if (!ver) {
        localStorage.setItem(STORAGE_KEYS.VERSION, String(LocalStorageService.VERSION))
        return
      }
      if (ver < LocalStorageService.VERSION) {
        // 간단한 마이그레이션 훅 (필요시 확장)
        // 예: 키 이름 변경, 데이터 정규화 등
        localStorage.setItem(STORAGE_KEYS.VERSION, String(LocalStorageService.VERSION))
      }
    } catch (e) {
      // 무시
    }
  }
  /**
   * 모든 레시피 가져오기
   * @returns {Array} 레시피 배열
   */
  static getAllRecipes() {
    try {
      this.ensureVersion()
      const data = localStorage.getItem(STORAGE_KEYS.RECIPES)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to get recipes:', error)
      return []
    }
  }

  /**
   * 레시피 저장
   * @param {Object} recipe - 저장할 레시피
   * @returns {boolean} 성공 여부
   */
  static saveRecipe(recipe) {
    try {
      this.ensureVersion()
      const recipes = this.getAllRecipes()
      const existingIndex = recipes.findIndex(r => r.id === recipe.id)
      
      if (existingIndex >= 0) {
        recipes[existingIndex] = recipe
      } else {
        recipes.push(recipe)
      }
      
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes))
      return true
    } catch (error) {
      console.error('Failed to save recipe:', error)
      return false
    }
  }

  /**
   * 특정 레시피 가져오기
   * @param {string} id - 레시피 ID
   * @returns {Object|null} 레시피 객체
   */
  static getRecipe(id) {
    const recipes = this.getAllRecipes()
    return recipes.find(r => r.id === id) || null
  }

  /**
   * 레시피 삭제
   * @param {string} id - 레시피 ID
   * @returns {boolean} 성공 여부
   */
  static deleteRecipe(id) {
    try {
      this.ensureVersion()
      const recipes = this.getAllRecipes()
      const filtered = recipes.filter(r => r.id !== id)
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(filtered))
      return true
    } catch (error) {
      console.error('Failed to delete recipe:', error)
      return false
    }
  }

  /**
   * 현재 작업중인 레시피 임시 저장
   * @param {Object} recipe - 임시 저장할 레시피
   */
  static saveCurrentRecipe(recipe) {
    try {
      this.ensureVersion()
      localStorage.setItem(STORAGE_KEYS.CURRENT_RECIPE, JSON.stringify(recipe))
    } catch (error) {
      console.error('Failed to save current recipe:', error)
    }
  }

  /**
   * 임시 저장된 레시피 가져오기
   * @returns {Object|null} 레시피 객체
   */
  static getCurrentRecipe() {
    try {
      this.ensureVersion()
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_RECIPE)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to get current recipe:', error)
      return null
    }
  }

  /**
   * 설정 저장
   * @param {Object} settings - 설정 객체
   */
  static saveSettings(settings) {
    try {
      this.ensureVersion()
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  /**
   * 설정 가져오기
   * @returns {Object} 설정 객체
   */
  static getSettings() {
    try {
      this.ensureVersion()
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      return data ? JSON.parse(data) : {
        theme: 'light',
        defaultMethod: 'straight',
        defaultUnit: 'metric',
        autoSave: true,
        language: 'ko'
      }
    } catch (error) {
      console.error('Failed to get settings:', error)
      return {
        theme: 'light',
        defaultMethod: 'straight',
        defaultUnit: 'metric',
        autoSave: true,
        language: 'ko'
      }
    }
  }
}

export default LocalStorageService