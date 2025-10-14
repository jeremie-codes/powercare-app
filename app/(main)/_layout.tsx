import { Stack } from 'expo-router';
import React from 'react';
import Menu from '../../components/Menu';
import { MenuProvider } from '../../contexts/MenuContext';

export default function OnboardingLayout() {
  return (
    <MenuProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="home" />
        <Stack.Screen name="services" />
        <Stack.Screen name="reservation" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <Menu />
    </MenuProvider>
  );
}
