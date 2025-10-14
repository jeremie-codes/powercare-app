import React from 'react';
import { View, Text, Pressable, ImageBackground } from 'react-native';
import { PlayCircle } from 'lucide-react-native'
import { useRouter } from 'expo-router';

export default function Step2() {
  const router = useRouter();
  return (
    <ImageBackground source={require('../../assets/step2.png')} resizeMode="cover" className="flex-1">
      {/* <View className="flex-1 bg-black/10"></View> */}

      <View className="flex-1 px-6 pt-16">
        <View className="justify-end flex-1 mb-4">
          <View className="flex-row items-center justify-start gap-0 mb-4">
            <Pressable onPress={() => router.push('/(onboarding)/step1')} className="z-10 items-center justify-center w-10 h-10 border rounded-full border-primary bg-primary">
              <Text className="text-lg text-center text-white font-montserrat-bold">1</Text>
            </Pressable>
            <View className="z-0 w-6 h-3 border -left-1 bg-primary border-primary" />
            <View className="z-10 items-center justify-center w-10 h-10 rounded-full -left-2 bg-primary" >
              <Text className="text-lg text-center text-white font-montserrat-bold">2</Text>
            </View>
          </View>

          <View className="items-start justify-center mb-8">
            <Text className="mb-2 text-3xl text-white font-montserrat-bold">Services & Réservation</Text>
            <Text className="text-xl text-justify text-white/90">Consultez les services par agent, comparez les tarifs et réservez en toute simplicité.</Text>
          </View>
          
          <View className="items-end w-full pb-8">
            <Pressable onPress={() => router.replace('/home')} className="flex-row items-center justify-center w-56 py-4 bg-primary rounded-3xl">
              <Text className="mr-2 text-xl text-white font-montserrat-bold">Commencer</Text>
              <PlayCircle color="#fff" size={20} />
            </Pressable>
          </View>
        </View>
        
      </View>
    </ImageBackground>
  );
}
