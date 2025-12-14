# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start dev server (port 5173)
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm run test             # Run Vitest in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Run tests with coverage report
npm run e2e              # Run Playwright E2E tests
npm run e2e:ui           # Run Playwright with UI

# Utilities
npm run cleanup          # Run cleanup script
```

## Architecture

### Tech Stack
React 18 + TypeScript, Vite 5, Zustand (state), TailwindCSS, PWA (vite-plugin-pwa)

### Path Aliases (configured in vite.config.js)
- `@/` → `src/`
- `@components/` → `src/components/`
- `@stores/` → `src/stores/`
- `@utils/` → `src/utils/`
- `@types/` → `src/types/`
- `@hooks/` → `src/hooks/`
- `@data/` → `src/data/`

### State Management (Zustand)
- **useRecipeStore**: Recipe CRUD, filtering, sorting, import/export
- **useDashboardStore**: Dashboard UI state, conversion settings
- **useAppStore**: App-wide state (active tab, navigation)
- **usePanPresetStore**: Pan configuration presets
- **useWorkspaceStore**: Workspace layout state
- **useToastStore**: Toast notifications

Use selective subscriptions to avoid unnecessary re-renders:
```tsx
const { recipes } = useRecipeStore()  // Good
const store = useRecipeStore()        // Avoid
```

### Core Domain Concepts
This is a baking recipe converter. Key calculations in `src/utils/calculations/`:
- **Baker's Percentage**: All ingredients as % of flour weight (`bakersPercentage.ts`)
- **DDT (Desired Dough Temperature)**: Calculate water temp for target dough temp (`ddtCalculator.ts`)
- **Pan Scaling**: Adjust recipes for different pan sizes (`panScaling.ts`)
- **Environmental Adjustments**: Temperature/humidity/altitude compensation (`environmental.ts`)

### Type System
Recipe types in `src/types/recipe.types.ts` define the domain model:
- `Recipe`: Main recipe structure with ingredients, method, pan, steps
- `Ingredient`: With baker's percentage, hydration, category
- `BreadMethod`: straight, sponge, poolish, biga, overnight, sourdough
- `PanConfig`: Pan dimensions, volume, material, fill ratio

## Known Issue: React HMR with Lazy Components

**Solved via environment-based loading in App.tsx:**
- Development: Direct imports (stable HMR)
- Production: React.lazy() (bundle optimization)

```tsx
const isDev = import.meta.env.DEV
import AdvancedDashboardDirect from '@components/dashboard/AdvancedDashboard'
const AdvancedDashboardLazy = lazy(() => import('@components/dashboard/AdvancedDashboard'))
const AdvancedDashboard = isDev ? AdvancedDashboardDirect : AdvancedDashboardLazy
```

Supporting config in `vite.config.js`:
```js
resolve: { dedupe: ['react', 'react-dom'] }
optimizeDeps: { include: ['react', 'react-dom'] }
```

If "Invalid hook call" errors occur: browser refresh or restart dev server.

## Testing

- **Unit tests**: `src/**/*.test.ts`, `tests/unit/**/*.test.ts`
- **E2E tests**: `tests/e2e/**/*.spec.ts` (Playwright)
- **Setup**: `src/test/setup.ts` (mocks localStorage, matchMedia, etc.)
- **Coverage threshold**: 80% (branches, functions, lines, statements)
