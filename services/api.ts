import Constants from 'expo-constants';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { listServices as mockListServices, getServiceById as mockGetServiceById, getProfileByServiceId, sendMessageMock,getMockTaskByAgentId,
  getReservationById, mockLogin, getAgentByUserId, getReservationsByClientId, getMessagesByUserId, getConversationMock, 
  addTaskMock,
  removeTaskMock,
  getMockTaskById,
  getAgentRecommendedByMeMock,
  toggleDoneMock} from './datas';
import type { AgentType, Agent, Service, FormReservation, Reservation, AnyProfile, AuthResponse, Message, Tache, TacheAgent, User, UserUpdate, Rapport } from '../types';

/**
 * Client API basé sur Axios.
 * - baseURL depuis EXPO_PUBLIC_API_URL ou expo.extra.apiUrl
 * - Gestion du token via setAuthToken
 * - JSON in/out avec gestion d'erreurs en français
 */

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

function getBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  const extraUrl = (Constants.expoConfig as any)?.extra?.apiUrl;
  const base = envUrl || extraUrl || '';
  if (!base) {
    // Aucune URL de base configurée. Définissez EXPO_PUBLIC_API_URL ou expo.extra.apiUrl
    // Exemple app.json -> { "expo": { "extra": { "apiUrl": "https://api.exemple.com" } } }
    console.warn('[API] Aucune URL de base configurée. Définissez EXPO_PUBLIC_API_URL ou expo.extra.apiUrl');
  }
  return base;
}

