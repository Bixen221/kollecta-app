import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function MessagesScreen({ navigation }) {
  const { theme } = useTheme();
  const { user }  = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [recherche,     setRecherche]     = useState('');

  const charger = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.conversations || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useFocusEffect(
    useCallback(() => {
      charger();
      const interval = setInterval(charger, 10000);
      return () => clearInterval(interval);
    }, [])
  );

  const filtres = conversations.filter(c =>
    c.autre_nom?.toLowerCase().includes(recherche.toLowerCase()) ||
    c.autre_prenom?.toLowerCase().includes(recherche.toLowerCase()) ||
    c.dernier_message?.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ backgroundColor: theme.hdr, padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: theme.bd }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 13, color: theme.txt2, fontWeight: '600' }}>← Retour</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '800', color: theme.txt }}>💬 Messages</Text>
        <Text style={{ fontSize: 12, color: theme.txt2, marginTop: 2 }}>
          {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.card2, borderRadius: 11, padding: 10, borderWidth: 1, borderColor: theme.bd, marginTop: 12 }}>
          <Text style={{ fontSize: 14, color: theme.txt3 }}>🔍</Text>
          <TextInput
            style={{ flex: 1, fontSize: 13, color: theme.txt }}
            placeholder="Rechercher une conversation..."
            placeholderTextColor={theme.txt3}
            value={recherche}
            onChangeText={setRecherche}
          />
        </View>
      </View>

      {loading
        ? <ActivityIndicator size="large" color={theme.or} style={{ marginTop: 40 }} />
        : <ScrollView style={{ marginTop: 8 }}>
            {filtres.length === 0
              ? <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 40 }}>
                  <Text style={{ fontSize: 48, marginBottom: 16 }}>💬</Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: theme.txt, marginBottom: 8 }}>Aucune conversation</Text>
                  <Text style={{ fontSize: 14, color: theme.txt2, textAlign: 'center', lineHeight: 20 }}>
                    Vos conversations apparaîtront ici.
                  </Text>
                </View>
              : filtres.map(conv => (
                <TouchableOpacity
                  key={conv.id}
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.bd }}
                  onPress={() => navigation.navigate('Conversation', { conversationId: conv.id })}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.bord, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>{conv.autre_prenom?.[0]}{conv.autre_nom?.[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: theme.txt }}>{conv.autre_prenom} {conv.autre_nom}</Text>
                    <Text style={{ fontSize: 12, color: theme.txt2, marginTop: 2 }} numberOfLines={1}>
                      {conv.dernier_message || 'Nouvelle conversation'}
                    </Text>
                  </View>
                  {Number(conv.non_lus) > 0 && (
                    <View style={{ backgroundColor: theme.gr, borderRadius: 20, minWidth: 22, height: 22, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: 'white' }}>{conv.non_lus}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            }
            <View style={{ height: 30 }} />
          </ScrollView>
      }
    </View>
  );
}
