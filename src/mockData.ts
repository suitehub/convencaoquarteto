/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Participant, EventConfig, ScheduleItem } from './types';

export const INITIAL_EVENT_CONFIG: EventConfig = {
  name: '9ª Convenção Municipal de Quartetos',
  date: '24 a 26 de Julho de 2026',
  time: 'A partir das 19:00',
  location: 'IASD Nova Semente - R. Cubatão, 48 - Paraíso, São Paulo - SP, 04013-040',
  maxParticipants: 500,
  description: 'O maior encontro de música vocal harmônica e quartetos do município. Venha adorar e se inspirar com apresentações marcantes, capacitação técnica e o tradicional grande coro de vozes sob a hashtag #CuidandoDePessoas.'
};

export const MOCK_SCHEDULE: ScheduleItem[] = [
  {
    id: 's1',
    time: '24/07 - 18:00',
    title: 'Credenciamento & Recepção',
    description: 'Abertura das portas para retirada de crachás, kits do participante e confraternização inicial.',
    category: 'Geral'
  },
  {
    id: 's2',
    time: '24/07 - 19:30',
    title: 'Sessão de Abertura Oficial',
    description: 'Apresentação da diretoria da convenção, hino oficial e considerações técnicas sobre o encontro.',
    category: 'Abertura',
    speaker: 'Comissão Organizadora'
  },
  {
    id: 's3',
    time: '24/07 - 20:15',
    title: 'Showcase de Abertura: Quarteto Canto Livre',
    description: 'Apresentação musical especial do quarteto anfitrião e campeão da última edição.',
    category: 'Musical',
    speaker: 'Quarteto Canto Livre'
  },
  {
    id: 's4',
    time: '25/07 - 09:00',
    title: 'Workshop: Afinação Vocal e Acústica de Grupo',
    description: 'Técnicas avançadas para equalização das quatro vozes, balanço de harmonia e uso dinâmico de microfone.',
    category: 'Geral',
    speaker: 'Maestro Fernando Barreto'
  },
  {
    id: 's5',
    time: '25/07 - 10:30',
    title: 'Coffee Break & Network',
    description: 'Momento de socialização, troca de contatos e ensaios rápidos nos corredores.',
    category: 'Intervalo'
  },
  {
    id: 's6',
    time: '25/07 - 11:00',
    title: 'Mesa Redonda: A Gestão de um Quarteto de Sucesso',
    description: 'Como organizar ensaios, presença digital, figurinos e seleção de repertório atraente.',
    category: 'Geral',
    speaker: 'Mediação: Débora Mendes e convidados'
  },
  {
    id: 's7',
    time: '25/07 - 12:30',
    title: 'Almoço Livre',
    description: 'Intervalo para alimentação nas redondezas do auditório.',
    category: 'Intervalo'
  },
  {
    id: 's8',
    time: '25/07 - 14:30',
    title: 'Ensaio Geral: Grande Coro de Quartetos',
    description: 'Ensaio com todas as vozes juntas para a gravação da canção tema da 8ª convenção.',
    category: 'Geral',
    speaker: 'Regência: Pr. Roberto Silva'
  },
  {
    id: 's9',
    time: '25/07 - 17:00',
    title: 'Sessão Musical: Novos Talentos (Quarteto Alfa & Quarteto Acorde)',
    description: 'Apresentações curtas de 15 minutos focadas em quartetos iniciantes que se destacaram no ano.',
    category: 'Musical'
  },
  {
    id: 's10',
    time: '25/07 - 20:00',
    title: 'A Grande Noite dos Quartetos (Sessão Premium)',
    description: 'Desfile principal de quartetos consagrados de várias partes do Brasil e exterior. Um espetáculo de harmonia.',
    category: 'Musical',
    speaker: 'Diversos Grupos'
  },
  {
    id: 's11',
    time: '26/07 - 09:30',
    title: 'Painel Técnico de Julgamento Vocal',
    description: 'Análise de quesitos como afinação, dicção, presença de palco e arranjo técnico.',
    category: 'Geral',
    speaker: 'Banca Examinadora'
  },
  {
    id: 's12',
    time: '26/07 - 11:00',
    title: 'Grande Sorteio & Mensagem Musical de Encerramento',
    description: 'Sorteio de microfones profissionais, partituras exclusivas e encerramento espiritual e musical.',
    category: 'Encerramento',
    speaker: 'Quarteto Cântico Novo'
  }
];

