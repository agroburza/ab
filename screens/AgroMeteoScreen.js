
import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Linking,
  Switch,
} from 'react-native';

const MONTHS = ['Sij', 'Velj', 'Ožu', 'Tra', 'Svi', 'Lip', 'Srp', 'Kol', 'Ruj', 'Lis', 'Stu', 'Pro'];

const formatNumber = (value, decimals = 0, suffix = '') => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return `${Number(value).toFixed(decimals)}${suffix}`;
};

const safeNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const average = (values = []) => {
  const nums = values.map(safeNumber).filter((v) => v !== null);
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
};

const sum = (values = []) => {
  const nums = values.map(safeNumber).filter((v) => v !== null);
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0);
};

const formatHour = (value) => {
  if (!value) return '—';
  const s = String(value);
  if (s.includes('T')) return s.split('T')[1].slice(0, 5);
  return s.slice(0, 5);
};

const formatDay = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('hr-HR', { weekday: 'short', day: '2-digit', month: '2-digit' });
};

const normalizeDailyRow = (row = {}) => ({
  date: row?.date || row?.day || row?.time || row?.label || '',
  tempMinC: safeNumber(row?.tempMinC) ?? safeNumber(row?.temp_min_c) ?? safeNumber(row?.tmin_c) ?? safeNumber(row?.temperature_2m_min) ?? safeNumber(row?.temp_min),
  tempMaxC: safeNumber(row?.tempMaxC) ?? safeNumber(row?.temp_max_c) ?? safeNumber(row?.tmax_c) ?? safeNumber(row?.temperature_2m_max) ?? safeNumber(row?.temp_max),
  rainMm: safeNumber(row?.rainMm) ?? safeNumber(row?.rain_mm) ?? safeNumber(row?.precipitation_sum) ?? safeNumber(row?.precipitation) ?? safeNumber(row?.rain),
});

const normalizeHourlyRow = (row = {}, index = 0) => ({
  time: row?.time || row?.label || row?.hour || row?.datetime || `+${index}h`,
  tempC:
    safeNumber(row?.tempC) ??
    safeNumber(row?.temp_c) ??
    safeNumber(row?.temperature) ??
    safeNumber(row?.temperature_2m) ??
    safeNumber(row?.temperature2m) ??
    safeNumber(row?.temp) ??
    safeNumber(row?.temp2m) ??
    safeNumber(row?.air_temp) ??
    safeNumber(row?.air_temperature),
  rainMm:
    safeNumber(row?.rainMm) ??
    safeNumber(row?.rain_mm) ??
    safeNumber(row?.rain) ??
    safeNumber(row?.precipitation) ??
    safeNumber(row?.precipitation_mm) ??
    safeNumber(row?.precip_mm),
  precipitationProbability:
    safeNumber(row?.precipitationProbability) ??
    safeNumber(row?.precipitation_probability) ??
    safeNumber(row?.precipitation_prob) ??
    safeNumber(row?.rain_probability),
  humidity:
    safeNumber(row?.humidity) ??
    safeNumber(row?.relative_humidity) ??
    safeNumber(row?.relative_humidity_2m),
  windKmh:
    safeNumber(row?.windKmh) ??
    safeNumber(row?.wind) ??
    safeNumber(row?.wind_speed) ??
    safeNumber(row?.wind_speed_10m) ??
    safeNumber(row?.windspeed) ??
    safeNumber(row?.windspeed_10m),
});

const buildHourlyRows = (source) => {
  if (Array.isArray(source)) return source.map(normalizeHourlyRow);

  if (source && Array.isArray(source?.time)) {
    return source.time.map((time, index) =>
      normalizeHourlyRow(
        {
          time,
          temperature_2m: source?.temperature_2m?.[index],
          temperature: source?.temperature?.[index],
          temperature2m: source?.temperature2m?.[index],
          tempC: source?.tempC?.[index],
          temp_c: source?.temp_c?.[index],
          temp: source?.temp?.[index],
          temp2m: source?.temp2m?.[index],
          air_temp: source?.air_temp?.[index],
          air_temperature: source?.air_temperature?.[index],
          rain_mm: source?.rain_mm?.[index],
          precipitation: source?.precipitation?.[index],
          precipitation_mm: source?.precipitation_mm?.[index],
          precip_mm: source?.precip_mm?.[index],
          rain: source?.rain?.[index],
          precipitation_probability: source?.precipitation_probability?.[index],
          precip_probability: source?.precip_probability?.[index],
          relative_humidity_2m: source?.relative_humidity_2m?.[index],
          humidity: source?.humidity?.[index],
          relative_humidity: source?.relative_humidity?.[index],
          wind_speed_10m: source?.wind_speed_10m?.[index],
          wind_speed: source?.wind_speed?.[index],
          windspeed_10m: source?.windspeed_10m?.[index],
          windspeed: source?.windspeed?.[index],
          windKmh: source?.windKmh?.[index],
          wind: source?.wind?.[index],
        },
        index
      )
    );
  }

  return buildHourlyRows(
    source?.hourly ||
    source?.forecast?.hourly ||
    source?.raw?.hourly ||
    source?.data?.hourly ||
    source?.payload?.hourly ||
    source?.next_12h ||
    source?.next12h ||
    source?.recent_windows ||
    []
  );
};


