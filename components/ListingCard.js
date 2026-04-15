import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

const ZUPANIJA_EMOJI = {
  'Bjelovarsko-bilogorska': '🐄',
  'Brodsko-posavska': '🚤',
  'Dubrovačko-neretvanska': '🏖️',
  'Istarska': '🍷',
  'Karlovačka': '🏞️',
  'Koprivničko-križevačka': '🌾',
  'Krapinsko-zagorska': '⛰️',
  'Ličko-senjska': '🐻',
  'Međimurska': '🌿',
  'Osječko-baranjska': '🌽',
  'Požeško-slavonska': '🍇',
  'Primorsko-goranska': '⚓',
  'Sisačko-moslavačka': '🌊',
  'Splitsko-dalmatinska': '🌊',
  'Šibensko-kninska': '🏝️',
  'Varaždinska': '🏰',
  'Virovitičko-podravska': '🌻',
  'Vukovarsko-srijemska': '🌾',
  'Zadarska': '🌅',
  'Zagrebačka': '🌳',
  'Grad Zagreb': '🏙️',
};

const getZupanijaLabel = (zupanija = '') => {
  const raw = String(zupanija || '').trim();
  if (!raw) return '';

  const normalized = raw.replace(/^[^\p{L}]+/u, '').trim();
  const emoji = ZUPANIJA_EMOJI[normalized] || '📍';

  return `${emoji} ${normalized}`;
};

export default function ListingCard({
  item,
  onPress,
  onToggleFavorite,
}) {
  const isOnRequest = item.price_label === 'Na upit' || item.price_on_request === '1';
  const isFavorite = !!item?.is_favorite;
  const imageUri = item.image || item.featured_image || item.gallery?.[0] || '';

  const getConditionStyle = () => {
    switch (item.condition) {
      case 'novo':
        return styles.conditionNovo;
      case 'rabljeno':
        return styles.conditionRabljeno;
      case 'prodano':
        return styles.conditionProdano;
      default:
        return styles.conditionDefault;
    }
  };

  const getConditionLabel = () => {
    switch (item.condition) {
      case 'novo':
        return 'Novo';
      case 'rabljeno':
        return 'Rabljeno';
      case 'prodano':
        return 'Prodano';
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageWrap}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.noImage]}>
            <Text>Nema slike</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.favoriteBtn,
            isFavorite && styles.favoriteBtnActive,
          ]}
          onPress={(e) => {
            e.stopPropagation?.();
            onToggleFavorite && onToggleFavorite(item);
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.favoriteText,
              isFavorite && styles.favoriteTextActive,
            ]}
          >
            {isFavorite ? '💚' : '🤍'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.badgeRow}>
        <View
          style={[
            styles.priceBadge,
            isOnRequest ? styles.priceOnRequest : styles.priceNormal,
          ]}
        >
          <Text style={styles.priceText}>
            {item.price_label || (isOnRequest ? 'Na upit' : item.price ? `${item.price} €` : 'Na upit')}
          </Text>
        </View>

        {item.condition ? (
          <View style={[styles.conditionBadge, getConditionStyle()]}>
            <Text style={styles.conditionText}>
              {getConditionLabel()}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.metaWrap}>
          {!!item.zupanija && (
            <Text style={styles.meta} numberOfLines={2}>
              {getZupanijaLabel(item.zupanija)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 2,
    flex: 1,
  },

  imageWrap: {
    position: 'relative',
  },

  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#eee',
  },

  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
  },

  priceBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },

  priceNormal: {
    backgroundColor: '#dc2626',
  },

  priceOnRequest: {
    backgroundColor: '#111',
  },

  priceText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },

  conditionBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  conditionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },

  conditionNovo: {
    backgroundColor: '#16a34a',
  },

  conditionRabljeno: {
    backgroundColor: '#ca8a04',
  },

  conditionProdano: {
    backgroundColor: '#6b7280',
  },

  conditionDefault: {
    backgroundColor: '#9ca3af',
  },

  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },

  favoriteBtnActive: {
    backgroundColor: '#dcfce7',
  },

  favoriteText: {
    fontSize: 20,
  },

  favoriteTextActive: {
    color: '#16a34a',
  },

  content: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 14,
    minHeight: 122,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 22,
    minHeight: 44,
    color: '#111827',
  },

  metaWrap: {
    minHeight: 42,
    justifyContent: 'flex-start',
  },

  meta: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
