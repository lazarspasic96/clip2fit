# Fix: Exercise Picker Sheet — Search & Chip Layout

## Root Cause Analysis

### Issue 1: Search bar not clickable
The `formSheet` presentation in `react-native-screens` wraps content and manages sheet drag gestures. When `headerShown: false`, the sheet's gesture recognizer covers the **entire** content area. The search bar (TextInput) sits in a "fixed header" zone above the FlashList — this zone is part of the sheet's drag surface, so taps are intercepted by the sheet gesture before reaching the TextInput.

Key evidence:
- `presentation: 'formSheet'` + `headerShown: false` + `sheetGrabberVisible: true`
- TextInput is outside the FlashList scroll view, in the non-scrollable area
- iOS `UISheetPresentationController` ties its drag gesture to the first scrollable descendant (FlashList). Content ABOVE that scroll view becomes part of the sheet's drag zone.

### Issue 2: Chip filters at top of sheet (not below search bar)
In `CardCarouselDesign`, when `hideFilterButton=true`, the inner search bar wrapper gets `className={undefined}`. This may cause NativeWind to not apply default layout styles properly, potentially collapsing the view. Combined with the touch issue making the search bar non-interactive, the chips appear to be "at the top."

## Fix Plan

### Step 1: Move search + chips into FlashList's ListHeaderComponent
- Extract search bar + filter chips from the fixed header into `ListHeaderComponent` of the FlashList
- This places all interactive content inside the sheet's managed scroll view → touches delivered correctly
- Standard iOS pattern (search scrolls with content)

### Step 2: Add `sheetExpandsWhenScrolledToEdge: false` to sheet options
- In `_layout.tsx`, add this to exercise-picker screen options
- Prevents residual sheet-scroll gesture conflicts

### Step 3: Clean up layout wrapper
- Remove the `className={undefined}` conditional — give it proper styles or remove the extra wrapper

### Step 4: Reset picker filters on mount
- Ensure `pickerFilterStore.resetFilters()` is called when exercise picker opens
- Prevents stale search state from previous sessions
