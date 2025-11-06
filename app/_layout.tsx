import { Stack } from "expo-router";
import React, { useCallback } from "react";
import { useFonts } from "expo-font";
import { AuthProvider } from "../contexts/AuthContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import * as SplashScreen from "expo-splash-screen";
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { ActivityIndicator, Image, StatusBar, View } from "react-native";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Montserrat-Regular": Montserrat_400Regular,
    "Montserrat-Medium": Montserrat_500Medium,
    "Montserrat-SemiBold": Montserrat_600SemiBold,
    "Montserrat-Bold": Montserrat_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // 🕒 Pendant le chargement des polices
  if (!fontsLoaded && !fontError) {
    return (
      <View className="items-center justify-center flex-1 bg-sky-50">
        <Image source={require('../assets/favicon.png')} className="h-20" style={{ width: 50 }} />
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View className="flex-1" onLayout={onLayoutRootView}>
      <AuthProvider>
        <NotificationProvider>
          {/* ✅ Stack racine */}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="(main)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
          </Stack>

          <StatusBar hidden={true} backgroundColor="transparent" barStyle="dark-content" />
        </NotificationProvider>
      </AuthProvider>
    </View>
  );
}