const getNext12HoursFromNow = (rows = []) => {
  if (!Array.isArray(rows) || !rows.length) return [];

  const now = new Date();
  const currentHourTs = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    0,
    0,
    0
  ).getTime();

  const normalized = rows
    .map((row, index) => {
      const raw = row?.time;
      const date = raw ? new Date(raw) : null;
      const ts = date && !Number.isNaN(date.getTime()) ? date.getTime() : null;
      return { ...row, __index: index, __ts: ts };
    })
    .sort((a, b) => {
      if (a.__ts === null && b.__ts === null) return a.__index - b.__index;
      if (a.__ts === null) return 1;
      if (b.__ts === null) return -1;
      return a.__ts - b.__ts;
    });

  const futureRows = normalized.filter((row) => row.__ts !== null && row.__ts >= currentHourTs);

  if (futureRows.length) {
    return futureRows.slice(0, 12).map(({ __index, __ts, ...rest }) => rest);
  }

  return normalized.slice(0, 12).map(({ __index, __ts, ...rest }) => rest);
};

const normalizeAlerts = (payload) => {
  if (Array.isArray(payload?.alerts) && payload.alerts.length) return payload.alerts;
  if (Array.isArray(payload?.meteo?.alerts) && payload.meteo.alerts.length) return payload.meteo.alerts;
  if (Array.isArray(payload?.weather?.alerts) && payload.weather.alerts.length) return payload.weather.alerts;
  return [];
};

const normalizeMeteo = (payload) => {
  if (payload?.meteo) {
    const meteo = payload.meteo || {};
    const weather = payload?.weather || {};
    const current = weather?.current || {};
    const today = weather?.today || {};
    const hourlySource =
      meteo?.hourly ||
      meteo?.hourly_data ||
      meteo?.recent_windows ||
      meteo?.next_12h ||
      meteo?.next12h ||
      meteo?.forecast?.hourly ||
      meteo?.raw?.hourly ||
      weather?.hourly ||
      weather?.recent_windows ||
      payload?.hourly ||
      payload?.forecast?.hourly ||
      payload?.raw?.hourly ||
      [];
    const dailySource = Array.isArray(meteo?.daily) ? meteo.daily : Array.isArray(weather?.daily) ? weather.daily : Array.isArray(payload?.daily) ? payload.daily : [];

    return {
      ...meteo,
      locationName: meteo?.locationName || payload?.location?.place || '',
      admin1: meteo?.admin1 || payload?.location?.county || payload?.location?.region || '',
      tempC: safeNumber(meteo?.tempC ?? meteo?.temperature ?? meteo?.temp_current_c ?? current?.temperature ?? today?.temp_current_c),
      windKmh: safeNumber(meteo?.windKmh ?? meteo?.wind ?? meteo?.wind_current_kmh ?? current?.wind ?? today?.wind_current_kmh),
      humidity: safeNumber(meteo?.humidity ?? meteo?.humidity_current_pct ?? meteo?.relative_humidity ?? current?.humidity ?? today?.humidity_current_pct),
      soilTempC: safeNumber(meteo?.soilTempC ?? meteo?.soil_t ?? meteo?.soil_t_c ?? current?.soil_t ?? today?.soil_t_c),
      soilTempMinC: safeNumber(meteo?.soilTempMinC ?? meteo?.soil_temp_min_c ?? meteo?.soil_temperature_min),
      soilTempMaxC: safeNumber(meteo?.soilTempMaxC ?? meteo?.soil_temp_max_c ?? meteo?.soil_temperature_max),
      rain24h: safeNumber(meteo?.rain24h ?? meteo?.rain_mm_24h ?? meteo?.precipitation_24h ?? today?.rain_mm_24h),
      tempMinC: safeNumber(meteo?.tempMinC ?? meteo?.temp_min_c ?? meteo?.tmin_c ?? today?.tmin_c),
      tempMaxC: safeNumber(meteo?.tempMaxC ?? meteo?.temp_max_c ?? meteo?.tmax_c ?? today?.tmax_c),
      hourly: buildHourlyRows(hourlySource),
      daily: dailySource.slice(0, 7).map(normalizeDailyRow),
    };
  }

  const weather = payload?.weather || {};
  const current = weather?.current || {};
  const today = weather?.today || {};
  const recent = weather?.recent_windows || weather?.hourly || payload?.hourly || payload?.forecast?.hourly || payload?.raw?.hourly || [];
  const dailySource = Array.isArray(weather?.daily) ? weather.daily : Array.isArray(payload?.daily) ? payload.daily : [];

  return {
    locationName: payload?.location?.place || '',
    admin1: payload?.location?.county || payload?.location?.region || '',
    tempC: safeNumber(current?.temperature ?? today?.temp_current_c),
    windKmh: safeNumber(current?.wind ?? today?.wind_current_kmh),
    humidity: safeNumber(current?.humidity ?? today?.humidity_current_pct),
    soilTempC: safeNumber(current?.soil_t ?? today?.soil_t_c),
    soilTempMinC: safeNumber(payload?.soilTempMinC),
    soilTempMaxC: safeNumber(payload?.soilTempMaxC),
    rain24h: safeNumber(today?.rain_mm_24h),
    tempMinC: safeNumber(today?.tmin_c),
    tempMaxC: safeNumber(today?.tmax_c),
    hourly: buildHourlyRows(recent),
    daily: dailySource.slice(0, 7).map(normalizeDailyRow),
  };
};

