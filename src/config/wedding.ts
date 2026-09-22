/**
 * ONE place for every wedding detail.
 *
 * Nothing about the wedding is hard-coded in the components — they all read
 * from here. To change something, edit this file, OR override any top-level
 * key from the database (table `wedding_settings`, see README) without
 * redeploying. Database values are deep-merged over these defaults.
 *
 * The three things still to be supplied are marked  ► TO ADD LATER.
 */

export interface Venue {
  name: string
  /** Optional second line, e.g. the area */
  location?: string
  /** 24h "HH:mm" */
  time: string
  /** Paste a Google Maps share link here once you have the exact place. */
  mapUrl: string
  /** Optional: a Google Maps directions link. If empty, one is built from the venue name. */
  directionsUrl: string
}

export interface Swatch {
  name: string
  hex: string
}

export interface GalleryPhoto {
  /** e.g. '/assets/gallery/photo-1.jpg' */
  src: string
  alt: string
}

export interface MobileMoneyDetails {
  provider: string
  number: string
  accountName: string
  /** Any extra instructions, e.g. "Use your name as the reference". */
  instructions: string
}

export interface WeddingConfig {
  groom: string
  bride: string
  /** ISO calendar date, interpreted in `timezone` */
  weddingDate: string
  timezone: string
  /** Countdown target: this time on the wedding day, in `timezone`. */
  countdownTime: string
  church: Venue
  photography: { time: string }
  reception: Venue
  dressCode: Swatch[]
  gifts: {
    headline: string
    message: string
    mobileMoney: MobileMoneyDetails
  }
  music: {
    /** ► TO ADD LATER: drop the song at public/assets/music/wedding-song.mp3 (or paste a Supabase Storage URL). */
    src: string
    title: string
  }
  gallery: {
    /** ► TO ADD LATER: add photos here. While empty, elegant placeholders are shown. */
    photos: GalleryPhoto[]
    placeholderCount: number
  }
  /** ► TO ADD LATER: a couple photo for the oval frame, e.g. '/assets/gallery/couple.jpg'. Empty = monogram. */
  heroPhoto: string
  /** Offset of `timezone` used to build the countdown target instant. Africa/Lusaka (CAT) is UTC+2 all year. */
  utcOffset: string
}

export const defaultWedding: WeddingConfig = {
  groom: 'Chikote Gift Sikelete',
  bride: 'Muchimba Lugwalo',
  weddingDate: '2026-12-20',
  timezone: 'Africa/Lusaka',
  utcOffset: '+02:00',
  countdownTime: '09:00',

  church: {
    name: 'Njanji SDA Church',
    time: '09:00',
    // ► TO ADD LATER: exact Google Maps link for the church.
    mapUrl: '',
    directionsUrl: '',
  },


  reception: {
    name: 'Lota Lodge',
    location: 'Chalala',
    time: '14:00',
    // ► TO ADD LATER: exact Google Maps link for the lodge.
    mapUrl: '',
    directionsUrl: '',
  },

  dressCode: [
    { name: 'Black', hex: '#111111' },
    { name: 'Olive Green', hex: '#556B2F' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Champagne Gold', hex: '#F7E7CE' },
  ],

  gifts: {
    headline: 'Your presence is the greatest gift.',
    message:
      'We kindly request that all gifts be in monetary form.',
    mobileMoney: {
      
      provider: 'MTN Money',
      number: '+260963448837',
      accountName: 'Chikote Sikelete',
      instructions: 'Use your name as the reference',
    },
  },

  music: {
    src: '/assets/music/wedding-song.mp3',
    title: 'Wedding song',
  },

  gallery: {
    photos: [
      // { src: '/assets/gallery/photo-1.jpg', alt: 'Chikote and Muchimba' },
    ],
    placeholderCount: 6,
  },

  heroPhoto: '',
}

// ---------------------------------------------------------------------
// Merging (database overrides → defaults)
// ---------------------------------------------------------------------

type Json = Record<string, unknown>

const isPlainObject = (v: unknown): v is Json =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/** Deep-merge `override` onto `base`. Arrays and primitives are replaced, objects are merged. */
export function mergeConfig<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) return base
  const out: Json = { ...base }
  for (const [key, value] of Object.entries(override)) {
    if (!(key in base)) continue // ignore unknown keys
    const current = (base as Json)[key]
    if (isPlainObject(current) && isPlainObject(value)) out[key] = mergeConfig(current, value)
    else if (value !== null && value !== undefined && typeof value === typeof current) out[key] = value
    else if (Array.isArray(current) && Array.isArray(value)) out[key] = value
  }
  return out as T
}
