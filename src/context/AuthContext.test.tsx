import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import {
  User,
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  UserCredential,
} from 'firebase/auth';
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
  const mockedCreateUser = vi.mocked(createUserWithEmailAndPassword);
  const mockedSignIn = vi.mocked(signInWithEmailAndPassword);
  const mockedSignOut = vi.mocked(firebaseSignOut);

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

  async function waitForAuthToLoad(result: { current: ReturnType<typeof useAuth> }) {
    act(() => {
      idTokenCallback(null);
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
  }

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

  describe('signUp function', () => {
    it('should call createUserWithEmailAndPassword on success', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
      await waitForAuthToLoad(result);

      mockedCreateUser.mockResolvedValue({ user: { uid: '123' } } as UserCredential);

      await act(async () => {
        await expect(result.current.signUp('test@test.com', 'password')).resolves.toBeUndefined();
      });

      expect(mockedCreateUser).toHaveBeenCalledWith(undefined, 'test@test.com', 'password');
    });

    it('should throw an error if createUserWithEmailAndPassword fails', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

      await waitForAuthToLoad(result);

      const testError = new Error('Email already in use');
      mockedCreateUser.mockRejectedValue(testError);

      await act(async () => {
        await expect(result.current.signUp('test@test.com', 'password')).rejects.toThrow(testError);
      });
    });
  });

  describe('signUp function', () => {
    it('should call createUserWithEmailAndPassword on success', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

      await waitForAuthToLoad(result);

      mockedCreateUser.mockResolvedValue({ user: { uid: '123' } } as UserCredential);

      await act(async () => {
        await result.current.signUp('test@test.com', 'password');
      });

      expect(mockedCreateUser).toHaveBeenCalledWith(undefined, 'test@test.com', 'password');
    });

    it('should throw an error if createUserWithEmailAndPassword fails', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

      await waitForAuthToLoad(result);

      const testError = new Error('Email already in use');
      mockedCreateUser.mockRejectedValue(testError);

      await act(async () => {
        await expect(result.current.signUp('test@test.com', 'password')).rejects.toThrow(testError);
      });
    });
  });

  describe('signIn function', () => {
    it('should call signInWithEmailAndPassword on success', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

      await waitForAuthToLoad(result);

      mockedSignIn.mockResolvedValue({ user: { uid: '123' } } as UserCredential);

      await act(async () => {
        await result.current.signIn('test@test.com', 'password');
      });

      expect(mockedSignIn).toHaveBeenCalledWith(undefined, 'test@test.com', 'password');
    });

    it('should throw a translated error if signInWithEmailAndPassword fails', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

      await waitForAuthToLoad(result);

      const firebaseError = new Error('Wrong password');
      const mockT = vi.fn((key) => `Translated: ${key}`);
      mockedSignIn.mockRejectedValue(firebaseError);

      await act(async () => {
        await expect(result.current.signIn('test@test.com', 'password', mockT)).rejects.toThrow(
          'Translated: signInFailed',
        );
      });

      expect(mockT).toHaveBeenCalledWith('signInFailed');
    });
  });

  it('should handle errors during signOut', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitForAuthToLoad(result);

    const testError = new Error('Sign out failed');
    mockedSignOut.mockRejectedValue(testError);

    await act(async () => {
      await expect(result.current.signOut()).rejects.toThrow(testError);
    });
  });
});
