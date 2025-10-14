import React from 'react';
import { View, Text, ScrollView, Pressable, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ServicesApi } from '../../services/api';
import type { Service } from '../../types';
import ServiceCard from '../../components/ServiceCard';
import Header from '../../components/Header';
import { Search } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [services, setServices] = React.useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = React.useState<Service[]>([]);
  const [search, setSearch] = React.useState('');

  // Charger les services depuis l'API
  React.useEffect(() => {
    (async () => {
      try {
        const list = await ServicesApi.list();
        setServices(list);
        setFilteredServices(list);
      } catch (e) {
        console.log('Erreur lors du chargement des services', e);
      }
    })();
  }, []);

  // 🔍 Fonction de recherche
  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.trim() === '') {
      setFilteredServices(services);
    } else {
      const filtered = services.filter((s) =>
        s.nom.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 24 }}>
      
        {/* Header personnalisé */}
        <Header />

        {/* Section bienvenue */}
        <View className="mb-3">
          <Text className="text-xl font-montserrat-bold text-[#0B2A36]">Bienvenue !</Text>
        </View>

        {/* Barre de recherche */}
        <View className="flex-row items-center justify-between px-4 py-2 mb-4 bg-white shadow rounded-xl">
          <TextInput
            placeholder="Rechercher un service..."
            value={search}
            onChangeText={handleSearch}
            className="flex-1 text-base text-[#0B2A36] font-montserrat-medium px-3"
            placeholderTextColor="#999"
            autoCapitalize="none"
          />
          <Search color="#075985" size={22} />
        </View>

        {/* Liste des services */}
        <View className="pt-2 mb-5 space-y-4">
          {filteredServices.length > 0 ? (
            filteredServices.map((s, idx) => (
              <ServiceCard
                key={s.id}
                service={s}
                onPress={() => router.push(`/(services)/${s.id}`)}
                accent={idx % 2 === 0 ? '#0fade8' : '#FFE5B4'}
              />
            ))
          ) : (
            <Text className="mt-10 text-center text-gray-500">
              Aucun service trouvé
            </Text>
          )}
        </View>
        
      </ScrollView>
    </View>
  );
}
