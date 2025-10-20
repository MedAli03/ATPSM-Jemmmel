# Autism Association Mobile App

## Prerequisites
- Node.js 20+
- Expo CLI (`npm install -g expo`)
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
npm run prepare
```

## Development

```
npm run dev
```

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
