import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ServicesApi } from '../../services/api';
import type { Service } from '../../types';
import ServiceCard from '../../components/ServiceCard';
import Header from '../../components/Header';
import { useMenu } from '../../contexts/MenuContext';
import { Bell, AlignLeft, Search } from 'lucide-react-native'

export default function HomeScreen() {
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
      <Header />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Carrousel services */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5">
          {services.map((s, idx) => (
            <ServiceCard key={s.id} service={s} onPress={() => router.push(`/(services)/${s.id}`)} accent={idx % 1 === 0 ? '#0fade8' : '#FFE5B4'} />
            // <ServiceCard key={s.id} service={s} onPress={() => router.push(`/services/${s.id}`)} accent={idx % 2 === 0 ? '#0fade8' : '#FFE5B4'} />
          ))}
        </ScrollView>

        {/* Section recherche */}
        <View className="p-5 mx-5 mt-8 bg-white shadow-lg rounded-3xl shadow-black">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 pr-4">
              <Text className="text-xl font-montserrat-semibold text-[#0B2A36]">Trouver le service</Text>
              <Text className="text-xl font-montserrat-semibold text-[#0B2A36]">que vous souhaitez</Text>
            </View>
            <View className="items-center justify-center w-12 h-12 bg-white rounded-full" style={{ shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}>
              <Search color="#075985" size={22} />
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
