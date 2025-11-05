// Types globaux pour l'application PowerCare

// Rôles d'utilisateurs
export type UserRole = 'agent' | 'client';

// Types d'agents et de clients
export type ClientType = 'particulier' | 'entreprise';

// Disponibilité et statut des agents
export type Disponibilite = 'temps plein' | 'temps partiel' | 'occasionnel';
export type StatutAgent = 'disponible' | 'occupé';

// Utilisateur de base (table: user)
export interface UserUpdate {
  name: string;
  email: string;
  phone: string;
  type: "babysitter" | "menager" | "particulier" | "entreprise";
  adresse?: string;
  entreprise_nom?: string;
}

export interface UserCreate {
  name: string;
  email: string;
  phone: string;
  type: "particulier" | "entreprise";
  password: string;
  entreprise_nom?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // NOTE: seulement pour les données de tests locales
  phone: string;
  role: UserRole;
  adresse?: string;
  avatar?: string;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
}

// Agent (table: agent)
export interface Agent {
  id: string;
  user_id: string;
  user?: User;
  category_id: string;
  category?: Category;
  experience: number; // en années
  disponibilite: Disponibilite;
  statut: StatutAgent;
  rating: number;
  is_badges: boolean;
  recommended_at: string | null;
  recommended_by?: string;
  service_id: string; // référence à Service.id principal proposé par l'agent
  service?: Service;
  created_at: string;
}

// Client (table: client)
export interface Client {
  id: string;
  user_id: string;
  user?: User;
  type: ClientType;
  entreprise_nom?: string; // requis si type = 'entreprise'
}

export type AnyProfile = Agent | Client;

// Service (table: services)
export interface Service {
  id: string;
  nom: string;
  image: string;
  description: string;
  prix_base: number;
  is_actif: boolean;
  taches?: Tache[];
  pricings?: Pricing[];
  created_at: string;
}

// Tâche liée à un service (table: taches)
export interface Tache {
  id: string;
  service_id: string;
  service?: Service;
  nom: string;
  description: string;
}

export interface TacheAgent {
  id: string;
  client_id: string;
  agent?: Agent;
  agent_id: string; 
  title: string;
  done: boolean;
  created_at: string;
}

export interface AuthLoginPayload {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: User;
  profile: AnyProfile;
}

// Alias pratique pour l'API
export type AuthResponse = AuthResult;

// Réservation d'une mission (table: reservations)
export interface Reservation {
  id: string;
  client_id: string; // FK -> User.id (role: client)
  client?: Client;
  service_id: string; // FK -> Service.id
  service?: Service;
  agent_id: string; // FK -> User.id (role: agent)
  agent?: Agent;
  frequence: string; // ex: heure, jour, semaine, mois, année, indefini
  date_reservation: string; // ISO string 
  duree: string; // ex: 1 jour, 1 semaine, etc. 
  urgence?: boolean;
  transport_inclus?: boolean;
  adresse: string;
  nombre_personnes: number;
  taches_specifiques?: string; // liste libre de tâches demandées
  taille_logement?: string; // libre: studio, T2, etc.
  conditions_particulieres?: string;
  phone: string; // ex: +221700000000
  statut: string; // libre: en attente, confirmée, annulée, ...
  created_at: string; // ISO string
  updated_at: string; // ISO string
  deleted_at: string | null;
}

// Réservation d'une mission (table: reservations)
export interface FormReservation {
  client_id: string; // FK -> User.id (role: client)
  service_id: string; // FK -> Service.id
  agent_id: string; // FK -> User.id (role: agent)
  frequence: string; // ex: heure, jour, semaine, mois, année, indefini
  date_reservation: string; // ISO string 
  adresse: string;
  duree: string; // ex: 1 jour, 1 semaine, etc. 
  urgence?: boolean;
  transport_inclus?: boolean;
  nombre_personnes?: number;
  taches_specifiques?: string; // liste libre de tâches demandées
  taille_logement?: string; // libre: studio, T2, etc.
  conditions_particulieres?: string;
  phone: string; // libre: en_attente, confirmée, en_cours, terminée, annulée, ...
  // mode_paiement?: string; // libre: especes, carte, mobile, ...
  // prix_estime?: number;
  // commentaire?: string;
}

// Évaluation (table: evaluations)
export interface Evaluation {
  client_id: string;
  agent_id: string;
  rating: number; // 1..5 
  commentaire?: string;
}

// Rapport (table: rapports)
export interface Rapport {
  user_id: string;
  type: string; // 'aide' | 'plainte'
  description: string;
}

// Message (table: messages)
export interface Message {
  id: string;
  reservation_id: string; // FK -> Reservation.id
  sender_id: string; // FK -> User.id (expéditeur)
  receiver_id: string; // FK -> User.id (destinataire)
  user?: User;
  content: string;
  is_read: boolean;
  created_at: string; // ISO string
}

// Tarification d'un service (table: pricings)
export interface Pricing {
  id: string;
  service_id: string; // FK -> Service.id
  amount: number;
  currency: string;
  period: string; // ex: 'horaire', 'journalier', 'hebdomadaire', 'mensuel'
  description: string; // string
  is_active: boolean;
}