const getClimateYears = (climate) => {
  const currentYear = new Date().getFullYear();
  const lastTen = Array.from({ length: 10 }, (_, i) => String(currentYear - 9 + i));
  const years = Array.isArray(climate?.years) ? climate.years.map((y) => String(y.year ?? y)) : [];
  const fromMap = Object.keys(climate?.monthly_by_year || {}).map(String);
  const active = climate?.active_year ? [String(climate.active_year)] : [];
  return Array.from(new Set([...lastTen, ...active, ...years, ...fromMap])).filter(Boolean).sort();
};

const initialYear = (climate) => {
  const years = getClimateYears(climate);
  const current = String(new Date().getFullYear());
  const active = climate?.active_year ? String(climate.active_year) : '';
  if (active && years.includes(active)) return active;
  if (years.includes(current)) return current;
  return years.slice(-1)[0] || current;
};

const climateMonths = (climate, yearKey) => {
  const src = climate?.monthly_by_year?.[yearKey] || climate?.monthly || {};
  return Array.from({ length: 12 }, (_, i) => {
    const idx = i + 1;
    const m = src?.[idx] || src?.[String(idx)] || src?.[String(idx).padStart(2, '0')] || {};
    return {
      label: MONTHS[i],
      precip: safeNumber(m?.precip ?? m?.rain ?? m?.precipitation),
      tmorning: safeNumber(m?.tmorning ?? m?.tmin ?? m?.tempMin ?? m?.temperature_2m_min ?? m?.morning ?? m?.morning_temp ?? m?.temp_morning ?? m?.air_temp_morning),
      tafternoon: safeNumber(m?.tafternoon ?? m?.tmax ?? m?.tempMax ?? m?.temperature_2m_max ?? m?.afternoon ?? m?.day ?? m?.day_temp ?? m?.temp_day ?? m?.air_temp_day),
      tsoil: safeNumber(m?.tsoil ?? m?.soil ?? m?.soil_temperature),
      sun: safeNumber(m?.sun ?? m?.sun_hours),
    };
  });
};

const normalizeYearSummary = (climate) => {
  if (Array.isArray(climate?.years) && climate.years.length) {
    return climate.years.map((row) => ({
      year: String(row?.year ?? '—'),
      precip: safeNumber(row?.precip),
      tair: safeNumber(row?.tair),
      tsoil: safeNumber(row?.tsoil),
      sun: safeNumber(row?.sun),
      tmorning: safeNumber(row?.tmorning ?? row?.tmin),
      tafternoon: safeNumber(row?.tafternoon ?? row?.tmax),
    }));
  }

  const source = climate?.monthly_by_year || {};
  return Object.keys(source).sort().map((year) => {
    const values = Object.values(source[year] || {});
    return {
      year,
      precip: sum(values.map((m) => m?.precip ?? m?.rain ?? m?.precipitation)),
      tair: average(values.flatMap((m) => [m?.tair, average([m?.tmorning, m?.tafternoon, m?.tmin, m?.tmax])])),
      tsoil: average(values.map((m) => m?.tsoil ?? m?.soil ?? m?.soil_temperature)),
      sun: sum(values.map((m) => m?.sun ?? m?.sun_hours)),
      tmorning: average(values.map((m) => m?.tmorning ?? m?.tmin ?? m?.temperature_2m_min)),
      tafternoon: average(values.map((m) => m?.tafternoon ?? m?.tmax ?? m?.temperature_2m_max)),
    };
  });
};

const buildMonthlyAverages = (climate, field) => {
  const source = climate?.monthly_by_year || {};
  return Array.from({ length: 12 }, (_, i) => {
    const idx = i + 1;
    const vals = [];
    Object.values(source).forEach((months) => {
      const month = months?.[idx] || months?.[String(idx)] || months?.[String(idx).padStart(2, '0')] || {};
      let value = null;
      if (field === 'precip') value = safeNumber(month?.precip ?? month?.rain ?? month?.precipitation);
      else if (field === 'tmorning') value = safeNumber(month?.tmorning ?? month?.tmin ?? month?.temperature_2m_min);
      else if (field === 'tafternoon') value = safeNumber(month?.tafternoon ?? month?.tmax ?? month?.temperature_2m_max);
      else if (field === 'tsoil') value = safeNumber(month?.tsoil ?? month?.soil ?? month?.soil_temperature);
      else if (field === 'sun') value = safeNumber(month?.sun ?? month?.sun_hours);
      else if (field === 'tair') value = average([month?.tair, month?.tmorning, month?.tafternoon, month?.tmin, month?.tmax, month?.temperature_2m_min, month?.temperature_2m_max]);
      if (value != null) vals.push(value);
    });
    return average(vals);
  });
};

const getLevel = (type, value) => {
  const n = Number(value);
  if (Number.isNaN(n)) return 'green';
  if (type === 'rain') return n >= 25 ? 'red' : n >= 10 ? 'yellow' : 'green';
  if (type === 'wind') return n >= 45 ? 'red' : n >= 25 ? 'yellow' : 'green';
  if (type === 'heat') return n >= 35 ? 'red' : n >= 32 ? 'yellow' : 'green';
  if (type === 'frost') return n <= 0 ? 'red' : n <= 3 ? 'yellow' : 'green';
  return 'green';
};

