import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const MessagesContext = createContext({});

export const MessagesProvider = ({ children }) => {
  const { user } = useAuth();
  const [nonLus, setNonLus] = useState(0);

  const charger = async () => {
    try {
      const res = await api.get('/messages/conversations');
      const total = (res.conversations || []).reduce((acc, c) => acc + Number(c.non_lus || 0), 0);
      setNonLus(total);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) { setNonLus(0); return; }
    charger();
    const interval = setInterval(charger, 15000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <MessagesContext.Provider value={{ nonLus, charger }}>
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => useContext(MessagesContext);
