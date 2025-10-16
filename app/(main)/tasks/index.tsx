import React from 'react';
import { View, Text, Image, TextInput, FlatList, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { TaskApi } from '../../../services/api';
import type { Agent } from '../../../types';
import { Search } from 'lucide-react-native';
import Header from 'components/Header';
import { useAuth } from 'contexts/AuthContext';
import { ActivityIndicator } from 'react-native-paper';
import { formatDate } from 'utils/formatters';

export default function recommendedScreen() {
  const { user, profile } = useAuth();
  const [agents, setAgent] = React.useState<Agent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filteredAgent, setFilteredAgent] = React.useState<Agent[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        let list: Agent[] = [];

        // A effacer lors de l'implémentation de l'API
        list = await TaskApi.getAgentRecommendedByClient('u_client_pers_1');
        setFilteredAgent(list);
        
        // ✅ Vérifie le rôle du profil connecté
        if (profile) {
          list = await TaskApi.getAgentRecommendedByClient(profile?.id);
          setFilteredAgent(agents);
        }

        setAgent(list);
      } catch (e) {
        console.error('Erreur lors du chargement des agents :', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

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
  if (user) {
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
      <ScrollView className='flex-1 px-5 pb-5'>
            
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
                  {agent?.user?.avatar ? <Image source={{ uri: agent?.user?.avatar }} className='w-full h-full rounded-full' />:
                  // <User size={44} color="#bae6fd" />
                  <Image source={require('../../../assets/items/baby.jpg')} className='w-full h-full rounded-full' />
                  }
                </View>
                
                <View>
                  <Text className='font-montserrat-bold' style={{ fontSize: 16, color: '#143A52', lineHeight: 15 }}>
                    {agent.user?.name}
                  </Text>
                  <Text className='text-base text-gray-500 font-montserrat-medium' style={{ lineHeight: 16 }}>
                    {agent.type}
                  </Text>
                  <Text style={{ lineHeight: 15 }} className='text-gray-400 font-montserrat'>Assigné depuis le {formatDate(agent?.recommended_at as string)}</Text>
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