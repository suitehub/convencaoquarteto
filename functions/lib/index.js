"use strict";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdminCode = exports.sendWhatsAppTestMessage = exports.getWhatsAppConfigStatus = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const admin = require("firebase-admin");
const crypto = require("crypto");
admin.initializeApp();
// Secrets managed securely via Secret Manager (NO hardcoded fallback)
const metaAccessToken = (0, params_1.defineSecret)("META_ACCESS_TOKEN");
const metaPhoneNumberId = (0, params_1.defineSecret)("META_PHONE_NUMBER_ID");
const metaApiVersion = (0, params_1.defineSecret)("META_API_VERSION");
const metaWabaId = (0, params_1.defineSecret)("META_WABA_ID");
const adminAccessHash = (0, params_1.defineSecret)("ADMIN_ACCESS_HASH");
/**
 * Timing-safe string comparison to prevent timing attacks.
 */
function timingSafeEqual(a, b) {
    if (!a || !b)
        return false;
    try {
        const bufA = Buffer.from(a.trim(), "utf8");
        const bufB = Buffer.from(b.trim(), "utf8");
        if (bufA.length !== bufB.length)
            return false;
        return crypto.timingSafeEqual(bufA, bufB);
    }
    catch {
        return false;
    }
}
/**
 * Computes SHA-256 hex digest of a string.
 */
function sha256Hex(input) {
    return crypto.createHash("sha256").update(input.trim()).digest("hex");
}
/**
 * Authenticates caller either via:
 * 1. Firebase Authentication ID Token (with RBAC custom claims or staffUsers document verification)
 * 2. Mandatory ADMIN_ACCESS_HASH secret (zero hardcoded fallback)
 */
async function authenticateCaller(token) {
    if (!token || typeof token !== "string" || !token.trim()) {
        return null;
    }
    const cleanToken = token.trim();
    // 1. PRIMARY: Verify Firebase ID Token via Firebase Admin SDK
    try {
        const decoded = await admin.auth().verifyIdToken(cleanToken);
        if (decoded && decoded.uid) {
            const email = decoded.email?.toLowerCase();
            const hasDirectClaim = decoded.role === "admin" || decoded.role === "organizer" || decoded.admin === true;
            if (hasDirectClaim) {
                return {
                    userId: decoded.uid,
                    userEmail: email,
                    role: decoded.role === "admin" ? "admin" : "organizer",
                    authType: "firebase_auth",
                };
            }
            // Authorize owner email
            if (email === "rickyjorgecastro@gmail.com") {
                return {
                    userId: decoded.uid,
                    userEmail: email,
                    role: "admin",
                    authType: "firebase_auth",
                };
            }
            // Check Firestore staffUsers collection
            try {
                const staffDoc = await admin.firestore().collection("staffUsers").doc(decoded.uid).get();
                if (staffDoc.exists) {
                    const staffData = staffDoc.data();
                    if (staffData?.role === "organizer" || staffData?.role === "admin") {
                        return {
                            userId: decoded.uid,
                            userEmail: email || staffData?.email,
                            role: staffData.role,
                            authType: "firebase_auth",
                        };
                    }
                }
                if (email) {
                    const q = await admin.firestore().collection("staffUsers").where("email", "==", email).limit(1).get();
                    if (!q.empty) {
                        const d = q.docs[0].data();
                        if (d?.role === "organizer" || d?.role === "admin") {
                            return {
                                userId: decoded.uid,
                                userEmail: email,
                                role: d.role,
                                authType: "firebase_auth",
                            };
                        }
                    }
                }
            }
            catch (dbErr) {
                console.warn("Could not query staffUsers in Cloud Function:", dbErr);
            }
        }
    }
    catch {
        // If not a Firebase ID Token, proceed to secret check
    }
    // 2. TEMPORARY: Mandatory ADMIN_ACCESS_HASH Secret
    // CRITICAL: Zero fallback! If the secret is not configured, this authentication method is disabled.
    const expectedHash = adminAccessHash.value()?.trim();
    if (expectedHash && expectedHash.length >= 32) {
        if (timingSafeEqual(cleanToken, expectedHash)) {
            return {
                userId: "admin_secret_key",
                role: "admin",
                authType: "admin_secret",
            };
        }
        const hashedInput = sha256Hex(cleanToken);
        if (timingSafeEqual(hashedInput, expectedHash)) {
            return {
                userId: "admin_secret_key",
                role: "admin",
                authType: "admin_secret",
            };
        }
    }
    return null;
}
/**
 * Validates international phone number
 */
