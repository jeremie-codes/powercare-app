import React from 'react';
import { View, Text, Pressable, Image, ImageSourcePropType } from 'react-native';
import type { Service } from '../types';
import { ArrowRight, ArrowUpRight, Star } from 'lucide-react-native';

type Props = {
  service: Service;
  onPress?: () => void;
  accent?: string;
};

export default function ServiceCard({ service, onPress, accent = '#0fade8' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="w-full mb-4 mr-4 overflow-hidden bg-white shadow-lg rounded-[30px] border border-black/20"
    >
      <View className="overflow-hidden bg-primary" style={{ backgroundColor: accent + '80' }}>
        <View className="items-center justify-center h-[450]">
          {<Image source={service?.image as ImageSourcePropType } className='absolute top-0 left-0 w-full h-full' /> }
        </View>

        <View className="absolute bottom-0 w-full p-3">
          <View className="px-6 py-3 bg-black/65 rounded-3xl">
          
            <Text className="text-lg text-gray-100 font-montserrat-semibold">Service de </Text>
            <Text className="text-xl whitespace-pre-line text-gray-50 font-montserrat-bold">{service.nom}</Text>

            <View className="flex-row items-center justify-between">
              
              <View className="flex-row items-center mt-2">
                <Star color="orange" fill="orange" size={14} />
                <Star color="orange" fill="orange" size={14} />
                <Star color="orange" fill="orange" size={14} />
                <Star color="orange" fill="orange" size={14} />
                <Star color="orange" fill="orange" fillOpacity={0.3} size={14} />
              </View>

              <View className="flex-row items-center justify-center h-12 px-4 bg-white rounded-full">
                <Text className="text-base text-sky-900 font-montserrat-semibold">Réserver </Text>
                <ArrowRight color="#075985" size={20} />
              </View>
                
            </View>
            
          </View>
        </View>
      </View>
    </Pressable>
  );
}
