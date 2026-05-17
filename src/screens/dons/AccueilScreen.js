import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useReservations } from '../../context/ReservationsContext';

export default function AccueilScreen({ navigation }) {
  const { user }                          = useAuth();
  const { theme }                         = useTheme();
  const { estReserve }                    = useReservations();
  const [dons,       setDons]             = useState([]);
  const [encheres,   setEncheres]         = useState([]);
  const [loading,    setLoading]          = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [recherche,  setRecherche]        = useState('');

  const charger = async () => {
    try {
      const [resDons, resEncheres] = await Promise.all([
        api.get('/dons?limite=10'),
        api.get('/encheres?statut=en_cours&limite=10'),
      ]);
      // Filtrer les publications du proprio
      const tousLesDons = (resDons.dons || []).filter(d => d.proprietaire_id !== user?.id);
      const toutesLesEncheres = (resEncheres.encheres || []).filter(e => e.vendeur_id !== user?.id);
      setDons(tousLesDons);
      setEncheres(toutesLesEncheres);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { charger(); }, []);

  const donsFiltres     = dons.filter(d => d.titre?.toLowerCase().includes(recherche.toLowerCase()) || d.quartier?.toLowerCase().includes(recherche.toLowerCase()));
  const encheresFiltres = encheres.filter(e => e.titre?.toLowerCase().includes(recherche.toLowerCase()) || e.quartier?.toLowerCase().includes(recherche.toLowerCase()));

  const s = makeStyles(theme);

  if (loading) return (
    <View style={[s.loading, { backgroundColor: theme.bg }]}>
      <ActivityIndicator size="large" color={theme.or} />
    </View>
  );

  return (
    <ScrollView
      style={[s.container, { backgroundColor: theme.bg }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); charger(); }} tintColor={theme.or} />}
    >
      {/* HEADER */}
      <View style={[s.header, { backgroundColor: theme.hdr }]}>
        <View style={s.hdrRow}>
          <View>
            <Text style={[s.hdrSous, { color: theme.txt2 }]}>📍 Dakar, Sénégal</Text>
            <Text style={[s.logo, { color: theme.or }]}>KOLLECTA</Text>
          </View>
          <TouchableOpacity style={[s.notifBtn, { backgroundColor: theme.orl }]}
onPress={() => navigation.navigate('Profil', { screen: 'Notifications' })}>
  <Text style={{ fontSize: 18 }}>🔔</Text>
</TouchableOpacity>
        </View>

        {/* BARRE DE RECHERCHE */}
        <View style={[s.srch, { backgroundColor: theme.card2, borderColor: theme.bd }]}>
          <Text style={{ fontSize: 14, color: theme.txt3 }}>🔍</Text>
          <TextInput
            style={[s.srchInput, { color: theme.txt }]}
            placeholder="Don, enchère, quartier..."
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

      {/* HERO */}
      {!recherche && (
        <View style={[s.hero, { backgroundColor: theme.card2, borderColor: theme.bd }]}>
          <View style={[s.heroTag, { backgroundColor: theme.orl }]}>
            <Text style={[s.heroTagTxt, { color: theme.or }]}>✦ Ensemble on est plus forts</Text>
          </View>
          <Text style={[s.heroTitre, { color: theme.txt }]}>Donnez, recevez,{'\n'}changez des vies</Text>
          <Text style={[s.heroSous, { color: theme.txt2 }]}>12 000+ membres actifs au Sénégal</Text>
        </View>
      )}

      {/* STATS */}
      {!recherche && (
        <View style={s.stats}>
          {[['12k+', 'Membres'], ['3 400', 'Dons actifs'], ['847', 'Enchères']].map(([n, l]) => (
            <View key={l} style={[s.stat, { backgroundColor: theme.card, borderColor: theme.bd }]}>
              <Text style={[s.statN, { color: theme.bord }]}>{n}</Text>
              <Text style={[s.statL, { color: theme.txt2 }]}>{l}</Text>
            </View>
          ))}
        </View>
      )}

      {/* DONS */}
      <View style={s.secHdr}>
        <Text style={[s.secTitre, { color: theme.txt }]}>🎁 Dons récents</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Dons')}>
          <Text style={[s.voirTout, { color: theme.bord, fontWeight: '800' }]}>Voir tout →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hScroll}>
        {donsFiltres.length === 0
          ? <Text style={[s.vide, { color: theme.txt2 }]}>Aucun don disponible</Text>
          : donsFiltres.map(don => {
            const reserve = estReserve(don.id);
            return (
              <TouchableOpacity
                key={don.id}
                style={[s.card, { backgroundColor: theme.card, borderColor: reserve ? theme.gr : theme.bd }]}
                onPress={() => navigation.navigate('DetailDon', { donId: don.id })}
              >
                <View style={[s.cardImg, { backgroundColor: don.type === 'nourriture' ? '#FFF8E8' : '#EAF5EE' }]}>
                  <Text style={{ fontSize: 36 }}>{don.type === 'nourriture' ? '🍱' : '📦'}</Text>
                  {reserve && (
                    <View style={s.reserveTag}><Text style={s.reserveTagTxt}>✓ Réservé</Text></View>
                  )}
                  {don.urgent && (
                    <View style={s.urgentTag}><Text style={s.urgentTagTxt}>🚨</Text></View>
                  )}
                </View>
                <View style={s.cardBody}>
                  <Text style={[s.cardTitre, { color: theme.txt }]} numberOfLines={1}>{don.titre}</Text>
                  <Text style={[s.cardSous, { color: theme.txt2 }]}>{don.quartier}</Text>
                  <TouchableOpacity
                    style={[s.btnReserver, { backgroundColor: reserve ? theme.gr : theme.bord }]}
                    onPress={() => navigation.navigate('DetailDon', { donId: don.id })}
                  >
                    <Text style={s.btnReserverTxt}>{reserve ? '✓ Réservé' : 'Réserver'}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        }
      </ScrollView>

      {/* ENCHERES */}
      <View style={[s.secHdr, { marginTop: 8 }]}>
        <Text style={[s.secTitre, { color: theme.txt }]}>🔨 Enchères en cours</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Enchères')}>
          <Text style={[s.voirTout, { color: theme.bord, fontWeight: '800' }]}>Voir tout →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hScroll}>
        {encheresFiltres.length === 0
          ? <Text style={[s.vide, { color: theme.txt2 }]}>Aucune enchère en cours</Text>
          : encheresFiltres.map(e => (
            <TouchableOpacity
              key={e.id}
              style={[s.card, { backgroundColor: theme.card, borderColor: theme.bd }]}
              onPress={() => navigation.navigate('DetailEnchere', { enchereId: e.id })}
            >
              <View style={[s.cardImg, { backgroundColor: '#2A1E18' }]}>
                <Text style={{ fontSize: 36 }}>📦</Text>
                <View style={[s.liveBadge, { backgroundColor: theme.bord }]}>
                  <Text style={s.liveBadgeTxt}>🔴 DIRECT</Text>
                </View>
              </View>
              <View style={s.cardBody}>
                <Text style={[s.cardTitre, { color: theme.txt }]} numberOfLines={1}>{e.titre}</Text>
                <Text style={[s.cardPrix, { color: theme.bord }]}>{e.offre_actuelle?.toLocaleString()} FCFA</Text>
                <Text style={[s.cardSous, { color: theme.txt2 }]}>🙋 {e.nb_offres} enchères</Text>
              </View>
            </TouchableOpacity>
          ))
        }
      </ScrollView>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container:     { flex: 1 },
  loading:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:        { padding: 20, paddingTop: 50, paddingBottom: 14 },
  hdrRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  logo:          { fontSize: 22, fontWeight: '800', letterSpacing: 2 },
  hdrSous:       { fontSize: 11, marginBottom: 2 },
  notifBtn:      { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  srch:          { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 11, padding: 10, borderWidth: 1 },
  srchInput:     { flex: 1, fontSize: 13, fontFamily: 'System' },
  hero:          { margin: 16, borderRadius: 16, padding: 16, borderWidth: 1 },
  heroTag:       { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginBottom: 8 },
  heroTagTxt:    { fontSize: 10, fontWeight: '700' },
  heroTitre:     { fontSize: 20, fontWeight: '800', lineHeight: 26, marginBottom: 6 },
  heroSous:      { fontSize: 12 },
  stats:         { flexDirection: 'row', marginHorizontal: 16, gap: 8, marginBottom: 16 },
  stat:          { flex: 1, borderRadius: 11, padding: 10, alignItems: 'center', borderWidth: 1 },
  statN:         { fontSize: 15, fontWeight: '800' },
  statL:         { fontSize: 10, marginTop: 1 },
  secHdr:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  secTitre:      { fontSize: 15, fontWeight: '700' },
  voirTout:      { fontSize: 13 },
  hScroll:       { paddingLeft: 16, marginBottom: 8 },
  vide:          { fontSize: 13, paddingVertical: 20, paddingRight: 16 },
  card:          { width: 160, borderRadius: 14, marginRight: 10, overflow: 'hidden', borderWidth: 1 },
  cardImg:       { height: 100, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  reserveTag:    { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(45,122,79,0.9)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
  reserveTagTxt: { color: 'white', fontSize: 9, fontWeight: '700' },
  urgentTag:     { position: 'absolute', top: 6, left: 6 },
  urgentTagTxt:  { fontSize: 14 },
  liveBadge:     { position: 'absolute', top: 6, left: 6, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
  liveBadgeTxt:  { color: 'white', fontSize: 9, fontWeight: '700' },
  cardBody:      { padding: 10 },
  cardTitre:     { fontSize: 12, fontWeight: '700', marginBottom: 3 },
  cardSous:      { fontSize: 10 },
  cardPrix:      { fontSize: 13, fontWeight: '800', marginBottom: 2 },
  btnReserver:   { borderRadius: 8, paddingVertical: 6, alignItems: 'center', marginTop: 8 },
  btnReserverTxt:{ fontSize: 11, fontWeight: '700', color: 'white' },
});
