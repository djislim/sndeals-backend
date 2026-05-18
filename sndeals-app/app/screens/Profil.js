import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext.js';
import api from '../services/api.js';

export default function Profil() {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => { chargerProfil(); }, []);

  async function chargerProfil() {
    try {
      const response = await api.get('/users/profile');
      setProfil(response.data);
    } catch (error) {
      console.error('Erreur profil:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    Alert.alert('Deconnexion', 'Tu veux vraiment te deconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Oui', style: 'destructive', onPress: async () => { await logout(); router.replace('./Login'); } }
    ]);
  }

  if (loading) return (
    <View style={styles.loadingWrap}>
      <ActivityIndicator size="large" color="#1BAA6B" />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>? Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon Profil</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profil?.name?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.name}>{profil?.name || 'Utilisateur'}</Text>
          <Text style={styles.email}>{profil?.email}</Text>
          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{profil?._count?.products || 0}</Text>
              <Text style={styles.statLabel}>Annonces</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>5.0</Text>
              <Text style={styles.statLabel}>Note</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>SN</Text>
              <Text style={styles.statLabel}>Pays</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Telephone</Text>
              <Text style={styles.infoValue}>{profil?.phone || 'Non renseigne'}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ville</Text>
              <Text style={styles.infoValue}>{profil?.location || 'Non renseignee'}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Membre depuis</Text>
              <Text style={styles.infoValue}>{profil?.createdAt ? new Date(profil.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '-'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mon compte</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('./Vendre')}>
            <Text style={styles.actionIcon}>+</Text>
            <Text style={styles.actionText}>Publier une annonce</Text>
            <Text style={styles.actionArrow}>?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('./MesAnnonces')}>
            <Text style={styles.actionIcon}>?</Text>
            <Text style={styles.actionText}>Mes annonces</Text>
            <Text style={styles.actionArrow}>?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('./Conversations')}>
            <Text style={styles.actionIcon}>?</Text>
            <Text style={styles.actionText}>Mes messages</Text>
            <Text style={styles.actionArrow}>?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('./Home')}>
            <Text style={styles.actionIcon}>?</Text>
            <Text style={styles.actionText}>Voir les annonces</Text>
            <Text style={styles.actionArrow}>?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Se deconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backText: { fontSize: 15, color: '#1BAA6B', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
  heroSection: { alignItems: 'center', padding: 32, backgroundColor: '#fff', marginBottom: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5EE', borderWidth: 2, borderColor: '#1BAA6B', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#1BAA6B' },
  name: { fontSize: 22, fontWeight: '900', color: '#111', marginBottom: 4 },
  email: { fontSize: 13, color: '#999', marginBottom: 20 },
  statRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F8F8', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 24, gap: 24 },
  statBox: { alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '900', color: '#1BAA6B' },
  statLabel: { fontSize: 11, color: '#999', marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: '#eee' },
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#999', marginBottom: 10, marginTop: 16, letterSpacing: 0.5, textTransform: 'uppercase' },
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  infoLabel: { fontSize: 14, color: '#999' },
  infoValue: { fontSize: 14, color: '#111', fontWeight: '600' },
  infoDivider: { height: 1, backgroundColor: '#f5f5f5', marginHorizontal: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  actionIcon: { fontSize: 18, color: '#1BAA6B', marginRight: 14, width: 24, textAlign: 'center' },
  actionText: { flex: 1, fontSize: 15, color: '#111', fontWeight: '500' },
  actionArrow: { fontSize: 16, color: '#ccc' },
  logoutBtn: { marginHorizontal: 16, marginBottom: 40, marginTop: 8, borderWidth: 1.5, borderColor: '#ffdddd', borderRadius: 14, padding: 16, alignItems: 'center', backgroundColor: '#fff' },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#E53935' },
});
