export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}
