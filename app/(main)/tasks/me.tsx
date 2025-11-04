import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { ArrowLeft, CheckCircle, Circle } from "lucide-react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { router } from "expo-router";
import { TaskApi } from "services/api";
import { Agent, AnyProfile, TacheAgent } from "types";
import { formatDate, formatTime } from "utils/formatters";
import { useNotification } from "contexts/NotificationContext";
import { ActivityIndicator } from "react-native-paper";

export default function TasksScreen() {
  const { profile } = useAuth();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingId, setLoadingId] = useState("");
  
  function isAgent(profile: AnyProfile | null): profile is Agent {
    return profile !== null && 'experience' in profile;
  }
  
  const [tasks, setTasks] = useState<TacheAgent[]>([]);
  
  if (!isAgent(profile)) return;
  
  useEffect(() => {
    (async () => {
      setIsLoading(true)
      try {
          const { success, message, datas } = await TaskApi.getTaskByAgentId(profile?.id, profile.recommended_by as string);
          console.log(profile.recommended_by);
          
          if (!success) {
            showNotification(message, 'error');
            return;
          }

          setTasks(datas);
        } catch (error: any) {
          showNotification(error.details.message ?? 'Une erreur s\'est produit !', 'error')
        }
      setIsLoading(false)
    })()
  }, []);

  const onRefresh = async () => {
     setIsRefreshing(true)
      try {
          const { success, message, datas } = await TaskApi.getTaskByAgentId(profile?.id, profile.recommended_by as string);
          console.log(profile.recommended_by);
          
          if (!success) {
            showNotification(message, 'error');
            return;
          }

          setTasks(datas);
        } catch (error: any) {
          showNotification(error.details.message ?? 'Une erreur s\'est produit !', 'error')
        }
      setIsRefreshing(false)
  }

  const toggleDone = async (id: string) => {
    setSending(true)
    setLoadingId(id)
    try {
      await TaskApi.toggleDone(id)
      setTasks(prev =>
        prev.map(t => (t.id === id ? { ...t, done: !t.done } : t))
      );
      showNotification('Tâche terminée', 'success')
    } catch (error) {
      showNotification('Une erreur s\'est produit !', 'error')
    }
    setSending(false)
    setLoadingId("")
  };

  const todos = tasks.filter(t => !t.done);
  const dones = tasks.filter(t => t.done);

  return (
    <View className="flex-1 bg-slate-50">
      {/* Titre */}
      <View className="flex-row items-center gap-8 px-6 pt-8 mb-4 bg-white">
        <Pressable onPress={() => router.back()} className="justify-center w-16 h-16 ">
          <ArrowLeft color="#075985" size={24} />
        </Pressable>
      
        <Text className="text-2xl font-montserrat-bold text-[#0B2A36]">
          Tâches du jour
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            onRefresh={onRefresh}
            refreshing={isRefreshing}
          />
        }
      >
        {isLoading  && <View className="items-center justify-center flex-1">
          <ActivityIndicator size={'small'} color="#0B2A36" /> 
      </View>}
        
        {/* To Do */}
        {!isLoading && <Text className="text-lg font-montserrat-semibold text-[#0B2A36] mb-3">
          À faire ({todos.length})
        </Text>}
        {todos.map(t => (
          <View
            key={t.id}
            className="flex-row items-center justify-between px-4 py-3 mb-3 bg-white shadow rounded-2xl"
          >
            <View>
              <Text className="text-sm text-gray-500 font-montserrat">le {formatDate(t?.created_at)} à {formatTime(t?.created_at)}</Text>
              <Text className="text-base font-montserrat-medium text-[#0B2A36]">
                {t.title}
              </Text>
            </View>
            <View className="flex-row items-center space-x-3">
              <Pressable onPress={() => toggleDone(t.id)} disabled={sending}>
                {sending && loadingId === t.id ? <ActivityIndicator size={'small'} color="#d1d5db" /> : <Circle color="#d1d5db" size={24} />}
              </Pressable>
            </View>
          </View>
        ))}

        <View className="w-full h-4 border-b border-gray-200" />

        {/* Done */}
        <Text className="text-lg font-montserrat-semibold text-[#0B2A36] mt-6 mb-3">
          Terminées ({dones.length})
        </Text>
        {dones.map(t => (
          <View
            key={t.id}
            className="flex-row items-center justify-between px-4 py-3 mb-3 bg-white shadow rounded-2xl"
          >
            <View>
              <Text className="text-sm text-gray-500 font-montserrat">le {formatDate(t?.created_at)} à {formatTime(t?.created_at)}</Text>
              <Text className="text-base font-montserrat-medium text-[#0B2A36] line-through">
                {t.title}
              </Text>
            </View>
            <CheckCircle color="#10b981" size={24} />
          </View>
        ))}

      </ScrollView>
      
      <Pressable
        onPress={() => router.push('/(main)/support')}
        className="flex-row items-center justify-center px-4 py-4 mx-5 mb-8 shadow bg-primary rounded-2xl"
      >
        <Text className="text-base text-white font-montserrat-semibold">
          Réclamation
        </Text>
      </Pressable>
    </View>
  );
}
