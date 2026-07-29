export interface VehicleInput {
  name: string
  make: string
  model: string
  year: number
  daily_rate: number
  deposit_amount: number
  mileage_limit: number
  photos: string[]
  description: string
  slug: string
  active: boolean
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function text(value: unknown, field: string, max: number, errors: string[]): string {
  if (typeof value !== 'string' || value.trim() === '') {
    errors.push(`${field} is required.`)
    return ''
  }
  const trimmed = value.trim()
  if (trimmed.length > max) {
    errors.push(`${field} must be ${max} characters or fewer.`)
    return trimmed.slice(0, max)
  }
  return trimmed
}

function number(
  value: unknown,
  field: string,
  { min, max, integer }: { min: number; max: number; integer?: boolean },
  errors: string[]
): number {
  const parsed = typeof value === 'string' ? Number(value) : value
  if (typeof parsed !== 'number' || !Number.isFinite(parsed)) {
    errors.push(`${field} must be a number.`)
    return min
  }
  if (integer && !Number.isInteger(parsed)) {
    errors.push(`${field} must be a whole number.`)
    return min
  }
  if (parsed < min || parsed > max) {
    errors.push(`${field} must be between ${min} and ${max}.`)
    return min
  }
  return parsed
}

/**
 * Validates an admin-submitted vehicle. Returns either the cleaned row or the
 * list of problems to show back in the form.
 */
export function validateVehicle(
  body: unknown
): { ok: true; value: VehicleInput } | { ok: false; errors: string[] } {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, errors: ['Invalid request body.'] }
  }
  const raw = body as Record<string, unknown>
  const errors: string[] = []

  const name = text(raw.name, 'Name', 120, errors)
  const make = text(raw.make, 'Make', 60, errors)
  const model = text(raw.model, 'Model', 60, errors)

  const currentYear = new Date().getFullYear()
  const year = number(raw.year, 'Year', { min: 1900, max: currentYear + 2, integer: true }, errors)
  const daily_rate = number(raw.daily_rate, 'Daily rate', { min: 0, max: 100000 }, errors)
  const deposit_amount = number(raw.deposit_amount, 'Deposit', { min: 0, max: 100000 }, errors)
  const mileage_limit = number(raw.mileage_limit, 'Mileage limit', { min: 0, max: 100000, integer: true }, errors)

  const slugSource = typeof raw.slug === 'string' && raw.slug.trim() !== '' ? raw.slug : name
  const slug = slugify(String(slugSource))
  if (!SLUG.test(slug)) {
    errors.push('Slug must contain letters, numbers and hyphens only.')
  }

  const description = typeof raw.description === 'string' ? raw.description.trim().slice(0, 4000) : ''

  let photos: string[] = []
  if (Array.isArray(raw.photos)) {
    photos = raw.photos
      .filter((p): p is string => typeof p === 'string')
      .map(p => p.trim())
      .filter(p => p !== '')
      .slice(0, 40)
    const bad = photos.find(p => !p.startsWith('/') && !p.startsWith('https://'))
    if (bad) errors.push('Photo paths must start with "/" or "https://".')
  } else if (raw.photos !== undefined) {
    errors.push('Photos must be a list.')
  }

  const active = raw.active === undefined ? true : raw.active === true || raw.active === 'true'

  if (errors.length > 0) return { ok: false, errors }

  return {
    ok: true,
    value: { name, make, model, year, daily_rate, deposit_amount, mileage_limit, photos, description, slug, active },
  }
}
