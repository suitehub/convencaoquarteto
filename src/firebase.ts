/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  getDocs, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  query
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Participant, EventConfig, StaffUser } from './types';
import { INITIAL_EVENT_CONFIG } from './mockData';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth();

// Error handling enum and interface conforming to the strict system guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot as requested by instructions
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Initial database seeding helper
export async function seedInitialDataIfNeeded() {
  try {
    // 1. Seed eventConfigs/default
    const configDocRef = doc(db, 'eventConfigs', 'default');
    const qSnapshot = await getDocs(collection(db, 'eventConfigs')).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'eventConfigs');
      throw err;
    });

    if (qSnapshot.empty) {
      await setDoc(configDocRef, INITIAL_EVENT_CONFIG).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, 'eventConfigs/default');
        throw err;
      });
      console.log('Event config seeded in Firestore.');
    }

    // 2. Seed default staff if empty
    const staffSnapshot = await getDocs(collection(db, 'staffUsers')).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'staffUsers');
      throw err;
    });

    if (staffSnapshot.empty) {
      const defaultStaff: StaffUser = {
        id: 'staff-default',
        name: 'Recepção Padrão',
        username: 'recepcao',
        password: '1234',
        createdAt: '01/07/2026'
      };
      await setDoc(doc(db, 'staffUsers', 'staff-default'), defaultStaff).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, 'staffUsers/staff-default');
        throw err;
      });
      console.log('Default staff user seeded in Firestore.');
    }
  } catch (error) {
    console.error('Failed to seed initial data:', error);
  }
}

// 1. Listen or fetch event config
export function subscribeEventConfig(callback: (config: EventConfig) => void) {
  const path = 'eventConfigs/default';
  const docRef = doc(db, 'eventConfigs', 'default');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as EventConfig);
    } else {
      callback(INITIAL_EVENT_CONFIG);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export async function updateEventConfig(config: EventConfig) {
  const path = 'eventConfigs/default';
  try {
    await setDoc(doc(db, 'eventConfigs', 'default'), config);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 2. Listen or fetch staff users
export function subscribeStaffUsers(callback: (users: StaffUser[]) => void) {
  const path = 'staffUsers';
  return onSnapshot(collection(db, path), (snapshot) => {
    const list: StaffUser[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as StaffUser);
    });
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function addStaffUserInFirestore(staff: StaffUser) {
  const path = `staffUsers/${staff.id}`;
  try {
    await setDoc(doc(db, 'staffUsers', staff.id), staff);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 3. Listen or fetch participants
export function subscribeParticipants(callback: (participants: Participant[]) => void) {
  const path = 'participants';
  return onSnapshot(collection(db, path), (snapshot) => {
    const list: Participant[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Participant);
    });
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function addParticipantInFirestore(participant: Participant) {
  const path = `participants/${participant.id}`;
  try {
    await setDoc(doc(db, 'participants', participant.id), participant);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateParticipantInFirestore(id: string, updates: Partial<Participant>) {
  const path = `participants/${id}`;
  try {
    await updateDoc(doc(db, 'participants', id), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
