/**
 * Campamento Gecko - Type Definitions
 * Estruturas de dados alinhadas com o schema Supabase
 */

export type UserRole = 'director' | 'monitor' | 'admin';

export interface User {
  id: string;
  email: string;
  nome: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  id: string;
  schedule_id: string;
  time: string;           // HH:MM
  title: string;
  description: string;
  notes: string[];
  assignees: string[];
  completed: boolean;
  notificationSent?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Schedule {
  id: string;
  titulo: string;
  descricao?: string;
  data: string;           // YYYY-MM-DD
  criado_por: string;     // FK users.id
  time_slots: TimeSlot[];
  created_at: string;
  updated_at: string;
}

// Legacy alias for backwards compat
export interface CampDay {
  id: string;
  dayNumber: number;
  title: string;
  date?: string;
  timeSlots: TimeSlot[];
  createdAt: number;
  updatedAt: number;
}

export interface Activity {
  id: string;
  titulo: string;
  descricao: string;
  categoria: 'outdoor' | 'indoor' | 'craft' | 'sport' | 'other';
  instrucoes?: string;
  video_url?: string;
  imagem_url?: string;
  materiais: string[];
  duracao?: number;       // minutos
  dificuldade?: 'facil' | 'medio' | 'dificil';
  criado_por: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  schedule_id: string;
  sender_id: string;
  sender?: User;
  conteudo: string;
  attachment_url?: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  schedule_id?: string;
  time_slot_id?: string;
  titulo: string;
  mensagem: string;
  lido: boolean;
  created_at: string;
}

// Legacy notification type
export interface Notification {
  id: string;
  dayId: string;
  timeSlotId: string;
  title: string;
  body: string;
  scheduledTime: number;
  sent: boolean;
  createdAt: number;
}

export interface AppState {
  days: CampDay[];
  currentDayId: string | null;
  notifications: Notification[];
  lastSync: number;
}

export interface NotificationSchedule {
  timeSlotId: string;
  dayId: string;
  title: string;
  description: string;
  scheduledTime: number;
  originalTime: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
