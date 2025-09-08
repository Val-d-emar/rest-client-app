import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { User, onAuthStateChanged } from 'firebase/auth';

vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/auth')>();
  return { ...actual, getAuth: vi.fn(), onAuthStateChanged: vi.fn() };
});

describe('useAuth hook and AuthProvider', () => {
  const mockedOnAuthStateChanged = vi.mocked(onAuthStateChanged);
  let authStateCallback: (user: User | null) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    mockedOnAuthStateChanged.mockImplementation((auth, callback) => {
      if (typeof callback === 'function') {
        authStateCallback = callback;
      }
      return vi.fn();
    });
  });

  it('should set loading to false and user to null after initial check', async () => {
    const { result, rerender } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      authStateCallback(null);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should set the user object when auth state changes', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const mockUser = { uid: '123', email: 'test@example.com' } as User;

    act(() => {
      authStateCallback(mockUser);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
  });

  it('should clear the user object on sign out', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const mockUser = { uid: '123', email: 'test@example.com' } as User;

    act(() => {
      authStateCallback(mockUser);
    });

    expect(result.current.user).not.toBeNull();

    act(() => {
      authStateCallback(null);
    });

    expect(result.current.user).toBeNull();
  });
});
