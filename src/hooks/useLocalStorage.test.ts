import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useLocalStorage } from './useLocalStorage';
import * as log from '@/log';

const TEST_KEY = 'test-key';

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  const debugSpy = vi.spyOn(log, 'dbg');

  afterEach(() => {
    debugSpy.mockClear();
  });

  it('should initialize with the initialValue if localStorage is empty', () => {
    const initialValue = { name: 'John' };

    const { result } = renderHook(() => useLocalStorage(TEST_KEY, initialValue));

    expect(result.current[0]).toEqual(initialValue);
  });

  it('should initialize with the value from localStorage if it exists', () => {
    const storedValue = { name: 'Jane' };

    window.localStorage.setItem(TEST_KEY, JSON.stringify(storedValue));

    const { result } = renderHook(() => useLocalStorage(TEST_KEY, { name: 'default' }));

    expect(result.current[0]).toEqual(storedValue);
  });

  it('should update the state and localStorage when setValue is called', () => {
    const initialValue = 'initial';
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, initialValue));

    const newValue = 'updated';

    act(() => {
      result.current[1](newValue);
    });

    expect(result.current[0]).toBe(newValue);

    expect(window.localStorage.getItem(TEST_KEY)).toBe(JSON.stringify(newValue));
  });

  it('should work with a functional update for setValue', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, 10));
    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(20);
    expect(window.localStorage.getItem(TEST_KEY)).toBe(JSON.stringify(20));
  });

  it('should return initialValue if localStorage contains invalid JSON', () => {
    const initialValue = { default: true };

    window.localStorage.setItem(TEST_KEY, 'this-is-not-json');

    const { result } = renderHook(() => useLocalStorage(TEST_KEY, initialValue));

    expect(result.current[0]).toEqual(initialValue);
    expect(debugSpy).toHaveBeenCalled();
  });
});
