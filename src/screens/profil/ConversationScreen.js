import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  ActivityIndicator, KeyboardAvoidingView, Platform, Linking, Alert
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function ConversationScreen({ route, navigation }) {
  const { conversationId } = route.params;
  const { theme } = useTheme();
  const { user }  = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [texte,    setTexte]    = useState('');
  const [envoi,    setEnvoi]    = useState(false);
  const listRef = useRef(null);

  const charger = async () => {
    try {
      const res = await api.get('/messages/conversations/'+conversationId);
      setMessages(res.messages || []);
      setConversation(res.conversation);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const ouvrirWhatsApp = () => {
    const numero = conversation?.autre_whatsapp?.replace(/\D/g, '');
    if (!numero) return;
    Linking.openURL('https://wa.me/'+numero).catch(() => Alert.alert('Erreur', "Impossible d'ouvrir WhatsApp"));
  };

  useEffect(() => {
    charger();
    const interval = setInterval(charger, 5000);
    return () => clearInterval(interval);
  }, []);

  const envoyer = async () => {
    if (!texte.trim() || envoi) return;
    setEnvoi(true);
    try {
      await api.post('/messages/conversations/'+conversationId, { contenu: texte.trim() });
      setTexte('');
      await charger();
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error(err);
    } finally {
      setEnvoi(false);
    }
  };

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg }}>
      <ActivityIndicator size="large" color={theme.or} />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={{ backgroundColor: theme.hdr, padding: 16, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: theme.bd, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
          <Text style={{ fontSize: 20, color: theme.txt }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.txt }} numberOfLines={1}>
            {conversation?.autre_prenom} {conversation?.autre_nom}
          </Text>
          {conversation?.entite_titre && (
            <Text style={{ fontSize: 11, color: theme.or }} numberOfLines={1}>
              {conversation.entite_type === 'don' ? '🎁' : '🔨'} {conversation.entite_titre}
              {conversation.entite_numero ? ' · ID: #'+String(conversation.entite_numero).padStart(5, '0') : ''}
            </Text>
          )}
        </View>
        {conversation?.autre_whatsapp && (
          <TouchableOpacity
            onPress={ouvrirWhatsApp}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#25D366', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: 'white' }}>WhatsApp</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: theme.txt2, marginTop: 40 }}>
            Aucun message. Lancez la discussion !
          </Text>
        }
        renderItem={({ item }) => {
          const estMoi = item.expediteur_id === user?.id;
          return (
            <View style={{ flexDirection: 'row', justifyContent: estMoi ? 'flex-end' : 'flex-start' }}>
              <View style={{
                maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18,
                backgroundColor: estMoi ? theme.bord : theme.card,
                borderWidth: estMoi ? 0 : 1, borderColor: theme.bd,
              }}>
                <Text style={{ fontSize: 14, color: estMoi ? 'white' : theme.txt }}>{item.contenu}</Text>
              </View>
            </View>
          );
        }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, paddingBottom: 20, borderTopWidth: 1, borderTopColor: theme.bd, backgroundColor: theme.bg }}>
        <TextInput
          style={{ flex: 1, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.bd, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: theme.txt }}
          placeholder="Écrire un message..."
          placeholderTextColor={theme.txt3}
          value={texte}
          onChangeText={setTexte}
          multiline
        />
        <TouchableOpacity
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.bord, justifyContent: 'center', alignItems: 'center', opacity: (!texte.trim() || envoi) ? 0.5 : 1 }}
          onPress={envoyer}
          disabled={!texte.trim() || envoi}
        >
          {envoi ? <ActivityIndicator size="small" color="white" /> : <Text style={{ fontSize: 18, color: 'white' }}>➤</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
