import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import ListingCard from '../components/ListingCard';
import {
  fetchAdCategories,
  fetchOglasi,
  toggleFavoriteCategory,
} from '../services/oglasnikApi';

const ZUPANIJE = [
  { value: '', label: '📍Sve županije' },
  { value: 'Bjelovarsko-bilogorska', label: '🐄 Bjelovarsko-bilogorska' },
  { value: 'Brodsko-posavska', label: '🚤 Brodsko-posavska' },
  { value: 'Dubrovačko-neretvanska', label: '🏖️ Dubrovačko-neretvanska' },
  { value: 'Istarska', label: '🍷 Istarska' },
  { value: 'Karlovačka', label: '🏞️ Karlovačka' },
  { value: 'Koprivničko-križevačka', label: '🌾 Koprivničko-križevačka' },
  { value: 'Krapinsko-zagorska', label: '⛰️ Krapinsko-zagorska' },
  { value: 'Ličko-senjska', label: '🐻 Ličko-senjska' },
  { value: 'Međimurska', label: '🌿 Međimurska' },
  { value: 'Osječko-baranjska', label: '🌽 Osječko-baranjska' },
  { value: 'Požeško-slavonska', label: '🍇 Požeško-slavonska' },
  { value: 'Primorsko-goranska', label: '⚓ Primorsko-goranska' },
  { value: 'Sisačko-moslavačka', label: '🌊 Sisačko-moslavačka' },
  { value: 'Splitsko-dalmatinska', label: '🌊 Splitsko-dalmatinska' },
  { value: 'Šibensko-kninska', label: '🏝️ Šibensko-kninska' },
  { value: 'Varaždinska', label: '🏰 Varaždinska' },
  { value: 'Virovitičko-podravska', label: '🌻 Virovitičko-podravska' },
  { value: 'Vukovarsko-srijemska', label: '🌾 Vukovarsko-srijemska' },
  { value: 'Zadarska', label: '🌅 Zadarska' },
  { value: 'Zagrebačka', label: '🌳 Zagrebačka' },
  { value: 'Grad Zagreb', label: '🏙️ Grad Zagreb' },
];

const ORDER_OPTIONS = [
  { value: '', label: 'Najnovije', emoji: '🕒' },
  { value: 'price_asc', label: 'Cijena uzlazno', emoji: '📈' },
  { value: 'price_desc', label: 'Cijena silazno', emoji: '📉' },
];

const getCategoryEmoji = (name = '') => {
  const n = String(name).toLowerCase();

  if (n.includes('mehan')) return '🚜';
  if (n.includes('bilj')) return '🌾';
  if (n.includes('voć') || n.includes('voce') || n.includes('povr')) return '🥕';
  if (n.includes('stoč') || n.includes('stoc')) return '🐄';
  if (n.includes('hrana') || n.includes('pić') || n.includes('pica')) return '🍯';
  if (n.includes('pakir') || n.includes('ambala')) return '📦';
  if (n.includes('zemlji')) return '🌍';
  if (n.includes('oprema') || n.includes('mater')) return '🧰';
  if (n.includes('usluge')) return '⚙️';

  return '📂';
};

