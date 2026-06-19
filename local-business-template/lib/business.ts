import businessData from '../config/business.json'

export interface Service {
  name: string
  description: string
  price: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface TeamMember {
  name: string
  role: string
  bio: string
}

export interface BusinessConfig {
  name: string
  slug: string
  tagline: string
  phone: string
  email: string
  address: string
  hours: Record<string, string>
  services: Service[]
  faqs: FAQ[]
  about: string
  team: TeamMember[]
  brand: {
    accentColor: string
    accentColorDark: string
    accentColorLight: string
  }
}

export const business: BusinessConfig = businessData
