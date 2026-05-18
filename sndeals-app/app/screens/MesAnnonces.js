import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api.js';

export default function MesAnnonces() {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { chargerAnnonces(); }, []);

  async function chargerAnnonces() {
    try {
      const response = await api.get('/products/seller/mes-annonces');
      setAnnonces(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }

  async function supprimerAnnonce(id) {
    Alert.alert('Supprimer', 'Tu veux vraiment supprimer cette annonce ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete('/products/' + id);
            setAnnonces(prev => prev.filter(a => a.id !== id));
          } catch (error) {
            Alert.alert('Erreur', 'Impossible de supprimer');
          }
        }
      }
    ]);
  }

  function getStatusColor(status) {
    if (status === 'available') return '#1BAA6B';
    if (status === 'sold') return '#E53935';
    return '#FF9800';
  }

  function getStatusLabel(status) {
    if (status === 'available') return 'En ligne';
    if (status === 'sold') return 'Vendu';
    return 'Reserve';
  }

  function renderAnnonce({ item }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          {item.images?.[0]
            ? <Image source={{ uri: item.images[0].url }} style={styles.cardImg} />
            : <View style={styles.cardImgPlaceholder}><Text style={styles.placeholderIcon}>??</Text></View>
          }
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardPrice}>{Number(item.price).toLocaleString('fr-FR')} FCFA</Text>
          <View style={styles.cardMeta}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20', borderColor: getStatusColor(item.status) }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusLabel(item.status)}</Text>
            </View>
            <Text style={styles.cardDate}>{new Date(item.createdAt).toLocaleDateString('fr-FR')}</Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push({ pathname: './ModifierAnnonce', params: { id: item.id } })}>
            <Text style={styles.editBtnText}>?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => supprimerAnnonce(item.id)}>
            <Text style={styles.deleteBtnText}>?</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>? Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes annonces</Text>
        <TouchableOpacity onPress={() => router.push('./Vendre')}>
          <Text style={styles.addBtn}>+ New</Text>
        </TouchableOpacity>
      </View>

      {loading
        ? <ActivityIndicator size="large" color="#1BAA6B" style={{ marginTop: 40 }} />
        : <FlatList
            data={annonces}
            keyExtractor={i => String(i.id)}
            contentContainerStyle={styles.list}
            renderItem={renderAnnonce}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>??</Text>
                <Text style={styles.emptyTitle}>Aucune annonce</Text>
                <Text style={styles.emptyText}>Publie ta premiere annonce !</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('./Vendre')}>
                  <Text style={styles.emptyBtnText}>+ Vendre quelque chose</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backText: { fontSize: 15, color: '#1BAA6B', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
  addBtn: { fontSize: 14, color: '#1BAA6B', fontWeight: '700' },
  list: { padding: 16 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 10, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardLeft: { flexShrink: 0 },
  cardImg: { width: 72, height: 72, borderRadius: 12, resizeMode: 'cover' },
  cardImgPlaceholder: { width: 72, height: 72, borderRadius: 12, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  placeholderIcon: { fontSize: 28 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 4 },
  cardPrice: { fontSize: 15, fontWeight: '900', color: '#1BAA6B', marginBottom: 8 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusBadge: { borderRadius: 100, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardDate: { fontSize: 11, color: '#bbb' },
  cardActions: { flexDirection: 'column', gap: 8 },
  editBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E8F5EE', borderWidth: 1, borderColor: '#1BAA6B', alignItems: 'center', justifyContent: 'center' },
  editBtnText: { fontSize: 16, color: '#1BAA6B' },
  deleteBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#E53935', alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 14, color: '#E53935', fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#333', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#999', marginBottom: 24 },
  emptyBtn: { backgroundColor: '#1BAA6B', borderRadius: 100, paddingHorizontal: 24, paddingVertical: 14 },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
