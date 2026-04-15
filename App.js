import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Animated,
  Dimensions,
  ActivityIndicator,
  BackHandler,
  ToastAndroid,
  Image,
  StatusBar,
  TextInput,
  Linking,
  Share,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import OglasnikListaScreen from './screens/OglasnikListaScreen';
import OglasDetaljScreen from './screens/OglasDetaljScreen';
import {
  PREMIUM_LOCKED_KEYS,
  STORAGE_KEYS,
} from './config';
import IzracunPotporaScreen from './screens/IzracunPotporaScreen';
import { apiRequest as coreApiRequest, getDefaultLicense } from './api';
import FavoritiScreen from './screens/FavoritiScreen';
import OglasiProdavateljaScreen from './screens/OglasiProdavateljaScreen';
import AgroMeteoScreen from './screens/AgroMeteoScreen';
import AgroMonitoringScreen from './screens/agromonitoringScreens';
import { normalizeAgroMeteoPayload } from './services/agroApi.js';
import AlatiScreen from './screens/Alati';
import ToolPlaceholderScreen from './screens/ToolPlaceholderScreen';
import SavjetnikScreen from './screens/SavjetnikScreen';
import AppTopBar from './components/AppTopBar';
import LicenseBanner from './components/LicenseBanner';
import BottomPicker from './components/BottomPicker';
import { QuickActionsSection, ContinueSection, FavoritesSection, ModulesGridSection } from './components/HomeSections';
import { modules, menuItems, quickActions, defaultProfile, defaultRegister, emptyRegisterOptions, conditionOptions, ZUPANIJE, registerBenefits, registerStepMeta } from './data/appData';
import { getLevelStyle, getRiskLevel, average, sumLast, formatNumber, buildMonitoringCards, mapApiUserToProfile, getActivityEmoji, formatLicenseDate } from './utils/appHelpers';
import AbGoScreen from './screens/AbGoScreen';
const ICON_SHARE = require('./assets/share.png');

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const SIDE_PADDING = isTablet ? 20 : 16;
const GRID_GAP = 12;
const CARD_WIDTH = (width - SIDE_PADDING * 2 - GRID_GAP) / 2;
const HOME_CARD_COLUMNS = width >= 1024 ? 4 : isTablet ? 3 : 2;
const HOME_CARD_WIDTH = (width - SIDE_PADDING * 2 - GRID_GAP * (HOME_CARD_COLUMNS - 1)) / HOME_CARD_COLUMNS;

const EMBED_CSS = `
  (function() {
    var style = document.createElement('style');
    style.innerHTML = \`
      header, footer, .site-header, .site-footer,
      .sidebar, .widget-area,
      .page-header, .entry-header,
      .breadcrumb, .breadcrumbs,
      #masthead, #colophon, #secondary,
      .um-header, .um-profile-nav, .um-profile-meta {
        display: none !important;
      }

      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
        overflow-x: hidden !important;
      }

      #page, #content, main, .site, .site-content,
      .content-area, .entry-content, .container, .ast-container {
        max-width: 100% !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }
    \`;
    document.head.appendChild(style);
  })();
  true;
`;
 

const ABAPP_API_KEY = 'abhr-super-tajni-kljuc-2026';

function AppContainer({ children }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      {children}
    </View>
  );
}

const apiRequest = (url, options = {}, authToken) => {
  return coreApiRequest(
    url,
    {
      ...options,
      headers: {
        ...(options?.headers || {}),
        'X-ABAPP-KEY': ABAPP_API_KEY,
      },
    },
    authToken
  );
};






