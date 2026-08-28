import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ReservationsProvider } from './src/context/ReservationsContext';
import { NotificationsProvider } from './src/context/NotificationsContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import Navigation from './src/navigation';
import { enregistrerPourNotifications } from './src/services/pushNotifications';

const AppContent = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      enregistrerPourNotifications();
    }
  }, [user]);

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
          <NotificationsProvider>
            <AppContent />
          </NotificationsProvider>
        </ReservationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
