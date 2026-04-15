import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  buildSavjetnikUrl,
  formatNewsSource,
  normalizeNewsItems,
  normalizeReply,
  QUICK_PROMPTS,
  toDisplayText,
  WELCOME_MESSAGE,
} from '../utils/SavjetnikUtils';

function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function assetToDataUrl(asset) {
  const response = await fetch(asset.uri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function MessageBubble({ item }) {
  const isUser = item.role === 'user';

  return (
    <View style={[styles.msgWrap, isUser ? styles.msgWrapUser : styles.msgWrapAssistant]}>
      <View style={[styles.msgBubble, isUser ? styles.msgUser : styles.msgAssistant]}>
        <Text style={[styles.msgRole, isUser ? styles.msgRoleUser : styles.msgRoleAssistant]}>
          {isUser ? 'Vi' : 'Savjetnik'}
        </Text>
        <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextAssistant]}>
          {item.text}
        </Text>
        {!!item.imagePreview && (
          <Image source={{ uri: item.imagePreview }} style={styles.msgImage} resizeMode="cover" />
        )}
      </View>
    </View>
  );
}

export default function SavjetnikScreen({
  onBack,
  renderTopBar,
  renderLicenseBanner,
}) {
  const chatScrollRef = useRef(null);
  const [context, setContext] = useState('opcenito');
  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingNews, setLoadingNews] = useState(true);
  const [news, setNews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [messages, setMessages] = useState([
    { id: uid('welcome'), role: 'assistant', text: WELCOME_MESSAGE },
  ]);

  const contextOptions = useMemo(
    () => [
      { key: 'opcenito', label: '🌍 Općenito' },
      { key: 'hrvatska', label: '🇭🇷 Hrvatska' },
    ],
    []
  );

  const scrollChatToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      chatScrollRef.current?.scrollToEnd?.({ animated: true });
    });
  }, []);

  const loadNews = useCallback(async () => {
    setLoadingNews(true);
    try {
      const response = await fetch(buildSavjetnikUrl('news'));
      const payload = await response.json();
      setNews(normalizeNewsItems(payload).slice(0, 5));
    } catch (error) {
      setNews([]);
    } finally {
      setLoadingNews(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  useEffect(() => {
    scrollChatToEnd();
  }, [messages, scrollChatToEnd]);

  const handlePickImage = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
        base64: false,
      });

      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      const dataUrl = await assetToDataUrl(asset);

      setSelectedImage({
        uri: asset.uri,
        dataUrl,
        fileName: asset.fileName || 'fotografija.jpg',
      });
    } catch (error) {
      setSelectedImage(null);
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const handleQuickPrompt = useCallback((text) => {
    setQuestion(text);
  }, []);

  const handleOpenNews = useCallback(async (url) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch (error) {}
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = question.trim();
    if ((!trimmed && !selectedImage?.dataUrl) || sending) return;

    const userMessage = {
      id: uid('user'),
      role: 'user',
      text: trimmed || 'Pogledaj fotografiju i reci što vidiš.',
      imagePreview: selectedImage?.uri || null,
    };
    const loadingMessageId = uid('assistant_loading');

    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: loadingMessageId, role: 'assistant', text: selectedImage?.dataUrl ? '⏳ Analiziram fotografiju i lokalne podatke…' : '⏳ Analiziram lokalne podatke i pripremam odgovor…' },
    ]);
    setQuestion('');
    setSending(true);

    try {
      const response = await fetch(buildSavjetnikUrl('ask'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
          image: selectedImage?.dataUrl || '',
          context,
        }),
      });

      const payload = await response.json();

      if (payload?.error === 'limit_reached') {
        setMessages((prev) =>
          prev.map((item) =>
            item.id === loadingMessageId
              ? {
                  ...item,
                  text: payload?.message || 'Dosegnuli ste dnevni limit od 5 pitanja. Pokušajte ponovno sutra.',
                }
              : item
          )
        );
        return;
      }

      const reply = normalizeReply(payload) || 'Došlo je do pogreške pri obradi upita.';
      const contextUsed = !!(payload?.context_used || payload?.agromonitoring_used || payload?.used_local_context);
      const finalReply = contextUsed ? `📍 Lokalni kontekst uključen\n\n${reply}` : reply;

      setMessages((prev) =>
        prev.map((item) =>
          item.id === loadingMessageId
            ? {
                ...item,
                text: finalReply,
              }
            : item
        )
      );

      if (response.ok) {
        setSelectedImage(null);
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === loadingMessageId
            ? {
                ...item,
                text: 'Greška pri povezivanju sa savjetnikom. Pokušajte ponovno.',
              }
            : item
        )
      );
    } finally {
      setSending(false);
    }
  }, [context, question, selectedImage, sending]);

  return (
    <View style={styles.safe}>
      {typeof renderTopBar === 'function' ? renderTopBar('Poljoprivredni savjetnik') : null}
      {typeof renderLicenseBanner === 'function' ? renderLicenseBanner() : null}

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.9}>
              <Text style={styles.backButtonText}>← Natrag</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.heroEmoji}>🌾</Text>
          <Text style={styles.heroTitle}>Poljoprivredni savjetnik</Text>
          <Text style={styles.heroText}>
            Postavite pitanje o zaštiti bilja, gnojidbi, bolestima, poticajima ili dodajte fotografiju problema.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Kontekst pitanja</Text>
          <View style={styles.segmentRow}>
            {contextOptions.map((option) => {
              const active = context === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.segmentButton, active && styles.segmentButtonActive]}
                  onPress={() => setContext(option.key)}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Brza pitanja</Text>
          <View style={styles.quickWrap}>
            {QUICK_PROMPTS.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.quickChip}
                onPress={() => handleQuickPrompt(item)}
                activeOpacity={0.9}
              >
                <Text style={styles.quickChipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>📰 Aktualno</Text>
            <TouchableOpacity onPress={loadNews} activeOpacity={0.8}>
              <Text style={styles.refreshText}>Osvježi</Text>
            </TouchableOpacity>
          </View>

          {loadingNews ? (
            <View style={styles.newsLoadingWrap}>
              <ActivityIndicator size="small" color="#7FA52A" />
              <Text style={styles.newsLoadingText}>Učitavam vijesti…</Text>
            </View>
          ) : news.length ? (
            news.map((item, index) => {
              const title = toDisplayText(item?.title || item?.name || `Vijest ${index + 1}`);
              const excerpt = toDisplayText(item?.excerpt || item?.summary || item?.description);
              const meta = formatNewsSource(item);
              return (
                <TouchableOpacity
                  key={`${title}_${index}`}
                  style={styles.newsCard}
                  onPress={() => handleOpenNews(item?.link || item?.url)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.newsTitle}>{title}</Text>
                  {!!excerpt && <Text style={styles.newsExcerpt}>{excerpt}</Text>}
                  {!!meta && <Text style={styles.newsMeta}>{meta}</Text>}
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.emptyText}>Trenutno nema dohvaćenih vijesti.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>💬 Razgovor</Text>

          <ScrollView
            ref={chatScrollRef}
            style={styles.chatBox}
            contentContainerStyle={styles.chatContent}
            nestedScrollEnabled
          >
            {messages.map((item) => (
              <MessageBubble key={item.id} item={item} />
            ))}
          </ScrollView>

          {!!selectedImage && (
            <View style={styles.previewBox}>
              <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} resizeMode="cover" />
              <View style={styles.previewContent}>
                <Text style={styles.previewTitle}>✅ Fotografija dodana</Text>
                <Text style={styles.previewName}>{selectedImage.fileName}</Text>
              </View>
              <TouchableOpacity style={styles.removeImageButton} onPress={handleRemoveImage} activeOpacity={0.9}>
                <Text style={styles.removeImageText}>Ukloni</Text>
              </TouchableOpacity>
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder="Upišite pitanje za savjetnika…"
            placeholderTextColor="#94a3b8"
            value={question}
            onChangeText={setQuestion}
            multiline
            textAlignVertical="top"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.photoButton} onPress={handlePickImage} activeOpacity={0.9}>
              <Text style={styles.photoButtonText}>📷 Dodaj fotografiju</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendButton, sending && styles.sendButtonDisabled]}
              onPress={handleSend}
              activeOpacity={0.9}
              disabled={sending}
            >
              <Text style={styles.sendButtonText}>{sending ? 'Šaljem…' : 'Pošalji'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f3f6ef',
  },
  container: {
    padding: 16,
    paddingBottom: 34,
  },
  heroCard: {
    backgroundColor: '#7FA52A',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  heroEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  heroText: {
    color: '#eef7dd',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e7ecdf',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1f2937',
    marginBottom: 12,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  segmentButton: {
    flex: 1,
    backgroundColor: '#f5f7f2',
    borderWidth: 1,
    borderColor: '#e5eadc',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#edf5dc',
    borderColor: '#7FA52A',
  },
  segmentText: {
    color: '#4b5563',
    fontWeight: '700',
    fontSize: 14,
  },
  segmentTextActive: {
    color: '#35570c',
  },
  quickWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickChip: {
    backgroundColor: '#f7f9f4',
    borderWidth: 1,
    borderColor: '#dce5cf',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  quickChipText: {
    color: '#35570c',
    fontWeight: '700',
    fontSize: 13,
  },
  refreshText: {
    color: '#7FA52A',
    fontWeight: '800',
    fontSize: 13,
  },
  newsLoadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsLoadingText: {
    marginLeft: 10,
    color: '#64748b',
    fontSize: 13,
  },
  newsCard: {
    borderWidth: 1,
    borderColor: '#ebf0e3',
    backgroundColor: '#fafcf8',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  newsTitle: {
    color: '#111827',
    fontWeight: '800',
    fontSize: 14,
    lineHeight: 20,
  },
  newsExcerpt: {
    color: '#4b5563',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  newsMeta: {
    color: '#7c8a9b',
    fontSize: 12,
    marginTop: 8,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
  },
  chatBox: {
    maxHeight: 420,
    minHeight: 280,
    borderWidth: 1,
    borderColor: '#e6ecdc',
    borderRadius: 18,
    backgroundColor: '#f8faf6',
  },
  chatContent: {
    padding: 12,
  },
  msgWrap: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  msgWrapUser: {
    justifyContent: 'flex-end',
  },
  msgWrapAssistant: {
    justifyContent: 'flex-start',
  },
  msgBubble: {
    maxWidth: '88%',
    borderRadius: 18,
    padding: 12,
  },
  msgUser: {
    backgroundColor: '#7FA52A',
    borderBottomRightRadius: 6,
  },
  msgAssistant: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e8d6',
    borderBottomLeftRadius: 6,
  },
  msgRole: {
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 6,
  },
  msgRoleUser: {
    color: '#eaf7c8',
  },
  msgRoleAssistant: {
    color: '#7FA52A',
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  msgTextUser: {
    color: '#fff',
  },
  msgTextAssistant: {
    color: '#1f2937',
  },
  msgImage: {
    width: 160,
    height: 120,
    borderRadius: 12,
    marginTop: 10,
  },
  previewBox: {
    marginTop: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6faef',
    borderWidth: 1,
    borderColor: '#dce8c8',
    borderRadius: 16,
    padding: 10,
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 10,
  },
  previewContent: {
    flex: 1,
  },
  previewTitle: {
    color: '#35570c',
    fontWeight: '800',
    fontSize: 13,
  },
  previewName: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  removeImageButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d3ddc1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  removeImageText: {
    color: '#35570c',
    fontWeight: '700',
    fontSize: 12,
  },
  input: {
    minHeight: 110,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#dbe4cf',
    borderRadius: 18,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#111827',
    fontSize: 14,
  },
  actionRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#eef5e3',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbe7cb',
  },
  photoButtonText: {
    color: '#35570c',
    fontWeight: '800',
    fontSize: 14,
  },
  sendButton: {
    width: 120,
    backgroundColor: '#7FA52A',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.65,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
});
