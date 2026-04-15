import { API_BASE, API_KEY } from './config';

export async function apiRequest(path, options = {}, token = '') {
  const headers = {
    'X-ABAPP-KEY': API_KEY,
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || 'Greška pri komunikaciji s API-jem');
  }

  return data;
}

export function getDefaultLicense() {
  return {
    license_active: true,
    license_state: 'active',
    license_expires_at: '',
    license_days_left: 9999,
    license_source: '',
    renew_url: '',
    app_notice: null,
  };
}