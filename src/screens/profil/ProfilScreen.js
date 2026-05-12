import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const COLORS = {
  or: '#C9A84C', bord: '#8B1A2A', dark: '#0E0A08', dark2: '#1A120E',
  light: '#B0A090', bd: 'rgba(201,168,76,0.2)', re: '#CC2222',
};

export default function ProfilScreen() {
  const { user, deconnexion } = useAuth();

  const handleDeconnexion = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnecter', style: 'destructive', onPress: deconnexion },
      ]
    );
  };

  const MenuItem = ({ ico, titre, sous, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIco}><Text style={{ fontSize: 18 }}>{ico}</Text></View>
      <View style={styles.menuTxt}>
        <Text style={styles.menuTitre}>{titre}</Text>
        {sous && <Text style={styles.menuSous}>{sous}</Text>}
      </View>
      <Text style={styles.menuArr}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* HEADER PROFIL */}
      <View style={styles.header}>
        <Text style={styles.logo}>KOLLECTA</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </Text>
        </View>
        <Text style={styles.nom}>{user?.prenom} {user?.nom}</Text>
        <Text style={styles.loc}>📍 {user?.quartier || 'Dakar'}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeTxt}>
            {user?.verifie ? '✅ Compte vérifié' : '⏳ Non vérifié'} · Membre Kollecta
          </Text>
        </View>
      </View>

      {/* STATS */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statN}>{user?.nb_dons || 0}</Text>
          <Text style={styles.statL}>Dons faits</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statN}>{user?.note_moyenne || '0.0'}</Text>
          <Text style={styles.statL}>Note ⭐</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statN}>0</Text>
          <Text style={styles.statL}>Enchères</Text>
        </View>
      </View>

      {/* MENU ACTIVITE */}
      <View style={styles.secLbl}><Text style={styles.secLblTxt}>MON ACTIVITÉ</Text></View>
      <MenuItem ico="🎁" titre="Mes dons publiés" sous="Gérer mes annonces" />
      <MenuItem ico="📋" titre="Mes réservations" sous="Suivre mes demandes" />
      <MenuItem ico="🔨" titre="Mes enchères" sous="Voir mes enchères" />
      <MenuItem ico="💬" titre="Messages" sous="4 conversations actives" />

      {/* MENU COMPTE */}
      <View style={styles.secLbl}><Text style={styles.secLblTxt}>MON COMPTE</Text></View>
      <MenuItem ico="✏️" titre="Modifier mon profil" />
      <MenuItem ico="🔔" titre="Notifications" />
      <MenuItem ico="⚙️" titre="Paramètres" />

      {/* DECONNEXION */}
      <View style={styles.decoWrap}>
        <TouchableOpacity style={styles.decoBtnOuter} onPress={handleDeconnexion}>
          <Text style={styles.decoTxt}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0E0A08' },
  header:       { backgroundColor: '#1A120E', padding: 24, paddingTop: 50, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.bd },
  logo:         { fontSize: 18, fontWeight: '800', color: COLORS.or, letterSpacing: 2, marginBottom: 16 },
  avatar:       { width: 68, height: 68, borderRadius: 34, backgroundColor: '#2A1E18', borderWidth: 2, borderColor: COLORS.or, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarTxt:    { fontSize: 24, fontWeight: '800', color: COLORS.or },
  nom:          { fontSize: 18, fontWeight: '800', color: COLORS.or },
  loc:          { fontSize: 12, color: COLORS.light, marginTop: 4 },
  badge:        { backgroundColor: 'rgba(201,168,76,0.13)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8, borderWidth: 1, borderColor: COLORS.bd },
  badgeTxt:     { fontSize: 10, color: COLORS.or, fontWeight: '600' },
  stats:        { flexDirection: 'row', margin: 16, backgroundColor: '#1E1612', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.bd },
  stat:         { flex: 1, padding: 14, alignItems: 'center' },
  statN:        { fontSize: 18, fontWeight: '800', color: COLORS.bord },
  statL:        { fontSize: 10, color: COLORS.light, marginTop: 2 },
  secLbl:       { paddingHorizontal: 16, paddingVertical: 8, marginTop: 4 },
  secLblTxt:    { fontSize: 10, fontWeight: '700', color: COLORS.light, letterSpacing: 0.5 },
  menuItem:     { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, backgroundColor: '#1E1612', borderBottomWidth: 1, borderBottomColor: COLORS.bd },
  menuIco:      { width: 34, height: 34, borderRadius: 9, backgroundColor: '#2A1E18', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuTxt:      { flex: 1 },
  menuTitre:    { fontSize: 14, fontWeight: '600', color: '#F0E8D8' },
  menuSous:     { fontSize: 11, color: COLORS.light, marginTop: 1 },
  menuArr:      { fontSize: 18, color: COLORS.light },
  decoWrap:     { padding: 16, marginTop: 8 },
  decoBtnOuter: { backgroundColor: '#1E1612', borderWidth: 1, borderColor: '#FFCDD2', borderRadius: 12, padding: 14, alignItems: 'center' },
  decoTxt:      { fontSize: 14, fontWeight: '700', color: COLORS.re },
});
