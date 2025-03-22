# Smart Trainer Control

Web-based control interface for Van Rysel D100 smart trainer. Uses Web Bluetooth API for direct trainer communication.

Check out at: [bike.ognjenbostjancic.com](https://bike.ognjenbostjancic.com)

![Smart Trainer Control Screenshot](public/screenshot.png)

## Features

- Real-time power and cadence control
- Web Bluetooth connectivity
- Power/cadence data visualization
- Responsive UI

## Stack

- React 19 + TypeScript
- Vite
- Park UI (Panda CSS)
- Web Bluetooth API
- Recharts

## Quick Start

```bash
# Install
yarn install

# Dev
yarn dev

# Build
yarn build
```

## Development

```bash
yarn dev      # Start dev server
yarn build    # Build for prod
yarn lint     # Run ESLint
yarn preview  # Preview prod build
yarn clean    # Clean dist
yarn serve    # Serve prod build
```

## Project Structure

```
src/
├── assets/      # Static assets
├── components/  # React components
├── hooks/       # Custom hooks
├── lib/         # Core logic
└── utils/       # Utilities
```

## Requirements

- Node.js 18+
- Yarn
- Chrome/Edge/Opera (Web Bluetooth support)

## License

MIT
