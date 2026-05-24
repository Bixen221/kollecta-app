import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function ParametresScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { deconnexion } = useAuth();
  const [notifDons,     setNotifDons]     = useState(true);
  const [notifEncheres, setNotifEncheres] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);

  const Section = ({ titre, children }) => (
    <View style={{ marginBottom: 16 }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <Text style={{ fontSize: 10, fontWeight: '700', color: theme.txt3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{titre}</Text>
      </View>
      <View style={{ backgroundColor: theme.card, borderRadius: 14, marginHorizontal: 16, borderWidth: 1, borderColor: theme.bd, overflow: 'hidden' }}>
        {children}
      </View>
    </View>
  );

  const ToggleItem = ({ ico, titre, sous, value, onChange }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: theme.bd }}>
      <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: theme.card2, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
        <Text style={{ fontSize: 16 }}>{ico}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: theme.txt }}>{titre}</Text>
        {sous && <Text style={{ fontSize: 11, color: theme.txt2, marginTop: 1 }}>{sous}</Text>}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: theme.bd, true: theme.or }} thumbColor={value ? '#0E0A08' : '#FFFFFF'} />
    </View>
  );

  const LinkItem = ({ ico, titre, sous, onPress, danger }) => (
    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: theme.bd }} onPress={onPress}>
      <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: danger ? '#3A1A1A' : theme.card2, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
        <Text style={{ fontSize: 16 }}>{ico}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: danger ? '#FF6B6B' : theme.txt }}>{titre}</Text>
        {sous && <Text style={{ fontSize: 11, color: theme.txt2, marginTop: 1 }}>{sous}</Text>}
      </View>
      <Text style={{ fontSize: 18, color: theme.txt3 }}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ backgroundColor: theme.hdr, padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: theme.bd }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 13, color: theme.txt2, fontWeight: '600' }}>← Retour</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '800', color: theme.txt }}>⚙️ Paramètres</Text>
      </View>

      <ScrollView style={{ marginTop: 16 }}>
        <Section titre="Apparence">
          <ToggleItem
            ico={isDark ? '🌙' : '☀️'}
            titre={isDark ? 'Mode sombre' : 'Mode clair'}
            sous="Changer l'apparence de l'app"
            value={isDark}
            onChange={toggleTheme}
          />
        </Section>

        <Section titre="Notifications">
          <ToggleItem ico="🎁" titre="Dons" sous="Nouvelles réservations et confirmations" value={notifDons} onChange={setNotifDons} />
          <ToggleItem ico="🔨" titre="Enchères" sous="Nouvelles offres et résultats" value={notifEncheres} onChange={setNotifEncheres} />
          <ToggleItem ico="💬" titre="Messages" sous="Nouvelles conversations" value={notifMessages} onChange={setNotifMessages} />
        </Section>

        <Section titre="Confidentialité">
          <LinkItem ico="👁" titre="Visibilité du profil" sous="Qui peut voir votre profil" onPress={() => {}} />
          <LinkItem ico="🔒" titre="Changer le mot de passe" sous="Modifier votre mot de passe" onPress={() => {}} />
          <LinkItem ico="📱" titre="Numéro WhatsApp" sous="Gérer l'affichage de votre numéro" onPress={() => {}} />
        </Section>

        <Section titre="À propos">
          <LinkItem ico="📋" titre="Conditions d'utilisation" onPress={() => {}} />
          <LinkItem ico="🔐" titre="Politique de confidentialité" onPress={() => {}} />
          <LinkItem ico="ℹ️" titre="Version de l'app" sous="Kollecta v1.0.0" onPress={() => {}} />
        </Section>

        <Section titre="Compte">
          <LinkItem
            ico="🗑️"
            titre="Supprimer mon compte"
            sous="Cette action est irréversible"
            danger
            onPress={() => Alert.alert('Supprimer le compte ?', 'Cette action est irréversible. Toutes vos données seront supprimées.', [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Supprimer', style: 'destructive', onPress: deconnexion },
            ])}
          />
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
