import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerUtilisateur();
  }, []);

  const chargerUtilisateur = async () => {
    try {
      const tokenSauvegarde = await SecureStore.getItemAsync('token');
      if (tokenSauvegarde) {
        setToken(tokenSauvegarde);
        const data = await api.get('/auth/moi');
        setUser(data.user);
      }
    } catch (err) {
      await SecureStore.deleteItemAsync('token');
    } finally {
      setLoading(false);
    }
  };

  const connexion = async (whatsapp, password) => {
    const data = await api.post('/auth/connexion', { whatsapp, password });
    await SecureStore.setItemAsync('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const inscription = async (infos) => {
    const data = await api.post('/auth/inscription', infos);
    await SecureStore.setItemAsync('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const deconnexion = async () => {
    await SecureStore.deleteItemAsync('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, connexion, inscription, deconnexion }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
