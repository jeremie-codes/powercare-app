import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import type { Service } from '../types';
import { ArrowUpRight, Star } from 'lucide-react-native';

type Props = {
  service: Service;
  onPress?: () => void;
  accent?: string;
};

export default function ServiceCard({ service, onPress, accent = '#0fade8' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="w-64 mb-1 mr-4 overflow-hidden bg-white shadow rounded-3xl shadow-slate-300"
    >
      <View className="overflow-hidden bg-primary" style={{ backgroundColor: accent + '80' }}>
        <View className="items-center justify-center h-96">
          {<Image source={service.image} className='absolute top-0 left-0 w-full h-full' /> }
        </View>

        <View className="absolute bottom-0 w-full p-2">
          <View className="flex-row items-center justify-between px-2 py-3 bg-white/85 rounded-3xl">
            <View className='flex-1'>
              <Text className="text-xl text-sky-800 font-montserrat-medium">Service de</Text>
              <Text className="text-xl whitespace-pre-line text-sky-800 font-montserrat-bold">{service.nom}</Text>
              <View className="flex-row items-center mt-2">
                <Star color="orange" fill="orange" size={14} />
                <Star color="orange" fill="orange" size={14} />
                <Star color="orange" fill="orange" size={14} />
                <Star color="orange" fill="orange" size={14} />
                <Star color="orange" fill="orange" fillOpacity={0.1} size={14} />
              </View>
            </View>

            <View className="items-center justify-center w-16 h-16 rounded-full bg-sky-800">
              <ArrowUpRight color="#fff" size={22} />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
