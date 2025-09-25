import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getStoredVariables, substituteVariables } from './variables';

import * as logger from '@/log';
const dbgSpy = vi.spyOn(logger, 'dbg');

describe('Variables Utilities', () => {
  describe('getStoredVariables', () => {
    const USER_ID = 'user-123';
    const STORAGE_KEY = `app-variables-${USER_ID}`;

    beforeEach(() => {
      window.localStorage.clear();
      dbgSpy.mockClear();
    });

    it('should return an empty object if no user ID is provided', () => {
      expect(getStoredVariables(null)).toEqual({});
    });

    it('should return an empty object if localStorage is empty', () => {
      expect(getStoredVariables(USER_ID)).toEqual({});
    });

    it('should correctly parse and return variables from localStorage', () => {
      const storedData = [
        { id: '1', key: 'baseUrl', value: 'https://api.example.com' },
        { id: '2', key: 'userId', value: '123' },
        { id: '3', key: '', value: 'should be ignored' },
      ];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));

      const expected = {
        baseUrl: 'https://api.example.com',
        userId: '123',
      };

      expect(getStoredVariables(USER_ID)).toEqual(expected);
    });

    it('should return an empty object and log an error if localStorage contains invalid JSON', () => {
      window.localStorage.setItem(STORAGE_KEY, 'this-is-not-json');

      expect(getStoredVariables(USER_ID)).toEqual({});
      expect(dbgSpy).toHaveBeenCalled();
    });
  });

  describe('substituteVariables', () => {
    const variables = {
      host: 'api.example.com',
      version: 'v1',
      userId: '123',
    };

    it('should substitute a single variable in a string', () => {
      const input = 'https://{{host}}/users';
      const expected = 'https://api.example.com/users';
      expect(substituteVariables(input, variables)).toBe(expected);
    });

    it('should substitute multiple variables in a string', () => {
      const input = 'https://{{host}}/{{version}}/users/{{userId}}';
      const expected = 'https://api.example.com/v1/users/123';
      expect(substituteVariables(input, variables)).toBe(expected);
    });

    it('should handle variables with surrounding spaces inside the curly braces', () => {
      const input = 'https://{{  host  }}/users/{{userId}}';
      const expected = 'https://api.example.com/users/123';
      expect(substituteVariables(input, variables)).toBe(expected);
    });

    it('should not substitute variables that do not exist in the map', () => {
      const input = 'https://{{host}}/users/{{unknownVar}}';
      const expected = 'https://api.example.com/users/{{unknownVar}}';
      expect(substituteVariables(input, variables)).toBe(expected);
    });

    it('should return the original string if no variables are found', () => {
      const input = 'https://api.example.com/users';
      expect(substituteVariables(input, variables)).toBe(input);
    });

    it('should handle an empty input string', () => {
      expect(substituteVariables('', variables)).toBe('');
    });
  });
});
