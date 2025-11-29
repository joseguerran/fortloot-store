/**
 * Browser Fingerprint Utility
 * Genera un ID único de sesión basado en características del browser
 * Para tracking de consentimientos GDPR sin cookies
 */

/**
 * Genera un hash SHA-256 de un string
 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Genera un fingerprint único del browser
 * Combina múltiples características para crear un ID pseudoanónimo
 * No es 100% único pero es suficiente para tracking de consentimientos
 */
export async function generateFingerprint(): Promise<string> {
  const components: string[] = [];

  // User Agent
  components.push(navigator.userAgent || 'unknown');

  // Screen dimensions
  components.push(`${screen.width}x${screen.height}`);
  components.push(`${screen.colorDepth}`);

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown');

  // Language
  components.push(navigator.language || 'unknown');

  // Platform
  components.push(navigator.platform || 'unknown');

  // Hardware concurrency (CPU cores)
  components.push(String(navigator.hardwareConcurrency || 0));

  // Touch support
  components.push(String('ontouchstart' in window));

  // Canvas fingerprint (simplified)
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('FortLoot', 2, 2);
      components.push(canvas.toDataURL().slice(-50));
    }
  } catch {
    components.push('canvas-error');
  }

  // Combine and hash
  const fingerprint = components.join('|');
  const hash = await sha256(fingerprint);

  // Return first 32 characters for a reasonable ID length
  return hash.substring(0, 32);
}

/**
 * Obtiene o genera el session ID para consentimientos
 * Almacena en sessionStorage para mantener consistencia durante la sesión
 */
export async function getConsentSessionId(): Promise<string> {
  const STORAGE_KEY = 'fortloot_consent_session_id';

  try {
    // Check sessionStorage first
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored;
    }

    // Generate new fingerprint
    const fingerprint = await generateFingerprint();

    // Store for session consistency
    sessionStorage.setItem(STORAGE_KEY, fingerprint);

    return fingerprint;
  } catch {
    // Fallback: generate random ID if fingerprinting fails
    const fallbackId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    return fallbackId;
  }
}
