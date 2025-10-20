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

This command leverages the project-local Expo CLI via `npx`, avoiding the deprecated global `expo-cli`. You can also run `npx expo start` directly. Avoid `npx run dev`—that command tries to execute a non-existent script.

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
