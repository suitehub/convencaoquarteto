/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  getFirebaseAdmin, 
  authenticateAndAuthorizeAdmin, 
  AuthenticatedAdminUser,
  timingSafeEqual,
  sha256Hex 
} from './authMiddleware';

export interface MetaConfigStatus {
  hasToken: boolean;
  hasPhoneId: boolean;
  hasWabaId: boolean;
  apiVersion: string;
}

export interface SendTestMessageParams {
  destinationPhone: string;
  templateName: string;
  languageCode: string;
  parameters?: string[];
  userId?: string;
  adminAuthToken?: string;
}

export interface SendTestMessageResult {
  success: boolean;
  status: 'sent' | 'failed' | 'uncertain';
  wamid?: string;
  message: string;
  errorCode?: string | number;
  errorMessage?: string;
  metaMessage?: string;
  timestamp: string;
  logId?: string;
}

/**
 * Sanitizes and validates a phone number according to international E.164 format.
 */
export function sanitizePhoneNumber(phone: string): { valid: boolean; cleanPhone: string; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, cleanPhone: '', error: 'Número de telefone é obrigatório.' };
  }

  // Remove non-digit characters
  let digits = phone.replace(/\D/g, '');

  // If Brazilian number without country code (e.g. 10 or 11 digits: 11987654321)
  if (digits.length === 10 || digits.length === 11) {
    digits = '55' + digits;
  }

  // Check E.164 standards: between 10 and 15 digits
  if (digits.length < 10 || digits.length > 15) {
    return { 
      valid: false, 
      cleanPhone: digits, 
      error: `Número inválido (${digits.length} dígitos). O formato internacional deve ter entre 10 e 15 dígitos (Ex: 5511999999999).` 
    };
  }

  return { valid: true, cleanPhone: digits };
}

/**
 * Returns configuration status without leaking secret values or tokens.
 * Only booleans and public API version are exposed.
 */
export function getMetaConfigStatus(): MetaConfigStatus {
  const rawApiVer = (process.env.META_API_VERSION || 'v26.0').trim();
  const apiVersion = rawApiVer.startsWith('v') ? rawApiVer : `v${rawApiVer}`;

  return {
    hasToken: Boolean(process.env.META_ACCESS_TOKEN && process.env.META_ACCESS_TOKEN.trim().length > 0),
    hasPhoneId: Boolean(process.env.META_PHONE_NUMBER_ID && process.env.META_PHONE_NUMBER_ID.trim().length > 0),
    hasWabaId: Boolean(process.env.META_WABA_ID && process.env.META_WABA_ID.trim().length > 0),
    apiVersion
  };
}

/**
 * Saves WhatsApp audit log to Firestore via Firebase Admin SDK.
 * Ensures that tokens, passwords, and sensitive headers are NEVER stored.
 */
