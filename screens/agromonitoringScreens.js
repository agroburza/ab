import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  buildAgroMonitoringSummary,
  getAgroMonitoringTheme,
} from '../utils/agromonitoringUtils';

const AUTH_BOOTSTRAP_URL = 'https://ab.hr/?app_auth=1&redirect=/agro-monitoring/';
const TARGET_URL = 'https://ab.hr/agro-monitoring/?mobile=1&app_embed=1';
const HIDE_WEB_FOOTER_JS = `
  (function () {
    var styleId = 'ab-go-hide-agromonitoring-footer';
    var css = [
      'html, body { background: #ffffff !important; }',
      'footer, #footer, .footer, .site-footer, .footer-area, .footer-widgets, .elementor-location-footer, .ast-footer, .wp-footer { display: none !important; height: 0 !important; min-height: 0 !important; overflow: hidden !important; }',
      '.grecaptcha-badge, .cky-consent-container, .cookie-notice-container { display: none !important; }',
      'body > *:last-child:is(footer), body > footer:last-child { display: none !important; }'
    ].join('\\n');

    function applyFooterCleanup() {
      if (!document.getElementById(styleId)) {
        var style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = css;
        (document.head || document.documentElement).appendChild(style);
      }

      var selectors = [
        'footer',
        '#footer',
        '.footer',
        '.site-footer',
        '.footer-area',
        '.footer-widgets',
        '.elementor-location-footer',
        '.ast-footer',
        '.wp-footer'
      ];

      selectors.forEach(function (selector) {
        document.querySelectorAll(selector).forEach(function (el) {
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('height', '0', 'important');
          el.style.setProperty('min-height', '0', 'important');
          el.style.setProperty('overflow', 'hidden', 'important');
        });
      });
    }

    applyFooterCleanup();
    new MutationObserver(applyFooterCleanup).observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  })();
  true;
`;

export default function AgroMonitoringScreen({ authToken, apiRequest }) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCard, setActiveCard] = useState('summary');
  const [webReady, setWebReady] = useState(false);
  const [redirectedToTarget, setRedirectedToTarget] = useState(false);

  const webRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      setError('');
      const json = await apiRequest('/agro/monitoring', { method: 'GET' }, authToken);
      setPayload(json?.data || json?.payload || json || null);
    } catch (err) {
      setError(err?.message || 'Ne mogu dohvatiti AgroMonitoring podatke.');
    }
  }, [apiRequest, authToken]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        await loadData();
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [loadData]);

  const summary = useMemo(() => buildAgroMonitoringSummary(payload), [payload]);
  const theme = getAgroMonitoringTheme(summary.level);

  const handleWebNavChange = useCallback(
    (navState) => {
      const url = String(navState?.url || '');

      if (url.includes('/agro-monitoring')) {
        setRedirectedToTarget(true);
        setWebReady(true);
        return;
      }

      const isRootLike =
        url === 'https://ab.hr/' ||
        url === 'https://ab.hr' ||
        url.includes('?app_auth=1');

      if (isRootLike && webRef.current && !redirectedToTarget) {
        setRedirectedToTarget(true);
        webRef.current.injectJavaScript(
          `window.location.replace(${JSON.stringify(TARGET_URL)}); true;`
        );
      }
    },
    [redirectedToTarget]
  );

  return (
    <View style={styles.root}>
      <View style={styles.topTabsRow}>
        <TouchableOpacity
          style={[styles.topTabButton, activeCard === 'summary' && styles.topTabButtonActive]}
          onPress={() => setActiveCard('summary')}
          activeOpacity={0.9}
        >
          <Text style={[styles.topTabText, activeCard === 'summary' && styles.topTabTextActive]}>
            Stanje
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.topTabButton, activeCard === 'map' && styles.topTabButtonActive]}
          onPress={() => setActiveCard('map')}
          activeOpacity={0.9}
        >
          <Text style={[styles.topTabText, activeCard === 'map' && styles.topTabTextActive]}>
            Rizici
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.screenContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#7FA52A" />
          </View>
        ) : (
          <>
            {activeCard === 'summary' ? (
            <View style={styles.summaryCard}>
              <Text style={styles.sectionEyebrow}>AgroMonitoring danas</Text>

              <View style={styles.kpiGrid}>
                {summary.kpis.map((kpi) => {
                  const cardTheme = getAgroMonitoringTheme(kpi.level);
                  return (
                    <View
                      key={kpi.key}
                      style={[
                        styles.kpiCard,
                        {
                          backgroundColor: cardTheme.background,
                          borderColor: cardTheme.border,
                        },
                      ]}
                    >
                      <Text style={styles.kpiLabel}>
                        {kpi.emoji} {kpi.label}
                      </Text>
                      <Text style={styles.kpiValue}>{kpi.value}</Text>
                      {kpi.subvalue ? (
                        <Text style={styles.kpiSubvalue}>{kpi.subvalue}</Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>

              <View
                style={[
                  styles.recommendationCard,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={styles.recommendationTitle}>Preporuke</Text>
                {summary.messages.map((msg, idx) => (
                  <View key={`${idx}-${msg.slice(0, 12)}`} style={styles.recommendationRow}>
                    <Text style={styles.recommendationBullet}>-</Text>
                    <Text style={styles.recommendationText}>{msg}</Text>
                  </View>
                ))}
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
            ) : null}

            <View
              pointerEvents={activeCard === 'map' ? 'auto' : 'none'}
              style={[
                styles.detailCard,
                activeCard !== 'map' && styles.detailCardPreload,
              ]}
            >
              <View style={styles.webCard}>
                <WebView
                  ref={webRef}
                  source={{ uri: AUTH_BOOTSTRAP_URL }}
                  style={styles.webView}
                  onNavigationStateChange={handleWebNavChange}
                  onLoadEnd={() => setWebReady(true)}
                  injectedJavaScriptBeforeContentLoaded={HIDE_WEB_FOOTER_JS}
                  injectedJavaScript={HIDE_WEB_FOOTER_JS}
                  startInLoadingState={false}
                  javaScriptEnabled
                  domStorageEnabled
                  nestedScrollEnabled
                  overScrollMode="never"
                  bounces={false}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                />
                {!webReady ? (
                  <View style={styles.webLoadingOverlay}>
                    <ActivityIndicator size="large" color="#7FA52A" />
                  </View>
                ) : null}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  screenContent: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 24,
  },
  topTabsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 16,
  },
  topTabButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DDE5EF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTabButtonActive: {
    backgroundColor: '#EEF6DF',
    borderColor: '#CFE19A',
  },
  topTabText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#475569',
  },
  topTabTextActive: {
    color: '#5E7A16',
  },
  loadingWrap: {
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  sectionEyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  kpiCard: {
    flexBasis: '47%',
    flexGrow: 1,
    height: 104,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  kpiLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    color: '#475569',
  },
  kpiValue: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '900',
    color: '#111827',
    marginTop: 8,
  },
  kpiSubvalue: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  recommendationCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  recommendationTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  recommendationBullet: {
    width: 16,
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '900',
    color: '#7FA52A',
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
    color: '#475569',
  },
  errorText: {
    fontSize: 12,
    color: '#b91c1c',
    marginTop: 8,
  },
  detailCard: {
    backgroundColor: 'transparent',
    marginHorizontal: -16,
  },
  detailCardPreload: {
    height: 1,
    opacity: 0,
    overflow: 'hidden',
    marginBottom: 0,
  },
  webCard: {
    height: 720,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 0,
    backgroundColor: '#FFFFFF',
  },
  webView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
});