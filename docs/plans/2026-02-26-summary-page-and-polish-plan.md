# Activity Summary Page + Visual Polish — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the modal activity-end dialog with a full-screen activity summary view, and do a visual polish pass across the app.

**Architecture:** The app already has a two-state layout in `App.tsx` (`isActive` ternary). We add a third branch: when `activity.status === NotStarted && activity.points.length > 0`, render the new `ActivitySummary` component instead of pre-workout or active-workout views. The summary computes stats from the points array at render time.

**Tech Stack:** React 19, Panda CSS (`css()`, `styled-system/jsx`), Recharts (reuse `ActivityChart`), Lucide icons, existing `generateTCX`/`mergeTCX` utils.

---

### Task 1: Add `max` utility function

**Files:**
- Modify: `src/utils/math.ts`
- Modify: `src/utils/math.test.ts`

**Step 1: Write the failing test**

Add to `src/utils/math.test.ts`:

```ts
describe("max", () => {
  it("should return max of numbers", () => {
    expect(max([1, 5, 3])).toBe(5);
  });

  it("should return 0 for empty array", () => {
    expect(max([])).toBe(0);
  });

  it("should handle single element", () => {
    expect(max([42])).toBe(42);
  });

  it("should handle undefined", () => {
    expect(max(undefined)).toBe(NaN);
  });
});
```

Update import: `import { avg, max } from "./math";`

**Step 2: Run test to verify it fails**

Run: `pnpm test --run src/utils/math.test.ts`
Expected: FAIL — `max is not a function`

**Step 3: Write minimal implementation**

Add to `src/utils/math.ts`:

```ts
export const max = (values: number[] | undefined): number => {
  if (!values) return NaN;
  if (values.length === 0) return 0;
  return Math.max(...values);
};
```

**Step 4: Run test to verify it passes**

Run: `pnpm test --run src/utils/math.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/utils/math.ts src/utils/math.test.ts
git commit -m "feat: add max utility function"
```

---

### Task 2: Add `downloadTCX` export to file utils

The `downloadTCX` helper in `src/utils/file.ts` is currently not exported (only `mergeTCX` is). The summary page needs to call it directly.

**Files:**
- Modify: `src/utils/file.ts`

**Step 1: Export `downloadTCX` and `downloadFile`**

In `src/utils/file.ts`, change:
- `const downloadFile = ` → `export const downloadFile = `
- `const downloadTCX = ` → `export const downloadTCX = `

**Step 2: Verify build**

Run: `pnpm build`
Expected: SUCCESS (no breaking changes, only adding exports)

**Step 3: Commit**

```bash
git add src/utils/file.ts
git commit -m "refactor: export downloadTCX and downloadFile utils"
```

---

### Task 3: Create `ActivitySummary` component

**Files:**
- Create: `src/components/ActivitySummary.tsx`

**Step 1: Create the component**

