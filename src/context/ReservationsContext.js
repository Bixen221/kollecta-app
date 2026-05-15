import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const ReservationsContext = createContext({});

export const ReservationsProvider = ({ children }) => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) charger();
  }, [user]);

  const charger = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dons/reservations/mes-reservations');
      setReservations(res.reservations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const estReserve = (donId) => {
    return reservations.some(r => r.don_id === donId && !['annule'].includes(r.statut));
  };

  const getReservation = (donId) => {
    return reservations.find(r => r.don_id === donId && !['annule'].includes(r.statut));
  };

  return (
    <ReservationsContext.Provider value={{ reservations, loading, charger, estReserve, getReservation }}>
      {children}
    </ReservationsContext.Provider>
  );
};

export const useReservations = () => useContext(ReservationsContext);
