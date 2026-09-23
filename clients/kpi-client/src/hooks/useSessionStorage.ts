"use client";

import { useState, useCallback, useEffect } from "react";

export function useSessionStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = sessionStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
        try {
          sessionStorage.setItem(key, JSON.stringify(next));
        } catch { /* quota exceeded */ }
        return next;
      });
    },
    [key]
  );

  const clear = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
    } catch { /* noop */ }
    setState(defaultValue);
  }, [key, defaultValue]);

  // Sync nếu sessionStorage bị thay đổi từ tab khác
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setState(JSON.parse(e.newValue) as T);
        } catch { /* noop */ }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  return [state, setValue, clear];
}
