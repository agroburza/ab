import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  useWindowDimensions,
  Image,
  Dimensions,
  TouchableOpacity,
  Linking,
  Share,
  TextInput,
  Modal,

} from 'react-native';
import RenderHtml from 'react-native-render-html';

import {
  fetchOglasDetail,
  fetchSimilarOglasi,
  fetchChatMessages,
  sendChatMessage,
} from '../services/oglasnikApi';

import ListingCard from '../components/ListingCard';

const { width: screenWidth } = Dimensions.get('window');
const GALLERY_HEIGHT = screenWidth * 0.72;
const THUMB_SIZE = 74;


const ICON_CALL = require('../assets/call.png');
const ICON_SMS = require('../assets/sms.png');
const ICON_VIBER = require('../assets/viber.png');
const ICON_WHATSAPP = require('../assets/watsup.png');
const ICON_BACK = require('../assets/back.png');



export default function OglasDetaljScreen({
  oglasId,
  onBack,
  onOpenDetail,
  onOpenSellerAds,
  authToken,
  favoriteAdIds = [],
  onToggleFavoriteAd,
}) {
  const { width } = useWindowDimensions();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [similarItems, setSimilarItems] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);



const adId = item?.id;
const adOwnerId = item?.author_id || item?.user_id;
const currentUserId = Number(item?.current_user_id || 0);


 const [chatVisible, setChatVisible] = useState(false);

const [message, setMessage] = useState('');
const [messages, setMessages] = useState([]);
const [chatLoading, setChatLoading] = useState(false);

const loadChatMessages = useCallback(async () => {
  if (!adId || !adOwnerId || !authToken) return;

  try {
    setChatLoading(true);

    const rows = await fetchChatMessages({
      adId,
      userId: adOwnerId,
      token: authToken,
    });

    setMessages(Array.isArray(rows) ? rows : []);
  } catch (error) {
    console.log('Greška loadChatMessages:', error?.message || error);
  } finally {
    setChatLoading(false);
  }
}, [adId, adOwnerId, authToken]);

const handleOpenChat = async () => {
  setChatVisible(true);
  await loadChatMessages();
};

const handleSendMessage = async () => {
  if (!message.trim() || !adId || !adOwnerId || !authToken) return;

  try {
    await sendChatMessage({
      adId,
      receiverId: adOwnerId,
      message,
      token: authToken,
    });

    setMessage('');
    await loadChatMessages();
  } catch (error) {
    console.log('Greška handleSendMessage:', error?.message || error);
  }
};

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchOglasDetail(oglasId);
      setItem(data);
      setActiveImage(0);
    } catch (error) {
      console.log('Greška loadDetail:', error?.message || error);
    } finally {
      setLoading(false);
    }
  }, [oglasId]);

  const loadSimilar = useCallback(async () => {
    try {
      setSimilarLoading(true);
      const items = await fetchSimilarOglasi(oglasId);
      setSimilarItems(items || []);
    } catch (error) {
      console.log('Greška loadSimilar:', error?.message || error);
    } finally {
      setSimilarLoading(false);
    }
  }, [oglasId]);

 

 

  useEffect(() => {
    if (!oglasId) return;
    loadDetail();
    loadSimilar();
  }, [oglasId, loadDetail, loadSimilar]);

 