function MainApp() {
  const [selectedModule, setSelectedModule] = useState(null);
  const [showAgronetNotice, setShowAgronetNotice] = useState(false);
  const [currentNativeScreen, setCurrentNativeScreen] = useState(null);
  const [selectedOglasId, setSelectedOglasId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
    
  const [lastOpenedModule, setLastOpenedModule] = useState(null);
  const [favoriteKeys, setFavoriteKeys] = useState([]);
  const [favoriteAdIds, setFavoriteAdIds] = useState([]);
  const [favoriteAdsData, setFavoriteAdsData] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [moduleLoading, setModuleLoading] = useState(false);
  const [homeTab, setHomeTab] = useState('home');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [packagesOpen, setPackagesOpen] = useState(false);

  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [registerOptions, setRegisterOptions] = useState(emptyRegisterOptions);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const [authMode, setAuthMode] = useState('login');
  const [registerData, setRegisterData] = useState(defaultRegister);
  const [authLoading, setAuthLoading] = useState(false);
  const [registerStep, setRegisterStep] = useState(1);

  const [authToken, setAuthToken] = useState('');
  const [ssoReady, setSsoReady] = useState(false);
  const [ssoToken, setSsoToken] = useState(null);
  const [profileData, setProfileData] = useState(defaultProfile);
  const [licenseData, setLicenseData] = useState(getDefaultLicense());

    const profileImageSource = useMemo(() => {
    if (profileData?.profile_photo) {
      return { uri: profileData.profile_photo };
    }
    return require('./assets/profil.webp');
  }, [profileData?.profile_photo]);

  const coverImageSource = useMemo(() => {
    if (profileData?.cover_photo) {
      return { uri: profileData.cover_photo };
    }
    return require('./assets/abhr.webp');
  }, [profileData?.cover_photo]);

  const [monitoringData, setMonitoringData] = useState(null);
  const [monitoringLoading, setMonitoringLoading] = useState(false);
  const [monitoringError, setMonitoringError] = useState('');
  const [monitoringRefreshedAt, setMonitoringRefreshedAt] = useState('');

  const [adTitle, setAdTitle] = useState('');
const [adDescription, setAdDescription] = useState('');
const [adCategory, setAdCategory] = useState('');
const [adPrice, setAdPrice] = useState('');
const [adLocation, setAdLocation] = useState('');
const [adZupanija, setAdZupanija] = useState('');
const [adCondition, setAdCondition] = useState('');
const [adPriceOnRequest, setAdPriceOnRequest] = useState(false);

  const [adCategories, setAdCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

const [adParentCategory, setAdParentCategory] = useState('');
const [adChildCategory, setAdChildCategory] = useState('');

const [adFeaturedImage, setAdFeaturedImage] = useState(null);
const [adGallery1, setAdGallery1] = useState(null);
const [adGallery2, setAdGallery2] = useState(null);
const [adGallery3, setAdGallery3] = useState(null);
  
  const [myAds, setMyAds] = useState([]);
const [myAdsLoading, setMyAdsLoading] = useState(false);
const [myAdsError, setMyAdsError] = useState('');

const [editingAdId, setEditingAdId] = useState(null);
const [editingAdLoading, setEditingAdLoading] = useState(false);

  const [editProfilePhoto, setEditProfilePhoto] = useState(null);
  const [editCoverPhoto, setEditCoverPhoto] = useState(null);

  const [mjestoQuery, setMjestoQuery] = useState('');
  const [editMjestoQuery, setEditMjestoQuery] = useState('');
  const [registerPlaceFocused, setRegisterPlaceFocused] = useState(false);
  const [editPlaceFocused, setEditPlaceFocused] = useState(false);
  const [adPlaceFocused, setAdPlaceFocused] = useState(false);

  const webRef = useRef(null);
  const webCanGoBackRef = useRef(false);
  const lastBackPress = useRef(0);
  const pickerOnSelectRef = useRef(null);

const [selectedSellerId, setSelectedSellerId] = useState(null);
  const [selectedSellerName, setSelectedSellerName] = useState('');

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTitle, setPickerTitle] = useState('');
  const [pickerItems, setPickerItems] = useState([]);
  const [pickerValue, setPickerValue] = useState('');
  const [pickerType, setPickerType] = useState('');
  const [pickerValues, setPickerValues] = useState([]);
  const [showHero, setShowHero] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
  const checkHero = async () => {
    const seen = await AsyncStorage.getItem('hero_seen');

    if (seen === '1') {
      setShowHero(false);
      return;
    }

    setShowHero(true);
    fadeAnim.setValue(1);

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(async () => {
        setShowHero(false);
        await AsyncStorage.setItem('hero_seen', '1');
      });
    }, 10000);
  };

  checkHero();
}, []);

  useEffect(() => {
  const bootstrap = async () => {
    try {
      const [
        storedLastOpened,
        storedFavorites,
        storedFavoriteAds,
        storedSession,
        storedProfile,
        storedMonitoring,
        storedLicense,
        storedRemember,
        storedRememberEmail,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.LAST_OPENED),
        AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
        AsyncStorage.getItem('ab_favorite_ads'),
        AsyncStorage.getItem(STORAGE_KEYS.SESSION),
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.MONITORING),
        AsyncStorage.getItem(STORAGE_KEYS.LICENSE),
        AsyncStorage.getItem('ab_remember'),
        AsyncStorage.getItem('ab_remember_email'),
      ]);

      if (storedLastOpened) setLastOpenedModule(JSON.parse(storedLastOpened));
      if (storedFavorites) setFavoriteKeys(JSON.parse(storedFavorites));
      if (storedFavoriteAds) {
        const parsedFavoriteAds = JSON.parse(storedFavoriteAds);
        if (Array.isArray(parsedFavoriteAds)) {
          setFavoriteAdsData(parsedFavoriteAds);
          setFavoriteAdIds(parsedFavoriteAds.map((ad) => ad.id));
        }
      }
      if (storedProfile) setProfileData(JSON.parse(storedProfile));

      if (storedRemember === '1') {
        setRememberMe(true);
        if (storedRememberEmail) setLoginEmail(storedRememberEmail);
      } else if (storedRemember === '0') {
        setRememberMe(false);
      }

      if (storedMonitoring) {
        const parsedMonitoring = JSON.parse(storedMonitoring);
        setMonitoringData(
          parsedMonitoring?.data
            ? normalizeAgroMeteoPayload(parsedMonitoring.data)
            : null
        );
        setMonitoringRefreshedAt(parsedMonitoring?.refreshedAt || '');
      }

      if (storedLicense) {
        setLicenseData({
          ...getDefaultLicense(),
          ...JSON.parse(storedLicense),
        });
      }

      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);

        if (
          parsedSession?.token_expires &&
          Number(parsedSession.token_expires) * 1000 < Date.now()
        ) {
          await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
       } else if (parsedSession?.token) {
  setAuthToken(parsedSession.token);
  setSsoToken(null);
  setSsoReady(true);
  setIsLoggedIn(true);


          if (parsedSession?.email) {
            setLoginEmail(parsedSession.email);
          }

          // /me ide kasnije u pozadini
          setTimeout(async () => {
            try {
              const me = await apiRequest(
                '/me',
                { method: 'GET' },
                parsedSession.token
              );

              const mapped = mapApiUserToProfile(me.user || {});
              setProfileData(mapped);
              setEditMjestoQuery(mapped.location || '');

              await AsyncStorage.setItem(
                STORAGE_KEYS.PROFILE,
                JSON.stringify(mapped)
              );

              await saveLicense(
                me.license || me.user?.license || getDefaultLicense()
              );
            } catch (e) {
              await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
              await AsyncStorage.removeItem(STORAGE_KEYS.LICENSE);
              setAuthToken('');
              setIsLoggedIn(false);
              setLicenseData(getDefaultLicense());
            }
          }, 0);
        } else if (parsedSession?.token && !parsedSession?.sso_token) {
          await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
          setAuthToken('');
          setSsoToken(null);
          setSsoReady(false);
          setIsLoggedIn(false);
        }
      }

      // i ovo također ide u pozadini, ne blokira otvaranje appa
      setTimeout(() => {
        loadPackages();
        loadRegisterOptions();
      }, 0);
    } catch (error) {
      console.log('Bootstrap error:', error);
    } finally {
      setLoading(false);
    }
  };

  bootstrap();
}, []);





  useEffect(() => {
    const backAction = () => {
      const now = Date.now();

      if (menuVisible) {
        setMenuVisible(false);
        return true;
      }

      if (selectedModule && webCanGoBackRef.current && webRef.current) {
        webRef.current.goBack();
        return true;
      }

      if (selectedModule) {

        if (lastBackPress.current && now - lastBackPress.current < 2000) {
          setSelectedModule(null);
          setShowAgronetNotice(false);
          return true;
        }

        lastBackPress.current = now;
        ToastAndroid.show(
          'Pritisni još jednom za povratak',
          ToastAndroid.SHORT
        );
        return true;
      }

      if (currentNativeScreen) {
        setCurrentNativeScreen(null);
        return true;
      }

      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, [selectedModule, menuVisible, currentNativeScreen]);

  const placeObjects = useMemo(
    () => registerOptions.mjesta_full || [],
    [registerOptions.mjesta_full]
  );

  const filteredRegisterMjesta = useMemo(() => {
    return placeObjects
      .filter((item) =>
        item.name.toLowerCase().includes(mjestoQuery.toLowerCase())
      )
      .slice(0, 40);
  }, [placeObjects, mjestoQuery]);

  const filteredEditMjesta = useMemo(() => {
    return placeObjects
      .filter((item) =>
        item.name.toLowerCase().includes(editMjestoQuery.toLowerCase())
      )
      .slice(0, 40);
  }, [placeObjects, editMjestoQuery]);

  const filteredAdMjesta = useMemo(() => {
    return placeObjects
      .filter((item) =>
        item.name.toLowerCase().includes(adLocation.toLowerCase())
      )
      .slice(0, 40);
  }, [placeObjects, adLocation]);

  useEffect(() => {
    if (selectedModule?.key === 'agronet' && showAgronetNotice) {
      const timer = setTimeout(() => {
        setShowAgronetNotice(false);
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [selectedModule, showAgronetNotice]);

const runSSO = async (tokenToUse) => {
  if (!tokenToUse) {
    setSsoReady(true);
    return;
  }

  try {
    setSsoReady(false);
    setSelectedModule({
      key: 'sso',
      title: 'Spajanje sustava...',
      url: `https://ab.hr/mobile-sso?token=${encodeURIComponent(tokenToUse)}`,
      image: null,
      emoji: '🔐',
    });
  } catch (e) {
    console.log('SSO error:', e?.message || e);
    setSsoReady(true);
  }
};

  const saveSession = async (sessionData) => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.SESSION,
      JSON.stringify(sessionData)
    );
  };

  const clearSession = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
    await AsyncStorage.removeItem(STORAGE_KEYS.LICENSE);
  };

  const saveLicense = async (nextLicense) => {
    const merged = { ...getDefaultLicense(), ...(nextLicense || {}) };
    await AsyncStorage.setItem(STORAGE_KEYS.LICENSE, JSON.stringify(merged));
    setLicenseData(merged);
  };

  const saveProfile = async (nextProfile) => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.PROFILE,
      JSON.stringify(nextProfile)
    );
    setProfileData(nextProfile);
  };

  const saveMonitoring = async (data) => {
    const refreshedAt = new Date().toLocaleString('hr-HR');
    await AsyncStorage.setItem(
      STORAGE_KEYS.MONITORING,
      JSON.stringify({ data, refreshedAt })
    );
    setMonitoringData(data);
    setMonitoringRefreshedAt(refreshedAt);
  };

  const saveLastOpenedModule = async (module) => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.LAST_OPENED,
      JSON.stringify(module)
    );
    setLastOpenedModule(module);
  };

  const saveFavoriteKeys = async (keys) => {
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(keys));
    setFavoriteKeys(keys);
  };

  const saveFavoriteAdsData = async (items) => {
    const normalized = Array.isArray(items) ? items : [];
    await AsyncStorage.setItem('ab_favorite_ads', JSON.stringify(normalized));
    setFavoriteAdsData(normalized);
    setFavoriteAdIds(normalized.map((ad) => ad.id));
  };

  const toggleFavoriteAdLocal = async (ad) => {
    if (!ad?.id) return;

    const exists = favoriteAdIds.includes(ad.id);

    const updated = exists
      ? favoriteAdsData.filter((item) => item.id !== ad.id)
      : [
          {
            ...ad,
            is_favorite: true,
          },
          ...favoriteAdsData.filter((item) => item.id !== ad.id),
        ];

    await saveFavoriteAdsData(updated);

    ToastAndroid.show(
      exists ? 'Uklonjeno iz favorita' : 'Dodano u favorite',
      ToastAndroid.SHORT
    );
  };

  const loadPackages = async () => {
    try {
      setPackagesLoading(true);
      const data = await apiRequest('/packages', { method: 'GET' });
      setPackages(data.packages || []);
    } catch {
      ToastAndroid.show('Ne mogu dohvatiti pakete', ToastAndroid.SHORT);
    } finally {
      setPackagesLoading(false);
    }
  };

  const loadRegisterOptions = async () => {
    try {
      setOptionsLoading(true);
      const data = await apiRequest('/register-options', { method: 'GET' });

      const raw = data.options || emptyRegisterOptions;
      const mjestaFull = Array.isArray(raw.a_mjesto)
        ? raw.a_mjesto.map((item) =>
            typeof item === 'string' ? { name: item, county: '' } : item
          )
        : [];

      setRegisterOptions({
        ...raw,
        a_mjesto: mjestaFull.map((item) => item.name),
        mjesta_full: mjestaFull,
      });
    } catch {
      ToastAndroid.show(
        'Ne mogu dohvatiti opcije registracije',
        ToastAndroid.SHORT
      );
    } finally {
      setOptionsLoading(false);
    }
  };

  const fetchMe = async (token) => {
    const data = await apiRequest('/me', { method: 'GET' }, token);
    const mapped = mapApiUserToProfile(data.user || {});
    await saveProfile(mapped);
    await saveLicense(
      data.license || data.user?.license || getDefaultLicense()
    );
    return data.user;
  };

  const handleLogin = async () => {
    try {
      if (!loginEmail.trim() || !loginPassword.trim()) {
        ToastAndroid.show('Unesi email i lozinku', ToastAndroid.SHORT);
        return;
      }

      setAuthLoading(true);

      const data = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      });

      const token = data.token || '';
      if (!data.sso_token) {
        ToastAndroid.show('SSO token nije vraćen iz API-ja', ToastAndroid.LONG);
        setAuthToken('');
        setSsoToken(null);
        setSsoReady(false);
        setIsLoggedIn(false);
        return;
      }
      setAuthToken(token);
      setSsoToken(data.sso_token || null);
      setSsoReady(false);
      setIsLoggedIn(true);
      runSSO(data.sso_token || null);

      await saveSession({
        token,
        sso_token: data.sso_token || null,
        email: loginEmail.trim(),
        token_expires: data.token_expires || null,
      });

      if (rememberMe) {
        await AsyncStorage.setItem('ab_remember', '1');
        await AsyncStorage.setItem('ab_remember_email', loginEmail.trim());
      } else {
        await AsyncStorage.setItem('ab_remember', '0');
        await AsyncStorage.removeItem('ab_remember_email');
      }

      await saveLicense(
        data.license || data.user?.license || getDefaultLicense()
      );

      if (data.user) {
        const mapped = mapApiUserToProfile(data.user);
        setEditMjestoQuery(mapped.location || '');
        await saveProfile(mapped);
      } else {
        const me = await fetchMe(token);
        const mapped = mapApiUserToProfile(me || {});
        setEditMjestoQuery(mapped.location || '');
      }

      ToastAndroid.show('Prijava uspješna', ToastAndroid.SHORT);
    } catch (error) {
      ToastAndroid.show(
        error.message || 'Greška pri prijavi',
        ToastAndroid.LONG
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      if (!registerData.package_id) {
        ToastAndroid.show('Odaberi paket', ToastAndroid.SHORT);
        return;
      }

      if (
        !registerData.first_name ||
        !registerData.last_name ||
        !registerData.email ||
        !registerData.password ||
        !registerData.phone_number
      ) {
        ToastAndroid.show('Popuni obavezna polja', ToastAndroid.SHORT);
        return;
      }

      setAuthLoading(true);

      const formData = new FormData();
      formData.append('package_id', String(registerData.package_id));
      formData.append('first_name', registerData.first_name);
      formData.append('last_name', registerData.last_name);
      formData.append('email', registerData.email);
      formData.append('password', registerData.password);
      formData.append('phone_number', registerData.phone_number);
      formData.append(
        'a_naziv_gospodarstva',
        registerData.a_naziv_gospodarstva
      );
      formData.append(
        'a_daberite_organizacijski_oblik',
        registerData.a_daberite_organizacijski_oblik
      );
      formData.append('a_zupanija', registerData.a_zupanija);
      formData.append('a_mjesto', registerData.a_mjesto);
      formData.append('a_adresa', registerData.a_adresa);
      formData.append('a_oib', registerData.a_oib);
      formData.append('a_mibpg', registerData.a_mibpg);
      formData.append('a_ibk', registerData.a_ibk);
      formData.append('a_izaberite_bazu', registerData.a_izaberite_bazu);
      formData.append('a_zelim_aplikaciju', registerData.a_zelim_aplikaciju);

      registerData.a_odaberite_vase_djelatnosti.forEach((item) => {
        formData.append('a_odaberite_vase_djelatnosti[]', item);
      });

      if (editProfilePhoto?.uri) {
        formData.append('profile_photo', {
          uri: editProfilePhoto.uri,
          name: editProfilePhoto.fileName || 'profile.jpg',
          type: editProfilePhoto.mimeType || 'image/jpeg',
        });
      }

      if (editCoverPhoto?.uri) {
        formData.append('cover_photo', {
          uri: editCoverPhoto.uri,
          name: editCoverPhoto.fileName || 'cover.jpg',
          type: editCoverPhoto.mimeType || 'image/jpeg',
        });
      }

      if (registerData.profile_photo?.uri) {
        formData.append('profile_photo', {
          uri: registerData.profile_photo.uri,
          name: registerData.profile_photo.fileName || 'profile.jpg',
          type: registerData.profile_photo.mimeType || 'image/jpeg',
        });
      }

      if (registerData.cover_photo?.uri) {
        formData.append('cover_photo', {
          uri: registerData.cover_photo.uri,
          name: registerData.cover_photo.fileName || 'cover.jpg',
          type: registerData.cover_photo.mimeType || 'image/jpeg',
        });
      }

      const data = await apiRequest('/register', {
        method: 'POST',
        body: formData,
      });

      const token = data.token || '';
      if (!data.sso_token) {
        ToastAndroid.show('SSO token nije vraćen iz API-ja', ToastAndroid.LONG);
        setAuthToken('');
        setSsoToken(null);
        setSsoReady(false);
        setIsLoggedIn(false);
        return;
      }
      setAuthToken(token);
      setSsoToken(data.sso_token || null);
      setSsoReady(false);
      setIsLoggedIn(true);
      setLoginEmail(registerData.email);

      await saveSession({
        token,
        sso_token: data.sso_token || null,
        email: registerData.email,
        token_expires: data.token_expires || null,
      });

      await saveLicense(
        data.license || data.user?.license || getDefaultLicense()
      );

      if (data.user) {
        const mapped = mapApiUserToProfile(data.user);
        setEditMjestoQuery(mapped.location || '');
        await saveProfile(mapped);
      } else {
        const me = await fetchMe(token);
        const mapped = mapApiUserToProfile(me || {});
        setEditMjestoQuery(mapped.location || '');
      }

      if (data.checkout_url) {
        setSelectedModule({
          key: 'checkout',
          title: 'Plaćanje paketa',
          url: data.checkout_url,
          image: null,
          emoji: '💳',
        });
      }

      ToastAndroid.show('Registracija uspješna', ToastAndroid.SHORT);
    } catch (error) {
      ToastAndroid.show(
        error.message || 'Greška pri registraciji',
        ToastAndroid.LONG
      );
    } finally {
      setAuthLoading(false);
    }
  };

    const handleUpdateProfile = async () => {
    try {
      if (!authToken) return;

      const nameParts = profileData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const formData = new FormData();
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('user_email', profileData.email);
      formData.append('a_naziv_gospodarstva', profileData.farmName);
      formData.append('a_zupanija', profileData.zupanija);
      formData.append('a_mjesto', profileData.location);
      formData.append('a_adresa', profileData.adresa);
      formData.append('phone_number', profileData.phone);
      formData.append('a_oib', profileData.oib);
      formData.append('a_mibpg', profileData.mibpg);
      formData.append('a_ibk', profileData.jibg);
      formData.append('a_izaberite_bazu', profileData.baza);
      formData.append(
        'a_daberite_organizacijski_oblik',
        profileData.organizacijski_oblik
      );
      formData.append('a_zelim_aplikaciju', profileData.zelim_aplikaciju);

      profileData.djelatnosti.forEach((item) => {
        formData.append('a_odaberite_vase_djelatnosti[]', item);
      });

      if (editProfilePhoto?.uri) {
        formData.append('profile_photo', {
          uri: editProfilePhoto.uri,
          name: editProfilePhoto.fileName || 'profile.jpg',
          type: editProfilePhoto.mimeType || 'image/jpeg',
        });
      }

      if (editCoverPhoto?.uri) {
        formData.append('cover_photo', {
          uri: editCoverPhoto.uri,
          name: editCoverPhoto.fileName || 'cover.jpg',
          type: editCoverPhoto.mimeType || 'image/jpeg',
        });
      }

      const data = await apiRequest(
        '/update-profile',
        {
          method: 'POST',
          body: formData,
        },
        authToken
      );

      await fetchMe(authToken);

      const storedProfileRaw = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      if (storedProfileRaw) {
        const storedProfile = JSON.parse(storedProfileRaw);
        setEditMjestoQuery(storedProfile.location || '');
      }


      setEditProfilePhoto(null);
      setEditCoverPhoto(null);

      ToastAndroid.show(
        data?.message || 'Profil ažuriran',
        ToastAndroid.SHORT
      );
      setCurrentNativeScreen('profile');
    } catch (error) {
      ToastAndroid.show(
        error.message || 'Greška pri spremanju profila',
        ToastAndroid.LONG
      );
    }
  };

  const refreshMonitoring = useCallback(async () => {
    try {
      setMonitoringLoading(true);
      setMonitoringError('');

      const json = await apiRequest('/agro/meteo', { method: 'GET' }, authToken);

      if (!json?.success) {
        throw new Error(json?.message || 'Ne mogu dohvatiti AgroMeteo podatke');
      }

      const normalized = normalizeAgroMeteoPayload(json);

      const payload = {
        ...json,
        ...normalized,
        meteo: {
          ...(json?.meteo || {}),
          ...(normalized?.meteo || {}),
        },
        weather: {
          ...(json?.weather || {}),
          ...(normalized?.weather || {}),
        },
        climate: normalized?.climate || json?.climate || null,
        location: normalized?.location || json?.location || null,
        alerts:
          normalized?.alerts ||
          json?.alerts ||
          json?.meteo?.alerts ||
          json?.weather?.alerts ||
          [],
      };

      await saveMonitoring(payload);
    } catch (error) {
      console.log('AgroMeteo fetch error:', error?.message || error);
      setMonitoringError('Ne mogu dohvatiti AgroMeteo podatke');
      ToastAndroid.show(
        'Greška pri dohvaćanju AgroMeteo podataka',
        ToastAndroid.SHORT
      );
    } finally {
      setMonitoringLoading(false);
    }
  }, [authToken]);

    useEffect(() => {
    if (currentNativeScreen === 'monitoring' && isLoggedIn && authToken) {
      refreshMonitoring();
    }
  }, [currentNativeScreen, isLoggedIn, authToken, refreshMonitoring]);

  const openNativeScreen = async (screenName, title = '') => {
    if (!isLoggedIn) {
      ToastAndroid.show('Prvo se prijavite', ToastAndroid.SHORT);
      return;
    }

    setMenuVisible(false);
    setSelectedModule(null);
    setCurrentNativeScreen(screenName);
    
    if (screenName !== 'oglasDetalj') {
  setSelectedOglasId(null);
}
    if (screenName === 'postAd') {
  setAdTitle('');
  setAdDescription('');
  setAdCategory('');
  setAdParentCategory('');
  setAdChildCategory('');
  setAdPrice('');
  setAdCondition('');
  setAdPriceOnRequest(false);
  setAdFeaturedImage(null);
  setAdGallery1(null);
  setAdGallery2(null);
  setAdGallery3(null);

  setAdLocation(profileData.location || '');
  setAdZupanija(profileData.zupanija || '');
  setAdPlaceFocused(false);

  loadAdCategories();
}
if (screenName === 'myAds') {
  loadMyAds();
}

if (screenName === 'favoriti') {
  loadMyAds();
}

    await saveLastOpenedModule({
      key: screenName,
      title: title || screenName,
      native: true,
      nativeScreen: screenName,
      emoji:
        screenName === 'profile'
          ? '👤'
          : screenName === 'monitoring'
          ? '🌦️'
          : screenName === 'postAd'
          ? '📢'
          : '↗️',
    });
  };

const openSellerAds = (sellerId, sellerName = '') => {
  setMenuVisible(false);
  setSelectedModule(null);
  setSelectedSellerId(sellerId);
  setSelectedSellerName(sellerName);
  setCurrentNativeScreen('sellerAds');
};

const openOglasnikLista = async () => {
  setMenuVisible(false);
  setSelectedModule(null);
  setSelectedOglasId(null);
  setCurrentNativeScreen('oglasnikLista');

  await saveLastOpenedModule({
    key: 'oglasnik',
    title: 'Oglasnik',
    native: true,
    nativeScreen: 'oglasnikLista',
    emoji: '📦',
  });
};



const openOglasDetalj = (oglasId) => {
  setMenuVisible(false);
  setSelectedModule(null);
  setSelectedOglasId(oglasId);
  setCurrentNativeScreen('oglasDetalj');
};

  const openModule = async (module) => {
    setMenuVisible(false);

    if (!isLoggedIn) {
      ToastAndroid.show('Prvo se prijavite', ToastAndroid.SHORT);
      return;
    }

    if (
      !licenseData.license_active &&
      PREMIUM_LOCKED_KEYS.includes(module.key)
    ) {
      ToastAndroid.show(
        'Licenca je istekla. Produžite licencu za pristup AB+ modulu.',
        ToastAndroid.LONG
      );
      return;
    }

    if (module.native && module.nativeScreen) {
      await openNativeScreen(module.nativeScreen, module.title);
      return;
    }

    setCurrentNativeScreen(null);
    setModuleLoading(true);
    setSelectedModule(module);

    if (module?.key === 'agronet') {
      setShowAgronetNotice(true);
    } else {
      setShowAgronetNotice(false);
    }

    await saveLastOpenedModule(module);
  };

  const toggleFavorite = async (moduleKey) => {
    const exists = favoriteKeys.includes(moduleKey);
    const updated = exists
      ? favoriteKeys.filter((key) => key !== moduleKey)
      : [...favoriteKeys, moduleKey];

    await saveFavoriteKeys(updated);

    ToastAndroid.show(
      exists ? 'Uklonjeno iz favorita' : 'Dodano u favorite',
      ToastAndroid.SHORT
    );
  };

  const handleMenuPress = (item) => {
    if (item.type === 'home') {
      setSelectedModule(null);
      setCurrentNativeScreen(null);
      setMenuVisible(false);
      return;
    }

    if (item.type === 'module') {
      const module = modules.find((m) => m.key === item.key);
      if (module) openModule(module);
      return;
    }

    if (item.type === 'native') {
      openNativeScreen(item.nativeScreen, item.title);
    }
  };

  const handleQuickAction = (action) => {
    if (action.type === 'module') {
      const module = modules.find((m) => m.key === action.key);
      if (module) openModule(module);
      return;
    }

    if (action.type === 'native') {
      openNativeScreen(action.nativeScreen, action.title);
    }
  };


