/**
 * Dictionary composable for word validation
 * Handles loading and querying the 370k+ word dictionary
 */

import { computed } from 'vue'

let wordSet: Set<string> | null = null
let loadingPromise: Promise<Set<string>> | null = null

async function loadDictionary(): Promise<Set<string>> {
  if (wordSet) return wordSet
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    try {
      const response = await fetch('/words.txt')
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
      return wordSet
    } catch (error) {
      console.error('Failed to load dictionary, using fallback', error)
      // Fallback to curated list
      wordSet = new Set([
        'APPLE', 'ANGLE', 'ACT', 'ARC', 'AREA', 'ART', 'ASK', 'AXIS', 'ABLE', 'ACID',
        'BARN', 'BASIC', 'BATTLE', 'BREAD', 'BRAVE', 'BRIGHT', 'BREEZE', 'BRICK',
        'CALM', 'CANDY', 'CANAL', 'CART', 'CAST', 'CAVE', 'CHARM', 'CHART', 'CHASE',
        'DANCE', 'DAWN', 'DREAM', 'DRIFT', 'DROPLET', 'DUSK', 'DUST', 'DWELL',
        'EAGER', 'EAGLE', 'EARTH', 'ECHO', 'ELM', 'EMBER', 'EMPTY', 'ENTER',
        'FAIR', 'FABLE', 'FIELD', 'FLAME', 'FLASH', 'FLARE', 'FLOAT', 'FLORA',
        'GLADE', 'GLASS', 'GLEAM', 'GLIDE', 'GLOW', 'GRACE', 'GRAND', 'GRASS',
        'HARBOR', 'HARMONY', 'HAZE', 'HEART', 'HELIX', 'HERO', 'HILL', 'HOLLOW',
        'ICICLE', 'ICON', 'IDEA', 'IMAGE', 'INLET', 'INPUT', 'IRON', 'ISLE',
        'JAZZ', 'JADE', 'JELLY', 'JET', 'JOLT', 'JUMP', 'JUNGLE',
        'KIN', 'KING', 'KITE', 'KNACK', 'KNIT', 'KNOB', 'KNOT',
        'LACE', 'LAKE', 'LANTERN', 'LATCH', 'LAYER', 'LEAF', 'LENS', 'LEVEL', 'LIGHT',
        'MAGIC', 'MAPLE', 'MARBLE', 'MARCH', 'MARINA', 'MEADOW', 'METAL', 'METEOR',
        'NEST', 'NEON', 'NEW', 'NIGHT', 'NOBLE', 'NOISE', 'NORTH', 'NOVA',
        'OAK', 'OASIS', 'OCEAN', 'OLIVE', 'OMEGA', 'ONYX', 'OPAL', 'ORBIT',
        'PALM', 'PANEL', 'PAUSE', 'PEAK', 'PEARL', 'PEBBLE', 'PEPPER', 'PHASE',
        'QUARTZ', 'QUEEN', 'QUEST', 'QUIET', 'QUILL', 'QUILT',
        'RANCH', 'RANGE', 'RAPID', 'RAY', 'REACH', 'REACT', 'REED', 'REEL',
        'SAGE', 'SAIL', 'SALT', 'SAND', 'SCARF', 'SCENE', 'SCOPE', 'SCOUT',
        'TALON', 'TANGENT', 'TAR', 'TASTE', 'TETHER', 'THEME', 'THORN',
        'UMBRA', 'UNION', 'UNITY', 'URBAN', 'URGE',
        'VAULT', 'VEIN', 'VELVET', 'VEST', 'VINE', 'VIOLET', 'VISION',
        'WAVE', 'WEAVE', 'WHISPER', 'WIDE', 'WIND', 'WING', 'WISP', 'WONDER',
        'XENON', 'XRAY', 'XYLOPHONE',
        'YARN', 'YEARN', 'YELL', 'YONDER',
        'ZANY', 'ZEAL', 'ZEN', 'ZEST', 'ZINC', 'ZONAL'
      ])
      return wordSet
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
    isLoaded
  }
}

