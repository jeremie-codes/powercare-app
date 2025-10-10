import React from 'react';
import { View, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useMenu } from '../contexts/MenuContext';
import { Bell, AlignLeft } from 'lucide-react-native'

export default function Header() {
  const router = useRouter();
  const { toggleMenu } = useMenu();

  return (
    <View className="flex-row items-center justify-between px-5 mb-10 pt-14">
      {/* <Text className="text-2xl text-black font-montserrat-bold">Nos Services</Text> */}
      <Pressable onPress={toggleMenu} className="items-center justify-center w-16 h-16 bg-white rounded-full shadow shadow-slate-300">
        <AlignLeft color="#075985" size={22} />
      </Pressable>
      
      <View className="w-24">
        <Image source={require('../assets/logo.png')} style={{ width: 80, height: 63 }} />
      </View>
      
      <Pressable onPress={() => router.push('/notifications')} className="items-center justify-center w-16 h-16 bg-white rounded-full shadow shadow-slate-300">
        <Bell color="#075985" size={22} />
      </Pressable>
    </View>
  );
}