const getAdCategoryEmoji = (name = '') => (
  name === 'Mehanizacija' ? '🚜' :
  name === 'Biljna proizvodnja' ? '🌾' :
  name === 'Voće i povrće' ? '🥕' :
  name === 'Stočarstvo' ? '🐄' :
  name === 'Hrana i pića' ? '🍯' :
  name === 'Tehnika za pakiranje i ambalaže' ? '📦' :
  name === 'Poljoprivredno zemljište' ? '🌍' :
  name === 'Oprema i materijali' ? '🧰' :
  name === 'Usluge i ostalo' ? '🛠️' :
  '👉'
);

const buildMainCategoryOptions = (categories = []) => {
  return categories
    .filter((cat) => Number(cat.parent) === 0)
    .map((cat) => ({
      value: String(cat.id),
      label: cat.name,
      emoji: getAdCategoryEmoji(cat.name),
    }));
};

const loadAdCategories = async (force = false) => {
  if (!force && adCategories.length) return adCategories;

  try {
    setCategoriesLoading(true);

    const data = await apiRequest('/ads/categories', { method: 'GET' });

    const items = data.items || [];
    setAdCategories(items);
    return items;
  } catch (e) {
    ToastAndroid.show('Ne mogu dohvatiti kategorije', ToastAndroid.SHORT);
    return adCategories;
  } finally {
    setCategoriesLoading(false);
  }
};

const loadMyAds = async () => {
  try {
    setMyAdsLoading(true);
    setMyAdsError('');

    const data = await apiRequest('/ads/my', { method: 'GET' }, authToken);

    setMyAds(Array.isArray(data.items) ? data.items : []);
  } catch (e) {
    setMyAdsError(e.message || 'Ne mogu dohvatiti oglase');
    ToastAndroid.show(
      e.message || 'Ne mogu dohvatiti oglase',
      ToastAndroid.SHORT
    );
  } finally {
    setMyAdsLoading(false);
  }
};

const loadSingleAdForEdit = async (adId) => {
  try {
    setEditingAdLoading(true);

    setAdFeaturedImage(null);
setAdGallery1(null);
setAdGallery2(null);
setAdGallery3(null);

    const data = await apiRequest(
      `/ads/single?ad_id=${adId}`,
      { method: 'GET' },
      authToken
    );

    const item = data?.item;
    if (!item) {
      throw new Error('Oglas nije pronađen');
    }

    setEditingAdId(item.id);
setAdTitle(item.title || '');
setAdDescription(item.content || '');
setAdPrice(item.price || '');
setAdCondition(item.condition || '');
setAdLocation(item.location || profileData.location || '');
setAdPlaceFocused(false);
setAdZupanija(
  typeof item.zupanija === 'object'
    ? item.zupanija?.value || ''
    : item.zupanija || profileData.zupanija || ''
);
setAdPriceOnRequest(item.price_on_request === '1');

    const categoryId = item.category?.id ? String(item.category.id) : '';
    const parentId = item.category?.parent ? String(item.category.parent) : '';

    if (parentId) {
      setAdParentCategory(parentId);
      setAdChildCategory(categoryId);
      setAdCategory(categoryId);
    } else {
      setAdParentCategory(categoryId);
      setAdChildCategory('');
      setAdCategory(categoryId);
    }

    await loadAdCategories();
    setCurrentNativeScreen('editAd');
  } catch (e) {
    ToastAndroid.show(
      e.message || 'Ne mogu otvoriti oglas za uređivanje',
      ToastAndroid.LONG
    );
  } finally {
    setEditingAdLoading(false);
  }
};

const handleDeleteAd = async (adId) => {
  try {
    const data = await apiRequest(
      '/ads/delete',
      {
        method: 'POST',
        body: JSON.stringify({
          ad_id: adId,
        }),
      },
      authToken
    );

    ToastAndroid.show(
      data?.message || 'Oglas obrisan',
      ToastAndroid.SHORT
    );

    await loadMyAds();
  } catch (e) {
    ToastAndroid.show(
      e.message || 'Brisanje oglasa nije uspjelo',
      ToastAndroid.LONG
    );
  }
};

const parentAdCategories = useMemo(() => {
  return adCategories.filter((cat) => Number(cat.parent) === 0);
}, [adCategories]);

const childAdCategories = useMemo(() => {
  if (!adParentCategory) return [];

  return adCategories.filter(
    (cat) => Number(cat.parent) === Number(adParentCategory)
  );
}, [adCategories, adParentCategory]);

const mainCategoryOptions = useMemo(() => {
  return buildMainCategoryOptions(adCategories);
}, [adCategories]);

const childCategoryOptions = useMemo(() => {
  if (!adParentCategory) return [];

  return adCategories
    .filter((cat) => String(cat.parent) === String(adParentCategory))
    .map((cat) => ({
      value: String(cat.id),
      label: cat.name,
    }));
}, [adCategories, adParentCategory]);

const selectedAdZupanijaLabel = useMemo(() => {
  if (!adZupanija) return 'Odaberi';

  if (typeof adZupanija === 'object') {
    return adZupanija.label || 'Odaberi';
  }

  const found = ZUPANIJE.find((z) => z.value === adZupanija);
  return found?.label || adZupanija;
}, [adZupanija]);

const selectedEditAdZupanijaLabel = useMemo(() => {
  if (!adZupanija) return 'Odaberi';

  if (typeof adZupanija === 'object') {
    return adZupanija.label || 'Odaberi';
  }

  const found = ZUPANIJE.find((z) => z.value === adZupanija);
  return found?.label || adZupanija;
}, [adZupanija]);


const closePicker = () => {
  setPickerVisible(false);
  setPickerTitle('');
  setPickerItems([]);
  setPickerValue('');
  setPickerType('');
  setPickerValues([]);
  pickerOnSelectRef.current = null;
};

const openPicker = ({ title, items, value, type, onSelect }) => {
  setPickerTitle(title);
  setPickerItems(items);
  setPickerValue(value ?? '');
  setPickerType(type);
  setPickerValues(Array.isArray(value) ? value : []);
  pickerOnSelectRef.current = onSelect || null;
  setPickerVisible(true);
};

const openMainCategoryPicker = async () => {
  const options = mainCategoryOptions.length
    ? mainCategoryOptions
    : buildMainCategoryOptions(await loadAdCategories());

  if (!options.length) {
    ToastAndroid.show('Kategorije još nisu dostupne', ToastAndroid.SHORT);
    return;
  }

  openPicker({
    title: 'Odaberi',
    items: options,
    value: adParentCategory,
    type: 'parentCategory',
  });
};

const handlePickerSelect = (item) => {
  if (pickerOnSelectRef.current) {
    pickerOnSelectRef.current(item);
    closePicker();
    return;
  }

  if (pickerType === 'condition') {
    setAdCondition(item.value);
  }

  if (pickerType === 'parentCategory') {
    setAdParentCategory(item.value);
    setAdChildCategory('');
    setAdCategory(item.value);
  }

  if (pickerType === 'childCategory') {
    setAdChildCategory(item.value);
    setAdCategory(item.value);
  }

  if (pickerType === 'zupanija') {
    setAdZupanija(item.value);
  }

  if (pickerType === 'activities') {
    setPickerValues((prev) =>
      prev.includes(item.value)
        ? prev.filter((value) => value !== item.value)
        : [...prev, item.value]
    );
    return;
  }

  closePicker();
};

const handleUpdateAd = async () => {
  try {
    if (!editingAdId) {
      ToastAndroid.show('Oglas nije odabran', ToastAndroid.SHORT);
      return;
    }

    if (!adTitle.trim() || !adDescription.trim() || !adCategory) {
      ToastAndroid.show(
        'Popuni naslov, opis i kategoriju',
        ToastAndroid.SHORT
      );
      return;
    }

    const formData = new FormData();
formData.append('ad_id', String(editingAdId));
formData.append('title', adTitle);
formData.append('description', adDescription);
formData.append('price', adPriceOnRequest ? 'Na upit' : adPrice);
formData.append('term_id', adCategory);
formData.append('condition', adCondition);
formData.append('location', adLocation);
formData.append(
  'zupanija',
  typeof adZupanija === 'object' ? adZupanija?.value || '' : adZupanija
);
formData.append('price_on_request', adPriceOnRequest ? '1' : '0');

if (adFeaturedImage?.uri) {
  formData.append('featured_image', {
    uri: adFeaturedImage.uri,
    name: adFeaturedImage.fileName || 'featured.jpg',
    type: adFeaturedImage.mimeType || 'image/jpeg',
  });
}

if (adGallery1?.uri) {
  formData.append('gallery_1', {
    uri: adGallery1.uri,
    name: adGallery1.fileName || 'gallery1.jpg',
    type: adGallery1.mimeType || 'image/jpeg',
  });
}

if (adGallery2?.uri) {
  formData.append('gallery_2', {
    uri: adGallery2.uri,
    name: adGallery2.fileName || 'gallery2.jpg',
    type: adGallery2.mimeType || 'image/jpeg',
  });
}

if (adGallery3?.uri) {
  formData.append('gallery_3', {
    uri: adGallery3.uri,
    name: adGallery3.fileName || 'gallery3.jpg',
    type: adGallery3.mimeType || 'image/jpeg',
  });
}

    const data = await apiRequest(
      '/ads/update',
      {
        method: 'POST',
        body: formData,
      },
      authToken
    );

    ToastAndroid.show(
      data?.message || 'Oglas ažuriran',
      ToastAndroid.SHORT
    );

    setEditingAdId(null);
setAdTitle('');
setAdDescription('');
setAdPrice('');
setAdCondition('');
setAdPriceOnRequest(false);
setAdLocation(profileData.location || '');
setAdZupanija(profileData.zupanija || '');
setAdPlaceFocused(false);
setAdCategory('');
setAdParentCategory('');
setAdChildCategory('');

    await loadMyAds();
    setCurrentNativeScreen('myAds');
  } catch (e) {
    ToastAndroid.show(
      e.message || 'Ažuriranje oglasa nije uspjelo',
      ToastAndroid.LONG
    );
  }
};


  const handleShareMyAd = async (item) => {
    try {
      const shareText = item?.permalink
        ? `${item?.title || 'Oglas'}${item?.price ? ` - ${item.price} €` : item?.price_on_request === '1' ? ' - Na upit' : ''}
${item.permalink}`
        : `${item?.title || 'Oglas'}${item?.price ? ` - ${item.price} €` : item?.price_on_request === '1' ? ' - Na upit' : ''}`;

      await Share.share({
        message: shareText,
        url: item?.permalink || undefined,
      });
    } catch (error) {
      console.log('Greška share my ad:', error?.message || error);
    }
  };

  const handleLogout = async () => {
    try {
      if (authToken) {
        await apiRequest('/logout', { method: 'POST' }, authToken);
      }
    } catch (e) {
      console.log('Logout warning:', e?.message || e);
    }

    await clearSession();
    setAuthToken('');
    setSsoToken(null);
    setSsoReady(false);
    setIsLoggedIn(false);
    setSelectedModule(null);
    setShowAgronetNotice(false);
    setCurrentNativeScreen(null);
    setLoginPassword('');
    setLicenseData(getDefaultLicense());
    ToastAndroid.show('Odjavljeni ste', ToastAndroid.SHORT);
  };

const pickImage = async (field) => {

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      ToastAndroid.show('Dopusti pristup galeriji', ToastAndroid.SHORT);
      return;
    }

    const isCover = field === 'cover_photo';

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: isCover ? [15, 9] : [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.length) {
      setRegisterData((prev) => ({
        ...prev,
        [field]: result.assets[0],
      }));
    }
  };

const pickEditProfileImage = async (field) => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    ToastAndroid.show('Dopusti pristup galeriji', ToastAndroid.SHORT);
    return;
  }

  const isCover = field === 'cover_photo';
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: isCover ? [15, 9] : [1, 1],
    quality: 0.85,
  });

  if (!result.canceled && result.assets?.length) {
    if (field === 'profile_photo') setEditProfilePhoto(result.assets[0]);
    if (field === 'cover_photo') setEditCoverPhoto(result.assets[0]);
  }
};

