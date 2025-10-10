  import React from 'react';
  import { View, Text, ScrollView, Pressable, Image, Platform, KeyboardAvoidingView } from 'react-native';
  import { router, useRouter } from 'expo-router';
  import { ServicesApi } from '../../services/api';
  import type { Service } from '../../types';
  import { useMenu } from '../../contexts/MenuContext';
import { TextInput } from 'react-native';

  export default function ProfileScreen() {
    const router = useRouter();
    const { toggleMenu } = useMenu();
    const [services, setServices] = React.useState<Service[]>([]);
    const [page, setPage] = React.useState<'login' | 'register'>('login');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    React.useEffect(() => {
      (async () => {
        try {
          const list = await ServicesApi.list();
          setServices(list);
        } catch (e) {
          // noop (mode mock géré côté API)
        }
      })();
    }, []);

    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} className="flex-1 bg-slate-50">
        <View className="flex-1 bg-slate-50 flex-row items-center justify-center">
          <ScrollView className="flex-1">
          
            <View className="mx-8 items-center">
              <Image source={require('../../assets/logo.png')} style={{ width: 90, height: 72 }} />
            </View>

            <View className='mt-8 mx-5 items-center'>
              <View>

                <Text className='font-montserrat-medium text-lg text-gray-600'>Connectez-vous pour accéder à votre compte</Text>

                <View className='mt-8'>
                  <TextInput
                    placeholder="Email ou numero de téléphone"
                    value={email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoFocus
                    placeholderTextColor="#cbd5e1"
                    onChangeText={setEmail}
                    className="mt-2 focus:border-primary border shadow shadow-gray-100 border-gray-100 bg-white rounded-lg px-4 py-5 font-montserrat-medium"
                  />  
                </View>

                <View className='mt-4'>
                  <TextInput
                    placeholder="Mot de passe"
                    value={password}
                    secureTextEntry
                    autoCapitalize="none"
                    placeholderTextColor="#cbd5e1"
                    onChangeText={setPassword}
                    className="mt-2 focus:border-primary border shadow shadow-gray-100 border-gray-100 bg-white rounded-lg px-4 py-5 font-montserrat-medium"
                  />  
                </View>

                <View className='mt-8 flex-row justify-end'>
                  <Pressable onPress={() => router.push('/auth/forgot-password')}>
                    <Text className='font-montserrat-medium text-sky-700'>Mot de passe oublie</Text> 
                  </Pressable>
                </View>

                <Pressable className='mt-8 bg-sky-500 rounded-2xl px-4 py-5'>
                  <Text className='font-montserrat-bold text-white text-center'>SE CONNECTER</Text>
                </Pressable>
                </View>
            </View>

            <View className="mt-16 py-2 mx-6 flex-row items-center justify-between gap-2">
              <Pressable style={{ width: '50%' }} onPress={() => router.replace("/login")} className={`rounded-xl py-4 px-8 bg-white shadow`} >
                <Text className={`font-montserrat-semibold text-center text-sky-500`}>SE CONNECTER</Text>
              </Pressable>
              
              <Pressable style={{ width: '50%' }} onPress={() => router.replace("/register")} className={`rounded-xl py-4 px-8 bg-slate-200`} >
                <Text className={`font-montserrat-semibold text-center text-sky-900`}>S'INSCRIRE</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    );
  }
