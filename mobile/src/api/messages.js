const notAvailableError = new Error('MESSAGING_API_NOT_AVAILABLE');
notAvailableError.code = 'MESSAGING_API_NOT_AVAILABLE';

export async function fetchThreads() {
  throw notAvailableError;
}

export async function fetchThreadMessages() {
  throw notAvailableError;
}

export async function sendThreadMessage() {
  throw notAvailableError;
}
