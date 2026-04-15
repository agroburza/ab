
export const REMOVAL = {
  psenica_zrno: { N: 26, P2O5: 11, K2O: 20, SO3: 5 },
  psenica_slama: { N: 5, P2O5: 1, K2O: 10, SO3: 2 },
  kukuruz_zrno: { N: 28, P2O5: 9, K2O: 22, SO3: 4 },
  kukuruz_silaza: { N: 6, P2O5: 2, K2O: 7, SO3: 2 },
  jecam_zrno: { N: 24, P2O5: 10, K2O: 18, SO3: 4 },
  tritikale_zrno: { N: 25, P2O5: 10, K2O: 19, SO3: 4 },
  raz_zrno: { N: 22, P2O5: 9, K2O: 18, SO3: 4 },
  zob_zrno: { N: 23, P2O5: 9, K2O: 20, SO3: 4 },
  soja_zrno: { N: 0, P2O5: 16, K2O: 30, SO3: 5 },
  uljana_repica: { N: 40, P2O5: 14, K2O: 40, SO3: 14 },
  suncokret: { N: 40, P2O5: 12, K2O: 30, SO3: 10 },
  secerna_repa_koren: { N: 5, P2O5: 2, K2O: 6, SO3: 2 },
  sirak_zrno: { N: 22, P2O5: 8, K2O: 20, SO3: 4 },
  grasek_zrno: { N: 0, P2O5: 12, K2O: 15, SO3: 4 },
  bob_zrno: { N: 0, P2O5: 13, K2O: 20, SO3: 5 },
  lucerna_sijeno: { N: 0, P2O5: 8, K2O: 20, SO3: 6 },
};

export const CLASS_ADJ = { A: 0.3, B: 0.15, C: 0, D: -0.2, E: -0.4 };

export const CLASS_THRESHOLDS = {
  P2O5: [
    { max: 5, cls: 'A' },
    { max: 10, cls: 'B' },
    { max: 20, cls: 'C' },
    { max: 35, cls: 'D' },
    { max: Number.POSITIVE_INFINITY, cls: 'E' },
  ],
  K2O: [
    { max: 10, cls: 'A' },
    { max: 20, cls: 'B' },
    { max: 30, cls: 'C' },
    { max: 45, cls: 'D' },
    { max: Number.POSITIVE_INFINITY, cls: 'E' },
  ],
};

export const PRODUCTS = [
  { id: 'urea', name: 'Urea 46-0-0', N: 46, P2O5: 0, K2O: 0, SO3: 0 },
  { id: 'urea_inh', name: 'Urea 46-0-0 (s inhibitorom)', N: 46, P2O5: 0, K2O: 0, SO3: 0 },
  { id: 'kan27', name: 'KAN 27% (Ca/Mg)', N: 27, P2O5: 0, K2O: 0, SO3: 0 },
  { id: 'asn26', name: 'ASN 26 N + 13 SO3', N: 26, P2O5: 0, K2O: 0, SO3: 13 },
  { id: 'amosulfan', name: 'Amosulfan 20 N + 24 SO3', N: 20, P2O5: 0, K2O: 0, SO3: 24 },
  { id: 'map', name: 'MAP 12-52', N: 12, P2O5: 52, K2O: 0, SO3: 0 },
  { id: 'dap', name: 'DAP 18-46', N: 18, P2O5: 46, K2O: 0, SO3: 0 },
  { id: 'mop', name: 'MOP 0-0-60 (KCl)', N: 0, P2O5: 0, K2O: 60, SO3: 0 },
  { id: 'sop', name: 'SOP 0-0-50 + 17 SO3', N: 0, P2O5: 0, K2O: 50, SO3: 17 },
  { id: 'npk72030', name: 'NPK 7-20-30', N: 7, P2O5: 20, K2O: 30, SO3: 0 },
  { id: 'y8_24_24', name: 'YaraMila 8-24-24', N: 8, P2O5: 24, K2O: 24, SO3: 0 },
  { id: 'npk15_15_15', name: 'NPK 15-15-15', N: 15, P2O5: 15, K2O: 15, SO3: 0 },
  { id: 'npk15_15_20', name: 'NPK 15-15-20', N: 15, P2O5: 15, K2O: 20, SO3: 0 },
  { id: 'npk10_30_20', name: 'NPK 10-30-20', N: 10, P2O5: 30, K2O: 20, SO3: 0 },
  { id: 'npk5_15_30', name: 'NPK 5-15-30', N: 5, P2O5: 15, K2O: 30, SO3: 0 },
];