```tsx
import { Activity, ActivityPoint } from "@/hooks/useActivity";
import { avg, max } from "@/utils/math";
import { downloadTCX } from "@/utils/file";
import { mergeTCX } from "@/utils/file";
import { generateTCX } from "@/lib/file/tcx";
import { formatDuration } from "@/utils/time";
import { ActivityChart } from "./ActivityChart";
import { Text } from "./ui/text";
import { Button } from "./ui/button";
import { DownloadIcon, UploadIcon, CheckCircle } from "lucide-react";
import { Box, Stack, Grid } from "styled-system/jsx";
import { css } from "styled-system/css";

interface ActivitySummaryProps {
  activity: Activity;
  chartPoints: ActivityPoint[];
  onReset: () => void;
}

function StatCard({ label, value, unit, color }: {
  label: string;
  value: string;
  unit: string;
  color?: string;
}) {
  return (
    <Stack
      gap={1}
      align="center"
      p={4}
      rounded="lg"
      className={css({
        background: "var(--color-btn-bg)",
        border: "1px solid var(--color-border)",
      })}
    >
      <Text size="sm" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </Text>
      <Stack direction="row" align="baseline" gap={1}>
        <Text
          fontSize="2xl"
          fontWeight="bold"
          fontVariantNumeric="tabular-nums"
          style={color ? { color } : undefined}
        >
          {value}
        </Text>
        <Text size="sm" style={{ color: "var(--color-text-muted)" }}>
          {unit}
        </Text>
      </Stack>
    </Stack>
  );
}

export function ActivitySummary({ activity, chartPoints, onReset }: ActivitySummaryProps) {
  const powers = activity.points.map((p) => p.power).filter((p): p is number => p !== undefined);
  const speeds = activity.points.map((p) => p.speed).filter((s): s is number => s !== undefined);

  const avgPower = Math.round(avg(powers));
  const maxPower = Math.round(max(powers));
  const avgSpeed = avg(speeds);
  const maxSpeed = max(speeds);

  const handleDownload = () => {
    const tcx = generateTCX(activity.points);
    downloadTCX(tcx, "bike-activity");
  };

  const handleMerge = () => {
    mergeTCX(activity.points);
  };

  return (
    <Box
      maxWidth="800px"
      mx="auto"
      minHeight="100dvh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      py={6}
      className="animate-fade-in-up"
    >
      <Stack gap={6}>
        {/* Header */}
        <Stack gap={1} align="center">
          <CheckCircle size={32} style={{ color: "var(--color-power)" }} />
          <Text fontSize="2xl" fontWeight="bold">
            Activity Complete
          </Text>
          <Text
            fontSize="4xl"
            fontWeight="bold"
            fontVariantNumeric="tabular-nums"
          >
            {formatDuration(activity.duration)}
          </Text>
        </Stack>

        {/* Stats Grid */}
        <Grid columns={{ base: 2, md: 4 }} gap={3}>
          <StatCard label="Avg Power" value={`${avgPower}`} unit="W" color="var(--color-power)" />
          <StatCard label="Max Power" value={`${maxPower}`} unit="W" color="var(--color-power)" />
          <StatCard label="Avg Speed" value={avgSpeed.toFixed(1)} unit="km/h" color="var(--color-speed)" />
          <StatCard label="Max Speed" value={maxSpeed.toFixed(1)} unit="km/h" color="var(--color-speed)" />
        </Grid>

        {/* Chart */}
        <Box>
          <ActivityChart points={chartPoints} />
        </Box>

        {/* Actions */}
        <Stack gap={3} direction={{ base: "column", md: "row" }}>
          <Button flex={1} onClick={handleDownload}>
            <DownloadIcon size={18} />
            Download TCX
          </Button>
          <Button flex={1} variant="outline" onClick={handleMerge}>
            <UploadIcon size={18} />
            Merge with Existing
          </Button>
        </Stack>

        <Button variant="ghost" onClick={onReset} width="full">
          Done
        </Button>
      </Stack>
    </Box>
  );
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: SUCCESS (component not rendered yet, but should compile)

**Step 3: Commit**

```bash
git add src/components/ActivitySummary.tsx
git commit -m "feat: add ActivitySummary full-screen component"
```

---

### Task 4: Wire `ActivitySummary` into `App.tsx` and remove `ActivityEndDialog`

**Files:**
- Modify: `src/App.tsx`

**Step 1: Update App.tsx**

Replace the two-state ternary with a three-state layout. Key changes:

1. Import `ActivitySummary` instead of `ActivityEndDialog`
2. Add a `hasSummary` condition: `activity.status === ActivityStatus.NotStarted && activity.points.length > 0`
3. Render three branches: summary → active → pre-workout
4. Remove the `ActivityEndDialog` render and its `onOpenChange` handler

The render section in `AppContent` becomes:

```tsx
const hasSummary = activity.status === ActivityStatus.NotStarted && activity.points.length > 0;

return (
  <Box p={{ base: 3, md: 4 }} maxWidth="1200px" mx="auto" minHeight="100dvh">
    {hasSummary ? (
      <ActivitySummary
        activity={activity}
        chartPoints={chartData.current}
        onReset={handleResetActivity}
      />
    ) : isActive ? (
      /* Active workout layout — unchanged */
      ...
    ) : (
      /* Pre-workout layout — unchanged */
      ...
    )}
    <ThemeToggle />
  </Box>
);
```

Remove:
- `import { ActivityEndDialog }`
- The `<ActivityEndDialog ... />` JSX
- The `ActivityEndDialog`'s `onOpenChange` handler (reset is now handled by `onReset` prop)

**Step 2: Verify it works**

Run: `pnpm build`
Expected: SUCCESS

Run: `pnpm dev` — manually test: connect mock bike → start activity → stop → should see full-screen summary instead of modal.

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: replace ActivityEndDialog with full-screen ActivitySummary"
```

---

### Task 5: Delete `ActivityEndDialog.tsx`

**Files:**
- Delete: `src/components/ActivityEndDialog.tsx`

**Step 1: Verify no remaining imports**

Search for `ActivityEndDialog` across the codebase. After Task 4, there should be no imports left.

**Step 2: Delete the file**

```bash
rm src/components/ActivityEndDialog.tsx
```

**Step 3: Verify build**

