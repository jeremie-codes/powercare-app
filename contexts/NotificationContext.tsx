import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, Text, TouchableOpacity } from 'react-native';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('info');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const translateY = useRef(new Animated.Value(-120)).current;

  const animateIn = () => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const animateOut = (onEnd?: () => void) => {
    Animated.timing(translateY, {
      toValue: -120,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      onEnd?.();
    });
  };

  const showNotification = (msg: string, nType: NotificationType = 'info', duration = 3000) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMessage(msg);
    setType(nType);
    setVisible(true);
    animateIn();

    if (duration > 0) {
      timeoutRef.current = setTimeout(() => animateOut(), duration);
    }
  };

  const value = useMemo(() => ({ showNotification }), []);

  const backgroundByType: Record<NotificationType, string> = {
    success: '#22c55e',
    error: '#ef4444',
    info: '#3b82f6',
    warning: '#f59e0b',
  };

  return (
    <NotificationContext.Provider value={value}>
      <View style={styles.wrapper} pointerEvents="box-none">
        {visible && (
          <Animated.View
            style={[styles.container, { transform: [{ translateY }], backgroundColor: backgroundByType[type] }]}
          >
            <Text style={styles.text} className='text-montserrat-medium'>{message}</Text>
            <TouchableOpacity accessibilityRole="button" className='p-2' onPress={() => animateOut()}>
              <Text style={styles.close} className='text-montserrat-medium'>×</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification doit être utilisé dans un NotificationProvider');
  return ctx;
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  container: {
    marginTop: 56,
    marginHorizontal: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    color: 'white',
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  close: {
    color: 'white',
    fontSize: 24
  }
});