const pickAdImage = async (field) => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    ToastAndroid.show('Dopusti pristup galeriji', ToastAndroid.SHORT);
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.85,
  });

  if (!result.canceled && result.assets?.length) {
    const image = result.assets[0];

    if (field === 'featured_image') setAdFeaturedImage(image);
    if (field === 'gallery_1') setAdGallery1(image);
    if (field === 'gallery_2') setAdGallery2(image);
    if (field === 'gallery_3') setAdGallery3(image);
  }
};

  const toggleRegisterActivity = (value) => {
    setRegisterData((prev) => {
      const exists = prev.a_odaberite_vase_djelatnosti.includes(value);
      return {
        ...prev,
        a_odaberite_vase_djelatnosti: exists
          ? prev.a_odaberite_vase_djelatnosti.filter((item) => item !== value)
          : [...prev.a_odaberite_vase_djelatnosti, value],
      };
    });
  };

  const toggleProfileActivity = (value) => {
    setProfileData((prev) => {
      const exists = prev.djelatnosti.includes(value);
      return {
        ...prev,
        djelatnosti: exists
          ? prev.djelatnosti.filter((item) => item !== value)
          : [...prev.djelatnosti, value],
      };
    });
  };

  const selectRegisterPlace = (placeObj) => {
    setRegisterData((prev) => ({
      ...prev,
      a_mjesto: placeObj.name,
      a_zupanija: placeObj.county || prev.a_zupanija || '',
    }));
    setMjestoQuery(placeObj.name);
    setRegisterPlaceFocused(false);
  };

  const selectEditPlace = (placeObj) => {
    setProfileData((prev) => ({
      ...prev,
      location: placeObj.name,
      zupanija: placeObj.county || prev.zupanija || '',
    }));
    setEditMjestoQuery(placeObj.name);
    setEditPlaceFocused(false);
  };

  const selectAdPlace = (placeObj) => {
    setAdLocation(placeObj.name);
    setAdZupanija(placeObj.county || '');
    setAdPlaceFocused(false);
  };


  const handleRenewLicense = async () => {
    const renewUrl = licenseData?.renew_url;
    if (!renewUrl) {
      ToastAndroid.show(
        'Link za produženje licence nije dostupan',
        ToastAndroid.SHORT
      );
      return;
    }
    const supported = await Linking.canOpenURL(renewUrl);
    if (supported) {
      await Linking.openURL(renewUrl);
    } else {
      ToastAndroid.show(
        'Ne mogu otvoriti zahtjev za produženje',
        ToastAndroid.SHORT
      );
    }
  };

  const renderLicenseBanner = () => (
    <LicenseBanner
      isLoggedIn={isLoggedIn}
      licenseData={licenseData}
      onRenew={handleRenewLicense}
      styles={styles}
    />
  );

  const renderTopBar = (title = 'ab.hr') => {
  const showBack = selectedModule || currentNativeScreen;

  return (
    <AppTopBar
      title={title}
      menuVisible={menuVisible}
      setMenuVisible={setMenuVisible}
      menuItems={menuItems}
      onMenuPress={handleMenuPress}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
      styles={styles}

      // 👉 NOVO
      showBack={showBack}
      onBack={() => {
        if (selectedModule && webCanGoBackRef.current && webRef.current) {
          webRef.current.goBack();
          return;
        }

        if (selectedModule) {
          setSelectedModule(null);
          setShowAgronetNotice(false);
          return;
        }

        if (currentNativeScreen) {
          setCurrentNativeScreen(null);
          return;
        }
      }}
    />
  );
};

  const renderBottomPicker = () => (
    <BottomPicker
      visible={pickerVisible}
      title={pickerTitle}
      items={pickerItems}
      type={pickerType}
      selectedValue={pickerValue}
      selectedValues={pickerValues}
      onClose={closePicker}
      onSelect={handlePickerSelect}
      onDone={() => {
        setRegisterData((prev) => ({
          ...prev,
          a_odaberite_vase_djelatnosti: pickerValues,
        }));
        closePicker();
      }}
      styles={styles}
    />
  );

  const renderPickerField = (label, selectedValue, onChange, items = []) => {
    const lowerLabel = label.toLowerCase();
    const isCountyField = lowerLabel.includes('upanij');
    const emoji =
      lowerLabel === 'bazu'
        ? '🗃️'
        : lowerLabel === 'organizacijski oblik'
        ? '🏢'
        : isCountyField
        ? '📍'
        : '🧩';


    const pickerOptions =
      isCountyField
        ? ZUPANIJE.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        : (items || []).map((item) => ({
            value: item,
            label: item,
            emoji,
          }));

    const selectedLabel =
      isCountyField
        ? ZUPANIJE.find((item) => item.value === selectedValue)?.label || `Odaberi ${lowerLabel}`
        : selectedValue || `Odaberi ${lowerLabel}`;

    return (
      <View style={styles.pickerWrap}>
        <Text style={styles.fieldLabel}>{label}</Text>

        <TouchableOpacity
          style={styles.filterSelectButton}
          onPress={() =>
            openPicker({
              title: `Odaberi ${lowerLabel}`,
              items: pickerOptions,
              value: selectedValue,
              type: isCountyField ? 'register_zupanija' : 'generic',
              onSelect: (option) => onChange(option?.value ?? ''),
            })
          }
          activeOpacity={0.9}>
          {!isCountyField ? <Text style={styles.filterSelectEmoji}>{emoji}</Text> : null}
          <Text style={styles.filterSelectText}>
            {selectedLabel}
          </Text>
          <Text style={styles.filterSelectArrow}>˅</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRegisterActivitySelect = () => (
    <View style={styles.pickerWrap}>
      <Text style={styles.fieldLabel}>Djelatnosti</Text>

      <TouchableOpacity
        style={styles.filterSelectButton}
        onPress={() =>
          openPicker({
            title: 'Odaberi djelatnosti',
            items: registerOptions.a_odaberite_vase_djelatnosti.map((item) => ({
              value: item,
              label: item,
              emoji: getActivityEmoji(item),
            })),
            value: registerData.a_odaberite_vase_djelatnosti,
            type: 'activities',
          })
        }
        activeOpacity={0.9}>
        <Text style={styles.filterSelectEmoji}>🌱</Text>
        <Text style={styles.filterSelectText}>
          {registerData.a_odaberite_vase_djelatnosti.length
            ? `Odabrano: ${registerData.a_odaberite_vase_djelatnosti.length}`
            : 'Odaberi jednu ili više djelatnosti'}
        </Text>
        <Text style={styles.filterSelectArrow}>˅</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRegisterPlaceSearch = () => (
    <View style={styles.pickerWrap}>
      <Text style={styles.fieldLabel}>Grad, Općina</Text>

      <TextInput
        style={styles.input}
        placeholder="🔎 Upiši barem 2 slova mjesta"
        placeholderTextColor="#94a3b8"
        value={mjestoQuery}
        onChangeText={(text) => {
          setMjestoQuery(text);
          setRegisterPlaceFocused(true);
        }}
        onFocus={() => setRegisterPlaceFocused(true)}
      />

      {registerData.a_mjesto ? (
        <View style={styles.selectedPlaceBoxRow}>
          <Text style={styles.selectedPlaceText}>📍 Odabrano: {registerData.a_mjesto}</Text>

          <TouchableOpacity
            onPress={() => {
              setRegisterData((prev) => ({ ...prev, a_mjesto: '' }));
              setMjestoQuery('');
              setRegisterPlaceFocused(false);
            }}
            style={styles.selectedPlaceClear}
            activeOpacity={0.8}>
            <Text style={styles.selectedPlaceClearText}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {registerPlaceFocused && mjestoQuery.trim().length >= 2 ? (
        <View style={styles.placeListBox}>
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="always" style={{ maxHeight: 220 }}>
            {filteredRegisterMjesta.length ? (
              filteredRegisterMjesta.map((item) => (
                <TouchableOpacity
                  key={`${item.name}-${item.county}`}
                  style={styles.placeItem}
                  onPressIn={() => selectRegisterPlace(item)}
                  activeOpacity={0.85}>
                  <Text style={styles.placeItemText}>{item.name}</Text>
                  {!!item.county && <Text style={styles.placeCountyText}>{item.county}</Text>}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.placeEmptyState}>
                <Text style={styles.placeEmptyStateText}>Nema rezultata za upisano mjesto.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );

  const renderEditPlaceSearch = () => (
    <View style={styles.pickerWrap}>
      <Text style={styles.fieldLabel}>Mjesto</Text>

      <TextInput
        style={styles.input}
        placeholder="🔎 Upiši barem 2 slova mjesta"
        placeholderTextColor="#94a3b8"
        value={editMjestoQuery}
        onChangeText={setEditMjestoQuery}
        onFocus={() => setEditPlaceFocused(true)}
        onBlur={() => setTimeout(() => setEditPlaceFocused(false), 180)}
      />

      {profileData.location ? (
        <View style={styles.selectedPlaceBox}>
          <Text style={styles.selectedPlaceText}>
             Odabrano: {profileData.location}
          </Text>
        </View>
      ) : null}

      {editPlaceFocused && editMjestoQuery.trim().length >= 2 ? (
        <View style={styles.placeListBox}>
          <ScrollView
  nestedScrollEnabled
  keyboardShouldPersistTaps="always"
  style={{ maxHeight: 220 }}>
            {filteredEditMjesta.length ? (
              filteredEditMjesta.map((item) => (
                <TouchableOpacity
                  key={`${item.name}-${item.county}`}
                  style={styles.placeItem}
                  onPressIn={() => selectEditPlace(item)}
                  activeOpacity={0.85}>
                  <Text style={styles.placeItemText}> {item.name}</Text>
                  {!!item.county && (
                    <Text style={styles.placeCountyText}>{item.county}</Text>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.placeEmptyState}>
                <Text style={styles.placeEmptyStateText}>Nema rezultata za upisano mjesto.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );

  const renderAdPlaceSearch = () => (
    <View style={styles.pickerWrap}>
      <Text style={styles.fieldLabel}>Lokacija</Text>

      <TextInput
        style={styles.input}
        placeholder="Upiši barem 2 slova mjesta"
        placeholderTextColor="#94a3b8"
        value={adLocation}
        onChangeText={(text) => {
          setAdLocation(text);
          setAdPlaceFocused(true);
        }}
        onFocus={() => setAdPlaceFocused(true)}
        onBlur={() => setTimeout(() => setAdPlaceFocused(false), 180)}
      />

      {adLocation ? (
        <View style={styles.selectedPlaceBoxRow}>
          <Text style={styles.selectedPlaceText}>Odabrano: {adLocation}</Text>
          <TouchableOpacity
            onPress={() => {
              setAdLocation('');
              setAdZupanija('');
              setAdPlaceFocused(false);
            }}
            style={styles.selectedPlaceClear}
            activeOpacity={0.8}
          >
            <Text style={styles.selectedPlaceClearText}>×</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {adPlaceFocused && adLocation.trim().length >= 2 ? (
        <View style={styles.placeListBox}>
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="always" style={{ maxHeight: 220 }}>
            {filteredAdMjesta.length ? (
              filteredAdMjesta.map((item) => (
                <TouchableOpacity
                  key={`${item.name}-${item.county}`}
                  style={styles.placeItem}
                  onPressIn={() => selectAdPlace(item)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.placeItemText}>{item.name}</Text>
                  {!!item.county && <Text style={styles.placeCountyText}>{item.county}</Text>}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.placeEmptyState}>
                <Text style={styles.placeEmptyStateText}>Nema rezultata za upisano mjesto.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );


const currentRegisterStepMeta =
  registerStepMeta.find((item) => item.id === registerStep) || registerStepMeta[0];

const selectedRegisterActivityLabels = useMemo(() => {
  return registerData.a_odaberite_vase_djelatnosti || [];
}, [registerData.a_odaberite_vase_djelatnosti]);

const canGoNextRegisterStep = useMemo(() => {
  if (registerStep === 1) return !!registerData.package_id;
  if (registerStep === 2) {
    return !!(
      registerData.first_name?.trim() &&
      registerData.last_name?.trim() &&
      registerData.email?.trim() &&
      registerData.password?.trim() &&
      registerData.phone_number?.trim()
    );
  }
  if (registerStep === 3) {
    return !!(
      registerData.a_naziv_gospodarstva?.trim() &&
      registerData.a_izaberite_bazu?.trim() &&
      registerData.a_daberite_organizacijski_oblik?.trim()
    );
  }
  if (registerStep === 4) {
    return !!(
      registerData.a_zupanija?.trim() &&
      registerData.a_mjesto?.trim() &&
      registerData.a_odaberite_vase_djelatnosti?.length
    );
  }
  return false;
}, [registerStep, registerData]);

const goToNextRegisterStep = () => {
  if (registerStep === 1 && !registerData.package_id) {
    ToastAndroid.show('Odaberi paket za nastavak', ToastAndroid.SHORT);
    return;
  }

  if (
    registerStep === 2 &&
    !(
      registerData.first_name?.trim() &&
      registerData.last_name?.trim() &&
      registerData.email?.trim() &&
      registerData.password?.trim() &&
      registerData.phone_number?.trim()
    )
  ) {
    ToastAndroid.show('Ispuni osnovne podatke za nastavak', ToastAndroid.SHORT);
    return;
  }

  if (
    registerStep === 3 &&
    !(
      registerData.a_naziv_gospodarstva?.trim() &&
      registerData.a_izaberite_bazu?.trim() &&
      registerData.a_daberite_organizacijski_oblik?.trim()
    )
  ) {
    ToastAndroid.show('Dovrši podatke o gospodarstvu', ToastAndroid.SHORT);
    return;
  }

  if (
    registerStep === 4 &&
    !(
      registerData.a_zupanija?.trim() &&
      registerData.a_mjesto?.trim() &&
      registerData.a_odaberite_vase_djelatnosti?.length
    )
  ) {
    ToastAndroid.show('Odaberi lokaciju i barem jednu djelatnost', ToastAndroid.SHORT);
    return;
  }

  setRegisterStep((prev) => Math.min(prev + 1, 4));
};

const goToPrevRegisterStep = () => {
  setRegisterStep((prev) => Math.max(prev - 1, 1));
};

const renderRegisterStepProgress = () => (
  <View style={styles.registerStepProgressWrap}>
    {registerStepMeta.map((step) => {
      const active = step.id === registerStep;
      const done = step.id < registerStep;

      return (
        <View key={step.id} style={styles.registerStepProgressItem}>
          <View
            style={[
              styles.registerStepProgressDot,
              active && styles.registerStepProgressDotActive,
              done && styles.registerStepProgressDotDone,
            ]}>
            <Text
              style={[
                styles.registerStepProgressDotText,
                (active || done) && styles.registerStepProgressDotTextActive,
              ]}>
              {done ? '✓' : step.id}
            </Text>
          </View>
          <Text
            style={[
              styles.registerStepProgressLabel,
              active && styles.registerStepProgressLabelActive,
            ]}>
            {step.title}
          </Text>
        </View>
      );
    })}
  </View>
);

const renderRegisterSummaryBadges = () => (
  <View style={styles.registerSummaryWrap}>
    {registerData.package_id ? (
      <View style={styles.registerSummaryBadge}>
        <Text style={styles.registerSummaryBadgeText}>📦 Paket odabran</Text>
      </View>
    ) : null}
    {registerData.a_mjesto ? (
      <View style={styles.registerSummaryBadge}>
        <Text style={styles.registerSummaryBadgeText}>📍 {registerData.a_mjesto}</Text>
      </View>
    ) : null}
    {selectedRegisterActivityLabels.length ? (
      <View style={styles.registerSummaryBadge}>
        <Text style={styles.registerSummaryBadgeText}>
          🌱 {selectedRegisterActivityLabels.length} djelatnosti
        </Text>
      </View>
    ) : null}
  </View>
);
const renderRegisterStepContent = () => {
  if (registerStep === 1) {
    return (
      <>
        <Text style={styles.fieldLabel}>Paket</Text>

        {packagesLoading ? (
          <ActivityIndicator
            size="small"
            color="#7FA52A"
            style={{ marginBottom: 12 }}
          />
        ) : (
          <View style={styles.registerPackageGrid}>
            {packages.map((pkg) => {
              const isActive =
                String(registerData.package_id) === String(pkg.id);

              const packageName = String(pkg.name || '').trim();
              const packageNameLower = packageName.toLowerCase();

              let packageHint = 'Korisnici od 10ha do 30ha';
              let packageBadge = 'Isprobajte mjesec dana besplatno';

              if (/mini/i.test(packageNameLower)) {
                packageHint = 'Korisnici do 10ha';
                packageBadge = 'Trajno besplatno';
              } else if (/brand/i.test(packageNameLower)) {
                packageHint = 'Korisnici preko 30ha, Korisnici AgroBiznis baze';
              } else if (/konzultant/i.test(packageNameLower)) {
                packageHint = 'Proširite svoje poslovanje u AgroBiznis bazi';
              } else if (/hit/i.test(packageNameLower)) {
                packageHint = 'Korisnici od 10ha do 30ha';
              }

              return (
                <TouchableOpacity
                  key={pkg.id}
                  style={[
                    styles.registerPremiumCard,
                    isActive && styles.registerPremiumCardActive,
                  ]}
                  onPress={() =>
                    setRegisterData((prev) => ({
                      ...prev,
                      package_id: String(pkg.id),
                    }))
                  }
                  activeOpacity={0.9}>
                  <Text style={styles.registerPremiumCardTitle}>
                    {pkg.name}
                  </Text>

                  <View style={styles.registerPremiumPriceRow}>
                    <Text style={styles.registerPremiumCardPrice}>
                      {pkg.price} €
                    </Text>

                    <View style={styles.registerPremiumRibbon}>
                      <Text style={styles.registerPremiumRibbonText}>
                        {packageBadge}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.registerPremiumCardHint}>
                    {packageHint}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </>
    );
  }



  if (registerStep === 2) {
    return (
      <>
        <TextInput
          style={styles.input}
          placeholder="Ime"
          placeholderTextColor="#94a3b8"
          value={registerData.first_name}
          onChangeText={(text) => setRegisterData((prev) => ({ ...prev, first_name: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Prezime"
          placeholderTextColor="#94a3b8"
          value={registerData.last_name}
          onChangeText={(text) => setRegisterData((prev) => ({ ...prev, last_name: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          value={registerData.email}
          onChangeText={(text) => setRegisterData((prev) => ({ ...prev, email: text }))}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Lozinka"
          placeholderTextColor="#94a3b8"
          value={registerData.password}
          onChangeText={(text) => setRegisterData((prev) => ({ ...prev, password: text }))}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Telefon"
          placeholderTextColor="#94a3b8"
          value={registerData.phone_number}
          onChangeText={(text) => setRegisterData((prev) => ({ ...prev, phone_number: text }))}
        />
      </>
    );
  }

  if (registerStep === 3) {
    return (
      <>
        <TextInput
          style={styles.input}
          placeholder="Naziv gospodarstva"
          placeholderTextColor="#94a3b8"
          value={registerData.a_naziv_gospodarstva}
          onChangeText={(text) =>
            setRegisterData((prev) => ({
              ...prev,
              a_naziv_gospodarstva: text,
            }))
          }
        />

        {optionsLoading ? (
          <ActivityIndicator size="small" color="#7FA52A" style={{ marginVertical: 10 }} />
        ) : (
          <>
            {renderPickerField(
              'bazu',
              registerData.a_izaberite_bazu,
              (value) => setRegisterData((prev) => ({ ...prev, a_izaberite_bazu: value })),
              registerOptions.a_izaberite_bazu
            )}

            {renderPickerField(
              'organizacijski oblik',
              registerData.a_daberite_organizacijski_oblik,
              (value) =>
                setRegisterData((prev) => ({
                  ...prev,
                  a_daberite_organizacijski_oblik: value,
                })),
              registerOptions.a_daberite_organizacijski_oblik
            )}
          </>
        )}
        
        <TextInput
          style={styles.input}
          placeholder="MIBPG"
          placeholderTextColor="#94a3b8"
          value={registerData.a_mibpg}
          onChangeText={(text) => setRegisterData((prev) => ({ ...prev, a_mibpg: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="OIB"
          placeholderTextColor="#94a3b8"
          value={registerData.a_oib}
          onChangeText={(text) => setRegisterData((prev) => ({ ...prev, a_oib: text }))}
        />
        
        <TextInput
          style={styles.input}
          placeholder="JIBG"
          placeholderTextColor="#94a3b8"
          value={registerData.a_ibk}
          onChangeText={(text) => setRegisterData((prev) => ({ ...prev, a_ibk: text }))}
        />
      </>
    );
  }

  return (
    <>
      {optionsLoading ? (
        <ActivityIndicator size="small" color="#7FA52A" style={{ marginVertical: 10 }} />
      ) : (
        <>
          {renderPickerField(
            'županiju',
            registerData.a_zupanija,
            (value) => setRegisterData((prev) => ({ ...prev, a_zupanija: value })),
            registerOptions.a_zupanija
          )}

          {renderRegisterPlaceSearch()}
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Mjesto, adresa"
        placeholderTextColor="#94a3b8"
        value={registerData.a_adresa}
        onChangeText={(text) => setRegisterData((prev) => ({ ...prev, a_adresa: text }))}
      />

      {renderRegisterActivitySelect()}

      <View style={styles.checkboxRow}>
  <TouchableOpacity
    style={[
      styles.checkboxBox,
      registerData.a_zelim_aplikaciju === '1' && styles.checkboxBoxActive,
    ]}
    onPress={() =>
      setRegisterData((prev) => ({
        ...prev,
        a_zelim_aplikaciju: prev.a_zelim_aplikaciju === '1' ? '0' : '1',
      }))
    }
    activeOpacity={0.8}>
    {registerData.a_zelim_aplikaciju === '1' ? (
      <Text style={styles.checkboxTick}>✓</Text>
    ) : null}
  </TouchableOpacity>

  <Text style={styles.checkboxLabel}>📲 Želim AB+ aplikaciju</Text>
</View>

      {selectedRegisterActivityLabels.length ? (
        <View style={styles.registerSelectedTagsWrap}>
          {selectedRegisterActivityLabels.map((item) => (
            <View key={item} style={styles.registerSelectedTag}>
              <Text style={styles.registerSelectedTagText}>{getActivityEmoji(item)} {item}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <Text style={styles.fieldLabel}>Slike Gospodarstva, proizvodnje ili Usluge</Text>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => pickImage('profile_photo')}
        activeOpacity={0.9}>
        <Text style={styles.uploadButtonText}>Odaberi sliku</Text>
      </TouchableOpacity>
      {registerData.profile_photo?.uri ? (
        <Image source={{ uri: registerData.profile_photo.uri }} style={styles.previewImage} />
      ) : null}

      <Text style={styles.fieldLabel}>Naslovna</Text>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => pickImage('cover_photo')}
        activeOpacity={0.9}>
        <Text style={styles.uploadButtonText}>Odaberi naslovnu sliku</Text>
      </TouchableOpacity>
      {registerData.cover_photo?.uri ? (
        <Image source={{ uri: registerData.cover_photo.uri }} style={styles.coverPreview} />
      ) : null}
    </>
  );
};


const renderAuthScreen = () => (
  <SafeAreaView style={styles.safe} edges={['left', 'right']}>
    {renderTopBar(authMode === 'login' ? 'Prijava' : 'Registracija')}

    <ScrollView contentContainerStyle={styles.loginWrap}>
      <View style={styles.loginCard}>
        <TouchableOpacity
          style={[
            styles.dropdownHeader,
            packagesOpen && styles.dropdownHeaderActive,
          ]}
          onPress={() => setPackagesOpen((prev) => !prev)}
          activeOpacity={0.88}>
          <View style={styles.dropdownHeaderTextWrap}>
            <Text style={styles.dropdownHeaderTitle}>Paketi i Registracija</Text>
            <Text style={styles.dropdownHeaderSubtitle}>
              Pregled paketa i uvjeta registracije
            </Text>
          </View>
          <View style={styles.dropdownIconWrap}>
            <Text style={styles.dropdownIcon}>{packagesOpen ? '−' : '+'}</Text>
          </View>
        </TouchableOpacity>

        {packagesOpen ? (
          <View style={styles.packageDropdownWrap}>
            <Text style={styles.packageIntroText}>
              Korisnici s poljoprivrednom proizvodnjom pripadaju u{' '}
              <Text style={{ fontWeight: '700' }}>Agrobazu</Text>, a ostali korisnici u{' '}
              <Text style={{ fontWeight: '700' }}>Agrobiznis</Text>.
            </Text>

            <View style={styles.packageInfoBox}>
              <View style={styles.packageInfoItemCompact}>
                <Text style={[styles.packageInfoItemTitle, styles.mini]}>AgroMINI</Text>
                <Text style={styles.packageInfoItemText}>Za korisnike do 10 ha.</Text>
              </View>

              <View style={styles.packageInfoDivider} />

              <View style={styles.packageInfoItemCompact}>
                <Text style={[styles.packageInfoItemTitle, styles.hit]}>AgroHIT</Text>
                <Text style={styles.packageInfoItemText}>Za korisnike od 10 ha do 30 ha.</Text>
              </View>

              <View style={styles.packageInfoDivider} />

              <View style={styles.packageInfoItemCompact}>
                <Text style={[styles.packageInfoItemTitle, styles.brand]}>AgroBRAND</Text>
                <Text style={styles.packageInfoItemText}>Za korisnike više od 30 ha.</Text>
              </View>

              <View style={styles.packageInfoDivider} />

              <View style={styles.packageInfoItemCompact}>
                <Text style={[styles.packageInfoItemTitle, styles.konzultant]}>Konzultant</Text>
                <Text style={styles.packageInfoItemText}>Za korisnike Konzultantskih usluga.</Text>
              </View>

              <Text style={styles.packageInfoExpiry}>Ponuda vrijedi mjesec dana.</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.authTabs}>
          <TouchableOpacity
            style={[styles.authTab, authMode === 'login' && styles.authTabActive]}
            onPress={() => {
              setAuthMode('login');
              setRegisterStep(1);
            }}
            activeOpacity={0.9}>
            <Text
              style={[
                styles.authTabText,
                authMode === 'login' && styles.authTabTextActive,
              ]}>
              Prijava
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.authTab, authMode === 'register' && styles.authTabActive]}
            onPress={() => {
              setAuthMode('register');
              setRegisterStep(1);
            }}
            activeOpacity={0.9}>
            <Text
              style={[
                styles.authTabText,
                authMode === 'register' && styles.authTabTextActive,
              ]}>
              Registracija
            </Text>
          </TouchableOpacity>
        </View>

        {authMode === 'login' ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email adresa"
              placeholderTextColor="#94a3b8"
              value={loginEmail}
              onChangeText={setLoginEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Lozinka"
              placeholderTextColor="#94a3b8"
              value={loginPassword}
              onChangeText={setLoginPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setRememberMe((prev) => !prev)}
              activeOpacity={0.85}>
              <View style={[styles.checkboxBox, rememberMe && styles.checkboxBoxActive]}>
                <Text style={styles.checkboxTick}>{rememberMe ? '✓' : ''}</Text>
              </View>
              <Text style={styles.checkboxLabel}>Zapamti me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.9}
              disabled={authLoading}>
              <Text style={styles.loginButtonText}>
                {authLoading ? 'Prijava…' : 'Prijavi se'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {registerStep === 1 ? (
  <View style={styles.registerHeroCard}>
    <Text style={styles.registerHeroBadge}>
      🌾 Dobrodošli na ab.hr
    </Text>

    <Text style={styles.registerHeroTitle}>
      Registriraj se i pokreni svoje poslovanje digitalno
    </Text>

    <Text style={styles.registerHeroSubtitle}>
      Ukoliko ne izvršite uplatu smatramo da ste odustali od narudžbe.
    </Text>

    <View style={styles.registerBenefitsWrap}>
      {registerBenefits.map((item) => (
        <View key={item} style={styles.registerBenefitPill}>
          <Text style={styles.registerBenefitPillText}>{item}</Text>
        </View>
      ))}
    </View>
  </View>
) : null}

{renderRegisterStepProgress()}

            <View style={styles.registerStepHeaderBox}>
              <Text style={styles.registerStepEyebrow}>Korak {registerStep} / 4</Text>
              <Text style={styles.registerStepTitle}>{currentRegisterStepMeta.title}</Text>
              <Text style={styles.registerStepSubtitle}>{currentRegisterStepMeta.subtitle}</Text>
            </View>

            {renderRegisterSummaryBadges()}

            <View style={styles.registerStepCard}>{renderRegisterStepContent()}</View>

            <View style={styles.registerNavigationRow}>
              {registerStep > 1 ? (
                <TouchableOpacity
                  style={styles.registerSecondaryButton}
                  onPress={goToPrevRegisterStep}
                  activeOpacity={0.9}>
                  <Text style={styles.registerSecondaryButtonText}>Nazad</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ width: 110 }} />
              )}

              {registerStep < 4 ? (
                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    styles.registerNextButton,
                    !canGoNextRegisterStep && styles.registerNextButtonDisabled,
                  ]}
                  onPress={goToNextRegisterStep}
                  activeOpacity={0.9}>
                  <Text style={styles.loginButtonText}>Dalje</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.loginButton, styles.registerNextButton]}
                  onPress={handleRegister}
                  activeOpacity={0.9}
                  disabled={authLoading}>
                  <Text style={styles.loginButtonText}>
                    {authLoading ? 'Registracija…' : 'Završi registraciju'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>
    </ScrollView>

    {renderBottomPicker()}
  </SafeAreaView>
);


  const renderProfileScreen = () => (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      {renderTopBar('Profil')}
      {renderLicenseBanner()}

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.nativeCard}>
          <Image source={coverImageSource} style={styles.profileCover} />

          <View style={styles.profileHero}>
            <View style={styles.avatarCircle}>
              <Image source={profileImageSource} style={styles.avatarImage} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>
                {profileData.fullName || 'Korisnik'}
              </Text>
              <Text style={styles.profileSub}>
                {profileData.email || 'Bez emaila'}
              </Text>
            </View>
          </View>

          <View style={styles.profileInfoBlock}>
            <Text style={styles.infoLabel}>Lokacija</Text>
            <Text style={styles.infoValue}>
              {profileData.location || 'Nije postavljeno'}
            </Text>
          </View>

          <View style={styles.profileInfoBlock}>
            <Text style={styles.infoLabel}>Županija</Text>
            <Text style={styles.infoValue}>
              {profileData.zupanija || 'Nije postavljeno'}
            </Text>
          </View>

          <View style={styles.profileInfoBlock}>
            <Text style={styles.infoLabel}>Gospodarstvo ili Trgovac</Text>
            <Text style={styles.infoValue}>
              {profileData.farmName || 'Nije postavljeno'}
            </Text>
          </View>

          <View style={styles.profileInfoBlock}>
            <Text style={styles.infoLabel}>Telefon</Text>
            <Text style={styles.infoValue}>
              {profileData.phone || 'Nije postavljeno'}
            </Text>
          </View>
        </View>

        <View style={styles.nativeCard}>
          <Text style={styles.sectionTitle}>Brze radnje</Text>

                    <TouchableOpacity
            style={styles.actionRowButton}
            onPress={() => {
              setEditProfilePhoto(null);
              setEditCoverPhoto(null);
              setCurrentNativeScreen('editProfile');
            }}
            activeOpacity={0.9}>
            <Text style={styles.actionRowEmoji}>✏️</Text>
            <Text style={styles.actionRowText}>Uredi podatke</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRowButton}
            onPress={() => {
              setSelectedModule({
                key: 'profil-web',
                title: 'Profil',
                url: 'https://ab.hr/profil/?mobile=1',
                image: null,
                emoji: '👤',
              });
              setCurrentNativeScreen(null);
            }}
            activeOpacity={0.9}>
            <Text style={styles.actionRowEmoji}>🌐</Text>
            <Text style={styles.actionRowText}>Otvori puni web profil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRowButton}
            onPress={handleLogout}
            activeOpacity={0.9}>
            <Text style={styles.actionRowEmoji}>🚪</Text>
            <Text style={styles.actionRowText}>Odjava</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  const renderEditProfileScreen = () => (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      {renderTopBar('Uredi profil')}
      {renderLicenseBanner()}

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.nativeCard}>
          <TextInput
            style={styles.input}
            placeholder="Ime i prezime"
            placeholderTextColor="#94a3b8"
            value={profileData.fullName}
            onChangeText={(text) =>
              setProfileData((prev) => ({ ...prev, fullName: text }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#94a3b8"
            value={profileData.email}
            onChangeText={(text) =>
              setProfileData((prev) => ({ ...prev, email: text }))
            }
          />

          {renderPickerField(
            'bazu',
            profileData.baza,
            (value) => setProfileData((prev) => ({ ...prev, baza: value })),
            registerOptions.a_izaberite_bazu
          )}

          {renderPickerField(
            'organizacijski oblik',
            profileData.organizacijski_oblik,
            (value) =>
              setProfileData((prev) => ({
                ...prev,
                organizacijski_oblik: value,
              })),
            registerOptions.a_daberite_organizacijski_oblik
          )}

          {renderPickerField(
            'županiju',
            profileData.zupanija,
            (value) => setProfileData((prev) => ({ ...prev, zupanija: value })),
            registerOptions.a_zupanija
          )}

          {renderEditPlaceSearch()}

          <TextInput
            style={styles.input}
            placeholder="Mjesto, adresa"
            placeholderTextColor="#94a3b8"
            value={profileData.adresa}
            onChangeText={(text) =>
              setProfileData((prev) => ({ ...prev, adresa: text }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Naziv gospodarstva"
            placeholderTextColor="#94a3b8"
            value={profileData.farmName}
            onChangeText={(text) =>
              setProfileData((prev) => ({ ...prev, farmName: text }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Telefon"
            placeholderTextColor="#94a3b8"
            value={profileData.phone}
            onChangeText={(text) =>
              setProfileData((prev) => ({ ...prev, phone: text }))
            }
          />

<TextInput
            style={styles.input}
            placeholder="MIBPG"
            placeholderTextColor="#94a3b8"
            value={profileData.mibpg}
            onChangeText={(text) =>
              setProfileData((prev) => ({ ...prev, mibpg: text }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="OIB"
            placeholderTextColor="#94a3b8"
            value={profileData.oib}
            onChangeText={(text) =>
              setProfileData((prev) => ({ ...prev, oib: text }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="JIBG"
            placeholderTextColor="#94a3b8"
            value={profileData.jibg}
            onChangeText={(text) =>
              setProfileData((prev) => ({ ...prev, jibg: text }))
            }
          />

          <Text style={styles.fieldLabel}>Profilna fotografija</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickEditProfileImage('profile_photo')}
            activeOpacity={0.9}
          >
            <Text style={styles.uploadButtonText}>Odaberi profilnu fotografiju</Text>
          </TouchableOpacity>
          {editProfilePhoto?.uri ? (
            <Image source={{ uri: editProfilePhoto.uri }} style={styles.previewImage} />
          ) : profileData.profile_photo ? (
            <Image source={{ uri: profileData.profile_photo }} style={styles.previewImage} />
          ) : null}

          <Text style={styles.fieldLabel}>Naslovna fotografija</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickEditProfileImage('cover_photo')}
            activeOpacity={0.9}
          >
            <Text style={styles.uploadButtonText}>Odaberi naslovnu fotografiju</Text>
          </TouchableOpacity>
          {editCoverPhoto?.uri ? (
            <Image source={{ uri: editCoverPhoto.uri }} style={styles.coverPreview} />
          ) : profileData.cover_photo ? (
            <Image source={{ uri: profileData.cover_photo }} style={styles.coverPreview} />
          ) : null}

          <Text style={styles.fieldLabel}>Djelatnosti</Text>
          <View style={styles.multiSelectWrap}>
            {registerOptions.a_odaberite_vase_djelatnosti.map((item) => {
              const active = profileData.djelatnosti.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleProfileActivity(item)}
                  activeOpacity={0.85}>
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleUpdateProfile}
            activeOpacity={0.9}>
            <Text style={styles.loginButtonText}>Spremi profil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderBottomPicker()}
    </SafeAreaView>
  );

  const renderMonitoringScreen = () => {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right']}>
        {renderTopBar('AgroMeteo')}
        {renderLicenseBanner()}

        <ScrollView contentContainerStyle={styles.container}>
          <AgroMeteoScreen
            agroData={monitoringData}
            onRefresh={refreshMonitoring}
            loading={monitoringLoading}
          />

          {monitoringError ? (
            <View style={styles.nativeCard}>
              <Text style={styles.monitoringErrorText}>{monitoringError}</Text>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  };




  const renderAgroMonitoringScreen = () => {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right']}>
        {renderTopBar('AgroMonitoring')}
        {renderLicenseBanner()}

        <AgroMonitoringScreen
          authToken={authToken}
          apiRequest={apiRequest}
        />
      </SafeAreaView>
    );
  };


const renderOglasnikListaScreen = () => (
  <SafeAreaView style={styles.safe} edges={['left', 'right']}>
    {renderTopBar('Oglasnik')}
    {renderLicenseBanner()}

    <OglasnikListaScreen
      onOpenDetail={openOglasDetalj}
      onOpenMyAds={() => openNativeScreen('myAds', 'Moji oglasi')}
      onOpenPostAd={() => openNativeScreen('postAd', 'Objavi oglas')}
      authToken={authToken}
      favoriteAdIds={favoriteAdIds}
      onToggleFavoriteAd={toggleFavoriteAdLocal}
    />
  </SafeAreaView>
);

const renderOglasDetaljScreen = () => (
  <SafeAreaView style={styles.safe} edges={['left', 'right']}>
    {renderTopBar('Detalj oglasa')}
    {renderLicenseBanner()}

   <OglasDetaljScreen
  oglasId={selectedOglasId}
  onBack={openOglasnikLista}
  onOpenDetail={openOglasDetalj}
  onOpenSellerAds={openSellerAds}
  authToken={authToken}
  favoriteAdIds={favoriteAdIds}
  onToggleFavoriteAd={toggleFavoriteAdLocal}
/>
  </SafeAreaView>
);

const renderSellerAdsScreen = () => (
  <SafeAreaView style={styles.safe} edges={['left', 'right']}>
    {renderTopBar(selectedSellerName || 'Oglasi prodavatelja')}
    {renderLicenseBanner()}

    <OglasiProdavateljaScreen
      sellerId={selectedSellerId}
      sellerName={selectedSellerName}
      onBack={openOglasDetalj}
      onOpenDetail={openOglasDetalj}
      authToken={authToken}
    />
  </SafeAreaView>
);

const renderAbGoScreen = () => {
  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      {renderTopBar('ab Go')}
      {renderLicenseBanner()}

      <AbGoScreen
        profileData={profileData}
        monitoringData={monitoringData}
        monitoringRefreshedAt={monitoringRefreshedAt}
        onOpenModule={(moduleKey) => {
          const module = modules.find((m) => m.key === moduleKey);
          if (module) openModule(module);
        }}
      />
    </SafeAreaView>
  );
};

const renderMyAdsScreen = () => (
  <SafeAreaView style={styles.safe} edges={['left', 'right']}>
    {renderTopBar('Moji oglasi')}
    {renderLicenseBanner()}

    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.nativeCard}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadMyAds}
          activeOpacity={0.9}>
          <Text style={styles.refreshButtonText}>
            {myAdsLoading ? 'Osvježavam…' : 'Osvježi oglase'}
          </Text>
        </TouchableOpacity>

        {myAdsError ? (
          <Text style={styles.monitoringErrorText}>{myAdsError}</Text>
        ) : null}
      </View>

      {myAdsLoading && !myAds.length ? (
        <View style={styles.monitorLoadingWrap}>
          <ActivityIndicator size="large" color="#7FA52A" />
        </View>
      ) : null}

      {!myAdsLoading && !myAds.length ? (
        <View style={styles.nativeCard}>
          <Text style={styles.infoValue}>Nemate još nijedan oglas.</Text>
        </View>
      ) : null}

      {myAds.map((item) => {
        const previewImages = Array.isArray(item.gallery) && item.gallery.length
          ? item.gallery
          : item.featured_image
          ? [item.featured_image]
          : [];

        const heroImage = item.featured_image || previewImages[0] || '';
        const isFavorite = favoriteAdIds.includes(item.id);

        return (
          <View key={item.id} style={styles.myAdDetailCard}>
            <View style={styles.myAdImageWrap}>
              {heroImage ? (
                <Image source={{ uri: heroImage }} style={styles.myAdHeroImage} />
              ) : null}

              <TouchableOpacity
                style={styles.myAdFavoriteOverlay}
                onPress={() => toggleFavoriteAdLocal(item)}
                activeOpacity={0.9}>
                <Text style={styles.favoriteInlineButtonText}>
                  {isFavorite ? '💚' : '🤍'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.myAdBadgeRow}>
              {!!item.is_highlighted && (
                <View style={styles.myAdHighlightedBadge}>
                  <Text style={styles.myAdHighlightedBadgeText}>ISTAKNUTO</Text>
                </View>
              )}

              <View
                style={[
                  styles.myAdPriceBadge,
                  item.price_on_request === '1'
                    ? styles.myAdPriceOnRequest
                    : styles.myAdPriceNormal,
                ]}>
                <Text style={styles.myAdPriceBadgeText}>
                  {item.price_on_request === '1'
                    ? 'Na upit'
                    : item.price
                    ? `${item.price} €`
                    : 'Na upit'}
                </Text>
              </View>

              {!!item.condition && (
                <View
                  style={[
                    styles.myAdConditionBadge,
                    item.condition === 'novo'
                      ? styles.myAdConditionNovo
                      : item.condition === 'rabljeno'
                      ? styles.myAdConditionRabljeno
                      : item.condition === 'prodano'
                      ? styles.myAdConditionProdano
                      : styles.myAdConditionDefault,
                  ]}>
                  <Text style={styles.myAdConditionBadgeText}>
                    {item.condition === 'novo'
                      ? 'Novo'
                      : item.condition === 'rabljeno'
                      ? 'Rabljeno'
                      : item.condition === 'prodano'
                      ? 'Prodano'
                      : item.condition}
                  </Text>
                </View>
              )}

              <View style={styles.flexSpacer} />

              <TouchableOpacity
                style={styles.myAdShareButton}
                onPress={() => handleShareMyAd(item)}
                activeOpacity={0.9}>
                <Image source={ICON_SHARE} style={styles.myAdShareIcon} />
              </TouchableOpacity>
            </View>

            {previewImages.length > 1 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.myAdThumbRow}>
                {previewImages.map((img, index) => (
                  <View
                    key={`${item.id}-${img}-${index}`}
                    style={styles.myAdThumbWrap}>
                    <Image source={{ uri: img }} style={styles.myAdThumbImage} />
                  </View>
                ))}
              </ScrollView>
            ) : null}

            <View style={styles.content}>
              <View style={styles.titleCard}>
                <Text style={styles.title}>{item.title || 'Bez naslova'}</Text>

                <View style={styles.myAdActionRow}>
                  <TouchableOpacity
                    style={styles.myAdEditAction}
                    onPress={() => loadSingleAdForEdit(item.id)}
                    activeOpacity={0.9}>
                    <Text style={styles.myAdEditActionText}>Uredi oglas</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.myAdDeleteAction}
                    onPress={() => handleDeleteAd(item.id)}
                    activeOpacity={0.9}>
                    <Text style={styles.myAdDeleteActionText}>Obriši oglas</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  </SafeAreaView>
);

const renderEditAdScreen = () => (
  <SafeAreaView style={styles.safe} edges={['left', 'right']}>
    {renderTopBar('Uredi oglas')}
    {renderLicenseBanner()}

    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.nativeCard}>
        {editingAdLoading ? (
          <ActivityIndicator size="large" color="#7FA52A" />
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Naslov oglasa"
              placeholderTextColor="#94a3b8"
              value={adTitle}
              onChangeText={setAdTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Opis oglasa"
              placeholderTextColor="#94a3b8"
              value={adDescription}
              onChangeText={setAdDescription}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.fieldLabel}>Glavna kategorija</Text>

            <TouchableOpacity
              style={styles.filterSelectButton}
              onPress={openMainCategoryPicker}
              activeOpacity={0.9}
            >
              <Text style={styles.filterSelectEmoji}>
                {mainCategoryOptions.find((x) => x.value === String(adParentCategory))?.emoji || '👉'}
              </Text>
              <Text style={styles.filterSelectText}>
                {mainCategoryOptions.find((x) => x.value === String(adParentCategory))?.label || 'Odaberi'}
              </Text>
              <Text style={styles.filterSelectArrow}>˅</Text>
            </TouchableOpacity>

            {!!adParentCategory && childCategoryOptions.length > 0 ? (
              <>
                <Text style={styles.fieldLabel}>Podkategorija</Text>

                <TouchableOpacity
                  style={styles.filterSelectButton}
                  onPress={() =>
                    openPicker({
                      title: '👇 Odaberi',
                      items: childCategoryOptions,
                      value: adChildCategory,
                      type: 'childCategory',
                    })
                  }
                  activeOpacity={0.9}
                >
                  <Text style={styles.filterSelectEmoji}>👉</Text>
                  <Text style={styles.filterSelectText}>
                    {childCategoryOptions.find((x) => x.value === String(adChildCategory))?.label || 'Odaberi'}
                  </Text>
                  <Text style={styles.filterSelectArrow}>˅</Text>
                </TouchableOpacity>
              </>
            ) : null}

            <Text style={styles.fieldLabel}>Stanje</Text>

            <TouchableOpacity
              style={styles.filterSelectButton}
              onPress={() =>
                openPicker({
                  title: '👇 Odaberi',
                  items: conditionOptions,
                  value: adCondition,
                  type: 'condition',
                })
              }
              activeOpacity={0.9}
            >
              <Text style={styles.filterSelectEmoji}>
                {conditionOptions.find((x) => x.value === adCondition)?.emoji || '🏷️'}
              </Text>
              <Text style={styles.filterSelectText}>
                {conditionOptions.find((x) => x.value === adCondition)?.label || 'Odaberi'}
              </Text>
              <Text style={styles.filterSelectArrow}>˅</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Cijena"
              placeholderTextColor="#94a3b8"
              value={adPrice}
              onChangeText={setAdPrice}
              keyboardType="numeric"
              editable={!adPriceOnRequest}
            />

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => {
                const next = !adPriceOnRequest;
                setAdPriceOnRequest(next);
                if (next) {
                  setAdPrice('Na upit');
                } else if (adPrice === 'Na upit') {
                  setAdPrice('');
                }
              }}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.checkboxBox,
                  adPriceOnRequest && styles.checkboxBoxActive,
                ]}
              >
                <Text style={styles.checkboxTick}>
                  {adPriceOnRequest ? '✓' : ''}
                </Text>
              </View>
              <Text style={styles.checkboxLabel}>Cijena na upit</Text>
            </TouchableOpacity>

            {renderAdPlaceSearch()}

            <Text style={styles.fieldLabel}>Županija</Text>

            <TouchableOpacity
              style={styles.filterSelectButton}
              onPress={() =>
                openPicker({
                  title: '👇 Odaberi',
                  items: ZUPANIJE,
                  value: adZupanija,
                  type: 'zupanija',
                })
              }
              activeOpacity={0.9}
            >
              <Text style={styles.filterSelectText}>
                {selectedEditAdZupanijaLabel}
              </Text>
              <Text style={styles.filterSelectArrow}>˅</Text>
            </TouchableOpacity>

            <Text style={styles.fieldLabel}>Naslovna slika oglasa</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickAdImage('featured_image')}
              activeOpacity={0.9}
            >
              <Text style={styles.uploadButtonText}>
                Odaberi naslovnu sliku
              </Text>
            </TouchableOpacity>

            {adFeaturedImage?.uri ? (
              <Image
                source={{ uri: adFeaturedImage.uri }}
                style={styles.coverPreview}
              />
            ) : null}

            <Text style={styles.fieldLabel}>Galerija slika</Text>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickAdImage('gallery_1')}
              activeOpacity={0.9}
            >
              <Text style={styles.uploadButtonText}>Slika 1</Text>
            </TouchableOpacity>
            {adGallery1?.uri ? (
              <Image
                source={{ uri: adGallery1.uri }}
                style={styles.coverPreview}
              />
            ) : null}

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickAdImage('gallery_2')}
              activeOpacity={0.9}
            >
              <Text style={styles.uploadButtonText}>Slika 2</Text>
            </TouchableOpacity>
            {adGallery2?.uri ? (
              <Image
                source={{ uri: adGallery2.uri }}
                style={styles.coverPreview}
              />
            ) : null}

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickAdImage('gallery_3')}
              activeOpacity={0.9}
            >
              <Text style={styles.uploadButtonText}>Slika 3</Text>
            </TouchableOpacity>
            {adGallery3?.uri ? (
              <Image
                source={{ uri: adGallery3.uri }}
                style={styles.coverPreview}
              />
            ) : null}

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleUpdateAd}
              activeOpacity={0.9}
            >
              <Text style={styles.loginButtonText}>Spremi izmjene</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>

    {renderBottomPicker()}
  </SafeAreaView>
);

  const renderPostAdScreen = () => (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      {renderTopBar('Objavi oglas')}
      {renderLicenseBanner()}

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.nativeCard}>
          <TextInput
            style={styles.input}
            placeholder="Naslov oglasa"
            placeholderTextColor="#94a3b8"
            value={adTitle}
            onChangeText={setAdTitle}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Opis oglasa"
            placeholderTextColor="#94a3b8"
            value={adDescription}
            onChangeText={setAdDescription}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.fieldLabel}>Glavna kategorija</Text>

<TouchableOpacity
  style={styles.filterSelectButton}
  onPress={openMainCategoryPicker}
  activeOpacity={0.9}
>
  <Text style={styles.filterSelectEmoji}>
    {mainCategoryOptions.find((x) => x.value === String(adParentCategory))?.emoji || '👉'}
  </Text>
  <Text style={styles.filterSelectText}>
    {mainCategoryOptions.find((x) => x.value === String(adParentCategory))?.label || 'Odaberi'}
  </Text>
  <Text style={styles.filterSelectArrow}>˅</Text>
</TouchableOpacity>

{!!adParentCategory && childCategoryOptions.length > 0 ? (
  <>
    <Text style={styles.fieldLabel}>Podkategorija</Text>

    <TouchableOpacity
      style={styles.filterSelectButton}
      onPress={() =>
        openPicker({
          title: '👇 Odaberi',
          items: childCategoryOptions,
          value: adChildCategory,
          type: 'childCategory',
        })
      }
      activeOpacity={0.9}
    >
      <Text style={styles.filterSelectEmoji}>👉</Text>
      <Text style={styles.filterSelectText}>
        {childCategoryOptions.find((x) => x.value === String(adChildCategory))?.label || 'Odaberi'}
      </Text>
      <Text style={styles.filterSelectArrow}>˅</Text>
    </TouchableOpacity>
  </>
) : null}

<Text style={styles.fieldLabel}>Stanje</Text>

<TouchableOpacity
  style={styles.filterSelectButton}
  onPress={() =>
    openPicker({
      title: '👇Odaberi',
      items: conditionOptions,
      value: adCondition,
      type: 'condition',
    })
  }
  activeOpacity={0.9}
>
  <Text style={styles.filterSelectEmoji}>
    {conditionOptions.find((x) => x.value === adCondition)?.emoji || '🏷️'}
  </Text>
  <Text style={styles.filterSelectText}>
    {conditionOptions.find((x) => x.value === adCondition)?.label || 'Odaberi'}
  </Text>
  <Text style={styles.filterSelectArrow}>˅</Text>
</TouchableOpacity>

<TextInput
  style={styles.input}
  placeholder="Cijena"
  placeholderTextColor="#94a3b8"
  value={adPrice}
  onChangeText={setAdPrice}
  keyboardType="numeric"
  editable={!adPriceOnRequest}
/>

<TouchableOpacity
  style={styles.checkboxRow}
  onPress={() => {
    const next = !adPriceOnRequest;
    setAdPriceOnRequest(next);
    if (next) {
      setAdPrice('Na upit');
    } else if (adPrice === 'Na upit') {
      setAdPrice('');
    }
  }}
  activeOpacity={0.85}
>
  <View style={[styles.checkboxBox, adPriceOnRequest && styles.checkboxBoxActive]}>
    <Text style={styles.checkboxTick}>{adPriceOnRequest ? '✓' : ''}</Text>
  </View>
  <Text style={styles.checkboxLabel}>Cijena na upit</Text>
</TouchableOpacity>

{renderAdPlaceSearch()}

<Text style={styles.fieldLabel}>Županija</Text>

<TouchableOpacity
  style={styles.filterSelectButton}
  onPress={() =>
    openPicker({
      title: '👇 Odaberi',
      items: ZUPANIJE,
      value: adZupanija,
      type: 'zupanija',
    })
  }
  activeOpacity={0.9}
>
  <Text style={styles.filterSelectText}>
    {selectedAdZupanijaLabel}
  </Text>
  <Text style={styles.filterSelectArrow}>˅</Text>
</TouchableOpacity>

          <Text style={styles.fieldLabel}>Naslovna slika oglasa</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickAdImage('featured_image')}
            activeOpacity={0.9}>
            <Text style={styles.uploadButtonText}>Odaberi naslovnu sliku</Text>
          </TouchableOpacity>

          {adFeaturedImage?.uri ? (
            <Image
              source={{ uri: adFeaturedImage.uri }}
              style={styles.coverPreview}
            />
          ) : null}

          <Text style={styles.fieldLabel}>Galerija slika</Text>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickAdImage('gallery_1')}
            activeOpacity={0.9}>
            <Text style={styles.uploadButtonText}>Slika 1</Text>
          </TouchableOpacity>
          {adGallery1?.uri ? (
            <Image
              source={{ uri: adGallery1.uri }}
              style={styles.coverPreview}
            />
          ) : null}

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickAdImage('gallery_2')}
            activeOpacity={0.9}>
            <Text style={styles.uploadButtonText}>Slika 2</Text>
          </TouchableOpacity>
          {adGallery2?.uri ? (
            <Image
              source={{ uri: adGallery2.uri }}
              style={styles.coverPreview}
            />
          ) : null}

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickAdImage('gallery_3')}
            activeOpacity={0.9}>
            <Text style={styles.uploadButtonText}>Slika 3</Text>
          </TouchableOpacity>
          {adGallery3?.uri ? (
            <Image
              source={{ uri: adGallery3.uri }}
              style={styles.coverPreview}
            />
          ) : null}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={async () => {
              try {
                if (!adTitle.trim() || !adDescription.trim() || !adCategory) {
                  ToastAndroid.show(
                    'Popuni naslov, opis i kategoriju',
                    ToastAndroid.SHORT
                  );
                  return;
                }

                const formData = new FormData();
                formData.append('title', adTitle);
                formData.append('description', adDescription);
                formData.append('price', adPriceOnRequest ? 'Na upit' : adPrice);
                formData.append('term_id', adCategory);
                formData.append('condition', adCondition);
                formData.append('location', adLocation);
               formData.append(
  'zupanija',
  typeof adZupanija === 'object' ? adZupanija?.value || '' : adZupanija
);
                formData.append('price_on_request', adPriceOnRequest ? '1' : '0');

                if (adFeaturedImage?.uri) {
                  formData.append('featured_image', {
                    uri: adFeaturedImage.uri,
                    name: adFeaturedImage.fileName || 'featured.jpg',
                    type: adFeaturedImage.mimeType || 'image/jpeg',
                  });
                }

                if (adGallery1?.uri) {
                  formData.append('gallery_1', {
                    uri: adGallery1.uri,
                    name: adGallery1.fileName || 'gallery1.jpg',
                    type: adGallery1.mimeType || 'image/jpeg',
                  });
                }

                if (adGallery2?.uri) {
                  formData.append('gallery_2', {
                    uri: adGallery2.uri,
                    name: adGallery2.fileName || 'gallery2.jpg',
                    type: adGallery2.mimeType || 'image/jpeg',
                  });
                }

                if (adGallery3?.uri) {
                  formData.append('gallery_3', {
                    uri: adGallery3.uri,
                    name: adGallery3.fileName || 'gallery3.jpg',
                    type: adGallery3.mimeType || 'image/jpeg',
                  });
                }

                const data = await apiRequest(
                  '/ads/create',
                  {
                    method: 'POST',
                    body: formData,
                  },
                  authToken
                );

                ToastAndroid.show(
                  data?.message || 'Oglas objavljen',
                  ToastAndroid.LONG
                );

                setAdTitle('');
                setAdDescription('');
                setAdCategory('');
                setAdParentCategory('');
                setAdChildCategory('');
                setAdPrice('');
                setAdCondition('');
                setAdPriceOnRequest(false);
                setAdLocation(profileData.location || '');
                setAdZupanija(profileData.zupanija || '');
                setAdPlaceFocused(false);
                setAdFeaturedImage(null);
                setAdGallery1(null);
                setAdGallery2(null);
                setAdGallery3(null);

                await loadMyAds();
                setCurrentNativeScreen('myAds');
              } catch (e) {
                ToastAndroid.show(
                  e.message || 'Greška kod objave oglasa',
                  ToastAndroid.LONG
                );
              }
            }}
            activeOpacity={0.9}>
            <Text style={styles.loginButtonText}>Objavi oglas</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {renderBottomPicker()}
    </SafeAreaView>
  );


  const renderHomeTabs = () => (
    <View style={styles.homeTabsWrap}>
      {[
        { key: 'home', label: 'Početna' },
        { key: 'actions', label: 'Prečaci' },
        { key: 'modules', label: 'Moduli' },
      ].map((tab, index) => {
        const active = homeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.homeTabButton,
              active && styles.homeTabButtonActive,
              index < 2 && styles.homeTabButtonGap,
            ]}
            onPress={() => setHomeTab(tab.key)}
            activeOpacity={0.9}
          >
            <Text style={[styles.homeTabButtonText, active && styles.homeTabButtonTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderHomeTabContent = () => {
    if (homeTab === 'actions') {
      return (
        <QuickActionsSection
          actions={quickActions}
          onActionPress={handleQuickAction}
          styles={styles}
        />
      );
    }

    if (homeTab === 'modules') {
      return (
        <ModulesGridSection
          modules={modules}
          favoriteKeys={favoriteKeys}
          onOpenModule={openModule}
          onToggleFavorite={toggleFavorite}
          styles={styles}
        />
      );
    }

    return (
      <>
        <ContinueSection
          lastOpenedModule={lastOpenedModule}
          onOpenLast={() => {
            if (lastOpenedModule?.native && lastOpenedModule.nativeScreen) {
              openNativeScreen(lastOpenedModule.nativeScreen, lastOpenedModule.title);
            } else if (lastOpenedModule) {
              openModule(lastOpenedModule);
            }
          }}
          styles={styles}
        />
        <FavoritesSection
          favoriteModules={modules.filter((module) => favoriteKeys.includes(module.key))}
          onOpenModule={openModule}
          styles={styles}
        />
      </>
    );
  };


  if (loading) {
    return (
      <View style={styles.splash}>
        <Image
          source={require('./assets/splash-icon.png')}
          style={{ width: 220, height: 220 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (!isLoggedIn) {
    return renderAuthScreen();
  }

  if (isLoggedIn && !ssoReady && !selectedModule) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#7FA52A" />
        <Text style={{ marginTop: 12, fontSize: 16, color: '#334155' }}>
          Spajanje sustava...
        </Text>
      </View>
    );
  }

if (currentNativeScreen === 'profile') return renderProfileScreen();
if (currentNativeScreen === 'editProfile') return renderEditProfileScreen();
if (currentNativeScreen === 'monitoring') return renderMonitoringScreen();
if (currentNativeScreen === 'agromonitoring') return renderAgroMonitoringScreen();
if (currentNativeScreen === 'oglasnikLista') return renderOglasnikListaScreen();
if (currentNativeScreen === 'oglasDetalj') return renderOglasDetaljScreen();
if (currentNativeScreen === 'sellerAds') return renderSellerAdsScreen();
if (currentNativeScreen === 'postAd') return renderPostAdScreen();
if (currentNativeScreen === 'editAd') return renderEditAdScreen();
if (currentNativeScreen === 'myAds') return renderMyAdsScreen();
if (currentNativeScreen === 'favoriti') return renderFavoritiScreen();
if (currentNativeScreen === 'abgo') return renderAbGoScreen();
if (currentNativeScreen === 'alati') {
  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      {renderTopBar('Alati')}
      {renderLicenseBanner()}

      <AlatiScreen
        onBack={() => setCurrentNativeScreen(null)}
        onOpenTool={(tool) => {
          if (tool.key === 'poticaji') setCurrentNativeScreen('tool_poticaji');
          if (tool.key === 'alr') setCurrentNativeScreen('tool_alr');
          if (tool.key === 'savjetnik') setCurrentNativeScreen('tool_savjetnik');
        }}
      />
    </SafeAreaView>
  );
}

if (currentNativeScreen === 'tool_poticaji') {
  return (
    <IzracunPotporaScreen
      renderTopBar={renderTopBar}
      renderLicenseBanner={renderLicenseBanner}
      onBack={() => setCurrentNativeScreen('alati')}
    />
  );
}

if (currentNativeScreen === 'tool_alr') {
  return (
    <ToolPlaceholderScreen
      title="ALR kalkulator"
      emoji="🧮"
      description="Ovdje je spremno mjesto za spajanje ALR kalkulatora u sljedećoj fazi."
      renderTopBar={renderTopBar}
      renderLicenseBanner={renderLicenseBanner}
      styles={styles}
    />
  );
}
if (currentNativeScreen === 'tool_savjetnik') {
  return (
    <SavjetnikScreen
      onBack={() => setCurrentNativeScreen('alati')}
      renderTopBar={renderTopBar}
      renderLicenseBanner={renderLicenseBanner}
    />
  );
}

  if (selectedModule) {
    return (
      <SafeAreaView style={styles.safe} edges={['left', 'right']}>
        {renderTopBar(selectedModule.title)}
        {renderLicenseBanner()}

        <View style={styles.webviewWrap}>
          {selectedModule?.key === 'agronet' && showAgronetNotice && (
            <View style={styles.agronetNoticeWrap}>
              <View style={styles.agronetNotice}>
                <Text style={styles.agronetNoticeText}>
                  Pristupate službenom sustavu Agronet. Prijava ide preko njihove stranice.
                </Text>

                <TouchableOpacity
                  onPress={() => setShowAgronetNotice(false)}
                  style={styles.agronetNoticeClose}
                  activeOpacity={0.8}>
                  <Text style={styles.agronetNoticeCloseText}>×</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <WebView
            ref={webRef}
            source={{ uri: selectedModule.url }}
            style={{ flex: 1 }}
            injectedJavaScript={
              selectedModule?.key === 'agroMonitoringEmbed' ? EMBED_CSS : ''
            }
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            cacheEnabled={true}
            originWhitelist={['*']}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loaderWrap}>
                <ActivityIndicator size="large" color="#7EA11B" />
              </View>
            )}
            onLoadStart={() => setModuleLoading(true)}
            onLoadEnd={() => setModuleLoading(false)}
            onNavigationStateChange={(navState) => {
              webCanGoBackRef.current = navState.canGoBack;

              const url = navState?.url || '';
              if (url.includes('app_sso=ok')) {
                setSsoReady(true);
                setSelectedModule(null);
                setModuleLoading(false);
              }
            }}
          />

          {moduleLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      {renderTopBar('ab.hr')}
      {renderLicenseBanner()}

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {showHero && (
          <Animated.View style={[styles.heroCard, { opacity: fadeAnim }]}> 
            <Text style={styles.heroTitle}>Dobrodošli</Text>
            <Text style={styles.heroText}>
              Brzi pristup vašim alatima, oglasima i AgroMeteo podacima na jednom mjestu.
            </Text>
          </Animated.View>
        )}

        {renderHomeTabs()}
        {renderHomeTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  packageInfoExpiry: {
    marginTop: 10,
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
    textAlign: 'right',
  },
  packageInfoDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 6,
  },
  packageInfoItemCompact: {
    paddingVertical: 4,
  },
  packageInfoBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 14,
    marginBottom: 4,
  },
  packageIntroText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  packageDropdownWrap: {
    marginBottom: 16,
  },
  dropdownIcon: {
    fontSize: 22,
    fontWeight: '800',
    color: '#7FA52A',
    lineHeight: 24,
  },
  dropdownIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownHeaderSubtitle: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17,
  },
  dropdownHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  dropdownHeaderTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  dropdownHeaderActive: {
    backgroundColor: '#eef4df',
    borderColor: '#cfe19a',
  },
  dropdownHeader: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  safe: {
    flex: 1,
    backgroundColor: '#f3f5f7',
  },

  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  topBar: {
    backgroundColor: '#7FA52A',
    paddingTop: StatusBar.currentHeight || 0,
    paddingBottom: 10,
    paddingHorizontal: SIDE_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
  },

  hamburgerButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginRight: 12,
  },

  hamburgerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 30,
  },

  topBarTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 19,
    fontWeight: '800',
  },

  topBarSpacer: {
    width: 8,
  },

  inlineMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },

  inlineMenuItem: {
    marginLeft: 14,
    paddingVertical: 6,
  },

  inlineMenuText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },

  container: {
    paddingHorizontal: SIDE_PADDING,
    paddingTop: 16,
    paddingBottom: 28,
  },

  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },

  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    marginBottom: 6,
  },

  heroText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    marginBottom: 12,
  },

  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },

  quickActionCard: {
    width: HOME_CARD_WIDTH,
    minHeight: 104,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickActionEmoji: {
    fontSize: 26,
    marginBottom: 8,
  },

  quickActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
  },

  continueCard: {
    backgroundColor: '#e9f4d1',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  continueEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5e7a16',
    marginBottom: 4,
    textTransform: 'uppercase',
  },

  continueTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },

  continueSubtitle: {
    fontSize: 13,
    color: '#4b5563',
  },

  continueEmoji: {
    fontSize: 34,
    marginLeft: 12,
  },

  favoritesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },

  favoriteChip: {
    width: HOME_CARD_WIDTH,
    minHeight: 92,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 10,
  },

  favoriteChipEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },

  favoriteChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  cardWrap: {
    width: CARD_WIDTH,
    marginBottom: 12,
  },

  card: {
    height: isTablet ? 190 : 170,
  },

  cardImage: {
    borderRadius: 20,
  },

  overlay: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.10)',
    justifyContent: 'space-between',
  },

  favoriteButton: {
  position: 'absolute',
  bottom: 10,
  right: 10,
  backgroundColor: 'rgba(255,255,255,0.9)',
  borderRadius: 999,
  width: 34,
  height: 34,
  alignItems: 'center',
  justifyContent: 'center',
},

  favoriteButtonText: {
    fontSize: 20,
    color: '#111',
    lineHeight: 22,
  },

  labelTop: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },

  labelTopText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111',
  },

  nativeCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },

  profileCover: {
    width: '100%',
    height: 140,
    borderRadius: 18,
    marginBottom: 14,
  },

  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  avatarCircle: {
    width: 66,
    height: 66,
    borderRadius: 999,
    backgroundColor: '#eef4df',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  avatarText: {
    fontSize: 30,
  },

  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    marginBottom: 2,
  },

  profileSub: {
    fontSize: 14,
    color: '#64748b',
  },

  profileInfoBlock: {
    marginBottom: 14,
  },

  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  actionRowButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  actionRowEmoji: {
    fontSize: 22,
    marginRight: 10,
  },

  actionRowText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  monitorCard: {
    width: CARD_WIDTH,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
  },

  monitorTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  monitorEmoji: {
    fontSize: 24,
  },

  monitorBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  monitorBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },

  monitorTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginTop: 12,
    marginBottom: 4,
  },

  monitorValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },

  monitorNote: {
    fontSize: 12,
    lineHeight: 17,
    color: '#374151',
  },

  refreshButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#7FA52A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  refreshButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },

  monitorLoadingWrap: {
    paddingVertical: 24,
  },

  monitoringErrorText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#dc2626',
    marginTop: 12,
  },

  loginWrap: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: SIDE_PADDING,
    paddingVertical: 16,
  },

  loginCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
  },

  loginTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    marginBottom: 8,
  },

  loginSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748b',
    marginBottom: 18,
  },

  authTabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 4,
    marginBottom: 18,
  },

  authTab: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },

  authTabActive: {
    backgroundColor: '#fff',
  },

  authTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },

  authTabTextActive: {
    color: '#111',
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },

  packageCard: {
    width: 120,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 12,
    marginRight: 10,
  },

  packageCardActive: {
    backgroundColor: '#eef4df',
    borderColor: '#7FA52A',
  },

  packageName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },

  packagePrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5e7a16',
  },

  input: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111',
    marginBottom: 12,
  },

  textArea: {
    height: 120,
    paddingTop: 14,
  },

  pickerWrap: {
    marginBottom: 12,
  },

  activitiesBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 12,
    marginBottom: 14,
  },

  activitiesHint: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 10,
  },

  placeEmptyState: {
    paddingHorizontal: 14,
    paddingVertical: 16,
  },

  placeEmptyStateText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },

  pickerBox: {
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },

  multiSelectWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },

  chip: {
    backgroundColor: '#eef2f7',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },

  chipActive: {
    backgroundColor: '#7FA52A',
  },

  chipText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },

  chipTextActive: {
    color: '#fff',
  },

  uploadButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#eef4df',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  uploadButtonText: {
    color: '#5e7a16',
    fontSize: 14,
    fontWeight: '800',
  },

checkboxRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 14,
},

checkboxBox: {
  width: 24,
  height: 24,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: '#cbd5e1',
  backgroundColor: '#fff',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 10,
},

checkboxBoxActive: {
  backgroundColor: '#7FA52A',
  borderColor: '#7FA52A',
},

checkboxTick: {
  color: '#fff',
  fontWeight: '800',
  fontSize: 14,
},

mini: {
  fontWeight: '800',
  color: '#111827', // tamna (default)
},

hit: {
  fontWeight: '800',
  color: '#16a34a', // zelena
},

brand: {
  fontWeight: '800',
  color: '#2563eb', // plava
},

konzultant: {
  fontWeight: '800',
  color: '#dc2626', // crvena
},

checkboxLabel: {
  fontSize: 14,
  fontWeight: '700',
  color: '#111827',
},

  previewImage: {
    width: 110,
    height: 110,
    borderRadius: 999,
    marginBottom: 14,
  },

  coverPreview: {
    width: '100%',
    height: 140,
    borderRadius: 18,
    marginBottom: 14,
  },

  loginButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#7FA52A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  webviewWrap: {
    flex: 1,
    marginBottom: 40,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,24,39,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedPlaceBox: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dbe2ea',
  },

  selectedPlaceText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },

  selectedPlaceBoxRow: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dbe2ea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectedPlaceClear: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedPlaceClearText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },


  placeListBox: {
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 12,
  },

  placeItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  placeItemText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },

  placeCountyText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
  },

  licenseBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: -4,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  licenseBannerExpiring: {
    backgroundColor: '#fef3c7',
  },

  licenseBannerExpired: {
    backgroundColor: '#fee2e2',
  },

  licenseBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },

  licenseBannerText: {
    marginTop: 4,
    fontSize: 13,
    color: '#334155',
    paddingRight: 10,
  },

  licenseBannerButton: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },

 licenseBannerButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },

  adActionsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },

