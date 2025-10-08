export class PendingRequestConflictError extends Error {
  constructor(message = 'There is already a pending request for this consumer.') {
    super(message);
    this.name = 'PendingRequestConflictError';
  }
}
