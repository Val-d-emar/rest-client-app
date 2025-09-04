export const LOGGING =
  process.env.NEXT_PUBLIC_LOGGING_ENABLED === 'true' && process.env.NODE_ENV === 'development';

export function log(...args: unknown[]) {
  if (LOGGING) {
    console.log(...args);
  }
}

export function err(...args: unknown[]) {
  if (LOGGING) {
    console.error(...args);
  }
}

export function warn(...args: unknown[]) {
  if (LOGGING) {
    console.warn(...args);
  }
}
