import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ServicesApi } from '../../services/api';
import type { Service } from '../../types';
import ServiceCard from '../../components/ServiceCard';
import { useMenu } from '../../contexts/MenuContext';
import { Bell, AlignLeft } from 'lucide-react-native'

export default function ProfileScreen() {
  const router = useRouter();
  const { toggleMenu } = useMenu();
  const [services, setServices] = React.useState<Service[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const list = await ServicesApi.list();
        setServices(list);
      } catch (e) {
        // noop (mode mock géré côté API)
      }
    })();
  }, []);

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header personnalisé */}
      <View className="px-5 pt-14 pb-4 flex-row items-center justify-between">
        {/* <Text className="text-2xl font-montserrat-bold text-black">Nos Services</Text> */}
        <View className="w-24 h-24">
          <Image source={require('../../assets/logo.png')} style={{ width: 80, height: 63 }} />
        </View>
        
        <View className="flex-row items-center gap-3 justify-between">
          <Pressable onPress={() => router.push('/notifications')} className="w-16 h-16 rounded-full bg-white items-center justify-center shadow shadow-slate-300">
            <Bell color="#075985" size={22} />
          </Pressable>
          <Pressable onPress={toggleMenu} className="w-16 h-16 rounded-full bg-white items-center justify-center shadow shadow-slate-300">
            <AlignLeft color="#075985" size={22} />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Carrousel services */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5">
          {services.map((s, idx) => (
            <ServiceCard key={s.id} service={s} onPress={() => router.push(`/services/${s.id}`)} accent={idx % 1 === 0 ? '#0fade8' : '#FFE5B4'} />
            // <ServiceCard key={s.id} service={s} onPress={() => router.push(`/services/${s.id}`)} accent={idx % 2 === 0 ? '#0fade8' : '#FFE5B4'} />
          ))}
        </ScrollView>

        {/* Section recherche */}
        <View className="mt-8 mx-5 p-5 bg-white rounded-3xl shadow-lg shadow-black">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 pr-4">
              <Text className="text-xl font-montserrat-semibold text-[#0B2A36]">Trouver le service</Text>
              <Text className="text-xl font-montserrat-semibold text-[#0B2A36]">que vous souhaitez</Text>
            </View>
            <View className="w-12 h-12 rounded-full bg-white items-center justify-center" style={{ shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}>
              <Text className="text-black">🔍</Text>
            </View>
          </View>

          <View className="flex-row justify-between">
            <View className="w-[45%] h-36 bg-white rounded-3xl" style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 }} />
            <View className="w-[45%] h-36 bg-white rounded-3xl" style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 }} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
