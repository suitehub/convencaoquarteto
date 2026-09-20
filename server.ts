/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { 
  getMetaConfigStatus, 
  sendWhatsAppTestMessage 
} from './src/server/whatsappMetaService';
import { 
  authenticateAndAuthorizeAdmin, 
  checkServerRateLimit, 
  timingSafeEqual, 
  sha256Hex 
} from './src/server/authMiddleware';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for accurate client IP identification in Cloud Run
  app.set('trust proxy', true);

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Admin Code Verification Endpoint (Eliminates client-side hash hardcoding)
  // Protected with IP-based rate limiting
  app.post('/api/admin/verify', (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const rateCheck = checkServerRateLimit(`admin_verify_${clientIp}`, 5, 15 * 60 * 1000);

    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: `Muitas tentativas incorretas. Por segurança, aguarde ${rateCheck.resetSeconds}s para tentar novamente.`,
        retryAfter: rateCheck.resetSeconds
      });
    }

    const { code } = req.body;
    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ success: false, error: 'Código de acesso não fornecido.' });
    }

    const envHash = process.env.ADMIN_ACCESS_HASH?.trim();
    if (!envHash || envHash.length < 32) {
      return res.status(503).json({
        success: false,
        error: 'ADMIN_ACCESS_HASH não está configurado nas variáveis de ambiente do servidor. Defina a variável para habilitar o acesso com código.'
      });
    }

    const hashedInput = sha256Hex(code);
    const isValid = timingSafeEqual(hashedInput, envHash) || timingSafeEqual(code.trim(), envHash);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Código de acesso incorreto.',
        remainingAttempts: rateCheck.remaining
      });
    }

    // Return the authorized hash to be held exclusively in ephemeral sessionStorage by the admin client
    res.json({
      success: true,
      token: envHash,
      message: 'Autenticação administrativa concedida com sucesso.'
    });
  });

  // Status of Meta WhatsApp credentials (Protected: Admin / Organizer authorization required)
  app.get('/api/whatsapp/config-status', async (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const rateCheck = checkServerRateLimit(`wa_status_${clientIp}`, 30, 60 * 1000);
    if (!rateCheck.allowed) {
      return res.status(429).json({ error: 'Limite de requisições excedido. Tente novamente mais tarde.' });
    }

    const authHeader = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const authorizedUser = await authenticateAndAuthorizeAdmin(authHeader);

    if (!authorizedUser) {
      return res.status(403).json({ 
        error: 'Acesso não autorizado: Firebase ID Token de organizador/admin ou chave administrativa válida é necessária.' 
      });
    }

    const status = getMetaConfigStatus();
    res.json({
      ...status,
      callerType: authorizedUser.authType,
      callerId: authorizedUser.userId
    });
  });

  // Send single WhatsApp test message (Protected: Admin / Organizer authorization required)
  app.post('/api/whatsapp/send-test', async (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const rateCheck = checkServerRateLimit(`wa_send_${clientIp}`, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        status: 'failed',
        errorCode: 'RATE_LIMIT_EXCEEDED',
        errorMessage: 'Limite de disparos de teste atingido (máx 10/min). Aguarde antes de enviar outro teste.',
        message: 'Limite excedido.',
        timestamp: new Date().toISOString()
      });
    }

    const authHeader = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const token = authHeader || req.body.adminAuthToken;

    const authorizedUser = await authenticateAndAuthorizeAdmin(token);

    if (!authorizedUser) {
      return res.status(403).json({
        success: false,
        status: 'failed',
        errorCode: 'UNAUTHORIZED',
        errorMessage: 'Acesso não autorizado: credencial ou token administrativo inválido ou ausente.',
        message: 'Acesso negado.',
        timestamp: new Date().toISOString()
      });
    }

    const { destinationPhone, templateName, languageCode, parameters } = req.body;
    
    // Dispatch test with verified user identity
    const result = await sendWhatsAppTestMessage({
      destinationPhone,
      templateName,
      languageCode,
      parameters,
      userId: authorizedUser.userId
    }, authorizedUser);

    const httpStatus = result.success ? 200 : (result.errorCode === 'UNAUTHORIZED' ? 403 : 400);
    res.status(httpStatus).json(result);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
