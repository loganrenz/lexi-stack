<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white">
    <div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            LexiStack
          </h1>
          <p class="text-sm sm:text-base text-slate-400 mt-1">A beautiful 3D word tower game</p>
        </div>
        <div class="text-right">
          <p class="text-xs uppercase tracking-[0.2em] text-emerald-300/80">Score</p>
          <p class="text-3xl sm:text-4xl font-bold">{{ score }}</p>
          <p class="text-[11px] sm:text-xs text-slate-400">Combo x{{ comboMultiplier.toFixed(1) }}</p>
        </div>
      </div>

      <!-- Game Canvas -->
      <div class="relative h-[70vh] min-h-[500px] sm:min-h-[600px] rounded-2xl border border-white/10 bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden shadow-2xl">
        <div ref="container" class="h-full w-full touch-none"></div>

        <!-- Info Toggle -->
        <button
          @click="showInfo = !showInfo"
          class="absolute top-3 left-3 z-20 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg border border-white/10 bg-black/50 backdrop-blur-md transition hover:bg-black/70 active:scale-95"
          aria-label="Toggle info"
        >
          <span class="text-lg sm:text-xl">{{ showInfo ? '×' : 'ℹ' }}</span>
        </button>

        <!-- Timer Info -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div v-show="showInfo" class="absolute top-3 left-3 z-10 bg-black/60 border border-white/10 rounded-lg px-3 py-2 backdrop-blur-md sm:px-4 sm:py-3 shadow-xl">
            <div class="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-gray-300">Next row</div>
            <div class="w-36 sm:w-48 h-2.5 bg-white/10 rounded-full overflow-hidden mt-2">
              <div class="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-200" :style="{ width: `${timerPercent}%` }"></div>
            </div>
            <div class="text-[10px] sm:text-[11px] text-gray-400 mt-2">Interval: {{ rowInterval.toFixed(1) }}s</div>
          </div>
        </Transition>

        <!-- Danger Line Info -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div v-show="showInfo" class="absolute top-3 right-3 z-10 bg-black/60 border border-white/10 rounded-lg px-3 py-2 backdrop-blur-md text-right sm:px-4 sm:py-3 shadow-xl">
            <div class="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-amber-300">Danger line</div>
            <div class="text-[10px] sm:text-xs text-gray-200 mt-1 hidden sm:block">Keep the tower below the rim</div>
          </div>
        </Transition>

        <!-- Word Input Panel -->
        <div class="absolute inset-x-3 bottom-3 z-10 rounded-xl border border-white/10 bg-black/70 backdrop-blur-md p-3 shadow-xl sm:p-4">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="flex items-center gap-2 text-sm sm:text-base">
              <span class="text-[10px] sm:text-xs uppercase tracking-[0.15em] text-slate-300">Word</span>
              <div class="flex flex-wrap gap-1.5 min-h-[32px] items-center">
                <TransitionGroup name="letter" tag="div" class="flex flex-wrap gap-1.5">
                  <span
                    v-for="(tile, index) in selectedTiles"
                    :key="`${tile.row}-${tile.col}-${index}`"
                    class="px-2.5 py-1.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 font-semibold text-sm sm:text-base shadow-lg"
                  >
                    {{ tile.letter }}
                  </span>
                </TransitionGroup>
                <span v-if="!selectedTiles.length" class="text-xs sm:text-sm text-slate-400 italic">Tap connected letters</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="submitWord"
                :disabled="!selectedTiles.length || isGameOver || isSubmitting"
                class="flex-1 sm:flex-none px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-sm sm:text-base shadow-lg transition hover:from-emerald-600 hover:to-cyan-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 min-h-[44px] sm:min-h-[48px]"
              >
                Submit
              </button>
              <button
                @click="clearSelection"
                :disabled="!selectedTiles.length"
                class="px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg border border-white/20 bg-white/5 text-white font-semibold text-sm sm:text-base transition hover:bg-white/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 min-h-[44px] sm:min-h-[48px]"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <!-- Game Over Overlay -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div v-if="isGameOver" class="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-30">
            <div class="bg-slate-900/95 border border-white/10 rounded-2xl p-6 sm:p-8 max-w-sm w-full mx-4 text-center space-y-4 shadow-2xl">
              <h3 class="text-2xl sm:text-3xl font-bold text-white">Game Over</h3>
              <div class="space-y-2">
                <p class="text-gray-300">Final Score</p>
                <p class="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{{ score.toLocaleString() }}</p>
                <p class="text-sm text-slate-400 mt-2">Best Combo: x{{ bestCombo.toFixed(1) }}</p>
              </div>
              <button
                @click="resetGame"
                class="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold shadow-lg transition hover:from-emerald-600 hover:to-cyan-600 active:scale-95"
              >
                Play Again
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Instructions -->
      <details class="rounded-xl border border-white/10 bg-slate-900/50 p-4 sm:p-6 text-sm sm:text-base text-slate-200 backdrop-blur-sm">
        <summary class="cursor-pointer text-xs sm:text-sm uppercase tracking-[0.15em] text-slate-300 font-semibold select-none">
          How to Play
        </summary>
        <div class="mt-4 space-y-3 text-slate-300">
          <p>Connect adjacent letters (including diagonals) to form valid words. Submit words to clear tiles and score points.</p>
          <p class="text-slate-400">Each cleared word adds time to the timer and increases your combo multiplier. Longer words give bigger bonuses!</p>
          <ul class="list-disc list-inside space-y-1.5 text-slate-400 ml-2">
            <li>Tap or click letters to build your word</li>
            <li>Letters must be adjacent (including diagonals)</li>
            <li>Watch the timer bar - cleared words add time</li>
            <li>Longer words boost your combo multiplier</li>
            <li>Keep the tower below the danger line!</li>
          </ul>
        </div>
      </details>

      <!-- Status Message -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div v-if="statusMessage" class="text-center">
          <p class="text-sm sm:text-base text-emerald-300 font-medium">{{ statusMessage }}</p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, nextTick, markRaw } from 'vue'
