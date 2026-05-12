import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const COLORS = {
  or: '#C9A84C', bord: '#8B1A2A', dark: '#0E0A08', dark2: '#1A120E',
  light: '#B0A090', card: '#1E1612', bd: 'rgba(201,168,76,0.2)', cream: '#FAF6EF',
};

const DonCard = ({ don, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={[styles.cardImg, { backgroundColor: don.type === 'nourriture' ? '#FFF8E8' : '#EAF5EE' }]}>
      <Text style={styles.cardEmoji}>{don.type === 'nourriture' ? '🍱' : '📦'}</Text>
    </View>
    <View style={styles.cardBody}>
      <View style={styles.tagRow}>
        <View style={styles.tag}><Text style={styles.tagTxt}>{don.categorie || don.type}</Text></View>
        {don.urgent && <View style={[styles.tag, { backgroundColor: '#FFECEC' }]}><Text style={[styles.tagTxt, { color: '#CC2222' }]}>Urgent</Text></View>}
      </View>
      <Text style={styles.cardTitre}>{don.titre}</Text>
      <Text style={styles.cardSous}>{don.quartier} · {don.ville}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.author}>
          <View style={styles.avatar}><Text style={styles.avatarTxt}>{don.prenom?.[0]}{don.nom?.[0]}</Text></View>
          <View>
            <Text style={styles.authorNom}>{don.prenom} {don.nom}</Text>
            <Text style={styles.authorNote}>⭐ {don.note_moyenne}</Text>
          </View>
        </View>
        <View style={styles.btnReserver}><Text style={styles.btnReserverTxt}>Réserver</Text></View>
      </View>
    </View>
  </TouchableOpacity>
);

