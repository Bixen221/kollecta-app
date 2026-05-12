import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const COLORS = {
  or: '#C9A84C', bord: '#8B1A2A', dark: '#0E0A08', dark2: '#1A120E',
  light: '#B0A090', card: '#1E1612', bd: 'rgba(201,168,76,0.2)',
};

export default function ConnexionScreen({ navigation }) {
  const { connexion } = useAuth();
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
            placeholderTextColor={COLORS.light}
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
            placeholderTextColor={COLORS.light}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Text style={{ color: COLORS.light, fontSize: 18 }}>{showPass ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.btnPrimary} onPress={handleConnexion} disabled={loading}>
        {loading
          ? <ActivityIndicator color={COLORS.dark} />
          : <Text style={styles.btnTxt}>Se connecter →</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Inscription')}>
        <Text style={styles.lien}>Pas de compte ? <Text style={{ color: COLORS.or }}>S'inscrire</Text></Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#0E0A08', padding: 24, justifyContent: 'center' },
  logo:       { fontSize: 28, fontWeight: '800', color: '#C9A84C', textAlign: 'center', marginBottom: 24, letterSpacing: 3 },
  titre:      { fontSize: 22, fontWeight: '800', color: '#F0E8D8', marginBottom: 4 },
  sous:       { fontSize: 13, color: COLORS.light, marginBottom: 28 },
  inputWrap:  { marginBottom: 16 },
  label:      { fontSize: 11, fontWeight: '700', color: COLORS.light, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  inputRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#160E0A', borderWidth: 1, borderColor: COLORS.bd, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 12 },
  prefix:     { fontSize: 13, color: '#F0E8D8', marginRight: 8 },
  input:      { fontSize: 14, color: '#F0E8D8', flex: 1 },
  btnPrimary: { backgroundColor: '#8B1A2A', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  btnTxt:     { fontSize: 15, fontWeight: '700', color: 'white' },
  lien:       { textAlign: 'center', fontSize: 13, color: COLORS.light },
});
