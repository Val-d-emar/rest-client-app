export class TimeoutError extends Error {
  constructor(duration: number) {
    super(`Operation timed out after ${duration / 1000} seconds`);
    this.name = 'TimeoutError';
  }
}

export function withTimeout<T>(promise: Promise<T>, duration: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new TimeoutError(duration)), duration),
  );
  return Promise.race([promise, timeoutPromise]);
}