useEffect(() => {
  if (!chatVisible) return;

  loadChatMessages();
  const interval = setInterval(loadChatMessages, 3000);

  return () => clearInterval(interval);
}, [chatVisible, loadChatMessages]);

  const handleCall = async () => {
    if (!item?.phone) return;

    try {
      await Linking.openURL(`tel:${item.phone}`);
    } catch (error) {
      console.log('Greška call:', error?.message || error);
    }
  };

  const handleSms = async () => {
    if (!item?.phone) return;

    try {
      await Linking.openURL(`sms:${item.phone}`);
    } catch (error) {
      console.log('Greška sms:', error?.message || error);
    }
  };

  const handleViber = async () => {
    if (!item?.phone) return;

    try {
      const cleanPhone = String(item.phone).replace(/[^\d+]/g, '');
      await Linking.openURL(`viber://chat?number=${cleanPhone}`);
    } catch (error) {
      console.log('Greška viber:', error?.message || error);
    }
  };

  const handleWhatsApp = async () => {
    if (!item?.phone) return;

    try {
      const cleanPhone = String(item.phone).replace(/[^\d]/g, '');
      await Linking.openURL(`https://wa.me/${cleanPhone}`);
    } catch (error) {
      console.log('Greška whatsapp:', error?.message || error);
    }
  };

  const handleShare = async () => {
    try {
      const shareText = item?.permalink
        ? `${item?.title || 'Oglas'}${
            item?.price_label ? ` - ${item.price_label}` : ''
          }\n${item.permalink}`
        : `${item?.title || 'Oglas'}${
            item?.price_label ? ` - ${item.price_label}` : ''
          }`;

      await Share.share({
        message: shareText,
        url: item?.permalink || undefined,
      });
    } catch (error) {
      console.log('Greška share:', error?.message || error);
    }
  };

  const handleOpenSellerAds = () => {
    const sellerId = item?.author_id || item?.user_id || null;

    if (!sellerId || !onOpenSellerAds) return;

    onOpenSellerAds(
      sellerId,
      item?.author_name || item?.naziv_gospodarstva || 'Prodavatelj'
    );
  };

  const handleToggleFavorite = async () => {
    try {
      if (onToggleFavoriteAd && item) {
        await onToggleFavoriteAd(item);
      }
    } catch (error) {
      console.log('Greška favorite:', error?.message || error);
    }
  };


  const gallery = useMemo(() => {
    if (Array.isArray(item?.gallery) && item.gallery.length) {
      return item.gallery;
    }

    if (item?.featured_image) {
      return [item.featured_image];
    }

    return [];
  }, [item]);

  const currentImage = gallery[activeImage] || '';
  const isFavorite = favoriteAdIds.includes(oglasId);

  const conditionLabel = useMemo(() => {
    if (item?.condition === 'novo') return 'Novo';
    if (item?.condition === 'rabljeno') return 'Rabljeno';
    if (item?.condition === 'prodano') return 'Prodano';
    return item?.condition || '';
  }, [item?.condition]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Učitavanje detalja oglasa...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.notFoundTitle}>Oglas nije pronađen.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.galleryWrap}>
            {currentImage ? (
              <Image
                source={{ uri: currentImage }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.heroImage, styles.noImage]}>
                <Text style={styles.noImageText}>Nema slike</Text>
              </View>
            )}
          </View>

          <View style={styles.badgeRow}>
            {!!item?.is_highlighted && (
              <View style={styles.highlightedInlineBadge}>
                <Text style={styles.highlightedInlineBadgeText}>ISTAKNUTO</Text>
              </View>
            )}

            {!!item?.price_label && (
              <View
                style={[
                  styles.priceBadge,
                  item.price_label === 'Na upit'
                    ? styles.priceOnRequest
                    : styles.priceNormal,
                ]}
              >
                <Text style={styles.priceBadgeText}>{item.price_label}</Text>
              </View>
            )}

            {!!item?.condition && (
              <View
                style={[
                  styles.conditionInlineBadge,
                  item.condition === 'novo'
                    ? styles.conditionNovo
                    : item.condition === 'rabljeno'
                      ? styles.conditionRabljeno
                      : item.condition === 'prodano'
                        ? styles.conditionProdano
                        : styles.conditionDefault,
                ]}
              >
                <Text style={styles.conditionInlineBadgeText}>
                  {conditionLabel}
                </Text>
              </View>
            )}

            <View style={styles.flexSpacer} />

            <TouchableOpacity
              style={styles.favoriteInlineButton}
              onPress={handleToggleFavorite}
              activeOpacity={0.9}
            >
              <Text style={styles.favoriteInlineButtonText}>
                {isFavorite ? '💚' : '🤍'}
              </Text>
            </TouchableOpacity>
          </View>

          {gallery.length > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbRow}
            >
              {gallery.map((img, index) => {
                const isActive = index === activeImage;

                return (
                  <TouchableOpacity
                    key={`${img}-${index}`}
                    style={[styles.thumbWrap, isActive && styles.thumbWrapActive]}
                    onPress={() => setActiveImage(index)}
                    activeOpacity={0.88}
                  >
                    <Image
                      source={{ uri: img }}
                      style={styles.thumbImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : null}

          <View style={styles.content}>
            <View style={styles.titleCard}>
              <Text style={styles.title}>{item?.title}</Text>

              <View style={styles.titleActionsRow}>
                <TouchableOpacity
                  onPress={onBack}
                  style={styles.titleBackButton}
                  activeOpacity={0.85}
                >
                  <Image source={ICON_BACK} style={styles.titleBackIcon} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shareButtonCompact}
                  onPress={handleShare}
                  activeOpacity={0.9}
                >
                  <Text style={styles.shareButtonText}>Podijeli oglas</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Osnovne informacije</Text>

              {!!item?.main_category && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Glavna kategorija</Text>
                  <Text style={styles.infoValue}>{item.main_category}</Text>
                </View>
              )}

              {!!item?.category && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Kategorija</Text>
                  <Text style={styles.infoValue}>{item.category}</Text>
                </View>
              )}

              {!!conditionLabel && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Stanje</Text>
                  <Text style={styles.infoValue}>{conditionLabel}</Text>
                </View>
              )}

              {!!item?.zupanija && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Županija</Text>
                  <Text style={styles.infoValue}>{item.zupanija}</Text>
                </View>
              )}

              {!!item?.mjesto && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Mjesto</Text>
                  <Text style={styles.infoValue}>{item.mjesto}</Text>
                </View>
              )}

              {!!item?.adresa && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Adresa</Text>
                  <Text style={styles.infoValue}>{item.adresa}</Text>
                </View>
              )}
            </View>

            <View style={styles.sellerCard}>
              <Text style={styles.cardTitle}>Prodavatelj</Text>

              <TouchableOpacity
                style={styles.sellerHeader}
                onPress={handleOpenSellerAds}
                activeOpacity={0.7}
              >
                {item?.author_avatar ? (
                  <Image
                    source={{ uri: item.author_avatar }}
                    style={styles.sellerAvatar}
                  />
                ) : (
                  <View style={styles.sellerAvatarPlaceholder}>
                    <Text style={styles.sellerAvatarPlaceholderText}>👤</Text>
                  </View>
                )}

                <View style={styles.sellerHeaderText}>
                  {!!item?.author_name && (
                    <Text style={styles.sellerName}>{item.author_name}</Text>
                  )}
                  {!!item?.naziv_gospodarstva && (
                    <Text style={styles.sellerFarm}>
                      {item.naziv_gospodarstva}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.contactRow}>
                <TouchableOpacity
  onPress={handleOpenChat}
  style={styles.contactBtn}
  activeOpacity={0.85}
>
  <Text style={styles.contactEmoji}>🧑‍🌾</Text>
</TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCall}
                  style={[
                    styles.contactBtn,
                    !item?.phone && styles.contactBtnDisabled,
                  ]}
                  activeOpacity={0.85}
                  disabled={!item?.phone}
                >
                  <Image source={ICON_CALL} style={styles.contactIcon} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSms}
                  style={[
                    styles.contactBtn,
                    !item?.phone && styles.contactBtnDisabled,
                  ]}
                  activeOpacity={0.85}
                  disabled={!item?.phone}
                >
                  <Image source={ICON_SMS} style={styles.contactIcon} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleViber}
                  style={[
                    styles.contactBtn,
                    !item?.phone && styles.contactBtnDisabled,
                  ]}
                  activeOpacity={0.85}
                  disabled={!item?.phone}
                >
                  <Image source={ICON_VIBER} style={styles.contactIcon} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleWhatsApp}
                  style={[
                    styles.contactBtn,
                    !item?.phone && styles.contactBtnDisabled,
                  ]}
                  activeOpacity={0.85}
                  disabled={!item?.phone}
                >
                  <Image source={ICON_WHATSAPP} style={styles.contactIcon} />
                </TouchableOpacity>
              </View>
            </View>

            

            <View style={styles.descriptionCard}>
              <Text style={styles.cardTitle}>Opis oglasa</Text>

              <RenderHtml
                contentWidth={width - 48}
                source={{ html: item?.description_html || '<p>Nema opisa.</p>' }}
              />
            </View>

            <View style={styles.similarCard}>
              <Text style={styles.cardTitle}>Slični oglasi</Text>

              {similarLoading ? (
                <ActivityIndicator />
              ) : similarItems.length === 0 ? (
                <Text style={styles.noSimilarText}>
                  Trenutno nema sličnih oglasa.
                </Text>
              ) : (
                similarItems.map((similar) => (
                  <ListingCard
                    key={similar.id}
                    item={{
                      ...similar,
                      is_favorite: favoriteAdIds.includes(similar.id),
                    }}
                    onPress={() => onOpenDetail && onOpenDetail(similar.id)}
                    onToggleFavorite={onToggleFavoriteAd}
                  />
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </View>
      <Modal
  visible={chatVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setChatVisible(false)}
>
  <View style={styles.chatModalOverlay}>
    <View style={styles.chatModalCard}>
      <View style={styles.chatModalHeader}>
        <Text style={styles.chatModalTitle}>Chat s prodavateljem</Text>

        <TouchableOpacity
          onPress={() => setChatVisible(false)}
          style={styles.chatCloseBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.chatCloseBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.chatMessagesWrap}
        contentContainerStyle={styles.chatMessagesContent}
        showsVerticalScrollIndicator={false}
      >
        {chatLoading ? (
          <ActivityIndicator />
        ) : messages.length === 0 ? (
          <Text style={styles.noSimilarText}>Još nema poruka.</Text>
        ) : (
          messages.map((msg) => {
            const isMe = Number(msg.sender_id) === currentUserId;

            return (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  isMe ? styles.myMessage : styles.otherMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isMe && styles.myMessageText,
                  ]}
                >
                  {msg.message}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.chatInputRow}>
        <TextInput
          style={styles.chatInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Upiši poruku..."
          placeholderTextColor="#94a3b8"
        />

        <TouchableOpacity
          onPress={handleSendMessage}
          style={styles.sendBtn}
          activeOpacity={0.9}
        >
          <Text style={styles.sendBtnText}>Pošalji</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },

  screen: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },

  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },

  contentContainer: {
    paddingBottom: 28,
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },

  loadingText: {
    marginTop: 10,
    color: '#666',
  },

  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },

  galleryWrap: {
    backgroundColor: '#fff',
  },

  heroImage: {
    width: '100%',
    height: GALLERY_HEIGHT,
    backgroundColor: '#ececec',
  },

  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  noImageText: {
    color: '#777',
    fontSize: 15,
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },

  highlightedInlineBadge: {
    backgroundColor: '#f59e0b',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },

  highlightedInlineBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },

  priceBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
  },

  priceNormal: {
    backgroundColor: '#dc2626',
  },

  priceOnRequest: {
    backgroundColor: '#111827',
  },

  priceBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },

  conditionInlineBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  conditionInlineBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
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

  flexSpacer: {
    flex: 1,
  },

  favoriteInlineButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  favoriteInlineButtonText: {
    fontSize: 19,
  },

  thumbRow: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },

  thumbWrap: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  thumbWrapActive: {
    borderColor: '#7FA52A',
  },

  thumbImage: {
    width: '100%',
    height: '100%',
  },

  content: {
    padding: 12,
  },

  titleCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 30,
    marginBottom: 12,
  },

  shareButtonText: {
    color: '#111827',
    fontWeight: '800',
    fontSize: 14,
  },

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f7',
  },

  infoLabel: {
    flex: 1,
    fontSize: 12,
    color: '#64748b',
    marginRight: 12,
  },

  infoValue: {
    flex: 1.2,
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
  },

  sellerCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },

  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  sellerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 999,
    marginRight: 12,
  },

  sellerAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 999,
    marginRight: 12,
    backgroundColor: '#eef2f7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sellerAvatarPlaceholderText: {
    fontSize: 24,
  },

  sellerHeaderText: {
    flex: 1,
  },

  sellerName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 3,
  },

  sellerFarm: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5b7f13',
  },

  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  contactBtn: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  contactBtnChatActive: {
    backgroundColor: '#eef7dd',
    borderWidth: 1,
    borderColor: '#7FA52A',
  },

  contactBtnDisabled: {
    opacity: 0.45,
  },

  contactIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },

  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },

  similarCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },

  noSimilarText: {
    color: '#64748b',
    fontSize: 14,
  },

  titleActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  titleBackButton: {
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginRight: 12,
  },

  titleBackIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },

  shareButtonCompact: {
    width: 220,
    backgroundColor: '#eef2f7',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  contactEmoji: {
    fontSize: 24,
  },


  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 8,
    maxWidth: '82%',
  },

  myMessage: {
    backgroundColor: '#7FA52A',
    alignSelf: 'flex-end',
  },

  otherMessage: {
    backgroundColor: '#e5e7eb',
    alignSelf: 'flex-start',
  },

  messageText: {
    fontSize: 14,
    color: '#111827',
  },

  myMessageText: {
    color: '#fff',
  },

  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  chatInput: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 10,
    color: '#111827',
  },

  sendBtn: {
    backgroundColor: '#7FA52A',
    paddingHorizontal: 14,
    minHeight: 46,
    justifyContent: 'center',
    marginLeft: 8,
    borderRadius: 10,
  },

  sendBtnText: {
    color: '#fff',
    fontWeight: '800',
  },

chatModalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.35)',
  justifyContent: 'flex-end',
},

chatModalCard: {
  backgroundColor: '#fff',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  paddingTop: 16,
  paddingHorizontal: 16,
  paddingBottom: 20,
  minHeight: '58%',
  maxHeight: '82%',
},

chatModalHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 12,
},

chatModalTitle: {
  fontSize: 18,
  fontWeight: '800',
  color: '#111827',
},

chatCloseBtn: {
  width: 38,
  height: 38,
  borderRadius: 999,
  backgroundColor: '#eef2f7',
  alignItems: 'center',
  justifyContent: 'center',
},

chatCloseBtnText: {
  fontSize: 18,
  fontWeight: '800',
  color: '#111827',
},

chatMessagesWrap: {
  flex: 1,
},

chatMessagesContent: {
  paddingBottom: 10,
},

});
