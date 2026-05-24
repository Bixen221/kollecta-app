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

  const MenuItem = ({ ico, titre, sous, onPress, right, badge }) => (
    <TouchableOpacity
      style={{ flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.bd }}
      onPress={onPress}
    >
      <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: theme.card2, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
        <Text style={{ fontSize: 16 }}>{ico}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: theme.txt }}>{titre}</Text>
        {sous && <Text style={{ fontSize: 11, color: theme.txt2, marginTop: 1 }}>{sous}</Text>}
      </View>
      {badge && (
        <View style={{ backgroundColor: theme.bord, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, marginRight: 8 }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: 'white' }}>{badge}</Text>
        </View>
      )}
      {right || <Text style={{ fontSize: 18, color: theme.txt3 }}>›</Text>}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* HEADER */}
      <View style={{ backgroundColor: theme.hdr, padding: 24, paddingTop: 50, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.bd }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: theme.or, letterSpacing: 2, marginBottom: 16 }}>KOLLECTA</Text>
        <View style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: theme.card2, borderWidth: 2, borderColor: theme.or, justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: theme.or }}>{user?.prenom?.[0]}{user?.nom?.[0]}</Text>
        </View>
        <Text style={{ fontSize: 18, fontWeight: '800', color: theme.or }}>{user?.prenom} {user?.nom}</Text>
        <Text style={{ fontSize: 12, color: theme.txt2, marginTop: 3 }}>📍 {user?.quartier || 'Dakar'}</Text>
        <View style={{ backgroundColor: theme.orl, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8, borderWidth: 1, borderColor: theme.bd }}>
          <Text style={{ fontSize: 10, fontWeight: '600', color: theme.or }}>
            {user?.verifie ? '✅ Compte vérifié' : '⏳ Non vérifié'} · Membre Kollecta
          </Text>
        </View>
      </View>

      {/* STATS */}
      <View style={{ flexDirection: 'row', margin: 16, backgroundColor: theme.bd, borderRadius: 14, overflow: 'hidden', gap: 1 }}>
        {[
          [user?.nb_dons || 0,        'Dons faits'],
          [user?.note_moyenne || '0', 'Note ⭐'],
          [0,                          'Enchères'],
        ].map(([n, l]) => (
          <View key={l} style={{ flex: 1, padding: 12, alignItems: 'center', backgroundColor: theme.card }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: theme.bord }}>{n}</Text>
            <Text style={{ fontSize: 10, color: theme.txt2, marginTop: 2 }}>{l}</Text>
          </View>
        ))}
      </View>

      {/* ACTIVITE */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: theme.bg }}>
        <Text style={{ fontSize: 10, fontWeight: '700', color: theme.txt3, letterSpacing: 0.5 }}>MON ACTIVITÉ</Text>
      </View>
      <MenuItem
        ico="🎁"
        titre="Mes dons publiés"
        sous="Gérer mes annonces actives"
        onPress={() => navigation.navigate('MesDons')}
      />
      <MenuItem
        ico="📋"
        titre="Mes réservations"
        sous="Suivre mes demandes de dons"
        onPress={() => navigation.navigate('MesReservations')}
      />
      <MenuItem
        ico="🔨"
        titre="Mes enchères"
        sous="Voir mes enchères en cours"
        onPress={() => {}}
      />
      <MenuItem
        ico="🔔"
        titre="Notifications"
        sous="Vos alertes et mises à jour"
        onPress={() => navigation.navigate('Notifications')}
      />
      <MenuItem ico="💬" titre="Messages" sous="Conversations actives" onPress={() => navigation.navigate('Messages')} />

      {/* COMPTE */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: theme.bg, marginTop: 8 }}>
        <Text style={{ fontSize: 10, fontWeight: '700', color: theme.txt3, letterSpacing: 0.5 }}>MON COMPTE</Text>
      </View>
      <MenuItem ico="✏️" titre="Modifier mon profil" onPress={() => navigation.navigate('ModifierProfil')} />

      {/* TOGGLE THEME */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.bd }}>
        <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: theme.card2, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
          <Text style={{ fontSize: 16 }}>{isDark ? '🌙' : '☀️'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.txt }}>{isDark ? 'Mode sombre' : 'Mode clair'}</Text>
          <Text style={{ fontSize: 11, color: theme.txt2, marginTop: 1 }}>Changer l'apparence</Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: '#E0D4C0', true: theme.or }}
          thumbColor={isDark ? '#1A1410' : '#FFFFFF'}
        />
      </View>

      <MenuItem ico="⚙️" titre="Paramètres" sous="Notifications, confidentialité" onPress={() => navigation.navigate('Parametres')} />

      {/* DECONNEXION */}
      <View style={{ padding: 16, marginTop: 8 }}>
        <TouchableOpacity
          style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: '#FFCDD2', borderRadius: 12, padding: 14, alignItems: 'center' }}
          onPress={handleDeconnexion}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#CC2222' }}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}