import * as THREE from 'three'
import { isAdjacentPosition, scoreWord } from '@/utils/gameLogic'
import { isValidWord } from '@/utils/dictionary'

interface TileData {
  letter: string
  mesh: THREE.Mesh
  row: number
  col: number
  targetY: number
  removing: boolean
  removeTimer: number
  flashTimer: number
  particleSystem?: THREE.Points
}

const GRID_COLS = 8
const GRID_ROWS_VISIBLE = 10
const TILE_SIZE = 0.9
const TILE_GAP = 0.14
const INITIAL_ROWS = 5
const START_INTERVAL = 7
const MIN_INTERVAL = 3
const INTERVAL_DECREASE = 0.05
const TIMER_REWARD = 1.1

const LETTER_POOL: Array<{ letter: string; weight: number }> = [
  { letter: 'E', weight: 12 },
  { letter: 'A', weight: 9 },
  { letter: 'I', weight: 9 },
  { letter: 'O', weight: 8 },
  { letter: 'N', weight: 6 },
  { letter: 'R', weight: 6 },
  { letter: 'T', weight: 6 },
  { letter: 'L', weight: 4 },
  { letter: 'S', weight: 4 },
  { letter: 'U', weight: 4 },
  { letter: 'D', weight: 4 },
  { letter: 'G', weight: 3 },
  { letter: 'B', weight: 2 },
  { letter: 'C', weight: 2 },
  { letter: 'M', weight: 2 },
  { letter: 'P', weight: 2 },
  { letter: 'F', weight: 2 },
  { letter: 'H', weight: 2 },
  { letter: 'V', weight: 2 },
  { letter: 'W', weight: 2 },
  { letter: 'Y', weight: 2 },
  { letter: 'K', weight: 1 },
  { letter: 'J', weight: 1 },
  { letter: 'X', weight: 1 },
  { letter: 'Q', weight: 1 },
  { letter: 'Z', weight: 1 }
]

const container = ref<HTMLDivElement | null>(null)
let scene: THREE.Scene | null = null
let camera: THREE.OrthographicCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
const raycaster = markRaw(new THREE.Raycaster())
const pointer = markRaw(new THREE.Vector2())
const clock = markRaw(new THREE.Clock())
let animationId: number | null = null
let particleSystems: THREE.Points[] = []

const showInfo = ref(false)
const grid = ref<Array<Array<TileData | null>>>([])
const selectedTiles = ref<TileData[]>([])
const score = ref(0)
const comboMultiplier = ref(1)
const bestCombo = ref(1)
const rowInterval = ref(START_INTERVAL)
const timeUntilNextRow = ref(rowInterval.value)
const isGameOver = ref(false)
const statusMessage = ref('')
const isSubmitting = ref(false)

