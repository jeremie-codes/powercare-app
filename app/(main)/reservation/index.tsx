import React, { useState } from 'react';
import { View, Text, Image, RefreshControl, Pressable, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ServicesApi } from '../../../services/api';
import type { Reservation } from '../../../types';
import Header from 'components/Header';
import { useAuth } from 'contexts/AuthContext';
import { ActivityIndicator } from 'react-native-paper';
import { useNotification } from 'contexts/NotificationContext';
import moment from 'moment';
import 'moment/locale/fr';

export default function ReservationScreen() {
  const { user, profile } = useAuth();
  const [reservations, setReservations] = React.useState<Reservation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filteredReservation, setFilteredReservation] = React.useState<Reservation[]>([]);
  const [statutSelected, setStatutSelected] = React.useState<'Toutes' | 'En attente' | 'Confirmée' | 'Annulée' | 'Terminée' | string>('Toutes');
  const { showNotification } = useNotification();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        
        const { success, message, reservations } = await ServicesApi.getReservations(profile?.id as string);

        if (!success) {
          showNotification(message, 'error');
        }

        setFilteredReservation(reservations);
        setReservations(reservations);
      } catch (e: any) {
        showNotification(e.details.messages ?? 'Erreur lors du chargement des réservations', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const onRefresh = React.useCallback(async() => {
    setIsRefreshing(true);
    try {      
      const { success, message, reservations } = await ServicesApi.getReservations(profile?.id as string);

      if (!success) {
        showNotification(message, 'error');
      }
      
      setFilteredReservation(reservations);
      setReservations(reservations);
    } catch (e: any) {
      showNotification(e.details.messages ?? 'Erreur lors du chargement des réservations', 'error');
    }
    setIsRefreshing(false);
  }, []);

  const handleReservationPress = (id : string) => {    
    router.push({
      pathname: '/reservation/details/',
      params: {
        id: id,
      },
    });
  };

  // 🔍 Fonction de recherche
  const handleSearch = (statut: string) => {
    setStatutSelected(statut);
    if (statut === 'Toutes') {
      setFilteredReservation(reservations);
    } else {
      const filtered = reservations.filter(r =>
        r.statut.toLowerCase().includes(statut.toLowerCase())
      );
      setFilteredReservation(filtered);
    }
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

        {/* Filtre par statut */}
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className='flex-row mt-2 mb-4'>
          {['Toutes', 'En attente', 'Confirmée', 'Annulée', 'Terminée'].map((statut, index) => (
            <Pressable key={index} onPress={() => handleSearch(statut)} className={`px-4 py-3 mr-2 rounded-full ${statut === statutSelected ? 'bg-primary' : 'bg-white border border-gray-100'}`}> 
              <Text className={`font-montserrat-semibold ${statut === statutSelected ? 'text-white' : 'text-gray-500'}`}>
                {statut}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Mes Réservations */}
        <Text className='font-montserrat-bold' style={{ fontSize: 18, color: '#143A52', marginBottom: 16 }}>
          Mes Réservations
        </Text>
        
        {loading ? (
          <ActivityIndicator size={'large'} color={'#0fade8'} />
        ) : (filteredReservation.length > 0 ? (
          filteredReservation.map((reservation) => (
            <Pressable key={reservation.id} onPress={() => handleReservationPress(reservation.id)} className='relative flex-row mb-3 overflow-hidden bg-white rounded-xl'>
              <View className={`w-2 h-full mr-4 ${reservation?.statut === 'confirmée' || reservation?.statut === 'terminée' ? 'bg-green-400' : (reservation?.statut === 'annulée' ? 'bg-red-400' : 'bg-yellow-400')}`}/>
              
              <View className='flex-1 px-4 py-4'>
                <View className='absolute items-end self-end w-full right-2 top-2'>
                  <View className={`rounded-full px-2 ${reservation?.statut === 'confirmée' ? 'bg-green-400/20' : (reservation?.statut === 'annulée' ? 'bg-red-400/20' : 'bg-yellow-400/20')}`} style={{ padding: 5 }}>
                    <Text className={`text-sm font-montserrat ${reservation?.statut === 'confirmée' ? 'text-green-600' : (reservation?.statut === 'annulée' ? 'text-red-600' : 'text-yellow-600')}`}>{reservation.statut}</Text>
                  </View>
                </View>
                
                <View className='flex-row items-center'>
                  <View>
                    <Text className='font-montserrat-bold' style={{ fontSize: 16, color: '#143A52' }}>
                      {reservation.service?.nom}
                    </Text>
                    <Text className='font-montserrat-medium' style={{ fontSize: 14, color: '#143A52' }}>
                      {reservation.agent?.user?.name}
                    </Text>
                    <Text className='text-gray-400 font-montserrat'>{moment(reservation.created_at).fromNow()}</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ))
        ) : (
          <Text className='mt-40 text-lg text-center text-gray-400 font-montserrat-medium'>
            Aucune réservation effectuée !.
          </Text>
        ))}
        
      </ScrollView>
    </View>
  );
}