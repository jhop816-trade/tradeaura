// Placeholder numbers for the Phase 1 shell. Swapped for real Google Ads
// API data once Basic Access is approved — see lib/policy.ts for the
// budget rule this data will eventually be checked against.
export const mockAdsData = {
  spendToday: 3.12,
  spendThisMonth: 22.14,
  monthlyBudgetCap: 100,
  impressions7d: 640,
  clicks7d: 51,
  ctr7d: 7.97,
  avgCpc: 0.43,
  conversions7d: 8,
  campaignStatus: 'Enabled — Eligible',
  topKeywords: [
    { keyword: 'barber near me', clicks: 14, conversions: 4 },
    { keyword: 'barber pompano beach', clicks: 11, conversions: 2 },
    { keyword: 'private barber suite', clicks: 8, conversions: 2 },
  ],
  lowPerformers: [
    { searchTerm: 'cheap haircut', spend: 6.4, conversions: 0 },
    { searchTerm: 'barber school', spend: 3.1, conversions: 0 },
  ],
}
