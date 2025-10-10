import Constants from 'expo-constants';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { listServices as mockListServices, getServiceById as mockGetServiceById, getProfileByServiceId, mockLogin, getAgentByUserId } from './datas';
import type { AgentType, Agent, Service, User } from '../types';

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

export type AuthResponse = {
  token: string;
  user: User;
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
  async me() {
    if (isMockMode()) {
      // En mode mock, on n'a pas de décodage de token -> cette route est optionnelle
      // On renvoie une erreur claire si utilisée sans implémentation spécifique
      throw { status: 501, message: 'Non implémenté en mode mock. Utilisez les données du contexte.' };
    }
    return Api.get<AuthResponse['user']>(`/auth/me`);
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
  }
};
