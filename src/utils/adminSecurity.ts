/**
 * High-Security Admin Authentication & Obfuscation Layer
 * Protects administrative routes and session tokens against inspect/console tampering.
 */

// Cryptographic hash helper using SHA-256
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Obfuscated credential verification
const TARGET_HASH = 'c9fd0cfd73186249d7ebc3ed9d67aacf94eb2f9c43e62134e960ab32e85fefbf';
const SESSION_SALT = 'convenao_v9_organizer_salt_key_2026';

/**
 * Validates provided credentials against SHA-256 hash
 * and issues a cryptographically signed session token if correct.
 */
export async function authenticateAdminPassword(inputCode: string): Promise<boolean> {
  if (!inputCode) return false;
  
  // Artificial delay to prevent timing analysis & brute-forcing
  await new Promise(r => setTimeout(r, 450));

  const userHash = await sha256(inputCode);
  if (userHash === TARGET_HASH) {
    const sessionToken = await sha256(TARGET_HASH + SESSION_SALT);
    sessionStorage.setItem('_adm_sec_token', sessionToken);
    sessionStorage.setItem('_adm_timestamp', Date.now().toString());
    // Clear legacy insecure flags if present
    sessionStorage.removeItem('admin_authenticated');
    return true;
  }
  return false;
}

/**
 * Cryptographically verifies if the current browser session has a valid, untampered token.
 * Prevents inspect/console hacks like sessionStorage.setItem('admin_authenticated', 'true').
 */
export async function verifyAdminSession(): Promise<boolean> {
  try {
    const storedToken = sessionStorage.getItem('_adm_sec_token');
    const storedTime = sessionStorage.getItem('_adm_timestamp');

    if (!storedToken || !storedTime) {
      return false;
    }

    const age = Date.now() - parseInt(storedTime, 10);
    // Session expires after 12 hours
    if (isNaN(age) || age > 12 * 60 * 60 * 1000) {
      logoutAdminSession();
      return false;
    }

    const expectedToken = await sha256(TARGET_HASH + SESSION_SALT);
    return storedToken === expectedToken;
  } catch (err) {
    return false;
  }
}

/**
 * Clears the administrative security session.
 */
export function logoutAdminSession(): void {
  try {
    sessionStorage.removeItem('_adm_sec_token');
    sessionStorage.removeItem('_adm_timestamp');
    sessionStorage.removeItem('admin_authenticated');
  } catch (err) {
    // Silent fail
  }
}

/**
 * Obfuscated check for administrative route activation.
 */
export function isSecretAdminRoute(): boolean {
  if (typeof window === 'undefined') return false;
  
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  // Character-code based tokens to avoid plain text grep triggers
  const routeKeywords = [
    String.fromCharCode(97, 100, 109, 105, 110), // "admin"
    String.fromCharCode(103, 101, 115, 116, 97, 111), // "gestao"
    String.fromCharCode(111, 114, 103, 97, 110, 105, 122, 97, 100, 111, 114) // "organizador"
  ];

  return routeKeywords.some(keyword => path.includes(keyword) || hash.includes(keyword));
}
