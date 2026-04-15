import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import ListingCard from '../components/ListingCard';

export default function FavoritiScreen({
  onOpenDetail,
  favoriteAdsData = [],
  onToggleFavoriteAd,
}) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Spremljeni oglasi</Text>

        {favoriteAdsData.length === 0 ? (
          <Text style={styles.emptyText}>Nema spremljenih oglasa.</Text>
        ) : (
          favoriteAdsData.map((item) => (
            <ListingCard
              key={item.id}
              item={{
                ...item,
                is_favorite: true,
              }}
              onPress={() => onOpenDetail(item.id)}
              onToggleFavorite={() => onToggleFavoriteAd(item)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  content: {
    padding: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
});