const boardWidth = GRID_COLS * (TILE_SIZE + TILE_GAP) - TILE_GAP
const boardHeight = GRID_ROWS_VISIBLE * (TILE_SIZE + TILE_GAP) - TILE_GAP
const boardOriginY = -boardHeight / 2

const timerPercent = computed(() => Math.max(0, Math.min(100, (timeUntilNextRow.value / rowInterval.value) * 100)))
const currentWord = computed(() => selectedTiles.value.map((tile) => tile.letter).join(''))

const tileMeshes = () => {
  return grid.value.flatMap((row) => row.filter((tile): tile is TileData => !!tile).map((tile) => tile.mesh))
}

const getTileY = (row: number) => boardOriginY + row * (TILE_SIZE + TILE_GAP)
const getTileX = (col: number) => (col - (GRID_COLS - 1) / 2) * (TILE_SIZE + TILE_GAP)

const resetMaterials = (tile: TileData) => {
  const material = tile.mesh.material as THREE.MeshStandardMaterial
  material.color.set('#cbd5f5')
  material.emissive.set('#0ea5e9')
  material.emissiveIntensity = 0.3
  material.opacity = 1
}

const createLetterTexture = (letter: string, background = '#0f172a', textColor = '#e5e7eb') => {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  
  // Background with subtle gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, background)
  gradient.addColorStop(1, '#1a1f3a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  
  // Letter with better typography
  ctx.fillStyle = textColor
  ctx.font = 'bold 140px Inter, -apple-system, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(letter, size / 2, size / 2)
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

const createParticleSystem = (position: THREE.Vector3, color: THREE.Color): THREE.Points => {
  const particleCount = 30
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const velocities = new Float32Array(particleCount * 3)
  const lifetimes = new Float32Array(particleCount)
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    positions[i3] = position.x + (Math.random() - 0.5) * 0.5
    positions[i3 + 1] = position.y + (Math.random() - 0.5) * 0.5
    positions[i3 + 2] = position.z + (Math.random() - 0.5) * 0.5
    
    velocities[i3] = (Math.random() - 0.5) * 2
    velocities[i3 + 1] = Math.random() * 2 + 0.5
    velocities[i3 + 2] = (Math.random() - 0.5) * 2
    
    lifetimes[i] = 1.0
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
  geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1))
  
  const material = new THREE.PointsMaterial({
    color: color,
    size: 0.15,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending
  })
  
  const points = new THREE.Points(geometry, material)
  points.userData = { velocities, lifetimes, maxLifetime: 1.0 }
  return points
}

const createTile = (letter: string, row: number, col: number, startY?: number): TileData => {
  const geometry = new THREE.BoxGeometry(TILE_SIZE, TILE_SIZE, TILE_SIZE * 0.5)
  const texture = createLetterTexture(letter)
  const material = new THREE.MeshStandardMaterial({
    color: '#cbd5f5',
    emissive: '#0ea5e9',
    emissiveIntensity: 0.3,
    metalness: 0.2,
    roughness: 0.4,
    map: texture ?? undefined,
    transparent: true
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(getTileX(col), startY ?? getTileY(row), 0)
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.userData = { row, col }
  return { letter, mesh, row, col, targetY: getTileY(row), removing: false, removeTimer: 0.4, flashTimer: 0 }
}

const getRandomLetter = () => {
  const totalWeight = LETTER_POOL.reduce((sum, entry) => sum + entry.weight, 0)
  const roll = Math.random() * totalWeight
  let cumulative = 0
  for (const entry of LETTER_POOL) {
    cumulative += entry.weight
    if (roll <= cumulative) return entry.letter
  }
  return 'E'
}

const initScene = () => {
  if (!container.value) return
  scene = markRaw(new THREE.Scene())
  scene.background = new THREE.Color('#0a0f1a')

  const width = container.value.clientWidth
  const height = container.value.clientHeight
  const halfW = boardWidth / 1.3
  const halfH = boardHeight / 1.3
  camera = markRaw(new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.1, 100))
  camera.position.set(0, boardHeight / 3, 15)
  camera.lookAt(0, boardHeight / 3, 0)

  renderer = markRaw(new THREE.WebGLRenderer({ antialias: true, alpha: false }))
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  container.value.appendChild(renderer.domElement)

  // Enhanced lighting
  const ambient = new THREE.AmbientLight('#ffffff', 0.5)
  scene.add(ambient)

  const dir1 = new THREE.DirectionalLight('#87d1ff', 0.9)
  dir1.position.set(4, 8, 6)
  dir1.castShadow = true
  dir1.shadow.mapSize.width = 1024
  dir1.shadow.mapSize.height = 1024
  dir1.shadow.camera.near = 0.5
  dir1.shadow.camera.far = 50
  scene.add(dir1)

  const dir2 = new THREE.DirectionalLight('#ffd787', 0.3)
  dir2.position.set(-4, 4, -6)
  scene.add(dir2)

  // Enhanced background plane
  const planeGeo = new THREE.PlaneGeometry(boardWidth * 1.2, boardHeight * 1.4)
  const planeMat = new THREE.MeshStandardMaterial({
    color: '#0f172a',
    metalness: 0.1,
    roughness: 0.8,
    transparent: true,
    opacity: 0.85
  })
  const base = new THREE.Mesh(planeGeo, planeMat)
  base.position.set(0, boardOriginY + boardHeight / 2, -1)
  base.receiveShadow = true
  scene.add(base)
}

const spawnInitialRows = () => {
  if (!scene) return
  grid.value = Array.from({ length: GRID_ROWS_VISIBLE }, () => Array.from({ length: GRID_COLS }, () => null))
  for (let r = 0; r < INITIAL_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const letter = getRandomLetter()
      const tile = createTile(letter, r, c)
      grid.value[r][c] = tile
      scene.add(tile.mesh)
    }
  }
}

