import { useEffect, useState } from "react";

// Like useState, but the value is kept in localStorage so it is still there after a reload.
// Storage can be full, blocked or wiped (private windows), so every access is allowed to fail;
// the app then simply starts from `initialValue`.
//
// Put a version in the key (e.g. "qr:design:v1") and bump it when the stored shape changes,
// so old drafts are ignored instead of crashing the page.

function readStored<T>(key: string): T | undefined {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? undefined : (JSON.parse(stored) as T);
  } catch {
    return undefined;
  }
}

export function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => readStored<T>(key) ?? initialValue);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Not saving a draft is fine; the page still works.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
