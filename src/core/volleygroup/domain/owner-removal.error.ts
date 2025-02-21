export class OwnerRemovalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OwnerRemovalError";
  }
}
