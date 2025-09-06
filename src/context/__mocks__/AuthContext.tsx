import { vi } from 'vitest';

export const useAuth = vi.fn(() => ({
  user: null,
  loading: false,
  signUp: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};
