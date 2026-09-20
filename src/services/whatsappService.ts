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
      const text = await res.text();
      try {
        return JSON.parse(text) as WhatsAppConfigStatus;
      } catch {
        console.warn('Config status returned non-JSON body');
      }
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

    const responseText = await response.text();
    let data: WhatsAppSendTestResponse | null = null;

    try {
      if (responseText && responseText.trim()) {
        data = JSON.parse(responseText) as WhatsAppSendTestResponse;
      }
    } catch {
      data = null;
    }

    if (data) {
      return data;
    }

    // If server responded with HTML (e.g. 502/503/504 Bad Gateway / Service Unavailable)
    let friendlyMessage = `O servidor respondeu com status ${response.status} (${response.statusText || 'Erro'}).`;
    let statusType: 'failed' | 'uncertain' = 'uncertain';

    if (response.status === 502 || response.status === 503) {
      friendlyMessage = 'O servidor backend estava reiniciando ou temporariamente indisponível. Aguarde alguns segundos e tente novamente.';
      statusType = 'uncertain';
    } else if (response.status === 504) {
      friendlyMessage = 'Tempo limite de resposta esgotado no gateway do servidor (504 Gateway Timeout). Não foi possível confirmar o envio.';
      statusType = 'uncertain';
    } else if (response.status === 404) {
      friendlyMessage = 'A rota de envio (/api/whatsapp/send-test) não foi encontrada no servidor. Verifique a execução do backend.';
      statusType = 'failed';
    } else if (response.status === 401 || response.status === 403) {
      friendlyMessage = 'Acesso não autorizado: credencial ou token administrativo inválido ou ausente.';
      statusType = 'failed';
    }

    return {
      success: false,
      status: statusType,
      errorCode: `HTTP_${response.status}`,
      errorMessage: friendlyMessage,
      message: 'Não foi possível concluir o envio com o servidor.',
      timestamp
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const isNetwork = errorMsg.toLowerCase().includes('fetch') || errorMsg.toLowerCase().includes('failed to fetch');

    const fallbackResult: WhatsAppSendTestResponse = {
      success: false,
      status: 'uncertain',
      errorCode: 'CLIENT_NETWORK_ERROR',
      errorMessage: isNetwork
        ? 'Não foi possível conectar ao servidor backend (/api/whatsapp/send-test). Verifique a conexão e tente novamente.'
        : `Falha na comunicação com o servidor: ${errorMsg}. Status incerto.`,
      message: 'Não foi possível confirmar o envio.',
      timestamp
    };

    return fallbackResult;
  }
}
