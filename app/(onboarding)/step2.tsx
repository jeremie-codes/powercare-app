import React from 'react';
import { View, Text, Pressable, ImageBackground } from 'react-native';
import { PlayCircle } from 'lucide-react-native'
import { useRouter } from 'expo-router';

export default function Step2() {
  const router = useRouter();
  return (
    <ImageBackground source={require('../../assets/step2.png')} resizeMode="cover" className="flex-1">
      <View className="flex-1 bg-black/10"></View>

      <View className="flex-1 bg-black/10 px-6 pt-16">
        <View className="flex-1 justify-end mb-4">
          <View className="flex-row items-center justify-start gap-0 mb-4">
            <Pressable onPress={() => router.push('/(onboarding)/step1')} className="w-10 h-10 z-10 rounded-full border border-primary items-center justify-center bg-primary">
              <Text className="text-lg text-center font-montserrat-bold text-white">1</Text>
            </Pressable>
            <View className="w-6 h-3 -left-1 z-0 bg-primary border border-primary" />
            <View className="w-10 h-10 -left-2 z-10 rounded-full items-center justify-center bg-primary" >
              <Text className="text-lg text-center font-montserrat-bold text-white">2</Text>
            </View>
          </View>

          <View className="items-start justify-center mb-8">
            <Text className="text-3xl font-montserrat-bold text-white mb-2">Services & Réservation</Text>
            <Text className="text-xl text-white/90 text-justify">Consultez les services par agent, comparez les tarifs et réservez en toute simplicité.</Text>
          </View>
          
          <View className="pb-8 items-end w-full">
            <Pressable onPress={() => router.replace('/home')} className="bg-primary rounded-3xl flex-row justify-center py-4 items-center w-56">
              <Text className="text-white text-xl font-montserrat-bold mr-2">Commencer</Text>
              <PlayCircle color="#fff" size={20} />
            </Pressable>
          </View>
        </View>
        
      </View>
    </ImageBackground>
  );
}
