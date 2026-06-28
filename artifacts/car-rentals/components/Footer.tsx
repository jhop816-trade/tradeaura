import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <p className="font-bold text-lg">[Client Name] Car Rentals</p>
          <p className="text-sm text-gray-500 mt-1">Private luxury rentals. No agency fees.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-8 text-sm text-gray-600">
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-gray-900">Navigate</p>
            <Link href="/fleet" className="hover:text-black">Fleet</Link>
            <Link href="/booking" className="hover:text-black">Book Now</Link>
            <Link href="/about" className="hover:text-black">About</Link>
            <Link href="/contact" className="hover:text-black">Contact</Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-gray-900">Connect</p>
            <a href="https://instagram.com" target="_blank" rel="noopener" className="hover:text-black">Instagram</a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 text-center py-4 text-xs text-gray-400">
        © {new Date().getFullYear()} [Client Name] Car Rentals. All rights reserved.
      </div>
    </footer>
  )
}
