export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    let jsonPayload = '';
    if (typeof atob === 'function') {
      // browser-like (sometimes available in RN/Expo)
      const decoded = atob(base64);
      jsonPayload = decodeURIComponent(
        decoded
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } else if (typeof globalThis !== 'undefined' && (globalThis as any).Buffer) {
      // Node/Buffer fallback (some RN setups polyfill Buffer)
      jsonPayload = (globalThis as any).Buffer.from(base64, 'base64').toString('utf8');
    } else {
      // If neither is available, bail (use jwt-decode or /auth/me endpoint instead)
      console.warn(
        'No base64 decoder available to parse JWT. Consider adding jwt-decode or /auth/me.'
      );
      return null;
    }

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.warn('parseJwt failed', e);
    return null;
  }
}
