  import React from 'react';
  import { View, Text, ScrollView, Pressable, Image, Platform, KeyboardAvoidingView } from 'react-native';
  import { router, useRouter } from 'expo-router';
  import { TextInput } from 'react-native';
  import { useAuth } from 'contexts/AuthContext';
  import { ActivityIndicator } from 'react-native-paper';
  import { useNotification } from 'contexts/NotificationContext';

  export default function ProfileScreen() {
    const router = useRouter();
    const { signIn, loading } = useAuth();
    const { showNotification } = useNotification();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const handleLogin = async () => {
      if (!email || !password) {
        showNotification('Renseignez tous les champs', 'error')
        return
      }
        
      try {
        const { success, message } = await signIn(email, password);
        if (success) {
          router.push('/home');
        }
        showNotification(message, 'success')
      } catch (e: any) {
        console.log(e);
        showNotification(e.details.message ?? "Une erreur s'est produit!", 'error')
      }
    }

    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} className="flex-1 bg-slate-50">
        <View className="flex-row items-center justify-center flex-1 bg-slate-50">
          <ScrollView className="flex-1">
          
            <View className="items-center mx-8">
              <Image source={require('../../assets/logo.png')} style={{ width: 90, height: 72 }} />
            </View>

            <View className='items-center mx-5 mt-8'>
              <View>

                <Text className='text-lg text-gray-600 font-montserrat-medium'>Connectez-vous pour accéder à votre compte</Text>

                <View className='mt-8'>
                  <TextInput
                    placeholder="Email ou numero de téléphone"
                    value={email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#cbd5e1"
                    onChangeText={setEmail}
                    className="px-4 py-5 mt-2 bg-white border border-gray-100 rounded-lg shadow focus:border-primary shadow-gray-100 font-montserrat-medium"
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
                    className="px-4 py-5 mt-2 bg-white border border-gray-100 rounded-lg shadow focus:border-primary shadow-gray-100 font-montserrat-medium"
                  />  
                </View>

                <View className='flex-row justify-end mt-8'>
                  <Pressable onPress={() => router.push('/auth/forgot-password')}>
                    <Text className='font-montserrat-medium text-sky-700'>Mot de passe oublie</Text> 
                  </Pressable>
                </View>

                <Pressable onPress={handleLogin} className={`px-4 py-5 mt-8 rounded-2xl ${loading? 'bg-sky-300': 'bg-sky-500'}`} disabled={loading}>
                  {!loading && <Text className='text-center text-white font-montserrat-bold'>SE CONNECTER</Text>}
                  {loading && <ActivityIndicator size='small' color='white' />}
                </Pressable>
                </View>
            </View>

            <View className="flex-row items-center justify-between gap-2 py-2 mx-6 mt-16">
              <Pressable  style={{ width: '50%' }} onPress={() => router.replace("/login")} className={`rounded-xl py-4 px-8 bg-white shadow`} >
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
