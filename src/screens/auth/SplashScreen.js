import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';

const COLORS = {
  or: '#C9A84C', bord: '#8B1A2A', dark: '#0E0A08', dark2: '#1A120E', light: '#B0A090',
};

export default function SplashScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Text style={styles.logoText}>KOLLECTA</Text>
        <Text style={styles.tagline}>Donnez. Recevez. Enchérissez.</Text>
        <Text style={styles.desc}>
          La plateforme sénégalaise de dons et d'enchères entre particuliers.
        </Text>
      </View>

      <View style={styles.btns}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate('Inscription')}
        >
          <Text style={styles.btnPrimaryTxt}>Commencer →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => navigation.navigate('Connexion')}
        >
          <Text style={styles.btnSecondaryTxt}>Déjà membre ? Se connecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.dark, justifyContent: 'space-between', padding: 30 },
  logoWrap:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoText:     { fontSize: 42, fontWeight: '800', color: COLORS.or, letterSpacing: 4, marginBottom: 16 },
  tagline:      { fontSize: 16, fontWeight: '700', color: '#F0E8D8', marginBottom: 12, textAlign: 'center' },
  desc:         { fontSize: 13, color: COLORS.light, textAlign: 'center', lineHeight: 20 },
  btns:         { gap: 12 },
  btnPrimary:   { backgroundColor: COLORS.or, borderRadius: 14, padding: 16, alignItems: 'center' },
  btnPrimaryTxt:{ fontSize: 16, fontWeight: '800', color: COLORS.dark },
  btnSecondary: { alignItems: 'center', padding: 12 },
  btnSecondaryTxt: { fontSize: 14, color: COLORS.or, fontWeight: '600' },
});
