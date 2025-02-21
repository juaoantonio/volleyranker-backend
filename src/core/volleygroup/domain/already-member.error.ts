export class AlreadyMemberError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AlreadyMemberError";
  }
}
