function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
  }
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:3000/api/v1';
  if (h.startsWith('matjari-staging.')) return `https://api-staging.${h.slice('matjari-staging.'.length)}/api/v1`;
  return `https://api.${h.replace(/^matjari\./, '')}/api/v1`;
}

export const API_BASE_URL = getApiBaseUrl();
