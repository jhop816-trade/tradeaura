import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#030303] border-t border-[#D4A853]/8 pt-16 pb-10 px-8 md:px-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12 pb-12 border-b border-white/5">
          <div className="col-span-2 md:col-span-1">
            <p className="font-playfair font-bold text-2xl text-white mb-3">
              [Client<span className="text-[#D4A853]">.</span>Name]
            </p>
            <p className="text-xs text-white/25 leading-relaxed tracking-wide">
              Private luxury rentals.<br />No agency fees. Direct service.
            </p>
          </div>
          <div>
            <p className="text-[9px] font-bold tracking-[0.22em] uppercase text-[#D4A853] mb-5">Navigate</p>
            <ul className="flex flex-col gap-3">
              {[['/', 'Home'], ['/fleet', 'Fleet'], ['/booking', 'Book Now'], ['/about', 'About'], ['/reviews', 'Reviews'], ['/contact', 'Contact']].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-[13px] text-white/35 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[9px] font-bold tracking-[0.22em] uppercase text-[#D4A853] mb-5">Fleet</p>
            <ul className="flex flex-col gap-3">
              {[['/fleet/tesla-model-3', 'Tesla Model 3'], ['/fleet/mercedes-benz-c300', 'Mercedes C300']].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-[13px] text-white/35 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[9px] font-bold tracking-[0.22em] uppercase text-[#D4A853] mb-5">Connect</p>
            <ul className="flex flex-col gap-3">
              <li><a href="https://instagram.com" target="_blank" rel="noopener" className="text-[13px] text-white/35 hover:text-white transition-colors">Instagram</a></li>
              <li><a href="https://wa.me/1XXXXXXXXXX" target="_blank" rel="noopener" className="text-[13px] text-white/35 hover:text-white transition-colors">WhatsApp</a></li>
              <li><Link href="/contact" className="text-[13px] text-white/35 hover:text-white transition-colors">Contact Form</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-white/15 tracking-wide">© {new Date().getFullYear()} [Client Name] Car Rentals. All rights reserved.</p>
          <div className="flex gap-7">
            {[['#', 'Privacy'], ['#', 'Terms']].map(([href, label]) => (
              <a key={label} href={href} className="text-[11px] text-white/20 hover:text-white/50 transition-colors tracking-wide">{label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