const addNewRow = () => {
  if (isGameOver.value) return
  if (grid.value[GRID_ROWS_VISIBLE - 1].some((tile) => tile)) {
    triggerGameOver()
    return
  }

  for (let row = GRID_ROWS_VISIBLE - 1; row >= 1; row--) {
    for (let col = 0; col < GRID_COLS; col++) {
      const tile = grid.value[row - 1][col]
      grid.value[row][col] = tile
      if (tile) {
        tile.row = row
        tile.targetY = getTileY(row)
        tile.mesh.userData.row = row
      }
    }
  }

  for (let col = 0; col < GRID_COLS; col++) {
    const letter = getRandomLetter()
    const tile = createTile(letter, 0, col, boardOriginY - TILE_SIZE * 2)
    grid.value[0][col] = tile
    if (scene) scene.add(tile.mesh)
  }

  rowInterval.value = Math.max(MIN_INTERVAL, rowInterval.value - INTERVAL_DECREASE)
  timeUntilNextRow.value = rowInterval.value
}

const handlePointerDown = (event: PointerEvent) => {
  if (!renderer || !camera || !scene || isGameOver.value) return
  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)

  const intersects = raycaster.intersectObjects(tileMeshes())
  if (intersects.length) {
    const mesh = intersects[0].object as THREE.Mesh
    const tile = findTileByMesh(mesh)
    if (tile) {
      toggleTileSelection(tile)
    }
  }
}

const findTileByMesh = (mesh: THREE.Object3D): TileData | null => {
  for (const row of grid.value) {
    for (const tile of row) {
      if (tile && tile.mesh === mesh) return tile
    }
  }
  return null
}

const toggleTileSelection = (tile: TileData) => {
  if (tile.removing) return
  const index = selectedTiles.value.findIndex((t) => t.row === tile.row && t.col === tile.col)
  if (index !== -1) {
    selectedTiles.value.splice(index, 1)
    resetMaterials(tile)
    tile.mesh.scale.setScalar(1)
    return
  }

  const last = selectedTiles.value[selectedTiles.value.length - 1]
  if (last && !isAdjacentPosition(last, tile)) {
    statusMessage.value = 'Tiles must be adjacent'
    setTimeout(() => { statusMessage.value = '' }, 2000)
    flashTiles([tile])
    return
  }

  selectedTiles.value.push(tile)
  const material = tile.mesh.material as THREE.MeshStandardMaterial
  material.color.set('#67e8f9')
  material.emissive.set('#22d3ee')
  material.emissiveIntensity = 0.8
  tile.mesh.scale.setScalar(1.1)
  statusMessage.value = ''
}

const flashTiles = (tiles: TileData[]) => {
  for (const tile of tiles) {
    tile.flashTimer = 0.3
  }
}

