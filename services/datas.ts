// Données de tests locales pour PowerCare
// Utiles pour maquettage/POC avant branchement à la vraie API

import type {
  User,
  Agent,
  Client,
  AgentProfile,
  ClientProfile,
  AnyProfile,
  AgentType,
  ClientType,
  Service,
  AuthResponse,
  Tache,
  Reservation,
  Evaluation,
  Rapport,
  Message,
  Pricing,
} from '../types';

// Faux token pour les tests locaux
export const FAKE_TEST_TOKEN = 'fake-token-powercare-123456';

// Helpers
const uid = (n = 8) => Math.random().toString(36).slice(2, 2 + n);

// Utilisateurs
export const users: User[] = [
  {
    id: 'u_agent_1',
    name: 'Awa Diop',
    email: 'awa.agent@powercare.test',
    password: 'password123',
    phone: '+221700000001',
    role: 'agent',
    is_active: true,
  },
  {
    id: 'u_agent_2',
    name: 'Moussa Ndiaye',
    email: 'moussa.agent@powercare.test',
    password: 'password123',
    phone: '+221700000002',
    role: 'agent',
    is_active: true,
  },
  {
    id: 'u_client_pers_1',
    name: 'Fatou Sarr',
    email: 'fatou.client@powercare.test',
    password: 'password123',
    phone: '+221700000101',
    role: 'client',
    is_active: true,
  },
  {
    id: 'u_client_ent_1',
    name: 'Entreprise Kër Yaram',
    email: 'contact@keryaram.test',
    password: 'password123',
    phone: '+221700000201',
    role: 'client',
    is_active: true,
  },
];

// Pricings (mock)
export const pricings: Pricing[] = [
  {
    id: 'p_baby_1_h',
    service_id: 's_baby_1',
    amount: 100,
    currency: '$',
    period: 'journalier',
    description: 'une petite desciption',
    is_active: true,
  },
  {
    id: 'p_baby_1_j',
    service_id: 's_baby_1',
    amount: 30,
    currency: '$',
    period: 'Hebdomadaire',
    description: 'une petite desciption',
    is_active: true,
  },
  {
    id: 'p_baby_2_h',
    service_id: 's_baby_2',
    amount: 6000,
    currency: '$',
    period: 'mensuel',
    description: 'une petite desciption',
    is_active: true,
  },
  {
    id: 'p_menage_1_h',
    service_id: 's_menage_1',
    amount: 5000,
    currency: '$',
    period: 'Journalier',
    description: 'une petite desciption',
    is_active: true,
  },
  {
    id: 'p_menage_1_hb',
    service_id: 's_menage_1',
    amount: 28000,
    currency: '$',
    period: 'hebdomadaire',
    description: 'une petite desciption',
    is_active: true,
  },
  {
    id: 'p_menage_2_h',
    service_id: 's_menage_2',
    amount: 10000,
    currency: '$',
    period: 'mensuel',
    description: 'une petite desciption',
    is_active: true,
  },
];

// Messages (mock)
export const messages: Message[] = [
  {
    id: 'm_0001',
    reservation_id: 'r_0001',
    sender_id: 'u_client_pers_1',
    receiver_id: 'u_agent_2',
    content: 'Bonjour, pouvez-vous arriver 10 minutes plus tôt ?',
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'm_0002',
    reservation_id: 'r_0001',
    sender_id: 'u_agent_2',
    receiver_id: 'u_client_pers_1',
    content: 'Bonjour, c’est noté. À tout à l’heure !',
    is_read: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'm_0003',
    reservation_id: 'r_0002',
    sender_id: 'u_client_ent_1',
    receiver_id: 'u_agent_1',
    content: 'Merci de confirmer la disponibilité pour demain.',
    is_read: false,
    created_at: new Date().toISOString(),
  },
];

function defaultServiceIdForAgentType(type: AgentType): string {
  const found = services.find((s) => s.type_agent === type && s.actif);
  return found ? found.id : services[0]?.id || 's_menage_1';
}