const levelUi = (level) => level === 'red'
  ? { cardBg: '#fee2e2', label: '🚨 Alarm' }
  : level === 'yellow'
  ? { cardBg: '#fef3c7', label: '⚠️ Upozorenje' }
  : { cardBg: '#dcfce7', label: '✅ Stabilno' };

const weatherEmoji = (rain, wind, tmin, tmax) => {
  if (getLevel('rain', rain).level === 'red') return '⛈️';
  if (getLevel('wind', wind).level === 'red') return '💨';
  if (getLevel('frost', tmin).level === 'red') return '🥶';
  if (getLevel('heat', tmax).level === 'red') return '🔥';
  if (getLevel('rain', rain).level === 'yellow') return '🌧️';
  return '🌤️';
};

function Accordion({ title, color, badge, children, defaultOpen = false, subtitle = '' }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={styles.accordionWrap}>
      <TouchableOpacity style={[styles.accordionHeader, { backgroundColor: color }]} onPress={() => setOpen((v) => !v)} activeOpacity={0.9}>
        <View style={styles.accordionTitleWrap}>
          <Text style={styles.accordionTitle}>{title}</Text>
          {!!subtitle && open ? <Text style={styles.accordionSubtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.accordionRight}>
          {!!badge ? <View style={styles.accordionBadge}><Text style={styles.accordionBadgeText}>{badge}</Text></View> : null}
          <Text style={styles.accordionArrow}>{open ? '−' : '+'}</Text>
        </View>
      </TouchableOpacity>
      {open ? <View style={styles.accordionBody}>{children}</View> : null}
    </View>
  );
}

