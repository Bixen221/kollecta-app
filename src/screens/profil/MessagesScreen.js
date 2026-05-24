import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function MessagesScreen({ navigation }) {
  const { theme } = useTheme();
  const { user }  = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [recherche,    setRecherche]    = useState('');

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    try {
      const res = await api.get('/dons/reservations/mes-reservations');
      const actives = (res.reservations || []).filter(r => !['annule'].includes(r.statut));
      setReservations(actives);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const ouvrirWhatsApp = (whatsapp, titre) => {
    const numero  = whatsapp?.replace(/\D/g, '');
    const message = encodeURIComponent('Bonjour ! Je vous contacte via Kollecta concernant le don "'+titre+'".');
    const url     = 'https://wa.me/'+numero+'?text='+message;
    const { Linking } = require('react-native');
    Linking.openURL(url).catch(() => {
      alert('Impossible d\'ouvrir WhatsApp');
    });
  };

  const filtres = reservations.filter(r =>
    r.titre?.toLowerCase().includes(recherche.toLowerCase()) ||
    r.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
    r.prenom?.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ backgroundColor: theme.hdr, padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: theme.bd }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 13, color: theme.txt2, fontWeight: '600' }}>← Retour</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '800', color: theme.txt }}>💬 Messages</Text>
        <Text style={{ fontSize: 12, color: theme.txt2, marginTop: 2 }}>{reservations.length} conversation{reservations.length > 1 ? 's' : ''} active{reservations.length > 1 ? 's' : ''}</Text>

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
                    Vos conversations avec les propriétaires de dons apparaîtront ici.
                  </Text>
                </View>
              : filtres.map(resa => (
                <TouchableOpacity
                  key={resa.id}
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.bd }}
                  onPress={() => resa.whatsapp && ouvrirWhatsApp(resa.whatsapp, resa.titre)}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.bord, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>{resa.prenom?.[0]}{resa.nom?.[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: theme.txt }}>{resa.prenom} {resa.nom}</Text>
                    <Text style={{ fontSize: 12, color: theme.txt2, marginTop: 2 }} numberOfLines={1}>Don: {resa.titre}</Text>
                    <Text style={{ fontSize: 11, color: theme.txt3, marginTop: 1 }}>{resa.quartier} · {resa.ville}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <View style={{ backgroundColor: '#25D366', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: 'white' }}>WhatsApp →</Text>
                    </View>
                    <Text style={{ fontSize: 10, color: theme.txt3, marginTop: 6 }}>
                      {new Date(resa.cree_le).toLocaleDateString('fr-SN')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            }
            <View style={{ height: 30 }} />
          </ScrollView>
      }
    </View>
  );
}
