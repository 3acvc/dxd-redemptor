
export class NoModalDataProvidedError extends Error {
  constructor(modalId: string) {
    super(`No data provided to ${modalId}`);
  }
}
