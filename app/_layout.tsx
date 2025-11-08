import { Stack } from "expo-router";
import React, { useCallback, useEffect, useState } from 'react';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { SplashScreen } from 'expo-router';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import { ActivityIndicator, Image, StatusBar, View } from "react-native";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Montserrat-Regular': Montserrat_400Regular,
    'Montserrat-Medium': Montserrat_500Medium,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Bold': Montserrat_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View className="items-center justify-center flex-1 bg-sky-50">
        <Image source={require('../assets/favicon.png')} className="h-20" style={{ width: 50 }} />
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(main)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar hidden={true} backgroundColor="transparent" barStyle="dark-content" />
      </NotificationProvider>
    </AuthProvider>
  );
}
