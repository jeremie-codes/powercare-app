import React from 'react';
import { View, Text, Image, TextInput, FlatList, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ServicesApi } from '../../../services/api';
import type { Agent, Service, Reservation, Message } from '../../../types';
import { User, Search, Star, BadgeCheck, Check } from 'lucide-react-native';
import Header from 'components/Header';
import { useAuth } from 'contexts/AuthContext';
import { ActivityIndicator } from 'react-native-paper';
import moment from 'moment';

export default function messageScreen() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filteredMessages, setFilteredMessages] = React.useState<Message[]>([]);
  const [statutSelected, setStatutSelected] = React.useState<'Tous' | 'Lu' | 'Non lu' | string>('Tous');

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        let list: Message[] = [];

        // A effacer lors de l'implémentation de l'API
        list = await ServicesApi.getMessagesByUserId('u_client_pers_1');
        setFilteredMessages(list);
        
        // ✅ Vérifie le rôle du profil connecté
        if (user) {
          list = await ServicesApi.getMessagesByUserId(user?.id);
          setFilteredMessages(messages);
        }

        setMessages(list);
      } catch (e) {
        console.error('Erreur lors du chargement des messages :', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleMessagePress = (id : string) => {    
    router.push({
      pathname: '/messages/[id]',
      params: {
        id: id,
      },
    });
  };

  // 🔍 Fonction de recherche
  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.trim() === '') {
      setFilteredMessages(messages);
    } else {
      const filtered = messages.filter(m =>
        m.user?.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredMessages(filtered);
    }
  };
  
  // 🔍 Fonction de filtre
  const handleFilter = (text: string) => {
    setStatutSelected(text);
    if (text === 'Tous') {
      setFilteredMessages(messages);
    } else if (text === 'Lu') {
      const filtered = messages.filter(m => m.is_read === true);
      setFilteredMessages(filtered);
    } else if (text === 'Non lu') {
      const filtered = messages.filter(m => m.is_read === false);
      setFilteredMessages(filtered);
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

        {/* Filtre par statut */}
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className='flex-row mt-2 mb-4'>
          {['Tous', 'Lu', 'Non lu'].map((statut, index) => (
            <Pressable key={index} onPress={() => handleFilter(statut)} className={`px-4 py-3 mr-2 rounded-full ${statut === statutSelected ? 'bg-primary' : 'bg-white border border-gray-100'}`}> 
              <Text className={`font-montserrat-semibold ${statut === statutSelected ? 'text-white' : 'text-gray-500'}`}>
                {statut}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Mes Notifications */}
        <Text className='font-montserrat-bold' style={{ fontSize: 18, color: '#143A52', marginBottom: 8 }}>
          Mes Messages
        </Text>
        
        {loading ? (
          <ActivityIndicator size={'large'} color={'#0fade8'} />
        ) : (filteredMessages.length > 0 ? (
          filteredMessages.map((message) => (
            <Pressable key={message.id} onPress={() => handleMessagePress(message.id)} className='relative px-4 py-3 mb-2 bg-white rounded-3xl'>
              <View className='absolute items-end self-end w-full right-2 bottom-2'>
                {message.sender_id != user?.id && <View className={`rounded-full px-2`} style={{ padding: 5 }}>
                  {message.is_read && <Check size={16} color={"#86efac"} />}
                  {message.is_read && <Check size={16} style={{ top: -12, right: -2 }} color={"#86efac"} />}
                  
                  {!message.is_read && <Check size={16} color={'#9ca3af'} />}
                </View>}
              </View>
              
              
              <View className='flex-row items-center'>
                <View className='flex-row items-center justify-center w-20 h-20 mr-4 overflow-hidden rounded-full bg-sky-50'>
                  {message?.user?.avatar ? <Image source={{ uri: message?.user?.avatar }} className='w-full h-full rounded-full' />:
                  // <User size={44} color="#bae6fd" />
                  <Image source={require('../../../assets/items/baby.jpg')} className='w-full h-full rounded-full' />
                  }
                </View>
                
                <View>
                  <Text className='font-montserrat-bold' style={{ fontSize: 16, color: '#143A52', lineHeight: 15 }}>
                    {message.user?.name}
                  </Text>
                  <Text className='text-base text-gray-500 font-montserrat-medium' style={{ lineHeight: 16 }}>
                    {message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '')}
                  </Text>
                  <Text style={{ lineHeight: 15 }} className='text-gray-400 font-montserrat'>{moment(message.created_at).fromNow()}</Text>
                </View>
              </View>
              
              {!message?.is_read && message?.sender_id !== user?.id && (<View className='absolute bottom-4 left-6'>
                <View className='flex-row items-center justify-center w-4 h-4 bg-green-400 rounded-full' />
              </View>)}
            </Pressable>
          ))
        ) : (
          <Text className='mt-40 text-lg text-center text-gray-400 font-montserrat-medium'>
            Aucun message trouvée !.
          </Text>
        ))}
        
      </ScrollView>
    </View>
  );
}