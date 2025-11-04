import React, { useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, Pressable, StyleSheet, View, Text, Image } from 'react-native';
import { useMenu } from '../contexts/MenuContext';
import { useAuth } from '../contexts/AuthContext';
import { User, Home, ListTodo, Calendar, UserIcon, Users, CircleQuestionMark } from 'lucide-react-native';
import { router, usePathname } from 'expo-router';
import { useNotification } from 'contexts/NotificationContext';
import { baseUrl } from 'services/api';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MENU_WIDTH = Math.min(320, Math.round(SCREEN_WIDTH * 0.7));

export default function Menu() {
  const { open, closeMenu } = useMenu();
  const { user, profile } = useAuth();
  const { showNotification } = useNotification();
  const translateX = useRef(new Animated.Value(MENU_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const pathname = usePathname();

  React.useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0.4, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, { toValue: -MENU_WIDTH, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [open, translateX, backdropOpacity]);

  const handlePress = (route: string) => {

    if (!user && route !== '/home' && route !== '/login' && route !== '/register') {
      showNotification('Vous devez être connecté pour accéder à cette page', 'warning');
      return;
    }

    closeMenu();
    if (route == pathname) return;
    router.push(route);
  };

  const isReservationPage = pathname.includes('reservation');

  return (
    <View pointerEvents={open ? 'auto' : 'none'} className="w-full h-full" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000', opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
      </Animated.View>

      {/* Panel */}
      <Animated.View style={[styles.panel, { left: open ? 0 : -MENU_WIDTH, transform: [{ translateX }] }]}> 

        <View className="w-full mb-4 ml-12">
          <Image source={require('../assets/logo.png')} style={{ width: 90, height: 72 }} />
        </View>

        <View className='flex-row items-center justify-start mb-4'>
          <Pressable onPress={() => handlePress('/profile')} className="relative flex-row items-center justify-center w-20 h-20 ml-10 overflow-hidden rounded-full bg-sky-50">
            {user && <Image source={{ uri: baseUrl + user.avatar }} className='object-cover w-full h-full' />}
            {!user && <User size={24} color="#cbd5e1" />}
          </Pressable>
          
          <Pressable onPress={() => handlePress('/profile')} className="relative ml-2">
            <Text className="text-base font-montserrat-semibold text-[#2e434a]">{user?.name}</Text>
            <Text className="text-sm text-gray-400 font-montserrat-medium">{user?.email}</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => handlePress('/home')} className={`w-full flex-row items-center gap-2 justify-start py-4 border-b border-sky-50 pl-10 ${pathname === '/home' ? 'bg-sky-50' : ''}`}>
          <Home size={24} color={pathname === '/home' ? '#0ea5e9': '#0369a1'} />
          <Text className={`text-lg font-montserrat-semibold ${pathname === '/home' ? 'text-sky-500' : 'text-sky-900'}`}>Accueil</Text>
        </Pressable>
        {user?.role === 'agent' &&<Pressable onPress={() => handlePress('/tasks/me')} className={`w-full flex-row items-center gap-2 justify-start py-4 border-b border-sky-50 pl-10 ${pathname === '/tasks/me' ? 'bg-sky-50' : ''}`}>
          <ListTodo size={24} color={pathname === '/tasks/me' ? '#0ea5e9': '#0369a1'} />
          <Text className={`text-lg font-montserrat-semibold ${pathname === `/tasks/me` ? 'text-sky-500' : 'text-sky-900'}`}>Mes Tâches</Text>
        </Pressable>}
        {user?.role === 'client' && <Pressable onPress={() => handlePress('/tasks')} className={`w-full flex-row items-center gap-2 justify-start py-4 border-b border-sky-50 pl-10 ${pathname === '/tasks' ? 'bg-sky-50' : ''}`}>
          <Users size={24} color={pathname === '/tasks' ? '#0ea5e9': '#0369a1'} />
          <Text className={`text-lg font-montserrat-semibold ${pathname === '/tasks' ? 'text-sky-500' : 'text-sky-900'}`}>Agents Assignés</Text>
        </Pressable>}
        {user?.role === 'client' && <Pressable onPress={() => handlePress('/reservation')} className={`w-full flex-row items-center gap-2 justify-start py-4 border-b border-sky-50 pl-10 ${isReservationPage ? 'bg-sky-50' : ''}`}>
          <Calendar size={24} color={isReservationPage ? '#0ea5e9': '#0369a1'} />
          <Text className={`text-lg font-montserrat-semibold ${isReservationPage ? 'text-sky-500' : 'text-sky-900'}`}>Réservations</Text>
        </Pressable>}
        <Pressable onPress={() => handlePress('/support')} className={`w-full flex-row items-center gap-2 justify-start py-4 border-b border-sky-50 pl-10 ${pathname === '/support' ? 'bg-sky-50' : ''}`}>
          <CircleQuestionMark size={24} color={pathname === '/support' ? '#0ea5e9': '#0369a1'} />
          <Text className={`text-lg font-montserrat-semibold ${pathname === '/support' ? 'text-sky-500' : 'text-sky-900'}`}>Aide & Plainte</Text>
        </Pressable>
        {user && <Pressable onPress={() => handlePress('/profile')} className={`w-full flex-row items-center gap-2 justify-start py-4 border-b border-sky-50 pl-10 ${pathname === '/profile' ? 'bg-sky-50' : ''}`}>
          <UserIcon size={24} color={pathname === '/profile' ? '#0ea5e9': '#0369a1'} />
          <Text className={`text-lg font-montserrat-semibold ${pathname === '/profile' ? 'text-sky-500' : 'text-sky-900'}`}>Mon Profil</Text>
        </Pressable>}
        {!user && <Pressable onPress={() => handlePress('/login')} className={`w-full flex-row items-center gap-2 justify-start py-4 border-b border-sky-50 pl-10 ${pathname === '/login' || pathname === '/register' ? 'bg-sky-50' : ''}`}>
          <UserIcon size={24} color={pathname === '/login' || pathname === '/register' ? '#0ea5e9': '#0369a1'} />
          <Text className={`text-lg font-montserrat-semibold ${pathname === '/login' || pathname === '/register' ? 'text-sky-500' : 'text-sky-900'}`}>Se connecter</Text>
        </Pressable>}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: '#fff',
    paddingTop: 56,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: -4, height: 0 },
    elevation: 8,
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
});
