import { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, RefreshControl, Image, StatusBar, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext.js';
import api from '../services/api.js';

const CATEGORIES = [
  { id: 'tous', label: 'Tout' },
  { id: '1', label: 'Electronique' },
  { id: '2', label: 'Meubles' },
  { id: '3', label: 'Mode' },
  { id: '4', label: 'Outils' },
  { id: '5', label: 'Cuisine' },
  { id: '6', label: 'Sport' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [categorie, setCategorie] = useState('tous');
  const { user } = useAuth();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    chargerProduits();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [categorie]);

  async function chargerProduits(searchText = '') {
    try {
      setLoading(true);
      const params = {};
      if (categorie !== 'tous') params.categoryId = categorie;
      if (searchText) params.search = searchText;
      const response = await api.get('/products', { params });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() { setRefreshing(true); chargerProduits(search); }

  function renderProduit({ item }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: './ProductDetail', params: { id: item.id } })}
        activeOpacity={0.92}
      >
        <View style={styles.cardImgWrap}>
          {item.images?.[0]
            ? <Image source={{ uri: item.images[0].url }} style={styles.cardImg} />
            : <View style={styles.cardImgPlaceholder}><Text style={styles.placeholderIcon}>??</Text></View>
          }
          <View style={styles.etatBadge}>
            <Text style={styles.etatBadgeText}>{item.status === 'available' ? 'Disponible' : 'Vendu'}</Text>
          </View>
          <TouchableOpacity style={styles.favBtn}>
            <Text style={styles.favBtnText}>?</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.cardPrice}>{Number(item.price).toLocaleString('fr-FR')} FCFA</Text>
          <Text style={styles.cardLocation}>?? {item.seller?.location || 'Senegal'}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.logo}>Sn<Text style={styles.logoAccent}>Deals</Text></Text>
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.push('./Conversations')}>
            <Text style={styles.navBtnText}>Messages</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.push('./Profil')}>
            <View style={styles.navAvatar}>
              <Text style={styles.navAvatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.vendreBtn} onPress={() => router.push('./Vendre')}>
            <Text style={styles.vendreBtnText}>+ Vendre</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>??</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un produit..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => chargerProduits(search)}
          returnKeyType="search"
        />
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={i => i.id}
        showsHorizontalScrollIndicator={false}
        style={styles.catList}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catBtn, categorie === item.id && styles.catBtnActive]}
            onPress={() => setCategorie(item.id)}
          >
            <Text style={[styles.catLabel, categorie === item.id && styles.catLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Subtitle */}
      <View style={styles.subtitleWrap}>
        <Text style={styles.subtitle}>Trouvez les meilleures affaires pres de chez vous</Text>
      </View>

      {/* Products */}
      {loading
        ? <ActivityIndicator size="large" color="#1BAA6B" style={{ marginTop: 40 }} />
        : <FlatList
            data={products}
            keyExtractor={i => String(i.id)}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.list}
            renderItem={renderProduit}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1BAA6B']} />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>??</Text>
                <Text style={styles.emptyTitle}>Aucune annonce</Text>
                <Text style={styles.emptyText}>Sois le premier a vendre ici</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('./Vendre')}>
                  <Text style={styles.emptyBtnText}>Commencer a vendre</Text>
                </TouchableOpacity>
              </View>
            }
          />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },

  // Navbar
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  logo: { fontSize: 22, fontWeight: '900', color: '#111' },
  logoAccent: { color: '#1BAA6B' },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navBtn: { padding: 4 },
  navBtnText: { fontSize: 14, color: '#444', fontWeight: '500' },
  navAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#E8F5EE', borderWidth: 1.5, borderColor: '#1BAA6B', alignItems: 'center', justifyContent: 'center' },
  navAvatarText: { fontSize: 14, fontWeight: '800', color: '#1BAA6B' },
  vendreBtn: { backgroundColor: '#1BAA6B', borderRadius: 100, paddingHorizontal: 16, paddingVertical: 8 },
  vendreBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // Search
  searchWrap: { flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: '#fff', borderRadius: 100, borderWidth: 1, borderColor: '#e0e0e0', paddingHorizontal: 16, height: 48, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#111' },

  // Categories
  catList: { maxHeight: 48, marginBottom: 4 },
  catBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 100, borderWidth: 1.5, borderColor: '#e0e0e0', marginRight: 8, backgroundColor: '#fff' },
  catBtnActive: { backgroundColor: '#1BAA6B', borderColor: '#1BAA6B' },
  catLabel: { fontSize: 13, fontWeight: '600', color: '#666' },
  catLabelActive: { color: '#fff' },

  // Subtitle
  subtitleWrap: { paddingHorizontal: 16, paddingVertical: 8 },
  subtitle: { fontSize: 13, color: '#888' },

  // Cards
  list: { paddingHorizontal: 12, paddingBottom: 100 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardImgWrap: { height: 160, position: 'relative' },
  cardImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardImgPlaceholder: { width: '100%', height: '100%', backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  placeholderIcon: { fontSize: 40 },
  etatBadge: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  etatBadgeText: { fontSize: 11, fontWeight: '700', color: '#333' },
  favBtn: { position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  favBtnText: { fontSize: 16, color: '#999' },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: '#111', marginBottom: 6, lineHeight: 18 },
  cardPrice: { fontSize: 16, fontWeight: '900', color: '#1BAA6B', marginBottom: 4 },
  cardLocation: { fontSize: 11, color: '#999' },

  // Empty
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#333', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#999', marginBottom: 24 },
  emptyBtn: { backgroundColor: '#1BAA6B', borderRadius: 100, paddingHorizontal: 24, paddingVertical: 14 },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
