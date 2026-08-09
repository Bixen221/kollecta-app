import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = '683213095101-nml5nlgedrhufdh7hqeiasepl0o01qdp.apps.googleusercontent.com';

export default function GoogleAuthButton() {
  const { connexionAvecGoogle } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: CLIENT_ID,
    iosClientId: CLIENT_ID,
    androidClientId: CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleLogin(authentication.accessToken);
    }
  }, [response]);

  const handleGoogleLogin = async (accessToken) => {
    setLoading(true);
    try {
      const userInfoRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await userInfoRes.json();

      await connexionAvecGoogle({
        google_id: userInfo.id,
        email: userInfo.email,
        nom: userInfo.family_name || userInfo.name || '',
        prenom: userInfo.given_name || '',
        avatar_url: userInfo.picture,
      });
    } catch (err) {
      Alert.alert('Erreur', 'Connexion Google échouée. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={() => promptAsync()}
      disabled={!request || loading}
    >
      {loading ? (
        <ActivityIndicator color="#1A1410" />
      ) : (
        <>
          <Text style={styles.icone}>G</Text>
          <Text style={styles.txt}>Continuer avec Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E0D4C0',
    gap: 10,
  },
  icone: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4285F4',
  },
  txt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1410',
  },
});
