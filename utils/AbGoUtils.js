// AbGoUtils.js - proširena hijerarhijska baza za ab GO
// Djelatnost -> Skupina -> Kultura -> Radnja
// Zadržana je i legacy kompatibilnost za postojeći ekran.

export const AB_GO_COMMON_CATEGORY = {
  key: 'administracija',
  label: 'Opći poslovi',
  emoji: '🧰',
};

export const AB_GO_COMMON_SUBCATEGORIES = [
  { key: 'planiranje', label: '🗓️ Planiranje', emoji: '🗓️' },
  { key: 'dokumentacija_izrada', label: '🗂️ Izrada dokumentacije', emoji: '🗂️' },
  { key: 'evidencija', label: '🧾 Evidencija', emoji: '🧾' },
  { key: 'sastanak', label: '🤝 Sastanak', emoji: '🤝' },
  { key: 'servis', label: '🔧 Servis', emoji: '🔧' },
  { key: 'nabava', label: '🛒 Nabava', emoji: '🛒' },
  { key: 'isporuka', label: '📦 Isporuka', emoji: '📦' },
  { key: 'radnici', label: '👷 Radnici', emoji: '👷' },
  { key: 'teren', label: '📍 Teren', emoji: '📍' },
  { key: 'kontrola', label: '🔎 Kontrola', emoji: '🔎' },
];

const ACTION_LIBRARY = {
  sjetva: { key: 'sjetva', label: 'Sjetva', emoji: '🌱' },
  sadnja: { key: 'sadnja', label: 'Sadnja', emoji: '🪴' },
  presadivanje: { key: 'presadivanje', label: 'Presađivanje', emoji: '🧺' },
  obrada_tla: { key: 'obrada_tla', label: 'Obrada tla', emoji: '🚜' },
  predsjetvena_priprema: { key: 'predsjetvena_priprema', label: 'Predsjetvena priprema', emoji: '🪓' },
  gnojidba: { key: 'gnojidba', label: 'Gnojidba', emoji: '🌿' },
  prihrana: { key: 'prihrana', label: 'Prihrana', emoji: '🌿' },
  zastita: { key: 'zastita', label: 'Zaštita', emoji: '🧪' },
  navodnjavanje: { key: 'navodnjavanje', label: 'Navodnjavanje', emoji: '💧' },
  zalijevanje: { key: 'zalijevanje', label: 'Zalijevanje', emoji: '💧' },
  okopavanje: { key: 'okopavanje', label: 'Okopavanje', emoji: '🪓' },
  berba: { key: 'berba', label: 'Berba', emoji: '🧺' },
  zetva: { key: 'zetva', label: 'Žetva', emoji: '🌽' },
  kosnja: { key: 'kosnja', label: 'Košnja', emoji: '🌿' },
  prijevoz: { key: 'prijevoz', label: 'Prijevoz', emoji: '🚚' },
  transport: { key: 'transport', label: 'Transport', emoji: '🚚' },
  skladistenje: { key: 'skladistenje', label: 'Skladištenje', emoji: '🏚️' },
  pakiranje: { key: 'pakiranje', label: 'Pakiranje', emoji: '📦' },
  sortiranje: { key: 'sortiranje', label: 'Sortiranje', emoji: '🗃️' },
  rezidba: { key: 'rezidba', label: 'Rezidba', emoji: '✂️' },
  zelena_rezidba: { key: 'zelena_rezidba', label: 'Zelena rezidba', emoji: '🌿' },
  vezanje: { key: 'vezanje', label: 'Vezanje', emoji: '🪢' },
  kontrola: { key: 'kontrola', label: 'Kontrola', emoji: '🔎' },
  evidencija: { key: 'evidencija', label: 'Evidencija', emoji: '🗂️' },
  certifikacija: { key: 'certifikacija', label: 'Certifikacija', emoji: '✅' },
  inspekcija: { key: 'inspekcija', label: 'Inspekcija', emoji: '🔍' },
  planiranje: { key: 'planiranje', label: 'Planiranje', emoji: '🗓️' },
  plodored: { key: 'plodored', label: 'Plodored', emoji: '🔄' },
  kompost: { key: 'kompost', label: 'Kompost / gnojivo', emoji: '🌱' },
  prerada: { key: 'prerada', label: 'Prerada', emoji: '🏭' },
  proizvodnja: { key: 'proizvodnja', label: 'Proizvodnja', emoji: '⚙️' },
  obrada: { key: 'obrada', label: 'Obrada', emoji: '🔧' },
  deklariranje: { key: 'deklariranje', label: 'Deklariranje', emoji: '🏷️' },
  kontrola_kvalitete: { key: 'kontrola_kvalitete', label: 'Kontrola kvalitete', emoji: '🔎' },
  distribucija: { key: 'distribucija', label: 'Distribucija', emoji: '🚚' },
  prodaja: { key: 'prodaja', label: 'Prodaja', emoji: '💶' },
  dostava: { key: 'dostava', label: 'Dostava', emoji: '🚚' },
  nabava: { key: 'nabava', label: 'Nabava', emoji: '🛒' },
  ponude: { key: 'ponude', label: 'Ponude', emoji: '📄' },
  servis: { key: 'servis', label: 'Servis', emoji: '🔧' },
  montaza: { key: 'montaza', label: 'Montaža', emoji: '🧰' },
  teren: { key: 'teren', label: 'Terenski obilazak', emoji: '📍' },
  klijent: { key: 'klijent', label: 'Sastanak s klijentom', emoji: '🤝' },
  isporuka: { key: 'isporuka', label: 'Isporuka', emoji: '📦' },
  dogovor: { key: 'dogovor', label: 'Dogovor', emoji: '🤝' },
  preuzimanje: { key: 'preuzimanje', label: 'Preuzimanje robe', emoji: '🚚' },
  obracun: { key: 'obracun', label: 'Obračun', emoji: '🧾' },
  radnici: { key: 'radnici', label: 'Radnici', emoji: '👷' },
  savjetovanje: { key: 'savjetovanje', label: 'Savjetovanje', emoji: '🧠' },
  dokumentacija_izrada: { key: 'dokumentacija_izrada', label: 'Izrada dokumentacije', emoji: '🗂️' },
  plan: { key: 'plan', label: 'Izrada plana', emoji: '🗓️' },
  sastanak: { key: 'sastanak', label: 'Sastanak', emoji: '🤝' },
  predavanje: { key: 'predavanje', label: 'Predavanje', emoji: '🎤' },
  radionica: { key: 'radionica', label: 'Radionica', emoji: '🛠️' },
  materijali: { key: 'materijali', label: 'Priprema materijala', emoji: '📚' },
  online: { key: 'online', label: 'Online edukacija', emoji: '💻' },
  fermentacija: { key: 'fermentacija', label: 'Fermentacija', emoji: '🫧' },
  punjenje: { key: 'punjenje', label: 'Punjenje', emoji: '🍾' },
  susenje: { key: 'susenje', label: 'Sušenje', emoji: '☀️' },
  dorada: { key: 'dorada', label: 'Dorada', emoji: '⚙️' },
  njega: { key: 'njega', label: 'Njega', emoji: '🌿' },
  hranidba: { key: 'hranidba', label: 'Hranidba', emoji: '🌾' },
  muznja: { key: 'muznja', label: 'Mužnja', emoji: '🥛' },
  ciscenje: { key: 'ciscenje', label: 'Čišćenje', emoji: '🧹' },
  veterinar: { key: 'veterinar', label: 'Veterinar', emoji: '🩺' },
  premjestanje: { key: 'premjestanje', label: 'Premještanje', emoji: '🚜' },
  pripust: { key: 'pripust', label: 'Pripust / reprodukcija', emoji: '🐄' },
  pregled_kosnica: { key: 'pregled_kosnica', label: 'Pregled košnica', emoji: '🔎' },
  selidba: { key: 'selidba', label: 'Selidba', emoji: '🚚' },
  vrcanje: { key: 'vrcanje', label: 'Vrcanje', emoji: '🍯' },
  rezanje: { key: 'rezanje', label: 'Rezanje', emoji: '✂️' },
  custom_note: { key: 'custom_note', label: '', emoji: '➕🧾⚙️' },
  ostalo: { key: 'ostalo', label: 'Ostalo', emoji: '➕' },
};

