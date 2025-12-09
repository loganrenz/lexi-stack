/**
 * Dictionary composable for word validation
 * Handles loading and querying the 370k+ word dictionary
 */

import { computed, ref } from 'vue'

let wordSet: Set<string> | null = null
let loadingPromise: Promise<Set<string>> | null = null
const fallbackUsed = ref(false)
const isLoading = ref(false)

async function cacheDictionary(response: Response) {
  try {
    if (typeof caches === 'undefined') return
    const cache = await caches.open('lexistack-dictionary')
    await cache.put('/words.txt', response.clone())
  } catch (err) {
    console.warn('Dictionary cache unavailable', err)
  }
}

async function loadDictionary(): Promise<Set<string>> {
  if (wordSet) return wordSet
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    isLoading.value = true
    try {
      let response = await fetch('/words.txt')
      if (!response.ok) {
        // try cache fallback
        if (typeof caches !== 'undefined') {
          const cache = await caches.open('lexistack-dictionary')
          const cached = await cache.match('/words.txt')
          if (cached) {
            response = cached
          }
        }
      }
      if (!response.ok) throw new Error('Failed to fetch dictionary')

      const text = await response.text()
      const words = text
        .split('\n')
        .map((w) => w.trim().toUpperCase())
        .filter((w) => {
          return (
            w.length >= 2 &&
            w.length <= 8 &&
            /^[A-Z]+$/.test(w) &&
            !w.includes("'") &&
            !w.includes('-')
          )
        })

      wordSet = new Set(words)
      fallbackUsed.value = false
      cacheDictionary(response).catch(console.warn)
      return wordSet
    } catch (error) {
      console.error('Failed to load dictionary, using fallback', error)
      fallbackUsed.value = true
      // Fallback to curated list
      wordSet = new Set([
        'ACE', 'ACT', 'ADD', 'AGE', 'AIR', 'ALL', 'ARC', 'ARM', 'ART', 'ASK', 'ATE',
        'BAD', 'BAG', 'BAN', 'BAR', 'BAT', 'BEE', 'BEG', 'BET', 'BOW', 'BOX', 'BUS',
        'CAB', 'CALM', 'CAN', 'CAP', 'CAR', 'CAT', 'CAW', 'COD', 'COT', 'COW', 'CUT',
        'DAB', 'DAD', 'DAM', 'DAN', 'DAY', 'DEN', 'DIG', 'DOT', 'DRY', 'DUE',
        'EACH', 'EAGER', 'EAGLE', 'EAR', 'EASE', 'EAST', 'ECHO', 'EDGE', 'EEL', 'ELM', 'EMU',
        'FAIR', 'FAME', 'FAN', 'FAR', 'FAST', 'FED', 'FELT', 'FIG', 'FIT', 'FLY', 'FOG', 'FUN',
        'GALA', 'GAP', 'GAS', 'GEL', 'GEM', 'GET', 'GIG', 'GIN', 'GO', 'GUM',
        'HARMONY', 'HAT', 'HAY', 'HEAT', 'HELP', 'HEN', 'HERO', 'HID', 'HILL', 'HIP', 'HOP', 'HUT',
        'ICE', 'ICON', 'IDEA', 'ILL', 'INK', 'INLET', 'IRON', 'ISLE',
        'JAZZ', 'JAW', 'JELLY', 'JET', 'JOB', 'JOY', 'JUG', 'JUMP',
        'KIN', 'KING', 'KITE', 'KIT', 'KNIT', 'KNOB', 'KNOT',
        'LACE', 'LAKE', 'LAP', 'LAW', 'LAY', 'LED', 'LEG', 'LID', 'LIE', 'LIP', 'LOG',
        'MAGIC', 'MAP', 'MARBLE', 'MAY', 'MEG', 'MELT', 'MET', 'METAL', 'METEOR', 'MOP',
        'NEST', 'NEON', 'NET', 'NEW', 'NIB', 'NOD', 'NORTH', 'NUT',
        'OAK', 'OAR', 'OAT', 'ODD', 'OFF', 'OIL', 'OLD', 'ONE', 'ORB', 'ORBIT',
        'PALM', 'PAN', 'PAUSE', 'PEAK', 'PEARL', 'PEB', 'PEEL', 'PEPPER', 'PHASE', 'PIN', 'PIT', 'POT',
        'QUARTZ', 'QUEEN', 'QUEST', 'QUIET', 'QUILL', 'QUILT',
        'RANCH', 'RANGE', 'RAPID', 'RAY', 'REACH', 'READ', 'REED', 'REEL', 'RIB', 'RIP', 'ROW', 'RUG',
        'SAGE', 'SAIL', 'SALT', 'SAND', 'SAT', 'SAW', 'SCARF', 'SCENE', 'SCOPE', 'SCOUT', 'SEE', 'SEW', 'SIP', 'SIT',
        'TALON', 'TAN', 'TAP', 'TAR', 'TASTE', 'TETHER', 'THEME', 'TIN', 'TIP', 'TOP', 'TUG',
        'UMBRA', 'UNION', 'UNITY', 'URBAN', 'URGE',
        'VAULT', 'VEIN', 'VELVET', 'VEST', 'VINE', 'VIOLET', 'VISION', 'VOW',
        'WAVE', 'WEAVE', 'WHISPER', 'WIDE', 'WIND', 'WING', 'WIN', 'WISP', 'WONDER',
        'XENON', 'XRAY', 'XYLOPHONE',
        'YARN', 'YEARN', 'YELL', 'YONDER',
        'ZANY', 'ZEAL', 'ZEN', 'ZEST', 'ZINC', 'ZONAL'
      ])
      return wordSet
    }
    finally {
      isLoading.value = false
    }
  })()

  return loadingPromise
}

export const useDictionary = () => {
  const isValidWord = async (word: string): Promise<boolean> => {
    const dictionary = await loadDictionary()
    return dictionary.has(word.toUpperCase())
  }

  const preload = () => {
    if (typeof window !== 'undefined' && !wordSet && !loadingPromise) {
      loadDictionary().catch(console.error)
    }
  }

  const isLoaded = computed(() => wordSet !== null)

  return {
    isValidWord,
    preload,
    isLoaded,
    isLoading: computed(() => isLoading.value),
    fallbackUsed: computed(() => fallbackUsed.value)
  }
}

