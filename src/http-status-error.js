export class HttpStatusError extends Error {
  constructor(status) {
    super(`Resource request failed with HTTP ${status}`);
    this.name = "HttpStatusError";
    this.status = status;
  }
}
