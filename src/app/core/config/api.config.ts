export const API_BASE_URL = 'http://localhost:8080/api';

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
