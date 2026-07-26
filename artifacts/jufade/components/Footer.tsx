import { Instagram, Mail, Phone } from 'lucide-react'
import { site } from '@/config/site'
import { BrandLogo } from '@/components/ui/BrandLogo'

export function Footer() {
  return (
    <footer className="border-t border-line/60 bg-charcoal">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-12 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-4">
          <BrandLogo className="h-16 w-16" />
          <div>
            <p className="display text-2xl text-frost">
              JU<span className="text-gold">FADE</span>
            </p>
            <p className="mt-1 text-sm text-smoke">{site.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <a
            href={site.contact.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`JuFade on Instagram ${site.contact.instagramHandle}`}
            className="text-smoke transition-colors hover:text-gold"
          >
            <Instagram size={20} />
          </a>
          <a href={`tel:${site.contact.phone.replace(/\D/g, '')}`} aria-label="Call JuFade" className="text-smoke transition-colors hover:text-gold">
            <Phone size={20} />
          </a>
          {site.contact.email ? (
            <a href={`mailto:${site.contact.email}`} aria-label="Email JuFade" className="text-smoke transition-colors hover:text-gold">
              <Mail size={20} />
            </a>
          ) : null}
        </div>
        <p className="text-xs text-smoke/70">
          © {new Date().getFullYear()} {site.name}. {site.location.addressLine2}
        </p>
      </div>
    </footer>
  )
}
