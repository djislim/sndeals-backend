import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Image, Alert, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favori, setFavori] = useState(false);
  const [contacting, setContacting] = useState(false);
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => { chargerProduit(); }, [id]);

  async function chargerProduit() {
    try {
      const response = await api.get('/products/' + id);
      setProduct(response.data);
    } catch (error) {
      console.error('Erreur produit:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavori() {
    try {
      if (favori) {
        await api.delete('/favoris/' + id);
        setFavori(false);
      } else {
        await api.post('/favoris/' + id);
        setFavori(true);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier les favoris');
    }
  }

  async function contacterVendeur() {
    setContacting(true);
    try {
      const response = await api.post('/messages/' + id, { content: 'Bonjour, je suis interesse par votre annonce.' });
      router.push({ pathname: './Chat', params: { id: response.data.conversation.id } });
    } catch (error) {
      if (error.response?.data?.error === 'Tu ne peux pas te contacter toi-meme') {
        Alert.alert('Info', 'Tu es le vendeur de cette annonce');
      } else {
        Alert.alert('Erreur', 'Impossible de contacter le vendeur');
      }
    } finally {
      setContacting(false);
    }
  }

  if (loading) return (
    <View style={styles.loadingWrap}>
      <ActivityIndicator size="large" color="#1BAA6B" />
    </View>
  );

  if (!product) return (
    <View style={styles.loadingWrap}>
      <Text style={styles.errorText}>Produit introuvable</Text>
      <TouchableOpacity onPress={() => router.back()}><Text style={styles.backLink}>? Retour</Text></TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.imageWrap}>
        {product.images?.[0]
          ? <Image source={{ uri: product.images[0].url }} style={styles.image} />
          : <View style={styles.imagePlaceholder}><Text style={styles.placeholderEmoji}>??</Text></View>
        }
        <View style={styles.floatingHeader}>
          <TouchableOpacity style={styles.floatingBtn} onPress={() => router.back()}>
            <Text style={styles.floatingBtnText}>?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.floatingBtn, favori && styles.floatingBtnActive]} onPress={toggleFavori}>
            <Text style={[styles.floatingBtnText, favori && styles.floatingBtnTextActive]}>{favori ? '?' : '?'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.catBadge}>
          <Text style={styles.catBadgeText}>{product.category?.name}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <Text style={styles.price}>{Number(product.price).toLocaleString('fr-FR')} <Text style={styles.currency}>FCFA</Text></Text>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.location}>?? {product.location || product.seller?.location || 'Senegal'}</Text>
        </View>

        {product.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vendeur</Text>
          <View style={styles.sellerCard}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerAvatarText}>{product.seller?.name?.[0]?.toUpperCase() || 'V'}</Text>
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{product.seller?.name || 'Vendeur'}</Text>
              <Text style={styles.sellerLocation}>?? {product.seller?.location || 'Senegal'}</Text>
            </View>
            <View style={styles.sellerBadge}>
              <Text style={styles.sellerBadgeText}>Verifie</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceSmallLabel}>Prix</Text>
          <Text style={styles.priceSmallValue}>{Number(product.price).toLocaleString('fr-FR')} FCFA</Text>
        </View>
        <TouchableOpacity style={styles.ctaBtn} onPress={contacterVendeur} disabled={contacting} activeOpacity={0.85}>
          {contacting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.ctaBtnText}>Contacter le vendeur</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' },
  errorText: { fontSize: 18, color: '#999', marginBottom: 16 },
  backLink: { fontSize: 15, color: '#1BAA6B', fontWeight: '600' },
  imageWrap: { height: 300, position: 'relative' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { width: '100%', height: '100%', backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 80 },
  floatingHeader: { position: 'absolute', top: 52, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  floatingBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  floatingBtnActive: { backgroundColor: '#FFE8E8' },
  floatingBtnText: { fontSize: 20, color: '#333', fontWeight: '700' },
  floatingBtnTextActive: { color: '#E53935' },
  catBadge: { position: 'absolute', bottom: 12, left: 16, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 100, paddingHorizontal: 12, paddingVertical: 5 },
  catBadgeText: { fontSize: 12, fontWeight: '700', color: '#333' },
  content: { flex: 1 },
  topSection: { padding: 20, backgroundColor: '#fff', marginBottom: 8 },
  price: { fontSize: 28, fontWeight: '900', color: '#1BAA6B', marginBottom: 8 },
  currency: { fontSize: 16, fontWeight: '500', color: '#1BAA6B' },
  title: { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 8 },
  location: { fontSize: 13, color: '#999' },
  section: { backgroundColor: '#fff', marginBottom: 8, padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 12 },
  description: { fontSize: 15, color: '#555', lineHeight: 24 },
  sellerCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sellerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E8F5EE', borderWidth: 1.5, borderColor: '#1BAA6B', alignItems: 'center', justifyContent: 'center' },
  sellerAvatarText: { fontSize: 20, fontWeight: '900', color: '#1BAA6B' },
  sellerInfo: { flex: 1 },
  sellerName: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 2 },
  sellerLocation: { fontSize: 12, color: '#999' },
  sellerBadge: { backgroundColor: '#E8F5EE', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  sellerBadgeText: { fontSize: 11, fontWeight: '700', color: '#1BAA6B' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 28, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', gap: 16 },
  priceSmallLabel: { fontSize: 11, color: '#999', fontWeight: '500' },
  priceSmallValue: { fontSize: 18, fontWeight: '900', color: '#1BAA6B' },
  ctaBtn: { flex: 1, backgroundColor: '#1BAA6B', borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center', shadowColor: '#1BAA6B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  ctaBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
