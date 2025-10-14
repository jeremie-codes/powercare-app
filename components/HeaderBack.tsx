import React from 'react';
import { View, Pressable, Image } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useMenu } from '../contexts/MenuContext';
import { Bell, ArrowLeft } from 'lucide-react-native'

export default function Header() {
  const router = useRouter();
  const { toggleMenu } = useMenu();
  const pathname = usePathname();

  const isReservationPage = pathname.includes('messages');

  return (
    <View className="flex-row items-center justify-between pt-12 mb-10">
      {/* <Text className="text-2xl text-black font-montserrat-bold">Nos Services</Text> */}
      <Pressable onPress={() => router.back()} className="items-center justify-center w-16 h-16 bg-white rounded-full shadow shadow-slate-300">
        <ArrowLeft color="#075985" size={24} />
      </Pressable>
        
      {/* <View className="w-24">
        <Image source={require('../assets/logo.png')} style={{ width: 80, height: 63 }} />
      </View> */}
      
      <Pressable onPress={() => !isReservationPage ? router.push('/messages') : { }} className="items-center justify-center w-16 h-16 bg-white rounded-full shadow shadow-slate-300">
        <Bell color="#075985" size={22} />
      </Pressable>
    </View>
  );
}
