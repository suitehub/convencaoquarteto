/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WhatsAppSendTestResponse, WhatsAppTestMessage } from '../types';
import { auth, saveWhatsAppTestLog } from '../firebase';

export interface WhatsAppConfigStatus {
  hasToken: boolean;
  hasPhoneId: boolean;
  hasWabaId: boolean;
  apiVersion: string;
}

/**
 * Resolves the authentication Bearer token for admin operations.
 * Prioritizes Firebase ID Token if logged into Firebase Auth,
 * otherwise falls back to the verified session token stored during admin lock check.
 * ZERO hardcoded secret fallback.
 */
export async function getAdminAuthToken(): Promise<string> {
  try {
    if (auth.currentUser) {
      const idToken = await auth.currentUser.getIdToken();
      if (idToken) return idToken;
    }
  } catch (e) {
    console.warn('Could not retrieve Firebase ID token:', e);
  }

  // Retrieve temporary session token if authorized via AdminLock
  return sessionStorage.getItem('admin_token') || '';
}

/**
 * Synchronous accessor for admin session token (without fallback to hardcoded strings).
 */
export function getAdminSessionToken(): string {
  return sessionStorage.getItem('admin_token') || '';
}

/**
 * Queries the backend for WhatsApp Cloud API environment configuration status.
 * Requires admin authorization.
 */
export async function checkWhatsAppConfigStatus(): Promise<WhatsAppConfigStatus> {
  const token = await getAdminAuthToken();
  try {
    const res = await fetch('/api/whatsapp/config-status', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      return await res.json() as WhatsAppConfigStatus;
    }
    return {
      hasToken: false,
      hasPhoneId: false,
      hasWabaId: false,
      apiVersion: 'v26.0'
    };
  } catch (err) {
    console.warn('Could not query whatsapp config status:', err);
    return {
      hasToken: false,
      hasPhoneId: false,
      hasWabaId: false,
      apiVersion: 'v26.0'
    };
  }
}

/**
 * Dispatches an individual test message to the backend function.
 * Authentication token is sent securely via the Authorization header.
 * The backend verifies the token and records the audit log with the authentic UID in Firestore.
 */
export async function sendWhatsAppTest(payload: {
  destinationPhone: string;
  templateName: string;
  languageCode: string;
  parameters: string[];
  userId?: string;
}): Promise<WhatsAppSendTestResponse> {
  const token = await getAdminAuthToken();
  const timestamp = new Date().toISOString();

  try {
    const response = await fetch('/api/whatsapp/send-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        destinationPhone: payload.destinationPhone,
        templateName: payload.templateName,
        languageCode: payload.languageCode,
        parameters: payload.parameters
      })
    });

    const data = await response.json() as WhatsAppSendTestResponse;
    return data;
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const fallbackResult: WhatsAppSendTestResponse = {
      success: false,
      status: 'uncertain',
      errorCode: 'CLIENT_NETWORK_ERROR',
      errorMessage: `Falha na comunicação com o servidor: ${errorMsg}. Status incerto.`,
      message: 'Não foi possível confirmar o envio.',
      timestamp
    };

    return fallbackResult;
  }
}
