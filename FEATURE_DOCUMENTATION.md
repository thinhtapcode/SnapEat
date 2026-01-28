# MealLog and MealPlan Feature Documentation

This document provides detailed information about the newly implemented features in the MealLog.tsx and MealPlan.tsx components.

## Overview

The SnapEat application now includes complete implementations of:
1. **MealPlan.tsx** - Create, view, and manage meal plans with macro tracking
2. **MealLog.tsx** - Log meals manually or using AI-powered image recognition

---

## MealPlan Component

### Features

#### 1. Current Macro Display
- Displays your current TDEE (Total Daily Energy Expenditure) calculated macros
- Shows daily calorie target, protein, carbs, and fat goals
- Updates automatically when profile settings change

#### 2. Create New Meal Plans
Create custom meal plans with:
- **Plan Name**: Give your plan a descriptive name (e.g., "Cutting Phase", "Bulking Week 1")
- **Date Range**: Set start and end dates for the plan
- **Daily Calorie Target**: Specify your target daily caloric intake
- **Macro Distribution**: Set specific targets for:
  - Protein (grams)
  - Carbs (grams)
  - Fat (grams)

**Special Features**:
- "Use Current TDEE Values" button to auto-fill form with your calculated macros
- Date validation ensures end date is after start date
- Numeric validation prevents invalid inputs (NaN, negative values)

#### 3. Saved Plans (Templates)
- View all your previously created meal plans
- See plan details including:
  - Duration (start to end date)
  - Daily calorie target
  - Macro breakdown
- "Use as Template" button to create new plans based on existing ones

### Usage Example

```typescript
// The component automatically fetches:
// 1. Current TDEE data
// 2. All existing meal plans

// To create a new plan:
// 1. Click "Create New Plan"
// 2. Fill in plan details or click "Use Current TDEE Values"
// 3. Submit the form

// To use a template:
// 1. Find a saved plan
// 2. Click "Use as Template"
// 3. Modify as needed and submit
```

---

## MealLog Component

### Features

#### 1. AI-Powered Food Recognition

**Upload & Scan Photo**:
- Click "Upload & Scan Photo" button
- Select an image of your meal
- AI analyzes the image and recognizes food items
- Auto-fills nutrition information

**Supported Image Formats**:
- JPEG
- PNG
- WebP

**File Size Limit**: 5MB maximum

**AI Recognition Display**:
- Shows all recognized food items
- Displays confidence score for each item (percentage)
- Color-coded confidence indicators:
  - Green: High confidence (>80%)
  - Orange: Moderate confidence (≤80%)
- Shows nutrition breakdown per item

**Auto-Fill Capabilities**:
- Meal name (combined food names)
- Total calories
- Total protein
- Total carbs
- Total fat

#### 2. Manual Meal Entry

Log meals manually with:
- **Meal Name**: Name your meal
- **Meal Type**: Select from:
  - Breakfast
  - Lunch
  - Dinner
  - Snack
- **Nutrition Information**:
  - Calories (kcal)
  - Protein (grams)
  - Carbs (grams)
  - Fat (grams)

**Validation**:
- All fields are required
- Numeric inputs validated (prevents NaN)
- No negative values allowed (min="0")
- Step size: 0.1 for precise tracking

#### 3. Combined Workflow

**AI + Manual Editing**:
1. Upload a food photo
2. AI recognizes foods and fills in values
3. Review AI suggestions
4. Edit values if needed
5. Submit to log the meal

### Usage Example

```typescript
// AI-Powered Logging:
// 1. Click "Upload & Scan Photo"
// 2. Select image from device
// 3. Wait for AI analysis (shows "Analyzing..." state)
// 4. Review recognized foods and auto-filled values
// 5. Click "Log Meal" to save

// Manual Logging:
// 1. Click "Add Manual Meal"
// 2. Fill in all required fields
// 3. Click "Log Meal" to save

// Edit AI Results:
// 1. After AI analysis, form is pre-filled
// 2. Click in any field to edit values
// 3. Submit when satisfied
```

---

## API Integration

### MealPlan APIs

```typescript
// Fetch TDEE data
tdeeApi.calculate() 
// Returns: { tdee, bmr, recommendedCalories, macros: { protein, carbs, fat } }

// Create meal plan
mealPlanApi.create({
  name: string,
  startDate: Date,
  endDate: Date,
  dailyCalories: number,
  dailyMacros: { protein: number, carbs: number, fat: number }
})

// Get all meal plans
mealPlanApi.getAll()
// Returns: Array of meal plans
```

