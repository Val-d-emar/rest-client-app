const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] as const;
export { METHODS };
const TIMEOUT_DURATION = Number(process.env.NEXT_PUBLIC_FETCH_TIMEOUT_DURATION) || 15000;
export { TIMEOUT_DURATION };
const ENCODING_TOAST_ID = 'encoding-error-toast';
export { ENCODING_TOAST_ID };
