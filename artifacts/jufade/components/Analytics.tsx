import Script from 'next/script'
import { site } from '@/config/site'

/**
 * Google tag for Google Ads conversion tracking (+ optional GA4).
 * Renders nothing until IDs are filled in at config/site.ts → analytics.
 */
export function Analytics() {
  const { googleAdsId, ga4Id } = site.analytics
  const primaryId = googleAdsId || ga4Id
  if (!primaryId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${googleAdsId ? `gtag('config', '${googleAdsId}');` : ''}
          ${ga4Id ? `gtag('config', '${ga4Id}');` : ''}
        `}
      </Script>
    </>
  )
}
