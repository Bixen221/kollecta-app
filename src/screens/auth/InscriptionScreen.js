import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import * as Localization from 'expo-localization';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import SelecteurPays from '../../components/SelecteurPays';
import { PAYS, paysParDefaut } from '../../data/pays';

export default function InscriptionScreen({ navigation }) {
  const { inscription } = useAuth();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [etape, setEtape] = useState(1);
  const [pays, setPays] = useState(paysParDefaut);
  const [form, setForm] = useState({
    nom: '', prenom: '', numeroLocal: '', password: '', confirmPassword: '', quartier: '', ville: paysParDefaut.capitale,
  });
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    try {
      const codePays = Localization.getLocales()[0]?.regionCode;
      const trouve = PAYS.find(p => p.code === codePays);
      if (trouve) {
        setPays(trouve);
        setForm(f => ({ ...f, ville: trouve.capitale }));
      }
    } catch (e) {}
  }, []);

  const handleChangerPays = (nouveauPays) => {
    setPays(nouveauPays);
    setForm(f => ({ ...f, numeroLocal: '', ville: nouveauPays.capitale }));
  };

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleNumeroChange = (val) => {
    const chiffres = val.replace(/\D/g, '').slice(0, pays.longueur);
    update('numeroLocal', chiffres);
  };

  const numeroComplet = form.numeroLocal.length === pays.longueur;

  const passerEtape2 = () => {
    if (!form.prenom || !form.nom) {
      return Alert.alert('Erreur', 'Veuillez remplir votre prénom et nom.');
    }
    if (!numeroComplet) {
      return Alert.alert('Erreur', `Le numéro doit contenir ${pays.longueur} chiffres.`);
    }
    setEtape(2);
  };

  const handleInscription = async () => {
    if (!form.password) {
      return Alert.alert('Erreur', 'Veuillez choisir un mot de passe.');
    }
    if (form.password.length < 8) {
      return Alert.alert('Erreur', 'Le mot de passe doit avoir au moins 8 caractères.');
    }
    if (form.password !== form.confirmPassword) {
      return Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
    }
    setLoading(true);
    try {
      const whatsapp = pays.indicatif + form.numeroLocal;
      await inscription({
        nom: form.nom, prenom: form.prenom, whatsapp,
        password: form.password, quartier: form.quartier, ville: form.ville,
      });
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

        {/* INDICATEUR D'ÉTAPE */}
        <View style={styles.etapesRow}>
          <View style={[styles.etapeDot, { backgroundColor: theme.or }]} />
          <View style={[styles.etapeLigne, { backgroundColor: etape === 2 ? theme.or : theme.bd }]} />
          <View style={[styles.etapeDot, { backgroundColor: etape === 2 ? theme.or : theme.bd }]} />
        </View>

        {etape === 1 ? (
          <>
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
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <SelecteurPays paysSelectionne={pays} onChange={handleChangerPays} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder={'X'.repeat(pays.longueur)}
                  placeholderTextColor={theme.txt3}
                  value={form.numeroLocal}
                  onChangeText={handleNumeroChange}
                  keyboardType="phone-pad"
                />
              </View>
              {form.numeroLocal.length > 0 && (
                <Text style={{ fontSize: 11, marginTop: 6, color: numeroComplet ? theme.gr : theme.txt3 }}>
                  {form.numeroLocal.length}/{pays.longueur} chiffres
                </Text>
              )}
            </View>

            <TouchableOpacity style={styles.btnPrimary} onPress={passerEtape2}>
              <Text style={styles.btnTxt}>Continuer →</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.inputWrap}>
              <Text style={styles.label}>Quartier</Text>
              <TextInput style={styles.input} placeholder="Ex: Plateau, Mermoz..." placeholderTextColor={theme.txt3} value={form.quartier} onChangeText={v => update('quartier', v)} />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.label}>Ville</Text>
              <TextInput style={styles.input} placeholder="Dakar" placeholderTextColor={theme.txt3} value={form.ville} onChangeText={v => update('ville', v)} />
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

            <View style={styles.inputWrap}>
              <Text style={styles.label}>Confirmer le mot de passe *</Text>
              <TextInput style={styles.input} placeholder="Retapez le mot de passe" placeholderTextColor={theme.txt3} value={form.confirmPassword} onChangeText={v => update('confirmPassword', v)} secureTextEntry={!showPass} />
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[styles.btnSecondaire, { flex: 1 }]} onPress={() => setEtape(1)}>
                <Text style={styles.btnSecondaireTxt}>← Retour</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnPrimary, { flex: 2, marginTop: 0 }]} onPress={handleInscription} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnTxt}>Créer mon compte →</Text>}
              </TouchableOpacity>
            </View>
          </>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('Connexion')} style={{ marginTop: 16 }}>
          <Text style={styles.lien}>Déjà membre ? <Text style={{ color: theme.or }}>Se connecter</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container:   { padding: 24, paddingTop: 60 },
  logo:        { fontSize: 26, fontWeight: '800', color: theme.or, textAlign: 'center', marginBottom: 20, letterSpacing: 3 },
  titre:       { fontSize: 22, fontWeight: '800', color: theme.txt, marginBottom: 4 },
  sous:        { fontSize: 13, color: theme.txt2, marginBottom: 20 },
  etapesRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  etapeDot:    { width: 10, height: 10, borderRadius: 5 },
  etapeLigne:  { width: 40, height: 2, marginHorizontal: 6 },
  row:         { flexDirection: 'row' },
  inputWrap:   { marginBottom: 14 },
  label:       { fontSize: 11, fontWeight: '700', color: theme.txt2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  inputRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.inp, borderWidth: 1, borderColor: theme.bd, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 12 },
  input:       { fontSize: 14, color: theme.txt, backgroundColor: theme.inp, borderWidth: 1, borderColor: theme.bd, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 12 },
  btnPrimary:  { backgroundColor: theme.bord, borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 8 },
  btnTxt:      { fontSize: 15, fontWeight: '700', color: 'white' },
  btnSecondaire: { borderRadius: 12, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: theme.bd, marginTop: 8 },
  btnSecondaireTxt: { fontSize: 14, fontWeight: '700', color: theme.txt2 },
  lien:        { textAlign: 'center', fontSize: 13, color: theme.txt2 },
});