async function saveAuditLogToFirestore(log: {
  logId: string;
  userId: string;
  userEmail?: string;
  destinationPhone: string;
  templateName: string;
  languageCode: string;
  parameters: string[];
  status: 'sent' | 'failed' | 'uncertain';
  wamid?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  createdAt: string;
}): Promise<void> {
  try {
    const adminApp = getFirebaseAdmin();
    const firestore = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
    const docRef = firestore.collection('whatsappTestMessages').doc(log.logId);

    await docRef.set({
      id: log.logId,
      userId: log.userId,
      userEmail: log.userEmail || null,
      destinationPhone: log.destinationPhone,
      templateName: log.templateName,
      languageCode: log.languageCode,
      parameters: log.parameters,
      status: log.status,
      wamid: log.wamid || null,
      errorCode: log.errorCode || null,
      errorMessage: log.errorMessage || null,
      createdAt: log.createdAt,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Could not save audit log via Firestore Admin SDK:', err);
  }
}

/**
 * Dispatches an individual test message to the Meta WhatsApp Cloud API.
 * Requires an authenticated caller (Firebase ID Token or mandatory ADMIN_ACCESS_HASH).
 * The caller identity is verified and recorded server-side.
 */
export async function sendWhatsAppTestMessage(
  params: SendTestMessageParams,
  authenticatedUser: AuthenticatedAdminUser
): Promise<SendTestMessageResult> {
  const timestamp = new Date().toISOString();
  const logId = `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Check Meta credentials
  const token = process.env.META_ACCESS_TOKEN?.trim();
  const phoneId = process.env.META_PHONE_NUMBER_ID?.trim();
  const rawApiVer = (process.env.META_API_VERSION || 'v26.0').trim();
  const apiVersion = rawApiVer.startsWith('v') ? rawApiVer : `v${rawApiVer}`;

  if (!token || !phoneId) {
    const errResult: SendTestMessageResult = {
      success: false,
      status: 'failed',
      errorCode: 'CONFIG_MISSING',
      errorMessage: 'Credenciais da Meta incompletas no backend (META_ACCESS_TOKEN ou META_PHONE_NUMBER_ID ausente).',
      message: 'Configuração pendente no servidor.',
      timestamp,
      logId
    };

    await saveAuditLogToFirestore({
      logId,
      userId: authenticatedUser.userId,
      userEmail: authenticatedUser.userEmail,
      destinationPhone: params.destinationPhone || '',
      templateName: params.templateName || '',
      languageCode: params.languageCode || 'pt_BR',
      parameters: params.parameters || [],
      status: 'failed',
      errorCode: 'CONFIG_MISSING',
      errorMessage: errResult.errorMessage,
      createdAt: timestamp
    });

    return errResult;
  }

  // 2. Validate phone number
  const phoneValidation = sanitizePhoneNumber(params.destinationPhone);
  if (!phoneValidation.valid) {
    const errResult: SendTestMessageResult = {
      success: false,
      status: 'failed',
      errorCode: 'INVALID_PHONE',
      errorMessage: phoneValidation.error || 'Número de telefone inválido.',
      message: 'Número de telefone rejeitado na validação.',
      timestamp,
      logId
    };

    await saveAuditLogToFirestore({
      logId,
      userId: authenticatedUser.userId,
      userEmail: authenticatedUser.userEmail,
      destinationPhone: params.destinationPhone || '',
      templateName: params.templateName || '',
      languageCode: params.languageCode || 'pt_BR',
      parameters: params.parameters || [],
      status: 'failed',
      errorCode: 'INVALID_PHONE',
      errorMessage: errResult.errorMessage,
      createdAt: timestamp
    });

    return errResult;
  }

  // 3. Validate template name
  const templateName = params.templateName?.trim().toLowerCase();
  if (!templateName || !/^[a-z0-9_]+$/.test(templateName)) {
    const errResult: SendTestMessageResult = {
      success: false,
      status: 'failed',
      errorCode: 'INVALID_TEMPLATE_NAME',
      errorMessage: 'Nome do template inválido. Utilize apenas letras minúsculas, números e sublinhados.',
      message: 'Nome do template fora dos padrões da Meta.',
      timestamp,
      logId
    };

    await saveAuditLogToFirestore({
      logId,
      userId: authenticatedUser.userId,
      userEmail: authenticatedUser.userEmail,
      destinationPhone: phoneValidation.cleanPhone,
      templateName: params.templateName || '',
      languageCode: params.languageCode || 'pt_BR',
      parameters: params.parameters || [],
      status: 'failed',
      errorCode: 'INVALID_TEMPLATE_NAME',
      errorMessage: errResult.errorMessage,
      createdAt: timestamp
    });

    return errResult;
  }

  // 4. Validate language code
  const languageCode = params.languageCode?.trim() || 'pt_BR';
  if (!/^[a-z]{2}(_[A-Z]{2})?$/.test(languageCode)) {
    const errResult: SendTestMessageResult = {
      success: false,
      status: 'failed',
      errorCode: 'INVALID_LANGUAGE_CODE',
      errorMessage: 'Código de idioma inválido. Utilize o formato pt_BR ou en_US.',
      message: 'Código de idioma não suportado.',
      timestamp,
      logId
    };

    await saveAuditLogToFirestore({
      logId,
      userId: authenticatedUser.userId,
      userEmail: authenticatedUser.userEmail,
      destinationPhone: phoneValidation.cleanPhone,
      templateName,
      languageCode,
      parameters: params.parameters || [],
      status: 'failed',
      errorCode: 'INVALID_LANGUAGE_CODE',
      errorMessage: errResult.errorMessage,
      createdAt: timestamp
    });

    return errResult;
  }

  // 5. Build Meta Graph API payload
  const cleanParams = (params.parameters || [])
    .map(p => String(p).trim())
    .filter(p => p.length > 0);

  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phoneValidation.cleanPhone,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode
      },
      ...(cleanParams.length > 0 ? {
        components: [
          {
            type: 'body',
            parameters: cleanParams.map(text => ({
              type: 'text',
              text
            }))
          }
        ]
      } : {})
    }
  };

  const endpointUrl = `https://graph.facebook.com/${apiVersion}/${phoneId}/messages`;

  // 6. Dispatch to Meta API with timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseBody = await response.json() as Record<string, unknown>;

    if (response.ok) {
      const messages = responseBody.messages as Array<{ id: string }> | undefined;
      const wamid = messages?.[0]?.id || 'unknown';

      await saveAuditLogToFirestore({
        logId,
        userId: authenticatedUser.userId,
        userEmail: authenticatedUser.userEmail,
        destinationPhone: phoneValidation.cleanPhone,
        templateName,
        languageCode,
        parameters: cleanParams,
        status: 'sent',
        wamid,
        createdAt: timestamp
      });

      return {
        success: true,
        status: 'sent',
        wamid,
        message: 'A requisição foi aceita com sucesso pela WhatsApp Cloud API da Meta.',
        timestamp,
        logId
      };
    } else {
      // Parse Meta API error safely without leaking access token
      const metaError = (responseBody.error as Record<string, unknown>) || {};
      const errorCode = (metaError.code as number | string) || response.status;
      const rawMessage = (metaError.message as string) || 'Erro retornado pela Meta.';

      let friendlyMessage = `Erro retornado pela Meta (${errorCode}): ${rawMessage}`;

      if (errorCode === 190) {
        friendlyMessage = 'Token de acesso da Meta expirado ou inválido (Código 190). Atualize o META_ACCESS_TOKEN.';
      } else if (errorCode === 131030 || errorCode === 130429 || errorCode === 429) {
        friendlyMessage = 'Limite de requisições da Cloud API atingido (Rate limit). Aguarde alguns instantes.';
      } else if (errorCode === 131026) {
        friendlyMessage = 'Número destinatário não possui WhatsApp ou não está autorizado a receber mensagens nesta conta.';
      } else if (errorCode === 132000 || errorCode === 132001) {
        friendlyMessage = `Template "${templateName}" não encontrado ou não aprovado para o idioma ${languageCode}.`;
      } else if (errorCode === 132015) {
        friendlyMessage = `A quantidade de parâmetros informada (${cleanParams.length}) não corresponde ao template na Meta.`;
      } else if (errorCode === 131047) {
        friendlyMessage = 'Janela de 24h fechada. O envio para este contato requer um template pré-aprovado.';
      }

      await saveAuditLogToFirestore({
        logId,
        userId: authenticatedUser.userId,
        userEmail: authenticatedUser.userEmail,
        destinationPhone: phoneValidation.cleanPhone,
        templateName,
        languageCode,
        parameters: cleanParams,
        status: 'failed',
        wamid: null,
        errorCode: String(errorCode),
        errorMessage: friendlyMessage,
        createdAt: timestamp
      });

      return {
        success: false,
        status: 'failed',
        errorCode,
        errorMessage: friendlyMessage,
        metaMessage: rawMessage,
        message: 'Falha no processamento pela Meta Cloud API.',
        timestamp,
        logId
      };
    }
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    const isAbort = error instanceof Error && error.name === 'AbortError';

    if (isAbort) {
      const errResult: SendTestMessageResult = {
        success: false,
        status: 'uncertain',
        errorCode: 'TIMEOUT',
        errorMessage: 'A requisição para a Meta excedeu o tempo limite (15 segundos). Não é possível confirmar se a mensagem foi processada. Por segurança, nenhum reenvio automático foi realizado.',
        message: 'Tempo limite excedido. Status incerto.',
        timestamp,
        logId
      };

      await saveAuditLogToFirestore({
        logId,
        userId: authenticatedUser.userId,
        userEmail: authenticatedUser.userEmail,
        destinationPhone: phoneValidation.cleanPhone,
        templateName,
        languageCode,
        parameters: cleanParams,
        status: 'uncertain',
        errorCode: 'TIMEOUT',
        errorMessage: errResult.errorMessage,
        createdAt: timestamp
      });

      return errResult;
    }

    const errorMsg = error instanceof Error ? error.message : String(error);
    const errResult: SendTestMessageResult = {
      success: false,
      status: 'uncertain',
      errorCode: 'NETWORK_ERROR',
      errorMessage: `Falha de conexão com a Meta Cloud API: ${errorMsg}. Não é possível garantir o processamento da mensagem.`,
      message: 'Erro de rede ou conexão.',
      timestamp,
      logId
    };

    await saveAuditLogToFirestore({
      logId,
      userId: authenticatedUser.userId,
      userEmail: authenticatedUser.userEmail,
      destinationPhone: phoneValidation.cleanPhone,
      templateName,
      languageCode,
      parameters: cleanParams,
      status: 'uncertain',
      errorCode: 'NETWORK_ERROR',
      errorMessage: errResult.errorMessage,
      createdAt: timestamp
    });

    return errResult;
  }
}