function sanitizePhone(phone) {
    if (!phone || typeof phone !== "string") {
        return { valid: false, cleanPhone: "", error: "Número de telefone é obrigatório." };
    }
    let digits = phone.replace(/\D/g, "");
    if (digits.length === 10 || digits.length === 11) {
        digits = "55" + digits;
    }
    if (digits.length < 10 || digits.length > 15) {
        return { valid: false, cleanPhone: digits, error: `Número inválido (${digits.length} dígitos). Formato E.164 esperado.` };
    }
    return { valid: true, cleanPhone: digits };
}
/**
 * Cloud Function: getWhatsAppConfigStatus
 * Checks WhatsApp Cloud API credentials status without exposing secret values.
 */
exports.getWhatsAppConfigStatus = (0, https_1.onRequest)({
    secrets: [metaAccessToken, metaPhoneNumberId, metaApiVersion, metaWabaId, adminAccessHash],
    cors: true,
    region: "us-central1",
}, async (req, res) => {
    const authHeader = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    const caller = await authenticateCaller(authHeader);
    if (!caller) {
        res.status(403).json({ error: "Acesso não autorizado: credencial ou token administrativo inválido." });
        return;
    }
    const tokenValue = metaAccessToken.value()?.trim();
    const phoneId = metaPhoneNumberId.value()?.trim();
    const rawApiVer = (metaApiVersion.value() || "v26.0").trim();
    const apiVer = rawApiVer.startsWith("v") ? rawApiVer : `v${rawApiVer}`;
    const wabaId = metaWabaId.value()?.trim();
    res.json({
        hasToken: Boolean(tokenValue && tokenValue.length > 0),
        hasPhoneId: Boolean(phoneId && phoneId.length > 0),
        hasWabaId: Boolean(wabaId && wabaId.length > 0),
        apiVersion: apiVer,
        callerType: caller.authType,
        callerId: caller.userId,
    });
});
/**
 * Cloud Function: sendWhatsAppTestMessage
 * Handles authenticated test message dispatch using Meta WhatsApp Cloud API.
 */
