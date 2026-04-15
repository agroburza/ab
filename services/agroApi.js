const DEFAULT_TIMEOUT_MS = 20000;

const buildUrl = (baseUrl, path) => {
  const root = String(baseUrl || '').replace(/\/$/, '');
  const tail = String(path || '').replace(/^\//, '');
  return `${root}/${tail}`;
};

const createHeaders = ({ apiKey, authToken, headers = {} } = {}) => {
  const baseHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  const hasContentType = Object.keys(baseHeaders).some(
    (key) => key.toLowerCase() === 'content-type'
  );

  if (!hasContentType) {
    baseHeaders['Content-Type'] = 'application/json';
  }

  if (apiKey) {
    baseHeaders['X-ABAPP-KEY'] = apiKey;
  }

  if (authToken) {
    baseHeaders.Authorization = `Bearer ${authToken}`;
  }

  return baseHeaders;
};

const withTimeout = async (promise, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Zahtjev je istekao. Pokušaj ponovno.'));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
};

async function requestJson(baseUrl, path, config = {}) {
  const {
    method = 'GET',
    body,
    apiKey,
    authToken,
    headers,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = config;

  const response = await withTimeout(
    fetch(buildUrl(baseUrl, path), {
      method,
      headers: createHeaders({ apiKey, authToken, headers }),
      body,
    }),
    timeoutMs
  );

  const text = await response.text();
  let json = {};

  try {
    json = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`Neispravan JSON odgovor: ${text.slice(0, 180)}`);
  }

  if (!response.ok || json?.success === false) {
    throw new Error(json?.message || `HTTP ${response.status}`);
  }

  return json;
}

export function normalizeAgroMeteoPayload(json = {}) {
  return {
    success: json?.success !== false,
    user: json?.user || null,
    location: json?.location || {},
    meteo: json?.meteo || json?.weather || {},
    climate: json?.climate || null,
    alerts: Array.isArray(json?.alerts)
      ? json.alerts
      : Array.isArray(json?.meteo?.alerts)
      ? json.meteo.alerts
      : [],
    alarm: json?.alarm || null,
    radar: json?.radar || null,
    radar_url:
      json?.radar_url ||
      json?.radar?.open_url ||
      json?.radar?.latest_url ||
      '',
    notifications_enabled: !!json?.notifications_enabled,
  };
}

export async function fetchAgroHome({ baseUrl, apiKey, authToken }) {
  return requestJson(baseUrl, '/wp-json/abapp/v1/agro/app-home', {
    apiKey,
    authToken,
  });
}

export async function fetchAgroMeteo({ baseUrl, apiKey, authToken }) {
  const json = await requestJson(baseUrl, '/wp-json/abapp/v1/agro/meteo', {
    apiKey,
    authToken,
  });
  return normalizeAgroMeteoPayload(json);
}

export async function fetchAgroMonitoring({ baseUrl, apiKey, authToken }) {
  return requestJson(baseUrl, '/wp-json/abapp/v1/agro/monitoring', {
    apiKey,
    authToken,
  });
}

export async function fetchAgroModules({ baseUrl, apiKey, authToken }) {
  return requestJson(baseUrl, '/wp-json/abapp/v1/agro/modules', {
    apiKey,
    authToken,
  });
}
