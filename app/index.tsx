import React from 'react';
import { View, ActivityIndicator, Image } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from 'contexts/AuthContext';

export default function Index() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-sky-50">
        <Image source={require('../assets/favicon.png')} className="h-20" style={{ width: 50 }} />
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }
  
  return <Redirect href="/(onboarding)" />;
  
}
