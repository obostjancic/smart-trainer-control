# Dark & Sporty Redesign

## Summary

Redesign the Smart Trainer Control app with a dark sporty aesthetic, dark/light mode toggle, improved typography, and enhanced bike controls.

## Color Palette

### Dark Mode (default)
- Background: `#0a0a0f`
- Card/surface: `#141419`
- Card border: `#1e1e26`
- Text primary: `#f0f0f0`
- Text muted: `#6b7280`

### Light Mode
- Background: `#f8f9fa`
- Card/surface: `#ffffff`
- Card border: `#e5e7eb`
- Text primary: `#111111`
- Text muted: `#6b7280`

### Accent Colors (shared)
- Power/primary: Electric cyan `#00e5ff`
- Speed/secondary: Hot orange `#ff6b2b`
- Danger: `#ef4444`
- UI interactive: Cyan `#00e5ff`

## Typography

- Font: **Space Grotesk** (Google Fonts)
- Stats numbers: tabular-nums, bold, with subtle text-shadow glow matching accent color
- Power glow: `0 0 20px rgba(0, 229, 255, 0.3)`
- Speed glow: `0 0 20px rgba(255, 107, 43, 0.3)`

## Changes

### 1. Theme System
- Add dark/light mode via CSS custom properties on `<html>` element
- Default to dark mode
- Persist preference in localStorage
- Toggle button (sun/moon icon) in top-right corner

### 2. Font
- Add Space Grotesk via Google Fonts link in index.html
- Set as default body font in CSS

### 3. BikeControls: +/- 50 Buttons
- Layout: `-50` `-10` `[value]` `+10` `+50`
- 50 buttons: smaller height (~48px), smaller font
- 10 buttons: keep current larger size (~72px)
- Same pattern for resistance: add +/- 50 buttons

### 4. CurrentStats: Glow Effect
- Power number: cyan color + cyan text-shadow glow
- Speed number: orange color + orange text-shadow glow

### 5. ActivityChart: Updated Colors
- Power line: `#00e5ff` (cyan)
- Speed line: `#ff6b2b` (orange)
- Grid lines: subtle gray matching theme

### 6. Global Styles
- Body background via CSS custom properties
- Smooth transitions for theme switching
- Cards/surfaces with subtle borders

## What Stays the Same
- Layout structure (pre-workout centered, active workout two-column)
- Component architecture
- All functionality
- Park UI component library (just color overrides)
