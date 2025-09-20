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
import { NextIntlClientProvider } from 'next-intl';
import messages from '../../messages/en.json';

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
  const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <NextIntlClientProvider locale='en' messages={messages}>
        <AuthProvider>{children}</AuthProvider>
      </NextIntlClientProvider>
    );
  };

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
      wrapper: TestWrapper,
    });

    act(() => {
      idTokenCallback(null);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should set the user and call UserCookieManager.setUserId on sign in', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
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
      wrapper: TestWrapper,
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
      wrapper: TestWrapper,
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
      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await waitForAuthToLoad(result);

      mockedCreateUser.mockResolvedValue({ user: { uid: '123' } } as UserCredential);

      await act(async () => {
        await result.current.signUp('test@test.com', 'password');
      });

      expect(mockedCreateUser).toHaveBeenCalledWith(undefined, 'test@test.com', 'password');
    });
    it('should call createUserWithEmailAndPassword on success', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
      await waitForAuthToLoad(result);

      mockedCreateUser.mockResolvedValue({ user: { uid: '123' } } as UserCredential);

      await act(async () => {
        await expect(result.current.signUp('test@test.com', 'password')).resolves.toBeUndefined();
      });

      expect(mockedCreateUser).toHaveBeenCalledWith(undefined, 'test@test.com', 'password');
    });

    it('should throw a translated error if createUser fails', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
      await waitForAuthToLoad(result);

      const firebaseError = new Error('Email already in use');
      mockedCreateUser.mockRejectedValue(firebaseError);

      await act(async () => {
        await expect(result.current.signUp('test@test.com', 'password')).rejects.toThrow(
          messages.AuthForm.signUpFailed + firebaseError.message,
        );
      });
    });
  });

  describe('signIn function', () => {
    it('should call signInWithEmailAndPassword on success', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await waitForAuthToLoad(result);

      mockedSignIn.mockResolvedValue({ user: { uid: '123' } } as UserCredential);

      await act(async () => {
        await result.current.signIn('test@test.com', 'password');
      });

      expect(mockedSignIn).toHaveBeenCalledWith(undefined, 'test@test.com', 'password');
    });

    it('should throw a translated error if signIn fails', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
      await waitForAuthToLoad(result);

      const firebaseError = new Error('Wrong password');
      mockedSignIn.mockRejectedValue(firebaseError);

      await act(async () => {
        await expect(result.current.signIn('test@test.com', 'password')).rejects.toThrow(
          messages.AuthForm.signInFailed + firebaseError.message,
        );
      });
    });
  });

  describe('signOut function', () => {
    it('should handle errors during signOut', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
      await waitForAuthToLoad(result);

      const testError = new Error('Sign out failed');
      mockedSignOut.mockRejectedValue(testError);

      await act(async () => {
        await expect(result.current.signOut()).rejects.toThrow(
          messages.AuthForm.signOutFailed + testError.message,
        );
      });
    });
  });
});
