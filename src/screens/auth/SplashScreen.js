import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, useWindowDimensions, Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const SLIDES = [
  {
    emoji: '🎁',
    titre: 'Bienvenue sur Kollecta',
    texte: 'La plateforme sénégalaise de dons et d\'enchères entre particuliers.',
  },
  {
    image: require('../../../assets/onboarding-don.png'),
    titre: 'Donnez, recevez',
    texte: 'Offrez gratuitement nourriture ou matériel à des voisins qui en ont besoin, près de chez vous.',
  },
  {
    image: require('../../../assets/onboarding-enchere.png'),
    titre: 'Enchérissez en direct',
    texte: 'Vendez au meilleur prix ou faites une bonne affaire grâce aux enchères en temps réel.',
  },
  {
    emoji: '💬',
    titre: 'En toute confiance',
    texte: 'Échangez via la messagerie intégrée, sans exposer votre numéro, et consultez les avis vérifiés.',
  },
];

export default function SplashScreen({ navigation }) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const listRef = useRef(null);

  const estDerniere = index === SLIDES.length - 1;

  const suivant = () => {
    if (estDerniere) return;
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  const passer = () => {
    listRef.current?.scrollToIndex({ index: SLIDES.length - 1, animated: true });
  };

  const onScroll = (e) => {
    const nouvelIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    if (nouvelIndex !== index) setIndex(nouvelIndex);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {!estDerniere && (
        <TouchableOpacity style={styles.skipBtn} onPress={passer}>
          <Text style={{ color: theme.txt2, fontSize: 13, fontWeight: '600' }}>Passer</Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={{ width, flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 36 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: theme.or, letterSpacing: 3, marginBottom: 40 }}>KOLLECTA</Text>
            {item.image ? (
              <View style={[styles.imageWrap, { backgroundColor: theme.orl }]}>
                <Image source={item.image} style={styles.image} resizeMode="contain" />
              </View>
            ) : (
              <View style={[styles.emojiWrap, { backgroundColor: theme.orl }]}>
                <Text style={{ fontSize: 56 }}>{item.emoji}</Text>
              </View>
            )}
            <Text style={[styles.titre, { color: theme.txt }]}>{item.titre}</Text>
            <Text style={[styles.texte, { color: theme.txt2 }]}>{item.texte}</Text>
          </View>
        )}
      />

      {/* PAGINATION */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === index ? theme.or : theme.bd, width: i === index ? 20 : 7 },
            ]}
          />
        ))}
      </View>

      {/* ACTIONS */}
      <View style={styles.btns}>
        {estDerniere ? (
          <>
            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: theme.or }]}
              onPress={() => navigation.navigate('Inscription')}
            >
              <Text style={[styles.btnPrimaryTxt, { color: theme.isDark ? '#0E0A08' : '#FFFFFF' }]}>Commencer →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('Connexion')}>
              <Text style={[styles.btnSecondaryTxt, { color: theme.or }]}>Déjà membre ? Se connecter</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: theme.or }]} onPress={suivant}>
            <Text style={[styles.btnPrimaryTxt, { color: theme.isDark ? '#0E0A08' : '#FFFFFF' }]}>Suivant →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skipBtn:      { position: 'absolute', top: 55, right: 20, zIndex: 10, padding: 8 },
  emojiWrap:    { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 28 },
  imageWrap:    { width: 180, height: 180, borderRadius: 90, justifyContent: 'center', alignItems: 'center', marginBottom: 28, overflow: 'hidden' },
  image:        { width: '100%', height: '100%' },
  titre:        { fontSize: 22, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  texte:        { fontSize: 14, textAlign: 'center', lineHeight: 21, paddingHorizontal: 10 },
  dotsRow:      { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 24 },
  dot:          { height: 7, borderRadius: 4 },
  btns:         { gap: 12, paddingHorizontal: 30, paddingBottom: 40 },
  btnPrimary:   { borderRadius: 14, padding: 16, alignItems: 'center' },
  btnPrimaryTxt:{ fontSize: 16, fontWeight: '800' },
  btnSecondary: { alignItems: 'center', padding: 12 },
  btnSecondaryTxt: { fontSize: 14, fontWeight: '600' },
});
