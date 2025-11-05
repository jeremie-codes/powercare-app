import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, RefreshControl } from "react-native";
import { ArrowLeft, CheckCircle, Plus, Star, Trash2, X } from "lucide-react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import { TaskApi } from "services/api";
import { TacheAgent } from "types";
import { formatDate, formatTime } from "utils/formatters";
import { useNotification } from "contexts/NotificationContext";
import { ActivityIndicator } from "react-native-paper";

export default function TasksScreen() {
  const { user, profile } = useAuth();
  const { id } = useLocalSearchParams();
  const { showNotification } = useNotification();
  const [visible, setVisible] = React.useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  
  const showDialog = () => setVisible(true);
  const hideDialog = () => {
    setVisible(false);
    setRating(0)
  };

  const [tasks, setTasks] = useState<TacheAgent[]>([]);
  const [newTask, setNewTask] = useState("");

  if (!profile || !user) return;

  useEffect(() => {
    (async () => {
      setIsLoading(true)
      try {
          const { success, message, datas } = await TaskApi.getTaskByAgentId(id as string, user.id);
          
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
      const { success, message, datas } = await TaskApi.getTaskByAgentId(id as string, user.id);
      
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

  const addTask = async () => {
    try {
      setSending(true)
      if (!newTask.trim()) return;
     
      const { success, message, task } = await TaskApi.addTask(profile?.id, id as string, newTask);
    
      if (!success) {
        showNotification(message, 'error');
        return;
      }
      
      setNewTask("");
      showNotification('Tâche ajoutée avec succèes !', 'success')
      
      const list: TacheAgent[] = [...tasks, task];
      setTasks(list);
      
    } catch (error: any) {
      showNotification(error.details.message ?? 'Une erreur est survenue', 'error')
    }
    setSending(false)
  };

  const deleteTask = async (id: string) => {
    try {
      setDeleting(true)
      setDeletingId(id)
      const { success, message } = await TaskApi.deleteTask(id);
    
      if (!success) {
        showNotification(message, 'error');
        return;
      }
      
      setTasks(prev => prev.filter(t => t.id !== id));
      showNotification('Tâche supprimée avec succèes !', 'success')
      
    } catch (error: any) {
      showNotification(error.details.message ?? 'Une erreur est survenue', 'error')
    }
    setDeleting(false)
    setDeletingId("")
  };

  // Dictionnaire des descriptions selon la note
  const ratingDescriptions: Record<number, string> = {
    1: "Médiocre 😞",
    2: "Insuffisant 😕",
    3: "Moyen 😐",
    4: "Bien 🙂",
    5: "Excellent 🤩",
  };
  
  const handleSubmit = async () => {
    if (rating === 0) {
      showNotification("Veuillez attribuer une note à l'agent.", 'error');
      return;
    }

    setLoading(true);
    try {
      const { success, message } = await TaskApi.ratingAgent(profile?.id as string, id as string, rating, comment);

      if (!success) {
        showNotification(message, 'error');
        return;
      }

      showNotification("Merci !, Votre évaluation a bien été enregistrée.", 'success');
      router.back();
    } catch (error: any) {
      showNotification(error.details.message ?? "Erreur, Impossible d’envoyer votre évaluation.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const todos = tasks.filter(t => !t.done);
  const dones = tasks.filter(t => t.done);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} className="flex-1 bg-slate-100">
      {/* Titre */}
      <View className="flex-row items-center gap-8 px-6 pt-8 mb-4 bg-white">
        <Pressable onPress={() => router.back()} className="justify-center w-16 h-16 ">
          <ArrowLeft color="#075985" size={24} />
        </Pressable>
      
        <Text className="text-2xl font-montserrat-bold text-[#0B2A36]">
          Tâches du jour
        </Text>
      </View>

      {/* Section ajout de tâche (client uniquement) */}

      <View className="flex-row items-center px-6 pb-4">
        <TextInput
          placeholder="Ajouter une tâche..."
          value={newTask}
          onChangeText={setNewTask}
          placeholderTextColor="#999"
          className="flex-1 bg-white rounded-xl px-4 py-5 font-montserrat text-base text-[#0B2A36] shadow"
        />
        <Pressable
          onPress={addTask}
          disabled={sending}
          className="p-3 ml-3 rounded-full shadow bg-primary"
        >
          {sending ? <ActivityIndicator size={'small'} color="#fff" /> : <Plus color="#fff" size={22} />}
        </Pressable>
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
            
              <Pressable onPress={() => deleteTask(t.id)} disabled={deleting}>
                {deleting && deletingId === t.id ? <ActivityIndicator size={'small'} color="#ef4444" /> : <Trash2 color="#ef4444" size={22} />}
              </Pressable>

            </View>
          </View>
        ))}

        <View className="w-full h-4 border-b border-gray-200" />

        {/* Done */}
        {!isLoading && <Text className="text-lg font-montserrat-semibold text-[#0B2A36] mt-6 mb-3">
          Terminées ({dones.length})
        </Text>}
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
      
      {/* Evaluation */}
      <Pressable onPress={showDialog} className="flex-row items-center justify-center gap-2 px-4 py-4 mx-5 mb-8 shadow bg-primary rounded-2xl">
        <Star color="#fff" size={20} /> 
        <Text className="text-base text-white font-montserrat-semibold"> Évaluer l’agent </Text>
      </Pressable>

      <View className="absolute bottom-0 left-0 z-10 w-full h-full shadow bg-black/30 rounded-3xl" style={{ display: visible ? 'flex' : 'none' }}>
        
        <View className="flex-1" />
        
        <View className="flex-1 w-full px-5 py-6 bg-white rounded-3xl">
          <TouchableOpacity onPress={hideDialog} className="absolute z-10 p-3 top-3 left-6">
            <X color="#999" size={26} />
          </TouchableOpacity>
          
          <Text className="my-4 text-xl font-semibold text-center text-gray-900">
            Évaluer l’agent
          </Text>

          <Text className="mb-2 text-base text-center text-gray-700 font-montserrat">
            Comment évaluez-vous la qualité du service rendu ?
          </Text>

          <View className="flex-row items-center self-center mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
              >
                <Star
                  size={36}
                  color={star <= rating ? "#facc15" : "#d1d5db"}
                  fill={star <= rating ? "#facc15" : "none"}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Texte descriptif selon la note */}
          {rating > 0 && (
            <Text className="mb-6 text-base text-center text-gray-700 font-montserrat-medium">
              {ratingDescriptions[rating]}
            </Text>
          )}

          <Text className="mb-2 text-base text-center text-gray-700 font-montserrat">Laissez un commentaire</Text>

          <TextInput
            className="h-20 px-5 mb-6 text-gray-900 border border-gray-300 rounded-lg font-montserrat"
            multiline
            numberOfLines={4}
            placeholder="Partagez votre expérience..."
            value={comment}
            onChangeText={setComment}
          />

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            className={`rounded-2xl py-4 ${
              loading ? "bg-gray-300" : "bg-primary"
            }`}
          >
            <Text className="text-lg font-medium text-center text-white">
              {loading ? "Envoi en cours..." : "Envoyer l’évaluation"}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
