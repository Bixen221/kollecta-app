import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { ReservationsProvider } from './src/context/ReservationsContext';
import Navigation from './src/navigation';

export default function App() {
  return (
    <AuthProvider>
      <ReservationsProvider>
        <StatusBar style="light" />
        <Navigation />
      </ReservationsProvider>
    </AuthProvider>
  );
}
