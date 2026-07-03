/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Participant, EventConfig, ScheduleItem } from './types';

export const INITIAL_EVENT_CONFIG: EventConfig = {
  name: '9ª Convenção Municipal de Quartetos',
  date: '17 de Outubro de 2026',
  time: '18h00',
  location: 'IASD Nova Semente - R. Cubatão, 48 - Paraíso, São Paulo - SP, 04013-040',
  maxParticipants: 500,
  description: 'O maior encontro de música vocal harmônica e quartetos do município. Venha adorar e se inspirar com apresentações marcantes, capacitação técnica e o tradicional grande coro de vozes sob a hashtag #CuidandoDePessoas.'
};

export const MOCK_SCHEDULE: ScheduleItem[] = [
  {
    id: 's1',
    time: '17/10 - 17:30',
    title: 'Credenciamento & Recepção',
    description: 'Abertura das portas para recepção dos participantes, retirada de crachás, kits e confraternização inicial.',
    category: 'Geral'
  },
  {
    id: 's2',
    time: '17/10 - 18:00',
    title: 'Sessão de Abertura Oficial',
    description: 'Apresentação da diretoria da convenção, hino oficial e considerações técnicas sobre o encontro.',
    category: 'Abertura',
    speaker: 'Comissão Organizadora'
  },
  {
    id: 's3',
    time: '17/10 - 18:30',
    title: 'Workshop: Afinação e Equilíbrio Vocal',
    description: 'Técnicas avançadas para equalização das quatro vozes, dinâmica vocal em conjunto e uso prático de microfones.',
    category: 'Geral',
    speaker: 'Maestro Fernando Barreto'
  },
  {
    id: 's4',
    time: '17/10 - 19:30',
    title: 'Showcase Especial: Quarteto Canto Livre',
    description: 'Apresentação musical inspiradora do quarteto anfitrião com repertório de harmonia contemporânea.',
    category: 'Musical',
    speaker: 'Quarteto Canto Livre'
  },
  {
    id: 's5',
    time: '17/10 - 20:00',
    title: 'A Grande Noite de Gala dos Quartetos',
    description: 'Desfile principal de quartetos consagrados, incluindo Arautos do Rei, Mensagem, JASD, entre outros.',
    category: 'Musical',
    speaker: 'Diversos Grupos'
  },
  {
    id: 's6',
    time: '17/10 - 21:15',
    title: 'Grande Sorteio & Mensagem de Encerramento',
    description: 'Sorteio de equipamentos profissionais, partituras exclusivas, momento de oração e encerramento oficial.',
    category: 'Encerramento',
    speaker: 'Comissão Organizadora'
  }
];

const RAW_PARTICIPANTS: Omit<Participant, 'registrationType'>[] = [];

export const INITIAL_PARTICIPANTS: Participant[] = [];