adEditButton: {
  minHeight: 44,
  borderRadius: 14,
  backgroundColor: '#2563eb',
  paddingHorizontal: 16,
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 10,
},

adEditButtonText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '800',
},

  adDeleteButton: {
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  adDeleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },

  filterSelectButton: {
    minHeight: 60,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#d6d6d6',
    backgroundColor: '#fff',
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  filterSelectEmoji: {
    fontSize: 28,
    marginRight: 18,
  },

  filterSelectText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  filterSelectArrow: {
    fontSize: 28,
    color: '#6b7280',
    marginLeft: 12,
  },

  bottomSheetOverlay: {
  flex: 1,
  justifyContent: 'flex-end',
  backgroundColor: 'rgba(15, 23, 42, 0.32)',
},

bottomSheetBackdrop: {
  flex: 1,
},

bottomSheet: {
  backgroundColor: '#ffffff',
  borderTopLeftRadius: 30,
  borderTopRightRadius: 30,
  paddingTop: 10,
  paddingBottom: 24,
  maxHeight: '76%',
  borderTopWidth: 1,
  borderColor: '#e5e7eb',
},

bottomSheetHandle: {
  width: 74,
  height: 7,
  borderRadius: 999,
  backgroundColor: '#d1d5db',
  alignSelf: 'center',
  marginBottom: 14,
},

bottomSheetHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  marginBottom: 14,
},

