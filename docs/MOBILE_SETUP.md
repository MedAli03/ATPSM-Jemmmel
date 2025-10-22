# Autism Association Mobile App

## Prerequisites
- Node.js 20+
- Android Studio or Xcode for device emulators

## Environment
Create a `.env` file in the `mobile` directory:

```
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_SOCKET_URL=https://api.example.com
```

## Installation

```
cd mobile
npm install
# run Husky setup *after* dependencies are installed
npm run prepare
```

## Development

```
npm run dev
```

This command delegates to the project-local Expo CLI (Expo SDK 51 includes the new CLI inside `node_modules`). If you still see the legacy warning about `expo-cli`, remove any globally installed copy before running the script:

```
npm uninstall -g expo-cli
```

After removing the global package, rerun `npm run dev` (or `npx expo start`) and the toolchain will use the modern CLI bundled with Expo. Avoid `npx run dev`—that command tries to execute a non-existent script.

Use the Expo Go app or an emulator. The project defaults to Arabic (RTL) but can be toggled to French from the settings tab.

## Quality Gates

```
npm run lint
npm run typecheck
npm test
```

## Testing
Tests use Jest with React Native Testing Library. Example commands:

```
npm test -- --watch
```

## API Assumptions
The app expects JWT-secured REST endpoints exposed under `/mobile/...` paths as described in feature hooks. Replace the placeholder URLs in `src/lib/env.ts` when wiring to production backends.
