const LEVELS = {
  neutral: 0,
  warning: 1,
  danger: 2,
};

export function getAgroMonitoringTheme(level = 'neutral') {
  if (level === 'danger') {
    return {
      background: '#fde2e2',
      border: '#f3a5a5',
    };
  }

  if (level === 'warning') {
    return {
      background: '#FFF7D6',
      border: '#F6D85F',
    };
  }

  return {
    background: '#f3f4f6',
    border: '#cbd5e1',
  };
}

export function getSlideIndicatorState(activeIndex = 0) {
  return { activeIndex: activeIndex > 0 ? 1 : 0 };
}

export function buildAgroMonitoringSummary(payload = {}) {
  const levelSignals = [];

  const airMin = pickNumber(payload,
    ['raw', 'meteo_today', 'tmin_c'],
    ['weather', 'tmin'], ['weather', 'temperature_min'], ['weather', 'air_min'],
    ['meteo', 'tmin'], ['meteo', 'temperature_min'],
    ['raw', 'tmin_c'], ['raw', 'temp_min_c']
  );
  const airMax = pickNumber(payload,
    ['raw', 'meteo_today', 'tmax_c'],
    ['weather', 'tmax'], ['weather', 'temperature_max'], ['weather', 'air_max'],
    ['meteo', 'tmax'], ['meteo', 'temperature_max'],
    ['raw', 'tmax_c'], ['raw', 'temp_max_c']
  );

  const soilMin = pickNumber(payload,
    ['raw', 'meteo_today', 'soil_t_min_c'], ['raw', 'meteo_today', 'soil_tmin_c'],
    ['raw', 'meteo_today', 'soil_temp_min_c'], ['raw', 'meteo_today', 'soil_temperature_min'],
    ['weather', 'soilTempMinC'], ['weather', 'soil_temp_min_c'], ['weather', 'soil_temperature_min'],
    ['weather', 'soil_t_min_c'], ['weather', 'soil_tmin_c'], ['weather', 'soilMin'], ['weather', 'soil_min'],
    ['meteo', 'soilTempMinC'], ['meteo', 'soil_temp_min_c'], ['meteo', 'soil_temperature_min'],
    ['raw', 'soil_t_min_c'], ['raw', 'soil_tmin_c']
  );
  const soilMax = pickNumber(payload,
    ['raw', 'meteo_today', 'soil_t_max_c'], ['raw', 'meteo_today', 'soil_tmax_c'],
    ['raw', 'meteo_today', 'soil_temp_max_c'], ['raw', 'meteo_today', 'soil_temperature_max'],
    ['weather', 'soilTempMaxC'], ['weather', 'soil_temp_max_c'], ['weather', 'soil_temperature_max'],
    ['weather', 'soil_t_max_c'], ['weather', 'soil_tmax_c'], ['weather', 'soilMax'], ['weather', 'soil_max'],
    ['meteo', 'soilTempMaxC'], ['meteo', 'soil_temp_max_c'], ['meteo', 'soil_temperature_max'],
    ['raw', 'soil_t_max_c'], ['raw', 'soil_tmax_c']
  );

  const rain24h = pickNumber(payload,
    ['raw', 'meteo_today', 'rain_24h'],
    ['weather', 'rain_24h'], ['weather', 'rain24h'], ['weather', 'precip_24h'], ['meteo', 'rain_24h'],
    ['raw', 'rain_24h'], ['raw', 'precip_24h']
  );
  const wind = pickNumber(payload,
    ['raw', 'meteo_today', 'wind'],
    ['weather', 'wind'], ['weather', 'wind_kmh'], ['weather', 'wind_speed'],
    ['meteo', 'wind'], ['raw', 'wind'], ['raw', 'wind_kmh']
  );
  const humidity = pickNumber(payload,
    ['raw', 'meteo_today', 'humidity'],
    ['weather', 'humidity'], ['weather', 'relative_humidity'], ['meteo', 'humidity'],
    ['raw', 'humidity'], ['raw', 'relative_humidity']
  );

  const airLevel = computeAirLevel(airMin, airMax);
  const soilLevel = computeSoilLevel(soilMin, soilMax);
  const rainLevel = computeRainLevel(rain24h);
  const windLevel = computeWindLevel(wind);
  const humidityLevel = computeHumidityLevel(humidity);

  levelSignals.push(airLevel, soilLevel, rainLevel, windLevel, humidityLevel);

  const messages = [];
  if (humidityLevel !== 'neutral') {
    messages.push('Visoka vlaga zraka pogoduje razvoju bolesti pa treba pojačati praćenje.');
  }
  if (windLevel === 'warning') {
    messages.push('Moguć je pojačan vjetar pa treba pratiti osjetljive kulture i prskanja.');
  }
  if (windLevel === 'danger') {
    messages.push('Vrlo jak vjetar može ometati radove i povećati rizik od šteta.');
  }
  if (airLevel === 'warning' && airMin != null && airMin <= 3) {
    messages.push('Jutarnje temperature su niske pa treba pratiti osjetljive kulture.');
  }
  if (airLevel === 'danger' && airMin != null && airMin <= 0) {
    messages.push('Moguć je mraz pa hitno provjeri najosjetljivije kulture i nasade.');
  }
  if (rainLevel === 'warning') {
    messages.push('Povećana količina oborine traži praćenje zadržavanja vlage i uvjeta za bolesti.');
  }
  if (rainLevel === 'danger') {
    messages.push('Oborina je izražena pa treba pratiti zadržavanje vode i mogućnost jačeg pritiska bolesti.');
  }

  const alertNotes = collectAlertNotes(payload);
  alertNotes.forEach((note) => {
    if (!messages.includes(note)) messages.push(note);
  });

  const level = highestLevel([deriveAlertLevel(payload), ...levelSignals]);
  const cleanMessages = messages.filter((msg) => {
    const t = String(msg || '').trim().toLowerCase();
    return t && !['green', 'yellow', 'red', 'neutral', 'ok', 'warning', 'danger'].includes(t);
  });
  const finalMessages = cleanMessages.length ? cleanMessages.slice(0, 3) : ['Nema izraženih rizika.'];

  const kpis = [
    {
      key: 'alarm',
      emoji: '🚦',
      label: 'Alarm',
      value: level === 'danger' ? 'Alarm' : level === 'warning' ? 'Oprez' : 'Stabilno',
      level,
    },
    {
      key: 'air',
      emoji: '🌡️',
      label: 'Temperatura zraka',
      value: formatMinMax(airMin, airMax),
      level: airLevel,
    },
    {
      key: 'soil',
      emoji: '🌱',
      label: 'Temperatura tla',
      value: formatMinMax(soilMin, soilMax),
      level: soilLevel,
    },
    {
      key: 'rain',
      emoji: '🌧️',
      label: 'Oborina',
      value: formatValue(rain24h, 'mm'),
      subvalue: rain24h != null ? '24h' : '',
      level: rainLevel,
    },
    {
      key: 'wind',
      emoji: '💨',
      label: 'Vjetar',
      value: formatValue(wind, 'km/h'),
      level: windLevel,
    },
    {
      key: 'humidity',
      emoji: '💧',
      label: 'Vlaga',
      value: formatValue(humidity, '%'),
      level: humidityLevel,
    },
  ];

  return {
    level,
    messages: finalMessages,
    kpis,
  };
}