bottomSheetTitle: {
  flex: 1,
  fontSize: 22,
  fontWeight: '800',
  color: '#111827',
},

bottomSheetClose: {
  fontSize: 30,
  color: '#6b7280',
  marginLeft: 12,
  lineHeight: 32,
},

bottomSheetList: {
  paddingHorizontal: 16,
  paddingBottom: 10,
},

bottomSheetItem: {
  minHeight: 64,
  borderRadius: 18,
  backgroundColor: '#f8fafc',
  borderWidth: 1,
  borderColor: '#e5e7eb',
  paddingHorizontal: 16,
  marginBottom: 10,
  flexDirection: 'row',
  alignItems: 'center',
},

bottomSheetItemSelected: {
  backgroundColor: '#eef6df',
  borderWidth: 2,
  borderColor: '#7FA52A',
},

bottomSheetItemEmoji: {
  fontSize: 22,
  marginRight: 14,
},

bottomSheetItemText: {
  flex: 1,
  fontSize: 15,
  fontWeight: '700',
  color: '#111827',
},

bottomSheetItemTextSelected: {
  color: '#5e7a16',
},

bottomSheetCheck: {
  fontSize: 22,
  color: '#7FA52A',
  fontWeight: '800',
  marginLeft: 10,
},

bottomSheetDoneButton: {
  marginTop: 6,
  marginHorizontal: 16,
  backgroundColor: '#86a820',
  borderRadius: 18,
  paddingVertical: 16,
  alignItems: 'center',
  justifyContent: 'center',
},

