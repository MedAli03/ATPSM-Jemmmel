/**
 * @typedef {Object} ThreadPage
 * @property {Array<Thread>} items
 * @property {number} page
 * @property {number} pageSize
 * @property {number} total
 * @property {number} totalPages
 */

/**
 * @typedef {Object} MessagePage
 * @property {Array<Message>} items
 * @property {string|null} nextCursor
 */

/**
 * @typedef {Object} MessagingService
 * @property {(params: {page?: number, pageSize?: number, search?: string, filter?: string}) => Promise<ThreadPage>} listThreads
 * @property {(threadId: string) => Promise<Thread>} getThread
 * @property {(threadId: string, cursor?: string|null) => Promise<MessagePage>} listMessages
 * @property {(threadId: string, draft: any) => Promise<Message>} sendMessage
 * @property {(payload: any) => Promise<Thread>} createThread
 * @property {(threadId: string, messageId?: string) => Promise<void>} markRead
 * @property {(threadId: string, archived: boolean) => Promise<void>} archiveThread
 * @property {(listener: (event: MessageEvent) => void) => () => void} onEvent
 */

export const MessagingServiceShape = {};
