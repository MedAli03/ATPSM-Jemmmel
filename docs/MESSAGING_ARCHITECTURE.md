# Messaging Module Architecture

## Overview

The messaging experience is composed of reusable presentation components, a service abstraction layer, and a lightweight client-side store that keeps threads, messages, drafts, and typing indicators in sync. The UI is tuned for Arabic RTL layouts, supports keyboard navigation, and avoids coupling with any concrete backend API by routing all requests through the `MessagingService` interface.

## Service Abstraction

```ts
interface MessagingService {
  listThreads(params): Promise<ThreadPage>;
  getThread(threadId): Promise<Thread>;
  listMessages(threadId, cursor?): Promise<MessagePage>;
  sendMessage(threadId, draft): Promise<Message>;
  createThread(payload): Promise<Thread>;
  markRead(threadId, messageId?): Promise<void>;
  archiveThread(threadId, archived: boolean): Promise<void>;
  onEvent(cb: (evt: MessageEvent) => void): Unsubscribe;
}
```

* `MessagingProvider` injects a concrete service implementation (the default `MockMessagingService`) via React context. Consumers never import the service directly, so wiring a real backend later only requires providing another implementation that respects the same contract.
* `MockMessagingService` simulates latency, pagination, optimistic confirmation, and realtime events (new messages, typing, status changes). It stores seed data in memory and emits events through a simple subscriber set.
* The service also exposes helpers (`buildOptimisticMessage`, `simulateTyping`) used by the provider to create pending messages and typing pulses.

## State & Data Flow

```
UI -> actions -> service -> reducer -> selectors -> UI
```

1. **Actions** – The provider exposes async operations (e.g. `listThreads`, `sendMessage`). Each action delegates to the service, dispatches reducer events, and performs optimistic updates/rollbacks.
2. **Reducer** – `messagingReducer` keeps a normalized cache of threads, messages, cursors, drafts, and typing users. Actions cover optimistic sends, pagination prepends, realtime appends, archiving, and draft persistence.
3. **Selectors** – `selectors` compute thread lists (sorted by `updatedAt`), thread-by-id, per-thread messages, drafts, and typing arrays. Components subscribe through the provider to avoid duplicating transformation logic.
4. **Drafts** – Draft text is saved into the reducer and mirrored to `localStorage` for offline continuity. When the provider mounts it rehydrates drafts from storage.
5. **Realtime** – `service.onEvent` streams updates. The provider converts them into reducer actions to update state without explicit refetches.
6. **Role-based filtering** – `sanitizeMessagesForRole` removes AI-generated system messages when the viewer is a `PARENT`, enforcing the "no raw AI" policy at the view-model layer.

## UI Composition

* **ThreadsPage** – Sticky header with search, filters, density toggle, and "new conversation" modal. Uses `ThreadListVirtualized` for performant rendering of large thread sets. Keyboard shortcuts: `↑/↓`, `Enter`, `A`, and `Ctrl/Cmd+K`.
* **ThreadView** – Header with back navigation, participant pills, overflow menu; virtualized timeline with date separators, optimistic bubbles, retry affordances, typing indicator, and composer.
* **Shared Components** – `ThreadItem`, `MessageBubble`, `Composer`, `TypingIndicator`, `DateSeparator`, `ReadReceipt`, `ParticipantsPill`, `EmptyState`, `ErrorState`, `SkeletonRow`.
* **Accessibility** – Semantic list roles, focus management, aria labels for read receipts, polite live regions for new messages/typing, keyboard-friendly controls, and dark-mode aware theming.
* **Offline / Resilience** – Drafts survive reloads, optimistic sends rollback on failure, inline errors provide retry options, and the mock service introduces latency & failure states to exercise the UI.

## Swapping in a Real Backend

1. Implement `MessagingService` with real transport (REST, GraphQL, WebSocket, etc.).
2. Provide the implementation to `<MessagingProvider service={yourService}>` at the route boundary.
3. Ensure the service emits equivalent events via `onEvent` to keep realtime updates in sync.
4. Map server payloads to the conceptual data models (`Thread`, `Message`, `Attachment`, `User`).

The UI, reducers, and tests remain unchanged because they target the interface rather than any specific API shape.

## Testing Strategy

* **Reducer Tests** – Validate optimistic send replacements, cursor prepends, and ordering.
* **Component Tests** – Composer keyboard flows, ThreadItem badges, sanitize util.
* **Integration Hooks** – `MockMessagingService` covers pagination, typing, and new-message events so the UI exercises key flows without external dependencies.

This modular structure ensures the messaging experience is intuitive, accessible, and ready for production services without rewrites.
