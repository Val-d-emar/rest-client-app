import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { User, onIdTokenChanged } from 'firebase/auth';
import { UserCookieManager } from '@/lib/utils/cookie-manager';

vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/auth')>();
  return {
    ...actual,
    getAuth: vi.fn(),
    onIdTokenChanged: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
  };
});

vi.mock('@/lib/utils/cookie-manager', () => ({
  UserCookieManager: {
    setUserId: vi.fn(),
    removeUserId: vi.fn(),
  },
}));

describe('useAuth hook and AuthProvider', () => {
  const mockedOnIdTokenChanged = vi.mocked(onIdTokenChanged);
  let idTokenCallback: (user: User | null) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    mockedOnIdTokenChanged.mockImplementation((_auth, callback) => {
      if (typeof callback === 'function') {
        idTokenCallback = callback;
      }
      return vi.fn();
    });
  });

  it('should set loading to false and user to null after initial check', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      idTokenCallback(null);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should set the user and call UserCookieManager.setUserId on sign in', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    const mockUser = { uid: '123', email: 'test@example.com' } as User;

    act(() => {
      idTokenCallback(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);

    expect(UserCookieManager.setUserId).toHaveBeenCalledWith('123');
  });

  it('should clear the user, but not call removeUserId on simple state change to null', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const mockUser = { uid: '123', email: 'test@example.com' } as User;
    act(() => {
      idTokenCallback(mockUser);
    });
    expect(result.current.user).not.toBeNull();

    act(() => {
      idTokenCallback(null);
    });

    expect(result.current.user).toBeNull();

    expect(UserCookieManager.removeUserId).not.toHaveBeenCalled();
  });

  it('should call removeUserId when signing out', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const mockUser = { uid: '123', email: 'test@example.com' } as User;
    act(() => {
      idTokenCallback(mockUser);
    });

    await act(async () => {
      await result.current.signOut();
    });

    act(() => {
      idTokenCallback(null);
    });

    expect(result.current.user).toBeNull();

    expect(UserCookieManager.removeUserId).toHaveBeenCalledTimes(1);
  });
});
