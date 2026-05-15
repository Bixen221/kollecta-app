import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import api from '../../services/api';
import { useReservations } from '../../context/ReservationsContext';

const COLORS = {
  or: '#C9A84C', bord: '#8B1A2A', dark: '#0E0A08',
  light: '#B0A090', bd: 'rgba(201,168,76,0.2)', gr: '#2D7A4F',
};

export default function DonsScreen({ navigation }) {
  const [dons,       setDons]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtre,     setFiltre]     = useState('Tout');
  const { estReserve, getReservation, charger: rechargerResas } = useReservations();

  const filtres = ['Tout', 'Nourriture', 'Matériels', 'Urgent'];

  const charger = async () => {
    try {
      const params = {};
      if (filtre === 'Nourriture') params.type = 'nourriture';
      if (filtre === 'Matériels')  params.type = 'materiel';
      if (filtre === 'Urgent')     params.urgent = true;
      const res = await api.get('/dons', { params });
      setDons(res.dons || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { charger(); }, [filtre]);

  const handleAnnulerReservation = async (donId) => {
    const resa = getReservation(donId);
    if (!resa) return;
    Alert.alert(
      'Annuler la réservation',
      'Voulez-vous annuler votre réservation pour ce don ?',
      [
        { text: 'Non', style: 'cancel' },
        { text: 'Oui, annuler', style: 'destructive', onPress: async () => {
          try {
            await api.post('/dons/reservations/'+resa.id+'/confirmer', { role: 'annuler' });
            await rechargerResas();
            charger();
          } catch (err) {
            Alert.alert('Erreur', err.message);
          }
        }},
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>KOLLECTA</Text>
        <Text style={styles.titre}>🎁 Dons</Text>
        <Text style={styles.sous}>Trouvez un don près de chez vous</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtreBar}>
        {filtres.map(f => (
          <TouchableOpacity key={f} style={[styles.filtrePill, filtre === f && styles.filtrePillAct]} onPress={() => setFiltre(f)}>
            <Text style={[styles.filtreTxt, filtre === f && styles.filtreTxtAct]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading
        ? <ActivityIndicator size="large" color={COLORS.or} style={{ marginTop: 40 }} />
        : <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); charger(); rechargerResas(); }} tintColor={COLORS.or} />}
          >
            {dons.length === 0
              ? <Text style={styles.vide}>Aucun don disponible.</Text>
              : dons.map(don => {
                const reserve = estReserve(don.id);
                return (
                  <TouchableOpacity
                    key={don.id}
                    style={[styles.card, reserve && styles.cardReserve]}
                    onPress={() => navigation.navigate('DetailDon', { donId: don.id })}
                  >
                    <View style={[styles.cardImg, { backgroundColor: don.type === 'nourriture' ? '#FFF8E8' : '#EAF5EE' }]}>
                      <Text style={{ fontSize: 36 }}>{don.type === 'nourriture' ? '🍱' : '📦'}</Text>
                      {reserve && (
                        <View style={styles.reserveTag}>
                          <Text style={styles.reserveTagTxt}>✓ Réservé</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.cardBody}>
                      <Text style={styles.cardTitre}>{don.titre}</Text>
                      <Text style={styles.cardSous}>{don.quartier} · {don.ville}</Text>
                      {reserve && (
                        <Text style={styles.attenteTxt}>⏳ En attente de contact WhatsApp</Text>
                      )}
                      <View style={styles.cardFooter}>
                        <Text style={styles.cardAuteur}>{don.prenom} {don.nom}</Text>
                        {reserve ? (
                          <TouchableOpacity
                            style={styles.btnAnnuler}
                            onPress={() => handleAnnulerReservation(don.id)}
                          >
                            <Text style={styles.btnAnnulerTxt}>Annuler</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={[styles.btnReserver, don.quantite_dispo <= 0 && styles.btnGris]}
                            onPress={() => navigation.navigate('DetailDon', { donId: don.id })}
                            disabled={don.quantite_dispo <= 0}
                          >
                            <Text style={styles.btnReserverTxt}>
                              {don.quantite_dispo <= 0 ? 'Indisponible' : 'Réserver'}
                            </Text>
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

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#0E0A08' },
  header:         { padding: 20, paddingTop: 50 },
  logo:           { fontSize: 20, fontWeight: '800', color: '#C9A84C', letterSpacing: 2, marginBottom: 8 },
  titre:          { fontSize: 22, fontWeight: '800', color: '#F0E8D8' },
  sous:           { fontSize: 12, color: COLORS.light, marginTop: 2 },
  filtreBar:      { paddingHorizontal: 16, marginBottom: 12, maxHeight: 44 },
  filtrePill:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: COLORS.bd, marginRight: 8, backgroundColor: '#1E1612' },
  filtrePillAct:  { backgroundColor: COLORS.bord, borderColor: COLORS.bord },
  filtreTxt:      { fontSize: 12, fontWeight: '600', color: COLORS.light },
  filtreTxtAct:   { color: 'white' },
  vide:           { textAlign: 'center', color: COLORS.light, marginTop: 40, fontSize: 14 },
  card:           { backgroundColor: '#1E1612', borderRadius: 14, marginHorizontal: 16, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.bd },
  cardReserve:    { borderColor: COLORS.gr, borderWidth: 1.5 },
  cardImg:        { height: 100, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  reserveTag:     { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(45,122,79,0.9)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  reserveTagTxt:  { color: 'white', fontSize: 10, fontWeight: '700' },
  cardBody:       { padding: 12 },
  cardTitre:      { fontSize: 14, fontWeight: '700', color: '#F0E8D8', marginBottom: 3 },
  cardSous:       { fontSize: 11, color: COLORS.light },
  attenteTxt:     { fontSize: 11, color: '#4ADE80', marginTop: 4, fontWeight: '600' },
  cardFooter:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  cardAuteur:     { fontSize: 12, color: COLORS.light },
  btnReserver:    { backgroundColor: COLORS.bord, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  btnReserverTxt: { fontSize: 12, fontWeight: '700', color: 'white' },
  btnAnnuler:     { backgroundColor: '#3A1A1A', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: '#FF6B6B' },
  btnAnnulerTxt:  { fontSize: 12, fontWeight: '700', color: '#FF6B6B' },
  btnGris:        { backgroundColor: '#3A3030' },
});
