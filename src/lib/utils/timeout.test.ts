import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withTimeout } from './timeout';

describe('withTimeout utility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should resolve with the promise value if it completes before the timeout', async () => {
    const fastPromise = Promise.resolve('Success Data');
    const timeoutDuration = 100;

    const promiseWithTimeout = withTimeout(fastPromise, timeoutDuration);

    await expect(promiseWithTimeout).resolves.toBe('Success Data');
  });

  it('should reject with a TimeoutError if the promise does not complete in time', async () => {
    const slowPromise = new Promise((resolve) => {
      setTimeout(() => resolve('This should not happen'), 200);
    });
    const timeoutDuration = 100;

    const promiseWithTimeout = withTimeout(slowPromise, timeoutDuration);

    vi.advanceTimersByTime(timeoutDuration);

    await expect(promiseWithTimeout).rejects.toSatisfy((error: Error) => {
      return error.name === 'TimeoutError';
    });
  });

  it('should reject with the original error if the promise rejects before the timeout', async () => {
    const originalError = new Error('Original Promise Error');
    const failingPromise = Promise.reject(originalError);
    const timeoutDuration = 100;

    const promiseWithTimeout = withTimeout(failingPromise, timeoutDuration);

    await expect(promiseWithTimeout).rejects.toThrow(originalError);
  });
});
