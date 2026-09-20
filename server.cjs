var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);

// src/server/whatsappMetaService.ts
var import_firestore2 = require("firebase-admin/firestore");

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "gen-lang-client-0325564245",
  appId: "1:513511639395:web:e96b0c40275323db6b2b56",
  apiKey: "AIzaSyDdaGJu4W7c2u9bn7xv1DnttyIrGIa_t20",
  authDomain: "gen-lang-client-0325564245.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-8convenodequarte-606ea33b-0300-4b6f-89b6-e50d4e556df3",
  storageBucket: "gen-lang-client-0325564245.firebasestorage.app",
  messagingSenderId: "513511639395",
  measurementId: ""
};

// src/server/authMiddleware.ts
var import_crypto = __toESM(require("crypto"), 1);
var import_app = require("firebase-admin/app");
var import_auth = require("firebase-admin/auth");
var import_firestore = require("firebase-admin/firestore");
var adminAppInstance = null;
function getFirebaseAdmin() {
  if (!adminAppInstance) {
    const existingApps = (0, import_app.getApps)();
    if (existingApps.length > 0) {
      adminAppInstance = existingApps[0];
    } else {
      adminAppInstance = (0, import_app.initializeApp)({
        projectId: process.env.FIREBASE_PROJECT_ID || firebase_applet_config_default.projectId
      });
    }
  }
  return adminAppInstance;
}
var rateLimitMap = /* @__PURE__ */ new Map();
var cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (val.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
}, 3e5);
if (cleanupInterval.unref) {
  cleanupInterval.unref();
}
function checkServerRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || record.resetTime < now) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetSeconds: Math.ceil(windowMs / 1e3) };
  }
  if (record.count >= maxRequests) {
    const resetSeconds = Math.ceil((record.resetTime - now) / 1e3);
    return { allowed: false, remaining: 0, resetSeconds };
  }
  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count, resetSeconds: Math.ceil((record.resetTime - now) / 1e3) };
}
function timingSafeEqual(a, b) {
  if (!a || !b) return false;
  try {
    const bufA = Buffer.from(a.trim(), "utf8");
    const bufB = Buffer.from(b.trim(), "utf8");
    if (bufA.length !== bufB.length) {
      return false;
    }
    return import_crypto.default.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
function sha256Hex(input) {
  return import_crypto.default.createHash("sha256").update(input.trim()).digest("hex");
}
async function authenticateAndAuthorizeAdmin(tokenCandidate) {
  if (!tokenCandidate || typeof tokenCandidate !== "string") {
    return null;
  }
  const cleanToken = tokenCandidate.trim();
  if (!cleanToken) {
    return null;
  }
  try {
    const app = getFirebaseAdmin();
    const authAdmin = (0, import_auth.getAuth)(app);
    const decoded = await authAdmin.verifyIdToken(cleanToken);
    if (decoded && decoded.uid) {
      const email = decoded.email?.toLowerCase();
      const hasDirectClaim = decoded.role === "admin" || decoded.role === "organizer" || decoded.admin === true;
      if (hasDirectClaim) {
        return {
          userId: decoded.uid,
          userEmail: email,
          authType: "firebase_auth",
          role: decoded.role === "admin" ? "admin" : "organizer"
        };
      }
      try {
        const firestore = (0, import_firestore.getFirestore)(app, firebase_applet_config_default.firestoreDatabaseId);
        const staffDoc = await firestore.collection("staffUsers").doc(decoded.uid).get();
        if (staffDoc.exists) {
          const staffData = staffDoc.data();
          if (staffData?.role === "organizer" || staffData?.role === "admin") {
            return {
              userId: decoded.uid,
              userEmail: email || staffData?.email,
              authType: "firebase_auth",
              role: staffData.role
            };
          }
        }
        if (email) {
          const staffQuery = await firestore.collection("staffUsers").where("email", "==", email).limit(1).get();
          if (!staffQuery.empty) {
            const data = staffQuery.docs[0].data();
            if (data?.role === "organizer" || data?.role === "admin") {
              return {
                userId: decoded.uid,
                userEmail: email,
                authType: "firebase_auth",
                role: data.role
              };
            }
          }
        }
      } catch (firestoreErr) {
        console.warn("Could not verify staff role via Firestore Admin:", firestoreErr);
      }
      const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
      const isOwnerOrAdmin = email && email === "rickyjorgecastro@gmail.com" || email && adminEmails.includes(email);
      if (isOwnerOrAdmin) {
        return {
          userId: decoded.uid,
          userEmail: email,
          authType: "firebase_auth",
          role: "admin"
        };
      }
    }
  } catch {
  }
  const envHash = process.env.ADMIN_ACCESS_HASH?.trim();
  if (envHash && envHash.length >= 32) {
    if (timingSafeEqual(cleanToken, envHash)) {
      return {
        userId: "admin_secret_key",
        authType: "admin_secret",
        role: "admin"
      };
    }
    const candidateHash = sha256Hex(cleanToken);
    if (timingSafeEqual(candidateHash, envHash)) {
      return {
        userId: "admin_secret_key",
        authType: "admin_secret",
        role: "admin"
      };
    }
  }
  return null;
}

// src/server/whatsappMetaService.ts
function sanitizePhoneNumber(phone) {
  if (!phone || typeof phone !== "string") {
    return { valid: false, cleanPhone: "", error: "N\xFAmero de telefone \xE9 obrigat\xF3rio." };
  }
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) {
    digits = "55" + digits;
  }
  if (digits.length < 10 || digits.length > 15) {
    return {
      valid: false,
      cleanPhone: digits,
      error: `N\xFAmero inv\xE1lido (${digits.length} d\xEDgitos). O formato internacional deve ter entre 10 e 15 d\xEDgitos (Ex: 5511999999999).`
    };
  }
  return { valid: true, cleanPhone: digits };
}
function getMetaConfigStatus() {
  const rawApiVer = (process.env.META_API_VERSION || "v26.0").trim();
  const apiVersion = rawApiVer.startsWith("v") ? rawApiVer : `v${rawApiVer}`;
  return {
    hasToken: Boolean(process.env.META_ACCESS_TOKEN && process.env.META_ACCESS_TOKEN.trim().length > 0),
    hasPhoneId: Boolean(process.env.META_PHONE_NUMBER_ID && process.env.META_PHONE_NUMBER_ID.trim().length > 0),
    hasWabaId: Boolean(process.env.META_WABA_ID && process.env.META_WABA_ID.trim().length > 0),
    apiVersion
  };
}
async function saveAuditLogToFirestore(log) {
  try {
    const adminApp = getFirebaseAdmin();
    const firestore = (0, import_firestore2.getFirestore)(adminApp, firebase_applet_config_default.firestoreDatabaseId);
    const docRef = firestore.collection("whatsappTestMessages").doc(log.logId);
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
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("Could not save audit log via Firestore Admin SDK:", err);
  }
}
async function sendWhatsAppTestMessage(params, authenticatedUser) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const logId = `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const token = process.env.META_ACCESS_TOKEN?.trim();
  const phoneId = process.env.META_PHONE_NUMBER_ID?.trim();
  const rawApiVer = (process.env.META_API_VERSION || "v26.0").trim();
  const apiVersion = rawApiVer.startsWith("v") ? rawApiVer : `v${rawApiVer}`;
  if (!token || !phoneId) {
    const errResult = {
      success: false,
      status: "failed",
      errorCode: "CONFIG_MISSING",
      errorMessage: "Credenciais da Meta incompletas no backend (META_ACCESS_TOKEN ou META_PHONE_NUMBER_ID ausente).",
      message: "Configura\xE7\xE3o pendente no servidor.",
      timestamp,
      logId
    };
    await saveAuditLogToFirestore({
      logId,
      userId: authenticatedUser.userId,
      userEmail: authenticatedUser.userEmail,
      destinationPhone: params.destinationPhone || "",
      templateName: params.templateName || "",
      languageCode: params.languageCode || "pt_BR",
      parameters: params.parameters || [],
      status: "failed",
      errorCode: "CONFIG_MISSING",
      errorMessage: errResult.errorMessage,
      createdAt: timestamp
    });
    return errResult;
  }
  const phoneValidation = sanitizePhoneNumber(params.destinationPhone);
  if (!phoneValidation.valid) {
    const errResult = {
      success: false,
      status: "failed",
      errorCode: "INVALID_PHONE",
      errorMessage: phoneValidation.error || "N\xFAmero de telefone inv\xE1lido.",
      message: "N\xFAmero de telefone rejeitado na valida\xE7\xE3o.",
      timestamp,
      logId
    };
    await saveAuditLogToFirestore({
      logId,
      userId: authenticatedUser.userId,
      userEmail: authenticatedUser.userEmail,
      destinationPhone: params.destinationPhone || "",
      templateName: params.templateName || "",
      languageCode: params.languageCode || "pt_BR",
      parameters: params.parameters || [],
      status: "failed",
      errorCode: "INVALID_PHONE",
      errorMessage: errResult.errorMessage,
      createdAt: timestamp
    });
    return errResult;
  }
  const templateName = params.templateName?.trim().toLowerCase();
  if (!templateName || !/^[a-z0-9_]+$/.test(templateName)) {
    const errResult = {
      success: false,
      status: "failed",
      errorCode: "INVALID_TEMPLATE_NAME",
      errorMessage: "Nome do template inv\xE1lido. Utilize apenas letras min\xFAsculas, n\xFAmeros e sublinhados.",
      message: "Nome do template fora dos padr\xF5es da Meta.",
      timestamp,
      logId
    };
    await saveAuditLogToFirestore({
      logId,
      userId: authenticatedUser.userId,
      userEmail: authenticatedUser.userEmail,
      destinationPhone: phoneValidation.cleanPhone,
      templateName: params.templateName || "",
      languageCode: params.languageCode || "pt_BR",
      parameters: params.parameters || [],
      status: "failed",
      errorCode: "INVALID_TEMPLATE_NAME",
      errorMessage: errResult.errorMessage,
      createdAt: timestamp
    });
    return errResult;
  }
  const languageCode = params.languageCode?.trim() || "pt_BR";
  if (!/^[a-z]{2}(_[A-Z]{2})?$/.test(languageCode)) {
    const errResult = {
      success: false,
      status: "failed",
      errorCode: "INVALID_LANGUAGE_CODE",
      errorMessage: "C\xF3digo de idioma inv\xE1lido. Utilize o formato pt_BR ou en_US.",
      message: "C\xF3digo de idioma n\xE3o suportado.",
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
      status: "failed",
      errorCode: "INVALID_LANGUAGE_CODE",
      errorMessage: errResult.errorMessage,
      createdAt: timestamp
    });
    return errResult;
  }
  const cleanParams = (params.parameters || []).map((p) => String(p).trim()).filter((p) => p.length > 0);
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phoneValidation.cleanPhone,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: languageCode
      },
      ...cleanParams.length > 0 ? {
        components: [
          {
            type: "body",
            parameters: cleanParams.map((text) => ({
              type: "text",
              text
            }))
          }
        ]
      } : {}
    }
  };
  const endpointUrl = `https://graph.facebook.com/${apiVersion}/${phoneId}/messages`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15e3);
  try {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const responseBody = await response.json();
    if (response.ok) {
      const messages = responseBody.messages;
      const wamid = messages?.[0]?.id || "unknown";
      await saveAuditLogToFirestore({
        logId,
        userId: authenticatedUser.userId,
        userEmail: authenticatedUser.userEmail,
        destinationPhone: phoneValidation.cleanPhone,
        templateName,
        languageCode,
        parameters: cleanParams,
        status: "sent",
        wamid,
        createdAt: timestamp
      });
      return {
        success: true,
        status: "sent",
        wamid,
        message: "A requisi\xE7\xE3o foi aceita com sucesso pela WhatsApp Cloud API da Meta.",
        timestamp,
        logId
      };
    } else {
      const metaError = responseBody.error || {};
      const errorCode = metaError.code || response.status;
      const rawMessage = metaError.message || "Erro retornado pela Meta.";
      let friendlyMessage = `Erro retornado pela Meta (${errorCode}): ${rawMessage}`;
      if (errorCode === 190) {
        friendlyMessage = "Token de acesso da Meta expirado ou inv\xE1lido (C\xF3digo 190). Atualize o META_ACCESS_TOKEN.";
      } else if (errorCode === 131030 || errorCode === 130429 || errorCode === 429) {
        friendlyMessage = "Limite de requisi\xE7\xF5es da Cloud API atingido (Rate limit). Aguarde alguns instantes.";
      } else if (errorCode === 131026) {
        friendlyMessage = "N\xFAmero destinat\xE1rio n\xE3o possui WhatsApp ou n\xE3o est\xE1 autorizado a receber mensagens nesta conta.";
      } else if (errorCode === 132e3 || errorCode === 132001) {
        friendlyMessage = `Template "${templateName}" n\xE3o encontrado ou n\xE3o aprovado para o idioma ${languageCode}.`;
      } else if (errorCode === 132015) {
        friendlyMessage = `A quantidade de par\xE2metros informada (${cleanParams.length}) n\xE3o corresponde ao template na Meta.`;
      } else if (errorCode === 131047) {
        friendlyMessage = "Janela de 24h fechada. O envio para este contato requer um template pr\xE9-aprovado.";
      }
      await saveAuditLogToFirestore({
        logId,
        userId: authenticatedUser.userId,
        userEmail: authenticatedUser.userEmail,
        destinationPhone: phoneValidation.cleanPhone,
        templateName,
        languageCode,
        parameters: cleanParams,
        status: "failed",
        wamid: null,
        errorCode: String(errorCode),
        errorMessage: friendlyMessage,
        createdAt: timestamp
      });
      return {
        success: false,
        status: "failed",
        errorCode,
        errorMessage: friendlyMessage,
        metaMessage: rawMessage,
        message: "Falha no processamento pela Meta Cloud API.",
        timestamp,
        logId
      };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    const isAbort = error instanceof Error && error.name === "AbortError";
    if (isAbort) {
      const errResult2 = {
        success: false,
        status: "uncertain",
        errorCode: "TIMEOUT",
        errorMessage: "A requisi\xE7\xE3o para a Meta excedeu o tempo limite (15 segundos). N\xE3o \xE9 poss\xEDvel confirmar se a mensagem foi processada. Por seguran\xE7a, nenhum reenvio autom\xE1tico foi realizado.",
        message: "Tempo limite excedido. Status incerto.",
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
        status: "uncertain",
        errorCode: "TIMEOUT",
        errorMessage: errResult2.errorMessage,
        createdAt: timestamp
      });
      return errResult2;
    }
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errResult = {
      success: false,
      status: "uncertain",
      errorCode: "NETWORK_ERROR",
      errorMessage: `Falha de conex\xE3o com a Meta Cloud API: ${errorMsg}. N\xE3o \xE9 poss\xEDvel garantir o processamento da mensagem.`,
      message: "Erro de rede ou conex\xE3o.",
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
      status: "uncertain",
      errorCode: "NETWORK_ERROR",
      errorMessage: errResult.errorMessage,
      createdAt: timestamp
    });
    return errResult;
  }
}