const clearSelection = () => {
  selectedTiles.value.forEach((tile) => {
    resetMaterials(tile)
    tile.mesh.scale.setScalar(1)
  })
  selectedTiles.value = []
}

const submitWord = async () => {
  if (!selectedTiles.value.length || isGameOver.value || isSubmitting.value) return
  const word = currentWord.value.toUpperCase()
  if (word.length < 2) {
    statusMessage.value = 'Select at least two letters'
    setTimeout(() => { statusMessage.value = '' }, 2000)
    flashTiles(selectedTiles.value)
    clearSelection()
    return
  }

  isSubmitting.value = true
  const valid = await isValidWord(word)
  isSubmitting.value = false

  if (!valid) {
    statusMessage.value = `${word} is not a valid word`
    comboMultiplier.value = 1
    flashTiles(selectedTiles.value)
    clearSelection()
    return
  }

  const letters = selectedTiles.value.map((tile) => tile.letter)
  const total = scoreWord(letters, comboMultiplier.value)
  score.value += total
  comboMultiplier.value = Math.min(5, comboMultiplier.value + 0.1)
  bestCombo.value = Math.max(bestCombo.value, comboMultiplier.value)
  statusMessage.value = `Cleared ${word}! +${total} points`
  setTimeout(() => { statusMessage.value = '' }, 3000)

  // Create particle effects for cleared tiles
  for (const tile of selectedTiles.value) {
    const particleColor = new THREE.Color(0x22d3ee)
    const particles = createParticleSystem(tile.mesh.position.clone(), particleColor)
    scene?.add(particles)
    particleSystems.push(particles)
  }

  for (const tile of selectedTiles.value) {
    tile.removing = true
    tile.removeTimer = 0.4
  }

  clearSelection()
  applyGravityAfterDelay()
  timeUntilNextRow.value = Math.min(rowInterval.value, timeUntilNextRow.value + TIMER_REWARD)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    submitWord()
  } else if (event.key === 'Escape') {
    clearSelection()
  }
}

const applyGravityAfterDelay = () => {
  setTimeout(() => {
    for (let col = 0; col < GRID_COLS; col++) {
      let writeRow = 0
      for (let row = 0; row < GRID_ROWS_VISIBLE; row++) {
        const tile = grid.value[row][col]
        if (tile && !tile.removing) {
          if (row !== writeRow) {
            grid.value[writeRow][col] = tile
            grid.value[row][col] = null
            tile.row = writeRow
            tile.targetY = getTileY(writeRow)
            tile.mesh.userData.row = writeRow
          }
          writeRow++
        }
      }
      for (let row = writeRow; row < GRID_ROWS_VISIBLE; row++) {
        if (!grid.value[row][col] || grid.value[row][col]?.removing) {
          grid.value[row][col] = null
        }
      }
    }
  }, 250)
}

const update = () => {
  const delta = clock.getDelta()
  if (!scene || !camera || !renderer) return

  if (!isGameOver.value) {
    timeUntilNextRow.value -= delta
    if (timeUntilNextRow.value <= 0) {
      addNewRow()
    }
  }

  // Update tiles
  for (const row of grid.value) {
    for (const tile of row) {
      if (!tile) continue
      tile.mesh.position.y += (tile.targetY - tile.mesh.position.y) * Math.min(12 * delta, 1)

      if (tile.removing) {
        tile.removeTimer -= delta
        const t = Math.max(tile.removeTimer, 0) / 0.4
        tile.mesh.scale.setScalar(1 + (1 - t) * 0.3)
        tile.mesh.rotation.z += delta * 5
        const material = tile.mesh.material as THREE.MeshStandardMaterial
        material.opacity = t
        if (tile.removeTimer <= 0) {
          scene?.remove(tile.mesh)
          const indexRow = tile.row
          const indexCol = tile.col
          if (grid.value[indexRow][indexCol] === tile) {
            grid.value[indexRow][indexCol] = null
          } else {
            for (let r = 0; r < GRID_ROWS_VISIBLE; r++) {
              for (let c = 0; c < GRID_COLS; c++) {
                if (grid.value[r][c] === tile) grid.value[r][c] = null
              }
            }
          }
          tile.mesh.geometry.dispose()
          if (material.map) material.map.dispose()
          material.dispose()
        }
      }

      if (tile.flashTimer > 0) {
        tile.flashTimer -= delta
        const material = tile.mesh.material as THREE.MeshStandardMaterial
        material.emissive.set('#f97316')
        material.emissiveIntensity = 0.8
        if (tile.flashTimer <= 0) {
          resetMaterials(tile)
          tile.mesh.scale.setScalar(1)
        }
      }
    }
  }

  // Update particle systems
  for (let i = particleSystems.length - 1; i >= 0; i--) {
    const particles = particleSystems[i]
    const geometry = particles.geometry
    const positions = geometry.attributes.position.array as Float32Array
    const velocities = geometry.attributes.velocity.array as Float32Array
    const lifetimes = geometry.attributes.lifetime.array as Float32Array
    const material = particles.material as THREE.PointsMaterial

    let alive = false
    for (let j = 0; j < positions.length / 3; j++) {
      const j3 = j * 3
      if (lifetimes[j] > 0) {
        lifetimes[j] -= delta * 2
        positions[j3] += velocities[j3] * delta
        positions[j3 + 1] += velocities[j3 + 1] * delta
        positions[j3 + 2] += velocities[j3 + 2] * delta
        if (lifetimes[j] > 0) alive = true
      }
    }

    material.opacity = Math.max(0, Math.min(1, lifetimes[0]))
    geometry.attributes.position.needsUpdate = true
    geometry.attributes.lifetime.needsUpdate = true

    if (!alive) {
      scene?.remove(particles)
      geometry.dispose()
      material.dispose()
      particleSystems.splice(i, 1)
    }
  }

  renderer.render(scene, camera)
  animationId = requestAnimationFrame(update)
}

