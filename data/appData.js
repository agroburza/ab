import { AB_GO_CATEGORY_MAP, AB_GO_COMMON_CATEGORY, AB_GO_COMMON_SUBCATEGORIES, getAbGoProfileBranches, getAbGoSubcategories } from '../utils/AbGoUtils';

export const modules = [
  {
    key: 'abplus',
    url: 'https://plus.ab.hr/?mobile=1',
    image: require('../assets/abplus.webp'),
    emoji: '➕',
    native: false,
  },
  {
    key: 'abhr',
    title: 'ab.hr',
    url: 'https://ab.hr/?mobile=1',
    image: require('../assets/abhr.webp'),
    emoji: '🌐',
    native: false,
  },
  {
    key: 'oglasnik',
    title: 'Oglasnik',
    url: '',
    image: require('../assets/oglasnik.webp'),
    emoji: '📦',
    native: true,
    nativeScreen: 'oglasnikLista',
  },
  {
    key: 'abgo',
    title: 'ab GO',
    url: '',
    image: require('../assets/abGO.webp'),
    emoji: '🗓️',
    native: true,
    nativeScreen: 'abgo',
  },
  {
    key: 'alati',
    title: 'Alati',
    url: '',
    image: require('../assets/Alati.webp'),
    emoji: '🧰',
    native: true,
    nativeScreen: 'alati',
  },
  {
    key: 'monitoring',
    title: 'AgroMeteo',
    url: '',
    image: require('../assets/agro-meteo.webp'),
    emoji: '🌦️',
    native: true,
    nativeScreen: 'monitoring',
  },
  {
    key: 'agromonitoring',
    title: 'AgroMonitoring',
    url: '',
    image: require('../assets/AgroMonitoring.png'),
    emoji: '🚦',
    native: true,
    nativeScreen: 'agromonitoring',
  },
  {
    key: 'agronet',
    title: 'Agronet',
    url: 'https://agronet.apprrr.hr/',
    image: require('../assets/AgroNet.png'),
    emoji: '🌾',
    native: false,
  },
];



export const menuItems = [
  { key: 'home', title: '🏠', type: 'home' },
  { key: 'oglasnik', title: '📦', type: 'module' },
  { key: 'profil', title: '👤', type: 'native', nativeScreen: 'profile' },
  { key: 'moji-oglasi', title: '📋', type: 'native', nativeScreen: 'myAds' },
];

export const quickActions = [
  {
    key: 'objavi-oglas',
    title: 'Objavi',
    emoji: '📢',
    type: 'native',
    nativeScreen: 'postAd',
  },
  {
    key: 'moji-oglasi',
    title: 'Moji oglasi',
    emoji: '📋',
    type: 'native',
    nativeScreen: 'myAds',
  },
  {
    key: 'oglasnik',
    title: 'Oglasnik',
    emoji: '📦',
    type: 'module',
  },
  { key: 'abgo', title: 'ab GO', emoji: '🗓️', type: 'module' },
  { key: 'abplus', title: 'AB+', emoji: '➕', type: 'module' },
  { key: 'alati', title: 'Alati', emoji: '🧰', type: 'module' },
  { key: 'monitoring', title: 'AgroMeteo', emoji: '🌦️', type: 'module' },
  { key: 'agromonitoring', title: 'AgroMonitoring', emoji: '🚦', type: 'module' },
  { key: 'agronet', title: 'Agronet', emoji: '🌾', type: 'module' },
];

export const defaultProfile = {
  fullName: 'Korisnik',
  email: '',
  location: '',
  farmName: '',
  phone: '',
  zupanija: '',
  adresa: '',
  oib: '',
  mibpg: '',
  jibg: '',
  baza: '',
  organizacijski_oblik: '',
  djelatnosti: [],
  zelim_aplikaciju: '1',
  profile_photo: '',
  cover_photo: '',
};

