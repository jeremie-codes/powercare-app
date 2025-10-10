import { Stack } from "expo-router";
import React from 'react';
import * as Font from 'expo-font';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import { StatusBar } from "react-native";
import '../global.css';

export default function Layout() {
  const [fontsReady, setFontsReady] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Charge les polices Montserrat et enregistre les noms pour Tailwind/NativeWind
        await Font.loadAsync({
          'Montserrat-Regular': Montserrat_400Regular,
          'Montserrat-Medium': Montserrat_500Medium,
          'Montserrat-SemiBold': Montserrat_600SemiBold,
          'Montserrat-Bold': Montserrat_700Bold,
        });
      } catch (e) {
        // Ignore les erreurs de charge des polices en dev/mock
      } finally {
        if (mounted) setFontsReady(true);
      }
    })();
    return () => { mounted = false };
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(main)" />
        </Stack>
        <StatusBar hidden={true} backgroundColor="transparent" barStyle="dark-content" />
      </NotificationProvider>
    </AuthProvider>
  );
}
