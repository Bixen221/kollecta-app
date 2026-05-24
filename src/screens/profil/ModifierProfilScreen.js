import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function ModifierProfilScreen({ navigation }) {
  const { user, connexion } = useAuth();
  const { theme } = useTheme();
  const [form, setForm] = useState({
    nom:      user?.nom      || '',
    prenom:   user?.prenom   || '',
    whatsapp: user?.whatsapp || '',
    quartier: user?.quartier || '',
    ville:    user?.ville    || 'Dakar',
  });
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSauvegarder = async () => {
    setLoading(true);
    try {
      await api.put('/auth/profil', form);
      Alert.alert('✅ Profil mis à jour !', 'Vos informations ont été sauvegardées.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView>
        <View style={{ backgroundColor: theme.hdr, padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: theme.bd }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 13, color: theme.txt2, fontWeight: '600' }}>← Retour</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontWeight: '800', color: theme.txt }}>✏️ Modifier mon profil</Text>
        </View>

        <View style={{ padding: 16 }}>
          {/* AVATAR */}
          <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: theme.card2, borderWidth: 2, borderColor: theme.or, justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: 28, fontWeight: '800', color: theme.or }}>{form.prenom?.[0]}{form.nom?.[0]}</Text>
            </View>
          </View>

          <View style={{ backgroundColor: theme.card, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: theme.bd }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.txt3, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Informations personnelles</Text>

            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.txt2, marginBottom: 6 }}>PRÉNOM</Text>
            <TextInput style={{ backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.bd, borderRadius: 10, padding: 12, fontSize: 14, color: theme.txt, marginBottom: 12 }} value={form.prenom} onChangeText={v => update('prenom', v)} placeholder="Votre prénom" placeholderTextColor={theme.txt3} />

            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.txt2, marginBottom: 6 }}>NOM</Text>
            <TextInput style={{ backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.bd, borderRadius: 10, padding: 12, fontSize: 14, color: theme.txt, marginBottom: 12 }} value={form.nom} onChangeText={v => update('nom', v)} placeholder="Votre nom" placeholderTextColor={theme.txt3} />

            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.txt2, marginBottom: 6 }}>WHATSAPP</Text>
            <TextInput style={{ backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.bd, borderRadius: 10, padding: 12, fontSize: 14, color: theme.txt, marginBottom: 12 }} value={form.whatsapp} onChangeText={v => update('whatsapp', v)} placeholder="+221XXXXXXXXX" placeholderTextColor={theme.txt3} keyboardType="phone-pad" />
          </View>

          <View style={{ backgroundColor: theme.card, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: theme.bd }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.txt3, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Localisation</Text>

            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.txt2, marginBottom: 6 }}>QUARTIER</Text>
            <TextInput style={{ backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.bd, borderRadius: 10, padding: 12, fontSize: 14, color: theme.txt, marginBottom: 12 }} value={form.quartier} onChangeText={v => update('quartier', v)} placeholder="Ex: Plateau, Mermoz..." placeholderTextColor={theme.txt3} />

            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.txt2, marginBottom: 6 }}>VILLE</Text>
            <TextInput style={{ backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.bd, borderRadius: 10, padding: 12, fontSize: 14, color: theme.txt }} value={form.ville} onChangeText={v => update('ville', v)} placeholder="Dakar" placeholderTextColor={theme.txt3} />
          </View>

          <TouchableOpacity
            style={{ backgroundColor: theme.or, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8, opacity: loading ? 0.7 : 1 }}
            onPress={handleSauvegarder}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={theme.dark} /> : <Text style={{ fontSize: 16, fontWeight: '800', color: '#0E0A08' }}>Sauvegarder ✓</Text>}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
