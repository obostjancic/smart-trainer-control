# Mobile Workout Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the main page as a mobile-first workout dashboard with big buttons replacing sliders, sticky activity controls, and hero stats.

**Architecture:** Replace the current card-based layout with a mobile-first vertical stack. BikeControls gets +/- buttons instead of sliders. App.tsx layout reorganized with a sticky top bar for activity controls during workouts. Desktop (md+) uses a two-column grid.

**Tech Stack:** React 19, Panda CSS (styled-system/jsx), Ark UI, Lucide icons, Recharts

---

### Task 1: Rewrite BikeControls with +/- buttons

**Files:**
- Modify: `src/components/BikeControls.tsx`

Replace both sliders with button-based controls. Target Power gets large prominent buttons, Resistance gets smaller secondary buttons.

### Task 2: Rewrite App.tsx layout

**Files:**
- Modify: `src/App.tsx`

New mobile-first layout: sticky top bar (duration + pause/stop), hero stats, target power controls, resistance controls, compact chart. Desktop breakpoint uses two-column grid.

### Task 3: Rewrite ActivityControls for top bar

**Files:**
- Modify: `src/components/ActivityControls.tsx`

Redesign as a compact horizontal bar: duration on left, buttons on right. Start button is full-width standalone. Sticky positioning on mobile.

### Task 4: Simplify CurrentStats for mobile

**Files:**
- Modify: `src/components/CurrentStats.tsx`

Remove card wrapper on mobile. Make power the hero element (very large), speed secondary. Centered layout.

### Task 5: Make ActivityChart compact on mobile

**Files:**
- Modify: `src/components/ActivityChart.tsx`

Reduce chart height on mobile (~150px). Remove card header on mobile. Keep full size on desktop.