function YearPills({ years, selectedYear, onSelect, activeColor }) {
  const { width } = useWindowDimensions();
  const useGrid = width < 700;
  const orderedYears = [...years].sort((a, b) => Number(a) - Number(b));

  if (useGrid) {
    return (
      <View style={styles.yearsGrid}>
        {orderedYears.map((year) => {
          const active = String(year) === String(selectedYear);
          return (
            <TouchableOpacity key={String(year)} style={[styles.yearPillGrid, active && { backgroundColor: activeColor, borderColor: activeColor }]} onPress={() => onSelect(String(year))} activeOpacity={0.9}>
              <Text style={[styles.yearPillText, active && styles.yearPillTextActive]}>{year}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearsRow}>
      {orderedYears.map((year) => {
        const active = String(year) === String(selectedYear);
        return (
          <TouchableOpacity key={String(year)} style={[styles.yearPill, active && { backgroundColor: activeColor, borderColor: activeColor }]} onPress={() => onSelect(String(year))} activeOpacity={0.9}>
            <Text style={[styles.yearPillText, active && styles.yearPillTextActive]}>{year}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function MetricCard({ emoji, value, label, style }) {
  return (
    <View style={[styles.kpiBox, style]}>
      <Text style={styles.kpiIcon}>{emoji}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function TableBlock({ columns, rows }) {
  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHead]}>
        {columns.map((col) => (
          <Text key={col.key} style={[styles.tableCell, col.wide && styles.tableCellWide, styles.tableHeadText]}>{col.label}</Text>
        ))}
      </View>
      {rows.length ? rows.map((row, index) => (
        <View key={index} style={styles.tableRow}>
          {columns.map((col) => (
            <Text key={col.key} style={[styles.tableCell, col.wide && styles.tableCellWide]}>{row[col.key]}</Text>
          ))}
        </View>
      )) : <Text style={styles.emptyText}>Nema podataka.</Text>}
    </View>
  );
}

function MiniBarChart({ labels, values = [], barColor = '#7FA52A', suffix = '', decimals = 0 }) {
  const nums = values.map(safeNumber).filter((v) => v !== null);
  const max = nums.length ? Math.max(...nums, 1) : 1;
  const colWidth = `${100 / Math.max(labels.length, 1)}%`;

  return (
    <View style={styles.chartWrap}>
      <View style={styles.chartBars}>
        {labels.map((label, index) => {
          const numeric = safeNumber(values[index]);
          const height = numeric == null ? 8 : Math.max(10, (numeric / max) * 96);
          return (
            <View key={`${label}-${index}`} style={[styles.chartCol, { width: colWidth }]}>
              <Text style={styles.chartValueTop}>{numeric == null ? '—' : `${Number(numeric).toFixed(decimals)}${suffix}`}</Text>
              <View style={[styles.chartBar, { height, backgroundColor: barColor }]} />
              <Text style={styles.chartMonth}>{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function GroupedBarsChart({ labels, valuesA, valuesB, colorA = '#2563eb', colorB = '#dc2626', suffix = '°C' }) {
  const nums = [...valuesA, ...valuesB].map(safeNumber).filter((v) => v !== null);
  const max = nums.length ? Math.max(...nums, 1) : 1;
  const colWidth = `${100 / Math.max(labels.length, 1)}%`;

  return (
    <View style={styles.chartWrap}>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: colorA }]} /><Text style={styles.legendText}>Jutarnja</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: colorB }]} /><Text style={styles.legendText}>Dnevna</Text></View>
      </View>
      <View style={styles.chartBars}>
        {labels.map((label, index) => {
          const a = safeNumber(valuesA[index]);
          const b = safeNumber(valuesB[index]);
          const hA = a == null ? 8 : Math.max(10, (a / max) * 96);
          const hB = b == null ? 8 : Math.max(10, (b / max) * 96);
          return (
            <View key={`${label}-${index}`} style={[styles.chartCol, { width: colWidth }]}>
              <View style={styles.groupWrap}>
                <View style={styles.singleBarWrap}>
                  <Text style={styles.chartValueAboveBar}>{a == null ? '—' : `${Math.round(a)}${suffix}`}</Text>
                  <View style={[styles.groupBar, { height: hA, backgroundColor: colorA }]} />
                </View>
                <View style={styles.singleBarWrap}>
                  <Text style={styles.chartValueAboveBar}>{b == null ? '—' : `${Math.round(b)}${suffix}`}</Text>
                  <View style={[styles.groupBar, { height: hB, backgroundColor: colorB }]} />
                </View>
              </View>
              <Text style={styles.chartMonth}>{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const SlideWrap = ({ width, children }) => <View style={[styles.slide, { width }]}>{children}</View>;

export default function AgroMeteoScreen({ agroData, onRefresh, loading = false }) {
  const { width } = useWindowDimensions();
  const scrollerRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(width);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    agroData?.notifications_enabled ?? agroData?.meteo?.notifications_enabled ?? true
  );

  const slideGap = 8;
  const sideInset = 12;
  const slideWidth = Math.max(sliderWidth - sideInset * 2, 280);

  const meteo = useMemo(() => normalizeMeteo(agroData), [agroData]);
  const alerts = useMemo(() => normalizeAlerts(agroData), [agroData]);
  const climate = agroData?.climate || null;
  const years = useMemo(() => getClimateYears(climate), [climate]);
  const yearSummary = useMemo(() => normalizeYearSummary(climate), [climate]);
  const [selectedYear, setSelectedYear] = useState(initialYear(climate));

  useEffect(() => {
    const next = initialYear(climate);
    setSelectedYear((prev) => (prev && years.includes(String(prev)) ? String(prev) : next));
  }, [climate, years]);

  const months = useMemo(() => climateMonths(climate, selectedYear), [climate, selectedYear]);
  const monthlyRainAvg = useMemo(() => buildMonthlyAverages(climate, 'precip'), [climate]);
  const yearlyRain = useMemo(() => yearSummary.map((row) => row?.precip), [yearSummary]);
  const monthlyMorningAvg = useMemo(() => buildMonthlyAverages(climate, 'tmorning'), [climate]);
  const monthlyAfternoonAvg = useMemo(() => buildMonthlyAverages(climate, 'tafternoon'), [climate]);
  const yearlyMorning = useMemo(() => yearSummary.map((row) => row?.tmorning), [yearSummary]);
  const yearlyAfternoon = useMemo(() => yearSummary.map((row) => row?.tafternoon), [yearSummary]);
  const monthlySoilAvg = useMemo(() => buildMonthlyAverages(climate, 'tsoil'), [climate]);
  const yearlySoil = useMemo(() => yearSummary.map((row) => row?.tsoil), [yearSummary]);
  const monthlySunAvg = useMemo(() => buildMonthlyAverages(climate, 'sun'), [climate]);
  const yearlySun = useMemo(() => yearSummary.map((row) => row?.sun), [yearSummary]);

  const locationName = agroData?.location?.place || meteo?.locationName || 'Vaša lokacija';
  const region = agroData?.location?.region || meteo?.admin1 || '';
  const temp = meteo?.tempC ?? null;
  const rain24 = meteo?.rain24h ?? null;
  const wind = meteo?.windKmh ?? null;
  const humidity = meteo?.humidity ?? null;
  const soilAvg = meteo?.soilTempC ?? null;
  const soilMin = meteo?.soilTempMinC ?? null;
  const soilMax = meteo?.soilTempMaxC ?? null;
  const tMin = meteo?.tempMinC ?? null;
  const tMax = meteo?.tempMaxC ?? null;
  const hourly = useMemo(() => getNext12HoursFromNow(Array.isArray(meteo?.hourly) ? meteo.hourly : []), [meteo?.hourly]);
  const daily = Array.isArray(meteo?.daily) ? meteo.daily.slice(0, 7) : [];

  const rainLevel = getLevel('rain', rain24);
  const windLevel = getLevel('wind', wind);
  const heatLevel = getLevel('heat', tMax ?? temp);
  const frostLevel = getLevel('frost', tMin);
  const overall = [rainLevel.level, windLevel.level, heatLevel.level, frostLevel.level].includes('red')
    ? 'red'
    : [rainLevel.level, windLevel.level, heatLevel.level, frostLevel.level].includes('yellow')
    ? 'yellow'
    : 'green';

  const heroUi = levelUi(overall);
  const radarUrl = agroData?.radar_url || meteo?.radar_url || '';

  const handleSlideScroll = (event) => {
    const step = slideWidth + slideGap;
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / step);
    setActiveSlide(nextIndex);
  };

  const goToSlide = (index) => {
    setActiveSlide(index);
    scrollerRef.current?.scrollTo({ x: (slideWidth + slideGap) * index, animated: true });
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.alarmBar, { backgroundColor: heroUi.cardBg }]}>
        <Text style={styles.alarmBarText}>{heroUi.label}</Text>
      </View>

      <View style={styles.heroRow}>
        <Text style={styles.locationText}>📍 {locationName}{region ? ` — ${region}` : ''}</Text>
      </View>

      <View style={styles.kpiRow}>
        <MetricCard
          emoji="🌡️"
          value={`${formatNumber(temp, 0)}°C`}
          label="Zrak"
          style={[
            heatLevel.level === 'yellow' && styles.kpiYellow,
            heatLevel.level === 'red' && styles.kpiRed,
          ]}
        />
        <MetricCard
          emoji="🌧️"
          value={`${formatNumber(rain24, 1)} mm`}
          label="24 h"
          style={[
            rainLevel.level === 'yellow' && styles.kpiYellow,
            rainLevel.level === 'red' && styles.kpiRed,
          ]}
        />
        <MetricCard
          emoji="🌬️"
          value={`${formatNumber(wind, 0)} km/h`}
          label="Vjetar"
          style={[
            windLevel.level === 'yellow' && styles.kpiYellow,
            windLevel.level === 'red' && styles.kpiRed,
          ]}
        />
        <MetricCard emoji="💧" value={`${formatNumber(humidity, 0)}%`} label="Vlaga" />
        <MetricCard emoji="🌱" value={`${formatNumber(soilAvg, 1)}°C`} label="Tlo" />
      </View>

      <View style={styles.dotsRow}>
        {[0, 1, 2, 3, 4].map((i) => (
          <TouchableOpacity key={i} style={[styles.dot, activeSlide === i && styles.dotActive]} onPress={() => goToSlide(i)} activeOpacity={0.9} />
        ))}
      </View>

      <View
        style={styles.sliderViewport}
        onLayout={(e) => {
          const nextWidth = e.nativeEvent.layout.width;
          if (nextWidth > 0 && nextWidth !== sliderWidth) setSliderWidth(nextWidth);
        }}
      >
        <ScrollView
          ref={scrollerRef}
          horizontal
          pagingEnabled
          snapToInterval={slideWidth + slideGap}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleSlideScroll}
          contentContainerStyle={[styles.sliderContent, { paddingLeft: sideInset, paddingRight: sideInset + 6 }]}
        >
          <SlideWrap width={slideWidth}>
            <Accordion title="Sljedećih 12 sati" color="#d6b57a" subtitle="Od ovog trenutka za narednih 12 sati.">
              <TableBlock
                columns={[
                  { key: 'time', label: 'Vrijeme',wide: true },
                  { key: 'temp', label: '🌡️' },
                  { key: 'rain', label: '🌧️' },
                  { key: 'wind', label: '🌬️' },
                ]}
                rows={hourly.map((row) => ({
                  time: `${weatherEmoji(row.rainMm, row.windKmh, null, row.tempC)} ${formatHour(row.time)}`,
                  temp: row?.tempC == null ? '—°C' : `${row.tempC.toFixed(0)}°C`,
                  rain: row?.rainMm != null ? `${row.rainMm.toFixed(1)} mm` : row?.precipitationProbability != null ? `${row.precipitationProbability.toFixed(0)}%` : '—',
                  wind: row?.windKmh == null ? '— km/h' : `${row.windKmh.toFixed(0)} km/h`,
                }))}
              />
            </Accordion>

     <Accordion
    title="Prognoza po danima"
    color="#b8d6a8"
    defaultOpen={false}
    subtitle="Sljedećih 7 dana."
  >
    <TableBlock
      columns={[
        { key: 'date', label: 'Dan', className: 'col-time', wide: true },
        { key: 'min', label: 'Min', className: 'col-small' },
        { key: 'max', label: 'Maks', className: 'col-small' },
        { key: 'rain', label: '☔', className: 'col-small' },
      ]}
      rows={daily.map((row) => ({
        date: `${weatherEmoji(row.rainMm, null, row.tempMinC, row.tempMaxC)} ${
  (() => {
    const d = new Date(row.date);
    const day = d.toLocaleDateString('hr-HR', { weekday: 'long' });
    return day.charAt(0).toUpperCase() + day.slice(1);
  })()
}`,
        min: `${formatNumber(row.tempMinC, 0)}°C`,
        max: `${formatNumber(row.tempMaxC, 0)}°C`,
        rain:
          row?.rainMm == null
            ? '—'
            : `${formatNumber(row.rainMm, 1)} mm`,
      }))}
    />

</Accordion>

            <View style={styles.notificationCard}>
  <View style={styles.notificationLeft}>
    <Text style={styles.notificationTitle}>Obavijesti AgroMeteo</Text>
    <Text style={styles.notificationText}>
      Primajte upozorenja naredna 3 dana za vašu lokaciju i djelatnosti.
    </Text>
  </View>
  <Switch
    value={notificationsEnabled}
    onValueChange={setNotificationsEnabled}
    trackColor={{ false: '#d1d5db', true: '#9bd18b' }}
    thumbColor={notificationsEnabled ? '#ffffff' : '#f4f4f5'}
  />
</View>


          </SlideWrap>

          <SlideWrap width={slideWidth}>
            <Accordion title="🌧️ Oborine" color="#cfdcf6" defaultOpen={true} badge={`${formatNumber(sum(months.map((m) => m.precip).filter((v) => v != null)), 0)} mm`} subtitle="Mjesečni zbroj oborina za odabranu godinu i pregled zadnjih 10 godina.">
              <YearPills years={years} selectedYear={selectedYear} onSelect={setSelectedYear} activeColor="#2563eb" />
              <Text style={styles.chartSubTitle}>Po mjesecima — {selectedYear}</Text>
              <MiniBarChart labels={MONTHS} values={months.map((m) => m.precip)} suffix=" mm" decimals={0} barColor="#2563eb" />
              <Accordion title="Prosjek po mjesecima" color="#eef4ff" defaultOpen={false} subtitle="Prosjek oborina po mjesecima kroz zadnjih 10 godina.">
                <MiniBarChart labels={MONTHS} values={monthlyRainAvg} suffix=" mm" decimals={0} barColor="#2563eb" />
              </Accordion>
              <Accordion title="Po godinama" color="#eef4ff" defaultOpen={false} subtitle="Ukupne oborine po godinama.">
                <MiniBarChart labels={years.slice(-10)} values={yearlyRain} suffix=" mm" decimals={0} barColor="#2563eb" />
              </Accordion>
            </Accordion>
          </SlideWrap>

          <SlideWrap width={slideWidth}>
            <Accordion title="🌡️ Temperatura zraka" color="#f7caca" defaultOpen={true} badge={`${formatNumber(average(months.map((m) => m.tmorning)), 0)}° / ${formatNumber(average(months.map((m) => m.tafternoon)), 0)}°`} subtitle="Plavo = jutarnja temperatura, crveno = dnevna temperatura.">
              <YearPills years={years} selectedYear={selectedYear} onSelect={setSelectedYear} activeColor="#dc2626" />
              <Text style={styles.chartSubTitle}>Po mjesecima — {selectedYear}</Text>
              <GroupedBarsChart labels={MONTHS} valuesA={months.map((m) => m.tmorning)} valuesB={months.map((m) => m.tafternoon)} />
              <Accordion title="Prosjek po mjesecima" color="#fdf2f2" defaultOpen={false} subtitle="Jutarnja i dnevna temperatura — 10-godišnji mjesečni prosjek.">
                <GroupedBarsChart labels={MONTHS} valuesA={monthlyMorningAvg} valuesB={monthlyAfternoonAvg} />
              </Accordion>
              <Accordion title="Po godinama" color="#fdf2f2" defaultOpen={false} subtitle="Prosjek jutarnje i dnevne temperature po godinama.">
                <GroupedBarsChart labels={years.slice(-10)} valuesA={yearlyMorning} valuesB={yearlyAfternoon} />
              </Accordion>
            </Accordion>
          </SlideWrap>

          <SlideWrap width={slideWidth}>
            <Accordion title="🌱 Temperatura tla" color="#ddbf8d" defaultOpen={true} badge={`${formatNumber(average(months.map((m) => m.tsoil)), 1)}°C`} subtitle="Mjesečni prosjek temperature tla i 10-godišnji trend.">
              <YearPills years={years} selectedYear={selectedYear} onSelect={setSelectedYear} activeColor="#8b5e34" />
              <Text style={styles.chartSubTitle}>Po mjesecima — {selectedYear}</Text>
              <MiniBarChart labels={MONTHS} values={months.map((m) => m.tsoil)} suffix="°" decimals={1} barColor="#8b5e34" />
              <Accordion title="Prosjek po mjesecima" color="#faf5ef" defaultOpen={false} subtitle="Prosjek temperature tla po mjesecima kroz zadnjih 10 godina.">
                <MiniBarChart labels={MONTHS} values={monthlySoilAvg} suffix="°" decimals={1} barColor="#8b5e34" />
              </Accordion>
              <Accordion title="Po godinama" color="#faf5ef" defaultOpen={false} subtitle="Prosječna temperatura tla po godinama.">
                <MiniBarChart labels={years.slice(-10)} values={yearlySoil} suffix="°" decimals={1} barColor="#8b5e34" />
              </Accordion>
            </Accordion>
          </SlideWrap>

          <SlideWrap width={slideWidth}>
            <Accordion title="☀️ Osunčanost" color="#ffe9a8" defaultOpen={true} badge={`${formatNumber(sum(months.map((m) => m.sun).filter((v) => v != null)), 0)} h`} subtitle="Mjesečni zbroj sati osunčanosti i trend zadnjih 10 godina.">
              <YearPills years={years} selectedYear={selectedYear} onSelect={setSelectedYear} activeColor="#d4a017" />
              <Text style={styles.chartSubTitle}>Po mjesecima — {selectedYear}</Text>
              <MiniBarChart labels={MONTHS} values={months.map((m) => m.sun)} suffix=" h" decimals={0} barColor="#d4a017" />
              <Accordion title="Prosjek po mjesecima" color="#fff9e8" defaultOpen={false} subtitle="Prosjek sati osunčanosti po mjesecima kroz zadnjih 10 godina.">
                <MiniBarChart labels={MONTHS} values={monthlySunAvg} suffix=" h" decimals={0} barColor="#d4a017" />
              </Accordion>
              <Accordion title="Po godinama" color="#fff9e8" defaultOpen={false} subtitle="Ukupni sati osunčanosti po godinama.">
                <MiniBarChart labels={years.slice(-10)} values={yearlySun} suffix=" h" decimals={0} barColor="#d4a017" />
              </Accordion>
            </Accordion>

            {radarUrl ? (
              <Accordion title="🛰️ Radar" color="#f8fafc" defaultOpen={false} subtitle="Otvori radar oborina za detaljan pregled.">
                <TouchableOpacity style={styles.radarButton} onPress={() => Linking.openURL(radarUrl)} activeOpacity={0.9}>
                  <Text style={styles.radarButtonText}>🛰️ Otvori radar</Text>
                </TouchableOpacity>
              </Accordion>
            ) : null}
          </SlideWrap>
        </ScrollView>
      </View>

      {loading ? <Text style={styles.loadingText}>Osvježavam AgroMeteo…</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, width: '100%' },
  sliderViewport: { width: '100%', overflow: 'hidden' },
  alarmBar: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  alarmBarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },
  heroRow: { marginBottom: 10 },
  locationText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  kpiBox: {
    width: '18.6%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d8dee8',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  kpiIcon: { fontSize: 13, marginBottom: 4 },
  kpiValue: { fontSize: 12, fontWeight: '700', color: '#111827', textAlign: 'center' },
  kpiLabel: { fontSize: 9, color: '#6b7280', marginTop: 3 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 999, backgroundColor: '#fca5a5', marginHorizontal: 4 },
  dotActive: { backgroundColor: '#ef4444' },
  sliderContent: {},
  slide: { marginRight: 8, overflow: 'hidden', paddingHorizontal: 0 },
  accordionWrap: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d8dee8',
    marginBottom: 12,
  },
  accordionHeader: {
    minHeight: 54,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionTitleWrap: { flex: 1, paddingRight: 8 },
  accordionTitle: { fontSize: 14, fontWeight: '800', color: '#374151' },
  accordionSubtitle: { fontSize: 11, color: '#6b7280', marginTop: 3 },
  accordionRight: { flexDirection: 'row', alignItems: 'center' },
  accordionBadge: { backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, marginRight: 10 },
  accordionBadgeText: { fontSize: 11, fontWeight: '800', color: '#334155' },
  accordionArrow: { fontSize: 24, lineHeight: 24, color: '#475569' },
  accordionBody: { padding: 12, backgroundColor: '#fff' },
  table: { borderWidth: 1, borderColor: '#dce3ea' },
  tableRow: { flexDirection: 'row', minHeight: 34, borderBottomWidth: 1, borderBottomColor: '#dce3ea' },
  tableHead: { backgroundColor: '#f8fafc' },
  tableCell: { width: 60, paddingHorizontal: 6, color: '#4b5563', fontSize: 12, paddingVertical: 8 },
  tableCellWide: { width: 100 },
  tableHeadText: { fontWeight: '800', color: '#64748b' },
  emptyText: { padding: 12, fontSize: 13, color: '#6b7280' },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d8dee8',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  notificationLeft: { flex: 1, paddingRight: 12 },
  notificationTitle: { fontSize: 14, fontWeight: '800', color: '#374151', marginBottom: 2 },
  notificationText: { fontSize: 11, color: '#6b7280', lineHeight: 15 },
  yearsRow: { paddingBottom: 10 },
  yearsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 10 },
  yearPill: {
    minWidth: 52,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#c9d2db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginRight: 8,
  },
  yearPillGrid: {
    width: '18%',
    minWidth: 54,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#c9d2db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  yearPillText: { fontSize: 12, fontWeight: '800', color: '#475569' },
  yearPillTextActive: { color: '#ffffff' },
  chartWrap: { paddingTop: 4 },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', minHeight: 148 },
  chartCol: { alignItems: 'center' },
  chartValueTop: { fontSize: 8, color: '#334155', marginBottom: 4, textAlign: 'center', minHeight: 20 },
  chartBar: { width: '70%', maxWidth: 16, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  groupWrap: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', minHeight: 100, width: '100%' },
  singleBarWrap: { width: 16, alignItems: 'center', justifyContent: 'flex-end', marginHorizontal: 1 },
  chartValueAboveBar: { width: 22, fontSize: 7, lineHeight: 8, color: '#334155', textAlign: 'center', marginBottom: 3 },
  groupBar: { width: 6, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  chartMonth: { fontSize: 9, color: '#6b7280', marginTop: 6 },
  chartSubTitle: { fontSize: 12, fontWeight: '700', color: '#6b7280', marginTop: 10, marginBottom: 8 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 14 },
  legendSwatch: { width: 10, height: 10, borderRadius: 3, marginRight: 6 },
  legendText: { fontSize: 11, color: '#4b5563', fontWeight: '700' },
  alertCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  alertTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 4 },
  alertText: { fontSize: 13, lineHeight: 18, color: '#4b5563' },
  radarButton: { minHeight: 52, borderRadius: 16, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  radarButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  loadingText: { textAlign: 'center', marginTop: 10, color: '#64748b', fontSize: 12 },
});