// server.ts
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.set("trust proxy", true);
  app.use(import_express.default.json());
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.post("/api/admin/verify", (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    const rateCheck = checkServerRateLimit(`admin_verify_${clientIp}`, 5, 15 * 60 * 1e3);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: `Muitas tentativas incorretas. Por seguran\xE7a, aguarde ${rateCheck.resetSeconds}s para tentar novamente.`,
        retryAfter: rateCheck.resetSeconds
      });
    }
    const { code } = req.body;
    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ success: false, error: "C\xF3digo de acesso n\xE3o fornecido." });
    }
    const envHash = process.env.ADMIN_ACCESS_HASH?.trim();
    if (!envHash || envHash.length < 32) {
      return res.status(503).json({
        success: false,
        error: "ADMIN_ACCESS_HASH n\xE3o est\xE1 configurado nas vari\xE1veis de ambiente do servidor. Defina a vari\xE1vel para habilitar o acesso com c\xF3digo."
      });
    }
    const hashedInput = sha256Hex(code);
    const isValid = timingSafeEqual(hashedInput, envHash) || timingSafeEqual(code.trim(), envHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: "C\xF3digo de acesso incorreto.",
        remainingAttempts: rateCheck.remaining
      });
    }
    res.json({
      success: true,
      token: envHash,
      message: "Autentica\xE7\xE3o administrativa concedida com sucesso."
    });
  });
  app.post("/api/admin/verify-token", async (req, res) => {
    const authHeader = req.headers.authorization?.replace(/^Bearer\s+/i, "") || req.body?.token;
    const authorizedUser = await authenticateAndAuthorizeAdmin(authHeader);
    if (!authorizedUser) {
      return res.status(403).json({
        success: false,
        error: "Token inv\xE1lido ou usu\xE1rio n\xE3o possui permiss\xE3o de organizador/administrador."
      });
    }
    res.json({
      success: true,
      user: authorizedUser,
      message: "Token administrativo verificado com sucesso."
    });
  });
  app.get("/api/whatsapp/config-status", async (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    const rateCheck = checkServerRateLimit(`wa_status_${clientIp}`, 30, 60 * 1e3);
    if (!rateCheck.allowed) {
      return res.status(429).json({ error: "Limite de requisi\xE7\xF5es excedido. Tente novamente mais tarde." });
    }
    const authHeader = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    const authorizedUser = await authenticateAndAuthorizeAdmin(authHeader);
    if (!authorizedUser) {
      return res.status(403).json({
        error: "Acesso n\xE3o autorizado: Firebase ID Token de organizador/admin ou chave administrativa v\xE1lida \xE9 necess\xE1ria."
      });
    }
    const status = getMetaConfigStatus();
    res.json({
      ...status,
      callerType: authorizedUser.authType,
      callerId: authorizedUser.userId
    });
  });
  app.post("/api/whatsapp/send-test", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const clientIp = req.ip || req.socket.remoteAddress || "unknown";
      const rateCheck = checkServerRateLimit(`wa_send_${clientIp}`, 10, 60 * 1e3);
      if (!rateCheck.allowed) {
        return res.status(429).json({
          success: false,
          status: "failed",
          errorCode: "RATE_LIMIT_EXCEEDED",
          errorMessage: "Limite de disparos de teste atingido (m\xE1x 10/min). Aguarde antes de enviar outro teste.",
          message: "Limite excedido.",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      const authHeader = req.headers.authorization?.replace(/^Bearer\s+/i, "");
      const token = authHeader || req.body?.adminAuthToken;
      const authorizedUser = await authenticateAndAuthorizeAdmin(token);
      if (!authorizedUser) {
        return res.status(403).json({
          success: false,
          status: "failed",
          errorCode: "UNAUTHORIZED",
          errorMessage: "Acesso n\xE3o autorizado: credencial ou token administrativo inv\xE1lido ou ausente.",
          message: "Acesso negado.",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      const { destinationPhone, templateName, languageCode, parameters } = req.body || {};
      const result = await sendWhatsAppTestMessage({
        destinationPhone,
        templateName,
        languageCode,
        parameters,
        userId: authorizedUser.userId
      }, authorizedUser);
      const httpStatus = result.success ? 200 : result.errorCode === "UNAUTHORIZED" ? 403 : 400;
      res.status(httpStatus).json(result);
    } catch (err) {
      console.error("Unhandled error in /api/whatsapp/send-test:", err);
      res.status(500).json({
        success: false,
        status: "failed",
        errorCode: "INTERNAL_SERVER_ERROR",
        errorMessage: `Erro interno no servidor: ${err?.message || "Falha ao processar requisi\xE7\xE3o."}`,
        message: "Erro no servidor.",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  app.use("/api", (err, req, res, next) => {
    console.error("API Error Middleware caught:", err);
    res.setHeader("Content-Type", "application/json");
    res.status(500).json({
      success: false,
      status: "failed",
      errorCode: "API_ERROR",
      errorMessage: err?.message || "Erro inesperado na API.",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