function pickActions(keys) {
  const items = keys.map((key) => ACTION_LIBRARY[key]).filter(Boolean);
  if (!items.some((item) => item.key === 'custom_note') && ACTION_LIBRARY.custom_note) {
    items.push(ACTION_LIBRARY.custom_note);
  }
  return items;
}

function crop(key, label, emoji, actionKeys) {
  return { key, label, emoji, actions: pickActions(actionKeys) };
}

function group(key, label, emoji, crops = []) {
  return { key, label, emoji, crops };
}

export const AB_GO_HIERARCHY = {
  ratarstvo: {
    key: 'ratarstvo',
    label: 'Ratarstvo',
    emoji: '🌾',
    profileMatches: ['ratarstvo'],
    groups: [
      group('zitarice', 'Žitarice', '🌾', [
        crop('psenica', 'Pšenica', '🌾', ['sjetva', 'predsjetvena_priprema', 'gnojidba', 'prihrana', 'zastita', 'zetva', 'prijevoz', 'skladistenje']),
        crop('jecam', 'Ječam', '🌾', ['sjetva', 'gnojidba', 'prihrana', 'zastita', 'zetva', 'skladistenje']),
        crop('kukuruz', 'Kukuruz', '🌽', ['sjetva', 'predsjetvena_priprema', 'gnojidba', 'prihrana', 'zastita', 'zetva', 'prijevoz', 'skladistenje']),
        crop('zob', 'Zob', '🌾', ['sjetva', 'gnojidba', 'zastita', 'zetva', 'skladistenje']),
        crop('raz', 'Raž', '🌾', ['sjetva', 'gnojidba', 'zastita', 'zetva', 'skladistenje']),
        crop('tritikale', 'Tritikale', '🌾', ['sjetva', 'gnojidba', 'zastita', 'zetva', 'skladistenje']),
        crop('sirak_zrno', 'Sirak zrno', '🌾', ['sjetva', 'gnojidba', 'zastita', 'zetva', 'skladistenje']),
      ]),
      group('uljarice', 'Uljarice', '🌻', [
        crop('suncokret', 'Suncokret', '🌻', ['sjetva', 'gnojidba', 'zastita', 'zetva', 'skladistenje']),
        crop('uljana_repica', 'Uljana repica', '🌼', ['sjetva', 'gnojidba', 'prihrana', 'zastita', 'zetva', 'skladistenje']),
        crop('uljana_buca', 'Uljana buča', '🎃', ['sjetva', 'gnojidba', 'zastita', 'berba', 'skladistenje']),
      ]),
      group('leguminoze', 'Leguminoze', '🫘', [
        crop('soja', 'Soja', '🫘', ['sjetva', 'gnojidba', 'zastita', 'zetva', 'skladistenje']),
        crop('grasak', 'Grašak', '🟢', ['sjetva', 'gnojidba', 'zastita', 'berba', 'pakiranje']),
        crop('bob', 'Bob', '🫘', ['sjetva', 'gnojidba', 'zastita', 'berba', 'pakiranje']),
        crop('slanutak', 'Slanutak', '🫘', ['sjetva', 'gnojidba', 'zastita', 'berba', 'pakiranje']),
        crop('leca', 'Leća', '🫘', ['sjetva', 'gnojidba', 'zastita', 'berba', 'pakiranje']),
        crop('grah_poljski', 'Poljski grah', '🫘', ['sjetva', 'gnojidba', 'zastita', 'berba', 'skladistenje']),
        crop('lupina', 'Lupina', '🫘', ['sjetva', 'gnojidba', 'zastita', 'berba', 'skladistenje']),
        crop('lucerna', 'Lucerna', '🌿', ['sjetva', 'gnojidba', 'kosnja', 'prijevoz', 'skladistenje']),
      ]),
      group('krmno_bilje', 'Krmno bilje', '🌿', [
        crop('djetelina', 'Djetelina', '🍀', ['sjetva', 'gnojidba', 'kosnja', 'skladistenje']),
        crop('travna_smjesa', 'Travna smjesa', '🌱', ['sjetva', 'kosnja', 'skladistenje']),
        crop('sirak_silaza', 'Sirak za silažu', '🌾', ['sjetva', 'gnojidba', 'kosnja', 'skladistenje']),
        crop('kukuruz_silaza', 'Kukuruz za silažu', '🌽', ['sjetva', 'gnojidba', 'prihrana', 'zetva', 'skladistenje']),
      ]),
      group('industrijsko_bilje', 'Industrijsko bilje', '🏭', [
        crop('duhan', 'Duhan', '🚬', ['sadnja', 'prihrana', 'zastita', 'berba', 'susenje']),
        crop('secerna_repa', 'Šećerna repa', '🍠', ['sjetva', 'gnojidba', 'zastita', 'berba', 'prijevoz']),
        crop('konoplja', 'Industrijska konoplja', '🌿', ['sjetva', 'gnojidba', 'zastita', 'berba', 'prerada']),
      ]),
    ],
  },

  povrtlarstvo: {
    key: 'povrtlarstvo',
    label: 'Povrtlarstvo',
    emoji: '🥬',
    profileMatches: ['povrtlarstvo', 'povrćarstvo', 'povrcarstvo'],
    groups: [
      group('plodovito', 'Plodovito', '🍅', [
        crop('rajcica', 'Rajčica', '🍅', ['sadnja', 'presadivanje', 'navodnjavanje', 'prihrana', 'zastita', 'berba', 'pakiranje']),
        crop('paprika', 'Paprika', '🫑', ['sadnja', 'navodnjavanje', 'prihrana', 'zastita', 'berba', 'pakiranje']),
        crop('krastavac', 'Krastavac', '🥒', ['sadnja', 'navodnjavanje', 'zastita', 'berba', 'pakiranje']),
        crop('patlidzan', 'Patlidžan', '🍆', ['sadnja', 'navodnjavanje', 'zastita', 'berba', 'pakiranje']),
        crop('tikvica', 'Tikvica', '🥒', ['sadnja', 'navodnjavanje', 'zastita', 'berba', 'pakiranje']),
        crop('lubenica', 'Lubenica', '🍉', ['sadnja', 'navodnjavanje', 'zastita', 'berba', 'pakiranje']),
        crop('dinja', 'Dinja', '🍈', ['sadnja', 'navodnjavanje', 'zastita', 'berba', 'pakiranje']),
      ]),
      group('lisnato', 'Lisnato', '🥬', [
        crop('salata', 'Salata', '🥬', ['sjetva', 'sadnja', 'navodnjavanje', 'zastita', 'berba', 'pakiranje']),
        crop('blitva', 'Blitva', '🥬', ['sjetva', 'navodnjavanje', 'berba', 'pakiranje']),
        crop('spinat', 'Špinat', '🥬', ['sjetva', 'navodnjavanje', 'berba', 'pakiranje']),
        crop('rikola', 'Rikola', '🥬', ['sjetva', 'navodnjavanje', 'berba', 'pakiranje']),
      ]),
      group('korjenasto', 'Korjenasto', '🥕', [
        crop('mrkva', 'Mrkva', '🥕', ['sjetva', 'navodnjavanje', 'zastita', 'berba', 'pakiranje', 'skladistenje']),
        crop('cikla', 'Cikla', '🟣', ['sjetva', 'navodnjavanje', 'berba', 'pakiranje', 'skladistenje']),
        crop('persin_korijen', 'Peršin korijen', '🌿', ['sjetva', 'navodnjavanje', 'berba', 'pakiranje']),
        crop('pastrnjak', 'Pastrnjak', '🥕', ['sjetva', 'navodnjavanje', 'berba', 'pakiranje']),
        crop('rotkvica', 'Rotkvica', '🔴', ['sjetva', 'navodnjavanje', 'berba', 'pakiranje']),
      ]),
      group('lukovicasto', 'Lukovičasto', '🧅', [
        crop('luk', 'Luk', '🧅', ['sjetva', 'sadnja', 'navodnjavanje', 'zastita', 'berba', 'skladistenje']),
        crop('cesnjak', 'Češnjak', '🧄', ['sadnja', 'zastita', 'berba', 'skladistenje']),
        crop('poriluk', 'Poriluk', '🧅', ['sadnja', 'navodnjavanje', 'berba', 'pakiranje']),
      ]),
      group('kupusnjace', 'Kupusnjače', '🥦', [
        crop('kupus', 'Kupus', '🥬', ['sadnja', 'prihrana', 'zastita', 'berba', 'skladistenje']),
        crop('kelj', 'Kelj', '🥬', ['sadnja', 'prihrana', 'zastita', 'berba']),
        crop('cvjetaca', 'Cvjetača', '🥦', ['sadnja', 'prihrana', 'zastita', 'berba']),
        crop('brokula', 'Brokula', '🥦', ['sadnja', 'prihrana', 'zastita', 'berba']),
        crop('prokulica', 'Prokulica', '🥬', ['sadnja', 'prihrana', 'zastita', 'berba']),
      ]),
      group('mahunasto', 'Mahunasto povrće', '🫘', [
        crop('mahune', 'Mahune', '🫘', ['sjetva', 'navodnjavanje', 'zastita', 'berba', 'pakiranje']),
        crop('grah', 'Grah', '🫘', ['sjetva', 'navodnjavanje', 'zastita', 'berba', 'skladistenje']),
        crop('grasek_povrce', 'Grašak', '🟢', ['sjetva', 'navodnjavanje', 'zastita', 'berba', 'pakiranje']),
      ]),
      group('zacinsko', 'Začinsko bilje', '🌿', [
        crop('persin_list', 'Peršin list', '🌿', ['sjetva', 'zalijevanje', 'berba', 'pakiranje']),
        crop('bosiljak', 'Bosiljak', '🌿', ['sadnja', 'zalijevanje', 'berba', 'pakiranje']),
        crop('kopar', 'Kopar', '🌿', ['sjetva', 'zalijevanje', 'berba', 'pakiranje']),
      ]),
    ],
  },

  vocarstvo: {
    key: 'vocarstvo',
    label: 'Voćarstvo',
    emoji: '🍎',
    profileMatches: ['voćarstvo', 'vocarstvo'],
    groups: [
      group('jabucasto', 'Jabučasto voće', '🍎', [
        crop('jabuka', 'Jabuka', '🍎', ['rezidba', 'zastita', 'prihrana', 'navodnjavanje', 'kontrola', 'berba', 'sortiranje', 'skladistenje']),
        crop('kruska', 'Kruška', '🍐', ['rezidba', 'zastita', 'prihrana', 'berba', 'sortiranje', 'skladistenje']),
        crop('dunja', 'Dunja', '🍐', ['rezidba', 'zastita', 'berba', 'sortiranje']),
      ]),
      group('kosticavo', 'Koštičavo voće', '🍑', [
        crop('sljiva', 'Šljiva', '🍑', ['rezidba', 'zastita', 'prihrana', 'berba', 'sortiranje']),
        crop('tresnja', 'Trešnja', '🍒', ['rezidba', 'zastita', 'berba', 'sortiranje']),
        crop('visnja', 'Višnja', '🍒', ['rezidba', 'zastita', 'berba', 'sortiranje']),
        crop('breskva', 'Breskva', '🍑', ['rezidba', 'zastita', 'berba', 'sortiranje']),
        crop('nektarina', 'Nektarina', '🍑', ['rezidba', 'zastita', 'berba', 'sortiranje']),
        crop('marelica', 'Marelica', '🍑', ['rezidba', 'zastita', 'berba', 'sortiranje']),
      ]),
      group('bobicasto', 'Bobičasto voće', '🫐', [
        crop('jagoda', 'Jagoda', '🍓', ['sadnja', 'navodnjavanje', 'zastita', 'berba', 'pakiranje']),
        crop('borovnica', 'Borovnica', '🫐', ['rezidba', 'navodnjavanje', 'zastita', 'berba', 'pakiranje']),
        crop('malina', 'Malina', '🍇', ['rezidba', 'navodnjavanje', 'zastita', 'berba', 'pakiranje']),
        crop('kupina', 'Kupina', '🫐', ['rezidba', 'navodnjavanje', 'zastita', 'berba', 'pakiranje']),
        crop('ribiz', 'Ribiz', '🫐', ['rezidba', 'zastita', 'berba', 'pakiranje']),
        crop('aronija', 'Aronija', '🫐', ['rezidba', 'zastita', 'berba', 'pakiranje']),
      ]),
      group('orasasto', 'Orašasto voće', '🌰', [
        crop('orah', 'Orah', '🌰', ['rezidba', 'zastita', 'berba', 'skladistenje']),
        crop('lijeska', 'Lijeska', '🌰', ['rezidba', 'zastita', 'berba', 'skladistenje']),
        crop('badem', 'Badem', '🌰', ['rezidba', 'zastita', 'berba', 'skladistenje']),
        crop('pitomi_kesten', 'Pitomi kesten', '🌰', ['rezidba', 'zastita', 'berba', 'skladistenje']),
      ]),
    ],
  },

  vinogradarstvo: {
    key: 'vinogradarstvo',
    label: 'Vinogradarstvo',
    emoji: '🍇',
    profileMatches: ['vinogradarstvo'],
    groups: [
      group('stolne_sorte', 'Stolne sorte', '🍇', [
        crop('stolna_loza', 'Stolna loza', '🍇', ['rezidba', 'vezanje', 'zelena_rezidba', 'zastita', 'berba', 'pakiranje']),
      ]),
      group('vinske_sorte', 'Vinske sorte', '🍷', [
        crop('bijele_sorte', 'Bijele sorte', '🍾', ['rezidba', 'vezanje', 'zelena_rezidba', 'zastita', 'berba', 'transport']),
        crop('crne_sorte', 'Crne sorte', '🍷', ['rezidba', 'vezanje', 'zelena_rezidba', 'zastita', 'berba', 'transport']),
      ]),
      group('podrum_i_prerada', 'Podrum i prerada', '🏭', [
        crop('vino', 'Vino', '🍷', ['prerada', 'kontrola_kvalitete', 'punjenje', 'skladistenje']),
        crop('must', 'Mošt', '🍷', ['prerada', 'kontrola_kvalitete', 'skladistenje']),
      ]),
    ],
  },

  maslinarstvo: {
    key: 'maslinarstvo',
    label: 'Maslinarstvo',
    emoji: '🫒',
    profileMatches: ['maslinarstvo'],
    groups: [
      group('nasad', 'Nasad', '🫒', [
        crop('maslina', 'Maslina', '🫒', ['rezidba', 'zastita', 'navodnjavanje', 'prihrana', 'berba', 'prerada']),
      ]),
      group('prerada', 'Prerada', '🏭', [
        crop('maslinovo_ulje', 'Maslinovo ulje', '🫒', ['prerada', 'kontrola_kvalitete', 'punjenje', 'skladistenje']),
      ]),
    ],
  },

  pcelarstvo: {
    key: 'pcelarstvo',
    label: 'Pčelarstvo',
    emoji: '🐝',
    profileMatches: ['pčelarstvo', 'pcelarstvo'],
    groups: [
      group('kosnice', 'Košnice', '🐝', [
        crop('pcelinje_zajednice', 'Pčelinje zajednice', '🐝', ['pregled_kosnica', 'prihrana', 'zastita', 'evidencija', 'selidba']),
      ]),
      group('med_i_proizvodi', 'Med i proizvodi', '🍯', [
        crop('med', 'Med', '🍯', ['vrcanje', 'pakiranje', 'skladistenje', 'prodaja']),
        crop('propolis', 'Propolis', '🍯', ['prerada', 'pakiranje', 'prodaja']),
        crop('pelud', 'Pelud', '🐝', ['prerada', 'pakiranje', 'prodaja']),
      ]),
    ],
  },

  stocarstvo: {
    key: 'stocarstvo',
    label: 'Stočarstvo',
    emoji: '🐄',
    profileMatches: ['stočarstvo', 'stocarstvo'],
    groups: [
      group('govedarstvo', 'Govedarstvo', '🐄', [
        crop('krave_muzne', 'Krave muzne', '🐄', ['hranidba', 'muznja', 'ciscenje', 'veterinar', 'evidencija']),
        crop('telad', 'Telad', '🐮', ['hranidba', 'veterinar', 'premjestanje', 'evidencija']),
        crop('junad', 'Junad', '🐂', ['hranidba', 'veterinar', 'evidencija']),
        crop('tovna_goveda', 'Tovna goveda', '🐂', ['hranidba', 'veterinar', 'evidencija']),
      ]),
      group('svinjogojstvo', 'Svinjogojstvo', '🐖', [
        crop('krmace', 'Krmače', '🐖', ['hranidba', 'ciscenje', 'veterinar', 'pripust', 'evidencija']),
        crop('tovljenici', 'Tovljenici', '🐖', ['hranidba', 'ciscenje', 'veterinar', 'evidencija']),
        crop('prasci', 'Prasci', '🐷', ['hranidba', 'veterinar', 'evidencija']),
      ]),
      group('ovcarstvo', 'Ovčarstvo', '🐑', [
        crop('ovce', 'Ovce', '🐑', ['hranidba', 'veterinar', 'premjestanje', 'evidencija']),
        crop('janjeci', 'Janjci', '🐑', ['hranidba', 'veterinar', 'evidencija']),
      ]),
      group('kozarstvo', 'Kozarstvo', '🐐', [
        crop('koze', 'Koze', '🐐', ['hranidba', 'muznja', 'veterinar', 'evidencija']),
        crop('jarici', 'Jarići', '🐐', ['hranidba', 'veterinar', 'evidencija']),
      ]),
      group('peradarstvo', 'Peradarstvo', '🐔', [
        crop('nesilice', 'Nesilice', '🐔', ['hranidba', 'ciscenje', 'veterinar', 'evidencija']),
        crop('brojleri', 'Brojleri', '🐓', ['hranidba', 'ciscenje', 'veterinar', 'evidencija']),
        crop('purani', 'Purani', '🦃', ['hranidba', 'ciscenje', 'veterinar', 'evidencija']),
        crop('patke', 'Patke', '🦆', ['hranidba', 'ciscenje', 'veterinar', 'evidencija']),
      ]),
      group('konjogojstvo', 'Konjogojstvo', '🐎', [
        crop('konji', 'Konji', '🐎', ['hranidba', 'veterinar', 'ciscenje', 'evidencija']),
      ]),
    ],
  },

  ekoloska_proizvodnja: {
    key: 'ekoloska_proizvodnja',
    label: 'Ekološka proizvodnja',
    emoji: '♻️',
    profileMatches: ['ekološka proizvodnja', 'ekoloska proizvodnja', 'ekološka poljoprivreda', 'ekoloska poljoprivreda'],
    groups: [
      group('certifikacija', 'Certifikacija i kontrole', '✅', [
        crop('eko_dokumentacija', 'Eko dokumentacija', '🗂️', ['certifikacija', 'kontrola', 'inspekcija', 'evidencija']),
      ]),
      group('plan_proizvodnje', 'Plan proizvodnje', '🗓️', [
        crop('eko_plan', 'Eko plan', '♻️', ['planiranje', 'plodored', 'evidencija', 'kompost']),
      ]),
      group('eko_ratarsko', 'Eko ratarstvo', '🌾', [
        crop('eko_oranice', 'Eko oranice', '🌾', ['sjetva', 'prihrana', 'zastita', 'zetva', 'evidencija']),
      ]),
      group('eko_povrce', 'Eko povrće', '🥬', [
        crop('eko_povrtnjak', 'Eko povrtnjak', '🥬', ['sadnja', 'navodnjavanje', 'zastita', 'berba', 'evidencija']),
      ]),
      group('eko_vocarstvo', 'Eko voćarstvo', '🍎', [
        crop('eko_vocnjak', 'Eko voćnjak', '🍎', ['rezidba', 'zastita', 'berba', 'evidencija']),
      ]),
    ],
  },

  prehrambena_industrija: {
    key: 'prehrambena_industrija',
    label: 'Prehrambena industrija',
    emoji: '🏭',
    profileMatches: ['prehrambena industrija'],
    groups: [
      group('proizvodnja', 'Proizvodnja', '⚙️', [
        crop('linija', 'Proizvodna linija', '⚙️', ['proizvodnja', 'obrada', 'kontrola_kvalitete', 'pakiranje']),
      ]),
      group('distribucija', 'Distribucija', '🚚', [
        crop('otprema', 'Otprema', '🚚', ['distribucija', 'isporuka', 'skladistenje']),
      ]),
      group('prerada_mlijeka', 'Prerada mlijeka', '🥛', [
        crop('mlijecni_proizvodi', 'Mliječni proizvodi', '🥛', ['prerada', 'kontrola_kvalitete', 'pakiranje']),
      ]),
      group('prerada_mesa', 'Prerada mesa', '🥩', [
        crop('mesni_proizvodi', 'Mesni proizvodi', '🥩', ['prerada', 'kontrola_kvalitete', 'pakiranje']),
      ]),
    ],
  },

  trgovina_i_usluge: {
    key: 'trgovina_i_usluge',
    label: 'Trgovina i usluge',
    emoji: '🛍️',
    profileMatches: ['trgovina i usluge'],
    groups: [
      group('prodaja', 'Prodaja', '💶', [
        crop('maloprodaja', 'Maloprodaja', '🛍️', ['prodaja', 'ponude', 'isporuka']),
        crop('veleprodaja', 'Veleprodaja', '📦', ['prodaja', 'ponude', 'isporuka']),
      ]),
      group('servis_teren', 'Servis i teren', '🔧', [
        crop('servis_opreme', 'Servis opreme', '🔧', ['servis', 'teren', 'montaza', 'klijent']),
        crop('najam_mehanizacije', 'Najam mehanizacije', '🚜', ['dogovor', 'isporuka', 'servis']),
      ]),
    ],
  },

  kooperacija: {
    key: 'kooperacija',
    label: 'Kooperacija',
    emoji: '🤝',
    profileMatches: ['kooperacija'],
    groups: [
      group('ugovaranje', 'Ugovaranje', '🤝', [
        crop('kooperanti', 'Kooperanti', '🤝', ['dogovor', 'sastanak', 'evidencija', 'obracun']),
      ]),
      group('otkup_i_isporuka', 'Otkup i isporuka', '📦', [
        crop('roba', 'Roba', '📦', ['preuzimanje', 'isporuka', 'transport', 'evidencija']),
      ]),
    ],
  },

  konzultantske_usluge: {
    key: 'konzultantske_usluge',
    label: 'Konzultantske usluge',
    emoji: '🧠',
    profileMatches: ['konzultantske usluge'],
    groups: [
      group('savjetovanje', 'Savjetovanje', '🧠', [
        crop('klijenti', 'Klijenti', '🤝', ['savjetovanje', 'sastanak', 'teren']),
      ]),
      group('dokumentacija', 'Dokumentacija i planovi', '🗂️', [
        crop('projekti', 'Projekti', '🗂️', ['dokumentacija_izrada', 'plan', 'sastanak']),
      ]),
      group('natjecaji', 'Natječaji', '📄', [
        crop('prijave', 'Prijave i natječaji', '📄', ['dokumentacija_izrada', 'plan', 'sastanak']),
      ]),
    ],
  },

  edukacijske_usluge: {
    key: 'edukacijske_usluge',
    label: 'Edukacijske usluge',
    emoji: '🎓',
    profileMatches: ['edukacijske usluge'],
    groups: [
      group('nastava', 'Nastava i radionice', '🎓', [
        crop('edukacija_uzivo', 'Edukacija uživo', '🎤', ['predavanje', 'radionica', 'materijali', 'sastanak']),
      ]),
      group('online_edukacija', 'Online edukacija', '💻', [
        crop('webinar', 'Webinar', '💻', ['online', 'materijali', 'sastanak']),
      ]),
    ],
  },

  alkoholna_pica: {
    key: 'alkoholna_pica',
    label: 'Alkoholna pića',
    emoji: '🍷',
    profileMatches: ['alkoholna pića', 'alkoholna pica'],
    groups: [
      group('proizvodnja', 'Proizvodnja', '⚙️', [
        crop('vino', 'Vino', '🍷', ['fermentacija', 'kontrola_kvalitete', 'punjenje', 'skladistenje']),
        crop('rakija', 'Rakija', '🥃', ['prerada', 'kontrola_kvalitete', 'punjenje', 'skladistenje']),
        crop('liker', 'Liker', '🍸', ['prerada', 'punjenje', 'skladistenje']),
        crop('pivo', 'Pivo', '🍺', ['fermentacija', 'kontrola_kvalitete', 'punjenje', 'skladistenje']),
      ]),
    ],
  },

  ljekovito_bilje: {
    key: 'ljekovito_bilje',
    label: 'Ljekovito bilje',
    emoji: '🌿',
    profileMatches: ['ljekovito bilje'],
    groups: [
      group('uzgoj', 'Uzgoj', '🌿', [
        crop('kamilica', 'Kamilica', '🌼', ['sjetva', 'prihrana', 'zastita', 'berba', 'susenje']),
        crop('lavanda', 'Lavanda', '💜', ['sadnja', 'rezidba', 'berba', 'susenje']),
        crop('menta', 'Menta', '🌿', ['sadnja', 'berba', 'susenje', 'pakiranje']),
        crop('neven', 'Neven', '🌼', ['sjetva', 'berba', 'susenje', 'pakiranje']),
      ]),
      group('prerada', 'Prerada', '🏭', [
        crop('etericna_ulja', 'Eterična ulja', '🫙', ['prerada', 'pakiranje', 'prodaja']),
        crop('suhi_cajevi', 'Suhi čajevi', '🍵', ['prerada', 'pakiranje', 'prodaja']),
      ]),
    ],
  },

  sjemenska_proizvodnja: {
    key: 'sjemenska_proizvodnja',
    label: 'Sjemenska proizvodnja',
    emoji: '🌾',
    profileMatches: ['sjemenska proizvodnja'],
    groups: [
      group('sjeme_ratarstvo', 'Sjeme ratarskih kultura', '🌾', [
        crop('sjeme_psenice', 'Sjeme pšenice', '🌾', ['sjetva', 'kontrola', 'dorada', 'pakiranje', 'skladistenje']),
        crop('sjeme_kukuruza', 'Sjeme kukuruza', '🌽', ['sjetva', 'kontrola', 'dorada', 'pakiranje', 'skladistenje']),
        crop('sjeme_soje', 'Sjeme soje', '🫘', ['sjetva', 'kontrola', 'dorada', 'pakiranje', 'skladistenje']),
      ]),
      group('sjeme_povrce', 'Sjeme povrća', '🥬', [
        crop('sjeme_rajcice', 'Sjeme rajčice', '🍅', ['sjetva', 'kontrola', 'dorada', 'pakiranje']),
        crop('sjeme_paprike', 'Sjeme paprike', '🫑', ['sjetva', 'kontrola', 'dorada', 'pakiranje']),
      ]),
    ],
  },

  rasadnicarstvo: {
    key: 'rasadnicarstvo',
    label: 'Rasadničarstvo',
    emoji: '🌿',
    profileMatches: ['rasadničarstvo', 'rasadnicarstvo'],
    groups: [
      group('presadnice', 'Presadnice', '🪴', [
        crop('povrtne_presadnice', 'Povrtne presadnice', '🌱', ['sjetva', 'presadivanje', 'njega', 'zastita', 'prodaja']),
        crop('vocne_sadnice', 'Voćne sadnice', '🍎', ['sadnja', 'njega', 'zastita', 'prodaja']),
        crop('lozni_cjepovi', 'Lozni cijepovi', '🍇', ['sadnja', 'njega', 'zastita', 'prodaja']),
      ]),
      group('ukrasno_bilje', 'Ukrasno bilje', '🌸', [
        crop('ukrasni_grmovi', 'Ukrasni grmovi', '🌸', ['sadnja', 'njega', 'prodaja']),
      ]),
    ],
  },

  cvjecarstvo: {
    key: 'cvjecarstvo',
    label: 'Cvjećarstvo',
    emoji: '🌸',
    profileMatches: ['cvjećarstvo', 'cvjecarstvo'],
    groups: [
      group('rezano_cvijece', 'Rezano cvijeće', '🌹', [
        crop('ruza', 'Ruža', '🌹', ['sadnja', 'zalijevanje', 'prihrana', 'rezanje', 'pakiranje', 'prodaja']),
        crop('tulipan', 'Tulipan', '🌷', ['sadnja', 'zalijevanje', 'rezanje', 'prodaja']),
        crop('krizantema', 'Krizantema', '🌼', ['sadnja', 'zalijevanje', 'rezanje', 'prodaja']),
      ]),
      group('loncanice', 'Lončanice', '🪴', [
        crop('sobno_cvijece', 'Sobno cvijeće', '🪴', ['sadnja', 'zalijevanje', 'prihrana', 'prodaja']),
        crop('balkonsko_cvijece', 'Balkonsko cvijeće', '🌸', ['sadnja', 'zalijevanje', 'prodaja']),
      ]),
    ],
  },

  administracija: {
    key: 'administracija',
    label: 'Opći poslovi',
    emoji: '🧰',
    profileMatches: ['administracija'],
    groups: [
      group('administracija', 'Administracija', '📋', [
        crop('administracija_segment', 'Administracija', '📋', ['planiranje', 'dokumentacija_izrada', 'evidencija', 'sastanak']),
      ]),
      group('operativa', 'Operativa', '🛠️', [
        crop('operativa_segment', 'Operativa', '🛠️', ['servis', 'nabava', 'isporuka', 'radnici', 'teren', 'kontrola']),
      ]),
    ],
  },
};

