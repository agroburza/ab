import React, { useEffect, useMemo, useRef, useState } from 'react';
import AlrScreen from './AlrScreen';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import {
  SEKCIJE_POTPORA,
  formatEur,
  formatPostotak,
  formatTarifa,
  uBroj,
} from '../utils/izracunPotporaUtils';
import {
  ALR_STORAGE_KEY,
  buildAlrPdfHtml,
} from '../utils/AlrUtils';

const STORAGE_KEY = 'ab_izracun_poticaja_spremljeni';
const { width } = Dimensions.get('window');
const SIDE_PADDING = 16;
const SLIDE_GAP = 12;
const SLIDE_WIDTH = width - SIDE_PADDING * 2 - 24;

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatVrijednostZaPrikaz(vrijednost, jedinica) {
  const broj = uBroj(vrijednost);
  if (!broj) return '—';
  return `${new Intl.NumberFormat('hr-HR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(broj)} ${jedinica || ''}`.trim();
}

function buildHtmlReport(vrijednosti, rezultat) {
  const datum = new Date().toLocaleString('hr-HR');
  const sekcijeHtml = SEKCIJE_POTPORA.map((sekcija) => {
    const aktivnaPolja = rezultat?.sekcije?.[sekcija.key]?.polja?.filter(
      (polje) =>
        !polje.unosTarife &&
        (uBroj(vrijednosti?.[polje.key]) > 0 || uBroj(polje.iznos) > 0)
    ) || [];

    if (!aktivnaPolja.length) return '';

    const rows = aktivnaPolja
      .map(
        (polje) => `
          <tr>
            <td>${escapeHtml(polje.sifra || '—')}</td>
            <td>${escapeHtml(polje.naziv)}</td>
            <td>${escapeHtml(formatVrijednostZaPrikaz(vrijednosti?.[polje.key], polje.jedinica))}</td>
            <td>${escapeHtml(formatTarifa(polje.tarifaAktivna || 0, polje.tarifaJedinica || '€/ha'))}</td>
            <td>${escapeHtml(formatEur(polje.iznos || 0))}</td>
          </tr>
        `
      )
      .join('');

    return `
      <div class="section">
        <h2>${escapeHtml(sekcija.naslov)}</h2>
        <table>
          <thead>
            <tr>
              <th>Šifra</th>
              <th>Mjera</th>
              <th>Unos</th>
              <th>Tarifa</th>
              <th>Iznos</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="subtotal">Ukupno: ${escapeHtml(formatEur(rezultat?.sekcije?.[sekcija.key]?.zbroj || 0))}</div>
      </div>
    `;
  }).join('');

  const osnovniPodaci = [
    ['Obradiva površina', formatVrijednostZaPrikaz(vrijednosti?.obr_ha, 'ha')],
    ['Granični pojasevi uz vodotokove', formatVrijednostZaPrikaz(vrijednosti?.vodotok_m, 'm')],
    ['Granični pojasevi uz šume', formatVrijednostZaPrikaz(vrijednosti?.sume_m, 'm')],
    ['Jarak', formatVrijednostZaPrikaz(vrijednosti?.jarak_m, 'm')],
    ['Šumarak', formatVrijednostZaPrikaz(vrijednosti?.sumarak_m2, 'm²')],
    ['Ugar', formatVrijednostZaPrikaz(vrijednosti?.ugar_ha, 'ha')],
    ['Leguminoze', formatVrijednostZaPrikaz(vrijednosti?.legum_ha, 'ha')],
  ]
    .map(
      ([label, val]) => `
        <tr>
          <td>${escapeHtml(label)}</td>
          <td>${escapeHtml(val)}</td>
        </tr>
      `
    )
    .join('');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          h1 { margin: 0 0 8px; font-size: 28px; }
          .meta { margin-bottom: 20px; color: #475569; font-size: 12px; }
          .summary {
            background: #7FA52A;
            color: white;
            padding: 18px 20px;
            border-radius: 16px;
            margin-bottom: 24px;
          }
          .summary small { display:block; color:#e4f5bb; margin-bottom:6px; }
          .summary strong { font-size: 30px; }
          .section { margin-bottom: 24px; }
          h2 { font-size: 18px; margin: 0 0 10px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #dbe2ea; padding: 8px; text-align: left; vertical-align: top; }
          th { background: #f8fafc; }
          .subtotal { margin-top: 8px; font-weight: bold; text-align: right; }
          .infoBox {
            border: 1px solid #e5e7eb;
            background: #f8fafc;
            border-radius: 14px;
            padding: 14px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <h1>Izračun poticaja</h1>
        <div class="meta">Datum izrade PDF-a: ${escapeHtml(datum)}</div>

        <div class="summary">
          <small>Ukupni izračun svega</small>
          <strong>${escapeHtml(formatEur(rezultat?.ukupno || 0))}</strong>
        </div>

        ${sekcijeHtml}

        <div class="section">
          <h2>Informativne sekcije</h2>
          <div class="infoBox">
            <strong>Osnovni podaci</strong>
            <table style="margin-top:10px;">
              <tbody>${osnovniPodaci}</tbody>
            </table>
          </div>

          <div class="infoBox">
            <strong>EZP 10%</strong><br />
            ${escapeHtml(formatPostotak(rezultat?.ezpPostotak || 0))}
          </div>

          <div class="infoBox">
            <strong>Uvjetovanost</strong><br />
            ${escapeHtml(formatPostotak(rezultat?.uvjetovanostPostotak || 0))}
          </div>
        </div>
      </body>
    </html>
  `;
}

function buildSavjetnikPdfHtml() {
  const datum = new Date().toLocaleString('hr-HR');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          h1 { margin: 0 0 8px; font-size: 28px; }
          h2 { margin: 22px 0 10px; font-size: 18px; }
          .meta { margin-bottom: 20px; color: #475569; font-size: 12px; }
          .summary {
            background: #7FA52A;
            color: white;
            padding: 18px 20px;
            border-radius: 16px;
            margin-bottom: 22px;
          }
          .summary small { display:block; color:#e4f5bb; margin-bottom:6px; }
          .summary strong { font-size: 24px; }
          .box {
            border: 1px solid #e5e7eb;
            background: #f8fafc;
            border-radius: 14px;
            padding: 14px;
            margin-bottom: 12px;
          }
          li { margin-bottom: 8px; }
          .footer { margin-top: 24px; color: #64748b; font-size: 11px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <h1>Poljoprivredni savjetnik</h1>
        <div class="meta">Datum izrade PDF-a: ${escapeHtml(datum)}</div>

        <div class="summary">
          <small>AB Alati</small>
          <strong>Vodič za korištenje poljoprivrednog savjetnika</strong>
        </div>

        <div class="box">
          <strong>Namjena</strong>
          <p>Poljoprivredni savjetnik služi za brzu pomoć oko zaštite bilja, gnojidbe, bolesti, poticaja i općih proizvodnih pitanja.</p>
        </div>

        <h2>Primjeri pitanja</h2>
        <ul>
          <li>Koju zaštitu primijeniti kod sumnje na bolest lista?</li>
          <li>Kako planirati prihranu prema fazi razvoja kulture?</li>
          <li>Koji su mogući uzroci žućenja usjeva?</li>
          <li>Koje osnovne informacije trebam pripremiti za poticaje?</li>
          <li>Što se može zaključiti iz fotografije problema na biljci?</li>
        </ul>

        <h2>Preporuka za kvalitetan upit</h2>
        <ul>
          <li>Navedite kulturu, sortu ili hibrid ako je poznato.</li>
          <li>Dodajte lokaciju, fazu razvoja i datum pojave simptoma.</li>
          <li>Opišite vremenske uvjete, provedene tretmane i gnojidbu.</li>
          <li>Za vizualne probleme priložite jasnu fotografiju.</li>
        </ul>

        <div class="box">
          <strong>Napomena</strong>
          <p>Savjeti su informativni i trebaju se uskladiti s važećim propisima, registracijama sredstava i stvarnim stanjem na parceli.</p>
        </div>

        <div class="footer">
          Dokument je generiran iz AB Alata kao praktični podsjetnik za korištenje Poljoprivrednog savjetnika.
        </div>
      </body>
    </html>
  `;
}

export default function AlatiScreen({ onBack, onOpenTool }) {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTool, setActiveTool] = useState(null);
  const [savedPoticaji, setSavedPoticaji] = useState(null);
  const [savedAlr, setSavedAlr] = useState(null);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const tools = useMemo(
    () => [
      {
        key: 'poticaji',
        emoji: '🌾',
        title: 'Izračun potpora',
        description:
          'Brzi pregled i izračun osnovnih potpora te ključnih vrijednosti za gospodarstvo.',
        status: 'Dostupno',
      },
      {
        key: 'alr',
        emoji: '🧮',
        title: 'ALR kalkulator',
        description: 'Plan gnojidbe',
        status: 'Dostupno',
      },
      {
        key: 'savjetnik',
        emoji: '📘',
        title: 'Poljoprivredni savjetnik',
        description:
          'Savjeti, preporuke i podrška za poljoprivrednu proizvodnju na jednom mjestu.',
        status: 'Dostupno',
      },
    ],
    []
  );

  useEffect(() => {
    const loadSaved = async () => {
      try {
        setLoadingSaved(true);
        const [poticajiRaw, alrRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(ALR_STORAGE_KEY),
        ]);

        const parsedPoticaji = poticajiRaw ? JSON.parse(poticajiRaw) : [];
        const parsedAlr = alrRaw ? JSON.parse(alrRaw) : [];
        setSavedPoticaji(Array.isArray(parsedPoticaji) && parsedPoticaji.length ? parsedPoticaji[0] : null);
        setSavedAlr(Array.isArray(parsedAlr) && parsedAlr.length ? parsedAlr[0] : null);
      } catch (error) {
        setSavedPoticaji(null);
        setSavedAlr(null);
      } finally {
        setLoadingSaved(false);
      }
    };

    loadSaved();
  }, []);

  const handleScrollEnd = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    const step = SLIDE_WIDTH + SLIDE_GAP;
    const index = Math.round(x / step);
    setActiveIndex(index);
  };

  const handleOpenTool = (tool) => {
    if (tool.key === 'alr') {
      setActiveTool('alr');
      return;
    }

    if (typeof onOpenTool === 'function') {
      onOpenTool(tool);
      return;
    }

    console.log('Open tool:', tool.key);
  };

  const handleDownloadSavedPoticaji = async () => {
    try {
      if (!savedPoticaji?.vrijednosti || !savedPoticaji?.rezultat) {
        Alert.alert('Nema spremljenog izračuna', 'Prvo spremi izračun unutar kalkulatora.');
        return;
      }

      setDownloading(true);
      const html = buildHtmlReport(savedPoticaji.vrijednosti, savedPoticaji.rezultat);
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Preuzmi izračun potpora',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF izrađen', `PDF je izrađen: ${uri}`);
      }
    } catch (error) {
      Alert.alert('Greška', 'PDF nije uspješno izrađen.');
    } finally {
      setDownloading(false);
    }
  };

  const sharePdfFromHtml = async (html, dialogTitle) => {
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle,
        UTI: 'com.adobe.pdf',
      });
    } else {
      Alert.alert('PDF izrađen', `PDF je izrađen: ${uri}`);
    }
  };

  const handleDownloadAlr = async () => {
    try {
      if (!savedAlr?.calculation) {
        Alert.alert('Nema spremljenog ALR izračuna', 'Prvo spremi izračun unutar ALR kalkulatora.');
        return;
      }

      setDownloading(true);
      await sharePdfFromHtml(buildAlrPdfHtml(savedAlr), 'Preuzmi ALR preporuku');
    } catch (error) {
      Alert.alert('Greška', 'ALR PDF nije uspješno izrađen.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadSavjetnik = async () => {
    try {
      setDownloading(true);
      await sharePdfFromHtml(buildSavjetnikPdfHtml(), 'Preuzmi Poljoprivredni savjetnik');
    } catch (error) {
      Alert.alert('Greška', 'PDF savjetnika nije uspješno izrađen.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadTool = (tool) => {
    if (tool.key === 'poticaji') {
      handleDownloadSavedPoticaji();
      return;
    }
    if (tool.key === 'alr') {
      handleDownloadAlr();
      return;
    }
    if (tool.key === 'savjetnik') {
      handleDownloadSavjetnik();
    }
  };

  if (activeTool === 'alr') {
    return <AlrScreen onBack={() => setActiveTool(null)} />;
  }

 return (
  <SafeAreaView style={styles.safe} edges={['left', 'right']}>
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
        <View style={styles.heroCard}>
          <Image
            source={require('../assets/Alati.webp')}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <View style={styles.heroOverlay}>
            <Text style={styles.heroKicker}>🧰 AB Alati</Text>
            <Text style={styles.heroTitle}>Praktični alati na jednom mjestu</Text>
            <Text style={styles.heroText}>
              Odaberi alat i brzo pokreni izračun, kalkulator ili savjetnik.
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dostupni alati</Text>
          <Text style={styles.sectionSubtitle}>
            Svaki alat koristi svoj slajd za pregledniji rad.
          </Text>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled={false}
          decelerationRate="fast"
          snapToInterval={SLIDE_WIDTH + SLIDE_GAP}
          snapToAlignment="start"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sliderContent}
          onMomentumScrollEnd={handleScrollEnd}
        >
          {tools.map((tool) => {
            const showPreuzmi =
              tool.key === 'savjetnik' ||
              (tool.key === 'alr' && !loadingSaved) ||
              (tool.key === 'poticaji' && !loadingSaved && !!savedPoticaji);

            return (
              <View key={tool.key} style={styles.slide}>
                <View style={styles.slideTop}>
                  <Text style={styles.slideEmoji}>{tool.emoji}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{tool.status}</Text>
                  </View>
                </View>

                <Text style={styles.slideTitle}>{tool.title}</Text>
                <Text style={styles.slideDescription}>{tool.description}</Text>

                <View style={styles.slideActionsRow}>
                  <TouchableOpacity
                    style={[styles.openButton, showPreuzmi ? styles.openButtonSplit : null]}
                    activeOpacity={0.85}
                    onPress={() => handleOpenTool(tool)}
                  >
                    <Text style={styles.openButtonText}>Otvori</Text>
                  </TouchableOpacity>

                  {showPreuzmi ? (
                    <TouchableOpacity
                      style={styles.downloadButton}
                      activeOpacity={0.85}
                      onPress={() => handleDownloadTool(tool)}
                      disabled={downloading}
                    >
                      <Text style={styles.downloadButtonText}>
                        {downloading ? 'PDF...' : 'Preuzmi'}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.dotsWrap}>
          {tools.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex ? styles.dotActive : null,
              ]}
            />
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Što dobivamo ovom fazom?</Text>
          <Text style={styles.infoText}>
            Izračun potpora, ALR kalkulator i Poljoprivredni savjetnik imaju PDF dokumente za preuzimanje.
            Za ALR se koristi zadnji spremljeni izračun, a Savjetnik generira praktični vodič za korištenje.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  screen: {
    flex: 1,
  },

  content: {
    paddingBottom: 28,
  },

  topBar: {
    height: 58,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#7fa52a',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    marginTop: -2,
  },

  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  topBarRightSpacer: {
    width: 42,
    height: 42,
  },

  heroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
    borderWidth: 1,
    borderColor: '#dbe3ea',
  },

  heroImage: {
    width: '100%',
    height: 210,
  },

  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: 'rgba(15,23,42,0.35)',
  },

  heroKicker: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },

  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
  },

  heroText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#f8fafc',
  },

  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 22,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6b7280',
  },

  sliderContent: {
    paddingLeft: SIDE_PADDING,
    paddingRight: SIDE_PADDING - 12,
  },

  slide: {
    width: SLIDE_WIDTH,
    minHeight: 270,
    marginRight: SLIDE_GAP,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 18,
    justifyContent: 'space-between',
  },

  slideTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  slideEmoji: {
    fontSize: 34,
  },

  statusBadge: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
  },

  slideTitle: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 10,
  },

  slideDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: '#4b5563',
    marginBottom: 20,
  },

  slideActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  openButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#7FA52A',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },

  openButtonSplit: {
    flex: 1,
    alignSelf: 'stretch',
  },

  openButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
  },

  downloadButton: {
    minWidth: 108,
    backgroundColor: '#eef6df',
    borderWidth: 1,
    borderColor: '#d7e7b4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },

  downloadButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#5b7b17',
    textAlign: 'center',
  },

  dotsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 10,
  },

  dot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 5,
  },

  dotActive: {
    width: 22,
    backgroundColor: '#7FA52A',
  },

  infoBox: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
  },

  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#4b5563',
  },
});