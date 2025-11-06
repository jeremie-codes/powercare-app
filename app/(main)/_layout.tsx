import { Stack } from 'expo-router';
import React from 'react';
import Menu from '../../components/Menu';
import { MenuProvider } from '../../contexts/MenuContext';

export default function OnboardingLayout() {

  return (
    <MenuProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(services)" />
        {/* <Stack.Screen name="messages" /> */}
        <Stack.Screen name="reservation" />
        <Stack.Screen name="tasks" />
        <Stack.Screen name="login" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="register" />
        <Stack.Screen name="support" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <Menu />
    </MenuProvider>
  );
}
