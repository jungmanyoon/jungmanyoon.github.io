# User Guide - Recipe Book Application

**Version**: 1.0.0
**Last Updated**: 2025-10-05

Welcome to Recipe Book (무료 제과제빵 레시피 변환 웹 애플리케이션) - your comprehensive tool for managing and converting baking recipes!

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Search and Discovery](#search-and-discovery)
3. [Filtering and Sorting](#filtering-and-sorting)
4. [Creating and Editing Recipes](#creating-and-editing-recipes)
5. [Recipe Conversion](#recipe-conversion)
6. [Import and Export](#import-and-export)
7. [Toast Notifications](#toast-notifications)
8. [Keyboard Shortcuts](#keyboard-shortcuts)
9. [Accessibility Features](#accessibility-features)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### First Time Setup

1. **Open the Application**
   - Visit the Recipe Book web application in your browser
   - The app works best in modern browsers (Chrome, Edge, Firefox, Safari)

2. **Install as PWA (Progressive Web App)** *(Optional)*
   - Look for the install prompt in your browser
   - Click "Install" to add Recipe Book to your home screen/apps
   - Enjoy offline access and faster loading!

3. **Sample Recipe**
   - When you first open the app, a sample recipe is automatically loaded
   - This helps you get familiar with the interface

### Navigation

The main navigation tabs are located at the top:

- **레시피** (Recipes): Browse and manage your recipe collection
- **변환** (Convert): Convert recipes using various methods
- **팬 변환** (Pan Conversion): Scale recipes for different pan sizes
- **방식 변환** (Method Conversion): Convert between baking methods
- **설정** (Settings): Configure app preferences
- **도움말** (Help): Access help documentation

---

## Search and Discovery

### Using the Search Bar

**Quick Search**:
1. Locate the search bar at the top of the recipe list
2. Type your search query
3. Results appear automatically as you type

**What You Can Search**:
- Recipe names: "식빵", "크루아상"
- Ingredients: "밀가루", "버터"
- Tags: "basic", "beginner"
- Descriptions: Any text in recipe descriptions

**Search Tips**:
- Search is **case-insensitive**: "BREAD" = "bread"
- Partial matches work: "식" will find "식빵"
- Search across multiple fields simultaneously
- Results update in real-time (with 300ms debounce for performance)

**Keyboard Shortcut**:
- Press **Ctrl+K** (Windows/Linux) or **Cmd+K** (Mac) to quickly focus the search bar

**Clear Search**:
- Click the ✕ button in the search bar
- Or delete all text manually

---

## Filtering and Sorting

### Applying Filters

**Category Filter**:
1. Click the "카테고리" (Category) dropdown
2. Select one or more categories:
   - 빵 (Bread)
   - 과자 (Pastry)
   - 케이크 (Cake)
   - 기타 (Other)

**Method Filter**:
1. Click the "방식" (Method) dropdown
2. Select baking method:
   - 스트레이트 (Straight dough)
   - 중종 (Poolish/Sponge)
   - 발효종 (Sourdough/Starter)

**Tag Filter**:
1. Click the "태그" (Tags) dropdown
2. Select from available tags
3. Only recipes with these tags will show

**Multiple Filters**:
- Apply multiple filters simultaneously
- Results show recipes matching **ALL** selected filters (AND logic)

### Sorting Recipes

Click the "정렬" (Sort) dropdown and choose:

- **이름 (A-Z)**: Alphabetical order (ascending)
- **이름 (Z-A)**: Alphabetical order (descending)
- **최신순**: Newest recipes first
- **오래된순**: Oldest recipes first
- **카테고리별**: Grouped by category

### Managing Active Filters

**View Active Filters**:
- Active filters appear as colored badges below the filter controls
- Badge shows filter type and count

**Remove Individual Filter**:
- Click the ✕ on any filter badge to remove just that filter

**Clear All Filters**:
- Click the "필터 초기화" (Reset Filters) button
- This removes all filters and returns to default view

---

## Creating and Editing Recipes

### Creating a New Recipe

1. **Click "새 레시피" (New Recipe)** button on the recipe list page
2. The conversion console opens with a blank recipe
3. Fill in the details and save

### Editing Existing Recipes

**Open the Editor**:
1. Find the recipe you want to edit
2. Click the **Edit** (✏️) button on the recipe card
3. The recipe editor opens

**Recipe Metadata**:
- **이름** (Name): Required field
- **설명** (Description): Optional
- **카테고리** (Category): Select from dropdown
- **방식** (Method): Select baking method
- **태그** (Tags): Add custom tags (press Enter to add)

**Managing Ingredients**:

1. **Add Ingredient**:
   - Click "재료 추가" (Add Ingredient)
   - Fill in ingredient name and amount
   - Unit is optional but recommended

2. **Edit Ingredient**:
   - Click in the ingredient row fields
   - Modify name, amount, or unit
   - Changes are tracked in real-time

3. **Remove Ingredient**:
   - Click the **Delete** (🗑️) button next to the ingredient
   - Ingredient is removed immediately

**Managing Tags**:
- Type a tag name in the input field
- Press **Enter** to add the tag
- Click **✕** on a tag chip to remove it
- Duplicate tags are prevented

### Saving Changes

**Save**:
1. Review your changes
2. Click "저장" (Save) button
3. Success toast notification appears
4. You're returned to the recipe list

**Cancel**:
1. Click "취소" (Cancel) button
2. If you have unsaved changes, a confirmation dialog appears
3. Confirm to discard changes

**Validation**:
- Required fields must be filled
- Ingredient amounts must be valid numbers
- Errors are highlighted in red

---

## Recipe Conversion

### Using the Conversion Console

1. **Select a Recipe**:
   - Click on any recipe card
   - Or create a new recipe
   - The conversion console opens

2. **Conversion Options**:
   - **DDT Calculator**: Calculate desired dough temperature
   - **Pan Conversion**: Scale recipe for different pan sizes
   - **Method Conversion**: Convert between baking methods
   - **Environment Adjustment**: Adjust for temperature/humidity

3. **View Results**:
   - Converted ingredients display in the results panel
   - Original recipe remains unchanged

4. **Save Converted Recipe**:
   - Click "저장" (Save) to save as a new recipe
   - The converted recipe is added to your collection

---

## Import and Export

### Exporting Recipes

**Export All Recipes**:
1. Go to the recipe list page
2. Click the "내보내기" (Export) button
3. A JSON file downloads automatically
4. File name format: `recipes-export-YYYY-MM-DD.json`

**Export Format**:
```json
[
  {
    "id": "recipe-123",
    "name": "식빵",
    "category": "bread",
    "method": "straight",
    "ingredients": [
      { "name": "밀가루", "amount": 500, "unit": "g" }
    ],
    "createdAt": "2025-10-05T10:30:00.000Z",
    "updatedAt": "2025-10-05T10:30:00.000Z",
    "tags": ["basic"]
  }
]
```

**Uses for Export**:
- Backup your recipes
- Share with friends or colleagues
- Transfer to another device
- Version control

### Importing Recipes

**Import from File**:
1. Click the "가져오기" (Import) button
2. Select a JSON file from your computer
3. The app validates the file
4. Recipes are imported automatically

**Import Behavior**:
- If a recipe ID already exists, it will be **updated**
- New recipes are **added** to your collection
- Dates are preserved from the import file

**Validation**:
- File must be valid JSON
- Must contain an array of recipes
- Required fields: id, name, category, method
- Invalid files show an error toast

**Error Handling**:
- Invalid JSON format → Error toast
- Missing required fields → Error toast
- Corrupted data → Error toast
- Check the console for detailed error messages

---

## Toast Notifications

Toast notifications provide feedback for your actions.

### Toast Types

1. **Success** (Green ✓):
   - Recipe saved successfully
   - Import/export completed
   - Filter applied

2. **Error** (Red ✕):
   - Import failed
   - Validation error
   - Save failed

3. **Warning** (Yellow ⚠️):
   - Unsaved changes
   - Storage limit warning

4. **Info** (Blue ℹ️):
   - General information
   - Tips and hints

### Toast Behavior

**Auto-dismiss**:
- Success: 3 seconds
- Error: 5 seconds
- Warning: 4 seconds
- Info: 3 seconds

**Manual Dismiss**:
- Click the **✕** button on the toast
- Or press **Escape** key when focused

**Multiple Toasts**:
- New toasts stack vertically
- Maximum 5 toasts visible at once
- Oldest toast is removed when limit reached

**Pause on Hover**:
- Hover over a toast to pause auto-dismiss
- Move mouse away to resume countdown

---

## Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl+K** / **Cmd+K** | Focus search bar |
| **Escape** | Clear search / Close modals |
| **Tab** | Navigate between interactive elements |
| **Enter** | Activate focused element |

### Recipe List

| Shortcut | Action |
|----------|--------|
| **Arrow Keys** | Navigate recipe cards |
| **Enter** | Open selected recipe |
| **Delete** | Delete focused recipe (with confirmation) |

### Recipe Editor

| Shortcut | Action |
|----------|--------|
| **Ctrl+S** / **Cmd+S** | Save changes |
| **Escape** | Cancel editing |
| **Tab** | Move between form fields |
| **Enter** | Add tag (in tag input field) |

### Accessibility

| Shortcut | Action |
|----------|--------|
| **Tab** | Move focus forward |
| **Shift+Tab** | Move focus backward |
| **Space** | Activate buttons/checkboxes |
| **Enter** | Activate links/buttons |

---

## Accessibility Features

Recipe Book is designed to be accessible to all users, including those using assistive technologies.

### Screen Reader Support

**Landmarks**:
- Main navigation: `<nav>` with ARIA label
- Main content: `<main>` landmark
- Search: `<search>` landmark
- Complementary info: `<aside>` landmarks

**Announcements**:
- Toast notifications use ARIA live regions
- Search results count announced
- Filter changes announced
- Save/delete actions announced

**Labels**:
- All form inputs have associated labels
- Buttons have descriptive text or ARIA labels
- Images have meaningful alt text

### Keyboard Navigation

**Full keyboard support**:
- All interactive elements are keyboard accessible
- No keyboard traps
- Logical focus order
- Visible focus indicators

**Skip Links**:
- "Skip to main content" link (press Tab on page load)
- Helps keyboard users bypass repetitive navigation

### Visual Accessibility

**Color Contrast**:
- All text meets WCAG 2.1 AA standards (4.5:1 minimum)
- Important information not conveyed by color alone

**Text Resizing**:
- Text can be resized up to 200% without loss of functionality
- Responsive design adapts to different viewport sizes

**Focus Indicators**:
- Clear visual focus indicators on all interactive elements
- High contrast focus rings

### Cognitive Accessibility

**Clear Language**:
- Simple, concise labels
- Consistent terminology
- Error messages explain the problem and solution

**Predictable Behavior**:
- Consistent navigation
- No unexpected changes of context
- Confirmation dialogs for destructive actions

---

## Troubleshooting

### Common Issues

#### "No recipes found" message

**Cause**: Filters or search are too restrictive

**Solution**:
1. Click "필터 초기화" (Reset Filters)
2. Clear the search bar
3. Check that you have recipes in your collection

#### Import fails with error message

**Cause**: Invalid JSON file or incorrect format

**Solution**:
1. Verify the file is valid JSON (use a JSON validator)
2. Check the file structure matches the export format
3. Ensure all required fields are present
4. Try exporting a recipe first to see the correct format

#### Toast notifications not appearing

**Cause**: Browser settings or display issues

**Solution**:
1. Check browser console for errors
2. Ensure JavaScript is enabled
3. Try refreshing the page
4. Clear browser cache and reload

#### Search not working

**Cause**: JavaScript error or browser compatibility

**Solution**:
1. Refresh the page
2. Check browser console for errors
3. Try a different browser (Chrome, Edge, Firefox recommended)
4. Clear browser cache

#### Recipe won't save

**Cause**: Validation errors or storage issues

**Solution**:
1. Check that all required fields are filled
2. Verify ingredient amounts are valid numbers
3. Check browser console for error details
4. Try exporting existing recipes to free up storage

### Browser Storage

**LocalStorage Limits**:
- Most browsers limit to ~5-10MB
- If you reach the limit, export and delete old recipes

**Clear Storage**:
```javascript
// Open browser console and run:
localStorage.clear()
// Then refresh the page
```

**Check Storage Usage**:
```javascript
// Open browser console and run:
console.log(JSON.stringify(localStorage).length / (1024 * 1024), 'MB used')
```

### Performance Issues

**Slow Search**:
- Normal behavior: search debounces by 300ms
- If slower, try clearing filters first
- Reduce number of recipes by exporting and archiving old ones

**Slow Page Load**:
- Check your internet connection
- Clear browser cache
- Disable browser extensions
- Try incognito/private mode

### Getting Help

**In-App Help**:
- Click the "도움말" (Help) tab for documentation
- Check the FAQ section

**Technical Support**:
- Check browser console for error messages
- Include error details when reporting issues
- Provide steps to reproduce the problem

**Community**:
- Share feedback and suggestions
- Report bugs through the issue tracker
- Contribute to documentation improvements

---

## Tips and Best Practices

### Recipe Organization

1. **Use Descriptive Names**: Make recipe names clear and searchable
2. **Add Tags**: Use tags for easy filtering (e.g., "quick", "beginner", "advanced")
3. **Keep Tags Consistent**: Standardize tag names for better organization
4. **Update Descriptions**: Add notes about recipe variations or tips

### Search Strategies

1. **Start Broad**: Begin with general terms, then narrow down
2. **Use Filters**: Combine search with filters for precise results
3. **Try Partial Matches**: Don't need to type the full word
4. **Search Ingredients**: Find recipes by what you have on hand

### Data Management

1. **Regular Backups**: Export your recipes monthly
2. **Version Control**: Keep dated export files for history
3. **Clean Up**: Delete old test recipes periodically
4. **Organize Tags**: Review and standardize tags every few months

### Workflow Efficiency

1. **Keyboard Shortcuts**: Learn Ctrl+K for quick search access
2. **Batch Operations**: Use filters to manage groups of recipes
3. **Template Recipes**: Create base recipes to duplicate and modify
4. **Quick Edit**: Use the editor for fast updates without leaving the page

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history and updates.

---

## Feedback and Support

We welcome your feedback to improve Recipe Book!

**Found a Bug?**
- Check the [Known Issues](#known-issues) section
- Report via GitHub Issues (if available)
- Include browser version and steps to reproduce

**Feature Request?**
- Share your ideas for new features
- Explain the use case and benefits
- Vote on existing feature requests

**General Feedback?**
- Share your experience using the app
- Suggest improvements to documentation
- Help other users in the community

---

**Document Version**: 1.0.0
**Last Updated**: 2025-10-05
**Maintained by**: Recipe Book Documentation Team

Happy baking! 🥐🍞🎂
