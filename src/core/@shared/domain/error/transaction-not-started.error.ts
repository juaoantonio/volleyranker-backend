export class TransactionNotStartedError extends Error {
  constructor() {
    super("No transaction started");
  }
}
