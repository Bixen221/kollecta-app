import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function InscriptionScreen({ navigation }) {
  const { inscription } = useAuth();
  const { theme } = useTheme();
  const styles = getStyles(theme);
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
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>KOLLECTA</Text>
        <Text style={styles.titre}>Créer un compte</Text>
        <Text style={styles.sous}>Rejoignez la communauté Kollecta</Text>

        <View style={styles.row}>
          <View style={[styles.inputWrap, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Prénom *</Text>
            <TextInput style={styles.input} placeholder="Aminata" placeholderTextColor={theme.txt3} value={form.prenom} onChangeText={v => update('prenom', v)} />
          </View>
          <View style={[styles.inputWrap, { flex: 1 }]}>
            <Text style={styles.label}>Nom *</Text>
            <TextInput style={styles.input} placeholder="Mbaye" placeholderTextColor={theme.txt3} value={form.nom} onChangeText={v => update('nom', v)} />
          </View>
        </View>

        <View style={styles.inputWrap}>
          <Text style={styles.label}>Numéro WhatsApp *</Text>
          <View style={styles.inputRow}>
            <Text style={styles.prefix}>🇸🇳 +221</Text>
            <TextInput style={[styles.input, { flex: 1, borderWidth: 0, paddingHorizontal: 0 }]} placeholder="7X XXX XX XX" placeholderTextColor={theme.txt3} value={form.whatsapp} onChangeText={v => update('whatsapp', v)} keyboardType="phone-pad" />
          </View>
        </View>

        <View style={styles.inputWrap}>
          <Text style={styles.label}>Quartier</Text>
          <TextInput style={styles.input} placeholder="Ex: Plateau, Mermoz..." placeholderTextColor={theme.txt3} value={form.quartier} onChangeText={v => update('quartier', v)} />
        </View>

        <View style={styles.inputWrap}>
          <Text style={styles.label}>Mot de passe *</Text>
          <View style={styles.inputRow}>
            <TextInput style={[styles.input, { flex: 1, borderWidth: 0, paddingHorizontal: 0 }]} placeholder="8 caractères minimum" placeholderTextColor={theme.txt3} value={form.password} onChangeText={v => update('password', v)} secureTextEntry={!showPass} />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁'}</Text>
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
          <Text style={styles.lien}>Déjà membre ? <Text style={{ color: theme.or }}>Se connecter</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container:  { padding: 24, paddingTop: 60 },
  logo:       { fontSize: 26, fontWeight: '800', color: theme.or, textAlign: 'center', marginBottom: 20, letterSpacing: 3 },
  titre:      { fontSize: 22, fontWeight: '800', color: theme.txt, marginBottom: 4 },
  sous:       { fontSize: 13, color: theme.txt2, marginBottom: 24 },
  row:        { flexDirection: 'row' },
  inputWrap:  { marginBottom: 14 },
  label:      { fontSize: 11, fontWeight: '700', color: theme.txt2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  inputRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.inp, borderWidth: 1, borderColor: theme.bd, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 12 },
  prefix:     { fontSize: 13, color: theme.txt, marginRight: 8 },
  input:      { fontSize: 14, color: theme.txt, backgroundColor: theme.inp, borderWidth: 1, borderColor: theme.bd, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 12 },
  btnPrimary: { backgroundColor: theme.bord, borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  btnTxt:     { fontSize: 15, fontWeight: '700', color: 'white' },
  lien:       { textAlign: 'center', fontSize: 13, color: theme.txt2 },
});
