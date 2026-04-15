export const getLevelStyle = (level) => {
  switch (level) {
    case 'red':
      return { backgroundColor: '#fee2e2', badgeColor: '#dc2626' };
    case 'yellow':
      return { backgroundColor: '#fef3c7', badgeColor: '#d97706' };
    default:
      return { backgroundColor: '#dcfce7', badgeColor: '#16a34a' };
  }
};

export const getRiskLevel = (type, value) => {
  if (value == null || Number.isNaN(value)) return 'green';

  switch (type) {
    case 'rain':
      if (value >= 25) return 'red';
      if (value >= 10) return 'yellow';
      return 'green';
    case 'wind':
      if (value >= 45) return 'red';
      if (value >= 25) return 'yellow';
      return 'green';
    case 'heat':
      if (value >= 35) return 'red';
      if (value >= 32) return 'yellow';
      return 'green';
    case 'frost':
      if (value <= 0) return 'red';
      if (value <= 3) return 'yellow';
      return 'green';
    default:
      return 'green';
  }
};

export const average = (arr = []) => {
  const nums = arr.filter((v) => typeof v === 'number' && !Number.isNaN(v));
  if (!nums.length) return null;
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
};

export const sumLast = (arr = [], count = 24) => {
  const nums = arr.slice(-count).filter((v) => typeof v === 'number' && !Number.isNaN(v));
  return nums.reduce((sum, n) => sum + n, 0);
};

export const formatNumber = (value, decimals = 0) => {
  if (value == null || Number.isNaN(value)) return '—';
  return Number(value).toFixed(decimals);
};

export const buildMonitoringCards = (snapshot) => {
  if (!snapshot) return [];

  const rain24 = snapshot.rain24h ?? null;
  const wind = snapshot.windKmh ?? null;
  const temp = snapshot.tempC ?? null;
  const soil = snapshot.soilTempC ?? null;
  const tMin = snapshot.tempMinC ?? null;
  const humidity = snapshot.humidity ?? null;

  const rainLevel = getRiskLevel('rain', rain24);
  const windLevel = getRiskLevel('wind', wind);
  const heatLevel = getRiskLevel('heat', temp);
  const frostLevel = getRiskLevel('frost', tMin);

  const aggregateLevels = [rainLevel, windLevel, heatLevel, frostLevel];
  const alarmLevel = aggregateLevels.includes('red')
    ? 'red'
    : aggregateLevels.includes('yellow')
    ? 'yellow'
    : 'green';

  return [
    {
      key: 'rain',
      title: 'Kiša 24h',
      value: `${formatNumber(rain24, 1)} mm`,
      level: rainLevel,
      emoji: rainLevel === 'red' ? '⛈️' : rainLevel === 'yellow' ? '🌧️' : '🌦️',
      note: 'Zbroj oborine zadnja 24 sata',
    },
    {
      key: 'wind',
      title: 'Vjetar',
      value: `${formatNumber(wind, 0)} km/h`,
      level: windLevel,
      emoji: windLevel === 'red' ? '💨' : '🌬️',
      note: 'Trenutna brzina vjetra',
    },
    {
      key: 'temp',
      title: 'Zrak',
      value: `${formatNumber(temp, 1)} °C`,
      level: heatLevel,
      emoji: heatLevel === 'red' ? '🔥' : '🌡️',
      note: 'Trenutna temperatura zraka',
    },
    {
      key: 'soil',
      title: 'Tlo',
      value: soil == null ? '—' : `${formatNumber(soil, 1)} °C`,
      level: 'green',
      emoji: '🌱',
      note: 'Prosjek temperature tla',
    },
    {
      key: 'humidity',
      title: 'Vlaga',
      value: humidity == null ? '—' : `${formatNumber(humidity, 0)} %`,
      level: 'green',
      emoji: '💧',
      note: 'Relativna vlaga zraka',
    },
    {
      key: 'alert',
      title: 'Alarm',
      value: alarmLevel === 'red' ? 'Visok' : alarmLevel === 'yellow' ? 'Srednji' : 'Nizak',
      level: alarmLevel,
      emoji: '🚦',
      note: `Min danas ${formatNumber(tMin, 1)} °C`,
    },
  ];
};

export function mapApiUserToProfile(user = {}) {
  return {
    fullName:
      user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Korisnik',
    email: user.email || '',
    location: user.mjesto || '',
    farmName: user.farm_name || '',
    phone: user.phone || '',
    zupanija: user.zupanija || '',
    adresa: user.adresa || '',
    oib: user.oib || '',
    mibpg: user.mibpg || '',
    jibg: user.jibg || '',
    baza: user.baza || '',
    organizacijski_oblik: user.organizacijski_oblik || '',
    djelatnosti: Array.isArray(user.djelatnosti) ? user.djelatnosti : [],
    zelim_aplikaciju: user.zelim_aplikaciju || '1',
    profile_photo: user.profile_photo || '',
    cover_photo: user.cover_photo || '',
  };
}

export const getActivityEmoji = (label = '') => {
  const value = String(label).toLowerCase();

  if (value.includes('ratarstvo')) return '🌾';
  if (value.includes('stočarstvo') || value.includes('stocarstvo')) return '🐄';
  if (value.includes('voćarstvo') || value.includes('vocarstvo')) return '🍎';
  if (value.includes('povrtlarstvo')) return '🥕';
  if (value.includes('vinogradarstvo')) return '🍇';
  if (value.includes('pčelarstvo') || value.includes('pcelarstvo')) return '🐝';
  if (value.includes('maslinarstvo')) return '🫒';
  if (value.includes('ekološka') || value.includes('ekoloska')) return '🌿';
  if (value.includes('prehrambena')) return '🥫';
  if (value.includes('trgovina')) return '🛒';
  if (value.includes('usluge')) return '🧰';
  if (value.includes('kooperacija')) return '🤝';
  if (value.includes('konzultantske')) return '📋';
  if (value.includes('edukacijske')) return '🎓';
  if (value.includes('alkoholna')) return '🍷';
  if (value.includes('ljekovito bilje')) return '🌿';
  if (value.includes('sjemenska')) return '🌱';
  if (value.includes('rasadničarstvo') || value.includes('rasadnicarstvo')) return '🪴';
  if (value.includes('cvjećarstvo') || value.includes('cvjecarstvo')) return '🌸';
  return '🌱';
};

export const formatLicenseDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('hr-HR');
};
