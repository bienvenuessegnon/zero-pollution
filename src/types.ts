export type Severity = 'faible' | 'moyen' | 'grave' | 'critique';

export type Category =
  | 'Ordures'
  | 'Pollution'
  | 'Caniveau bouché'
  | 'Eau stagnante'
  | 'Décharge sauvage'
  | 'Fumée toxique'
  | 'Incendie'
  | 'Autre';

export type IncidentStatus =
  | 'En attente'
  | 'Vérification'
  | 'Intervention en cours'
  | 'Résolu';

export interface User {
  id: string;
  pseudonym: string;
  realName: string;
  role: 'citoyen' | 'admin';
  phone?: string;
  email?: string;
  avatarUrl?: string;
  reputationPoints: number;
}

export interface Comment {
  id: string;
  incidentId: string;
  userId: string;
  userPseudonym: string;
  userRole: 'citoyen' | 'admin';
  text: string;
  createdAt: string;
  extraPhotoUrl?: string;
}

export interface CommunityValidation {
  userId: string;
  type: 'confirm' | 'fake';
  createdAt: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: Category;
  severity: Severity;
  status: IncidentStatus;
  statusHistory: {
    status: IncidentStatus;
    updatedAt: string;
    updatedBy: string;
    comment?: string;
  }[];
  latitude: number;
  longitude: number;
  locationName: string;
  imageUrl: string;
  resolvedImageUrl?: string;
  reportedBy: string; // userId
  reportedByPseudonym: string;
  reportedByRealName: string; // visible only to admins
  createdAt: string;
  confirmations: string[]; // list of userIds
  fakeReports: string[]; // list of userIds
  commentsCount: number;
  aiExplanation?: string;
  aiConfidenceScore?: number;
}

export interface NotificationAlert {
  id: string;
  type: 'critical' | 'status_change' | 'whatsapp_simulation' | 'citizen_validation';
  title: string;
  message: string;
  time: string;
  read: boolean;
  incidentId?: string;
}
