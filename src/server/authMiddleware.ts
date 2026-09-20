/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase Admin lazily and safely
let adminAppInstance: App | null = null;

export function getFirebaseAdmin(): App {
  if (!adminAppInstance) {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      adminAppInstance = existingApps[0]!;
    } else {
      adminAppInstance = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId,
      });
    }
  }
  return adminAppInstance;
}

export interface AuthenticatedAdminUser {
  userId: string;
  userEmail?: string;
  authType: 'firebase_auth' | 'admin_secret';
  role: 'admin' | 'organizer';
}

/**
 * In-memory sliding window rate limiter for security-sensitive routes.
 */
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up stale rate limit entries periodically (every 5 minutes)
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (val.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
}, 300000);
if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

export function checkServerRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; remaining: number; resetSeconds: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || record.resetTime < now) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetSeconds: Math.ceil(windowMs / 1000) };
  }

  if (record.count >= maxRequests) {
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, resetSeconds };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count, resetSeconds: Math.ceil((record.resetTime - now) / 1000) };
}

/**
 * Timing-safe string comparison to prevent timing attacks.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  try {
    const bufA = Buffer.from(a.trim(), 'utf8');
    const bufB = Buffer.from(b.trim(), 'utf8');
    if (bufA.length !== bufB.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Computes SHA-256 hex digest of a string.
 */
export function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input.trim()).digest('hex');
}

/**
 * Verifies if the request is authentically authorized either via:
 * 1. Firebase Authentication ID Token (RBAC / Custom Claims / Firestore staff validation)
 * 2. Temporary Admin Access Secret (defined strictly via ADMIN_ACCESS_HASH in .env with ZERO hardcoded fallback)
 */
export async function authenticateAndAuthorizeAdmin(tokenCandidate?: string): Promise<AuthenticatedAdminUser | null> {
  if (!tokenCandidate || typeof tokenCandidate !== 'string') {
    return null;
  }

  const cleanToken = tokenCandidate.trim();
  if (!cleanToken) {
    return null;
  }

  // 1. PRIMARY METHOD: Firebase Authentication ID Token verification via Firebase Admin SDK
  try {
    const app = getFirebaseAdmin();
    const authAdmin = getAuth(app);
    const decoded = await authAdmin.verifyIdToken(cleanToken);

    if (decoded && decoded.uid) {
      const email = decoded.email?.toLowerCase();
      const hasDirectClaim = decoded.role === 'admin' || decoded.role === 'organizer' || decoded.admin === true;

      if (hasDirectClaim) {
        return {
          userId: decoded.uid,
          userEmail: email,
          authType: 'firebase_auth',
          role: decoded.role === 'admin' ? 'admin' : 'organizer',
        };
      }

      // Check if user is registered with organizer role in Firestore staffUsers or admins collection
      try {
        const firestore = getFirestore(app);
        const staffDoc = await firestore.collection('staffUsers').doc(decoded.uid).get();
        if (staffDoc.exists) {
          const staffData = staffDoc.data();
          if (staffData?.role === 'organizer' || staffData?.role === 'admin') {
            return {
              userId: decoded.uid,
              userEmail: email || staffData?.email,
              authType: 'firebase_auth',
              role: staffData.role,
            };
          }
        }

        // Check by email in staffUsers if query matches
        if (email) {
          const staffQuery = await firestore.collection('staffUsers').where('email', '==', email).limit(1).get();
          if (!staffQuery.empty) {
            const data = staffQuery.docs[0].data();
            if (data?.role === 'organizer' || data?.role === 'admin') {
              return {
                userId: decoded.uid,
                userEmail: email,
                authType: 'firebase_auth',
                role: data.role,
              };
            }
          }
        }
      } catch (firestoreErr) {
        console.warn('Could not verify staff role via Firestore Admin:', firestoreErr);
      }

      // Check against optional ADMIN_EMAILS environment variable
      const adminEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      if (email && adminEmails.includes(email)) {
        return {
          userId: decoded.uid,
          userEmail: email,
          authType: 'firebase_auth',
          role: 'admin',
        };
      }
    }
  } catch {
    // If not a valid Firebase ID Token, proceed to check temporary admin secret
  }

  // 2. TEMPORARY TRANSITIONAL METHOD: Required ADMIN_ACCESS_HASH secret
  // CRITICAL SECURITY RULE: No hardcoded fallback! If ADMIN_ACCESS_HASH is unset, this path is completely DISABLED.
  const envHash = process.env.ADMIN_ACCESS_HASH?.trim();
  if (envHash && envHash.length >= 32) {
    // Check direct hash equality (timing-safe)
    if (timingSafeEqual(cleanToken, envHash)) {
      return {
        userId: 'admin_secret_key',
        authType: 'admin_secret',
        role: 'admin',
      };
    }

    // Check if token was plaintext password matching the sha256 hash (timing-safe)
    const candidateHash = sha256Hex(cleanToken);
    if (timingSafeEqual(candidateHash, envHash)) {
      return {
        userId: 'admin_secret_key',
        authType: 'admin_secret',
        role: 'admin',
      };
    }
  }

  return null;
}
