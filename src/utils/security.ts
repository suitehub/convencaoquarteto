/**
 * Security & Anti-Abuse Utilities
 * Implements sliding-window Rate Limiting and Input Sanitization.
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  lockoutMs: number;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  login_participant: { maxAttempts: 5, windowMs: 60 * 1000, lockoutMs: 60 * 1000 },
  login_staff: { maxAttempts: 5, windowMs: 60 * 1000, lockoutMs: 60 * 1000 },
  admin_lock: { maxAttempts: 4, windowMs: 120 * 1000, lockoutMs: 120 * 1000 },
  registration: { maxAttempts: 3, windowMs: 180 * 1000, lockoutMs: 180 * 1000 },
  checkin: { maxAttempts: 20, windowMs: 60 * 1000, lockoutMs: 30 * 1000 },
};

interface AttemptRecord {
  timestamps: number[];
  lockedUntil?: number;
}

function getStorageKey(actionKey: string): string {
  return `rate_limit_${actionKey}`;
}

function getRecord(actionKey: string): AttemptRecord {
  try {
    const raw = sessionStorage.getItem(getStorageKey(actionKey));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading rate limit record:', err);
  }
  return { timestamps: [] };
}

function saveRecord(actionKey: string, record: AttemptRecord): void {
  try {
    sessionStorage.setItem(getStorageKey(actionKey), JSON.stringify(record));
  } catch (err) {
    console.error('Error saving rate limit record:', err);
  }
}

/**
 * Checks if an action is allowed based on rate limiting policy.
 */
export function checkRateLimit(actionKey: string, customConfig?: Partial<RateLimitConfig>): {
  allowed: boolean;
  remainingSeconds: number;
  currentAttempts: number;
} {
  const config = { ...(DEFAULT_CONFIGS[actionKey] || { maxAttempts: 5, windowMs: 60000, lockoutMs: 60000 }), ...customConfig };
  const now = Date.now();
  const record = getRecord(actionKey);

  // Check if currently locked out
  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingSeconds,
      currentAttempts: record.timestamps.length,
    };
  }

  // Filter timestamps within current window
  const validTimestamps = record.timestamps.filter(ts => now - ts < config.windowMs);

  if (validTimestamps.length >= config.maxAttempts) {
    const lockedUntil = now + config.lockoutMs;
    saveRecord(actionKey, { timestamps: validTimestamps, lockedUntil });
    return {
      allowed: false,
      remainingSeconds: Math.ceil(config.lockoutMs / 1000),
      currentAttempts: validTimestamps.length,
    };
  }

  return {
    allowed: true,
    remainingSeconds: 0,
    currentAttempts: validTimestamps.length,
  };
}

/**
 * Records an attempt for a rate limited action.
 */
export function recordAttempt(actionKey: string, customConfig?: Partial<RateLimitConfig>): void {
  const config = { ...(DEFAULT_CONFIGS[actionKey] || { maxAttempts: 5, windowMs: 60000, lockoutMs: 60000 }), ...customConfig };
  const now = Date.now();
  const record = getRecord(actionKey);

  const validTimestamps = record.timestamps.filter(ts => now - ts < config.windowMs);
  validTimestamps.push(now);

  let lockedUntil = record.lockedUntil;
  if (validTimestamps.length >= config.maxAttempts) {
    lockedUntil = now + config.lockoutMs;
  }

  saveRecord(actionKey, { timestamps: validTimestamps, lockedUntil });
}

/**
 * Clears rate limit record upon successful action (e.g. successful login).
 */
export function clearRateLimit(actionKey: string): void {
  try {
    sessionStorage.removeItem(getStorageKey(actionKey));
  } catch (err) {
    console.error('Error clearing rate limit record:', err);
  }
}

/**
 * Input Sanitization & XSS Prevention
 */
export function sanitizeInput(input: string, maxLength = 255): string {
  if (!input) return '';
  
  // Strip dangerous tags and script protocols
  let clean = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '') // Strip HTML tags
    .replace(/javascript:/gi, '')
    .replace(/onload=/gi, '')
    .replace(/onerror=/gi, '');

  return clean.trim().slice(0, maxLength);
}

/**
 * Strict Email Validator
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

/**
 * Basic Phone Sanitizer/Validator
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 13;
}