export const defaultRegister = {
  package_id: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  phone_number: '',
  a_naziv_gospodarstva: '',
  a_daberite_organizacijski_oblik: '',
  a_zupanija: '',
  a_mjesto: '',
  a_adresa: '',
  a_oib: '',
  a_mibpg: '',
  a_ibk: '',
  a_izaberite_bazu: '',
  a_odaberite_vase_djelatnosti: [],
  a_zelim_aplikaciju: '1',
  profile_photo: null,
  cover_photo: null,
};

export const emptyRegisterOptions = {
  a_izaberite_bazu: [],
  a_daberite_organizacijski_oblik: [],
  a_zupanija: [],
  a_mjesto: [],
  a_odaberite_vase_djelatnosti: [],
  mjesta_full: [],
};

export const conditionOptions = [
  { value: 'novo', label: 'Novo', emoji: '🆕' },
  { value: 'rabljeno', label: 'Rabljeno', emoji: '🔁' },
  { value: 'prodano', label: 'Prodano', emoji: '✅' },
];

export const ZUPANIJE = [
  { value: '', label: '📍Sve županije' },
  { value: 'Bjelovarsko-bilogorska', label: '🐄 Bjelovarsko-bilogorska' },
  { value: 'Brodsko-posavska', label: '🚤 Brodsko-posavska' },
  { value: 'Dubrovačko-neretvanska', label: '🏖️ Dubrovačko-neretvanska' },
  { value: 'Istarska', label: '🍷 Istarska' },
  { value: 'Karlovačka', label: '🏞️ Karlovačka' },
  { value: 'Koprivničko-križevačka', label: '🌾 Koprivničko-križevačka' },
  { value: 'Krapinsko-zagorska', label: '⛰️ Krapinsko-zagorska' },
  { value: 'Ličko-senjska', label: '🐻 Ličko-senjska' },
  { value: 'Međimurska', label: '🌿 Međimurska' },
  { value: 'Osječko-baranjska', label: '🌽 Osječko-baranjska' },
  { value: 'Požeško-slavonska', label: '🍇 Požeško-slavonska' },
  { value: 'Primorsko-goranska', label: '⚓ Primorsko-goranska' },
  { value: 'Sisačko-moslavačka', label: '🌊 Sisačko-moslavačka' },
  { value: 'Splitsko-dalmatinska', label: '🌊 Splitsko-dalmatinska' },
  { value: 'Šibensko-kninska', label: '🏝️ Šibensko-kninska' },
  { value: 'Varaždinska', label: '🏰 Varaždinska' },
  { value: 'Virovitičko-podravska', label: '🌻 Virovitičko-podravska' },
  { value: 'Vukovarsko-srijemska', label: '🌾 Vukovarsko-srijemska' },
  { value: 'Zadarska', label: '🌅 Zadarska' },
  { value: 'Zagrebačka', label: '🌳 Zagrebačka' },
  { value: 'Grad Zagreb', label: '🏙️ Grad Zagreb' },
];

export const registerBenefits = [
  '🌱 Brza registracija u nekoliko koraka',
  '📈 Veća vidljivost gospodarstva i oglasa',
  '🔔 Obavijesti i alati na jednom mjestu',
];

export const registerStepMeta = [
  { id: 1, title: 'Paket', subtitle: 'Odaberite pripadajući paket' },
  { id: 2, title: 'Osnovni podaci', subtitle: 'Tvoje osnovne informacije' },
  { id: 3, title: 'Gospodarstvo', subtitle: 'Podaci o gospodarstvu i bazi' },
  { id: 4, title: 'Lokacija i djelatnosti', subtitle: 'Mjesto, županija i djelatnosti' },
];


export {
  AB_GO_CATEGORY_MAP,
  AB_GO_COMMON_CATEGORY,
  AB_GO_COMMON_SUBCATEGORIES,
  getAbGoProfileBranches,
  getAbGoSubcategories,
};
