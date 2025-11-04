import { Stack } from 'expo-router';
import React from 'react';

export default function ServiceLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen name="agent" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
