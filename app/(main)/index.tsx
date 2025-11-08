import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ServicesApi } from '../../services/api';
import type { Service } from '../../types';
import ServiceCard from '../../components/ServiceCard';
import Header from '../../components/Header';
import { Search } from 'lucide-react-native';
import { useNotification } from 'contexts/NotificationContext';

export default function HomeScreen() {
  const router = useRouter();
  const [services, setServices] = React.useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = React.useState<Service[]>([]);
  const [search, setSearch] = React.useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification()
    const onRefresh = React.useCallback(async() => {
        setIsRefreshing(true);
        try {
          const list = await ServicesApi.list();
          
          setServices(typeof(list) !== 'object' ? [] : list); 
          setFilteredServices(typeof(list) !== 'object' ? [] : list);
        } catch (e) {
          console.log('Erreur lors du chargement des services', e);
          showNotification('Erreur de conneixion !','error')
        }
        setIsRefreshing(false);
      }, []);

  // Charger les services depuis l'API
  React.useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const list = await ServicesApi.list();
        setServices(typeof(list) !== 'object' ? [] : list); 
        setFilteredServices(typeof(list) !== 'object' ? [] : list);
      } catch (e) {
        console.log('Erreur lors du chargement des services', e);
      }
      setIsLoading(false);
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
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing} // Contrôle l'état de l'animation de rafraîchissement
            onRefresh={onRefresh} // Fonction à appeler lors du tirage vers le bas
          />
        }
      >
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

          <View className="pt-2 mb-5 space-y-4">
            {/* Liste des services */}
            
            {isLoading &&<View className='items-center justify-center flex-1'>
              <ActivityIndicator size="large" color="#075985" />
            </View>}
            
            {filteredServices.length > 0 ? (
              filteredServices.map((s, idx) => (
                <ServiceCard
                  key={s.id}
                  service={s}
                  onPress={() => router.push(`/(services)/${s.id}`)}
                  accent={idx % 2 === 0 ? '#0fade8' : '#FFE5B4'}
                />
              ))
            ) : isLoading ? null : (
              <Text className="mt-10 text-center text-gray-500">
                Aucun service trouvé
              </Text>
            )}
          </View>
      </ScrollView>
    </View>
  );
}