// Tâches par service (mock)
export const taches: Tache[] = [
  {
    id: 't_baby_1',
    service_id: 's_baby_1',
    nom: "Jeux éducatifs",
    description: "Activités ludiques et pédagogiques adaptées à l'âge.",
    supplement: false,
  },
  {
    id: 't_baby_2',
    service_id: 's_baby_1',
    nom: "Préparation repas enfant",
    description: "Préparer et donner le repas (ingrédients fournis par les parents).",
    supplement: true,
  },
  {
    id: 't_menage_1',
    service_id: 's_menage_1',
    nom: "Dépoussiérage",
    description: "Dépoussiérer les surfaces, meubles et appareils.",
    supplement: false,
  },
  {
    id: 't_menage_2',
    service_id: 's_menage_1',
    nom: "Nettoyage sols",
    description: "Aspiration et lavage des sols.",
    supplement: false,
  },
  {
    id: 't_menage_3',
    service_id: 's_menage_2',
    nom: "Vitres",
    description: "Nettoyage des vitres et encadrements.",
    supplement: true,
  },
];

// Réservations (mock)
export const reservations: Reservation[] = [
  {
    id: 'r_0001',
    client_id: 'u_client_pers_1',
    service_id: 's_menage_1',
    agent_id: 'u_agent_2',
    date_debut: new Date().toISOString(),
    date_fin: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // +2h
    frequence: 'ponctuelle',
    adresse: 'Dakar, Liberté 6',
    nombre_personnes: 3,
    taches_specifiques: ['Dépoussiérage', 'Cuisine'],
    taille_logement: 'T3',
    equipements_fournis: ['Aspirateur', 'Produits'],
    conditions_particulieres: 'Allergie aux parfums forts',
    transport_inclus: false,
    urgence: false,
    mode_paiement: 'mobile',
    prix_estime: 15000,
    statut: 'confirmée',
    commentaire: 'Arriver avant 10h svp',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'r_0002',
    client_id: 'u_client_ent_1',
    service_id: 's_baby_1',
    agent_id: 'u_agent_1',
    date_debut: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // demain
    date_fin: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    frequence: 'hebdomadaire',
    adresse: 'Dakar, Plateau',
    nombre_personnes: 1,
    taches_specifiques: ['Jeux éducatifs'],
    taille_logement: 'Bureau',
    equipements_fournis: ['Goûter'],
    conditions_particulieres: '',
    transport_inclus: true,
    urgence: false,
    mode_paiement: 'facture',
    prix_estime: 20000,
    statut: 'en_attente',
    commentaire: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Évaluations (mock)
export const evaluations: Evaluation[] = [
  {
    id: 'e_1001',
    reservation_id: 'r_0001',
    client_id: 'u_client_pers_1',
    agent_id: 'u_agent_2',
    note: 5,
    commentaire: 'Travail impeccable, merci !',
    created_at: new Date().toISOString(),
  },
];

// Rapports (mock)
export const rapports: Rapport[] = [
  {
    id: 'rp_9001',
    reservation_id: 'r_0001',
    auteur_id: 'u_agent_2',
    type: 'qualité',
    description: 'Prestation effectuée conformément au cahier des charges.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'rp_9002',
    reservation_id: 'r_0002',
    auteur_id: 'u_client_ent_1',
    type: 'suivi',
    description: 'Demande de confirmation pour la semaine prochaine.',
    created_at: new Date().toISOString(),
  },
];

// Clients
export const clients: Client[] = [
  {
    user_id: 'u_client_pers_1',
    user: users.find((u) => u.id === 'u_client_pers_1') as any,
    type: 'personnel',
    adresse: 'Dakar, Liberté 6',
  },
  {
    user_id: 'u_client_ent_1',
    user: users.find((u) => u.id === 'u_client_ent_1') as any,
    type: 'entreprise',
    adresse: 'Dakar, Plateau',
    entreprise_nom: 'Kër Yaram SA',
  },
];

// Services
export const services: Service[] = [
  {
    id: 's_baby_1',
    nom: 'Garde d’enfant',
    image: require('../assets/items/babysitter.jpg'),
    description: 'Prise en charge des enfants à domicile: jeux, repas, accompagnement.',
    type_agent: 'baysitter',
    prix_base: 8000,
    actif: true,
    taches: [taches[0], taches[1]],
    pricings: [pricings[0], pricings[1], pricings[2]],
  },
  {
    id: 's_menage_1',
    nom: 'Ménage à domi..',
    image: require('../assets/items/cleaner.png'),
    description: 'Nettoyage des pièces principales (poussière, sols, sanitaires).',
    type_agent: 'menager',
    prix_base: 5000,
    actif: true,
    taches: [taches[2], taches[3], taches[4]],
    pricings: [pricings[3], pricings[4], pricings[5]],
  },
];

// Agents
export const agents: Agent[] = [
  {
    id: 'agent_1',
    user_id: 'u_agent_1',
    user: users.find((u) => u.id === 'u_agent_1') as any,
    type: 'baysitter',
    experience: 4,
    disponibilite: 'temps partiel',
    tarif_horaire: 5000,
    adresse: 'Dakar, Point E',
    statut: 'disponible',
    is_recommended: true,
    is_badges: true,
    rating: 5,
    service_id: 's_baby_1',
    service: services.find((s) => s.id === 's_baby_1') as any,
    created_at: '',
  },
  {
    id: 'agent_2',
    user_id: 'u_agent_3',
    user: users.find((u) => u.id === 'u_agent_2') as any,
    type: 'baysitter',
    experience: 4,
    disponibilite: 'temps partiel',
    tarif_horaire: 5000,
    adresse: 'Dakar, Point E',
    statut: 'disponible',
    is_recommended: true,
    is_badges: true,
    rating: 4,
    service_id: 's_baby_1',
    service: services.find((s) => s.id === 's_baby_1') as any,
    created_at: ''
  },
  {
    id: 'agent_3',
    user_id: 'u_agent_2',
    user: users.find((u) => u.id === 'u_agent_2') as any,
    type: 'menager',
    experience: 7,
    disponibilite: 'temps plein',
    tarif_horaire: 3500,
    adresse: 'Dakar, Parcelles Assainies',
    statut: 'occupe',
    is_recommended: false,
    service_id: 's_menage_1',
    service: services.find((s) => s.id === 's_menage_1') as any,
    is_badges: true,
    rating: 3,
    created_at: ''
  },
];

export function listServices(filter?: { type_agent?: AgentType }) {
  if (!filter?.type_agent) return services;
  return services.filter((s) => s.type_agent === filter.type_agent);
}

export function getServiceById(id: string) {
  return services.find((s) => s.id === id) || null;
}

export function getProfileByServiceId(id: string): Agent[] {
  return agents.filter((a) => a.service_id === id);
}

export function getAgentByUserId(id: string): Agent | undefined {
  return agents.find((a) => a.user_id === id);
}

// Connexion locale simulée
export async function mockLogin(email: string, password: string): Promise<AuthResponse> {
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    throw { status: 401, message: "Identifiants invalides.", details: null };
  }
  if (!user.is_active) {
    throw { status: 403, message: "Compte inactif. Contactez le support.", details: null };
  }
  if (user.password !== password) {
    throw { status: 401, message: "Email ou mot de passe incorrect.", details: null };
  }

  // Pour rester compatible avec AuthResponse
  return {
    token: FAKE_TEST_TOKEN,
    user: { id: user.id, name: user.name, email: user.email },
  };
}

export async function mockMe(userId: string) {
  const profile = getProfileByUserId(userId);
  if (!profile) throw { status: 404, message: "Profil introuvable.", details: null };
  // On renvoie un profil épuré côté client
  return profile;
}

// Génération rapide d'un nouvel utilisateur local (si besoin de semer plus de données)
export function createLocalUser(params: {
  role: 'agent' | 'client';
  name: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  extra?: Partial<Agent | Client> & { type?: AgentType | ClientType };
}): AnyProfile {
  const id = `u_${uid()}`;
  const base: User = {
    id,
    name: params.name,
    email: params.email,
    password: params.password ?? 'password123',
    phone: params.phone ?? '+221700000000',
    role: params.role,
    avatar: params.avatar,
    is_active: true,
  };
  users.push(base);

  if (params.role === 'agent') {
    const agent: Agent = {
      user_id: id,
      type: (params.extra?.type as AgentType) ?? 'baysitter',
      experience: (params.extra as any)?.experience ?? 1,
      disponibilite: (params.extra as any)?.disponibilite ?? 'occasionnel',
      tarif_horaire: (params.extra as any)?.tarif_horaire ?? 3000,
      adresse: (params.extra as any)?.adresse ?? 'Dakar',
      statut: (params.extra as any)?.statut ?? 'disponible',
      is_recommended: (params.extra as any)?.is_recommended ?? false,
      service_id:
        (params.extra as any)?.service_id ?? defaultServiceIdForAgentType(((params.extra?.type as AgentType) ?? 'baysitter')),
    };
    agents.push(agent);
    return { user: base as any, agent };
  }

  const client: Client = {
    user_id: id,
    type: (params.extra?.type as ClientType) ?? 'personnel',
    adresse: (params.extra as any)?.adresse ?? 'Dakar',
    entreprise_nom: (params.extra as any)?.entreprise_nom,
  };
  clients.push(client);
  return { user: base as any, client };
}
