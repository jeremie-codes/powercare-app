import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, KeyboardAvoidingView, Pressable, ScrollView, TextInput, Switch, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { baseUrl, ServicesApi } from '../../../services/api';
import { User, ArrowLeft, Star, BadgeCheck, Check, X, Calendar, Minus, Plus } from 'lucide-react-native';
import { Agent, Service, Tache } from 'types';
import { useAuth } from 'contexts/AuthContext';
import { useNotification } from 'contexts/NotificationContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { ActivityIndicator } from 'react-native-paper';

export default function AgentDetailScreen() {
  const { id, service } = useLocalSearchParams();
  const { user, profile } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent>();
  const [mode, setMode] = useState<'Apperçu' | 'Tâches' | 'Réservation'>('Apperçu');
  const [serviceParsed, setServiceParsed] = useState<Service>();
  const [task, setTask] = useState<Tache[]>([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [step, setStep] = useState(1);
  
  // Start FormData
  const [frequence, setFrequence] = useState<'Heure' | 'Jour' | 'Semaine' | 'Mois' | 'Année' | 'Indefinie' | string>('Heure');
  const [adresse, setAdresse] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [duree, setDuree] = useState(1);
  const [transportInclus, setTransportInclus] = useState(false);
  const [urgence, setUrgence] = useState(false);
  const [person, setPerson] = useState(1);
  const [specifiques, setSpecifiques] = useState('');
  const [tailleLogement, setTailleLogement] = useState('');
  const [condition, setCondition] = useState('');
  const [phone, setPhone] = useState('');
  
  // End FormData
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleNext = () => {
    if (selectedDate == '' || adresse == '') {
      showNotification('Tout les champs sont récquis', 'error')
      return
    }
    setStep(2)
  };

  const handleSubmit = async () => {
    if (serviceParsed?.type_agent == "menager" && tailleLogement == '') return
    if (phone == "" || selectedDate == '' || adresse == '') {
      showNotification('Tout les champs sont récquis', 'error')
      return
    }

    if (!user) {
      showNotification('Veuillez vous connecter', 'error')
      return
    }

    if (!agent) {
      showNotification('Veuillez vous connecter', 'error')
      return
    }

    if (!serviceParsed) {
      showNotification('Veuillez vous connecter', 'error')
      return
    }

    try {
      setIsSubmitting(true)
      const dataForm ={
        client_id: profile?.id as string,
        service_id: serviceParsed?.id,
        agent_id: agent?.id,
        frequence: frequence,
        date_reservation: selectedDate,
        duree: duree.toString(),
        transport_inclus: transportInclus,
        urgence: urgence,
        adresse: adresse,
        nombre_personnes: person,
        taches_specifiques: specifiques,
        taille_logement: tailleLogement,
        conditions_particulieres: condition,
        phone: phone
      }

      const { success, message, reservation } = await ServicesApi.reserver(dataForm);

      if (!success) {
        showNotification(message, 'error')
        return
      }
      
      showNotification('Votre reservation a bien été effectuée', 'success')
      router.push({
        pathname: '/reservation/details/',
        params: {
          id: reservation.id,
        },
      });
      
    } catch (error: any) {
      showNotification(error.details.message ?? 'Réservation non aboutie !', 'error')
    } finally {
      setIsSubmitting(false)
    }

  };
    
  useEffect(() => {
    (async () => {
      setIsRefreshing(true);
      try {
        const a = await ServicesApi.getAgentById(id as string);
        const s = JSON.parse(service as string)
        setServiceParsed(s);
        setTask(s.taches);
        setAgent(a);
      } catch (error) {
        useNotification().showNotification('Erreur de conneixion !', 'error')
      }
      finally {
        setIsRefreshing(false);
      }
    })();
  }, [id]);

  if (isRefreshing) {
    return (     
      <View className='items-center justify-center flex-1'>
        <ActivityIndicator size="large" color="#075985" />
      </View>
    )
  };
  
  if (!agent) {
    return (
      <View className='items-center justify-center flex-1'>
        <Text className='text-lg text-center'>Aucun agent trouvé!</Text>
        <Pressable onPress={() => router.back()} className='p-4 rounded-lg bg-primary'>
          <Text className='text-base text-white'>Retour</Text>
        </Pressable>
      </View>
    )
  };

  const handleReservation = () => {
    if (!user) {
      showNotification('Veuillez vous connecter pour effectuer une réservation', 'error'); 
      return;
    }
    
    setMode('Réservation');
  };
  
  const handleConfirm = (date: any) => {
    const iso = date.toISOString(); // "2025-11-04T12:34:56.000Z"
    setSelectedDate(iso);
    hideDatePicker();
  };
  
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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
                source={agent?.user?.avatar ? { uri: baseUrl + agent.user.avatar } : require('../../../assets/items/baby.jpg')}
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
            <View className="flex-row justify-center mt-6 mb-2">
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
            </View>
            
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
              
              <Pressable className="items-center py-6 mt-2 mb-16 bg-primary rounded-2xl"
                onPress={handleReservation}>
                <Text className="text-lg text-white font-montserrat-semibold">Faire une réservation</Text>
              </Pressable>
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
          </View>
        </View>}
        
        {/* Réservation */}
        {mode === 'Réservation' && (
          <View className="flex-1 px-4 pt-10 bg-slate-50">
            {/* Header */}
            <View>
              <View className="flex-row items-center mb-6">
                <Pressable
                  onPress={() => setMode('Apperçu')}
                  className="flex-row items-center justify-center h-12 px-2 mr-2 bg-white rounded-full"
                >
                  <X color="#888" size={24} />
                  <Text className="text-gray-500 font-montserrat-semibold">Annuler</Text>
                </Pressable>
                <Text className="text-xl font-montserrat-bold text-[#143A52]">Formulaire De Réservation</Text>
              </View>
              
              <View className={`flex-row items-center px-4 py-4 mx-2 mb-6 gap-x-3 rounded-2xl bg-primary`}>
                
                <View className="flex-1">
                  <Text className="text-lg text-white font-montserrat-bold">{serviceParsed?.nom}</Text>
                  <Text className="text-base text-gray-100 font-montserrat-medium">Agent : {agent?.user?.name}</Text>
                </View>
                
                <View style={{height: 25,width: 25}} className={`rounded-full items-center justify-center bg-white`}>
                  <Check size={16} color="#0fade8" />
                </View>
                
              </View>
            </View>

            {/* Formulaire step 1 */}
            {step == 1 && <View className='flex-1'>

              {/* Sélection Fréquence */}
              <Text className="font-montserrat-semibold text-lg text-[#143A52] mb-2 ml-2">Fréquence</Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className='mb-6'>
                {[...Array('Heure', 'Jour', 'Semaine', 'Mois', 'Année', 'Indefinie')].map((p, i) => (
                  <TouchableOpacity onPress={() => setFrequence(p)} key={i} className={`flex-row items-center px-2 py-3 mx-1 gap-x-2 rounded-2xl
                    ${frequence === p ? 'bg-white border border-primary' : 'bg-gray-100'}`}>
                    
                    <View style={{height: 25,width: 25}} className={`border-2 border-primary rounded-full items-center justify-center 
                      ${frequence === p ? 'bg-primary' : ''}`}>
                      <Check size={16} color="#f3f4f6" />
                    </View>
                    
                    <View className="flex-1">
                      <Text className="text-lg font-montserrat-bold text-sky-900">{p}</Text>
                    </View>
                    
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {/* Sélection période */}
              <Text className="font-montserrat-semibold text-lg text-[#143A52] mb-2 ml-2">Date de réservation</Text>

              <Pressable onPress={showDatePicker} className='flex-row items-center gap-4 px-4 py-5 mb-6 bg-white border border-gray-300 rounded-xl'>
                <Calendar size={24} color="#999" />
                <Text className="text-base text-gray-500 font-montserrat">{selectedDate !== '' ? selectedDate : 'Selectionner une date'}</Text>
              </Pressable>
              
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
              />

              {/* Durée */}
              <Text className="font-montserrat-semibold text-lg text-[#143A52] mb-2 ml-2">Durée</Text>

              <View className='flex-row items-center justify-between gap-4 px-4 py-2 mb-6 bg-white border border-gray-300 rounded-xl'>
                <Pressable onPress={() => setDuree(duree == 1 ? 1 : duree - 1)}>
                  <Minus size={24} color="#999" />
                </Pressable>

                <View className='relative flex-row items-center'>
                  <TextInput
                    className="w-2/5 text-base text-center text-gray-500 border border-gray-100 rounded-full font-montserrat"
                    value={duree.toString()}
                    onChangeText={(v) => setDuree(parseInt(v == '' || v == '0' ? '1': v))}
                    keyboardType='numeric'
                  />
                  <Text className="text-base text-gray-500 font-montserrat">{frequence}</Text>
                </View>
                
                <Pressable onPress={() => setDuree(duree + 1)}>
                  <Plus size={24} color="#999" />
                </Pressable>
              </View>

              {/* Transport inclus */}
              <View className="flex-row items-center px-2 mb-2">
                <Text className="font-montserrat-semibold text-base text-[#143A52] flex-1">Transport inclus
                  <Text className="flex-1 mb-2 ml-2 text-sm text-gray-500 font-montserrat"> (si non laisser désactivé)</Text>
                </Text>
                <Switch
                  value={transportInclus}
                  onValueChange={setTransportInclus}
                  trackColor={{ false: "#E5E7EB", true: "#0fade8" }}
                  thumbColor={transportInclus ? "#0fade8" : "#fff"}
                />
              </View>

              {/* Urgence */}
              <View className="flex-row items-center px-2 mb-4">
                <Text className="font-montserrat-semibold text-base text-[#143A52] flex-1">Urgence
                  <Text className="flex-1 mb-2 ml-2 text-sm text-gray-500 font-montserrat"> (si non laisser désactivé)</Text>
                </Text>
                <Switch
                  value={urgence}
                  onValueChange={setUrgence}
                  trackColor={{ false: "#E5E7EB", true: "#0fade8" }}
                  thumbColor={urgence ? "#0fade8" : "#fff"}
                />
              </View>

              {/* Adresse */}
              <Text className="font-montserrat-semibold text-base text-[#143A52] flex-1 ml-2 mb-2">Adresse</Text>
              <TextInput
                className="px-8 py-5 mb-6 text-base text-gray-500 bg-white border border-gray-300 rounded-xl font-montserrat"
                placeholder='Ex: 12, Avenue, kinshasa'
                value={adresse}
                onChangeText={setAdresse}
              />

            </View>}

            {/* Bouton suivant */}
            {step == 1 && <TouchableOpacity onPress={handleNext} className="items-center py-4 mb-8 bg-primary rounded-2xl">
              <Text className="text-lg text-white font-montserrat-semibold">Suivant</Text>
            </TouchableOpacity>}

            {/* Formulaire step 2 */}
            {step == 2 && <View className='flex-1'>
              
              {/* Nombre de personnes */}
              {serviceParsed?.type_agent == 'babysitter' && <Text className="font-montserrat-semibold text-lg text-[#143A52] mb-2 ml-2">Nombre d'enfant à garder</Text>}
            
              {serviceParsed?.type_agent == 'babysitter' && <View className='flex-row items-center justify-between gap-4 px-4 py-2 mb-4 bg-white border border-gray-300 rounded-xl'>
                <Pressable onPress={() => setPerson(person == 1 ? 1 : person - 1)}>
                  <Minus size={24} color="#999" />
                </Pressable>

                <View className='relative flex-row items-center'>
                  <TextInput
                    className="text-base text-center text-gray-500 border border-gray-100 rounded-full font-montserrat"
                    editable={false}
                    value={person.toString()}
                    onChangeText={(v) => setPerson(parseInt(v == '' || v == '0' ? '1': v))}
                    keyboardType='numeric'
                  />
                  <Text className="text-base text-gray-500 font-montserrat">enfant(s)</Text>
                </View>
                
                <Pressable onPress={() => setPerson(person + 1)}>
                  <Plus size={24} color="#999" />
                </Pressable>
              </View>}
              
              {/* Taille de logement */}
              {serviceParsed?.type_agent == 'menager' && <Text className="font-montserrat-semibold text-lg text-[#143A52] mb-2 ml-2">Taille de logement</Text>}
            
              {serviceParsed?.type_agent == 'menager' && <TextInput
                className="px-8 py-5 mb-4 text-base text-gray-500 bg-white border border-gray-300 rounded-xl font-montserrat"
                placeholder='Ex: 10m2, 2 chambres, etc'
                value={tailleLogement}
                onChangeText={setTailleLogement}
                keyboardType='numeric'
              />}

              {/* Phone */}
              <Text className="font-montserrat-semibold text-base text-[#143A52] flex-1 ml-2 mb-2">Numéro de contact</Text>
              <TextInput
                className="px-8 py-5 mb-4 text-base text-gray-500 bg-white border border-gray-300 rounded-xl font-montserrat"
                placeholder='Ex: 12, Avenue, kinshasa'
                value={phone}
                onChangeText={setPhone}
                keyboardType='numeric'
              />

              {/* specifiques */}
              <Text className="font-montserrat-semibold text-base text-[#143A52] flex-1 ml-2">Ajouter d'autre tâche spécifique 
                <Text className='font-montserrat'> (pas obligatoir)</Text></Text>
              <Text className="flex-1 mb-2 ml-2 text-sm text-gray-500 font-montserrat">NB: les tâche ajoutées peuvent être taxées</Text>
              <TextInput
                className="px-8 py-5 mb-6 text-base text-gray-500 bg-white border border-gray-300 rounded-xl font-montserrat"
                placeholder='Ex: Soins, etc.'
                value={specifiques}
                onChangeText={setSpecifiques}
              />

              {/* specifiques */}
              <Text className="font-montserrat-semibold text-base text-[#143A52] flex-1 ml-2 mb-2"> Avez-vous des condition? 
                <Text className='font-montserrat'> (pas obligatoir)</Text></Text>
              <TextInput
                className="px-8 py-5 mb-6 text-base text-gray-500 bg-white border border-gray-300 rounded-xl font-montserrat"
                placeholder='Ex: Soins, etc.'
                value={condition}
                onChangeText={setCondition}
              />

            </View>}

            {/* Bouton soumettre */}
            {step == 2 && <View className='flex-row items-center justify-between'>
              <TouchableOpacity onPress={() => setStep(1)} className="items-center px-8 py-4 mb-8 bg-gray-400 rounded-2xl">
                <Text className="text-lg text-white font-montserrat-semibold">Retour</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting} className="items-center px-8 py-4 mb-8 bg-primary rounded-2xl">
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="text-lg text-white font-montserrat-semibold">Soumettre</Text>}
              </TouchableOpacity>
            </View>}
            
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
  
}