//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, Image, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { baseUrl, ServicesApi } from '../../../services/api';
import { Reservation } from 'types';
import { ArrowLeft, BadgeCheck, Calendar, Clock, Trash2, User } from 'lucide-react-native';
import { formatDate } from 'utils/formatters';
import { useNotification } from 'contexts/NotificationContext';
import { Dialog } from 'react-native-paper';

// create a component
export default function DetailsScreen () {
const [reservation, setReservation] = useState<Reservation | null>(null);
const [loading, setLoading] = useState(false);
const [refresh, setRefresh] = useState(false);
const [showDialog, setShowDialog] = useState(false);
const { showNotification } = useNotification();

const { id } = useLocalSearchParams();

useEffect(() => {
  (async () => {
    try {
      setLoading(true);
      
      const data = await ServicesApi.getReservationById(id as string);
      setReservation(data);
      
    } catch (e) {
      showNotification('Erreur lors du chargement des réservations', 'error');
    } finally {
      setLoading(false);
    }
  })();
}, [id]);

if (!reservation && !loading) {
  return (
    <View className='items-center justify-center flex-1 bg-slate-50'>
      <Text className='text-lg text-black font-montserrat-medium'>Réservation non trouvée !</Text>
      <Pressable
        className="px-6 py-3 mt-5 rounded-xl bg-primary"
        onPress={() => router.push('/reservation')}
        >
        <Text className="text-base text-white font-montserrat-medium">Retour</Text>
      </Pressable>
    </View>
  )
}

const handleCancel = async () => {
  setRefresh(true);
  try {
    await ServicesApi.cancelReservation(reservation?.id as string);
    showNotification('Réservation annulée avec succès', 'success');
    router.push('/reservation');
  } catch (e: any) {
    showNotification(e.details.message ?? 'Erreur lors de l\'annulation de la réservation', 'error');
  }
  setRefresh(false);
}

const handleRemove = async () => {
  try {
    setRefresh(true);
    await ServicesApi.removeReservation(reservation?.id as string);
    showNotification('Réservation supprimée avec succès', 'success');
    router.push('/reservation');
  } catch (e: any) {
    showNotification(e.details.message ?? 'Erreur lors de la suppression de la réservation', 'error');
  }
  setRefresh(false);
}

const hideDialog = () => setShowDialog(false);

return (
  <View className='flex-1 bg-slate-50'>
    <View className='flex-1 mt-10'>
      
      <View className="flex-row items-center justify-between px-5">
        <Pressable
          className="items-center justify-center w-16 h-16 bg-white rounded-full "
          onPress={() => router.push('/reservation')}
          >
          <ArrowLeft color="#143A52" size={24} />
        </Pressable>

        <View className="flex-row items-center justify-center mr-5">
          <Text className="text-xl text-black font-montserrat-bold">Réservation</Text>
        </View>
      </View>

      <View className="flex-1 p-5 mt-5 bg-white rounded-lg shadow-2xl">

        {loading && (
          <View className='items-center justify-center flex-1'>
            <ActivityIndicator size="large" color="#38bdf8" />
          </View>
        )}
        
        {!loading && <ScrollView className='flex-1 pb-5'>
          <View className='flex-row items-center self-center justify-center w-24 h-24 mr-4 overflow-hidden rounded-full bg-sky-50'>
            {reservation?.agent?.user?.avatar ? <Image source={{ uri: baseUrl + reservation?.agent?.user?.avatar }} className='w-full h-full rounded-full' />:
            <User size={44} color="#bae6fd" />
            }
          </View>

          {reservation?.agent?.is_badges && (<View className='self-center bottom-6 left-6'>
            <BadgeCheck size={28} color="white" fill={'#38bdf8'} />
          </View>)}
          
          <Text className="text-lg text-center text-black font-montserrat-semibold bottom-6">{reservation?.agent?.user?.name}</Text>
          
          <View className='mb-6'>
            <Text className="text-base text-gray-500 font-montserrat">Envoyé le {formatDate(reservation?.created_at as string)}</Text>
            <Text className="text-lg text-black font-montserrat-semibold">{reservation?.service?.nom}</Text>
            <Text className="text-base text-gray-500 font-montserrat">{reservation?.service?.description}</Text>
          </View>
          
          <View className='flex-row items-center justify-between gap-2 mb-6'>
            <View className='items-center'>
              <Calendar size={24} color="#999" />
              <Text className="text-base text-gray-600 font-montserrat">{formatDate(reservation?.created_at as string)}</Text>
            </View>
            
            <View className='items-center'>
              <Clock size={24} color="#999" />
              <Text className="text-base text-gray-600 font-montserrat">{reservation?.duree} {reservation?.frequence}</Text>
            </View>
            
            <View className='items-center'>
              {/* < size={24} color="#999" /> */}
              <Text className="text-base text-gray-600 font-montserrat-semibold">Urgence?</Text>
              <Text className="text-base text-gray-600 font-montserrat">{!reservation?.urgence ? 'Non' : 'Oui'}</Text>
            </View>
          </View>
          
          <View className='mb-6'>
            <Text className="mt-3 text-base text-gray-600 font-montserrat-semibold">Transport inclus : 
              <Text className="text-base text-gray-600 font-montserrat"> {!reservation?.transport_inclus ? 'Non' : 'Oui'}</Text>
            </Text>

            <Text className="mt-3 text-base text-gray-600 font-montserrat-semibold">Numéro de personne : 
              <Text className="text-base text-gray-600 font-montserrat"> {reservation?.nombre_personnes}</Text>
            </Text>
            
            <Text className="mt-3 text-base text-gray-600 font-montserrat-semibold">Numéro de contact : 
              <Text className="text-base text-gray-600 font-montserrat"> {reservation?.phone}</Text>
            </Text>

            <Text className="mt-3 text-base text-gray-600 font-montserrat-semibold">Condition particulière : 
              <Text className="text-base text-gray-600 font-montserrat"> {reservation?.conditions_particulieres ? reservation?.conditions_particulieres : 'Aucune'}</Text>
            </Text>

            <Text className="mt-3 text-base text-gray-600 font-montserrat-semibold">Tâches supplémentaires</Text>
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
            <TouchableOpacity disabled={refresh} onPress={() => setShowDialog(true)} className='w-full py-5 border border-red-200 bg-red-400/20 rounded-xl'>
              {refresh ? <ActivityIndicator size={'small'} color={'orange'} /> : <Text className="text-base text-center text-red-400 font-montserrat-semibold">Annuler la réservation</Text>}
            </TouchableOpacity>
            }
            {reservation?.statut.toLocaleLowerCase() === 'annulée' && 
            <TouchableOpacity disabled={refresh} onPress={() => setShowDialog(true)} className='flex-row items-center justify-center w-full py-5 border border-red-200 bg-red-400/20 rounded-xl'>
              <Trash2 size={24} color="#f87171" />
              {refresh ? <ActivityIndicator size={'small'} color={'red'} /> : <Text className="text-base text-center text-red-400 font-montserrat-semibold">Supprimer la réservation</Text>}
            </TouchableOpacity>}
          </View>
        </ScrollView>}
      </View>

      <Dialog visible={showDialog} onDismiss={hideDialog}>
        <Dialog.Title style={{ textAlign: 'center', fontSize: 18, fontFamily: 'font-montserrat-bold' }}>Confirmation</Dialog.Title>
        <Dialog.Content>
          <Text className="text-base text-center text-gray-600 font-montserrat-medium">Voulez-vous vraiment {reservation?.statut.toLocaleLowerCase() === 'annulée' ? 'supprimer' : 'annuler'} cette reservation ?</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Dialog.Actions>
            <Pressable  onPress={hideDialog}>
              <Text className="text-base text-center text-gray-600 font-montserrat-semibold">Annuler</Text>
            </Pressable>
          </Dialog.Actions>
          <Dialog.Actions>
            <Pressable  onPress={() => { 
                reservation?.statut.toLocaleLowerCase() === 'annulée' ? handleRemove() : handleCancel();
                hideDialog();
              }}>
              <Text className="text-base text-center text-red-400 font-montserrat-semibold">Confirmer</Text>
            </Pressable>
          </Dialog.Actions>
        </Dialog.Actions>
      </Dialog>

    </View>
  </View>
);
};
