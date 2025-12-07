import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx' // Explicit extension to force cache clear
import './index.css'
import LocalStorageService from './utils/storage/localStorage.js'
import { sampleRecipes } from './data/sampleRecipes.js'

LocalStorageService.ensureVersion()

// 샘플 레시피 초기화 (데이터가 없을 때만)
const DATA_VERSION = 'v3' // 버전 변경 시 데이터 리셋

function initSampleRecipes() {
  const currentVersion = localStorage.getItem('data-version')

  // 버전이 다르면 리셋
  if (currentVersion !== DATA_VERSION) {
    localStorage.clear()
    localStorage.setItem('data-version', DATA_VERSION)
  }

  // 레시피 데이터가 없으면 샘플 로드
  const stored = localStorage.getItem('recipe-store')
  if (!stored) {
    const initialState = {
      state: {
        recipes: sampleRecipes,
        currentRecipe: null,
        draftRecipe: null,
        filters: { category: [], difficulty: [], searchQuery: '', tags: [] },
        sortBy: 'name',
        selectedRecipeIds: [],
        isEditing: false
      },
      version: 0
    }
    localStorage.setItem('recipe-store', JSON.stringify(initialState))
  }

  // app-store가 없으면 초기화
  if (!localStorage.getItem('app-store')) {
    localStorage.setItem('app-store', JSON.stringify({
      state: { activeTab: 'workspace' },
      version: 0
    }))
  }
}

initSampleRecipes()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)