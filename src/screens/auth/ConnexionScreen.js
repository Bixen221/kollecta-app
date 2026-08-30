import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import GoogleAuthButton from './GoogleAuthButton';

export default function ConnexionScreen({ navigation }) {
  const { connexion } = useAuth();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [whatsapp,  setWhatsapp]  = useState('');
  const [password,  setPassword]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [showPass,  setShowPass]  = useState(false);

  const handleConnexion = async () => {
    if (!whatsapp || !password) {
      return Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
    }
    setLoading(true);
    try {
      await connexion(whatsapp, password);
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.logo}>KOLLECTA</Text>
      <Text style={styles.titre}>Bon retour !</Text>
      <Text style={styles.sous}>Connectez-vous pour continuer</Text>

      <View style={styles.inputWrap}>
        <Text style={styles.label}>Numéro WhatsApp</Text>
        <View style={styles.inputRow}>
          <Text style={styles.prefix}>🇸🇳 +221</Text>
          <TextInput
            style={styles.input}
            placeholder="7X XXX XX XX"
            placeholderTextColor={theme.txt3}
            value={whatsapp}
            onChangeText={setWhatsapp}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.inputWrap}>
        <Text style={styles.label}>Mot de passe</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Votre mot de passe"
            placeholderTextColor={theme.txt3}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Text style={{ color: theme.txt3, fontSize: 18 }}>{showPass ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.btnPrimary} onPress={handleConnexion} disabled={loading}>
        {loading
          ? <ActivityIndicator color={theme.bg} />
          : <Text style={styles.btnTxt}>Se connecter →</Text>
        }
      </TouchableOpacity>

      {/* Google Sign-In temporairement masqué — nécessite un build EAS natif
          (incompatible avec le proxy exp:// d'Expo Go). Réactiver une fois
          les builds EAS Android/iOS disponibles. */}
      {false && (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: theme.bd }} />
            <Text style={{ color: theme.txt3, fontSize: 12, marginHorizontal: 10 }}>ou</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: theme.bd }} />
          </View>
          <GoogleAuthButton />
        </>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Inscription')} style={{ marginTop: 16 }}>
        <Text style={styles.lien}>Pas de compte ? <Text style={{ color: theme.or }}>S'inscrire</Text></Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container:  { flex: 1, backgroundColor: theme.bg, padding: 24, justifyContent: 'center' },
  logo:       { fontSize: 28, fontWeight: '800', color: '#C9A84C', textAlign: 'center', marginBottom: 24, letterSpacing: 3 },
  titre:      { fontSize: 22, fontWeight: '800', color: theme.txt, marginBottom: 4 },
  sous:       { fontSize: 13, color: theme.txt3, marginBottom: 28 },
  inputWrap:  { marginBottom: 16 },
  label:      { fontSize: 11, fontWeight: '700', color: theme.txt3, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  inputRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.inp, borderWidth: 1, borderColor: theme.bd, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 12 },
  prefix:     { fontSize: 13, color: theme.txt, marginRight: 8 },
  input:      { fontSize: 14, color: theme.txt, flex: 1 },
  btnPrimary: { backgroundColor: '#8B1A2A', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  btnTxt:     { fontSize: 15, fontWeight: '700', color: 'white' },
  lien:       { textAlign: 'center', fontSize: 13, color: theme.txt3 },
});
