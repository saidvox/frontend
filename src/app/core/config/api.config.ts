const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const API_BASE_URL = isLocalhost
  ? 'http://localhost:8080/api'
  : 'https://api.saidvox.dev/api';

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
