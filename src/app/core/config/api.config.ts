const LOCAL_API_BASE_URL = 'http://localhost:8080/api';
const PRODUCTION_API_BASE_URL = 'https://api.saidvox.dev/api';

const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const API_BASE_URL = isLocalhost
  ? LOCAL_API_BASE_URL
  : PRODUCTION_API_BASE_URL;

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