bottomSheetDoneButtonText: {
  color: '#fff',
  fontSize: 18,
  fontWeight: '800',
},

  favoriteInlineButtonActive: {
    backgroundColor: '#dcfce7',
  },

  myAdFavoriteOverlay: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  myAdShareButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  myAdShareIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },

  myAdDetailCard: {
    backgroundColor: '#f4f6f8',
    borderRadius: 24,
    marginBottom: 18,
    overflow: 'hidden',
  },

  myAdImageWrap: {
    position: 'relative',
    backgroundColor: '#ececec',
  },

  myAdHeroImage: {
    width: '100%',
    height: 260,
    backgroundColor: '#ececec',
  },

  myAdBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },

  myAdHighlightedBadge: {
    backgroundColor: '#f59e0b',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },

  myAdHighlightedBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },

  myAdPriceBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
  },

  myAdPriceNormal: {
    backgroundColor: '#dc2626',
  },

  myAdPriceOnRequest: {
    backgroundColor: '#111827',
  },

  myAdPriceBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },

  myAdConditionBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  myAdConditionBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  myAdConditionNovo: {
    backgroundColor: '#16a34a',
  },

  myAdConditionRabljeno: {
    backgroundColor: '#ca8a04',
  },

  myAdConditionProdano: {
    backgroundColor: '#6b7280',
  },

  myAdConditionDefault: {
    backgroundColor: '#9ca3af',
  },

  myAdThumbRow: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },

  myAdThumbWrap: {
    width: 74,
    height: 74,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 10,
  },

  myAdThumbImage: {
    width: '100%',
    height: '100%',
  },

  myAdActionRow: {
    flexDirection: 'row',
    gap: 10,
  },

  myAdEditAction: {
    flex: 1,
    backgroundColor: '#fb923c',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  myAdEditActionText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },

  myAdDeleteAction: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },

  myAdDeleteActionText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },

  infoValueLeft: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'left',
    lineHeight: 22,
  },

