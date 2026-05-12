import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const COLORS = {
  or: '#C9A84C', bord: '#8B1A2A', dark: '#0E0A08',
  light: '#B0A090', bd: 'rgba(201,168,76,0.2)',
};

export default function InscriptionScreen({ navigation }) {
  const { inscription } = useAuth();
  const [form, setForm] = useState({
    nom: '', prenom: '', whatsapp: '', password: '', quartier: '', ville: 'Dakar',
  });
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleInscription = async () => {
    if (!form.nom || !form.prenom || !form.whatsapp || !form.password) {
      return Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
    }
    if (form.password.length < 8) {
      return Alert.alert('Erreur', 'Le mot de passe doit avoir au moins 8 caractères.');
    }
    setLoading(true);
    try {
      await inscription(form);
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.dark }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>KOLLECTA</Text>
        <Text style={styles.titre}>Créer un compte</Text>
        <Text style={styles.sous}>Rejoignez la communauté Kollecta</Text>

        <View style={styles.row}>
          <View style={[styles.inputWrap, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Prénom *</Text>
            <TextInput style={styles.input} placeholder="Aminata" placeholderTextColor={COLORS.light} value={form.prenom} onChangeText={v => update('prenom', v)} />
          </View>
          <View style={[styles.inputWrap, { flex: 1 }]}>
            <Text style={styles.label}>Nom *</Text>
            <TextInput style={styles.input} placeholder="Mbaye" placeholderTextColor={COLORS.light} value={form.nom} onChangeText={v => update('nom', v)} />
          </View>
        </View>

        <View style={styles.inputWrap}>
          <Text style={styles.label}>Numéro WhatsApp *</Text>
          <View style={styles.inputRow}>
            <Text style={styles.prefix}>🇸🇳 +221</Text>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="7X XXX XX XX" placeholderTextColor={COLORS.light} value={form.whatsapp} onChangeText={v => update('whatsapp', v)} keyboardType="phone-pad" />
          </View>
        </View>

        <View style={styles.inputWrap}>
          <Text style={styles.label}>Quartier</Text>
          <TextInput style={styles.input} placeholder="Ex: Plateau, Mermoz..." placeholderTextColor={COLORS.light} value={form.quartier} onChangeText={v => update('quartier', v)} />
        </View>

        <View style={styles.inputWrap}>
          <Text style={styles.label}>Mot de passe *</Text>
          <View style={styles.inputRow}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="8 caractères minimum" placeholderTextColor={COLORS.light} value={form.password} onChangeText={v => update('password', v)} secureTextEntry={!showPass} />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Text style={{ color: COLORS.light, fontSize: 18 }}>{showPass ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleInscription} disabled={loading}>
          {loading
            ? <ActivityIndicator color="white" />
            : <Text style={styles.btnTxt}>Créer mon compte →</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Connexion')}>
          <Text style={styles.lien}>Déjà membre ? <Text style={{ color: COLORS.or }}>Se connecter</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { padding: 24, paddingTop: 60 },
  logo:       { fontSize: 26, fontWeight: '800', color: '#C9A84C', textAlign: 'center', marginBottom: 20, letterSpacing: 3 },
  titre:      { fontSize: 22, fontWeight: '800', color: '#F0E8D8', marginBottom: 4 },
  sous:       { fontSize: 13, color: COLORS.light, marginBottom: 24 },
  row:        { flexDirection: 'row' },
  inputWrap:  { marginBottom: 14 },
  label:      { fontSize: 11, fontWeight: '700', color: COLORS.light, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  inputRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#160E0A', borderWidth: 1, borderColor: COLORS.bd, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 12 },
  prefix:     { fontSize: 13, color: '#F0E8D8', marginRight: 8 },
  input:      { fontSize: 14, color: '#F0E8D8', backgroundColor: '#160E0A', borderWidth: 1, borderColor: COLORS.bd, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 12 },
  btnPrimary: { backgroundColor: COLORS.bord, borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  btnTxt:     { fontSize: 15, fontWeight: '700', color: 'white' },
  lien:       { textAlign: 'center', fontSize: 13, color: COLORS.light },
});