export const REGION_NAMES = {
  slavonija: 'Slavonija',
  srednja: 'Središnja Hrvatska',
};

export const CROP_NAMES = {
  psenica_zrno: 'Pšenica',
  jecam_zrno: 'Ječam',
  tritikale_zrno: 'Tritikale',
  raz_zrno: 'Raž',
  zob_zrno: 'Zob',
  kukuruz_zrno: 'Kukuruz',
  kukuruz_silaza: 'Kukuruz — silaža',
  soja_zrno: 'Soja',
  uljana_repica: 'Uljana repica',
  suncokret: 'Suncokret',
  secerna_repa_koren: 'Šećerna repa',
  sirak_zrno: 'Sirak',
  grasek_zrno: 'Grašak',
  bob_zrno: 'Bob',
  lucerna_sijeno: 'Lucerna — sijeno',
};

export const CALENDAR = {
  slavonija: {
    psenica_zrno: [
      { mjesec: 'rujan–listopad', faza: 'sjetva', preporuka: 'Osnovna NPK 300–400 kg/ha; P i K prema analizi tla.' },
      { mjesec: 'veljača', faza: 'busanje', preporuka: 'KAN 27% ili urea 80–150 kg/ha.' },
      { mjesec: 'ožujak–travanj', faza: 'vlatanje', preporuka: 'KAN/Urea 60–120 kg/ha; po potrebi S (Amosulfan/ASN).' },
    ],
    jecam_zrno: [
      { mjesec: 'rujan', faza: 'sjetva', preporuka: 'NPK 7-20-30 250–350 kg/ha.' },
      { mjesec: 'veljača', faza: 'busanje', preporuka: 'KAN 60–120 kg/ha (umjereno s N).' },
    ],
    tritikale_zrno: [
      { mjesec: 'rujan', faza: 'sjetva', preporuka: 'NPK 7-20-30 250–350 kg/ha.' },
      { mjesec: 'veljača', faza: 'busanje', preporuka: 'KAN 60–120 kg/ha.' },
    ],
    raz_zrno: [
      { mjesec: 'rujan', faza: 'sjetva', preporuka: 'NPK 7-20-30 220–320 kg/ha.' },
      { mjesec: 'veljača', faza: 'busanje', preporuka: 'KAN 50–100 kg/ha.' },
    ],
    zob_zrno: [
      { mjesec: 'listopad', faza: 'sjetva', preporuka: 'NPK 7-20-30 220–320 kg/ha.' },
      { mjesec: 'veljača–ožujak', faza: 'busanje', preporuka: 'KAN 50–90 kg/ha.' },
    ],
    kukuruz_zrno: [
      { mjesec: 'ožujak–travanj', faza: 'osnovna', preporuka: 'NPK 7-20-30/8-24-24 250–400 kg/ha; dodatni K ako je nizak K.' },
      { mjesec: 'travanj', faza: 'sjetva', preporuka: 'Starter MAP/DAP 40–80 kg/ha u red (hladnija tla).' },
      { mjesec: 'svibanj–lipanj', faza: '6–8 listova', preporuka: 'Kultiviranje s bočnom gnojidbom: KAN/Urea/ASN 100–200 kg/ha.' },
    ],
    kukuruz_silaza: [
      { mjesec: 'ožujak–travanj', faza: 'osnovna', preporuka: 'NPK 7-20-30 300–450 kg/ha; silaža odnosi više K → pojačati K (MOP/SOP).' },
      { mjesec: 'svibanj', faza: 'prihrana', preporuka: 'Kultiviranje s gnojidbom: KAN/Urea/ASN 80–160 kg/ha.' },
    ],
    soja_zrno: [
      { mjesec: 'travanj–svibanj', faza: 'predsjetveno', preporuka: 'P i K u osnovnoj (NPK ili MAP/MOP); inokulacija sjemena.' },
      { mjesec: 'svibanj', faza: 'rani porast', preporuka: 'N-starter 15–30 kg/ha po potrebi; bez većih N doza.' },
    ],
    uljana_repica: [
      { mjesec: 'kolovoz', faza: 'sjetva', preporuka: 'NPK 7-20-30 250–350 kg/ha; izbjegavati kloride → preferirati SOP.' },
      { mjesec: 'veljača', faza: 'obnova vegetacije', preporuka: 'KAN/ASN 80–140 kg/ha; osigurati S (Amosulfan/ASN).' },
    ],
    suncokret: [
      { mjesec: 'ožujak', faza: 'osnovna', preporuka: 'NPK s naglaskom na P i K (po mogućnosti bez Cl⁻); 250–350 kg/ha.' },
      { mjesec: 'travanj', faza: 'sjetva', preporuka: 'Starter MAP/DAP 30–50 kg/ha po potrebi.' },
      { mjesec: 'svibanj', faza: 'kultiviranje', preporuka: 'Kultiviranje s gnojidbom (bočno) N 60–120 kg/ha po potrebi.' },
    ],
    secerna_repa_koren: [
      { mjesec: 'ožujak', faza: 'osnovna', preporuka: 'NPK 7-20-30 300–450 kg/ha; uravnotežiti P i K; S koristan.' },
      { mjesec: 'travanj–svibanj', faza: '6–8 listova', preporuka: 'Kultiviranje s gnojidbom: KAN/ASN 60–120 kg/ha.' },
    ],
    sirak_zrno: [
      { mjesec: 'travanj', faza: 'osnovna', preporuka: 'NPK 7-20-30 200–300 kg/ha.' },
      { mjesec: 'svibanj', faza: 'kultiviranje', preporuka: 'Bočna prihrana N 60–120 kg/ha.' },
    ],
    grasek_zrno: [
      { mjesec: 'veljača–ožujak', faza: 'sjetva', preporuka: 'P i K u osnovnoj; inokulacija; N-starter 15–20 kg/ha.' },
    ],
    bob_zrno: [
      { mjesec: 'veljača–ožujak', faza: 'sjetva', preporuka: 'P i K u osnovnoj (NPK ili MAP/MOP); inokulacija; minimalan N-starter.' },
    ],
    lucerna_sijeno: [
      { mjesec: 'kolovoz–rujan', faza: 'sjetva', preporuka: 'P i K (MAP/MOP ili SOP), kalcifikacija po pH; bez većeg N.' },
      { mjesec: 'nakon otkosa', faza: 'održavanje', preporuka: 'Dodaci K i S po uklanjanju; N samo u uspostavi.' },
    ],
  },
  srednja: {
    psenica_zrno: [
      { mjesec: 'listopad', faza: 'sjetva', preporuka: 'NPK 7-20-30 250–350 kg/ha.' },
      { mjesec: 'veljača–ožujak', faza: 'busanje', preporuka: 'KAN 70–120 kg/ha.' },
      { mjesec: 'travanj', faza: 'vlatanje', preporuka: 'Urea/ASN 60–100 kg/ha.' },
    ],
    jecam_zrno: [
      { mjesec: 'rujan–listopad', faza: 'sjetva', preporuka: 'NPK 7-20-30 220–320 kg/ha.' },
      { mjesec: 'veljača–ožujak', faza: 'busanje', preporuka: 'KAN 50–100 kg/ha.' },
    ],
    tritikale_zrno: [
      { mjesec: 'rujan–listopad', faza: 'sjetva', preporuka: 'NPK 7-20-30 230–330 kg/ha.' },
      { mjesec: 'veljača–ožujak', faza: 'busanje', preporuka: 'KAN 60–110 kg/ha.' },
    ],
    raz_zrno: [
      { mjesec: 'rujan–listopad', faza: 'sjetva', preporuka: 'NPK 7-20-30 220–300 kg/ha.' },
      { mjesec: 'veljača–ožujak', faza: 'busanje', preporuka: 'KAN 50–90 kg/ha.' },
    ],
    zob_zrno: [
      { mjesec: 'ožujak', faza: 'sjetva', preporuka: 'NPK 7-20-30 200–300 kg/ha.' },
      { mjesec: 'travanj', faza: 'busanje', preporuka: 'KAN 40–80 kg/ha.' },
    ],
    kukuruz_zrno: [
      { mjesec: 'travanj', faza: 'osnovna', preporuka: 'NPK 7-20-30 / 8-24-24 220–350 kg/ha.' },
      { mjesec: 'svibanj', faza: 'sjetva/starter', preporuka: 'MAP/DAP 30–60 kg/ha po potrebi.' },
      { mjesec: 'lipanj', faza: '6–8 listova', preporuka: 'Bočna prihrana KAN/Urea/ASN 80–160 kg/ha.' },
    ],
    kukuruz_silaza: [
      { mjesec: 'travanj', faza: 'osnovna', preporuka: 'NPK 7-20-30 280–420 kg/ha; pojačati K za silažu.' },
      { mjesec: 'lipanj', faza: 'prihrana', preporuka: 'Bočna prihrana KAN/Urea/ASN 80–150 kg/ha.' },
    ],
    soja_zrno: [
      { mjesec: 'travanj–svibanj', faza: 'predsjetveno', preporuka: 'P i K temeljno; inokulacija sjemena; bez većih N doza.' },
    ],
    uljana_repica: [
      { mjesec: 'kolovoz–rujan', faza: 'sjetva', preporuka: 'NPK 7-20-30 240–340 kg/ha; preferirati SOP.' },
      { mjesec: 'veljača–ožujak', faza: 'obnova vegetacije', preporuka: 'KAN/ASN 80–130 kg/ha uz dodatak sumpora.' },
    ],
    suncokret: [
      { mjesec: 'travanj', faza: 'osnovna', preporuka: 'NPK s naglaskom na P i K; 220–320 kg/ha.' },
      { mjesec: 'svibanj', faza: 'starter/porast', preporuka: 'MAP/DAP 20–40 kg/ha po potrebi; N umjereno.' },
    ],
    secerna_repa_koren: [
      { mjesec: 'ožujak–travanj', faza: 'osnovna', preporuka: 'NPK 7-20-30 280–420 kg/ha; S koristan.' },
      { mjesec: 'svibanj', faza: '6–8 listova', preporuka: 'Prihrana KAN/ASN 50–100 kg/ha.' },
    ],
    sirak_zrno: [
      { mjesec: 'svibanj', faza: 'osnovna', preporuka: 'NPK 7-20-30 180–280 kg/ha.' },
      { mjesec: 'lipanj', faza: 'kultiviranje', preporuka: 'Bočna prihrana N 60–100 kg/ha.' },
    ],
    grasek_zrno: [
      { mjesec: 'ožujak', faza: 'sjetva', preporuka: 'P i K u osnovnoj; inokulacija; N-starter 15–20 kg/ha.' },
    ],
    bob_zrno: [
      { mjesec: 'ožujak', faza: 'sjetva', preporuka: 'P i K u osnovnoj; inokulacija; minimalan N-starter.' },
    ],
    lucerna_sijeno: [
      { mjesec: 'kolovoz–rujan', faza: 'sjetva', preporuka: 'P i K temeljno (MAP/MOP ili SOP); kalcifikacija po potrebi; bez većeg N.' },
      { mjesec: 'nakon otkosa', faza: 'održavanje', preporuka: 'Dodaci K i S ovisno o otkosima.' },
    ],
  },
};

