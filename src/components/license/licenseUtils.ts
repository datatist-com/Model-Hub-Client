export function formatDisplayDate(iso: string): string {
  const raw = iso.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10);
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function maskLicenseKey(value: string): string {
  const clean = value.replace(/\s+/g, '');
  if (clean.length <= 8) {
    return `${clean.slice(0, 2)}****${clean.slice(-2)}`;
  }
  return `${clean.slice(0, 4)}********${clean.slice(-4)}`;
}
