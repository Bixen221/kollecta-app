import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import api from '../../services/api';

const COLORS = {
  or: '#C9A84C', bord: '#8B1A2A', dark: '#0E0A08',
  light: '#B0A090', bd: 'rgba(201,168,76,0.2)',
};

export default function DonsScreen() {
  const [dons,      setDons]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);
  const [filtre,    setFiltre]    = useState('Tout');

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
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); charger(); }} tintColor={COLORS.or} />}
          >
            {dons.length === 0
              ? <Text style={styles.vide}>Aucun don disponible pour le moment.</Text>
              : dons.map(don => (
                <View key={don.id} style={styles.card}>
                  <View style={[styles.cardImg, { backgroundColor: don.type === 'nourriture' ? '#FFF8E8' : '#EAF5EE' }]}>
                    <Text style={{ fontSize: 36 }}>{don.type === 'nourriture' ? '🍱' : '📦'}</Text>
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitre}>{don.titre}</Text>
                    <Text style={styles.cardSous}>{don.quartier} · {don.ville}</Text>
                    <View style={styles.cardFooter}>
                      <Text style={styles.cardAuteur}>{don.prenom} {don.nom}</Text>
                      <TouchableOpacity style={styles.btnReserver}>
                        <Text style={styles.btnReserverTxt}>Réserver</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
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
  cardImg:        { height: 100, justifyContent: 'center', alignItems: 'center' },
  cardBody:       { padding: 12 },
  cardTitre:      { fontSize: 14, fontWeight: '700', color: '#F0E8D8', marginBottom: 3 },
  cardSous:       { fontSize: 11, color: COLORS.light },
  cardFooter:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  cardAuteur:     { fontSize: 12, color: COLORS.light },
  btnReserver:    { backgroundColor: COLORS.bord, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  btnReserverTxt: { fontSize: 12, fontWeight: '700', color: 'white' },
});
