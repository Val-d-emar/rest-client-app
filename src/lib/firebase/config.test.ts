import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockInitializeApp = vi.fn();
const mockGetApps = vi.fn();
const mockGetApp = vi.fn();
const mockGetAuth = vi.fn();
const mockGetFirestore = vi.fn();
const mockErr = vi.fn();

vi.mock('firebase/app', () => ({
  initializeApp: mockInitializeApp,
  getApps: mockGetApps,
  getApp: mockGetApp,
}));
vi.mock('firebase/auth', () => ({
  getAuth: mockGetAuth,
}));
vi.mock('firebase/firestore', () => ({
  getFirestore: mockGetFirestore,
}));
vi.mock('@/log', () => ({
  err: mockErr,
}));

describe('Firebase Config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should initialize app and services on the first run', async () => {
    mockGetApps.mockReturnValue([]);

    await import('./config');

    expect(mockGetApps).toHaveBeenCalledTimes(1);
    expect(mockInitializeApp).toHaveBeenCalledTimes(1);
    expect(mockGetAuth).toHaveBeenCalledTimes(1);
    expect(mockGetFirestore).toHaveBeenCalledTimes(1);

    expect(mockErr).not.toHaveBeenCalled();
  });

  it('should get existing app if it has already been initialized', async () => {
    mockGetApps.mockReturnValue([{}]);

    await import('./config');

    expect(mockGetApp).toHaveBeenCalledTimes(1);
    expect(mockInitializeApp).not.toHaveBeenCalled();
  });

  it('should catch error and log it if getAuth fails', async () => {
    const authError = new Error('Auth service unavailable');
    mockGetApps.mockReturnValue([]);
    mockGetAuth.mockImplementation(() => {
      throw authError;
    });

    await import('./config');

    expect(mockErr).toHaveBeenCalledWith('Firebase config error:', authError);
  });

  it('getCurrentUserId should return uid if user exists', async () => {
    mockGetAuth.mockReturnValue({
      currentUser: { uid: 'user-123' },
    });

    const { getCurrentUserId } = await import('./config');

    expect(getCurrentUserId()).toBe('user-123');
  });

  it('getCurrentUserId should return null if user does not exist', async () => {
    mockGetAuth.mockReturnValue({
      currentUser: null,
    });

    const { getCurrentUserId } = await import('./config');

    expect(getCurrentUserId()).toBeNull();
  });
});
