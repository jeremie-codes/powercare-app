import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { sendMessageMock, getMessagesByUserId, getConversationMock, messages} from './datas';
import type { Agent, Service, FormReservation, Reservation, AuthResponse, Message, TacheAgent, UserUpdate, Rapport, UserCreate } from '../types';

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
export const baseUrl = 'https://powercare.siterdc.com/';

function getBaseUrl(): string {
  const base = 'https://powercare.siterdc.com/api';
  if (!base) {
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
  async login(email: string, password: string): Promise<{ success: boolean; message: string; data: AuthResponse}> {
    return Api.post<{ success: boolean; message: string; data: AuthResponse}>(`/auth/login`, { email, password });
  },
  async register(data: UserCreate): Promise<{ success: boolean; message: string; data: AuthResponse}> {
    return Api.post<{ success: boolean; message: string; data: AuthResponse}>(`/auth/register`, data, { 'Content-Type': 'application/json' });
  },
  async updateAccount(data: UserUpdate): Promise<{ success: boolean; message: string; data: AuthResponse}> {
    return Api.post<{ success: boolean; message: string; data: AuthResponse}>(`/account/update`, data, { 'Content-Type': 'application/json' });
  },
  async updatePassword(data: { oldPassword: string; newpassword: string }): Promise<boolean> {
    if (isMockMode()) {
      return true;
    }
    return Api.post<boolean>(`/account/newpassword`, data, { 'Content-Type': 'application/json' });
  },
  async updateImage(data: FormData): Promise<{ success: boolean; message: string; data: AuthResponse}> {
    return Api.post<{ success: boolean; message: string; data: AuthResponse}>(`/account/update`, data, { 'Content-Type': 'multipart/form-data' });
  },
  async deleteAccount(): Promise<{ success: boolean; message: string;}> {
    return Api.delete<{ success: boolean; message: string;}>(`/account/delete`, { 'Content-Type': 'application/json' });
  },
  async logout(): Promise<{ success: boolean; message: string;}> {
    return Api.post<{ success: boolean; message: string;}>(`/auth/logout`);
  }
};

// Services API (liste et détail). En mode mock, on lit depuis services/datas
export const ServicesApi = {
  async list(): Promise<Service[]> {
    return Api.get<Service[]>(`/services`);
  },
  async detail(id: string): Promise<Service> {
    return Api.get<Service>(`/services/${id}`);
  },
  async getAgents(id: string): Promise<Agent[]> {
    return Api.get<Agent[]>(`/agents/service/${id}`);
  },
  async getAgentById(id: string): Promise<Agent|undefined> {
    return Api.get<Agent>(`/agents/${id}`);
  },
  async reserver ( datas: FormReservation): Promise<{ success: boolean; message: string; reservation: Reservation}> {
    return await Api.post<{ success: boolean; message: string; reservation: Reservation}>(`/reservations`, datas);      
  },
  async getReservations(idclient: string): Promise<{ success: boolean; message: string; reservations: Reservation[]}> {
    return Api.get<{ success: boolean; message: string; reservations: Reservation[]}>(`/reservations/${idclient}/client`);
  },
  async getReservationById(id: string): Promise<Reservation|null> {
    return Api.get<Reservation>(`/reservations/${id}`);
  },
  async cancelReservation(id: string): Promise<boolean> {
    return Api.post<boolean>(`/reservations/cancel/${id}`);
  },
  async removeReservation(id: string): Promise<boolean> {
    return Api.post<boolean>(`/reservations/delete/${id}`);
  },
};

export const ChatApi = {
  async getInoxByUserId(id: string): Promise<{ success: boolean; message: string; inbox: []}> {
    return Api.get<{ success: boolean; message: string; inbox: []}>(`/inbox/${id}`);
  },
  async getMessages(senderId: string, receiverId: string): Promise<{ success: boolean; message: string; messages: Message[]}> {
    return Api.get<{ success: boolean; message: string; messages: Message[]}>(`/messages/${senderId}/${receiverId}`);
  },
  async sendMessage(senderId: string, receiverId: string, text: string): Promise<{ success: boolean; message: string; messages: Message}> {
    return Api.post<{ success: boolean; message: string; messages: Message}>(`/messages/${senderId}`, { receiverId, text });
  },
};

export const TaskApi = {
  async getTaskByAgentId(agentId: string, userIdClient: string): Promise<{ success: boolean; message: string; datas: TacheAgent[] }> {
    return Api.get<{ success: boolean; message: string; datas: TacheAgent[] }>(
      `/taches/${agentId}/agent/${userIdClient}`
    );
  },
  async addTask(clientId: string, agentId: string, task: string): Promise<{ success: boolean; message: string; task: TacheAgent}> {
    return Api.post<{ success: boolean; message: string; task: TacheAgent}>(`/taches/agent/${clientId}`, { agentId, task });
  },
  async deleteTask(taskId: string): Promise<{ success: boolean, message: string }> {
    return Api.delete<{ success: boolean, message: string }>(`/taches/agent/${taskId}`);
  },
  async toggleDone(id: string): Promise<boolean> {
    return Api.get<boolean>(`/taches/toggle/${id}`);
  },
  async getAgentRecommendedByClient(clientId: string): Promise<{ success: boolean; message: string; agents: Agent[]}> {
    return Api.get<{ success: boolean; message: string; agents: Agent[]}>(`/agents/recommended/${clientId}`);
  },
  async ratingAgent(client_id: string, agent_id: string, rating: number, commentaire?: string): Promise<{ success: boolean, message: string }> {
    const data = { client_id, rating, commentaire };
    return Api.post<{ success: boolean, message: string }>(`/rating/${agent_id}`, data, { 'Content-Type': 'application/json' });
  }
};

export const AideApi = {
  async create(data: Rapport): Promise<boolean> {
    return Api.post<boolean>(`/rapports`, data, { 'Content-Type': 'application/json' });
  },
};

