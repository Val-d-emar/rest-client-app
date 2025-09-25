import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserCookieManager } from './cookie-manager';

describe('CookieManager', () => {
  let mockCookies: string;
  let cookieSetterSpy: ReturnType<typeof vi.fn>;
  let originalCookieDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalCookieDescriptor = Object.getOwnPropertyDescriptor(document, 'cookie');

    mockCookies = '';

    delete (document as unknown as Record<string, unknown>).cookie;

    cookieSetterSpy = vi.fn((value: string) => {
      if (value.includes('max-age=0')) {
        mockCookies = mockCookies
          .split(';')
          .filter((cookie) => !cookie.trim().startsWith('userId='))
          .join(';');
      } else {
        const [cookiePart] = value.split(';');
        const [name, cookieValue] = cookiePart.split('=', 2);

        const existingCookies = mockCookies
          .split(';')
          .filter((cookie) => cookie.trim() && !cookie.trim().startsWith(`${name}=`));

        const newCookies = [...existingCookies, `${name}=${cookieValue || ''}`];
        mockCookies = newCookies.filter((cookie) => cookie.trim()).join(';');
      }
    });

    Object.defineProperty(document, 'cookie', {
      get: vi.fn(() => mockCookies),
      set: cookieSetterSpy,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();

    delete (document as unknown as Record<string, unknown>).cookie;
    if (originalCookieDescriptor) {
      Object.defineProperty(document, 'cookie', originalCookieDescriptor);
    }
  });

  describe('setUserId', () => {
    it('sets user ID cookie with correct format', () => {
      const userId = 'test-user-123';
      UserCookieManager.setUserId(userId);

      expect(cookieSetterSpy).toHaveBeenCalledWith(expect.stringContaining(`userId=${userId}`));
      expect(cookieSetterSpy).toHaveBeenCalledWith(expect.stringContaining('path=/'));
      expect(cookieSetterSpy).toHaveBeenCalledWith(expect.stringContaining('SameSite=Lax'));
    });

    it('sets cookie with correct max-age (365 days)', () => {
      const userId = 'test-user-123';
      UserCookieManager.setUserId(userId);

      const expectedMaxAge = 60 * 60 * 24 * 365;
      expect(cookieSetterSpy).toHaveBeenCalledWith(
        expect.stringContaining(`max-age=${expectedMaxAge}`),
      );
    });

    it('handles special characters in userId', () => {
      const userId = 'user@example.com';
      UserCookieManager.setUserId(userId);

      expect(cookieSetterSpy).toHaveBeenCalledWith(expect.stringContaining(`userId=${userId}`));
    });

    it('handles empty userId', () => {
      const userId = '';
      UserCookieManager.setUserId(userId);

      expect(cookieSetterSpy).toHaveBeenCalledWith(expect.stringContaining('userId='));
    });

    it('overwrites existing userId cookie', () => {
      const firstUserId = 'first-user';
      const secondUserId = 'second-user';

      UserCookieManager.setUserId(firstUserId);
      UserCookieManager.setUserId(secondUserId);

      expect(UserCookieManager.getUserId()).toBe(secondUserId);
    });
  });

  describe('removeUserId', () => {
    it('removes userId cookie by setting max-age to 0', () => {
      UserCookieManager.removeUserId();

      expect(cookieSetterSpy).toHaveBeenCalledWith('userId=; path=/; max-age=0');
    });

    it('removes existing userId cookie', () => {
      UserCookieManager.setUserId('test-user');
      expect(UserCookieManager.getUserId()).toBe('test-user');

      UserCookieManager.removeUserId();
      expect(UserCookieManager.getUserId()).toBeNull();
    });

    it('does nothing when no userId cookie exists', () => {
      expect(UserCookieManager.getUserId()).toBeNull();

      expect(() => UserCookieManager.removeUserId()).not.toThrow();
      expect(cookieSetterSpy).toHaveBeenCalledWith('userId=; path=/; max-age=0');
    });
  });

  describe('getUserId', () => {
    it('returns userId when cookie exists', () => {
      const userId = 'test-user-123';
      mockCookies = `userId=${userId}`;

      const result = UserCookieManager.getUserId();
      expect(result).toBe(userId);
    });

    it('returns null when no userId cookie exists', () => {
      mockCookies = '';

      const result = UserCookieManager.getUserId();
      expect(result).toBeNull();
    });

    it('returns null when userId cookie is empty', () => {
      mockCookies = 'userId=';

      const result = UserCookieManager.getUserId();
      expect(result).toBe('');
    });

    it('finds userId among multiple cookies', () => {
      const userId = 'target-user';
      mockCookies = 'otherCookie=value1; userId=' + userId + '; anotherCookie=value2';

      const result = UserCookieManager.getUserId();
      expect(result).toBe(userId);
    });

    it('handles cookies with spaces', () => {
      const userId = 'spaced-user';
      mockCookies = 'otherCookie=value1;userId=' + userId + ';anotherCookie=value2';

      const result = UserCookieManager.getUserId();
      expect(result).toBe(userId);
    });

    it('returns first userId if multiple exist (edge case)', () => {
      const firstUserId = 'first-user';
      const secondUserId = 'second-user';
      mockCookies = `userId=${firstUserId}; otherCookie=value; userId=${secondUserId}`;

      const result = UserCookieManager.getUserId();
      expect(result).toBe(firstUserId);
    });

    it('handles cookie values with special characters', () => {
      const userId = 'user@example.com';
      mockCookies = `userId=${userId}`;

      const result = UserCookieManager.getUserId();
      expect(result).toBe(userId);
    });

    it('handles cookie values with equals sign', () => {
      const userId = 'user=value';
      mockCookies = `userId=${userId}`;

      const result = UserCookieManager.getUserId();
      expect(result).toBe('user');
    });
  });

  describe('hasValidUserId', () => {
    it('returns true when valid userId exists', () => {
      mockCookies = 'userId=valid-user-123';

      const result = UserCookieManager.hasValidUserId();
      expect(result).toBe(true);
    });

    it('returns false when no userId cookie exists', () => {
      mockCookies = '';

      const result = UserCookieManager.hasValidUserId();
      expect(result).toBe(false);
    });

    it('returns true when userId is empty string (but cookie exists)', () => {
      mockCookies = 'userId=';

      const result = UserCookieManager.hasValidUserId();
      expect(result).toBe(true);
    });

    it('returns true for userId with special characters', () => {
      mockCookies = 'userId=user@example.com';

      const result = UserCookieManager.hasValidUserId();
      expect(result).toBe(true);
    });

    it('returns false when only other cookies exist', () => {
      mockCookies = 'otherCookie=value; anotherCookie=value2';

      const result = UserCookieManager.hasValidUserId();
      expect(result).toBe(false);
    });
  });

  describe('Integration tests', () => {
    it('complete workflow: set, get, remove', () => {
      const userId = 'workflow-test-user';

      expect(UserCookieManager.hasValidUserId()).toBe(false);
      expect(UserCookieManager.getUserId()).toBeNull();

      UserCookieManager.setUserId(userId);
      expect(UserCookieManager.hasValidUserId()).toBe(true);
      expect(UserCookieManager.getUserId()).toBe(userId);

      UserCookieManager.removeUserId();
      expect(UserCookieManager.hasValidUserId()).toBe(false);
      expect(UserCookieManager.getUserId()).toBeNull();
    });

    it('handles multiple set operations', () => {
      const userIds = ['user1', 'user2', 'user3'];

      userIds.forEach((userId) => {
        UserCookieManager.setUserId(userId);
        expect(UserCookieManager.getUserId()).toBe(userId);
        expect(UserCookieManager.hasValidUserId()).toBe(true);
      });

      expect(UserCookieManager.getUserId()).toBe(userIds[userIds.length - 1]);
    });

    it('preserves other cookies when managing userId', () => {
      mockCookies = 'otherCookie=value1; anotherCookie=value2';

      UserCookieManager.setUserId('test-user');

      expect(UserCookieManager.getUserId()).toBe('test-user');
    });
  });

  describe('Edge cases and error handling', () => {
    it('handles malformed cookie strings', () => {
      mockCookies = 'malformed; userId=valid-user; =invalid';

      const result = UserCookieManager.getUserId();
      expect(result).toBe('valid-user');
    });

    it('handles cookie string with no equals sign', () => {
      mockCookies = 'malformed-cookie; userId=valid-user';

      const result = UserCookieManager.getUserId();
      expect(result).toBe('valid-user');
    });

    it('handles very long userId', () => {
      const longUserId = 'a'.repeat(1000);
      UserCookieManager.setUserId(longUserId);

      expect(cookieSetterSpy).toHaveBeenCalledWith(expect.stringContaining(`userId=${longUserId}`));
    });

    it('handles userId with semicolons', () => {
      const userIdWithSemicolon = 'user;with;semicolons';
      UserCookieManager.setUserId(userIdWithSemicolon);

      expect(cookieSetterSpy).toHaveBeenCalledWith(
        expect.stringContaining(`userId=${userIdWithSemicolon}`),
      );
    });
  });

  describe('Class constants', () => {
    it('uses correct cookie name', () => {
      UserCookieManager.setUserId('test');
      expect(cookieSetterSpy).toHaveBeenCalledWith(expect.stringContaining('userId='));
    });

    it('uses correct max age (365 days)', () => {
      UserCookieManager.setUserId('test');
      const expectedMaxAge = 60 * 60 * 24 * 365;
      expect(cookieSetterSpy).toHaveBeenCalledWith(
        expect.stringContaining(`max-age=${expectedMaxAge}`),
      );
    });
  });

  describe('Singleton behavior', () => {
    it('UserCookieManager is a singleton instance', () => {
      expect(UserCookieManager).toBeDefined();
      expect(typeof UserCookieManager.setUserId).toBe('function');
      expect(typeof UserCookieManager.getUserId).toBe('function');
      expect(typeof UserCookieManager.removeUserId).toBe('function');
      expect(typeof UserCookieManager.hasValidUserId).toBe('function');
    });

    it('maintains state across different method calls', () => {
      UserCookieManager.setUserId('persistent-user');
      expect(UserCookieManager.hasValidUserId()).toBe(true);
      expect(UserCookieManager.getUserId()).toBe('persistent-user');
    });
  });
});
