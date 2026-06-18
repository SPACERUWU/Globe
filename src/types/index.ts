export interface Trip {
  id: string
  user_id: string
  title: string
  country_name: string
  country_code: string   // alpha-2 e.g. "JP"
  country_geo: string    // world-atlas geo name e.g. "Japan"
  city: string | null
  start_date: string | null
  end_date: string | null
  description: string | null
  cover_photo_url: string | null
  is_public: boolean
  public_slug: string | null
  created_at: string
  memories?: { count: number }[]
}

export interface Memory {
  id: string
  trip_id: string
  user_id: string
  caption: string | null
  photo_url: string | null
  location_name: string | null
  latitude: number | null
  longitude: number | null
  memory_date: string | null
  category: 'place' | 'moment' | 'food' | 'people'
  created_at: string
}

export interface WishlistEntry {
  id: string
  user_id: string
  country_name: string
  country_code: string
  country_geo: string
  note: string | null
  created_at: string
}

export interface PackingItem {
  id: string
  trip_id: string
  user_id: string
  label: string
  checked: boolean
  created_at: string
}
