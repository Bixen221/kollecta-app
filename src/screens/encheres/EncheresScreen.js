import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import api from '../../services/api';

const COLORS = {
  or: '#C9A84C', bord: '#8B1A2A', dark: '#0E0A08',
  light: '#B0A090', bd: 'rgba(201,168,76,0.2)',
};

const getTempsRestant = (fin_le) => {
  const diff = new Date(fin_le) - new Date();
  if (diff <= 0) return 'Terminée';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h/24)}j ${h%24}h`;
  return `${h}h ${m}m`;
};

export default function EncheresScreen({ navigation }) {
  const [encheres,   setEncheres]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtre,     setFiltre]     = useState('Tout');

  const filtres = ['Tout', 'En cours', 'À venir', 'Terminées'];

  const charger = async () => {
    try {
      const params = {};
      if (filtre === 'En cours')  params.statut = 'en_cours';
      if (filtre === 'À venir')   params.statut = 'a_venir';
      if (filtre === 'Terminées') params.statut = 'termine';
      const res = await api.get('/encheres', { params });
      setEncheres(res.encheres || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { charger(); }, [filtre]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>KOLLECTA</Text>
        <Text style={styles.titre}>🔨 Enchères</Text>
        <Text style={styles.sous}>Misez sur les meilleures offres</Text>
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
            {encheres.length === 0
              ? <Text style={styles.vide}>Aucune enchère disponible.</Text>
              : encheres.map(e => (
                <TouchableOpacity
                  key={e.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('DetailEnchere', { enchereId: e.id })}
                >
                  <View style={styles.cardImg}>
                    <Text style={{ fontSize: 40 }}>📦</Text>
                    <View style={[styles.badge, e.statut === 'en_cours' && styles.badgeLive]}>
                      <Text style={styles.badgeTxt}>
                        {e.statut === 'en_cours' ? '🔴 EN DIRECT' : e.statut === 'a_venir' ? 'À venir' : 'Terminée'}
                      </Text>
                    </View>
                    {e.statut === 'en_cours' && (
                      <View style={styles.timer}>
                        <Text style={styles.timerTxt}>⏱ {getTempsRestant(e.fin_le)}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitre}>{e.titre}</Text>
                    <View style={styles.cardFooter}>
                      <View>
                        <Text style={styles.prixLabel}>Offre actuelle</Text>
                        <Text style={styles.prix}>{e.offre_actuelle?.toLocaleString()} FCFA</Text>
                        <Text style={styles.cardSous}>🙋 {e.nb_offres} enchères</Text>
                      </View>
                      <View style={styles.btnEncherir}>
                        <Text style={styles.btnEncherirTxt}>
                          {e.statut === 'en_cours' ? 'Enchérir →' : 'Voir'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            }
            <View style={{ height: 20 }} />
          </ScrollView>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#0E0A08' },
  header:        { padding: 20, paddingTop: 50 },
  logo:          { fontSize: 20, fontWeight: '800', color: '#C9A84C', letterSpacing: 2, marginBottom: 8 },
  titre:         { fontSize: 22, fontWeight: '800', color: '#F0E8D8' },
  sous:          { fontSize: 12, color: COLORS.light, marginTop: 2 },
  filtreBar:     { paddingHorizontal: 16, marginBottom: 12, maxHeight: 44 },
  filtrePill:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: COLORS.bd, marginRight: 8, backgroundColor: '#1E1612' },
  filtrePillAct: { backgroundColor: COLORS.bord, borderColor: COLORS.bord },
  filtreTxt:     { fontSize: 12, fontWeight: '600', color: COLORS.light },
  filtreTxtAct:  { color: 'white' },
  vide:          { textAlign: 'center', color: COLORS.light, marginTop: 40, fontSize: 14 },
  card:          { backgroundColor: '#1E1612', borderRadius: 14, marginHorizontal: 16, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.bd },
  cardImg:       { height: 130, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2A1E18', position: 'relative' },
  badge:         { position: 'absolute', top: 10, left: 10, backgroundColor: '#1A120E', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20, borderWidth: 1, borderColor: COLORS.bd },
  badgeLive:     { backgroundColor: COLORS.bord, borderColor: COLORS.bord },
  badgeTxt:      { fontSize: 10, fontWeight: '700', color: COLORS.or },
  timer:         { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  timerTxt:      { fontSize: 11, fontWeight: '700', color: COLORS.or },
  cardBody:      { padding: 12 },
  cardTitre:     { fontSize: 14, fontWeight: '700', color: '#F0E8D8', marginBottom: 8 },
  cardSous:      { fontSize: 11, color: COLORS.light },
  cardFooter:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  prixLabel:     { fontSize: 10, color: COLORS.light, marginBottom: 2 },
  prix:          { fontSize: 18, fontWeight: '800', color: COLORS.bord },
  btnEncherir:   { backgroundColor: COLORS.bord, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9 },
  btnEncherirTxt:{ fontSize: 12, fontWeight: '700', color: 'white' },
});
