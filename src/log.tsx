export const LOGGING =
  process.env.NEXT_PUBLIC_LOGGING_ENABLED === 'true' && process.env.NODE_ENV === 'development';

export const DEBUG_LOGGING_ENABLED =
  process.env.NEXT_PUBLIC_DEBUG_LOGGING_ENABLED === 'true' && LOGGING;

export function log(...args: unknown[]) {
  if (LOGGING) {
    console.info(...args);
    return true;
  } else {
    return false;
  }
}

export function err(...args: unknown[]) {
  if (LOGGING) {
    console.error(...args);
    return true;
  } else {
    return false;
  }
}

export function warn(...args: unknown[]) {
  if (LOGGING) {
    console.warn(...args);
    return true;
  } else {
    return false;
  }
}

export function dbg(...args: unknown[]) {
  if (DEBUG_LOGGING_ENABLED) {
    console.info('[DBG]', ...args);
    return true;
  } else {
    return false;
  }
}
