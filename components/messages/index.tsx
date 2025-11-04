import React from 'react';
import { View, Text, Image, TextInput, FlatList, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { baseUrl, ChatApi, TaskApi } from '../../services/api';
import type { Agent, Message } from '../../types';
import { Search, Check, Plus, User } from 'lucide-react-native';
import Header from 'components/Header';
import { useAuth } from 'contexts/AuthContext';
import { ActivityIndicator, Dialog } from 'react-native-paper';
import moment from 'moment';
import { useNotification } from 'contexts/NotificationContext';
import { formatDate } from 'utils/formatters';

export default function messageScreen() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [agents, setAgent] = React.useState<Agent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isDialogVisible, setIsDialogVisible] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [filteredMessages, setFilteredMessages] = React.useState<Message[]>([]);
  const [statutSelected, setStatutSelected] = React.useState<'Tous' | 'Lu' | 'Non lu' | string>('Tous');
  const { showNotification } = useNotification();
  
  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        
        if (user) {
          const { success, message, agents } = await TaskApi.getAgentRecommendedByClient(user?.id);
            
          if (!success) {
            showNotification(message, 'error');
          }
            
          setAgent(agents ?? []);
        }

      } catch (e: any) {
        console.error(e.details.message ?? 'Erreur lors du chargement des agents :', e);
        showNotification(e.details.message ?? 'Erreur lors du chargement des agents :', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);
  
  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        
        if (user) {
          const { success, message, inbox} = await ChatApi.getInoxByUserId(user?.id);
          
          if (!success) {
            showNotification(message, 'error');
          }
          
          setFilteredMessages(inbox ?? []);
          setMessages(inbox ?? []);
        }

      } catch (e: any) {
        console.error(e.details.message ?? 'Erreur lors du chargement des messages :', e);
        showNotification(e.details.message ?? 'Erreur lors du chargement des messages :', 'error');
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

  const hideDialog = () => setIsDialogVisible(false);

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

      <Pressable onPress={() => setIsDialogVisible(true)} className='absolute items-center justify-center w-16 h-16 rounded-full bottom-8 right-4 bg-primary'>
        <Plus size={24} color="#fff" />
      </Pressable>

      <Dialog visible={isDialogVisible} onDismiss={hideDialog}>
        <Dialog.Content>
          <Dialog.Title>
            <Text className='font-montserrat-bold' style={{ fontSize: 14, color: '#143A52', marginBottom: 8 }}>
              Agents assignés
            </Text>
          </Dialog.Title>
          <Dialog.Content>
            <View>
              
              {loading ? (
                <ActivityIndicator size={'large'} color={'#0fade8'} />
              ) : (agents.length > 0 ? (
                agents.map((agent) => (
                  <Pressable key={agent.id} onPress={() => handleMessagePress(agent.id)} className='relative px-0 py-3 mb-2 border-b bg-gray rounded-3xl border-b-gray-200'>            
                    <View className='flex-row items-center'>
                      <View className='flex-row items-center justify-center w-12 h-12 mr-4 overflow-hidden rounded-full bg-sky-50'>
                        {agent?.user?.avatar ? <Image source={{ uri: baseUrl + agent?.user?.avatar }} className='w-full h-full rounded-full' />: <User size={44} color="#bae6fd" />}
                      </View>
                      
                      <View>
                        <Text className='text-base font-montserrat-semibold' style={{ color: '#143A52', lineHeight: 15 }}>
                          {agent.user?.name}
                        </Text>
                        <Text className='text-base text-gray-500 font-montserrat-medium' style={{ lineHeight: 16 }}>
                          {agent.type}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))
              ) : (
                <Text className='mt-40 text-base text-center text-gray-400 font-montserrat-medium'>
                  Aucun agent trouvée !.
                </Text>
              ))}
            </View>
          </Dialog.Content>
        </Dialog.Content>
        <Dialog.Actions>
          <Pressable onPress={hideDialog} >
            <Text className='text-lg font-montserrat-medium'>Annuler</Text>
          </Pressable>
        </Dialog.Actions>
      </Dialog>
        
    </View>
  );
}