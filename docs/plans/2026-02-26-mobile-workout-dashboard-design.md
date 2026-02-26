# Mobile Workout Dashboard Redesign

## Problem

The current page uses sliders for resistance/target power which are hard to use on mobile during exercise. Stats and controls are spread across cards requiring scrolling.

## Design

Single full-viewport mobile layout with sticky activity controls, hero stats, and big +/- buttons replacing sliders.

### Layout (top to bottom)

1. **Sticky top bar**: Duration timer (left) + Pause/Stop buttons (right). Only visible during active workout.
2. **Stats area**: Current power (hero size ~8xl, purple #b658c4) and speed (~4xl, green #46a758). Centered, no card wrapper on mobile.
3. **Target Power controls**: Current value label + two large side-by-side buttons "- 10" / "+ 10" (64-80px tall). 10W steps.
4. **Resistance controls**: Current value label + two medium buttons "-" / "+" (48px tall). 10% steps. Secondary prominence.
5. **Chart**: Compact ~150px tall dual-axis power/speed chart.

### Connection State

- Disconnected: Main area shows large "Connect" button replacing stats/controls.
- Connected: Connect button disappears; disconnect available via small icon in top bar or overflow.

### Desktop (md+)

Wider two-column layout. Stats + controls left column, chart right column. Sticky top bar becomes inline. Buttons remain (no sliders).

### Decisions

- Target power is primary control (user adjusts mid-ride)
- 10W step increments
- Show power + speed + duration at a glance
- Chart stays visible but compact on mobile
