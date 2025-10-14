import { Stack } from "expo-router";
import React, { useCallback } from 'react';
import { useFonts } from 'expo-font';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import * as SplashScreen from 'expo-splash-screen';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import { ActivityIndicator, StatusBar, View } from "react-native";
import "../global.css";

// Keep the splash screen visible until we're ready
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsReady, setFontsReady] = React.useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Montserrat-Regular': Montserrat_400Regular,
    'Montserrat-Medium': Montserrat_500Medium,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Bold': Montserrat_700Bold,
  });

    const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View className="items-center justify-center flex-1 bg-background-dark">
        <ActivityIndicator size={'large'} color={'#0fade8'} />
      </View>
    );
  }

  return (
    <View className="flex-1" onLayout={onLayoutRootView}>
      <AuthProvider>
        <NotificationProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(main)" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar hidden={true} backgroundColor="transparent" barStyle="dark-content" />
        </NotificationProvider>
      </AuthProvider>
    </View>
  );
}
