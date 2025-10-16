import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { ArrowLeft, CheckCircle, Plus, Star, Trash2, X } from "lucide-react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import { TaskApi } from "services/api";
import { AnyProfile, Client, TacheAgent } from "types";
import { formatDate, formatTime } from "utils/formatters";
import { useNotification } from "contexts/NotificationContext";

export default function TasksScreen() {
  const { profile } = useAuth();
  const { id } = useLocalSearchParams();
  const { showNotification } = useNotification();
  const [visible, setVisible] = React.useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  
  const showDialog = () => setVisible(true);
  const hideDialog = () => {
    setVisible(false);
    setRating(0)
  };

  function isClient(profile: AnyProfile | null): profile is Client {
    return profile !== null && 'experience' !in profile;
  }

  const [tasks, setTasks] = useState<TacheAgent[]>([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // if (!isClient(profile)) return; // pour la production
        const tsks = await TaskApi.getTaskByAgentId('u_client_pers_1', id as string); // pour le test
                // const tsks = await TaskApi.getTaskByAgentId(profile.id as string, id as string); // pour la production
        setTasks(tsks);
      } catch (error) {
        showNotification('Une erreur s\'est produit !', 'error')
      }
    })();
  }, [profile]);

  const addTask = async () => {
    try {
      if (!newTask.trim()) return;
      await TaskApi.addTask('u_client_pers_1', 'agent_1', newTask);
      await TaskApi.addTask(profile?.id as string, id as string, newTask);
      setTasks(prev => [
        ...prev,
        { id: Date.now().toString(), client_id: 'u_client_pers_1', agent_id: 'agent_1', title: newTask, created_at: new Date().toISOString(), done: false },
      ]);
      setNewTask("");
    } catch (error) {
      showNotification('Une erreur est survenue', 'error')
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await TaskApi.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      showNotification('Une erreur est survenue', 'error')
    }
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
      await TaskApi.ratingAgent(profile?.id as string, id as string, rating, comment);

      showNotification("Merci !, Votre évaluation a bien été enregistrée.", 'success');
      router.back();
    } catch (error) {
      showNotification("Erreur, Impossible d’envoyer votre évaluation.", 'error');
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
          className="p-3 ml-3 rounded-full shadow bg-primary"
        >
          <Plus color="#fff" size={22} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
      >
        {/* To Do */}
        <Text className="text-lg font-montserrat-semibold text-[#0B2A36] mb-3">
          À faire ({todos.length})
        </Text>
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
            
              <Pressable onPress={() => deleteTask(t.id)}>
                <Trash2 color="#ef4444" size={22} />
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
