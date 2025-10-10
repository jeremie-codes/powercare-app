import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Pressable, ScrollView, TextInput, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ServicesApi } from '../../../services/api';
import { User, ArrowLeft, Star, BadgeCheck, Check, X } from 'lucide-react-native';
import { Agent, Pricing, Service, Tache } from 'types';
import { useAuth } from 'contexts/AuthContext';
import { useNotification } from 'contexts/NotificationContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function AgentDetailScreen() {
  const { id, service } = useLocalSearchParams();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent>();
  const [mode, setMode] = useState<'Apperçu' | 'Tâches' | 'Pricing' | 'Réservation'>('Réservation');
  const [serviceParsed, setServiceParsed] = useState<Service>();
  const [task, setTask] = useState<Tache[]>([]);
  const [pricings, setPricings] = useState<Pricing[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<string>('');
  const [adresse, setAdresse] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    (async () => {
      const a = await ServicesApi.getAgentById(id as string);
      const s = JSON.parse(service as string)
      setServiceParsed(s);
      setPricings(s.pricings);
      setTask(s.taches);
      setAgent(a);
    })();
  }, [id]);

  if (!agent) return null;

  const handleReservation = () => {
    if (!user) {
      showNotification('Veuillez vous connecter pour effectuer une réservation'); 
      return;
    }
    
    router.push({
      pathname: '/reservation',
      params: {
        id: agent.id,
        service: service,
      },
    });
  };
  
  const handleConfirm = (date: any) => {
    setSelectedDate(date.toLocaleDateString());
    hideDatePicker();
  };
  
  return (
    <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false}>
      {/* Card agent */}
      {mode !== 'Réservation' && 
      <View className="flex-1">
         <View className="px-2 pt-2 overflow-hidden">
          <View className="relative w-full h-[500px] rounded-t-[40px] overflow-hidden">
            <Pressable
              className="absolute z-10 items-center justify-center w-16 h-16 bg-white rounded-full top-6 left-6"
              onPress={() => router.back()}
            >
              <ArrowLeft color="#143A52" size={24} />
            </Pressable>
            
            <Image
              source={agent?.user?.avatar ? { uri: agent.user.avatar } : require('../../../assets/items/baby.jpg')}
              className="absolute object-contain w-full h-full -bottom-0"
            />
            
            <View className="absolute flex-col items-center justify-center py-2 mx-4 rounded-full bottom-8 bg-white/80" style={{ minWidth: 170 }}>
              <Text className="text-lg font-montserrat-bold text-[#143A52]">{agent?.user?.name}</Text>
              <View className='flex-row items-center justify-center'>
                <Text className="font-montserrat-medium text-[#143A52]">{agent.type}</Text>
                {agent.is_badges && (<BadgeCheck size={24} color="white" fill={'#38bdf8'} />)}
              </View>
            </View>
          </View>
        </View>

        {/* Modes */}
        <View className="-top-5 bg-white min-h-[350px] rounded-[40px] " >
          {mode !== 'Pricing' && <View className="flex-row justify-center mt-6 mb-2">
            <Pressable
              className={`px-6 py-2 rounded-2xl bg-white ${mode === 'Apperçu' ? 'border-2 border-primary' : 'border border-gray-200'} mx-2`}
              onPress={() => setMode('Apperçu')}
            >
              <Text className={`font-montserrat-semibold text-lg ${mode === 'Apperçu' ? 'text-primary' : 'text-[#143A52]'}`}>Apperçu</Text>
            </Pressable>
            
            <Pressable
              className={`px-6 py-2 rounded-2xl bg-white ${mode === 'Tâches' ? 'border-2 border-primary' : 'border border-gray-200'} mx-2`}
              onPress={() => setMode('Tâches')}
            >
              <Text className={`font-montserrat-semibold text-lg ${mode === 'Tâches' ? 'text-primary' : 'text-[#143A52]'}`}>Tâches</Text>
            </Pressable>
        </View>}
          
          {/* Apperçu */}
          {mode === 'Apperçu' && <View className="mx-6 mt-4">
            <Text className="font-montserrat-bold text-lg text-[#143A52] mb-2">A Propos de {agent?.user?.name}</Text>
            <Text className="font-montserrat-medium text-base text-[#143A52] mb-4">{agent.disponibilite}</Text>
            <Text className="font-montserrat-medium text-base text-[#143A52] mb-4">{serviceParsed?.description}</Text>
            
            <View className="flex-row mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} color="orange" fill={i <= agent.rating - 1 ? 'orange' : 'transparent'} />
              ))}
            </View>
            
            <TouchableOpacity className="items-center py-6 mt-2 mb-16 bg-primary rounded-2xl"
              onPress={() => setMode('Pricing')}>
              <Text className="text-lg text-white font-montserrat-semibold">Faire une réservation</Text>
            </TouchableOpacity>
          </View>} 
          
          {/* Tâches */}
          {mode === 'Tâches' && <View className="mx-6 mt-4">
            {/* <Text className="font-montserrat-semibold text-lg text-[#143A52]">Tâches à effectuer</Text> */}
            <Text className="font-montserrat-medium text-base text-[#143A52] mb-4">Vous pouvez redemandez plus des tâches lors de la réservation</Text>
            
            <View className="mb-4 overflow-hidden bg-white border border-gray-100 shadow rounded-xl">
              <View className='flex-row items-center justify-center bg-gray-200'>
                <Text className="font-montserrat-semibold text-base text-[#143A52] px-4 py-3">Tâches à effectuer</Text>
              </View>
              {task.map((t, i) => (
                <View className="flex-row items-center gap-4 px-4 py-3 border-b border-gray-200" key={i}>
                  <View>
                    <Text className="ml-1 text-base text-gray-600 font-montserrat">{i + 1}</Text>
                  </View>
                  <View>
                    <Text className="ml-1 text-base text-gray-600 font-montserrat-medium">{t.nom}</Text>
                    <Text className="ml-1 text-xs text-gray-500 font-montserrat">{t.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          
          </View>}
          
          {/* Pricing */}
          {mode === 'Pricing' && <View className="mx-6 mt-4">
            <Pressable onPress={() => setMode('Apperçu')}
              className='absolute top-0 left-0 z-10 items-center justify-center w-12 h-12 p-2 bg-gray-100 rounded-full'>
              <X size={20} color="#888" />
            </Pressable>
            
            <View className='mt-5'>
              <Text className="font-montserrat-semibold text-lg text-[#143A52] text-center ">Choisissez votre contrat</Text>
              <Text className="font-montserrat-medium text-base text-[#143A52] text-center mb-4 ">
                Ce tarif est le salaire que vous payerez à la fin de chaque période de votre contrat.
              </Text>
            </View>

            <View className=''>
              {pricings.map((p, i) => (
                <TouchableOpacity onPress={() => setSelectedPricing(p.id)} key={i} className={`flex-row items-center px-4 py-4 mx-2 mb-2 gap-x-3 rounded-2xl
                  ${selectedPricing === p.id ? 'bg-white border border-primary' : 'bg-gray-100'}`}>
                  
                  <View style={{height: 25,width: 25}} className={`border-2 border-primary rounded-full items-center justify-center 
                    ${selectedPricing === p.id ? 'bg-primary' : ''}`}>
                    <Check size={16} color="#f3f4f6" />
                  </View>
                  
                  <View className="flex-1">
                    <View key={i} className="flex-row items-center justify-between">
                      <Text className="text-lg font-montserrat-bold text-sky-900">{p.period}</Text>
                      <Text className="text-base font-montserrat-semibold text-sky-900">{p.amount} {p.currency}</Text>
                    </View>
                    <Text className="text-base text-gray-500 font-montserrat">{p.description}</Text>
                  </View>
                  
                </TouchableOpacity>
              ))}

              <TouchableOpacity className="items-center py-6 mt-2 mb-16 bg-primary rounded-2xl"
                onPress={() => handleReservation()}>
                <Text className="text-lg text-white font-montserrat-semibold">Valider</Text>
              </TouchableOpacity>
            </View>
          </View>}
        </View>
      </View>}
      
      {/* Réservation */}
      {mode === 'Réservation' && (
        <View className="flex-1 px-4 pt-8 bg-slate-50">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <Pressable
              onPress={() => setMode('Apperçu')}
              className="items-center justify-center w-12 h-12 mr-2 bg-white rounded-full"
            >
              <ArrowLeft color="#143A52" size={28} />
            </Pressable>
            <Text className="text-2xl font-montserrat-bold text-[#143A52]">Formulaire De Réservation</Text>
          </View>

          <Button title="Choisir une date" onPress={showDatePicker} />

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />

          {selectedDate && (
            <Text style={{ marginTop: 20 }}>Date choisie : {selectedDate}</Text>
          )}
          

          {/* Sélection période */}
          <Text className="font-montserrat-semibold text-base text-[#143A52] mb-2">Selectionner la date de réservation</Text>
          <View className="flex-row bg-white rounded-full mb-4 p-1 w-[70%] self-center">
            <Pressable
              className={`flex-1 py-2 rounded-full items-center ${selectedPricing === 'jour' ? 'bg-primary' : ''}`}
              onPress={() => setSelectedPricing('jour')}
            >
              <Text className={`font-montserrat-semibold text-base ${selectedPricing === 'jour' ? 'text-white' : 'text-[#143A52]'}`}>Un jour</Text>
            </Pressable>
            <Pressable
              className={`flex-1 py-2 rounded-full items-center ${selectedPricing === 'mois' ? 'bg-primary' : ''}`}
              onPress={() => setSelectedPricing('mois')}
            >
              <Text className={`font-montserrat-semibold text-base ${selectedPricing === 'mois' ? 'text-white' : 'text-[#143A52]'}`}>Un mois</Text>
            </Pressable>
          </View>

          {/* Calendrier (mock) */}
          <View className="bg-[#F2F8FA] rounded-3xl p-4 mb-6">
            <View className="flex-row justify-between mb-2">
              {['L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                <Text key={i} className="font-montserrat-semibold text-[#143A52] text-base text-center flex-1">{d}</Text>
              ))}
            </View>
            {/* Mock jours */}
            <View className="flex-row flex-wrap">
              {[...Array(31)].map((_, i) => (
                <Pressable
                  key={i}
                  className={`w-[13%] h-8 items-center justify-center rounded-full m-1 ${i === 1 ? 'bg-gray-400' : ''}`}
                >
                  <Text className={`font-montserrat-semibold text-[#143A52] text-base ${i === 1 ? 'text-white' : ''}`}>{i + 1}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Sélection temps */}
          <Text className="font-montserrat-semibold text-base text-[#143A52] mb-2">Selectionner le temps</Text>
          <View className="flex-row mb-4">
            <View className="flex-row items-center flex-1 px-4 py-2 mr-2 bg-white rounded-2xl">
              <Text className="font-montserrat-semibold text-base text-[#143A52] mr-2">De</Text>
              <Text className="font-montserrat-semibold text-base text-[#143A52]">07:00</Text>
              <User size={18} color="#143A52" className="ml-2" />
            </View>
            <View className="flex-row items-center flex-1 px-4 py-2 ml-2 bg-white rounded-2xl">
              <Text className="font-montserrat-semibold text-base text-[#143A52] mr-2">À</Text>
              <Text className="font-montserrat-semibold text-base text-[#143A52]">16:00</Text>
              <User size={18} color="#143A52" className="ml-2" />
            </View>
          </View>

          {/* Enfants */}
          <Text className="font-montserrat-semibold text-base text-[#143A52] mb-2">Enfant</Text>
          <View className="flex-row flex-wrap mb-2">
            <View className="flex-row items-center px-4 py-2 mb-2 mr-2 bg-white rounded-full">
              <Text className="font-montserrat-semibold text-[#143A52] mr-2">Mila</Text>
              <Text className="text-[#143A52] text-xs">Fille, 2ans</Text>
              <Pressable className="ml-2">
                <X size={16} color="#143A52" />
              </Pressable>
            </View>
            <View className="flex-row items-center px-4 py-2 mb-2 mr-2 bg-white rounded-full">
              <Text className="font-montserrat-semibold text-[#143A52] mr-2">Maël</Text>
              <Text className="text-[#143A52] text-xs">Garçon, 5ans</Text>
              <Pressable className="ml-2">
                <X size={16} color="#143A52" />
              </Pressable>
            </View>
          </View>
          <Pressable className="flex-row items-center mb-4">
            <Text className="mr-2 text-base text-primary font-montserrat-semibold">+</Text>
            <Text className="text-base font-montserrat-semibold text-primary">Ajouter un autre enfant</Text>
          </Pressable>

          {/* Adresse */}
          <Text className="font-montserrat-semibold text-base text-[#143A52] mb-2">Adresse</Text>
          <TextInput
            className="bg-white rounded-2xl px-4 py-3 font-montserrat-medium text-base text-[#143A52] mb-4"
            placeholder="Adresse"
            value={adresse}
            onChangeText={setAdresse}
          />

          <Text className="font-montserrat-semibold text-base text-[#143A52] mb-2">
            Notes <Text className="text-base text-gray-500">(facultative)</Text>
          </Text>
          <TextInput
            className="bg-white rounded-2xl px-4 py-3 font-montserrat-medium text-base text-[#143A52] mb-8"
            placeholder="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />

          {/* Bouton soumettre */}
          <TouchableOpacity className="items-center py-4 mb-8 bg-primary rounded-2xl">
            <Text className="text-lg text-white font-montserrat-semibold">Soumettre</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}