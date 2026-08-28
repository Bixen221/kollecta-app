import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext({});

export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();
  const [nonLues, setNonLues] = useState(0);

  const charger = async () => {
    try {
      const res = await api.get('/notifications');
      const count = (res.notifications || []).filter(n => !n.lu).length;
      setNonLues(count);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) { setNonLues(0); return; }
    charger();
    const interval = setInterval(charger, 15000); // polling toutes les 15s
    return () => clearInterval(interval);
  }, [user]);

  return (
    <NotificationsContext.Provider value={{ nonLues, charger }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
