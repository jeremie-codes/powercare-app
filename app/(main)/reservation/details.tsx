//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ServicesApi } from '../../../services/api';
import { Reservation } from 'types';
import { ArrowLeft, BadgeCheck, Calendar, Clock, Trash2 } from 'lucide-react-native';
import { formatDate } from 'utils/formatters';

// create a component
export default function DetailsScreen () {
const [reservation, setReservation] = useState<Reservation | null>(null);
const [loading, setLoading] = useState(true);

const { id } = useLocalSearchParams();

useEffect(() => {
  (async () => {
    try {
      setLoading(true);
      
      const data = await ServicesApi.getReservationById(id as string);
      setReservation(data);
      
    } catch (e) {
      console.error('Erreur lors du chargement des réservations :', e);
    } finally {
      setLoading(false);
    }
  })();
}, [id]);

if (!reservation) {
  return (
    <View className='items-center justify-center flex-1 bg-slate-50'>
      <Text className='text-lg text-black font-montserrat-medium'>Réservation non trouvée !</Text>
      <Pressable
        className="px-6 py-3 mt-5 rounded-xl bg-primary"
        onPress={() => router.back()}
        >
        <Text className="text-base text-white font-montserrat-medium">Retour</Text>
      </Pressable>
    </View>
  )
}

return (
  <View className='flex-1 bg-slate-50'>
    <View className='flex-1 mt-10'>
      
      <View className="flex-row items-center justify-between px-5">
        <Pressable
          className="items-center justify-center w-16 h-16 bg-white rounded-full "
          onPress={() => router.back()}
          >
          <ArrowLeft color="#143A52" size={24} />
        </Pressable>

        <View className="flex-row items-center justify-center mr-5">
          <Text className="text-xl text-black font-montserrat-bold">Réservation</Text>
        </View>
      </View>

      <View className="flex-1 p-5 mt-5 bg-white shadow-lg rounded-[40px]">
        <ScrollView className='flex-1 pb-5'>
          <View className='flex-row items-center self-center justify-center w-24 h-24 mr-4 overflow-hidden rounded-full bg-sky-50'>
            {reservation?.agent?.user?.avatar ? <Image source={{ uri: reservation?.agent?.user?.avatar }} className='w-full h-full rounded-full' />:
            // <User size={44} color="#bae6fd" />
            <Image source={require('../../../assets/items/baby.jpg')} className='w-full h-full rounded-full' />
            }
          </View>

          {reservation?.agent?.is_badges && (<View className='self-center bottom-6 left-6'>
            <BadgeCheck size={28} color="white" fill={'#38bdf8'} />
          </View>)}
          
          <Text className="text-lg text-center text-black font-montserrat-semibold bottom-6">{reservation?.agent?.user?.name}</Text>
          
          <View className='mb-6'>
            <Text className="text-base text-gray-400 font-montserrat">Envoyé le {formatDate(reservation?.created_at as string)}</Text>
            <Text className="text-lg text-black font-montserrat-semibold">{reservation?.service?.nom}</Text>
            <Text className="text-base text-gray-400 font-montserrat">{reservation?.service?.description}</Text>
          </View>
          
          <View className='flex-row items-center justify-between gap-2 mb-6'>
            <View>
              <Calendar size={24} color="#999" />
              <Text className="text-base text-gray-600 font-montserrat">{formatDate(reservation?.created_at as string)}</Text>
            </View>
            
            <View>
              <Clock size={24} color="#999" />
              <Text className="text-base text-gray-600 font-montserrat">{reservation?.duree} {reservation?.frequence}</Text>
            </View>
            
            <View>
              {/* < size={24} color="#999" /> */}
              <Text className="text-base text-gray-600 font-montserrat">Urgence</Text>
              <Text className="text-base text-gray-600 font-montserrat">{!reservation?.urgence ? 'Non' : 'Oui'}</Text>
            </View>
          </View>
          
          <View className='mb-6'>
            <Text className="text-base text-gray-600 font-montserrat-semibold">Transport inclus : 
              <Text className="text-base text-gray-600 font-montserrat"> {!reservation?.transport_inclus ? 'Non' : 'Oui'}</Text>
            </Text>

            <Text className="text-base text-gray-600 font-montserrat-semibold">Numéro de personne : 
              <Text className="text-base text-gray-600 font-montserrat"> {reservation?.nombre_personnes}</Text>
            </Text>
            
            <Text className="text-base text-gray-600 font-montserrat-semibold">Numéro de contact : 
              <Text className="text-base text-gray-600 font-montserrat"> {reservation?.phone}</Text>
            </Text>

            <Text className="text-base text-gray-600 font-montserrat-semibold">Condition particulière : 
              <Text className="text-base text-gray-600 font-montserrat"> {reservation?.conditions_particulieres ? reservation?.conditions_particulieres : 'Aucune'}</Text>
            </Text>

            <Text className="mt-2 text-base text-gray-600 font-montserrat-semibold">Tâches supplémentaires</Text>
            <Text className="text-base text-gray-600 font-montserrat">- {reservation?.taches_specifiques ? reservation?.taches_specifiques : 'Aucune'}</Text>
          </View>
          
          <View className='flex-row items-center justify-between mb-6'>
            <View className='flex-row items-center'>
              <Text className="text-base text-gray-600 font-montserrat-semibold">Statut : </Text>
              <Text className={`text-base text-gray-600 font-montserrat ${reservation?.statut.toLocaleLowerCase() === 'en attente' ? 'text-yellow-500' : 
                (reservation?.statut.toLocaleLowerCase() === 'annulée' ? 'text-red-500' : 'text-green-500')}`}>{reservation?.statut}
              </Text>
            </View>
          </View>

          {/** Bouton d'annulation ou suppression*/}
          <View className='items-center justify-center px-6 mt-8'>
            {reservation?.statut.toLocaleLowerCase() === 'en attente' && 
            <TouchableOpacity onPress={()=> {}} className='w-full py-5 border border-red-200 bg-red-400/20 rounded-xl'>
              <Text className="text-base text-center text-red-400 font-montserrat-semibold">Annuler la réservation</Text>
            </TouchableOpacity>
            }
            {reservation?.statut.toLocaleLowerCase() === 'annulée' && 
            <TouchableOpacity onPress={()=> {}} className='flex-row items-center justify-center w-full py-5 border border-red-200 bg-red-400/20 rounded-xl'>
              <Trash2 size={24} color="#f87171" />
              <Text className="text-base text-center text-red-400 font-montserrat-semibold">Supprimer la réservation</Text>
            </TouchableOpacity>}
          </View>
        </ScrollView>
      </View>

    </View>
  </View>
);
};
