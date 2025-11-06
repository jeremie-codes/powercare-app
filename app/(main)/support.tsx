import React, { use, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {  AlertCircle, Send, CircleQuestionMark, ChevronLeft } from 'lucide-react-native';
import { useNotification } from 'contexts/NotificationContext';
import { Rapport } from 'types';
import { useAuth } from 'contexts/AuthContext';
import { AideApi } from 'services/api';

export default function AideScreen() {
  const router = useRouter();
  const [type, setType] = useState<'aide' | 'plainte'>('aide');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const handleBack = () => {
    router.back();
  };

  if (!user) {
    return (
      <View className="items-center justify-center flex-1 bg-slate-50">
        <Text className="text-lg font-montserrat-medium text-center text-[#0B2A36]">
          Veuillez vous connecter
        </Text>
        
        <Pressable onPress={() => router.push('/(main)')} className="flex-row items-center justify-center px-6 py-4 mt-4 bg-primary rounded-xl">
          <Text className="text-lg text-white font-montserrat-semibold">Retour</Text>
        </Pressable>
      </View>
    )
  }
  
  const handleSubmit = async () => {
    if (!message.trim()) return showNotification('Veuillez décrire votre problème', 'error');
    // Ici tu peux envoyer la requête à ton API :
    
    const data: Rapport = {
      user_id: user.id,
      type,
      description: message,
    } 
    
    try {
      setLoading(true);
      await AideApi.create(data);
      showNotification('Votre requête a été envoyée avec succès !', 'success');
      setMessage('');
    } catch (error) {
      showNotification('Une erreur est survenue', 'error');
    } finally {
      setLoading(false);
    }

  };

  return (
    <View className="flex-1 pt-10 bg-slate-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-6 pb-4">

        <View className='flex-row items-center justify-between mb-8'>
          <Pressable onPress={handleBack} className="flex-row items-center justify-center p-4 bg-white rounded-full">
            <ChevronLeft color="#0B2A36" size={24} />
          </Pressable>
          
          <Text className="text-2xl font-montserrat-bold text-center text-[#0B2A36]">
            Aide & Plaintes
          </Text>
        </View>

        {/* Choix du type */}
        <View className="flex-row justify-center gap-3 mb-8">
          <Pressable
            onPress={() => setType('aide')}
            className={`flex-row items-center gap-2 px-6 py-3 rounded-2xl shadow ${
              type === 'aide' ? 'bg-primary' : 'bg-white border border-gray-200'
            }`}
          >
            <CircleQuestionMark color={type === 'aide' ? '#fff' : '#b91c1c'} />
            <Text
              className={`font-montserrat-semibold ${
                type === 'aide' ? 'text-white' : 'text-[#0B2A36]'
              }`}
            >
              Aide
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setType('plainte')}
            className={`flex-row items-center gap-2 px-6 py-3 rounded-2xl shadow ${
              type === 'plainte' ? 'bg-primary' : 'bg-white border border-gray-200'
            }`}
          >
            <AlertCircle color={type === 'plainte' ? '#fff' : '#b91c1c'} />
            <Text
              className={`font-montserrat-semibold ${
                type === 'plainte' ? 'text-white' : 'text-[#0B2A36]'
              }`}
            >
              Plainte
            </Text>
          </Pressable>
        </View>

        {/* Champ de message */}
        <View className="mb-6">
          <Text className="mb-2 text-gray-600 font-montserrat-medium">
            Décrivez votre problème ou votre demande :
          </Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholder="Décrivez ici votre situation..."
            placeholderTextColor="#94a3b8"
            className="bg-white rounded-2xl p-4 shadow border h-24 border-gray-100 font-montserrat-medium text-[#0B2A36]"
          />
        </View>

        {/* Bouton d'envoi */}
        <Pressable
          onPress={handleSubmit} {...loading && { disabled: true }}
          className="flex-row items-center justify-center gap-2 py-5 shadow bg-primary rounded-2xl"
        >
          {!loading && <Send color="#fff" size={20} />}
          {loading && <ActivityIndicator color="#fff" size={20} />}
          <Text className="text-lg text-white font-montserrat-bold">
            {loading ? 'En cours...' : 'Envoyer'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
