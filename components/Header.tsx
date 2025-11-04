import React from 'react';
import { View, Pressable, Image } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useMenu } from '../contexts/MenuContext';
import { Bell, AlignLeft } from 'lucide-react-native'
import { useNotification } from 'contexts/NotificationContext';
import { useAuth } from 'contexts/AuthContext';

export default function Header() {
  const router = useRouter();
  const { toggleMenu } = useMenu();
  const pathname = usePathname();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const isReservationPage = pathname.includes('messages');

  const handlePress = () => {
    if (!user) {
      showNotification('Vous devez être connecté pour accéder à cette page', 'warning');
      return;
    }

    if (isReservationPage) return;
    router.push('/messages');
  };
  
  
  return (
    <View className="flex-row items-center justify-between pt-12 mb-4">
      
      <View className="w-24">
        <Image source={require('../assets/logo.png')} style={{ width: 80, height: 63 }} />
      </View>
      
      <Pressable onPress={toggleMenu} className="items-center justify-center w-16 h-16 bg-white rounded-full shadow shadow-slate-300">
        <AlignLeft color="#075985" size={22} />
      </Pressable>
      {/* <Pressable onPress={handlePress} className="items-center justify-center w-16 h-16 bg-white rounded-full shadow shadow-slate-300">
        <Bell color="#075985" size={22} />
      </Pressable> */}
    </View>
  );
}