function flattenLegacySubcategories(branchKey) {
  const branch = AB_GO_HIERARCHY[branchKey];
  if (!branch) return [];
  const map = new Map();

  branch.groups.forEach((groupItem) => {
    groupItem.crops.forEach((cropItem) => {
      cropItem.actions.forEach((action) => {
        if (!map.has(action.key)) {
          map.set(action.key, action);
        }
      });
    });
  });

  return Array.from(map.values());
}

export const AB_GO_CATEGORY_MAP = Object.fromEntries(
  Object.values(AB_GO_HIERARCHY).map((branch) => [
    branch.key,
    {
      key: branch.key,
      label: branch.label,
      emoji: branch.emoji,
      profileMatches: branch.profileMatches,
      subcategories:
        branch.key === AB_GO_COMMON_CATEGORY.key
          ? AB_GO_COMMON_SUBCATEGORIES
          : flattenLegacySubcategories(branch.key),
    },
  ])
);

function normalizeText(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function getAbGoProfileBranches(profileActivities = []) {
  const normalized = (Array.isArray(profileActivities) ? profileActivities : []).map((item) => normalizeText(item));

  const matched = Object.values(AB_GO_HIERARCHY)
    .filter((branch) => branch.key !== AB_GO_COMMON_CATEGORY.key)
    .filter((branch) => branch.profileMatches.some((candidate) => normalized.includes(normalizeText(candidate))))
    .map((branch) => ({
      key: branch.key,
      label: branch.label,
      emoji: branch.emoji,
    }));

  return [...matched, AB_GO_COMMON_CATEGORY];
}

export function getAbGoSubcategories(branchKey) {
  if (branchKey === AB_GO_COMMON_CATEGORY.key) return AB_GO_COMMON_SUBCATEGORIES;
  return AB_GO_CATEGORY_MAP[branchKey]?.subcategories || [];
}

export function getAbGoGroups(branchKey) {
  return AB_GO_HIERARCHY[branchKey]?.groups || [];
}

export function getAbGoCrops(branchKey, groupKey) {
  return getAbGoGroups(branchKey).find((item) => item.key === groupKey)?.crops || [];
}

export function getAbGoActions(branchKey, groupKey, cropKey) {
  return getAbGoCrops(branchKey, groupKey).find((item) => item.key === cropKey)?.actions || [];
}

export function getAbGoMonitoringAlerts(monitoringData) {
  const rawAlerts = monitoringData?.alerts || monitoringData?.meteo?.alerts || monitoringData?.weather?.alerts || [];
  return Array.isArray(rawAlerts) ? rawAlerts.filter(Boolean) : [];
}

function getAlertByType(alerts = [], type) {
  return alerts.find((alert) => normalizeText(alert?.type) === type && normalizeText(alert?.level || alert?.severity || '') !== 'green');
}

function isTaskForProtection(task = {}) {
  return ['zastita', 'tretman'].includes(task?.actionKey || task?.subcategoryKey);
}

function isTaskForSowing(task = {}) {
  return ['sjetva', 'sadnja', 'presadivanje'].includes(task?.actionKey || task?.subcategoryKey);
}

function isTaskForHarvest(task = {}) {
  return ['zetva', 'berba'].includes(task?.actionKey || task?.subcategoryKey);
}

function isTaskForWater(task = {}) {
  return ['navodnjavanje', 'zalijevanje'].includes(task?.actionKey || task?.subcategoryKey);
}

function isTaskForAdmin(task = {}) {
  return task?.branchKey === AB_GO_COMMON_CATEGORY.key;
}

function buildReminder(level, title, message) {
  return { level, title, message };
}

export function getAbGoSmartReminder(task, monitoringData) {
  if (!task) return null;

  const alerts = getAbGoMonitoringAlerts(monitoringData);
  const rainAlert = getAlertByType(alerts, 'rain');
  const windAlert = getAlertByType(alerts, 'wind');
  const frostAlert = getAlertByType(alerts, 'frost');
  const heatAlert = getAlertByType(alerts, 'heat');

  if (isTaskForProtection(task) && (rainAlert || windAlert)) {
    return buildReminder('warning', 'Provjeri uvjete prije zaštite', 'Agro signal pokazuje kišu ili vjetar. Zaštitu i tretman provjeri prije izlaska na teren.');
  }

  if (isTaskForSowing(task) && (frostAlert || rainAlert)) {
    return buildReminder('warning', 'Oprez kod sjetve i sadnje', 'Najavljeni su mraz ili kiša. Sjetvu i sadnju prilagodi stvarnim uvjetima na terenu.');
  }

  if (isTaskForHarvest(task) && rainAlert) {
    return buildReminder('warning', 'Berbu ili žetvu provjeri prema oborinama', 'Agro signal javlja kišu. Razmotri raniji izlazak ili pomak obaveze.');
  }

  if (isTaskForWater(task) && !rainAlert && heatAlert) {
    return buildReminder('info', 'Pojačaj fokus na vodu', 'Nema signala za kišu, a prisutna je vrućina. Navodnjavanje danas može biti prioritet.');
  }

  if (isTaskForAdmin(task)) {
    return buildReminder('info', 'Administrativna stavka', 'Za administrativne zadatke provjeri dokumentaciju i ostavi dovoljno vremena za predaju.');
  }

  if (task?.branchKey === 'ekoloska_proizvodnja') {
    return buildReminder('info', 'Eko evidencija je važna', 'Kod ekološke proizvodnje uz zadatak pripremi i evidenciju, certifikaciju ili kontrolu kada treba.');
  }

  return buildReminder('neutral', 'Planirana obaveza', 'Zadatak je spremljen. Po potrebi kasnije vežemo preciznije AgroMonitoring podsjetnike.');
}

export function getAbGoAutoTaskSuggestions(branches = [], monitoringData) {
  const alerts = getAbGoMonitoringAlerts(monitoringData);
  const rainAlert = getAlertByType(alerts, 'rain');
  const windAlert = getAlertByType(alerts, 'wind');
  const frostAlert = getAlertByType(alerts, 'frost');
  const heatAlert = getAlertByType(alerts, 'heat');

  const items = [];

  const pushSuggestion = (id, branch, action, title, message, level = 'info') => {
    if (!branch || !action) return;

    items.push({
      id,
      level,
      title,
      message,
      branchKey: branch.key,
      branchLabel: branch.label,
      branchEmoji: branch.emoji,
      subcategoryKey: action.key,
      subcategoryLabel: action.label,
      subcategoryEmoji: action.emoji,
    });
  };

  const adminBranch = branches.find((b) => b.key === AB_GO_COMMON_CATEGORY.key) || AB_GO_COMMON_CATEGORY;
  const anyProductionBranch = branches.find((b) => b.key !== AB_GO_COMMON_CATEGORY.key);

  if (rainAlert || windAlert) {
    pushSuggestion('protection-check', anyProductionBranch, ACTION_LIBRARY.zastita, 'Provjeri zaštitu', 'Prije tretmana provjeri kišu i vjetar te prilagodi posao uvjetima.', 'warning');
  }

  if (frostAlert) {
    pushSuggestion('frost-check', anyProductionBranch, ACTION_LIBRARY.sjetva, 'Provjeri sjetvu i sadnju', 'Mraz može utjecati na planirane radove. Provjeri teren prije izlaska.', 'warning');
  }

  if (heatAlert && !rainAlert) {
    pushSuggestion('water-check', anyProductionBranch, ACTION_LIBRARY.navodnjavanje, 'Planiraj vodu', 'Toplina bez kiše upućuje da je navodnjavanje danas važno.', 'info');
  }

  pushSuggestion('admin-review', adminBranch, ACTION_LIBRARY.dokumentacija_izrada, 'Pregledaj signal i dokumentaciju', 'Dodaj administrativni podsjetnik za signal, rok ili dokumentaciju.', 'neutral');

  return items.filter(Boolean);
}
