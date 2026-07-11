const BASE_URL = process.env.TRADEAURA_URL ?? 'https://tradeaura.com';

export function buildUtmLink(pillar: string): string {
  const params = new URLSearchParams({
    utm_source: 'instagram',
    utm_medium: 'gid',
    utm_campaign: pillar.replace(/\s+/g, '-').toLowerCase(),
  });
  return `${BASE_URL}/?${params.toString()}`;
}
