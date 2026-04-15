import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const formatDateHR = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('hr-HR');
};

export default function LicenseBanner({
  isLoggedIn,
  licenseData,
  onRenew,
  styles = {},
}) {
  if (!isLoggedIn || !licenseData) return null;

  const state = licenseData?.license_state;
  if (state !== 'expiring' && state !== 'expired') return null;

  return (
    <View
      style={[
        styles.licenseBanner,
        state === 'expired'
          ? styles.licenseBannerExpired
          : styles.licenseBannerExpiring,
      ]}
    >
      <View style={{ flex: 1 }}>
  <Text style={styles.licenseBannerTitle}>
    {state === 'expired' ? 'Licenca je istekla' : 'Licenca uskoro ističe'}
  </Text>

  <Text style={styles.licenseBannerText}>
    {state === 'expired'
      ? 'Produžite licencu kako bi AB+ ostao dostupan.'
      : `Ističe: ${formatDateHR(licenseData.license_expires_at)}`}
  </Text>
</View>

      <TouchableOpacity
        style={styles.licenseBannerButton}
        onPress={onRenew}
        activeOpacity={0.9}
      >
        <Text style={styles.licenseBannerButtonText}>
          Produži licencu
        </Text>
      </TouchableOpacity>
    </View>
  );
}