import React from 'react';
import { View, Text, Image, TextInput, FlatList, TouchableOpacity, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ServicesApi } from '../../../services/api';
import type { Agent, Service } from '../../../types';
import { User, Search, Star, BadgeCheck } from 'lucide-react-native';
import Header from 'components/HeaderBack';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams(); // récupère l'id du service depuis l'URL
  const [service, setService] = React.useState<Service | null>(null);
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    (async () => {
      const s = await ServicesApi.detail(id as string);
      setService(s);
      const recommended = await ServicesApi.getAgents(id as string);
      setAgents(recommended);
    })();
  }, [id]);

  // Filtre agents selon la recherche
  const filteredAgents = agents.filter(a =>
    a.user?.name.toLowerCase().includes(search.toLowerCase())
  );

    const handleAgentPress = (id : string) => {    
    router.push({
      pathname: '/(services)/agent/',
      params: {
        id: id,
        service: JSON.stringify(service),
      },
    });
  };

  if (!service) {
    return (
      <View className='items-center justify-center flex-1'>
        <Text className='text-xl font-montserrat-semibold text-sky-950'>Service introuvable !</Text>
        <Pressable onPress={() => router.back()}>
          <Text className='px-4 py-2 mt-4 text-lg text-white rounded-lg font-montserrat-semibold bg-primary'>Retour</Text>
        </Pressable>
      </View>
    )
  };

  return (
    <View className='flex-1 px-5 bg-slate-50'>
      {/* Header personnalisé */}
      <Header />
            
      <View className='flex-1 pb-5'>
        {/* Card du service */}
        <View className='p-5 mb-4 bg-white border rounded-lg shadow border-primary'>
          <Text className='text-2xl font-montserrat-bold text-sky-950'>{service?.nom}</Text>
          <Text className='text-base font-montserrat text-sky-950'>
            {service?.description}
          </Text>
        </View>

        {/* Barre de recherche */}
        <View className='shadow' style={{
          flexDirection: 'row',
          backgroundColor: '#fff',
          borderRadius: 10,
          alignItems: 'center',
          paddingHorizontal: 16,
          marginBottom: 24,
        }}>
          <TextInput
            className='font-montserrat'
            placeholder="Rechercher un agent..."
            style={{ flex: 1, height: 58 }}
            value={search}
            onChangeText={setSearch}
          />
          <Search size={24} color="#143A52" />
        </View>

        {/* Agents recommandés */}
        <Text className='font-montserrat-bold' style={{ fontSize: 18, color: '#143A52', marginBottom: 8 }}>
          AGENTS RECOMMANDÉS
        </Text>
        
        <FlatList
          data={search.length > 0 ? filteredAgents : agents}
          className='flex-1 '
          keyExtractor={item => item.user_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleAgentPress(item.user_id)} className='flex-row items-center p-4 mb-2 bg-white rounded-3xl' >
              <View className='flex-row items-center justify-center w-20 h-20 mr-4 overflow-hidden rounded-full bg-sky-50'>
                  {item?.user?.avatar ? <Image source={{ uri: item?.user?.avatar }} className='w-full h-full rounded-full' />:
                  // <User size={44} color="#bae6fd" />
                  <Image source={require('../../../assets/items/baby.jpg')} className='w-full h-full rounded-full' />
                  }
              </View>

              {item.is_badges && (<View className='absolute left-0 bottom-4'>
                <BadgeCheck size={28} color="white" fill={'#38bdf8'} />
              </View>)}
              
              <View style={{ flex: 1 }}>
                <Text className='text-lg font-montserrat-bold text-sky-900' style={{ lineHeight: 13 }}>{item.user?.name}</Text>
                <View style={{ flexDirection: 'row', marginVertical: 4 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} color="orange" fill={i <= item.rating - 1 ? 'orange' : 'transparent'} />
                  ))}
                </View>
                <Text className='text-base text-gray-500' style={{ lineHeight: 12 }}>
                  {item.is_badges ? 'Agent formé et certifié' : ''}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
        
        {agents.length === 0 && <View className='items-center justify-center flex-1'>
          <Text className='font-montserrat-medium'>Aucun agent trouvé !</Text>
        </View>}
      </View>
    </View>
  );
}