export default function AccueilScreen({ navigation }) {
  const { user } = useAuth();
  const [dons,      setDons]      = useState([]);
  const [encheres,  setEncheres]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);

  const charger = async () => {
    try {
      const [resDons, resEncheres] = await Promise.all([
        api.get('/dons?limite=3'),
        api.get('/encheres?statut=en_cours&limite=2'),
      ]);
      setDons(resDons.dons || []);
      setEncheres(resEncheres.encheres || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { charger(); }, []);

  if (loading) return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={COLORS.or} />
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); charger(); }} tintColor={COLORS.or} />}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSous}>📍 Dakar, Sénégal</Text>
          <Text style={styles.headerLogo}>KOLLECTA</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Text style={{ fontSize: 20 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* HERO */}
      <View style={styles.hero}>
        <View style={styles.heroTag}><Text style={styles.heroTagTxt}>✦ Ensemble on est plus forts</Text></View>
        <Text style={styles.heroTitre}>Donnez, recevez,{'\n'}changez des vies</Text>
        <Text style={styles.heroSous}>12 000+ membres actifs au Sénégal</Text>
        <TouchableOpacity style={styles.heroBtn}>
          <Text style={styles.heroBtnTxt}>+ Publier une annonce</Text>
        </TouchableOpacity>
      </View>

      {/* STATS */}
      <View style={styles.stats}>
        {[['12k+', 'Membres'], ['3 400', 'Dons actifs'], ['847', 'Enchères']].map(([n, l]) => (
          <View key={l} style={styles.stat}>
            <Text style={styles.statN}>{n}</Text>
            <Text style={styles.statL}>{l}</Text>
          </View>
        ))}
      </View>

      {/* DONS */}
      <View style={styles.secHdr}>
        <Text style={styles.secTitre}>🎁 Dons récents</Text>
        <TouchableOpacity><Text style={styles.voirTout}>Voir tout →</Text></TouchableOpacity>
      </View>
      {dons.map(don => <DonCard key={don.id} don={don} onPress={() => navigation.navigate("DetailDon", { donId: don.id })} />)}

      {/* ENCHERES */}
      <View style={styles.secHdr}>
        <Text style={styles.secTitre}>🔨 Enchères en cours</Text>
        <TouchableOpacity><Text style={styles.voirTout}>Voir tout →</Text></TouchableOpacity>
      </View>
      {encheres.map(e => (
        <View key={e.id} style={styles.encCard}>
          <View style={styles.encImg}><Text style={{ fontSize: 40 }}>📦</Text></View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitre}>{e.titre}</Text>
            <Text style={styles.encPrix}>{e.offre_actuelle?.toLocaleString()} FCFA</Text>
            <Text style={styles.cardSous}>🙋 {e.nb_offres} enchères · {e.quartier}</Text>
          </View>
        </View>
      ))}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0E0A08' },
  loading:      { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0E0A08' },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  headerSous:   { fontSize: 11, color: COLORS.light },
  headerLogo:   { fontSize: 24, fontWeight: '800', color: COLORS.or, letterSpacing: 2 },
  notifBtn:     { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(201,168,76,0.1)', justifyContent: 'center', alignItems: 'center' },
  hero:         { margin: 16, backgroundColor: '#1A120E', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: COLORS.bd },
  heroTag:      { backgroundColor: 'rgba(201,168,76,0.14)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginBottom: 8 },
  heroTagTxt:   { fontSize: 10, color: COLORS.or, fontWeight: '700' },
  heroTitre:    { fontSize: 20, fontWeight: '800', color: '#F0E8D8', lineHeight: 26, marginBottom: 6 },
  heroSous:     { fontSize: 12, color: COLORS.light, marginBottom: 14 },
  heroBtn:      { backgroundColor: COLORS.or, borderRadius: 9, paddingVertical: 10, paddingHorizontal: 18, alignSelf: 'flex-start' },
  heroBtnTxt:   { fontSize: 13, fontWeight: '800', color: '#0E0A08' },
  stats:        { flexDirection: 'row', marginHorizontal: 16, gap: 8, marginBottom: 16 },
  stat:         { flex: 1, backgroundColor: '#1E1612', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.bd },
  statN:        { fontSize: 16, fontWeight: '800', color: COLORS.bord },
  statL:        { fontSize: 10, color: COLORS.light, marginTop: 2 },
  secHdr:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  secTitre:     { fontSize: 14, fontWeight: '700', color: '#F0E8D8' },
  voirTout:     { fontSize: 12, color: COLORS.bord, fontWeight: '600' },
  card:         { backgroundColor: '#1E1612', borderRadius: 14, marginHorizontal: 16, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.bd },
  cardImg:      { height: 110, justifyContent: 'center', alignItems: 'center' },
  cardEmoji:    { fontSize: 40 },
  cardBody:     { padding: 12 },
  tagRow:       { flexDirection: 'row', gap: 6, marginBottom: 6 },
  tag:          { backgroundColor: '#FFF8E8', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  tagTxt:       { fontSize: 10, fontWeight: '600', color: '#7A4F00' },
  cardTitre:    { fontSize: 14, fontWeight: '700', color: '#F0E8D8', marginBottom: 3 },
  cardSous:     { fontSize: 11, color: COLORS.light },
  cardFooter:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.bd },
  author:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar:       { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.bord, justifyContent: 'center', alignItems: 'center' },
  avatarTxt:    { fontSize: 10, fontWeight: '700', color: 'white' },
  authorNom:    { fontSize: 12, fontWeight: '600', color: '#F0E8D8' },
  authorNote:   { fontSize: 10, color: COLORS.light },
  btnReserver:  { backgroundColor: COLORS.bord, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  btnReserverTxt:{ fontSize: 12, fontWeight: '700', color: 'white' },
  encCard:      { backgroundColor: '#1E1612', borderRadius: 14, marginHorizontal: 16, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.bd },
  encImg:       { height: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2A1E18' },
  encPrix:      { fontSize: 16, fontWeight: '800', color: COLORS.bord, marginVertical: 4 },
});
