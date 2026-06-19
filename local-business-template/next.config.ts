import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Point to the project root so Next.js doesn't pick up the monorepo lockfile
  outputFileTracingRoot: path.join(__dirname),
}

export default nextConfig