const RAW_PARTICIPANTS: Omit<Participant, 'registrationType'>[] = [
  {
    id: 'part-01',
    name: 'Carlos Eduardo Santos',
    email: 'carlos.edu@gmail.com',
    phone: '(11) 98122-3432',
    city: 'São Paulo - SP',
    status: 'Presente',
    checkInTime: '24/07 18:15',
    registrationDate: '15/05/2026'
  },
  {
    id: 'part-02',
    name: 'Mariana Costa Ferreira',
    email: 'mari.ferreira@hotmail.com',
    phone: '(21) 97112-9080',
    city: 'Rio de Janeiro - RJ',
    status: 'Pendente',
    registrationDate: '16/05/2026'
  },
  {
    id: 'part-03',
    name: 'Mateus Oliveira Dias',
    email: 'mateus.dias@outlook.com',
    phone: '(31) 98224-5543',
    city: 'Belo Horizonte - MG',
    status: 'Presente',
    checkInTime: '24/07 18:22',
    registrationDate: '17/05/2026'
  },
  {
    id: 'part-04',
    name: 'Felipe Augusto Alencar',
    email: 'felipe.alencar@gmail.com',
    phone: '(41) 99823-1122',
    city: 'Curitiba - PR',
    status: 'Pendente',
    registrationDate: '18/05/2026'
  },
  {
    id: 'part-05',
    name: 'Juliana Portela Santos',
    email: 'ju.portela@gmail.com',
    phone: '(51) 99114-8877',
    city: 'Porto Alegre - RS',
    status: 'Presente',
    checkInTime: '24/07 18:30',
    registrationDate: '20/05/2026'
  },
  {
    id: 'part-06',
    name: 'Arthur Vinícius Pereira',
    email: 'arthur.vp@yahoo.com.br',
    phone: '(61) 98452-1200',
    city: 'Brasília - DF',
    status: 'Pendente',
    registrationDate: '21/05/2026'
  },
  {
    id: 'part-07',
    name: 'Lucas Barbosa Lima',
    email: 'lucas.barbosa@gmail.com',
    phone: '(71) 99234-7788',
    city: 'Salvador - BA',
    status: 'Presente',
    checkInTime: '24/07 18:41',
    registrationDate: '22/05/2026'
  },
  {
    id: 'part-08',
    name: 'Aline Schmidt Rocha',
    email: 'aline.schmidt@live.com',
    phone: '(47) 98845-6611',
    city: 'Joinville - SC',
    status: 'Pendente',
    registrationDate: '24/05/2026'
  },
  {
    id: 'part-09',
    name: 'Rafael Mendes de Souza',
    email: 'rafa.souza@gmail.com',
    phone: '(19) 98114-5544',
    city: 'Campinas - SP',
    status: 'Pendente',
    registrationDate: '25/05/2026'
  },
  {
    id: 'part-10',
    name: 'Bruno Ramos Albuquerque',
    email: 'bruno.albu@gmail.com',
    phone: '(81) 98711-2233',
    city: 'Recife - PE',
    status: 'Presente',
    checkInTime: '24/07 18:45',
    registrationDate: '25/05/2026'
  },
  {
    id: 'part-11',
    name: 'Gabriela Vasconcelos',
    email: 'gabi.vasconcelos@uol.com.br',
    phone: '(85) 99612-4455',
    city: 'Fortaleza - CE',
    status: 'Pendente',
    registrationDate: '26/05/2026'
  },
  {
    id: 'part-12',
    name: 'Daniel Silveira Gomes',
    email: 'daniel.silveira@gmail.com',
    phone: '(27) 99452-9900',
    city: 'Vitória - ES',
    status: 'Presente',
    checkInTime: '24/07 18:50',
    registrationDate: '28/05/2026'
  },
  {
    id: 'part-13',
    name: 'Gustavo Henrique Silva',
    email: 'gustavo.henrique@gmail.com',
    phone: '(62) 99124-7711',
    city: 'Goiânia - GO',
    status: 'Pendente',
    registrationDate: '29/05/2026'
  },
  {
    id: 'part-14',
    name: 'Camila Teixeira Ramos',
    email: 'camila.ramos@hotmail.com',
    phone: '(11) 97223-5566',
    city: 'Guarulhos - SP',
    status: 'Pendente',
    registrationDate: '01/06/2026'
  },
  {
    id: 'part-15',
    name: 'Thiago Nogueira Paiva',
    email: 'thiago.paiva@gmail.com',
    phone: '(34) 99881-2233',
    city: 'Uberlândia - MG',
    status: 'Presente',
    checkInTime: '24/07 18:55',
    registrationDate: '02/06/2026'
  },
  {
    id: 'part-16',
    name: 'Rodrigo Antunes Carvalho',
    email: 'rodrigo.antunes@gmail.com',
    phone: '(16) 99123-4567',
    city: 'Ribeirão Preto - SP',
    status: 'Pendente',
    registrationDate: '04/06/2026'
  },
  {
    id: 'part-17',
    name: 'Larissa Custódio Melo',
    email: 'larissa.custodio@outlook.com',
    phone: '(91) 98112-9988',
    city: 'Belém - PA',
    status: 'Pendente',
    registrationDate: '05/06/2026'
  },
  {
    id: 'part-18',
    name: 'Leandro Castro de Assis',
    email: 'leandro.assis@gmail.com',
    phone: '(21) 96234-5511',
    city: 'Niterói - RJ',
    status: 'Presente',
    checkInTime: '24/07 19:02',
    registrationDate: '08/06/2026'
  },
  {
    id: 'part-19',
    name: 'Vinícius Martins Coimbra',
    email: 'vinicius.mc@gmail.com',
    phone: '(43) 99611-2244',
    city: 'Londrina - PR',
    status: 'Pendente',
    registrationDate: '10/06/2026'
  },
  {
    id: 'part-20',
    name: 'Isabela Fontes Rocha',
    email: 'isabela.rocha@yahoo.com',
    phone: '(79) 99911-8822',
    city: 'Aracaju - SE',
    status: 'Pendente',
    registrationDate: '12/06/2026'
  },
  {
    id: 'part-21',
    name: 'Otávio Augusto Machado',
    email: 'otavio.machado@gmail.com',
    phone: '(31) 98411-2233',
    city: 'Contagem - MG',
    status: 'Presente',
    checkInTime: '24/07 19:10',
    registrationDate: '14/06/2026'
  },
  {
    id: 'part-22',
    name: 'Sandro Moreira Lima',
    email: 'sandro.moreira@gmail.com',
    phone: '(11) 98223-1100',
    city: 'Santo André - SP',
    status: 'Pendente',
    registrationDate: '15/06/2026'
  },
  {
    id: 'part-23',
    name: 'Patrícia Borges Neves',
    email: 'patricia.neves@gmail.com',
    phone: '(12) 99743-4411',
    city: 'São José dos Campos - SP',
    status: 'Presente',
    checkInTime: '24/07 19:15',
    registrationDate: '16/06/2026'
  },
  {
    id: 'part-24',
    name: 'Marcos Roberto Vieira',
    email: 'marcos.vieira@outlook.com',
    phone: '(13) 99122-3344',
    city: 'Santos - SP',
    status: 'Pendente',
    registrationDate: '18/06/2026'
  },
  {
    id: 'part-25',
    name: 'Davi Luiz Nascimento',
    email: 'davi.luiz@gmail.com',
    phone: '(65) 99233-1188',
    city: 'Cuiabá - MT',
    status: 'Pendente',
    registrationDate: '19/06/2026'
  },
  {
    id: 'part-26',
    name: 'Priscila Mendes Vieira',
    email: 'pri.mendes@gmail.com',
    phone: '(15) 99112-2233',
    city: 'Sorocaba - SP',
    status: 'Presente',
    checkInTime: '24/07 19:18',
    registrationDate: '20/06/2026'
  },
  {
    id: 'part-27',
    name: 'Guilherme Augusto Santos',
    email: 'gui.santos@gmail.com',
    phone: '(11) 99422-7788',
    city: 'Osasco - SP',
    status: 'Pendente',
    registrationDate: '22/06/2026'
  },
  {
    id: 'part-28',
    name: 'Eduardo Henrique Paiva',
    email: 'edu.paiva@gmail.com',
    phone: '(32) 99912-3344',
    city: 'Juiz de Fora - MG',
    status: 'Pendente',
    registrationDate: '23/06/2026'
  },
  {
    id: 'part-29',
    name: 'Letícia Corrêa Dias',
    email: 'leticia.correa@gmail.com',
    phone: '(48) 99111-2244',
    city: 'Florianópolis - SC',
    status: 'Presente',
    checkInTime: '24/07 19:25',
    registrationDate: '24/06/2026'
  },
  {
    id: 'part-30',
    name: 'Murilo Xavier de Souza',
    email: 'murilo.souza@gmail.com',
    phone: '(19) 98341-2299',
    city: 'Piracicaba - SP',
    status: 'Pendente',
    registrationDate: '25/06/2026'
  },
  {
    id: 'part-31',
    name: 'Renato Mendes Cunha',
    email: 'renato.cunha@gmail.com',
    phone: '(84) 99112-7711',
    city: 'Natal - RN',
    status: 'Pendente',
    registrationDate: '26/06/2026'
  },
  {
    id: 'part-32',
    name: 'Tatiane Antunes Lima',
    email: 'tati.lima@gmail.com',
    phone: '(21) 98223-9988',
    city: 'São Gonçalo - RJ',
    status: 'Presente',
    checkInTime: '24/07 19:30',
    registrationDate: '26/06/2026'
  },
  {
    id: 'part-33',
    name: 'Samuel Lucas Ferreira',
    email: 'samuel.lucas@gmail.com',
    phone: '(11) 99122-3311',
    city: 'Mogi das Cruzes - SP',
    status: 'Pendente',
    registrationDate: '27/06/2026'
  },
  {
    id: 'part-34',
    name: 'Hugo Vinícius de Souza',
    email: 'hugo.souza@gmail.com',
    phone: '(31) 98112-5566',
    city: 'Uberaba - MG',
    status: 'Pendente',
    registrationDate: '27/06/2026'
  },
  {
    id: 'part-35',
    name: 'Vanessa Portela Cruz',
    email: 'vanessa.cruz@gmail.com',
    phone: '(41) 99223-4411',
    city: 'Maringá - PR',
    status: 'Presente',
    checkInTime: '24/07 19:33',
    registrationDate: '28/06/2026'
  },
  {
    id: 'part-36',
    name: 'Jonathan Santos Reis',
    email: 'jonathan.reis@gmail.com',
    phone: '(71) 99123-5544',
    city: 'Feira de Santana - BA',
    status: 'Pendente',
    registrationDate: '28/06/2026'
  },
  {
    id: 'part-37',
    name: 'Douglas Alencar Neves',
    email: 'douglas.neves@gmail.com',
    phone: '(83) 99611-3344',
    city: 'João Pessoa - PB',
    status: 'Pendente',
    registrationDate: '29/06/2026'
  },
  {
    id: 'part-38',
    name: 'Carla Cristina Gomes',
    email: 'carla.gomes@gmail.com',
    phone: '(11) 99823-3344',
    city: 'Jundiaí - SP',
    status: 'Presente',
    checkInTime: '24/07 19:35',
    registrationDate: '29/06/2026'
  },
  {
    id: 'part-39',
    name: 'Roberto Mendes Assis',
    email: 'roberto.assis@outlook.com',
    phone: '(11) 99122-4455',
    city: 'São Bernardo do Campo - SP',
    status: 'Pendente',
    registrationDate: '29/06/2026'
  },
  {
    id: 'part-40',
    name: 'Tânia Vasconcelos Ramos',
    email: 'tania.ramos@gmail.com',
    phone: '(19) 99712-4411',
    city: 'Limeira - SP',
    status: 'Presente',
    checkInTime: '24/07 19:40',
    registrationDate: '29/06/2026'
  }
];

export const INITIAL_PARTICIPANTS: Participant[] = RAW_PARTICIPANTS.map((p, idx) => ({
  ...p,
  registrationType: idx % 3 === 0 ? 'Participante' : 'Público'
}));
