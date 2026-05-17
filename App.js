import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { ReservationsProvider } from './src/context/ReservationsContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import Navigation from './src/navigation';

const AppContent = () => {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Navigation />
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ReservationsProvider>
          <AppContent />
        </ReservationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
