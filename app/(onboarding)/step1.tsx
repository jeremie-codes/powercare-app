import React from 'react';
import { View, Text, Pressable, ImageBackground } from 'react-native';
import { ChevronRight } from 'lucide-react-native'
import { useRouter } from 'expo-router';

export default function Step1() {
  const router = useRouter();
  return (
    <ImageBackground source={require('../../assets/step1.png')} resizeMode="cover" className="flex-1">
      {/* <View className="flex-1 bg-black/10"></View> */}

      <View className="flex-1 px-6 pt-16">
        <View className="justify-end flex-1 mb-4">
          <View className="flex-row items-center justify-start gap-0 mb-4">
            <View className="z-10 items-center justify-center w-10 h-10 border rounded-full border-primary bg-primary">
              <Text className="text-lg text-center text-white font-montserrat-bold">1</Text>
            </View>
            <View className="z-0 w-6 h-3 bg-white border -left-1 border-primary" />
            <Pressable onPress={() => router.push('/(onboarding)/step2')} className="z-10 items-center justify-center w-10 h-10 bg-white border rounded-full -left-2 border-primary" >
              <Text className="text-lg text-center font-montserrat-bold text-primary">2</Text>
            </Pressable>
          </View>

          <View className="mb-8 border-slate-50">
            <Text className="mb-2 text-3xl text-white font-montserrat-bold">Bienvenue sur PowerCare </Text>
            <Text className="text-xl text-justify text-white/90">Des services de garde d’enfants et de ménage, simples et fiables.</Text>
          </View>
          
          <View className="items-end w-full pb-8">
            <Pressable onPress={() => router.push('/(onboarding)/step2')} className="flex-row items-center justify-center w-56 py-4 bg-primary rounded-3xl">
              <Text className="mr-2 text-xl text-white font-montserrat-bold">Continuer</Text>
              <ChevronRight className="pl-2" color="#fff" size={24} />
            </Pressable>
          </View>
        </View>
        
      </View>
    </ImageBackground>
  );
}
