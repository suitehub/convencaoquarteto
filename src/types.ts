/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  city?: string;
  status: 'Pendente' | 'Presente';
  checkInTime?: string;
  registrationDate: string;
  registrationType: 'Público' | 'Participante';
}

export interface EventConfig {
  name: string;
  date: string;
  time: string;
  location: string;
  maxParticipants: number;
  description: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description: string;
  category: 'Geral' | 'Musical' | 'Intervalo' | 'Abertura' | 'Encerramento';
  speaker?: string;
}

export type UserRole = 'public' | 'participant' | 'reception' | 'organizer';

export interface StaffUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  createdAt: string;
}

export type PublicView = 'splash' | 'landing' | 'cadastro' | 'login';
export type ParticipantView = 'home' | 'programacao' | 'meus-dados';
export type ReceptionView = 'login' | 'dashboard' | 'detalhes-participante';
export type OrganizerView = 'dashboard' | 'participantes' | 'estatisticas' | 'sorteio' | 'configuracoes';
