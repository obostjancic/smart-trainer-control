# Activity Summary Page + Visual Polish

## Goals

1. Replace the modal `ActivityEndDialog` with a full-screen activity summary view
2. Visual polish pass across the app (spacing, typography, consistency)

## Activity Summary

### App State Machine

The app has three visual states based on `activity.status` and `activity.points`:

| State | Condition | View |
|-------|-----------|------|
| Pre-workout | `NotStarted` + no points | Connect button + Start button |
| Active workout | `Running` or `Paused` | Stats + controls + chart |
| Summary | `NotStarted` + has points | Full-screen activity summary |

Currently the third state shows a modal dialog. Replace it with a full-screen view in the same ternary in `App.tsx`.

### Summary Layout

1. **Header**: "Activity Complete" + duration prominently displayed
2. **Stats grid** (2x2 mobile, 4-col desktop):
   - Avg Power / Max Power (computed from `activity.points`)
   - Avg Speed / Max Speed (computed from `activity.points`)
3. **Final chart**: Reuse `ActivityChart` with the completed data
4. **Actions**:
   - Download TCX (primary, enabled — currently disabled)
   - Merge with existing activity (secondary/outline)
   - Done (resets state)

Remove disabled "Garmin sync" and "Coming Soon" labels.

### New Component

`src/components/ActivitySummary.tsx` — receives `activity` and `onReset` props. Computes summary stats (avg/max power, avg/max speed) from points array at render time.

### File Changes

- Delete or gut `ActivityEndDialog.tsx` (replace with `ActivitySummary.tsx`)
- Update `App.tsx` to render `ActivitySummary` as a third branch
- Move download/merge logic from `ActivityEndDialog` into `ActivitySummary`
- Enable TCX download (remove the `disabled` prop)

## Visual Polish

### Typography & Spacing
- Tighter vertical rhythm in active workout layout
- Consistent use of Panda CSS text size tokens
- Tabular nums on all numeric displays

### Buttons & Controls
- Consistent border-radius (standardize on `lg`)
- Standardize button heights using a scale instead of hardcoded pixels
- Smoother hover/active transitions

### Active Workout Screen
- Tighter sticky header padding
- Subtle bottom border on sticky header
- Better visual separation between stats and controls

### Connect Screen
- Add app title/logo above connect button

### CSS Cleanup
- Move worst inline `style={{}}` offenders to `css()` calls
- Focus on ActivityControls action buttons and BikeControls
