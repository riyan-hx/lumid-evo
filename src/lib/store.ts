/** Tiny JSON localStorage helpers for device-only stores (safe when storage is blocked). */
export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/** All of Evo's device data (every key starts with "evo."). */
export function evoKeys() {
  try {
    return Object.keys(localStorage).filter((k) => k.startsWith("evo."));
  } catch {
    return [];
  }
}