export default function OglasnikListaScreen({
  onOpenDetail,
  onOpenMyAds,
  onOpenPostAd,
  authToken,
  favoriteAdIds = [],
  onToggleFavoriteAd,
  onOpenFavorites,
}) {
  
const { width } = useWindowDimensions();
const horizontalPadding = 24;
const columnGap = 12;
const numColumns = width >= 1360 ? 4 : width >= 1180 ? 3 : 2;
const itemWidth =
  numColumns === 2
    ? (width - horizontalPadding - columnGap) / 2
    : numColumns === 3
    ? (width - horizontalPadding - columnGap * 2) / 3
    : (width - horizontalPadding - columnGap * 3) / 4;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const [selectedZupanija, setSelectedZupanija] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('');

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [subcategoryModalVisible, setSubcategoryModalVisible] = useState(false);
  const [zupanijaModalVisible, setZupanijaModalVisible] = useState(false);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [actionsModalVisible, setActionsModalVisible] = useState(false);

  useEffect(() => {
    const initCategories = async () => {
      try {
        const data = await fetchAdCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        console.log('Greška categories:', e?.message || e);
      }
    };

    initCategories();
  }, []);

  const parentCategories = useMemo(
    () => categories.filter((cat) => Number(cat.parent) === 0),
    [categories]
  );

  const childCategories = useMemo(() => {
    if (!selectedCategory) return [];
    return categories.filter(
      (cat) => Number(cat.parent) === Number(selectedCategory)
    );
  }, [categories, selectedCategory]);

  const selectedCategoryLabel = useMemo(() => {
    if (!selectedCategory) return 'Sve kategorije';
    const found = parentCategories.find(
      (cat) => String(cat.id) === String(selectedCategory)
    );
    return found?.name || 'Sve kategorije';
  }, [parentCategories, selectedCategory]);

  const selectedSubcategoryLabel = useMemo(() => {
    if (!selectedSubcategory) return 'Sve podkategorije';
    const found = childCategories.find(
      (cat) => String(cat.id) === String(selectedSubcategory)
    );
    return found?.name || 'Sve podkategorije';
  }, [childCategories, selectedSubcategory]);

  const selectedZupanijaLabel = useMemo(() => {
  if (!selectedZupanija) return 'Sve županije';

  const found = ZUPANIJE.find((z) => z.value === selectedZupanija);
  return found?.label || selectedZupanija;
}, [selectedZupanija]);

  const selectedOrderLabel = useMemo(() => {
    const found = ORDER_OPTIONS.find((item) => item.value === selectedOrder);
    return found?.label || 'Najnovije';
  }, [selectedOrder]);

  const filtersKey = useMemo(() => {
    return JSON.stringify({
      search: activeSearch,
      zupanija: selectedZupanija,
      orderby: selectedOrder,
      category: selectedCategory,
      subcategory: selectedSubcategory,
    });
  }, [
    activeSearch,
    selectedZupanija,
    selectedOrder,
    selectedCategory,
    selectedSubcategory,
  ]);

  const loadFirstPage = useCallback(async () => {
    try {
      setLoading(true);

      const data = await fetchOglasi({
        page: 1,
        search: activeSearch,
        zupanija: selectedZupanija,
        orderby: selectedOrder,
        category_id: selectedCategory,
        subcategory_id: selectedSubcategory,
      });

      setItems(Array.isArray(data?.items) ? data.items : []);
      setTotalPages(Number(data?.total_pages) || 1);
      setPage(2);
    } catch (error) {
      console.log('Greška loadFirstPage:', error?.message || error);
      setItems([]);
      setTotalPages(1);
      setPage(2);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    activeSearch,
    selectedZupanija,
    selectedOrder,
    selectedCategory,
    selectedSubcategory,
  ]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || page > totalPages) return;

    try {
      setLoadingMore(true);

      const data = await fetchOglasi({
        page,
        search: activeSearch,
        zupanija: selectedZupanija,
        orderby: selectedOrder,
        category_id: selectedCategory,
        subcategory_id: selectedSubcategory,
      });

      setItems((prev) => [
        ...prev,
        ...(Array.isArray(data?.items) ? data.items : []),
      ]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.log('Greška loadMore:', error?.message || error);
    } finally {
      setLoadingMore(false);
    }
  }, [
    page,
    totalPages,
    loading,
    loadingMore,
    activeSearch,
    selectedZupanija,
    selectedOrder,
    selectedCategory,
    selectedSubcategory,
  ]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage, filtersKey]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFirstPage();
  };

  const handleSearchSubmit = () => {
    setActiveSearch(searchInput.trim());
  };

  const handleToggleAdFavorite = async (item) => {
    try {
      if (onToggleFavoriteAd) {
        await onToggleFavoriteAd(item);
      }

      setItems((prev) =>
        prev.map((ad) =>
          ad.id === item.id
            ? { ...ad, is_favorite: !favoriteAdIds.includes(item.id) }
            : ad
        )
      );
    } catch (e) {
      console.log('Greška favorite ad:', e?.message || e);
    }
  };

  const handleToggleCategoryFavorite = async () => {
    try {
      const termId = selectedSubcategory || selectedCategory;
      if (!termId) return;

      await toggleFavoriteCategory(termId, authToken);
    } catch (e) {
      console.log('Greška favorite category:', e?.message || e);
    }
  };

  const handleSelectCategory = (value) => {
    setSelectedCategory(value);
    setSelectedSubcategory('');
    setCategoryModalVisible(false);
  };

  const handleSelectSubcategory = (value) => {
    setSelectedSubcategory(value);
    setSubcategoryModalVisible(false);
  };

  const handleSelectZupanija = (value) => {
    setSelectedZupanija(value);
    setZupanijaModalVisible(false);
  };

  const handleSelectOrder = (value) => {
    setSelectedOrder(value);
    setOrderModalVisible(false);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setActiveSearch('');
    setSelectedZupanija('');
    setSelectedOrder('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setOnlyFavorites(false);
  };

  const filteredItems = useMemo(() => {
    if (!onlyFavorites) return items;
    return items.filter((item) => favoriteAdIds.includes(item.id));
  }, [items, onlyFavorites, favoriteAdIds]);

  if (loading && items.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Učitavanje oglasa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterToggleWrap}>
        <TouchableOpacity
          style={styles.filtersToggle}
          onPress={() => setFiltersOpen((prev) => !prev)}
          activeOpacity={0.88}
        >
          <Text style={styles.filtersToggleText}>
            {filtersOpen ? 'Sakrij filtere ▲' : 'Filteri ▼'}
          </Text>
        </TouchableOpacity>
      </View>

      {filtersOpen ? (
        <View style={styles.filtersWrap}>
          <TextInput
            style={styles.searchInput}
            value={searchInput}
            onChangeText={setSearchInput}
            placeholder="Pretraži oglase..."
            placeholderTextColor="#888"
            returnKeyType="search"
            onSubmitEditing={handleSearchSubmit}
          />

          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setCategoryModalVisible(true)}
            activeOpacity={0.88}
          >
            <View style={styles.selectButtonLeft}>
              <Text style={styles.selectButtonEmoji}>
                {getCategoryEmoji(selectedCategoryLabel)}
              </Text>
              <Text style={styles.selectButtonText}>{selectedCategoryLabel}</Text>
            </View>
            <Text style={styles.selectButtonArrow}>⌄</Text>
          </TouchableOpacity>

          {childCategories.length > 0 ? (
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setSubcategoryModalVisible(true)}
              activeOpacity={0.88}
            >
              <View style={styles.selectButtonLeft}>
                <Text style={styles.selectButtonEmoji}>📁</Text>
                <Text style={styles.selectButtonText}>
                  {selectedSubcategoryLabel}
                </Text>
              </View>
              <Text style={styles.selectButtonArrow}>⌄</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setZupanijaModalVisible(true)}
            activeOpacity={0.88}
          >
            <View style={styles.selectButtonLeft}>
              <Text style={styles.selectButtonEmoji}>📍</Text>
              <Text style={styles.selectButtonText}>{selectedZupanijaLabel}</Text>
            </View>
            <Text style={styles.selectButtonArrow}>⌄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setOrderModalVisible(true)}
            activeOpacity={0.88}
          >
            <View style={styles.selectButtonLeft}>
              <Text style={styles.selectButtonEmoji}>
                {ORDER_OPTIONS.find((o) => o.value === selectedOrder)?.emoji || '🕒'}
              </Text>
              <Text style={styles.selectButtonText}>{selectedOrderLabel}</Text>
            </View>
            <Text style={styles.selectButtonArrow}>⌄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.selectButton,
              onlyFavorites && styles.selectButtonActive,
            ]}
            onPress={() => setActionsModalVisible(true)}
            activeOpacity={0.88}
          >
            <View style={styles.selectButtonLeft}>
              <Text
                style={[
                  styles.selectButtonEmoji,
                  { opacity: onlyFavorites ? 1 : 0.4 }
                ]}
              >
                💚
              </Text>
              <Text style={styles.selectButtonText}>Pratim</Text>
            </View>
            <Text style={styles.selectButtonArrow}>⌄</Text>
          </TouchableOpacity>

          {(selectedCategory || selectedSubcategory) ? (
            <TouchableOpacity
              style={styles.favoriteCategoryButton}
              onPress={handleToggleCategoryFavorite}
              activeOpacity={0.88}
            >
              <Text style={styles.favoriteCategoryButtonText}>
                ❤️ Spremi odabranu kategoriju
              </Text>
            </TouchableOpacity>
          ) : null}

          {(activeSearch ||
            selectedCategory ||
            selectedSubcategory ||
            selectedZupanija ||
            selectedOrder ||
            onlyFavorites) ? (
            <TouchableOpacity
              style={styles.resetFiltersButton}
              onPress={handleResetFilters}
              activeOpacity={0.88}
            >
              <Text style={styles.resetFiltersButtonText}>Očisti sve filtere</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      <FlatList
  data={filteredItems}
  numColumns={numColumns}
  key={numColumns}
  keyExtractor={(item) => String(item.id)}
  columnWrapperStyle={
    numColumns > 1 ? styles.multiColumnRow : undefined
  }
  contentContainerStyle={styles.listContent}
  renderItem={({ item }) => (
    <View
      style={[
        styles.listItemWrap,
        { width: itemWidth },
      ]}
    >
      <ListingCard
        item={{
          ...item,
          is_favorite: favoriteAdIds.includes(item.id),
        }}
        onPress={() => onOpenDetail && onOpenDetail(item.id)}
        onToggleFavorite={handleToggleAdFavorite}
      />
    </View>
  )}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  }
  onEndReached={loadMore}
  onEndReachedThreshold={0.35}
  initialNumToRender={6}
  maxToRenderPerBatch={6}
  windowSize={7}
  removeClippedSubviews
  ListEmptyComponent={
    <View style={styles.emptyBox}>
      <Text style={styles.emptyText}>Nema oglasa za prikaz.</Text>
    </View>
  }
  ListFooterComponent={
    loadingMore ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator />
      </View>
    ) : null
  }
