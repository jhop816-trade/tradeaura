import { Sidebar } from '@/components/Sidebar'
import { StatCard } from '@/components/StatCard'
import { mockAdsData } from '@/lib/mock/adsData'

export default function AdsPage() {
  const d = mockAdsData
  const remaining = d.monthlyBudgetCap - d.spendThisMonth

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="mb-4 text-lg font-semibold">Google Ads</h1>
        <p className="mb-4 text-xs text-white/40">Mock data — placeholder until Google Ads API access is approved.</p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Spend today" value={`$${d.spendToday.toFixed(2)}`} />
          <StatCard label="Spend this month" value={`$${d.spendThisMonth.toFixed(2)}`} />
          <StatCard label="Remaining this month" value={`$${remaining.toFixed(2)} of $${d.monthlyBudgetCap}`} />
          <StatCard label="Status" value={d.campaignStatus} />
          <StatCard label="Impressions (7d)" value={d.impressions7d} />
          <StatCard label="Clicks (7d)" value={d.clicks7d} />
          <StatCard label="CTR (7d)" value={`${d.ctr7d}%`} />
          <StatCard label="Avg CPC" value={`$${d.avgCpc.toFixed(2)}`} />
          <StatCard label="Conversions (7d)" value={d.conversions7d} />
        </div>

        <h2 className="mb-2 mt-6 text-sm font-semibold text-white/80">Top keywords</h2>
        <div className="space-y-1">
          {d.topKeywords.map((k) => (
            <div key={k.keyword} className="flex justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm">
              <span>{k.keyword}</span>
              <span className="text-white/50">{k.clicks} clicks · {k.conversions} conversions</span>
            </div>
          ))}
        </div>

        <h2 className="mb-2 mt-6 text-sm font-semibold text-white/80">Spending without converting</h2>
        <div className="space-y-1">
          {d.lowPerformers.map((k) => (
            <div key={k.searchTerm} className="flex justify-between rounded-md border border-red-400/20 bg-red-400/5 px-3 py-2 text-sm">
              <span>{k.searchTerm}</span>
              <span className="text-red-300">${k.spend.toFixed(2)} spent · 0 conversions</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