function isMockMode(): boolean {
  return !getBaseUrl();
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions<TBody = any> {
  path: string;
  method?: HttpMethod;
  body?: TBody;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}

export interface ApiErrorShape {
  status: number;
  message: string;
  details?: any;
}

// Instance Axios avec baseURL et intercepteurs pour gérer le token
let axiosInstance: AxiosInstance | null = null;
function getAxios(): AxiosInstance {
  if (!axiosInstance) {
    axiosInstance = axios.create({
      baseURL: getBaseUrl() || undefined,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token
    axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (authToken) {
        config.headers = config.headers || {};
        (config.headers as any)['Authorization'] = `Bearer ${authToken}`;
      }
      return config;
    });
  }
  return axiosInstance;
}

export async function request<TResp = any, TBody = any>(opts: RequestOptions<TBody>): Promise<TResp> {
  const { path, method = 'GET', body, headers, query } = opts;
  try {
    const axiosClient = getAxios();
    const resp = await axiosClient.request<TResp>({
      url: path,
      method,
      data: body,
      params: query,
      headers,
    });
    return resp.data as TResp;
  } catch (e) {
    const err = e as AxiosError<any>;
    if (err.response) {
      const status = err.response.status;
      const data = err.response.data as any;
      const message = (data && (data.message || data.error)) || err.response.statusText || 'Requête échouée';
      const wrapped: ApiErrorShape = { status, message, details: data };
      throw wrapped;
    }
    if (err.request) {
      const wrapped: ApiErrorShape = { status: 0, message: 'Réseau indisponible. Vérifiez votre connexion.', details: null };
      throw wrapped;
    }
    const wrapped: ApiErrorShape = { status: 0, message: err.message || 'Erreur inconnue', details: null };
    throw wrapped;
  }
}

export const Api = {
  get: <TResp = any>(path: string, query?: RequestOptions['query'], headers?: Record<string, string>) =>
    request<TResp>({ path, method: 'GET', query, headers }),
  post: <TResp = any, TBody = any>(path: string, body?: TBody, headers?: Record<string, string>) =>
    request<TResp, TBody>({ path, method: 'POST', body, headers }),
  put: <TResp = any, TBody = any>(path: string, body?: TBody, headers?: Record<string, string>) =>
    request<TResp, TBody>({ path, method: 'PUT', body, headers }),
  patch: <TResp = any, TBody = any>(path: string, body?: TBody, headers?: Record<string, string>) =>
    request<TResp, TBody>({ path, method: 'PATCH', body, headers }),
  delete: <TResp = any>(path: string, headers?: Record<string, string>) =>
    request<TResp>({ path, method: 'DELETE', headers }),
};


// Example helper for common auth endpoints (optional usage)
export const AuthApi = {
  async login(email: string, password: string) {
    if (isMockMode()) {
      // Utilise les données locales
      return mockLogin(email, password);
    }
    return Api.post<AuthResponse, { email: string; password: string }>(`/auth/login`, { email, password });
  },
  async updateAccount(data: UserUpdate) {
    if (isMockMode()) {
      return {
        message: 'Utilisateur mis à jour',
        success: true,
        data: { user: data, token: 'test', profile: {} },
        status: 200,
      };
    }
    return Api.post(`/account/update`, data, { 'Content-Type': 'application/json' });
  },
  async updatePassword(data: { oldPassword: string; newpassword: string }): Promise<boolean> {
    if (isMockMode()) {
      return true;
    }
    return Api.post<boolean>(`/account/newpassword`, data, { 'Content-Type': 'application/json' });
  },
  async updateImage(data: FormData) {
    if (isMockMode()) {
      return {
        path: 'test',
        success: true,
        user: data,
        status: 200,
      };
    }
    return Api.post<AuthResponse>(`/account/update`, data, { 'Content-Type': 'application/json' });
  },
};

// Services API (liste et détail). En mode mock, on lit depuis services/datas
export const ServicesApi = {
  async list(type_agent?: AgentType): Promise<Service[]> {
    if (isMockMode()) {
      return mockListServices({ type_agent });
    }
    return Api.get<Service[]>(`/services`, type_agent ? { type_agent } : undefined);
  },
  async detail(id: string): Promise<Service> {
    if (isMockMode()) {
      const s = mockGetServiceById(id);
      if (!s) throw { status: 404, message: 'Service introuvable.' };
      return s;
    }
    return Api.get<Service>(`/services/${id}`);
  },
  async getAgents(id: string): Promise<Agent[]> {
     if (isMockMode()) {
      return getProfileByServiceId(id);
    }
    return Api.get<Agent[]>(`/agents/${id}`);
  },
  async getAgentById(id: string): Promise<Agent|undefined> {
     if (isMockMode()) {
      return getAgentByUserId(id);
    }
    return Api.get<Agent>(`/agents/${id}`);
  },
  async reserver ( data: FormReservation): Promise<boolean> {
    try {
      const response = await Api.post(`/reservations`, data);      
      // return response;

      return true;
    } catch (error: any) {
      console.log(error.response?.data?.message || 'Erreur lors de la réservation !');
      return false
    }
  },
  async getReservations(idclient: string): Promise<Reservation[]> {
    if (isMockMode()) {
      return getReservationsByClientId(idclient);
    }
    return Api.get<Reservation[]>(`/reservations/${idclient}`);
  },
  async getReservationById(id: string): Promise<Reservation|null> {
    if (isMockMode()) {
      return getReservationById(id);
    }
    return Api.get<Reservation>(`/reservations/${id}`);
  },
  async getMessagesByUserId(id: string): Promise<Message[]> {
    if (isMockMode()) {
      return getMessagesByUserId(id);
    }
    return Api.get<Message[]>(`/messages/${id}`);
  },
};

export const ChatApi = {
  async sendMessage(senderId: string, receiverId: string, text: string): Promise<boolean> {
    if (isMockMode()) {
      return sendMessageMock(senderId, text);
    }
    return Api.post<boolean>(`/messages/${senderId}`, { receiverId, text });
  },
  async getMessages(senderId: string, receiverId: string): Promise<Message[]> {
    if (isMockMode()) {
      return getConversationMock(senderId);
    }
    return Api.get<Message[]>(`/messages/${senderId}/${receiverId}`);
  },
};

export const TaskApi = {
  async addTask(clientId: string, agentId: string, task: string): Promise<boolean> {
    if (isMockMode()) {
      return addTaskMock(clientId, agentId, task);
    }
    return Api.post<boolean>(`/tashes/agent/${clientId}`, { agentId, task });
  },
  async deleteTask(taskId: string): Promise<boolean> {
    if (isMockMode()) {
      return removeTaskMock(taskId);
    }
    return Api.delete<boolean>(`/tashes/agent/${taskId}`);
  },
  async getTaskByAgentId(clientId: string, agentId: string): Promise<TacheAgent[]> {
    if (isMockMode()) {
      return getMockTaskById(clientId, agentId);
    }
    return Api.get<TacheAgent[]>(`/tashes/agent/${agentId}`);
  },
  async toggleDone(id: string): Promise<boolean> {
    if (isMockMode()) {
      return toggleDoneMock(id);
    }
    return Api.get<boolean>(`/tashes/toggle/${id}`);
  },
  async getAgentRecommendedByClient(clientId: string): Promise<Agent[]> {
    if (isMockMode()) {
      return getAgentRecommendedByMeMock(clientId);
    }
    return Api.get<Agent[]>(`/agents/recommended/${clientId}`);
  },
  async ratingAgent(client_id: string, agent_id: string, rating: number, commentaire?: string): Promise<boolean> {
    if (isMockMode()) {
      // Simulation d’envoi à l’API
      await new Promise((res) => setTimeout(res, 1500));
      return true;
    }
    const data = { client_id, rating, commentaire };
    return Api.post<boolean>(`/rating/${agent_id}`, data, { 'Content-Type': 'application/json' });
  }
};

export const AideApi = {
  async create(data: Rapport): Promise<boolean> {
    if (isMockMode()) {
      return true;
    }
    return Api.post<boolean>(`/aides`, data, { 'Content-Type': 'application/json' });
  },
};

