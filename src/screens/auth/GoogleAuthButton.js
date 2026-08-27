import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useAuth } from '../../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

// Client ID de type "Web application" dans Google Cloud Console
const CLIENT_ID = '683213095101-nml5nlgedrhufdh7hqeiasepl0o01qdp.apps.googleusercontent.com';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

const redirectUri = AuthSession.makeRedirectUri();

// Cette URL doit être ajoutée dans Google Cloud Console → Identifiants → ton Client ID Web → "URI de redirection autorisés"
console.log('🔗 REDIRECT URI GOOGLE A AUTORISER :', redirectUri);

export default function GoogleAuthButton() {
  const { connexionAvecGoogle } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleLogin(response.authentication.accessToken);
    } else if (response?.type === 'error') {
      Alert.alert('Erreur Google', response.error?.message || 'Connexion refusée.');
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
