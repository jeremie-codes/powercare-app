import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ChatApi } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { Message } from "types";
import { ArrowLeft, Check, Send } from "lucide-react-native";
import { formatTime } from "utils/formatters";

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  // const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  const user = {
    id: 'u_client_pers_1',
    name: 'Fatou Sarr',
    email: 'fatou.client@powercare.test',
    password: 'password123',
    phone: '+221700000101',
    role: 'client',
    is_active: true,
  }

  if (!user) return;

  useEffect(() => {
    (async () => {
      const msgs = await ChatApi.getMessages(user?.id, id as string);
      setMessages(msgs);
    })();
  }, [id]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    await ChatApi.sendMessage(user.id, id as string, text);
    
    setText("");
    // Optionnel : recharger les messages
    const msgs = await ChatApi.getMessages(user?.id, id as string);
    setMessages(msgs);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} className="flex-1 bg-slate-100">
      <View className="flex-row items-center justify-between px-4 pt-10 bg-slate-50">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft color="#075985" size={24} />
        </Pressable>
        
        <Text className="p-4 text-lg font-bold text-[#0B2A36]">
          {user.name}
        </Text>
      </View>
      
      <ScrollView className="flex-1 p-4">
        {messages.map((msg, i) => (
            <View key={i} style={{ width: '70%', paddingTop: 10 }}
              className={`px-2 py-6 rounded-xl mb-2 ${
                msg.sender_id === user.id
                  ? "bg-primary self-end"
                  : "bg-white self-start"
              }`}
            >
              <Text
                className={`font-montserrat text-base ${
                  msg.sender_id === user.id
                    ? "text-white"
                    : "text-[#0B2A36]"
                }`}
              >
                {msg.content}
              </Text>

              <View className='absolute right-0 flex-row items-center justify-end w-full' style={{ bottom: msg.sender_id === user.id ? -10 : 2, right: msg.sender_id === user.id ? 0 : 10  }}>
                <Text
                  className={`font-montserrat text-sm ${
                    msg.sender_id === user.id
                      ? "text-gray-200"
                      : "text-gray-400"
                  }`}
                >
                  {formatTime(msg.created_at)}
                </Text>
                {msg.sender_id === user.id && <View className={`rounded-full`} style={{ padding: 5 }}>
                  {msg.is_read && <Check size={16} color={"#86efac"} />}
                  {msg.is_read && <Check size={16} style={{ top: -12, right: -2 }} color={"#86efac"} />}
                  
                  {!msg.is_read && <Check size={16} color={'#9ca3af'} />}
                </View>}
              </View>
            </View>
        ))}
      </ScrollView>

      {/* Champ d’envoi */}
      <View className="flex-row items-center px-2 bottom-6">
        <TextInput
          className="flex-1 p-5 mr-2 text-base bg-white rounded-xl font-montserrat"
          placeholder="Écrire un message..."
          multiline
          value={text}
          onChangeText={setText}
        />
        <Pressable
          onPress={sendMessage}
          disabled={!text}
          className={`p-4 rounded-xl ${
            text ? "bg-primary" : "bg-gray-400"
          }`}
        >
          <Send color="#fff" size={24} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
