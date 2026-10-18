// Central API configuration
// In development, Vite proxy forwards /api to localhost:8000
// In production, calls the Render backend directly
const isDev = import.meta.env.DEV;

export const API_BASE = isDev
  ? '/api/v1'
  : (import.meta.env.VITE_API_BASE_URL || 'https://kewinchem-backend.onrender.com/api/v1');

/**
 * GET JSON from the API with a per-attempt timeout and retries.
 * The Render backend can take 20-40s to wake; without a timeout the first fetch can hang forever.
 */
export async function apiGet<T>(path: string, { tries = 3, timeoutMs = 25000 } = {}): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(`${API_BASE}${path}`, { signal: AbortSignal.timeout(timeoutMs) });
      if (res.ok) return (await res.json()) as T;
      if (res.status < 500) throw Object.assign(new Error(`HTTP ${res.status}`), { fatal: true });
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (e) {
      if ((e as { fatal?: boolean })?.fatal) throw e;
      lastErr = e;
    }
    await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
  }
  throw lastErr;
}

/** Fire-and-forget ping so the backend starts waking as soon as the site opens. */
export function warmUpApi() {
  if (typeof window === 'undefined') return; // not during pre-rendering
  fetch(`${API_BASE.replace(/\/api\/v1$/, '')}/health`).catch(() => {});
}