export const ALR_STORAGE_KEY = 'ab_alr_saved_calculations_v1';

export const DEFAULT_ALR_FORM = {
  regija: 'slavonija',
  katastarska: '',
  parcela: '',
  kultura: 'psenica_zrno',
  slama: 'zaorana',
  povrsina: '',
  prinos: '',
  tlo: 'srednje',
  ph: '',
  mode: 'klase',
  klasaP: 'C',
  klasaK: 'C',
  p_lab: '',
  k_lab: '',
  predusjev: 'ne-leguminoza',
  withS: true,
  nextCrop: 'psenica_zrno',
};

export function num(value) {
  if (value == null || value === '') return 0;
  const normalized = String(value).replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function round5(value) {
  return Math.round(value / 5) * 5;
}

export function niceCrop(key) {
  if (!key) return '—';
  return CROP_NAMES[key] || String(key).replace(/_/g, ' ').replace(/\b\w/g, (s) => s.toUpperCase());
}

export function regionLabel(key) {
  return REGION_NAMES[key] || key || '—';
}

export function mapClassFromLab(val, arr) {
  for (const item of arr) {
    if (val <= item.max) return item.cls;
  }
  return 'C';
}

export function starterN(crop, predusjev) {
  if (['soja_zrno', 'lucerna_sijeno', 'grasek_zrno', 'bob_zrno'].includes(crop)) return 20;
  if (predusjev === 'leguminoza') return -30;
  return 0;
}

export function calcTargets(input) {
  const base = REMOVAL[input.kultura];
  if (!base) return null;

  const pClass =
    input.mode === 'lab'
      ? mapClassFromLab(num(input.p_lab), CLASS_THRESHOLDS.P2O5)
      : input.klasaP;
  const kClass =
    input.mode === 'lab'
      ? mapClassFromLab(num(input.k_lab), CLASS_THRESHOLDS.K2O)
      : input.klasaK;

  const padj = CLASS_ADJ[pClass] || 0;
  const kadj = CLASS_ADJ[kClass] || 0;

  let P2O5 = base.P2O5 * num(input.prinos) * (1 + padj);
  let K2O = base.K2O * num(input.prinos) * (1 + kadj);
  let SO3 = input.withS ? (base.SO3 || 0) * num(input.prinos) : 0;
  let N = base.N * num(input.prinos) + starterN(input.kultura, input.predusjev);

  if (num(input.ph) && num(input.ph) < 5.8) {
    N *= 1.05;
  }

  if (['psenica_zrno', 'jecam_zrno', 'tritikale_zrno', 'raz_zrno', 'zob_zrno'].includes(input.kultura)) {
    if (input.slama === 'odnijeta') {
      const slama = REMOVAL.psenica_slama;
      N += slama.N * num(input.prinos);
      P2O5 += slama.P2O5 * (num(input.prinos) * 0.3);
      K2O += slama.K2O * num(input.prinos);
    } else {
      N -= 0.3 * (5 * num(input.prinos));
      K2O -= 0.6 * (10 * num(input.prinos));
    }
  }

  return {
    perHa: {
      N: Math.max(0, N),
      P2O5: Math.max(0, P2O5),
      K2O: Math.max(0, K2O),
      SO3: Math.max(0, SO3),
    },
    classes: { P: pClass, K: kClass },
  };
}

export function buildPlanVariant(target, options = {}, variant = 'A') {
  const plan = [];
  const add = (id, kg) => {
    if (kg <= 0) return;
    const product = PRODUCTS.find((item) => item.id === id);
    if (!product) return;
    plan.push({ id, name: product.name, rateKgHa: round5(kg) });
  };

  const remaining = {
    N: target.N,
    P2O5: target.P2O5,
    K2O: target.K2O,
    SO3: target.SO3 || 0,
  };

  const npkId = variant === 'A' ? 'npk72030' : 'y8_24_24';
  const pkP = variant === 'A' ? 'dap' : 'map';
  const kId = options.preferSOP || variant === 'B' ? 'sop' : 'mop';
  const nId = options.preferKAN || variant === 'B' ? 'kan27' : 'urea';

  if (remaining.P2O5 > 5 && remaining.K2O > 5) {
    const npk = PRODUCTS.find((item) => item.id === npkId);
    const needP = remaining.P2O5 / (npk.P2O5 / 100);
    const needK = remaining.K2O / (npk.K2O / 100);
    const kg = Math.max(0, Math.min(Math.min(needP, needK), 600));
    add(npk.id, kg);
    remaining.N = Math.max(0, remaining.N - (kg * npk.N) / 100);
    remaining.P2O5 = Math.max(0, remaining.P2O5 - (kg * npk.P2O5) / 100);
    remaining.K2O = Math.max(0, remaining.K2O - (kg * npk.K2O) / 100);
  }

  if (remaining.P2O5 > 3) {
    const p = PRODUCTS.find((item) => item.id === pkP);
    const kg = remaining.P2O5 / (p.P2O5 / 100);
    add(p.id, kg);
    remaining.N = Math.max(0, remaining.N - (kg * p.N) / 100);
    remaining.P2O5 = Math.max(0, remaining.P2O5 - (kg * p.P2O5) / 100);
  }

  if (remaining.K2O > 3) {
    const k = PRODUCTS.find((item) => item.id === kId);
    const kg = remaining.K2O / (k.K2O / 100);
    add(k.id, kg);
    remaining.SO3 = Math.max(0, remaining.SO3 - (kg * (k.SO3 || 0)) / 100);
    remaining.K2O = Math.max(0, remaining.K2O - (kg * k.K2O) / 100);
  }

  if (remaining.SO3 > 2) {
    const s = PRODUCTS.find((item) => item.id === 'asn26');
    const kg = remaining.SO3 / (s.SO3 / 100);
    add(s.id, kg);
    remaining.N = Math.max(0, remaining.N - (kg * s.N) / 100);
    remaining.SO3 = Math.max(0, remaining.SO3 - (kg * s.SO3) / 100);
  }

  if (remaining.N > 2) {
    const n = PRODUCTS.find((item) => item.id === nId);
    const kg = remaining.N / (n.N / 100);
    add(n.id, kg);
  }

  return plan;
}

export function calendarText(regionKey, cropKey) {
  const region = CALENDAR[String(regionKey || '').trim().toLowerCase()] || {};
  const items = region[String(cropKey || '').trim().toLowerCase()] || [];
  if (!items.length) return '';
  return items.map((item) => `- ${item.mjesec} (${item.faza}): ${item.preporuka}`).join('\n');
}

export function buildNarrative(result, input) {
  const base = REMOVAL[input.kultura] || { N: 0, P2O5: 0, K2O: 0, SO3: 0 };
  const baseP = (base.P2O5 || 0) * num(input.prinos);
  const baseK = (base.K2O || 0) * num(input.prinos);
  const pDelta = baseP * (CLASS_ADJ[result.classes.P] || 0);
  const kDelta = baseK * (CLASS_ADJ[result.classes.K] || 0);
  const bullets = [];

  if (pDelta > 0) bullets.push(`P₂O₅ povećan za približno ${pDelta.toFixed(1)} kg/ha zbog niske klase P (${result.classes.P}).`);
  else if (pDelta < 0) bullets.push(`P₂O₅ umanjen za približno ${Math.abs(pDelta).toFixed(1)} kg/ha zbog visoke klase P (${result.classes.P}).`);

  if (kDelta > 0) bullets.push(`K₂O povećan za približno ${kDelta.toFixed(1)} kg/ha zbog niske klase K (${result.classes.K}).`);
  else if (kDelta < 0) bullets.push(`K₂O umanjen za približno ${Math.abs(kDelta).toFixed(1)} kg/ha zbog visoke klase K (${result.classes.K}).`);

  if (['psenica_zrno', 'jecam_zrno', 'tritikale_zrno', 'raz_zrno', 'zob_zrno'].includes(input.kultura)) {
    if (input.slama === 'odnijeta') {
      bullets.push(
        `Zbog odnošenja slame povećano N za ${(REMOVAL.psenica_slama.N * num(input.prinos)).toFixed(1)} kg/ha i K₂O za ${(REMOVAL.psenica_slama.K2O * num(input.prinos)).toFixed(1)} kg/ha.`
      );
    } else {
      bullets.push(
        `Zbog vraćene slame umanjeno N za ${(0.3 * (5 * num(input.prinos))).toFixed(1)} kg/ha i K₂O za ${(0.6 * (10 * num(input.prinos))).toFixed(1)} kg/ha.`
      );
    }
  }

  if (input.predusjev === 'leguminoza') {
    bullets.push('Umanjenje N za ~30 kg/ha zbog leguminoznog predusjeva.');
  }

  if (num(input.ph) && num(input.ph) < 5.8) {
    let baseN = (base.N || 0) * num(input.prinos) + starterN(input.kultura, input.predusjev);
    if (['psenica_zrno', 'jecam_zrno', 'tritikale_zrno', 'raz_zrno', 'zob_zrno'].includes(input.kultura)) {
      if (input.slama === 'odnijeta') baseN += REMOVAL.psenica_slama.N * num(input.prinos);
      else baseN -= 0.3 * (5 * num(input.prinos));
    }
    bullets.push(`Dodano oko ${(baseN * 0.05).toFixed(1)} kg/ha N zbog kiselijeg tla (pH ${input.ph}).`);
  }

  return {
    classExpl:
      'Tumačenje klasa (AL, mg/100 g tla): P₂O₅: A≤5, B≤10, C≤20, D≤35, E>35; K₂O: A≤10, B≤20, C≤30, D≤45, E>45. Korekcije: A +30%, B +15%, C 0%, D −20%, E −40%.',
    bullets,
  };
}

export function calculateALR(form) {
  const input = {
    ...DEFAULT_ALR_FORM,
    ...form,
    povrsina: String(form.povrsina ?? ''),
    prinos: String(form.prinos ?? ''),
    ph: String(form.ph ?? ''),
    p_lab: String(form.p_lab ?? ''),
    k_lab: String(form.k_lab ?? ''),
  };

  if (input.mode === 'lab' && (input.p_lab === '' || input.k_lab === '')) {
    return { error: 'Unesite P i K (mg/100 g) ili prebacite na A–E klase.' };
  }
  if (num(input.prinos) <= 0) return { error: 'Unesite očekivani prinos (t/ha).' };
  if (num(input.povrsina) <= 0) return { error: 'Unesite površinu (ha).' };

  const targets = calcTargets(input);
  if (!targets) return { error: 'Nevažeći odabir kulture.' };

  const preferSOP = ['uljana_repica', 'suncokret'].includes(input.nextCrop);
  const preferKAN = num(input.ph) > 0 && num(input.ph) < 5.5;
  const perHa = targets.perHa;
  const area = Math.max(0, num(input.povrsina));

  const result = {
    area,
    perHa,
    total: {
      N: perHa.N * area,
      P2O5: perHa.P2O5 * area,
      K2O: perHa.K2O * area,
      SO3: perHa.SO3 * area,
    },
    classes: targets.classes,
    planA: buildPlanVariant(perHa, { preferSOP, preferKAN }, 'A'),
    planB: buildPlanVariant(perHa, { preferSOP, preferKAN }, 'B'),
  };

  const notes = {
    N:
      (input.predusjev === 'leguminoza' ? 'Umanjenje N zbog leguminoznog predusjeva (~30 kg/ha) — ' : '') +
      'Nitratna direktiva: max 170 kg N/ha',
  };

  return {
    input,
    result,
    notes,
    calendars: {
      current: calendarText(input.regija, input.kultura),
      next: calendarText(input.regija, input.nextCrop),
    },
    narrative: buildNarrative(result, input),
  };
}

export function formatNutrientRows(calculation) {
  const { result, notes } = calculation;
  const rows = [
    { nutrient: 'N', perHa: result.perHa.N, total: result.total.N, note: notes.N || '—' },
    { nutrient: 'P₂O₅', perHa: result.perHa.P2O5, total: result.total.P2O5, note: `Klasa P: ${result.classes.P}` },
    { nutrient: 'K₂O', perHa: result.perHa.K2O, total: result.total.K2O, note: `Klasa K: ${result.classes.K}` },
  ];
  if (result.perHa.SO3 > 0 || result.total.SO3 > 0) {
    rows.push({ nutrient: 'SO₃', perHa: result.perHa.SO3, total: result.total.SO3, note: 'Sumpor' });
  }
  return rows;
}

export function planWithTotals(plan, area) {
  return (plan || []).map((item) => ({
    ...item,
    totalKg: Math.round((item.rateKgHa || 0) * (area || 0)),
  }));
}

export function makeSavedCalculation(calculation) {
  const now = new Date();
  return {
    id: `alr_${now.getTime()}`,
    createdAt: now.toISOString(),
    title: `${niceCrop(calculation.input.kultura)} • ${regionLabel(calculation.input.regija)}`,
    calculation,
  };
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildAlrPdfHtml(savedItem) {
  const { calculation } = savedItem;
  const { input, result, calendars, narrative } = calculation;
  const nutrientRows = formatNutrientRows(calculation)
    .map(
      (row) => `
        <tr>
          <td>${esc(row.nutrient)}</td>
          <td>${Number(row.perHa || 0).toFixed(1)}</td>
          <td>${Number(row.total || 0).toFixed(1)}</td>
          <td>${row.note}</td>
        </tr>`
    )
    .join('');

  const renderPlan = (items) =>
    planWithTotals(items, result.area)
      .map(
        (item) => `
          <tr>
            <td>${esc(item.name)}</td>
            <td>${Number(item.rateKgHa || 0)}</td>
            <td>${Number(item.totalKg || 0)}</td>
          </tr>`
      )
      .join('') || '<tr><td colspan="3">—</td></tr>';

  const arkodLabel = /^\d{6,}$/.test(String(input.parcela || '').trim()) ? 'ARKOD' : 'Katastarska čestica';
  const classText = {
    A: 'Klasa A – vrlo niska opskrbljenost, potrebne visoke doze gnojiva za podizanje plodnosti.',
    B: 'Klasa B – niska opskrbljenost, preporučene povećane doze gnojiva.',
    C: 'Klasa C – srednja opskrbljenost, gnojidba prema potrebama kulture.',
    D: 'Klasa D – dobra opskrbljenost, moguća redukcija gnojidbe.',
    E: 'Klasa E – vrlo dobra opskrbljenost, gnojidba minimalna ili nije potrebna.',
  };

  const bullets = (narrative.bullets || []).map((item) => `<li>${esc(item)}</li>`).join('') || '<li>Nisu potrebne značajne korekcije.</li>';

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>ALR_preporuka</title>
      <style>
        body { font-family: Arial, Helvetica, sans-serif; font-size: 12pt; margin: 10mm; color: #111827; }
        h1,h2,h3 { margin: 1em 0 .4em; }
        table { border-collapse: collapse; width: 100%; margin: .4em 0; }
        th,td { border: 1px solid #999; padding: 6px; vertical-align: top; }
        .sec { margin-bottom: 18px; }
        .muted { color: #4b5563; }
        .footer { font-size: 9pt; color: #555; border-top: 1px solid #aaa; padding-top: 8px; margin-top: 24px; text-align: justify; }
        pre { white-space: pre-wrap; font-family: Arial, Helvetica, sans-serif; }
        @page { size: A4; margin: 10mm; }
      </style>
    </head>
    <body>
      <h1>ALR preporuka gnojidbe</h1>
      <p><b>Datum:</b> ${esc(new Date(savedItem.createdAt).toLocaleDateString('hr-HR'))}</p>

      <div class="sec"><b>Regija:</b> ${esc(regionLabel(input.regija))}</div>
      <div class="sec"><b>Katastarska općina:</b> ${esc(input.katastarska || '—')}</div>
      <div class="sec"><b>${arkodLabel}:</b> ${esc(input.parcela || '—')}</div>
      <div class="sec"><b>Površina:</b> ${esc(result.area)} ha</div>
      <div class="sec"><b>Kultura:</b> ${esc(niceCrop(input.kultura))}</div>
      <div class="sec"><b>Prinos:</b> ${esc(input.prinos)} t/ha</div>
      <div class="sec"><b>pH (KCl):</b> ${esc(input.ph || '—')}</div>
      <div class="sec"><b>Način P/K:</b> ${input.mode === 'lab' ? 'Laboratorij' : 'Klase A–E'}</div>
      <div class="sec"><b>Klase P/K:</b> ${esc(result.classes.P)} / ${esc(result.classes.K)}</div>
      <div class="sec"><b>Predusjev:</b> ${esc(input.predusjev)} (${input.predusjev === 'leguminoza' ? 'umanjenje N ~30 kg/ha' : 'bez umanjenja'})</div>
      <div class="sec"><b>Slama:</b> ${esc(input.slama)}</div>

      <h3>Ciljevi hraniva</h3>
      <table>
        <tr><th>Hranivo</th><th>kg/ha</th><th>Ukupno (kg)</th><th>Napomena</th></tr>
        ${nutrientRows}
      </table>

      <h3>Prijedlog gnojidbe — Plan A</h3>
      <table>
        <tr><th>Proizvod</th><th>Doza (kg/ha)</th><th>Ukupno (kg)</th></tr>
        ${renderPlan(result.planA)}
      </table>

      <h3>Alternativa — Plan B</h3>
      <table>
        <tr><th>Proizvod</th><th>Doza (kg/ha)</th><th>Ukupno (kg)</th></tr>
        ${renderPlan(result.planB)}
      </table>

      <h3>Plan gnojidbe po fazama — ${esc(niceCrop(input.kultura))}</h3>
      <pre>${esc(calendars.current || '—')}</pre>

      <h3>Sljedeća kultura — ${esc(niceCrop(input.nextCrop))}</h3>
      <pre>${esc(calendars.next || '—')}</pre>

      <h3>Obrazloženje i prilagodbe prema analizi tla</h3>
      <p>${esc(narrative.classExpl)}</p>
      <p>${esc(classText[result.classes.P] || '')}</p>
      <p>${esc(classText[result.classes.K] || '')}</p>
      <ul>${bullets}</ul>

      <h3>Nitratna direktiva — sažetak</h3>
      <ul>
        <li>Maksimalno <b>170 kg N/ha/god</b> iz <u>organskih gnojiva</u>.</li>
        <li>Ne gnojiti na smrznutom, snijegom prekrivenom ili zasićenom tlu; poštovati zabranjene periode i zaštitne pojaseve uz vodotoke.</li>
      </ul>

      <div class="footer">
        <b>Napomena:</b> Korisnik je odgovoran za točnost unesenih podataka iz analize tla. Prikazane preporuke su orijentacijske i ne uključuju cijene, posebne pravne limite niti sve specifične agrotehničke uvjete.
      </div>
    </body>
  </html>`;
}
