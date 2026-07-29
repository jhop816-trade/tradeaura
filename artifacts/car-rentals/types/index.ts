export interface Vehicle {
  id: string
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

export interface Booking {
  id: string
  vehicle_id: string
  client_name: string
  client_email: string
  client_phone: string
  start_date: string
  end_date: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  stripe_payment_id: string | null
  deposit_paid: boolean
  source: string
  created_at: string
  vehicles?: Pick<Vehicle, 'name' | 'make' | 'model' | 'year'>
}

export interface DateRangeRow {
  start_date: string
  end_date: string
}

export interface Blackout extends DateRangeRow {
  id: string
  vehicle_id: string
  reason: string
  created_at: string
}

export interface Inquiry {
  id: string
  name: string
  phone: string
  email: string
  vehicle_id: string | null
  preferred_dates: string
  message: string
  created_at: string
}