registerHeroCard: {
  backgroundColor: '#f6fbe9',
  borderRadius: 22,
  padding: 18,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: '#d7e7b4',
},

registerHeroBadge: {
  alignSelf: 'flex-start',
  backgroundColor: '#dfeeae',
  color: '#5c731e',
  fontSize: 12,
  fontWeight: '800',
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 999,
  marginBottom: 10,
},

registerHeroTitle: {
  fontSize: 22,
  lineHeight: 28,
  fontWeight: '800',
  color: '#1f2937',
  marginBottom: 8,
},

registerHeroSubtitle: {
  fontSize: 14,
  lineHeight: 21,
  color: '#64748b',
  marginBottom: 12,
},

registerBenefitsWrap: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
},

registerBenefitPill: {
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#e5e7eb',
  borderRadius: 999,
  paddingHorizontal: 10,
  paddingVertical: 8,
},

registerBenefitPillText: {
  fontSize: 12,
  color: '#334155',
  fontWeight: '700',
},

registerStepProgressWrap: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 16,
  paddingHorizontal: 2,
},

registerStepProgressItem: {
  flex: 1,
  alignItems: 'center',
},

registerStepProgressDot: {
  width: 30,
  height: 30,
  borderRadius: 15,
  backgroundColor: '#e5e7eb',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 6,
},

registerStepProgressDotActive: {
  backgroundColor: '#7FA52A',
},

registerStepProgressDotDone: {
  backgroundColor: '#96bb43',
},

registerStepProgressDotText: {
  color: '#64748b',
  fontSize: 13,
  fontWeight: '800',
},

registerStepProgressDotTextActive: {
  color: '#fff',
},

registerStepProgressLabel: {
  fontSize: 11,
  color: '#94a3b8',
  fontWeight: '700',
  textAlign: 'center',
},

registerStepProgressLabelActive: {
  color: '#1f2937',
},

registerStepHeaderBox: {
  marginBottom: 12,
},

registerStepEyebrow: {
  fontSize: 12,
  fontWeight: '800',
  color: '#7FA52A',
  textTransform: 'uppercase',
  marginBottom: 4,
},

registerStepTitle: {
  fontSize: 20,
  fontWeight: '800',
  color: '#111827',
  marginBottom: 4,
},

registerStepSubtitle: {
  fontSize: 13,
  color: '#64748b',
  lineHeight: 20,
},

registerSummaryWrap: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: 12,
},

registerSummaryBadge: {
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#dbe6c0',
  borderRadius: 999,
  paddingHorizontal: 10,
  paddingVertical: 7,
},

registerSummaryBadgeText: {
  color: '#486018',
  fontSize: 12,
  fontWeight: '700',
},

registerStepCard: {
  backgroundColor: '#fff',
  borderRadius: 22,
  padding: 14,
  borderWidth: 1,
  borderColor: '#e5e7eb',
  marginBottom: 14,
},

registerPackageGrid: {
  gap: 12,
},

registerPremiumCard: {
  backgroundColor: '#f8fafc',
  borderRadius: 18,
  borderWidth: 1,
  borderColor: '#e5e7eb',
  padding: 16,
  marginBottom: 10,
},

registerPremiumCardActive: {
  borderColor: '#7FA52A',
  backgroundColor: '#f6fbe9',
},

registerPremiumRibbon: {
  backgroundColor: '#7FA52A',
  borderRadius: 999,
  paddingHorizontal: 10,
  paddingVertical: 5,
  marginLeft: 10,
  flexShrink: 0,
  alignSelf: 'center',
},

registerPremiumRibbonText: {
  color: '#fff',
  fontSize: 10,
  fontWeight: '800',
  textAlign: 'center',
},

registerPremiumCardTitle: {
  fontSize: 18,
  fontWeight: '800',
  color: '#111827',
  marginBottom: 4,
},

registerPremiumPriceRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 6,
  width: '100%',
},

registerPremiumCardPrice: {
  fontSize: 20,
  fontWeight: '900',
  color: '#7FA52A',
  marginBottom: 0,
},

registerPremiumCardHint: {
  fontSize: 13,
  lineHeight: 20,
  color: '#64748b',
},

registerSelectedTagsWrap: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 10,
  marginBottom: 12,
},

registerSelectedTag: {
  backgroundColor: '#eef7da',
  borderWidth: 1,
  borderColor: '#c9dda0',
  borderRadius: 999,
  paddingHorizontal: 10,
  paddingVertical: 6,
},

registerSelectedTagText: {
  color: '#4d6420',
  fontSize: 12,
  fontWeight: '700',
},

registerNavigationRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  marginBottom: 8,
},

registerSecondaryButton: {
  width: 110,
  backgroundColor: '#eef2f7',
  borderRadius: 16,
  paddingVertical: 14,
  alignItems: 'center',
},

registerSecondaryButtonText: {
  color: '#334155',
  fontWeight: '800',
  fontSize: 14,
},

registerNextButton: {
  flex: 1,
  marginBottom: 0,
},

registerNextButtonDisabled: {
  opacity: 0.75,
},

homeTabsWrap: {
  flexDirection: 'row',
  marginBottom: 16,
},
homeTabButton: {
  flex: 1,
  minHeight: 46,
  borderRadius: 16,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E2E8F0',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 10,
},
homeTabButtonGap: {
  marginRight: 8,
},
homeTabButtonActive: {
  backgroundColor: '#EEF6DF',
  borderColor: '#CFE19A',
},
homeTabButtonText: {
  fontSize: 14,
  fontWeight: '800',
  color: '#475569',
},
homeTabButtonTextActive: {
  color: '#5E7A16',
},


});

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContainer>
        <MainApp />
      </AppContainer>
    </SafeAreaProvider>
  );
}