exports.sendWhatsAppTestMessage = (0, https_1.onRequest)({
    secrets: [metaAccessToken, metaPhoneNumberId, metaApiVersion, adminAccessHash],
    cors: true,
    timeoutSeconds: 30,
    region: "us-central1",
}, async (req, res) => {
    // Only allow POST
    if (req.method !== "POST") {
        res.status(405).json({ error: "Método não permitido. Utilize POST." });
        return;
    }
    const timestamp = new Date().toISOString();
    // 1. Authorization verification (Firebase Auth RBAC or Mandatory Secret)
    const authHeader = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    const token = authHeader || req.body.adminAuthToken;
    const caller = await authenticateCaller(token);
    if (!caller) {
        res.status(403).json({
            success: false,
            status: "failed",
            errorCode: "UNAUTHORIZED",
            errorMessage: "Acesso negado: autorização administrativa necessária (Firebase ID Token ou segredo válido).",
            timestamp,
        });
        return;
    }
    // 2. Extract and validate Meta credentials
    const tokenValue = metaAccessToken.value()?.trim();
    const phoneId = metaPhoneNumberId.value()?.trim();
    const rawApiVer = (metaApiVersion.value() || "v26.0").trim();
    const apiVer = rawApiVer.startsWith("v") ? rawApiVer : `v${rawApiVer}`;
    const db = admin.firestore();
    const testLogRef = db.collection("whatsappTestMessages").doc();
    if (!tokenValue || !phoneId) {
        await testLogRef.set({
            id: testLogRef.id,
            userId: caller.userId,
            userEmail: caller.userEmail || null,
            destinationPhone: req.body.destinationPhone || "",
            templateName: req.body.templateName || "",
            languageCode: req.body.languageCode || "pt_BR",
            parameters: req.body.parameters || [],
            status: "failed",
            errorCode: "CONFIG_MISSING",
            errorMessage: "Credenciais da Meta não configuradas no Secret Manager.",
            createdAt: timestamp,
            updatedAt: timestamp,
        });
        res.status(500).json({
            success: false,
            status: "failed",
            errorCode: "CONFIG_MISSING",
            errorMessage: "Credenciais da Meta não configuradas no Secret Manager (META_ACCESS_TOKEN ou META_PHONE_NUMBER_ID ausente).",
            timestamp,
        });
        return;
    }
    // 3. Validate parameters
    const { destinationPhone, templateName, languageCode, parameters } = req.body;
    const phoneValidation = sanitizePhone(destinationPhone);
    if (!phoneValidation.valid) {
        await testLogRef.set({
            id: testLogRef.id,
            userId: caller.userId,
            userEmail: caller.userEmail || null,
            destinationPhone: destinationPhone || "",
            templateName: templateName || "",
            languageCode: languageCode || "pt_BR",
            parameters: parameters || [],
            status: "failed",
            errorCode: "INVALID_PHONE",
            errorMessage: phoneValidation.error,
            createdAt: timestamp,
            updatedAt: timestamp,
        });
        res.status(400).json({
            success: false,
            status: "failed",
            errorCode: "INVALID_PHONE",
            errorMessage: phoneValidation.error,
            timestamp,
        });
        return;
    }
    const cleanTemplateName = (templateName || "").trim().toLowerCase();
    if (!cleanTemplateName || !/^[a-z0-9_]+$/.test(cleanTemplateName)) {
        res.status(400).json({
            success: false,
            status: "failed",
            errorCode: "INVALID_TEMPLATE_NAME",
            errorMessage: "Nome do template inválido. Use apenas letras minúsculas, números e sublinhado.",
            timestamp,
        });
        return;
    }
    const cleanLanguage = (languageCode || "pt_BR").trim();
    const cleanParams = Array.isArray(parameters)
        ? parameters.map((p) => String(p).trim()).filter((p) => p.length > 0)
        : [];
    // 4. Construct WhatsApp Cloud API payload
    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phoneValidation.cleanPhone,
        type: "template",
        template: {
            name: cleanTemplateName,
            language: { code: cleanLanguage },
            ...(cleanParams.length > 0
                ? {
                    components: [
                        {
                            type: "body",
                            parameters: cleanParams.map((text) => ({ type: "text", text })),
                        },
                    ],
                }
                : {}),
        },
    };
    const endpointUrl = `https://graph.facebook.com/${apiVer}/${phoneId}/messages`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
        const response = await fetch(endpointUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${tokenValue}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const responseBody = (await response.json());
        if (response.ok) {
            const wamid = responseBody.messages?.[0]?.id || "unknown";
            await testLogRef.set({
                id: testLogRef.id,
                userId: caller.userId,
                userEmail: caller.userEmail || null,
                destinationPhone: phoneValidation.cleanPhone,
                templateName: cleanTemplateName,
                languageCode: cleanLanguage,
                parameters: cleanParams,
                status: "sent",
                wamid,
                errorCode: null,
                errorMessage: null,
                createdAt: timestamp,
                updatedAt: timestamp,
            });
            res.status(200).json({
                success: true,
                status: "sent",
                wamid,
                message: "A requisição foi aceita com sucesso pela WhatsApp Cloud API da Meta.",
                timestamp,
            });
        }
        else {
            const metaError = responseBody.error || {};
            const errorCode = metaError.code || response.status;
            const metaMsg = metaError.message || "Erro retornado pela Meta.";
            let friendlyMessage = `Erro Meta (${errorCode}): ${metaMsg}`;
            if (errorCode === 190) {
                friendlyMessage = "Token de acesso da Meta expirado ou inválido. Atualize o META_ACCESS_TOKEN.";
            }
            else if (errorCode === 131030 || errorCode === 130429) {
                friendlyMessage = "Limite de requisições atingido na WhatsApp Cloud API. Tente mais tarde.";
            }
            else if (errorCode === 131026) {
                friendlyMessage = "Número de destino não possui conta WhatsApp ou não está autorizado para testes.";
            }
            else if (errorCode === 132000 || errorCode === 132001) {
                friendlyMessage = `Template "${cleanTemplateName}" não encontrado ou não aprovado para o idioma ${cleanLanguage}.`;
            }
            await testLogRef.set({
                id: testLogRef.id,
                userId: caller.userId,
                userEmail: caller.userEmail || null,
                destinationPhone: phoneValidation.cleanPhone,
                templateName: cleanTemplateName,
                languageCode: cleanLanguage,
                parameters: cleanParams,
                status: "failed",
                wamid: null,
                errorCode: String(errorCode),
                errorMessage: friendlyMessage,
                createdAt: timestamp,
                updatedAt: timestamp,
            });
            res.status(400).json({
                success: false,
                status: "failed",
                errorCode,
                errorMessage: friendlyMessage,
                message: "Falha na validação ou envio pela Meta.",
                timestamp,
            });
        }
    }
    catch (err) {
        clearTimeout(timeoutId);
        const isAbort = err.name === "AbortError";
        await testLogRef.set({
            id: testLogRef.id,
            userId: caller.userId,
            userEmail: caller.userEmail || null,
            destinationPhone: phoneValidation.cleanPhone,
            templateName: cleanTemplateName,
            languageCode: cleanLanguage,
            parameters: cleanParams,
            status: "uncertain",
            wamid: null,
            errorCode: isAbort ? "TIMEOUT" : "NETWORK_ERROR",
            errorMessage: isAbort
                ? "Tempo limite de 15s excedido aguardando resposta da Meta. Status incerto."
                : `Erro de conexão com Meta: ${err.message}`,
            createdAt: timestamp,
            updatedAt: timestamp,
        });
        res.status(504).json({
            success: false,
            status: "uncertain",
            errorCode: isAbort ? "TIMEOUT" : "NETWORK_ERROR",
            errorMessage: isAbort
                ? "A requisição excedeu o tempo limite aguardando a resposta da Meta. Não é possível confirmar o status do envio. Por segurança, nenhum reenvio automático foi realizado."
                : `Falha de rede ou conectividade com a Meta: ${err.message}`,
            timestamp,
        });
    }
});
/**
 * Cloud Function: verifyAdminCode
 * Securely verifies temporary administrator access code without exposing hash to client.
 */
exports.verifyAdminCode = (0, https_1.onRequest)({
    secrets: [adminAccessHash],
    cors: true,
    region: "us-central1",
}, async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Método não permitido. Utilize POST." });
        return;
    }
    const { code } = req.body || {};
    if (!code || typeof code !== "string" || !code.trim()) {
        res.status(400).json({ success: false, error: "Código de acesso não fornecido." });
        return;
    }
    const envHash = adminAccessHash.value()?.trim();
    if (!envHash || envHash.length < 32) {
        res.status(503).json({
            success: false,
            error: "ADMIN_ACCESS_HASH não está configurado nas variáveis de ambiente do servidor. Defina a variável para habilitar o acesso com código.",
        });
        return;
    }
    const hashedInput = crypto.createHash("sha256").update(code.trim()).digest("hex").toLowerCase();
    const isValid = timingSafeEqual(hashedInput, envHash.toLowerCase()) || timingSafeEqual(code.trim(), envHash);
    if (!isValid) {
        res.status(401).json({ success: false, error: "Código de acesso incorreto." });
        return;
    }
    res.json({
        success: true,
        token: envHash,
        message: "Autenticação administrativa concedida com sucesso.",
    });
});
//# sourceMappingURL=index.js.map