import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert, TextInput, Image } from 'react-native';
import api from '../../services/api';
import { useReservations } from '../../context/ReservationsContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function DonsScreen({ navigation }) {
  const { theme }  = useTheme();
  const { user }   = useAuth();
  const [dons,       setDons]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtre,     setFiltre]     = useState('Tout');
  const [recherche,  setRecherche]  = useState('');
  const { estReserve, getReservation, charger: rechargerResas } = useReservations();

  const filtres = ['Tout', 'Nourriture', 'Matériels', 'Urgent'];

  const charger = async () => {
    try {
      const params = {};
      if (filtre === 'Nourriture') params.type = 'nourriture';
      if (filtre === 'Matériels')  params.type = 'materiel';
      if (filtre === 'Urgent')     params.urgent = true;
      const res = await api.get('/dons', { params });
      // Filtrer les publications du proprio
      const filtered = (res.dons || []).filter(d => d.proprietaire_id !== user?.id);
      setDons(filtered);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { charger(); }, [filtre]);

  const handleAnnulerReservation = async (donId) => {
    const resa = getReservation(donId);
    if (!resa) return;
    Alert.alert('Annuler la réservation', 'Voulez-vous annuler votre réservation ?', [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui, annuler', style: 'destructive', onPress: async () => {
        try {
          await api.post('/dons/reservations/'+resa.id+'/confirmer', { role: 'annuler' });
          await rechargerResas();
          charger();
        } catch (err) { Alert.alert('Erreur', err.message); }
      }},
    ]);
  };

  const donsFiltres = dons.filter(d =>
    d.titre?.toLowerCase().includes(recherche.toLowerCase()) ||
    d.quartier?.toLowerCase().includes(recherche.toLowerCase()) ||
    d.categorie?.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* HEADER */}
      <View style={{ backgroundColor: theme.hdr, padding: 20, paddingTop: 50 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: theme.or, letterSpacing: 2, marginBottom: 8 }}>KOLLECTA</Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: theme.txt }}>🎁 Dons</Text>
        <Text style={{ fontSize: 12, color: theme.txt2, marginTop: 2, marginBottom: 14 }}>Trouvez un don près de chez vous</Text>

        {/* RECHERCHE */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.card2, borderRadius: 11, padding: 10, borderWidth: 1, borderColor: theme.bd }}>
          <Text style={{ fontSize: 14, color: theme.txt3 }}>🔍</Text>
          <TextInput
            style={{ flex: 1, fontSize: 13, color: theme.txt }}
            placeholder="Rechercher un don..."
            placeholderTextColor={theme.txt3}
            value={recherche}
            onChangeText={setRecherche}
          />
          {recherche.length > 0 && (
            <TouchableOpacity onPress={() => setRecherche('')}>
              <Text style={{ fontSize: 14, color: theme.txt3 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* FILTRES */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, marginVertical: 10, maxHeight: 44 }}>
        {filtres.map(f => (
          <TouchableOpacity
            key={f}
            style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: filtre === f ? theme.bord : theme.bd, marginRight: 8, backgroundColor: filtre === f ? theme.bord : theme.card }}
            onPress={() => setFiltre(f)}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: filtre === f ? 'white' : theme.txt2 }}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading
        ? <ActivityIndicator size="large" color={theme.or} style={{ marginTop: 40 }} />
        : <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); charger(); rechargerResas(); }} tintColor={theme.or} />}
          >
            {donsFiltres.length === 0
              ? <Text style={{ textAlign: 'center', color: theme.txt2, marginTop: 40, fontSize: 14 }}>
                  {recherche ? 'Aucun résultat pour "'+recherche+'"' : 'Aucun don disponible.'}
                </Text>
              : donsFiltres.map(don => {
                const reserve = estReserve(don.id);
                return (
                  <TouchableOpacity
                    key={don.id}
                    style={{ backgroundColor: theme.card, borderRadius: 14, marginHorizontal: 16, marginBottom: 10, overflow: 'hidden', borderWidth: reserve ? 1.5 : 1, borderColor: reserve ? theme.gr : theme.bd }}
                    onPress={() => navigation.navigate('DetailDon', { donId: don.id })}
                  >
                    <View style={{ height: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: don.type === 'nourriture' ? '#FFF8E8' : '#EAF5EE', position: 'relative' }}>
  {don.photos && don.photos[0]
    ? <Image source={{ uri: don.photos[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
    : <Text style={{ fontSize: 36 }}>{don.type === 'nourriture' ? '🍱' : '📦'}</Text>
  }
                      {reserve && (
                        <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(45,122,79,0.9)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                          <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>✓ Réservé</Text>
                        </View>
                      )}
                      {don.urgent && (
                        <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(204,34,34,0.9)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
                          <Text style={{ color: 'white', fontSize: 9, fontWeight: '700' }}>🚨 Urgent</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ padding: 12 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: theme.txt, marginBottom: 3 }}>{don.titre}</Text>
                      <Text style={{ fontSize: 11, color: theme.txt2 }}>{don.quartier} · {don.ville}</Text>
                      {reserve && <Text style={{ fontSize: 11, color: '#4ADE80', marginTop: 4, fontWeight: '600' }}>⏳ En attente de contact WhatsApp</Text>}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                        <Text style={{ fontSize: 12, color: theme.txt2 }}>{don.prenom} {don.nom}</Text>
                        {reserve ? (
                          <TouchableOpacity
                            style={{ backgroundColor: '#3A1A1A', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: '#FF6B6B' }}
                            onPress={() => handleAnnulerReservation(don.id)}
                          >
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#FF6B6B' }}>Annuler</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={{ backgroundColor: don.quantite_dispo <= 0 ? '#3A3030' : theme.bord, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 }}
                            onPress={() => navigation.navigate('DetailDon', { donId: don.id })}
                            disabled={don.quantite_dispo <= 0}
                          >
                            <Text style={{ fontSize: 12, fontWeight: '700', color: 'white' }}>{don.quantite_dispo <= 0 ? 'Indisponible' : 'Réserver'}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            }
            <View style={{ height: 20 }} />
          </ScrollView>
      }
    </View>
  );
}
