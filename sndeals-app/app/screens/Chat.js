import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../context/AuthContext.js';
import api from '../services/api.js';

export default function Chat() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const flatListRef = useRef(null);

  useEffect(() => { chargerMessages(); }, [id]);

  async function chargerMessages() {
    try {
      const response = await api.get('/messages/conversation/' + id);
      setConversation(response.data);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }

  async function envoyerMessage() {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const response = await api.post('/messages/conversation/' + id, { content: newMessage.trim() });
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error('Erreur envoi:', error);
    } finally {
      setSending(false);
    }
  }

  function renderMessage({ item }) {
    const isMe = item.senderId === user?.id;
    return (
      <View style={[styles.messageWrap, isMe && styles.messageWrapMe]}>
        {!isMe && (
          <View style={styles.messageAvatar}>
            <Text style={styles.messageAvatarText}>{item.sender?.name?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
        )}
        <View style={[styles.messageBubble, isMe && styles.messageBubbleMe]}>
          <Text style={[styles.messageText, isMe && styles.messageTextMe]}>{item.content}</Text>
          <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
            {new Date(item.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  }

  if (loading) return (
    <View style={styles.loadingWrap}>
      <ActivityIndicator size="large" color="#1BAA6B" />
    </View>
  );

  const autrePersonne = conversation?.buyerId === user?.id ? conversation?.seller : conversation?.buyer;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>?</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{autrePersonne?.name || 'Utilisateur'}</Text>
          <Text style={styles.headerProduct} numberOfLines={1}>Re: {conversation?.product?.title}</Text>
        </View>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>{autrePersonne?.name?.[0]?.toUpperCase() || 'U'}</Text>
        </View>
      </View>

      <View style={styles.productBar}>
        <Text style={styles.productBarTitle} numberOfLines={1}>{conversation?.product?.title}</Text>
        <Text style={styles.productBarPrice}>{Number(conversation?.product?.price).toLocaleString('fr-FR')} FCFA</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={styles.messagesList}
        renderItem={renderMessage}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyMessages}>
            <Text style={styles.emptyMessagesText}>Commence la conversation !</Text>
          </View>
        }
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Ecrire un message..."
          placeholderTextColor="#bbb"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity style={[styles.sendBtn, !newMessage.trim() && styles.sendBtnDisabled]} onPress={envoyerMessage} disabled={sending || !newMessage.trim()}>
          {sending
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.sendBtnText}>?</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', gap: 12 },
  backText: { fontSize: 22, color: '#1BAA6B', fontWeight: '700' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '800', color: '#111' },
  headerProduct: { fontSize: 12, color: '#999', marginTop: 2 },
  headerAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E8F5EE', borderWidth: 1.5, borderColor: '#1BAA6B', alignItems: 'center', justifyContent: 'center' },
  headerAvatarText: { fontSize: 15, fontWeight: '900', color: '#1BAA6B' },
  productBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#F0FAF5', borderBottomWidth: 1, borderBottomColor: '#e0f0e8' },
  productBarTitle: { flex: 1, fontSize: 13, color: '#555', marginRight: 12 },
  productBarPrice: { fontSize: 14, fontWeight: '800', color: '#1BAA6B' },
  messagesList: { padding: 16, paddingBottom: 8 },
  messageWrap: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end', gap: 8 },
  messageWrapMe: { flexDirection: 'row-reverse' },
  messageAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E8F5EE', borderWidth: 1, borderColor: '#1BAA6B', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  messageAvatarText: { fontSize: 12, fontWeight: '800', color: '#1BAA6B' },
  messageBubble: { maxWidth: '75%', backgroundColor: '#fff', borderRadius: 18, borderBottomLeftRadius: 4, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  messageBubbleMe: { backgroundColor: '#1BAA6B', borderRadius: 18, borderBottomRightRadius: 4 },
  messageText: { fontSize: 15, color: '#111', lineHeight: 22 },
  messageTextMe: { color: '#fff' },
  messageTime: { fontSize: 10, color: '#bbb', marginTop: 4 },
  messageTimeMe: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  emptyMessages: { alignItems: 'center', paddingTop: 60 },
  emptyMessagesText: { fontSize: 14, color: '#bbb' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 10, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
  input: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 20, borderWidth: 1, borderColor: '#e0e0e0', paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#111', maxHeight: 100 },
  sendBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#1BAA6B', alignItems: 'center', justifyContent: 'center', shadowColor: '#1BAA6B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  sendBtnDisabled: { backgroundColor: '#ccc', shadowOpacity: 0 },
  sendBtnText: { fontSize: 20, fontWeight: '800', color: '#fff' },
});