const resetGame = () => {
  statusMessage.value = ''
  selectedTiles.value = []
  score.value = 0
  comboMultiplier.value = 1
  bestCombo.value = 1
  rowInterval.value = START_INTERVAL
  timeUntilNextRow.value = rowInterval.value
  isGameOver.value = false

  // Clean up particle systems
  for (const particles of particleSystems) {
    scene?.remove(particles)
    particles.geometry.dispose()
    ;(particles.material as THREE.Material).dispose()
  }
  particleSystems = []

  if (scene) {
    const removals = tileMeshes()
    for (const mesh of removals) {
      scene.remove(mesh)
      if (mesh.geometry) mesh.geometry.dispose()
      if (mesh.material && mesh.material instanceof THREE.Material) {
        if (mesh.material.map) mesh.material.map.dispose()
        mesh.material.dispose()
      }
    }
  }

  spawnInitialRows()
}

const triggerGameOver = () => {
  isGameOver.value = true
  statusMessage.value = 'The stack reached the danger line'
}

const handleResize = () => {
  if (!container.value || !camera || !renderer) return
  const width = container.value.clientWidth
  const height = container.value.clientHeight
  const halfW = boardWidth / 1.3
  const halfH = boardHeight / 1.3
  camera.left = -halfW
  camera.right = halfW
  camera.top = halfH
  camera.bottom = -halfH
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

onMounted(async () => {
  await nextTick()
  if (!container.value) return
  
  initScene()
  spawnInitialRows()

  if (renderer) {
    renderer.domElement.addEventListener('pointerdown', handlePointerDown)
    renderer.domElement.addEventListener('touchstart', handlePointerDown as any, { passive: true })
  }
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)

  clock.start()
  update()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  if (renderer) {
    renderer.domElement.removeEventListener('pointerdown', handlePointerDown)
    renderer.domElement.removeEventListener('touchstart', handlePointerDown as any)
  }
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)

  // Clean up particle systems
  for (const particles of particleSystems) {
    scene?.remove(particles)
    particles.geometry.dispose()
    ;(particles.material as THREE.Material).dispose()
  }
  particleSystems = []

  if (scene) {
    const meshes = tileMeshes()
    for (const mesh of meshes) {
      scene.remove(mesh)
      mesh.geometry.dispose()
      if (mesh.material && mesh.material instanceof THREE.Material) {
        if (mesh.material.map) mesh.material.map.dispose()
        mesh.material.dispose()
      }
    }
  }

  if (renderer) {
    if (container.value && renderer.domElement.parentNode) {
      container.value.removeChild(renderer.domElement)
    }
    renderer.dispose()
    renderer = null
  }
  
  scene = null
  camera = null
})
</script>

<style scoped>
.letter-enter-active,
.letter-leave-active {
  transition: all 0.2s ease;
}

.letter-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-10px);
}

.letter-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>

