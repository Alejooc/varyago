// helpers/facebook-ids.ts

// Validadores oficiales de formato Meta
const FBP_RE = /^fb\.1\.\d{10,}\.[A-Za-z0-9._-]+$/;
const FBC_RE = /^fb\.1\.\d{10,}\.[A-Za-z0-9._-]+$/;

/**
 * Obtiene una cookie por nombre.
 */
export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Crea o actualiza una cookie (duración 90 días).
 */
function setCookie(name: string, value: string, days = 90) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

/**
 * Devuelve el _fbp válido generado por el pixel.
 * Si no cumple formato, retorna undefined.
 */
export function getFbp(): string | undefined {
  const val = getCookie('_fbp')?.trim();
  return val && FBP_RE.test(val) ? val : undefined;
}

/**
 * Devuelve el _fbc correcto:
 * - Si hay fbclid real en la URL → construye fb.1.<timestamp>.<fbclid> y guarda cookie.
 * - Si no hay fbclid → usa cookie _fbc existente si es válida.
 * - Si fbclid es vacío o el literal "fbclid" → no devuelve nada.
 */
export function getFbc(): string | undefined {
  const url = new URL(window.location.href);
  const raw = url.searchParams.get('fbclid');

  // Si no hay fbclid, usa cookie si es válida
  if (!raw) {
    const cookieVal = getCookie('_fbc')?.trim();
    return cookieVal && FBC_RE.test(cookieVal) ? cookieVal : undefined;
  }

  // Evita placeholders o fbclid vacío
  const fbclid = raw.trim();
  if (!fbclid || fbclid.toLowerCase() === 'fbclid') {
    return undefined;
  }

  // Construye _fbc válido
  const fbc = `fb.1.${Math.floor(Date.now() / 1000)}.${fbclid}`;
  if (!FBC_RE.test(fbc)) return undefined;

  setCookie('_fbc', fbc);
  return fbc;
}