Run: `pnpm build`
Expected: SUCCESS

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove unused ActivityEndDialog"
```

---

### Task 6: Visual polish — Connect screen

**Files:**
- Modify: `src/components/BikeControls.tsx` (not-connected branch, ~lines 84-121)

**Step 1: Add app title above connect button**

In the `!isConnected` return block, add a title above the connect button:

```tsx
<Stack gap={4} align="center" justify="center" py={12} className="animate-scale-in">
  <Stack gap={1} align="center">
    <Text fontSize="2xl" fontWeight="bold">
      Smart Trainer Control
    </Text>
    <Text size="sm" style={{ color: "var(--color-text-muted)" }}>
      Connect your bike to get started
    </Text>
  </Stack>
  <button ...>
```

**Step 2: Verify visually**

Run: `pnpm dev` — the connect screen should now show the app title.

**Step 3: Commit**

```bash
git add src/components/BikeControls.tsx
git commit -m "feat: add app title to connect screen"
```

---

### Task 7: Visual polish — Consistent button styles

**Files:**
- Modify: `src/components/BikeControls.tsx`
- Modify: `src/components/ActivityControls.tsx`

**Step 1: Standardize border-radius**

In `BikeControls.tsx`:
- Connect button: change `borderRadius: "xl"` to `borderRadius: "lg"`

In `ActivityControls.tsx`:
- Start button: change `borderRadius: "xl"` to `borderRadius: "lg"`

**Step 2: Move inline styles to css() in ActivityControls**

The stop and pause buttons use `style={{}}` for colors. Move these to dedicated Panda CSS classes:

```tsx
const dangerBtnStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "1.5",
  fontFamily: "var(--font-body)",
  fontWeight: "500",
  fontSize: "sm",
  borderRadius: "lg",
  cursor: "pointer",
  transition: "all 0.15s ease",
  background: "var(--color-btn-bg)",
  border: "1px solid var(--color-danger)",
  padding: "0 12px",
  height: "36px",
  color: "var(--color-danger)",
  opacity: 0.7,
  _hover: {
    opacity: 1,
  },
  _active: {
    transform: "scale(0.95)",
  },
  _disabled: {
    opacity: 0.3,
    cursor: "not-allowed",
    transform: "none",
  },
});
```

Replace the stop button's `className={actionBtnStyle} style={{...}}` with `className={dangerBtnStyle}`.
Same for the disconnect button (remove its inline `style` prop, use `dangerBtnStyle`).

**Step 3: Verify build + visually check**

Run: `pnpm build`
Expected: SUCCESS

**Step 4: Commit**

```bash
git add src/components/BikeControls.tsx src/components/ActivityControls.tsx
git commit -m "style: standardize button styles and move inline styles to css()"
```

---

### Task 8: Visual polish — Active workout sticky header

**Files:**
- Modify: `src/components/ActivityControls.tsx` (~lines 95-153)

**Step 1: Add bottom border to sticky header**

In the running/paused return block, the outer `Stack` has `style={{ backgroundColor: "var(--color-bg)" }}`. Update it:

```tsx
style={{
  backgroundColor: "var(--color-bg)",
  borderBottom: "1px solid var(--color-border)",
}}
```

Also tighten padding — change `py={{ base: 1, md: 0 }}` to `py={{ base: 2, md: 0 }}` and add `pb={{ base: 2, md: 0 }}`.

**Step 2: Verify visually**

Run: `pnpm dev` — scroll during an active workout on mobile viewport, sticky header should have a clean bottom edge.

**Step 3: Commit**

```bash
git add src/components/ActivityControls.tsx
git commit -m "style: add bottom border to sticky workout header"
```

---

### Task 9: Visual polish — Tabular nums on all numeric displays

**Files:**
- Modify: `src/components/BikeControls.tsx`

**Step 1: Add fontVariantNumeric to power and resistance displays**

The target power `Text` (~line 135-144) and resistance `Text` (~line 194) don't have `fontVariantNumeric`. Add `fontVariantNumeric="tabular-nums"` to both.

**Step 2: Verify visually**

Numbers should no longer shift layout when values change (e.g., 100W vs 110W).

**Step 3: Commit**

```bash
git add src/components/BikeControls.tsx
git commit -m "style: add tabular-nums to all numeric displays"
```

---

### Task 10: Final verification

**Step 1: Run full test suite**

Run: `pnpm test --run`
Expected: All tests pass

**Step 2: Run lint**

Run: `pnpm lint`
Expected: No errors, no warnings

**Step 3: Run build**

Run: `pnpm build`
Expected: SUCCESS

**Step 4: Manual smoke test**

Run: `pnpm dev`
1. Connect screen shows app title + connect button
2. Connect mock bike → start activity → verify stats display
3. Stop activity → full-screen summary appears with stats grid, chart, download/merge buttons
4. Click "Done" → returns to connect screen
5. Download TCX works (not disabled)
6. Toggle theme → all views look correct in both themes

**Step 5: Commit any remaining changes**

```bash
git add -A
git commit -m "feat: activity summary page and visual polish"
```
