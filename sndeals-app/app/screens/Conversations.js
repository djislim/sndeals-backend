import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext.js';
import api from '../services/api.js';

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => { chargerConversations(); }, []);

  async function chargerConversations() {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }

  function renderConversation({ item }) {
    const isbuyer = item.buyerId === user?.id;
    const autrePersonne = isbuyer ? item.seller : item.buyer;
    const dernierMessage = item.messages?.[0];
    return (
      <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: './Chat', params: { id: item.id } })} activeOpacity={0.85}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{autrePersonne?.name?.[0]?.toUpperCase() || 'U'}</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardTop}>
            <Text style={styles.personName}>{autrePersonne?.name || 'Utilisateur'}</Text>
            <Text style={styles.time}>{dernierMessage ? new Date(dernierMessage.createdAt).toLocaleDateString('fr-FR') : ''}</Text>
          </View>
          <Text style={styles.productName} numberOfLines={1}>Re: {item.product?.title}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>{dernierMessage?.content || 'Aucun message'}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>? Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 60 }} />
      </View>
      {loading
        ? <ActivityIndicator size="large" color="#1BAA6B" style={{ marginTop: 40 }} />
        : <FlatList
            data={conversations}
            keyExtractor={i => String(i.id)}
            contentContainerStyle={styles.list}
            renderItem={renderConversation}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>?</Text>
                <Text style={styles.emptyTitle}>Aucun message</Text>
                <Text style={styles.emptyText}>Tes conversations apparaitront ici</Text>
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
  list: { padding: 16 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E8F5EE', borderWidth: 1.5, borderColor: '#1BAA6B', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 20, fontWeight: '900', color: '#1BAA6B' },
  cardContent: { flex: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  personName: { fontSize: 15, fontWeight: '700', color: '#111' },
  time: { fontSize: 11, color: '#bbb' },
  productName: { fontSize: 12, color: '#1BAA6B', marginBottom: 2 },
  lastMessage: { fontSize: 13, color: '#999' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16, color: '#ccc' },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#333', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#999' },
});