/>

      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setCategoryModalVisible(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Odaberi</Text>
              <TouchableOpacity
                onPress={() => setCategoryModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.sheetItem,
                  !selectedCategory && styles.sheetItemActive,
                ]}
                onPress={() => handleSelectCategory('')}
                activeOpacity={0.85}
              >
                <View style={styles.sheetItemLeft}>
                  <Text style={styles.sheetItemEmoji}>📂</Text>
                  <Text
                    style={[
                      styles.sheetItemText,
                      !selectedCategory && styles.sheetItemTextActive,
                    ]}
                  >
                    Sve kategorije
                  </Text>
                </View>
                {!selectedCategory ? (
                  <Text style={styles.sheetItemCheck}>✓</Text>
                ) : null}
              </TouchableOpacity>

              {parentCategories.map((cat) => {
                const active = String(selectedCategory) === String(cat.id);

                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.sheetItem,
                      active && styles.sheetItemActive,
                    ]}
                    onPress={() => handleSelectCategory(String(cat.id))}
                    activeOpacity={0.85}
                  >
                    <View style={styles.sheetItemLeft}>
                      <Text style={styles.sheetItemEmoji}>
                        {getCategoryEmoji(cat.name)}
                      </Text>
                      <Text
                        style={[
                          styles.sheetItemText,
                          active && styles.sheetItemTextActive,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </View>
                    {active ? <Text style={styles.sheetItemCheck}>✓</Text> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={subcategoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSubcategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setSubcategoryModalVisible(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Odaberi</Text>
              <TouchableOpacity
                onPress={() => setSubcategoryModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.sheetItem,
                  !selectedSubcategory && styles.sheetItemActive,
                ]}
                onPress={() => handleSelectSubcategory('')}
                activeOpacity={0.85}
              >
                <View style={styles.sheetItemLeft}>
                  <Text style={styles.sheetItemEmoji}>📁</Text>
                  <Text
                    style={[
                      styles.sheetItemText,
                      !selectedSubcategory && styles.sheetItemTextActive,
                    ]}
                  >
                    Sve podkategorije
                  </Text>
                </View>
                {!selectedSubcategory ? (
                  <Text style={styles.sheetItemCheck}>✓</Text>
                ) : null}
              </TouchableOpacity>

              {childCategories.map((cat) => {
                const active = String(selectedSubcategory) === String(cat.id);

                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.sheetItem,
                      active && styles.sheetItemActive,
                    ]}
                    onPress={() => handleSelectSubcategory(String(cat.id))}
                    activeOpacity={0.85}
                  >
                    <View style={styles.sheetItemLeft}>
                      <Text style={styles.sheetItemEmoji}>📁</Text>
                      <Text
                        style={[
                          styles.sheetItemText,
                          active && styles.sheetItemTextActive,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </View>
                    {active ? <Text style={styles.sheetItemCheck}>✓</Text> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={zupanijaModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setZupanijaModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setZupanijaModalVisible(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Odaberi</Text>
              <TouchableOpacity
                onPress={() => setZupanijaModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.sheetItem,
                  !selectedZupanija && styles.sheetItemActive,
                ]}
                onPress={() => handleSelectZupanija('')}
                activeOpacity={0.85}
              >
                <View style={styles.sheetItemLeft}>
                  <Text style={styles.sheetItemEmoji}> </Text>
                  <Text
                    style={[
                      styles.sheetItemText,
                      !selectedZupanija && styles.sheetItemTextActive,
                    ]}
                  >
                    Sve županije
                  </Text>
                </View>
                {!selectedZupanija ? (
                  <Text style={styles.sheetItemCheck}>✓</Text>
                ) : null}
              </TouchableOpacity>

             
 {ZUPANIJE.map((item) => {
  const active = selectedZupanija === item.value;

  return (
    <TouchableOpacity
      key={item.value || 'all-zupanije'}
      style={[
        styles.sheetItem,
        active && styles.sheetItemActive,
      ]}
      onPress={() => handleSelectZupanija(item.value)}
      activeOpacity={0.85}
    >
      <View style={styles.sheetItemLeft}>
        <Text style={styles.sheetItemEmoji}></Text>
        <Text
          style={[
            styles.sheetItemText,
            active && styles.sheetItemTextActive,
          ]}
        >
          {item.label}
        </Text>
      </View>

      {active ? <Text style={styles.sheetItemCheck}>✓</Text> : null}
    </TouchableOpacity>
  );
})}
</ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={actionsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setActionsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setActionsModalVisible(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Odaberi</Text>
              <TouchableOpacity
                onPress={() => setActionsModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.sheetItem,
                  onlyFavorites && styles.sheetItemActive,
                ]}
                onPress={() => {
                  setOnlyFavorites((prev) => !prev);
                  setActionsModalVisible(false);
                }}
                activeOpacity={0.85}
              >
                <View style={styles.sheetItemLeft}>
                  <Text style={styles.sheetItemEmoji}>💚</Text>
                  <Text
                    style={[
                      styles.sheetItemText,
                      onlyFavorites && styles.sheetItemTextActive,
                    ]}
                  >
                    Pratim
                  </Text>
                </View>
                {onlyFavorites ? <Text style={styles.sheetItemCheck}>✓</Text> : null}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetItem}
                onPress={() => {
                  setActionsModalVisible(false);
                  onOpenMyAds && onOpenMyAds();
                }}
                activeOpacity={0.85}
              >
                <View style={styles.sheetItemLeft}>
                  <Text style={styles.sheetItemEmoji}>🗃️</Text>
                  <Text style={styles.sheetItemText}>Moji oglasi</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetItem}
                onPress={() => {
                  setActionsModalVisible(false);
                  onOpenPostAd && onOpenPostAd();
                }}
                activeOpacity={0.85}
              >
                <View style={styles.sheetItemLeft}>
                  <Text style={styles.sheetItemEmoji}>📢</Text>
                  <Text style={styles.sheetItemText}>Objavi oglas</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={orderModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOrderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setOrderModalVisible(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Odaberi</Text>
              <TouchableOpacity
                onPress={() => setOrderModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {ORDER_OPTIONS.map((option) => {
                const active = selectedOrder === option.value;

                return (
                  <TouchableOpacity
                    key={option.value || 'default-order'}
                    style={[
                      styles.sheetItem,
                      active && styles.sheetItemActive,
                    ]}
                    onPress={() => handleSelectOrder(option.value)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.sheetItemLeft}>
                      <Text style={styles.sheetItemEmoji}>{option.emoji}</Text>
                      <Text
                        style={[
                          styles.sheetItemText,
                          active && styles.sheetItemTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>
                    {active ? <Text style={styles.sheetItemCheck}>✓</Text> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
listContent: {
  paddingHorizontal: 12,
  paddingTop: 4,
  paddingBottom: 24,
  flexGrow: 1,
},
  filterToggleWrap: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#f5f5f5',
  },

  filtersToggle: {
    backgroundColor: '#dd9933',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },

  filtersToggleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },

  filtersWrap: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: '#f5f5f5',
  },

  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3e3e3',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111',
    marginBottom: 10,
  },

  selectButton: {
    minHeight: 56,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3e3e3',
    marginBottom: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },

  selectButtonEmoji: {
    fontSize: 19,
    marginRight: 10,
  },

  selectButtonText: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },

  selectButtonArrow: {
    fontSize: 20,
    color: '#6b7280',
    marginTop: -2,
  },

  selectButtonActive: {
    borderColor: '#7FA52A',
    borderWidth: 2,
    backgroundColor: '#eef6df',
  },

  favoriteCategoryButton: {
    backgroundColor: '#7FA52A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },

  favoriteCategoryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },

  resetFiltersButton: {
    backgroundColor: '#eef2f7',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },

  resetFiltersButtonText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },

  multiColumnRow: {
    justifyContent: 'space-between',
  },

  listItemWrap: {
    marginBottom: 12,
  },

  listItemWrapSingle: {
    width: '100%',
  },

  listItemWrapTwo: {
    width: '48.5%',
  },

  listItemWrapThree: {
    width: '31.5%',
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },

  loadingText: {
    marginTop: 10,
    color: '#666',
  },

  emptyBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 15,
    color: '#666',
  },

  footerLoader: {
    paddingVertical: 16,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
    maxHeight: '78%',
  },

  sheetHandle: {
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#d1d5db',
    alignSelf: 'center',
    marginBottom: 14,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },

  sheetClose: {
    fontSize: 24,
    color: '#6b7280',
  },

  sheetItem: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: '#f5f6f8',
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sheetItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },

  sheetItemEmoji: {
    fontSize: 18,
    marginRight: 10,
    minWidth: 18,
  },

  sheetItemActive: {
    backgroundColor: '#dfecc2',
    borderWidth: 1,
    borderColor: '#7FA52A',
  },

  sheetItemText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },

  sheetItemTextActive: {
    color: '#486313',
    fontWeight: '800',
  },

  sheetItemCheck: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7FA52A',
  },
});