// Dictionary module - loads and filters words from the word list
// Filters for common game-appropriate words (2-8 letters, uppercase)

let wordSet: Set<string> | null = null

async function loadDictionary(): Promise<Set<string>> {
  if (wordSet) return wordSet

  try {
    const response = await fetch('/words.txt')
    const text = await response.text()
    const words = text
      .split('\n')
      .map((w) => w.trim().toUpperCase())
      .filter((w) => {
        // Filter for game-appropriate words
        return (
          w.length >= 2 &&
          w.length <= 8 &&
          /^[A-Z]+$/.test(w) && // Only letters
          !w.includes("'") && // No apostrophes
          !w.includes('-') // No hyphens
        )
      })
    
    wordSet = new Set(words)
    return wordSet
  } catch (error) {
    console.error('Failed to load dictionary, using fallback', error)
    // Fallback to a smaller curated list if download fails
    wordSet = new Set([
      'APPLE', 'ANGLE', 'ACT', 'ARC', 'AREA', 'ART', 'ASK', 'AXIS', 'ABLE', 'ACID', 'ALERT', 'ALGAE',
      'BARN', 'BASIC', 'BATTLE', 'BREAD', 'BRAVE', 'BRIGHT', 'BREEZE', 'BRICK', 'BRISK', 'BROWN', 'BRAIN', 'BRANCH',
      'CALM', 'CANDY', 'CANAL', 'CART', 'CAST', 'CAVE', 'CHARM', 'CHART', 'CHASE', 'CHEER', 'CHEST', 'CHILL', 'CHIME', 'CHOIR',
      'CIDER', 'CIVIC', 'CLASH', 'CLAY', 'CLEAR', 'CLIFF', 'CLIMB', 'CLOUD', 'COAST', 'COBALT', 'COMET', 'COIN', 'COLD', 'CONE',
      'COPPER', 'CORAL', 'CRAFT', 'CRANE', 'CRASH', 'CRATE', 'CREST', 'CRISP', 'CROWN', 'CYCLE',
      'DANCE', 'DAWN', 'DREAM', 'DRIFT', 'DROPLET', 'DROOP', 'DUSK', 'DUST', 'DWELL', 'DAISY', 'DEPTH', 'DECK', 'DEEP',
      'EAGER', 'EAGLE', 'EARTH', 'ECHO', 'ELM', 'EMBER', 'EMBLEM', 'EMPTY', 'ENTER', 'EPOCH', 'EQUAL', 'ETHER', 'EVENT',
      'FAIR', 'FABLE', 'FIELD', 'FLAME', 'FLASH', 'FLARE', 'FLOAT', 'FLORA', 'FOAM', 'FOCUS', 'FORGE', 'FORCE', 'FROST', 'FRAME',
      'GLADE', 'GLASS', 'GLEAM', 'GLIDE', 'GLOW', 'GRACE', 'GRAND', 'GRASS', 'GRAVITY', 'GREEN', 'GRIT', 'GROVE',
      'HARBOR', 'HARMONY', 'HAZE', 'HEART', 'HELIX', 'HERO', 'HILL', 'HOLLOW', 'HONEY', 'HORIZON', 'HORN', 'HOVER',
      'ICICLE', 'ICON', 'IDEA', 'IMAGE', 'INLET', 'INPUT', 'IRON', 'ISLE', 'IVY', 'ITEM',
      'JAZZ', 'JADE', 'JELLY', 'JET', 'JOLT', 'JUMP', 'JUNGLE',
      'KIN', 'KING', 'KITE', 'KNACK', 'KNIT', 'KNOB', 'KNOT',
      'LACE', 'LAKE', 'LANTERN', 'LATCH', 'LAYER', 'LEAF', 'LENS', 'LEVEL', 'LIGHT', 'LILY', 'LINE', 'LINK', 'LOOP', 'LOFT', 'LUNAR',
      'MAGIC', 'MAPLE', 'MARBLE', 'MARCH', 'MARINA', 'MEADOW', 'METAL', 'METEOR', 'MICA', 'MIGHT', 'MINT', 'MIST', 'MOMENT', 'MORPH',
      'NEST', 'NEON', 'NEW', 'NIGHT', 'NOBLE', 'NOISE', 'NORTH', 'NOVA', 'NURSE',
      'OAK', 'OASIS', 'OBSIDIAN', 'OCEAN', 'OLIVE', 'OMEGA', 'ONYX', 'OPAL', 'ORBIT', 'ORCHID',
      'PALM', 'PANEL', 'PAUSE', 'PEAK', 'PEARL', 'PEBBLE', 'PEPPER', 'PHASE', 'PILOT', 'PINCH', 'PIXEL', 'PLANE', 'PLANT', 'PLATE', 'PLUME', 'POEM', 'POINT', 'POISE', 'POLAR', 'PRISM', 'PULSE',
      'QUARTZ', 'QUEEN', 'QUEST', 'QUIET', 'QUILL', 'QUILT',
      'RANCH', 'RANGE', 'RAPID', 'RAY', 'REACH', 'REACT', 'REED', 'REEL', 'RHYME', 'RICE', 'RIDGE', 'RIFT', 'RING', 'RIVER', 'ROAM', 'ROCK', 'ROOF', 'ROOT', 'ROSE', 'ROUND', 'ROUTE',
      'SAGE', 'SAIL', 'SALT', 'SAND', 'SCARF', 'SCENE', 'SCOPE', 'SCOUT', 'SCROLL', 'SEA', 'SHELL', 'SHIFT', 'SHINE', 'SHORE', 'SILK', 'SING', 'SKY', 'SLATE', 'SLICE', 'SMOKE', 'SNAP', 'SNOW', 'SOLAR', 'SONG', 'SOUND', 'SPARK', 'SPEAR', 'SPELL', 'SPICE', 'SPIRE', 'SPIRIT', 'SPORE', 'SPRING', 'STONE', 'STORM', 'STREAM', 'STRUM', 'SURGE', 'SWIRL',
      'TALON', 'TANGENT', 'TAR', 'TASTE', 'TETHER', 'THEME', 'THORN', 'THRIVE', 'THRUM', 'TIDE', 'TILT', 'TONE', 'TOWER', 'TRACE', 'TRACK', 'TREASURE', 'TREE', 'TRIAL', 'TRIBE', 'TRUNK', 'TWIG', 'TWIST',
      'UMBRA', 'UNION', 'UNITY', 'URBAN', 'URGE',
      'VAULT', 'VEIN', 'VELVET', 'VEST', 'VINE', 'VIOLET', 'VISION', 'VIVID', 'VOICE', 'VOID',
      'WAVE', 'WEAVE', 'WHISPER', 'WIDE', 'WIND', 'WING', 'WISP', 'WONDER', 'WOOD', 'WOOL', 'WORLD', 'WRAP',
      'XENON', 'XRAY', 'XYLOPHONE',
      'YARN', 'YEARN', 'YELL', 'YONDER',
      'ZANY', 'ZEAL', 'ZEN', 'ZEST', 'ZINC', 'ZONAL'
    ])
    return wordSet
  }
}

export async function isValidWord(word: string): Promise<boolean> {
  const dictionary = await loadDictionary()
  return dictionary.has(word.toUpperCase())
}

// Preload dictionary on module import for better performance
if (typeof window !== 'undefined') {
  loadDictionary().catch(console.error)
}

