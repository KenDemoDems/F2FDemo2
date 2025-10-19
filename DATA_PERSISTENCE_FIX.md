# Data Persistence Fix

## Problem

When navigating between pages in the application:

1. Generated recipes disappeared when leaving the HomePage
2. Detected ingredients disappeared when navigating away
3. MealPlanPage was using hardcoded recipes instead of HomePage-generated recipes
4. User data was lost during navigation, requiring a reload each time

## Root Cause

- **Local Component State**: Each page component (HomePage, MealPlanPage) was managing its own state independently
- **Component Unmounting**: When navigating away from a page, the component unmounted and lost all state
- **No State Sharing**: HomePage and MealPlanPage had no way to share recipe data

## Solution Implemented

### 1. Lifted State to App.tsx

Added shared state at the app level to persist data across navigation:

```typescript
// App.tsx
const [sharedRecipes, setSharedRecipes] = useState<any[]>([])
const [sharedIngredients, setSharedIngredients] = useState<string[]>([])
```

### 2. Load Data Once on Authentication

Data is now loaded once when the user logs in and stored at the app level:

```typescript
useEffect(() => {
  const setupUser = async () => {
    if (firebaseUser) {
      // Load recipes
      const recipesResult = await getUserRecipes(firebaseUser.uid)
      if (!recipesResult.error && recipesResult.recipes.length > 0) {
        const recipes = recipesResult.recipes.map((recipe, index) => ({
          ...recipe,
          id: recipe.id || `recipe-${index}`,
        }))
        setSharedRecipes(recipes)
      }

      // Load ingredients
      const ingredientsResult = await getUserIngredients(firebaseUser.uid)
      if (
        !ingredientsResult.error &&
        ingredientsResult.ingredients.length > 0
      ) {
        const ingredientNames = ingredientsResult.ingredients.map(
          (ing) => ing.name
        )
        setSharedIngredients(ingredientNames)
      }
    }
  }
  setupUser()
}, [firebaseUser])
```

### 3. Updated HomePage Component

- **Added Props Interface**: HomePage now accepts shared state props

```typescript
interface HomePageProps {
  onNavigate?: (page: string) => void
  auth: AuthState
  sharedRecipes?: any[]
  setSharedRecipes?: (recipes: any[]) => void
  sharedIngredients?: string[]
  setSharedIngredients?: (ingredients: string[]) => void
}
```

- **Sync Local and Shared State**: Added useEffect hooks to sync changes back to parent

```typescript
useEffect(() => {
  if (setSharedIngredients) {
    setSharedIngredients(detectedIngredients)
  }
}, [detectedIngredients, setSharedIngredients])

useEffect(() => {
  if (setSharedRecipes) {
    setSharedRecipes(generatedRecipes)
  }
}, [generatedRecipes, setSharedRecipes])
```

### 4. Updated MealPlanPage Component

- **Added Props Interface**: MealPlanPage now accepts recipes from HomePage

```typescript
interface MealPlanPageProps {
  recipes?: any[]
}
```

- **Dynamic Recipe List**: Uses passed recipes instead of hardcoded ones

```typescript
const availableRecipes =
  recipes.length > 0
    ? recipes.map((recipe) => ({
        name: recipe.name,
        image: recipe.image || imgImage6,
        time: recipe.time || "20 min",
        difficulty: recipe.difficulty || "Medium",
      }))
    : [
        /* fallback hardcoded recipes */
      ]
```

### 5. Pass Data as Props

Updated App.tsx to pass shared state to child components:

```typescript
{
  currentPage === "home" && (
    <HomePage
      onNavigate={handleNavigate}
      auth={auth}
      sharedRecipes={sharedRecipes}
      setSharedRecipes={setSharedRecipes}
      sharedIngredients={sharedIngredients}
      setSharedIngredients={setSharedIngredients}
    />
  )
}

{
  currentPage === "meal-plan" && <MealPlanPage recipes={sharedRecipes} />
}
```

## Benefits

### ✅ Data Persistence

- Recipes and ingredients now persist when navigating between pages
- No more data loss or reload flashing

### ✅ MealPlan Integration

- MealPlanPage now shows recipes generated in HomePage
- Users can use 10+ generated recipes instead of 3 hardcoded ones

### ✅ Better User Experience

- Smooth navigation without losing work
- No need to regenerate recipes after visiting other pages

### ✅ Firebase Efficiency

- Data loaded once on authentication instead of on each page mount
- Reduces Firebase read operations

## Testing Checklist

- [x] Build succeeds without errors
- [ ] Generate recipes in HomePage → Navigate to MealPlanPage → Recipes appear in meal selection
- [ ] Navigate to Inventory → Back to HomePage → Recipes still visible
- [ ] Add/remove ingredients → Navigate away → Back → Changes persist
- [ ] Logout → Recipes and ingredients cleared
- [ ] Login → Previous session data loads

## Files Modified

1. **App.tsx** (419 lines)

   - Added shared state management
   - Implemented data loading on authentication
   - Updated page rendering to pass props

2. **HomePage.tsx** (719 lines)

   - Updated props interface to accept shared state
   - Added state synchronization with parent
   - Maintains backward compatibility

3. **MealPlanPage.tsx** (277 lines)
   - Added props interface for recipes
   - Dynamic recipe list based on props
   - Fallback to hardcoded recipes if empty

## Build Status

✅ Build successful in 4.02s
✅ No TypeScript errors
✅ All modules compiled correctly
