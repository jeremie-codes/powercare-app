import React, { useState } from 'react';
import { View, Text, Image, TextInput, RefreshControl, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { baseUrl, TaskApi } from '../../../services/api';
import type { Agent } from '../../../types';
import { Search, User } from 'lucide-react-native';
import Header from 'components/Header';
import { useAuth } from 'contexts/AuthContext';
import { ActivityIndicator } from 'react-native-paper';
import { formatDate } from 'utils/formatters';
import { useNotification } from 'contexts/NotificationContext';

export default function recommendedScreen() {
  const { user, profile } = useAuth();
  const [agents, setAgent] = React.useState<Agent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filteredAgent, setFilteredAgent] = React.useState<Agent[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { showNotification } = useNotification()
  
  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        if (user) {
          const { success, message, agents } = await TaskApi.getAgentRecommendedByClient(user?.id);
          
          if (!success) {
            showNotification(message, 'error');
          }
          
          setFilteredAgent(agents);
          setAgent(agents ?? []);
        }
        
      } catch (e: any) {
        
        console.error('Erreur lors du chargement des agents :', e);
        showNotification(e.details.message ?? 'Une erreur est survenue', 'error');
        
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const onRefresh = React.useCallback(async() => {
    setIsRefreshing(true);
    try {
      if (user) {
          const { success, message, agents } = await TaskApi.getAgentRecommendedByClient(user?.id);
          
          if (!success) {
            showNotification(message, 'error');
          }
          
          setFilteredAgent(agents);
          setAgent(agents ?? []);
        }
        
      } catch (e: any) {
        
        console.error('Erreur lors du chargement des agents :', e);
        showNotification(e.details.message ?? 'Une erreur est survenue', 'error');
        
    } 
    setIsRefreshing(false);
  }, []);

  const handleagentPress = (id : string) => {    
    router.push({
      pathname: '/tasks/[id]',
      params: {
        id: id,
      },
    });
  };

  // 🔍 Fonction de recherche
  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.trim() === '') {
      setFilteredAgent(agents);
    } else {
      const filtered = agents.filter(m =>
        m.user?.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredAgent(filtered);
    }
  };

  // Si l'utilisateur n'est pas connecté à arranger pour la production !user
  if (!user) {
    return (
      <View className='flex-1 px-5 bg-slate-50'>
        <Header />
        
        <View className='items-center justify-center flex-1'>
          <Text className='text-lg font-montserrat-semibold text-sky-950'>Vous devez vous connecter !</Text>
          <Pressable onPress={() => router.back()}>
            <Text className='px-4 py-2 mt-4 text-lg text-white rounded-lg font-montserrat-semibold bg-primary'>Retour</Text>
          </Pressable>
        </View>
      </View>
    )
  };

  return (
    <View className='flex-1 bg-slate-50'>
      <ScrollView className='flex-1 px-5 pb-5'
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing} // Contrôle l'état de l'animation de rafraîchissement
            onRefresh={onRefresh} // Fonction à appeler lors du tirage vers le bas
          />
        }>
            
        {/* Header personnalisé */}
        <Header />

        {/* Barre de recherche */}
        <View className='shadow' style={{
          flexDirection: 'row',
          backgroundColor: '#fff',
          borderRadius: 10,
          alignItems: 'center',
          paddingHorizontal: 16,
          marginBottom: 14,
        }}>
          <TextInput
            className='font-montserrat'
            placeholder="Rechercher un nom..."
            style={{ flex: 1, height: 58 }}
            value={search}
            onChangeText={handleSearch}
          />
          <Search size={24} color="#143A52" />
        </View>

        {/* Mes Notifications */}
        <Text className='font-montserrat-bold' style={{ fontSize: 18, color: '#143A52', marginBottom: 8 }}>
          Agents assignés
        </Text>
        
        {loading ? (
          <ActivityIndicator size={'large'} color={'#0fade8'} />
        ) : (filteredAgent.length > 0 ? (
          filteredAgent.map((agent) => (
            <Pressable key={agent.id} onPress={() => handleagentPress(agent.id)} className='relative px-4 py-3 mb-2 bg-white rounded-3xl'>            
              <View className='flex-row items-center'>
                <View className='flex-row items-center justify-center w-20 h-20 mr-4 overflow-hidden rounded-full bg-sky-50'>
                  {agent?.user?.avatar ? <Image source={{ uri: baseUrl + agent?.user?.avatar }} className='w-full h-full rounded-full' />: <User size={44} color="#bae6fd" />}
                </View>
                
                <View>
                  <Text className='font-montserrat-bold' style={{ fontSize: 16, color: '#143A52', lineHeight: 15 }}>
                    {agent.user?.name}
                  </Text>
                  <Text className='text-base text-gray-500 font-montserrat-medium' style={{ lineHeight: 16 }}>
                    {agent.type}
                  </Text>
                  <Text style={{ lineHeight: 15 }} className='text-gray-400 font-montserrat'>Depuis le {formatDate(agent?.recommended_at as string)}</Text>
                </View>
              </View>
            </Pressable>
          ))
        ) : (
          <Text className='mt-40 text-lg text-center text-gray-400 font-montserrat-medium'>
            Aucun agent trouvée !.
          </Text>
        ))}
        
      </ScrollView>
    </View>
  );
}