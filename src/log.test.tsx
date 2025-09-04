import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('log utility function', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetModules();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it('should NOT call console.log because the "logging" constant is false', async () => {
    vi.stubEnv('NEXT_PUBLIC_LOGGING_ENABLED', 'false');
    vi.stubEnv('NODE_ENV', 'development');

    const { log, err, warn } = await import('./log');
    log('Log');
    expect(consoleLogSpy).not.toHaveBeenCalled();

    err('err');
    expect(consoleErrSpy).not.toHaveBeenCalled();

    warn('warn');
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should NOT call console.log when MODE is not "development"', async () => {
    vi.stubEnv('NEXT_PUBLIC_LOGGING_ENABLED', 'true');
    vi.stubEnv('NODE_ENV', 'production');

    const { log, err, warn } = await import('./log');
    log('Log');
    expect(consoleLogSpy).not.toHaveBeenCalled();

    err('err');
    expect(consoleErrSpy).not.toHaveBeenCalled();

    warn('warn');
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should call console.log when logging is enabled AND mode is development', async () => {
    vi.stubEnv('NEXT_PUBLIC_LOGGING_ENABLED', 'true');
    vi.stubEnv('NODE_ENV', 'development');
    const message = 'This should be logged';
    const anotherArg = { id: 1 };

    const { log, err, warn } = await import('./log');

    log(message, anotherArg);

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);

    expect(consoleLogSpy).toHaveBeenCalledWith(message, anotherArg);

    warn(message, anotherArg);

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);

    expect(consoleWarnSpy).toHaveBeenCalledWith(message, anotherArg);

    err(message, anotherArg);

    expect(consoleErrSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrSpy).toHaveBeenCalledWith(message, anotherArg);
  });
});
