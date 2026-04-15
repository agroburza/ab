import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchAgroHome } from '../services/agroApi';

function StatChip({ item }) {
  const value = item?.value ?? '-';
  const unit = item?.unit || '';
  return (
    <View style={styles.statChip}>
      <Text style={styles.statLabel}>{item?.label || ''}</Text>
      <Text style={styles.statValue}>{`${value}${unit ? ` ${unit}` : ''}`}</Text>
    </View>
  );
}

function ModuleCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.moduleCard} activeOpacity={0.85} onPress={() => onPress?.(item)}>
      <View style={styles.moduleTopRow}>
        <Text style={styles.moduleEmoji}>{item?.emoji || '📦'}</Text>
        <Text style={styles.moduleTitle}>{item?.title || 'Modul'}</Text>
      </View>

      <Text style={styles.moduleDescription}>{item?.description || ''}</Text>
      <Text style={styles.moduleBadge}>{item?.badge || ''}</Text>

      <View style={styles.highlightsWrap}>
        {(item?.highlights || []).map((highlight) => (
          <View key={highlight.key || highlight.label} style={styles.highlightPill}>
            <Text style={styles.highlightText}>
              {highlight.label}: {highlight.value ?? '-'}{highlight.unit ? ` ${highlight.unit}` : ''}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

export default function AgroHomeScreen({
  baseUrl,
  apiKey,
  authToken,
  onOpenMeteo,
  onOpenMonitoring,
}) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState(null);

  const load = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      setError('');
      const data = await fetchAgroHome({ baseUrl, apiKey, authToken });
      setPayload(data);
    } catch (err) {
      setError(err?.message || 'Greška kod učitavanja Agro centra.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiKey, authToken, baseUrl]);

  useEffect(() => {
    load(false);
  }, [load]);

  const handleOpenModule = (module) => {
    if (module?.key === 'agro_meteo') {
      onOpenMeteo?.(module);
      return;
    }
    if (module?.key === 'agro_monitoring') {
      onOpenMonitoring?.(module);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Učitavanje Agro centra...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Greška</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => load(false)}>
          <Text style={styles.retryButtonText}>Pokušaj ponovno</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const summary = payload?.summary || {};
  const location = payload?.location || {};
  const user = payload?.user || {};

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>🚜 Agro centar</Text>
        <Text style={styles.heroSubtitle}>{user?.farm_name || 'Vaše gospodarstvo'}</Text>
        <Text style={styles.heroMeta}>{location?.place || '-'}{location?.county ? ` • ${location.county}` : ''}</Text>
        <Text style={styles.heroRisk}>Status: {summary?.message || 'Nema podataka'}</Text>
      </View>

      <Text style={styles.sectionTitle}>Brzi podaci</Text>
      <View style={styles.statsWrap}>
        {(payload?.quick_stats || []).map((item) => (
          <StatChip key={item.key || item.label} item={item} />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Moduli</Text>
      {(payload?.modules || []).map((module) => (
        <ModuleCard key={module.key} item={module} onPress={handleOpenModule} />
      ))}

      {!!payload?.alerts?.length && (
        <>
          <Text style={styles.sectionTitle}>Aktivni alarmi</Text>
          <View style={styles.alertsWrap}>
            {payload.alerts.map((alert, index) => (
              <View key={`${alert.type}-${index}`} style={styles.alertItem}>
                <Text style={styles.alertText}>{alert.emoji ? `${alert.emoji} ` : ''}{alert.label || alert.type}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f6f8' },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  loadingText: { marginTop: 10, color: '#666' },
  errorTitle: { fontSize: 20, fontWeight: '700', marginBottom: 10 },
  errorText: { textAlign: 'center', color: '#555', marginBottom: 16 },
  retryButton: { backgroundColor: '#7FA52A', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  retryButtonText: { color: '#fff', fontWeight: '700' },
  heroCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 16 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#1f2937' },
  heroSubtitle: { fontSize: 16, fontWeight: '700', marginTop: 6, color: '#334155' },
  heroMeta: { marginTop: 4, color: '#64748b' },
  heroRisk: { marginTop: 12, fontSize: 15, fontWeight: '700', color: '#111827' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1f2937', marginBottom: 12, marginTop: 4 },
  statsWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 },
  statChip: { width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginRight: '4%', marginBottom: 12 },
  statLabel: { fontSize: 12, color: '#64748b', marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#111827' },
  moduleCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 14 },
  moduleTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  moduleEmoji: { fontSize: 22, marginRight: 8 },
  moduleTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  moduleDescription: { color: '#475569', marginBottom: 8 },
  moduleBadge: { fontWeight: '700', color: '#334155', marginBottom: 10 },
  highlightsWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  highlightPill: { backgroundColor: '#eef2f7', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, marginRight: 8, marginBottom: 8 },
  highlightText: { color: '#334155', fontSize: 12, fontWeight: '600' },
  alertsWrap: { marginTop: 2 },
  alertItem: { backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 10 },
  alertText: { color: '#111827', fontWeight: '600' },
});
