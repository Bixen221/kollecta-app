import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function ProfilScreen({ navigation }) {
  const { user, deconnexion } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  const handleDeconnexion = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: deconnexion },
    ]);
  };

  const MenuItem = ({ ico, titre, sous, onPress, right }) => (
    <TouchableOpacity style={[styles.mi, { backgroundColor: theme.card, borderBottomColor: theme.bd }]} onPress={onPress}>
      <View style={[styles.mic, { backgroundColor: theme.card2 }]}>
        <Text style={{ fontSize: 16 }}>{ico}</Text>
      </View>
      <View style={styles.mtx}>
        <Text style={[styles.mt, { color: theme.txt }]}>{titre}</Text>
        {sous && <Text style={[styles.ms, { color: theme.txt2 }]}>{sous}</Text>}
      </View>
      {right || <Text style={[styles.marr, { color: theme.txt3 }]}>›</Text>}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* HEADER */}
      <View style={[styles.ph, { backgroundColor: theme.hdr, borderBottomColor: theme.bd }]}>
        <Text style={[styles.logo, { color: theme.or }]}>KOLLECTA</Text>
        <View style={[styles.pav, { backgroundColor: theme.card2, borderColor: theme.or }]}>
          <Text style={[styles.pavTxt, { color: theme.or }]}>
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </Text>
        </View>
        <Text style={[styles.pn, { color: theme.or }]}>{user?.prenom} {user?.nom}</Text>
        <Text style={[styles.pl, { color: theme.txt2 }]}>📍 {user?.quartier || 'Dakar'}</Text>
        <View style={[styles.pbdg, { backgroundColor: theme.orl, borderColor: theme.bd }]}>
          <Text style={[styles.pbdgTxt, { color: theme.or }]}>
            {user?.verifie ? '✅ Compte vérifié' : '⏳ Non vérifié'} · Membre Kollecta
          </Text>
        </View>
      </View>

      {/* STATS */}
      <View style={[styles.pst, { backgroundColor: theme.bd, marginHorizontal: 16, marginVertical: 14, borderRadius: 14, overflow: 'hidden' }]}>
        {[
          [user?.nb_dons || 0, 'Dons faits'],
          [user?.note_moyenne || '0.0', 'Note ⭐'],
          [0, 'Enchères'],
        ].map(([n, l]) => (
          <View key={l} style={[styles.psc, { backgroundColor: theme.card }]}>
            <Text style={[styles.psn, { color: theme.bord }]}>{n}</Text>
            <Text style={[styles.psl, { color: theme.txt2 }]}>{l}</Text>
          </View>
        ))}
      </View>

      {/* ACTIVITE */}
      <View style={[styles.secLbl, { backgroundColor: theme.bg }]}>
        <Text style={[styles.secLblTxt, { color: theme.txt3 }]}>MON ACTIVITÉ</Text>
      </View>
      <MenuItem ico="🎁" titre="Mes dons publiés"   sous="Gérer mes annonces" />
      <MenuItem ico="📋" titre="Mes réservations"   sous="Suivre mes demandes" />
      <MenuItem ico="🔨" titre="Mes enchères"       sous="Voir mes enchères" />
      <MenuItem ico="💬" titre="Messages"           sous="Conversations actives" />

      {/* COMPTE */}
      <View style={[styles.secLbl, { backgroundColor: theme.bg, marginTop: 8 }]}>
        <Text style={[styles.secLblTxt, { color: theme.txt3 }]}>MON COMPTE</Text>
      </View>
      <MenuItem ico="✏️" titre="Modifier mon profil" />

      {/* TOGGLE THEME */}
      <View style={[styles.mi, { backgroundColor: theme.card, borderBottomColor: theme.bd }]}>
        <View style={[styles.mic, { backgroundColor: theme.card2 }]}>
          <Text style={{ fontSize: 16 }}>{isDark ? '🌙' : '☀️'}</Text>
        </View>
        <View style={styles.mtx}>
          <Text style={[styles.mt, { color: theme.txt }]}>{isDark ? 'Mode sombre' : 'Mode clair'}</Text>
          <Text style={[styles.ms, { color: theme.txt2 }]}>Changer l'apparence</Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: '#E0D4C0', true: theme.or }}
          thumbColor={isDark ? '#1A1410' : '#FFFFFF'}
        />
      </View>

      <MenuItem ico="⚙️" titre="Paramètres" sous="Notifications, confidentialité" />

      {/* DECONNEXION */}
      <View style={{ padding: 16, marginTop: 8 }}>
        <TouchableOpacity
          style={[styles.decoBtnOuter, { backgroundColor: theme.card, borderColor: '#FFCDD2' }]}
          onPress={handleDeconnexion}
        >
          <Text style={styles.decoTxt}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  ph:           { padding: 24, paddingTop: 50, alignItems: 'center', borderBottomWidth: 1 },
  logo:         { fontSize: 18, fontWeight: '800', letterSpacing: 2, marginBottom: 16 },
  pav:          { width: 68, height: 68, borderRadius: 34, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  pavTxt:       { fontSize: 24, fontWeight: '800' },
  pn:           { fontSize: 18, fontWeight: '800' },
  pl:           { fontSize: 12, marginTop: 3 },
  pbdg:         { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8, borderWidth: 1 },
  pbdgTxt:      { fontSize: 10, fontWeight: '600' },
  pst:          { display: 'flex', flexDirection: 'row', gap: 1 },
  psc:          { flex: 1, padding: 12, alignItems: 'center' },
  psn:          { fontSize: 17, fontWeight: '800' },
  psl:          { fontSize: 10, marginTop: 2 },
  secLbl:       { paddingHorizontal: 16, paddingVertical: 8 },
  secLblTxt:    { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  mi:           { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, borderBottomWidth: 1 },
  mic:          { width: 34, height: 34, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  mtx:          { flex: 1 },
  mt:           { fontSize: 14, fontWeight: '600' },
  ms:           { fontSize: 11, marginTop: 1 },
  marr:         { fontSize: 18 },
  decoBtnOuter: { borderWidth: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  decoTxt:      { fontSize: 14, fontWeight: '700', color: '#CC2222' },
});