### MealLog APIs

```typescript
// Recognize food from image
aiApi.recognizeFood(base64Image: string)
// Returns: { success, foods: [...], confidence, message }

// Create meal
mealApi.create({
  name: string,
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK',
  foods: [],
  totalCalories: number,
  totalProtein: number,
  totalCarbs: number,
  totalFat: number,
  imageUrl?: string
})
```

---

## Error Handling

### MealPlan
- Invalid date range (end before start): User-friendly alert
- Invalid numbers: Prevented with validation
- API errors: Generic error message, detailed logs to console

### MealLog
- Image too large (>5MB): Clear size limit message
- File read errors: Graceful error handling
- AI service errors: Fallback to manual entry
- Invalid numbers: Prevented with validation

---

## Accessibility

### ARIA Labels
- File input has descriptive aria-label
- Images have meaningful alt text

### Keyboard Navigation
- All forms are keyboard accessible
- Proper tab order maintained
- Enter key submits forms

### Visual Indicators
- Loading states during AI analysis
- Success/error messages
- Required field indicators

---

## State Management

### React Query
- Automatic cache invalidation on mutations
- Optimistic updates
- Loading and error states
- Query keys:
  - `['tdee']` - TDEE data
  - `['mealPlans']` - All meal plans
  - `['dailySummary']` - Daily meal summary
  - `['meals']` - Meal list

### Local State (useState)
- Form data
- Image preview
- Loading states
- Recognized foods

---

## Security Considerations

### Input Validation
- All numeric inputs validated before submission
- Date ranges validated
- File size limits enforced
- Allowed file types restricted

### Data Sanitization
- No user input directly executed
- Error messages sanitized before display
- Base64 image data validated

---

## Performance Optimizations

### Image Handling
- Client-side file size validation (prevents large uploads)
- Base64 encoding only for accepted files
- Loading state prevents multiple simultaneous uploads

### API Calls
- React Query caching reduces redundant requests
- Mutations invalidate only affected queries
- Optimistic updates for better UX

---

## Future Enhancements

### MealPlan
- [ ] Export meal plans as PDF
- [ ] Share meal plans with other users
- [ ] Meal plan calendar view
- [ ] Automated meal suggestions based on plan

### MealLog
- [ ] Barcode scanning for packaged foods
- [ ] Favorite meals for quick logging
- [ ] Meal templates/recipes
- [ ] Batch photo upload
- [ ] Offline meal logging with sync

---

## Troubleshooting

### AI Recognition Not Working
1. Check image format (JPEG, PNG, or WebP)
2. Ensure image size is under 5MB
3. Verify AI service is running (http://localhost:8000)
4. Check browser console for errors

### Meal Plan Not Saving
1. Verify all required fields are filled
2. Check date range (end must be after start)
3. Ensure backend API is accessible
4. Check network tab for API errors

### Build Errors
1. Run `npm install` in web directory
2. Ensure TypeScript dependencies are installed
3. Check that vite-env.d.ts exists
4. Clear build cache and rebuild

---

## Developer Notes

### Type Definitions
```typescript
interface FoodItem {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  servingSize?: string
  confidence?: number
}

interface MealPlanFormData {
  name: string
  startDate: string
  endDate: string
  dailyCalories: string
  protein: string
  carbs: string
  fat: string
}

interface MealLogFormData {
  name: string
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
  totalCalories: string
  totalProtein: string
  totalCarbs: string
  totalFat: string
}
```

### Constants
```typescript
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000 // Used for default date ranges
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB file size limit
```

---

## Testing

### Manual Testing Checklist

**MealPlan**:
- [ ] Create plan with valid data
- [ ] Create plan with invalid date range
- [ ] Use TDEE values button
- [ ] Use template to create new plan
- [ ] View saved plans

**MealLog**:
- [ ] Upload valid image
- [ ] Upload image too large
- [ ] Upload unsupported format
- [ ] Edit AI-suggested values
- [ ] Submit manual meal
- [ ] Submit AI-analyzed meal

---

## Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Check API service status
4. Open GitHub issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Console errors

---

**Last Updated**: 2026-01-28
**Version**: 1.0.0
