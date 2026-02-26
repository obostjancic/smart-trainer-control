# CLAUDE.md

## Project

Smart Trainer Control — web app for controlling a Van Rysel D100 smart trainer via Web Bluetooth. Deployed at bike.ogi.fyi.

## Commands

```bash
pnpm dev        # Vite dev server
pnpm build      # tsc && vite build
pnpm test       # vitest (watch mode)
pnpm test --run # vitest single run
pnpm lint       # eslint (zero warnings allowed)
pnpm preview    # preview production build
pnpm clean      # rm dist/
pnpm serve      # serve dist/ on :4174
```

## Tech Stack

- React 19, TypeScript 5.7, Vite 6
- Panda CSS + Park UI (blue accent, sage gray) — generated output in `styled-system/`
- Recharts for data visualization
- Vitest + jsdom for testing
- Web Bluetooth API (Chrome/Edge/Opera only)

## Project Structure

```
src/
├── components/     # React components + ui/ subfolder (Park UI components)
├── contexts/       # ActivityContext (activity state management)
├── hooks/          # useActivity, useDialog
├── lib/
│   ├── bike/       # BikeBridge singleton, BluetoothBike, MockBike, FTMS protocol
│   └── file/       # TCX/FIT parsers and generators
├── utils/          # math, time, file utilities (with colocated tests)
├── types/          # Type declarations (fit-file-parser.d.ts)
└── test/           # Test setup and fixtures
```

## Key Patterns

- **Path alias**: `@/*` maps to `src/*`
- **Singleton**: `BikeBridge.getInstance()` for bike connections
- **Context + hooks**: ActivityContext for activity state, BikeProvider for connection state
- **Window.postMessage**: bike bridge communicates data to React via `{ type: "bike-data", payload }` messages
- **Park UI components**: compound pattern — `Card.Root`, `Card.Header`, `Card.Body`, etc.
- **Panda CSS**: use `css()` and JSX primitives from `styled-system/` (Box, Stack, Center, etc.)
- **Tests**: colocated `*.test.ts` files, vitest globals enabled, jsdom environment

## Style

- Be terse and direct — code over explanations
- Respect existing code comments
- Keep changes minimal — don't repeat unchanged code
