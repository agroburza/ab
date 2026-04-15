import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';

import {
  fetchOglasiByAuthor,
  fetchUserProfile,
} from '../services/oglasnikApi';
import ListingCard from '../components/ListingCard';

export default function OglasiProdavateljaScreen({
  sellerId,
  sellerName,
  onOpenDetail,
}) {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSellerData = useCallback(async () => {
    try {
      setLoading(true);

      const [profile, ads] = await Promise.all([
        fetchUserProfile(sellerId),
        fetchOglasiByAuthor(sellerId),
      ]);

      setUser(profile);
      setItems(Array.isArray(ads) ? ads : []);
    } catch (error) {
      console.log('Greška loadSellerData:', error?.message || error);
      setUser(null);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    if (!sellerId) return;
    loadSellerData();
  }, [sellerId, loadSellerData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Učitavanje profila prodavatelja...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>👤</Text>
            </View>
          )}

          <Text style={styles.name}>
            {user?.name || sellerName || 'Prodavatelj'}
          </Text>

          {!!user?.gospodarstvo && (
            <Text style={styles.farm}>{user.gospodarstvo}</Text>
          )}

          {!!(user?.mjesto || user?.zupanija) && (
            <Text style={styles.location}>
              {[user?.mjesto, user?.zupanija].filter(Boolean).join(', ')}
            </Text>
          )}
        </View>

        <View style={styles.adsCard}>
          <Text style={styles.adsTitle}>Oglasi prodavatelja</Text>
          <Text style={styles.adsCount}>Ukupno oglasa: {items.length}</Text>

          {items.length === 0 ? (
            <Text style={styles.emptyText}>
              Trenutno nema objavljenih oglasa ovog prodavatelja.
            </Text>
          ) : (
            items.map((ad) => (
              <ListingCard
                key={ad.id}
                item={ad}
                onPress={() => onOpenDetail && onOpenDetail(ad.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },

  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },

  contentContainer: {
    padding: 12,
    paddingBottom: 28,
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  loadingText: {
    marginTop: 10,
    color: '#666',
  },

  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 22,
    marginBottom: 12,
    alignItems: 'center',
  },

  avatar: {
    width: 92,
    height: 92,
    borderRadius: 999,
    marginBottom: 12,
  },

  avatarPlaceholder: {
    width: 92,
    height: 92,
    borderRadius: 999,
    backgroundColor: '#eef2f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  avatarPlaceholderText: {
    fontSize: 34,
  },

  name: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },

  farm: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5b7f13',
    textAlign: 'center',
    marginBottom: 4,
  },

  location: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },

  adsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },

  adsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },

  adsCount: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
  },

  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
});