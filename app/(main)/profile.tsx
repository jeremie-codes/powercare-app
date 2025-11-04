import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert} from 'react-native';
import { router } from 'expo-router';
import Header from 'components/Header';
import { useAuth } from 'contexts/AuthContext';
import { Camera, User } from 'lucide-react-native';
import { useNotification } from 'contexts/NotificationContext';
import { baseUrl } from 'services/api';
import { UserUpdate } from 'types';
import * as ImagePicker from 'expo-image-picker';
import { Dialog } from 'react-native-paper';

export default function ProfileScreen() {
  const { user, profile, signOut, accountDelete, updateAccount, updateImage } = useAuth()
  const [nom, setNom] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [adresse, setAdresse] = useState(user?.adresse || '')
  const [type, setType] = useState(profile?.type || 'particulier')
  const [entreprise_nom, setEntrepriseNom] = useState('')
  const [password, setPassword] = useState('')
  const [newpassword, setNewPassword] = useState('')
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [view, setView] = useState<'connexion' | 'data' | 'password'>('data')
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [visible, setVisible] = useState(false);

  const isClient = user !== null && profile?.type === 'particulier' || user !== null && profile?.type === 'entreprise';

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  if (!user) {
    return (
      <View className='items-center justify-center flex-1 bg-slate-50'>
        <Text className='font-montserrat-medium'>Utilisateur non connecté !</Text>
        <Pressable className='px-6 py-4 mt-2 rounded-xl bg-primary' onPress={() => router.back()} >
          <Text className='text-white font-montserrat-medium'>Retour</Text>
        </Pressable>
      </View>
    )
  }

  const handleUpdateData = async () => {
    // Tous le champs doivent avoir une valeur
    if (nom === '' || phone === '' || adresse === '') {
      showNotification('Tous les champs doivent avoir une valeur', 'error')
      return
    }

    if (!validateEmail(email)) {
      showNotification('Format d\'email invalide', 'error');
      return;
    }
    
    if (type === 'entreprise' && entreprise_nom === '') {
      showNotification("Si vous êtes une entreprise, le nom de votre entreprise doit avoir une valeur", 'error')
      return
    }
    
    setLoading(true)
    try {
      
      const data: UserUpdate = {
        name: nom,
        email,
        phone,
        adresse,
        type,
        entreprise_nom,
      }
      
      const result = await updateAccount(data)
      
      
      showNotification('Utilisateur mis à jour avec succès', 'success')

    } catch (error) {
      useNotification().showNotification('Une erreur est survenue', 'error')
    } finally {
      setLoading(false)
    }
  
  }

  const handleUpdatePassword = async () => {
    // Tous le champs doivent avoir une valeur
    if (password === '' || newpassword === '') {
      showNotification('Tous les champs doivent avoir une valeur', 'error')
      return
    }
    
    setLoading(true)
    try {
      
      const data: { oldPassword: string; newpassword: string } = {
        oldPassword: password,
        newpassword: newpassword
      }
      
      await AuthApi.updatePassword(data)
      showNotification('Mot de passe mis à jour avec succès', 'success')

      setPassword('')
      setNewPassword('')

    } catch (error) {
      showNotification('Une erreur est survenue', 'error')
    } finally {
      setLoading(false)
    }
  
  }
  
  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showNotification('Permission d\'accès à la galerie requise', 'error');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const formData = new FormData();

        formData.append('avatar', {
          uri: asset.uri,
          name: 'profile.jpg',
          type: 'image/jpeg',
        } as any);

        setIsUploadingImage(true);
        
        try {
          const uploadResult = await updateImage(formData);
          if (uploadResult) {
            showNotification('Image mise à jour', 'success');
          } else {
            showNotification('Erreur lors de la mise à jour', 'error');
          }
        } catch (e: any) {
          showNotification(e.details.message ?? 'Erreur lors de la mise à jour', 'error');
        } finally {
          setIsUploadingImage(false);
        }
      }
    } catch (error) {
      showNotification('Erreur lors de la sélection de l\'image', 'error');
      setIsUploadingImage(false);
    }
  };

  const takePhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showNotification('Permission d\'accès à la caméra requise', 'error');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          setIsUploadingImage(true);
          const formData = new FormData();

        formData.append('avatar', {
          uri: asset.uri,
          name: 'profile.jpg',
          type: 'image/jpeg',
        } as any);

        setIsUploadingImage(true);
        try {
          const uploadResult = await updateImage(formData);
          if (uploadResult) {
            showNotification('Image mise à jour', 'success');
          } else {
            showNotification('Erreur', 'error');
          }
        } catch (e) {
          showNotification('Erreur lors de la mise à jour', 'error');
        } finally {
          setIsUploadingImage(false);
        }
        }
      }
    } catch (error) {
      showNotification('Erreur lors de la prise de photo', 'error');
      setIsUploadingImage(false);
    }
  };

  const handlepicturePress = () => {
    Alert.alert(
      "Photo de Profil",
      "Choisissez une option",
      [
        {
          text: "Galerie",
          onPress: pickImage
        },
        {
          text: "Caméra",
          onPress: takePhoto
        },
        {
          text: "Annuler",
          style: "cancel"
        }
      ]
    );
  };

  const handleLogout = async () => {
    setLoading(true)
    try {
      const { success, message } = await signOut();
      if (success) {
        router.push('/home')
      }
      showNotification(message, 'success')
    } catch (error: any) {
      showNotification(error.details.message ?? 'Une erreur est survenue', 'error')
    }
    finally {
      setLoading(false)
    }
  }
  
  const handleDelete = async () => {
    setDeleted(true)
    try {
      const { success, message } = await accountDelete();
      showNotification('Compte supprimé avec succès!', 'success')
      router.push('/home')
    } catch (error: any) {
      showNotification(error.details.message ?? 'Une erreur est survenue', 'error')
    }
    finally {
      setDeleted(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 24 }}>
        <Header />
        
        <View className="items-center justify-center p-5 my-4 bg-white shadow rounded-3xl">
          <View className="relative w-24 h-24 rounded-full bg-slate-50">
            <View className="flex-row items-center justify-center w-24 h-24 overflow-hidden rounded-full">
              {user && <Image source={{ uri: baseUrl + user.avatar }} className='object-cover w-full h-full' />}
              {!user && <User size={24} color="#cbd5e1" />}
            </View>

            <Pressable onPress={handlepicturePress} disabled={isUploadingImage} className='absolute bottom-0 right-0 self-center px-2 py-2 rounded-full bg-primary'>
              {isUploadingImage ? <ActivityIndicator size={'small'} color={'#fff'} /> : <Camera size={20} color={'#fff'} />}
            </Pressable>
          </View>
          
          <Text className="text-base font-montserrat-semibold text-[#0B2A36]">{user?.name ?? "Nom d'utilisateur"}</Text>
          <Text className="text-sm text-gray-400 font-montserrat-medium">{user?.email ?? '@adressemail'}</Text>
        </View>

        <View className="flex-row items-center self-center justify-between p-1 mb-4 bg-gray-200 rounded-xl">
          <Pressable
            className={`px-3 mr-1 py-3 rounded-xl  ${view === 'data' ? 'bg-white' : 'bg-gray-100'}`}
            onPress={() => setView('data')}
          >
            <Text className={`text-base font-montserrat-semibold ${view === 'data' ? 'text-primary' : 'text-gray-500'}`}>Mon Profil</Text>
          </Pressable>
          
          <Pressable
            className={`px-3 py-3 rounded-xl  ${view === 'password' ? 'bg-white' : 'bg-gray-100'}`}
            onPress={() => setView('password')}
          >
            <Text className={`text-base font-montserrat-semibold ${view === 'password' ? 'text-primary' : 'text-gray-500'}`}>Mot de passe</Text>
          </Pressable>
          
          <Pressable
            className={`px-3 ml-1 py-3 rounded-xl  ${view === 'connexion' ? 'bg-white' : 'bg-gray-100'}`}
            onPress={() => setView('connexion')}
          >
            <Text className={`text-base font-montserrat-semibold ${view === 'connexion' ? 'text-primary' : 'text-gray-500'}`}>Connexion</Text>
          </Pressable>
        </View>

        {view === 'connexion' && <View className="w-full">
          <Text className="mb-4 text-base text-gray-700 font-montserrat-semibold">Connexion</Text>
          <Pressable onPress={handleLogout} className='flex-row items-center justify-center py-4 mt-2 bg-primary rounded-xl' {...loading && { disabled: true }}>
            { loading && <ActivityIndicator color="#fff" />}
            <Text className="text-lg text-center text-white font-montserrat-semibold">{loading ? '' : 'Deconnexion'}</Text>
          </Pressable>
          
          <Pressable onPress={() => setVisible(true)} className='flex-row items-center justify-center py-4 mt-3 border-2 border-red-500 rounded-xl' {...loading && { disabled: true }}>
            { deleted && <ActivityIndicator color="#ef4444" />}
            <Text className="text-lg text-center text-red-500 font-montserrat-semibold">{deleted ? '' : 'Supprimer le compte'}</Text>
          </Pressable>
        </View>}
        
        {view === 'data' && <View className="w-full">
          <Text className="mb-4 text-base text-gray-700 font-montserrat-semibold">Information particulierle</Text>
            <TextInput
              className='px-6 py-6 mb-3 text-base bg-white shadow font-montserrat rounded-xl'
              placeholder='Votre nom complet'
              value={nom}
              onChangeText={setNom}
            />
            
            <TextInput
              className='px-6 py-6 mb-3 text-base bg-white shadow font-montserrat rounded-xl'
              placeholder='Email'
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            
            <TextInput
              className='px-6 py-6 mb-3 text-base bg-white shadow font-montserrat rounded-xl'
              placeholder='Téléphone'
              value={phone}
              onChangeText={setPhone}
              keyboardType="number-pad"
            />
            
            <TextInput
              className='px-6 py-6 mb-3 text-base bg-white shadow font-montserrat rounded-xl'
              placeholder='Votre adresse'
              value={adresse}
              onChangeText={setAdresse}
              keyboardType="email-address"
            />

            {isClient && <View className="flex-row mb-3">
              <Pressable
                className={`px-6 py-3 rounded-xl bg-white ${type === 'particulier' ? 'border-2 border-primary' : 'border border-gray-200'} mx-2`}
                onPress={() => setType('particulier')}
              >
                <Text className={`font-montserrat-medium text-base ${type === 'particulier' ? 'text-primary' : 'text-[#143A52]'}`}>Particulier</Text>
              </Pressable>
              
              <Pressable
                className={`px-6 py-3 rounded-xl bg-white ${type === 'entreprise' ? 'border-2 border-primary' : 'border border-gray-200'} mx-2`}
                onPress={() => setType('entreprise')}
              >
                <Text className={`font-montserrat-medium text-base ${type === 'entreprise' ? 'text-primary' : 'text-[#143A52]'}`}>Entreprise</Text>
              </Pressable>
            </View>}

            {type === 'entreprise' &&  <TextInput
              className='px-6 py-6 mb-3 text-base bg-white shadow font-montserrat rounded-xl'
              placeholder="Nom de l'entreprise"
              value={entreprise_nom}
              onChangeText={setEntrepriseNom}
            />}

            <Pressable onPress={handleUpdateData} className='flex-row items-center justify-center py-4 mt-2 bg-primary rounded-xl' {...loading && { disabled: true }}>
              { loading && <ActivityIndicator color="#fff" />}
              <Text className="text-lg text-center text-white font-montserrat-semibold">{loading ? 'Chargement...' : 'Modifier'}</Text>
            </Pressable>
        </View>}
        
        {view === 'password' && <View className="w-full">
          <Text className="mb-4 text-base text-gray-700 font-montserrat-semibold">Mot de passe</Text>
            <TextInput
              className='px-6 py-6 mb-4 text-base bg-white shadow font-montserrat rounded-xl'
              placeholder='Ancien mot de passe'
              value={password}
              secureTextEntry
              onChangeText={setPassword}
            />
            
            <TextInput
              className='px-6 py-6 mb-4 text-base bg-white shadow font-montserrat rounded-xl'
              placeholder='Nouveau mot de passe'
              value={newpassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            
            <Pressable onPress={handleUpdatePassword} className='py-4 bg-primary rounded-xl'  {...loading && { disabled: true }}>
              { loading && <ActivityIndicator color="#fff" />}
              <Text className="text-lg text-center text-white font-montserrat-semibold">{loading ? '' : 'Modifier'}</Text>
            </Pressable>
        </View>}
      </ScrollView>

      <Dialog
        visible={visible}
        onDismiss={() => setVisible(false)}
      >
        <Dialog.Content>
          <View className="flex-row items-center">
            <View className="flex-1">
              <Text className="text-lg text-center text-gray-700 font-montserrat-semibold">Etes-vous sûr de vouloir supprimer votre compte ?</Text>
              <Text className="text-base text-center text-gray-400 font-montserrat">Cette action est irréversible.</Text>
            </View>
          </View>
        </Dialog.Content>

        <Dialog.Actions style={{ justifyContent: 'space-between' }}>
          <Pressable onPress={() => { setVisible(false); handleDelete(); }} className='px-4 py-3 bg-primary rounded-xl'>
            <Text className="text-base text-white font-montserrat-semibold">Oui, supprimer</Text>
          </Pressable>
          
          <Pressable onPress={() => setVisible(false)}  className='px-4 py-3 bg-white rounded-xl'>
            <Text className="text-base text-red-400 font-montserrat-semibold">Annuler</Text>
          </Pressable>
        </Dialog.Actions>
      </Dialog>
    </KeyboardAvoidingView>
  );
}