function collectAlertNotes(payload) {
  const alerts = [];
  const list = Array.isArray(payload?.alerts)
    ? payload.alerts
    : Array.isArray(payload?.monitoring?.alerts)
    ? payload.monitoring.alerts
    : [];

  list.forEach((item) => {
    const note = String(item?.message || item?.note || item?.label || '').trim();
    const lowered = note.toLowerCase();
    if (!note) return;
    if (['green', 'yellow', 'red', 'neutral', 'ok'].includes(lowered)) return;
    alerts.push(note);
  });

  const monitoringMessage = String(payload?.monitoring?.message || '').trim();
  const monitoringLower = monitoringMessage.toLowerCase();
  if (monitoringMessage && !['green', 'yellow', 'red', 'neutral', 'ok'].includes(monitoringLower)) {
    alerts.push(monitoringMessage);
  }

  return dedupe(alerts).slice(0, 2);
}

function deriveAlertLevel(payload) {
  const list = Array.isArray(payload?.alerts)
    ? payload.alerts
    : Array.isArray(payload?.monitoring?.alerts)
    ? payload.monitoring.alerts
    : [];

  const levels = list.map((item) => normalizeLevel(item?.level || item?.status || item?.severity));
  return highestLevel(levels);
}

function computeAirLevel(min, max) {
  if (min != null && min <= 0) return 'danger';
  if (max != null && max >= 35) return 'danger';
  if (min != null && min <= 3) return 'warning';
  if (max != null && max >= 32) return 'warning';
  return 'neutral';
}

function computeSoilLevel(min, max) {
  if (min != null && min <= 0) return 'danger';
  if (min != null && min <= 3) return 'warning';
  if (max != null && max >= 35) return 'danger';
  if (max != null && max >= 28) return 'warning';
  return 'neutral';
}

function computeRainLevel(value) {
  if (value == null) return 'neutral';
  if (value >= 30) return 'danger';
  if (value >= 10) return 'warning';
  return 'neutral';
}

function computeWindLevel(value) {
  if (value == null) return 'neutral';
  if (value >= 45) return 'danger';
  if (value >= 25) return 'warning';
  return 'neutral';
}

function computeHumidityLevel(value) {
  if (value == null) return 'neutral';
  if (value >= 96) return 'danger';
  if (value >= 90) return 'warning';
  return 'neutral';
}

function highestLevel(levels = []) {
  let best = 'neutral';
  levels.forEach((lvl) => {
    const normalized = normalizeLevel(lvl);
    if (LEVELS[normalized] > LEVELS[best]) {
      best = normalized;
    }
  });
  return best;
}

function normalizeLevel(level) {
  const value = String(level || '').toLowerCase();
  if (['danger', 'red', 'high', 'critical', 'alarm'].includes(value)) return 'danger';
  if (['warning', 'yellow', 'medium', 'warn', 'oprez'].includes(value)) return 'warning';
  return 'neutral';
}

function pickNumber(payload, ...paths) {
  for (const path of paths) {
    const value = get(payload, path);
    if (value === 0) return 0;
    if (value != null && value !== '' && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

function get(obj, path) {
  return path.reduce((acc, key) => (acc != null ? acc[key] : undefined), obj);
}

function formatMinMax(min, max) {
  if (min == null && max == null) return '—';
  if (min != null && max != null) return `${Math.round(min)} / ${Math.round(max)} °C`;
  const single = min != null ? min : max;
  return `${Math.round(single)} °C`;
}

function formatValue(value, suffix) {
  if (value == null) return '—';
  return `${formatNumber(value)} ${suffix}`;
}

function formatNumber(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return Number.isInteger(num) ? String(num) : num.toFixed(1);
}

function dedupe(items) {
  return Array.from(new Set(items));
}