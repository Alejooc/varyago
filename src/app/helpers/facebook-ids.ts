// helpers/facebook-ids.ts
export function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[2]) : null;
}

// _fbp ya lo crea el pixel, solo léelo
export function getFbp(): string | undefined {
  const v = getCookie('_fbp');
  return v || undefined;
}

// fbc: si vienes de un click de FB, hay fbclid en la URL => construimos cookie-style
export function getFbc(): string | undefined {
  const url = new URL(window.location.href);
  const fbclid = url.searchParams.get('fbclid');
  if (!fbclid) return getCookie('_fbc') || undefined;

  // formato: fb.1.<timestamp>.<fbclid>
  const ts = Date.now();
  return `fb.1.${Math.floor(ts / 1000)}.${fbclid}`;
}
