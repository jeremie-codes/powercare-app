import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Platform, TouchableOpacity,  } from 'react-native';
import { useRouter } from 'expo-router';
import { TextInput, KeyboardAvoidingView } from 'react-native';
import { useNotification } from 'contexts/NotificationContext';
import { UserCreate } from 'types';
import { ActivityIndicator } from 'react-native-paper';
import { useAuth } from 'contexts/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [type, setType] = React.useState<'particulier' | 'entreprise'>('particulier');
  const [password, setPassword] = React.useState('');
  const [entreprise_nom, setEntrepriseNom] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const { register, loading } = useAuth();
  const { showNotification } = useNotification();
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleRegister = async () => {
    // Tous le champs doivent avoir une valeur
    if (name === '' || phone === '') {
      showNotification('Tous les champs doivent avoir une valeur', 'error')
      return
    }

    if (email !== '' && !validateEmail(email)) {
      showNotification('Format d\'email invalide', 'error');
      return;
    }
    
    if (type === 'entreprise' && entreprise_nom === '') {
      showNotification("Le nom de votre entreprise doit avoir une valeur", 'error')
      return
    }
    
    try {
      
      const data: UserCreate = {
        name,
        email,
        phone,
        type,
        entreprise_nom,
        password
      }
      
      const { success, message } = await register(data)

      if (success) {
        router.push('/home');
      }
      
      showNotification(message ?? 'Utilisateur créé avec succès', 'success')

    } catch (error: any) {
      console.log(error);
      showNotification(error.details.message ?? 'Une erreur est survenue', 'error')
    }
  
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} className="flex-1 bg-slate-100">
      <View className="flex-1 pt-16 bg-slate-50">
        <ScrollView className="flex-1 pb-12 " showsVerticalScrollIndicator={false}>
        
          <View className="items-center mx-8">
            <Image source={require('../../assets/logo.png')} style={{ width: 90, height: 72 }} />
          </View>

          <View className='items-center mx-5 mt-8'>
            <View>

              <Text className='text-lg text-gray-600 font-montserrat-medium'>Inscrivez-vous pour accéder à votre compte</Text>

              <View className='mt-2'>
                <TextInput
                  placeholder="Nom"
                  value={name}
                  autoCapitalize="none"
                  placeholderTextColor="#cbd5e1"
                  onChangeText={setName}
                  className="px-4 py-5 mt-2 bg-white border border-gray-100 rounded-lg shadow focus:border-primary shadow-gray-100 font-montserrat-medium"
                />  
              </View>

              <View className='mt-2'>
                <TextInput
                  placeholder="Email"
                  value={email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#cbd5e1"
                  onChangeText={setEmail}
                  className="px-4 py-5 mt-2 bg-white border border-gray-100 rounded-lg shadow focus:border-primary shadow-gray-100 font-montserrat-medium"
                />  
              </View>

              <View className='mt-2'>
                <TextInput
                  placeholder="Numero de téléphone"
                  value={phone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  placeholderTextColor="#cbd5e1"
                  onChangeText={setPhone}
                  className="px-4 py-5 mt-2 bg-white border border-gray-100 rounded-lg shadow focus:border-primary shadow-gray-100 font-montserrat-medium"
                />  
              </View>

              <View className='flex-row items-center justify-start gap-4 mt-3'>
                <TouchableOpacity onPress={() => setType('particulier')} className={`border px-4 py-3 rounded-md ${type === 'particulier' ? 'border-primary bg-white' : 'border-gray-200'}`}>
                  <Text className={`text-base font-montserrat-medium  ${type === 'particulier' ? 'text-primary' : 'text-gray-400'}`}>Particulier</Text>
                </TouchableOpacity>
                  
                <TouchableOpacity onPress={() => setType('entreprise')} className={`border px-4 py-3 rounded-md ${type === 'entreprise' ? 'border-primary bg-white' : 'border-gray-200'}`}>
                  <Text className={`text-base font-montserrat-medium  ${type === 'entreprise' ? 'text-primary' : 'text-gray-400'}`}>Entreprise</Text>
                </TouchableOpacity>  
              </View>

              {type === 'entreprise' &&  <TextInput
                className="px-4 py-5 mt-3 bg-white border border-gray-100 rounded-lg shadow focus:border-primary shadow-gray-100 font-montserrat-medium"
                placeholder="Nom de l'entreprise"
                value={entreprise_nom}
                onChangeText={setEntrepriseNom}
              />}

              <View className='mt-2'>
                <TextInput
                  placeholder="Mot de passe"
                  value={password}
                  autoCapitalize="none"
                  secureTextEntry
                  onChangeText={setPassword}
                  placeholderTextColor="#cbd5e1"
                  className="px-4 py-5 mt-2 bg-white border border-gray-100 rounded-lg shadow focus:border-primary shadow-gray-100 font-montserrat-medium"/>  
              </View>

              <View className='mt-2'>
                <TextInput
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  autoCapitalize="none"
                  secureTextEntry
                  onChangeText={setConfirmPassword}
                  placeholderTextColor="#cbd5e1"
                  className="px-4 py-5 mt-2 bg-white border border-gray-100 rounded-lg shadow focus:border-primary shadow-gray-100 font-montserrat-medium"
                />  
              </View>

              <Pressable className='px-4 py-5 mt-8 rounded-lg bg-sky-500' disabled={loading} onPress={handleRegister}>
                {loading && <ActivityIndicator size="small" color="#fff" />}
                {!loading && <Text className='text-center text-white font-montserrat-bold'>CREER MON COMPTE</Text>}
              </Pressable>
            </View>
          </View>

          <View className="flex-row items-center justify-between gap-2 pb-12 mx-6 mt-6">
            <Pressable style={{ width: '50%' }} onPress={() => router.replace("/login")} className={`rounded-xl py-4 px-8 bg-slate-200`} >
              <Text className={`font-montserrat-semibold text-center text-sky-900`}>SE CONNECTER</Text>
            </Pressable>
            
            <Pressable style={{ width: '50%' }} onPress={() => router.replace("/register")} className={`rounded-xl py-4 px-8 bg-white shadow`} >
              <Text className={`font-montserrat-semibold text-center text-sky-500`}>S'INSCRIRE</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
