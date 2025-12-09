<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white">
    <div class="mx-auto max-w-6xl px-4 py-4 sm:px-6">
      <!-- Top Bar -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div class="flex items-center gap-4">
          <UButton
            variant="ghost"
            icon="i-heroicons-arrow-left"
            @click="goHome"
            class="text-slate-300"
          >
            Home
          </UButton>
          <div>
            <h1 class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              LexiStack
            </h1>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-4 sm:gap-6">
          <div class="text-right">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Score</p>
            <p class="text-2xl sm:text-3xl font-bold">{{ score.toLocaleString() }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Combo</p>
            <p class="text-2xl sm:text-3xl font-bold text-emerald-400">x{{ comboMultiplier.toFixed(1) }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Time</p>
            <p class="text-2xl sm:text-3xl font-bold" :class="timeRemaining < 10 ? 'text-red-400' : 'text-cyan-400'">
              {{ Math.ceil(timeRemaining) }}s
            </p>
          </div>
          <div class="text-right">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Level</p>
            <p class="text-2xl sm:text-3xl font-bold text-blue-400">{{ level }}</p>
          </div>
        </div>
      </div>

      <!-- Game Canvas -->
      <div class="relative h-[60vh] min-h-[400px] sm:min-h-[500px] rounded-2xl border border-white/10 bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden shadow-2xl mb-4">
        <canvas ref="canvasRef" class="h-full w-full touch-none"></canvas>

        <!-- Timer Bar -->
        <div class="absolute top-3 left-3 right-3 z-10">
          <div class="bg-black/60 border border-white/10 rounded-lg px-3 py-2 backdrop-blur-md">
            <div class="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-gray-300 mb-2">
              Next Row
            </div>
            <div class="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-200"
                :style="{ width: `${rowTimerPercent}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Danger Line Indicator -->
        <div class="absolute top-16 left-3 z-10 bg-black/60 border border-white/10 rounded-lg px-3 py-2 backdrop-blur-md">
          <div class="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-amber-300">
            Danger Line
          </div>
        </div>

        <!-- Game Over Overlay -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
        >
          <div v-if="isGameOver" class="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-30">
            <UCard class="max-w-sm w-full mx-4">
              <template #header>
                <h3 class="text-2xl sm:text-3xl font-bold text-center">Game Over</h3>
              </template>
              <div class="space-y-4 text-center">
                <div>
                  <p class="text-gray-300 mb-2">Final Score</p>
                  <p class="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    {{ score.toLocaleString() }}
                  </p>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-slate-400">Best Combo</p>
                    <p class="font-semibold text-emerald-400">x{{ bestCombo.toFixed(1) }}</p>
                  </div>
                  <div>
                    <p class="text-slate-400">Longest Word</p>
                    <p class="font-semibold text-cyan-400">{{ longestWord || 'N/A' }}</p>
                  </div>
                </div>
              </div>
              <template #footer>
                <div class="flex gap-2">
                  <UButton variant="ghost" @click="goHome" class="flex-1">Home</UButton>
                  <UButton color="emerald" @click="restartGame" class="flex-1">Play Again</UButton>
                </div>
              </template>
            </UCard>
          </div>
        </Transition>
      </div>

      <!-- Word Input Panel -->
      <UCard class="bg-slate-900/70 border-white/10 backdrop-blur-md">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-3 flex-1">
            <span class="text-xs uppercase tracking-[0.15em] text-slate-300 whitespace-nowrap">Word:</span>
            <div class="flex flex-wrap gap-2 min-h-[40px] items-center">
              <TransitionGroup name="letter" tag="div" class="flex flex-wrap gap-2">
                <span
                  v-for="(tile, index) in selectedTiles"
                  :key="`${tile.position.row}-${tile.position.col}-${index}`"
                  class="px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 font-semibold text-lg shadow-lg"
                >
                  {{ tile.letter }}
                </span>
              </TransitionGroup>
              <span v-if="!selectedTiles.length" class="text-sm text-slate-400 italic">
                Tap connected letters to build a word
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UButton
              variant="ghost"
              icon="i-heroicons-x-mark"
              :disabled="!selectedTiles.length"
              @click="clearSelection"
              class="min-h-[48px]"
            >
              Clear
            </UButton>
            <UButton
              color="emerald"
              icon="i-heroicons-check"
              :disabled="!selectedTiles.length || isGameOver || isSubmitting"
              :loading="isSubmitting"
              @click="handleSubmit"
              class="min-h-[48px] px-6"
            >
              Submit
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Status Message -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div v-if="statusMessage" class="mt-4 text-center">
          <p class="text-sm sm:text-base font-medium" :class="statusMessageType === 'error' ? 'text-red-400' : 'text-emerald-300'">
            {{ statusMessage }}
          </p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  ssr: false
})

import { onMounted, onBeforeUnmount, ref, computed, nextTick, watch } from 'vue'
import { useGameState } from '~/composables/useGameState'
import { useDictionary } from '~/composables/useDictionary'
import { useThreeTowerScene } from '~/composables/useThreeTowerScene'

const router = useRouter()
const { isValidWord, preload } = useDictionary()
const gameState = useGameState()

const {
  grid,
  selectedTiles,
  score,
  comboMultiplier,
  bestCombo,
  timeRemaining,
  level,
  isGameOver,
  longestWord,
  currentWord,
  GRID_COLS,
  GRID_ROWS_VISIBLE,
  toggleTile,
  clearSelection,
  submitWord: submitGameWord,
  addNewRow,
  updateTimer,
  reset: resetGame
} = gameState

const canvasRef = ref<HTMLCanvasElement | null>(null)
const scene = useThreeTowerScene(canvasRef, {
  gridCols: GRID_COLS,
  gridRows: GRID_ROWS_VISIBLE
})

const isSubmitting = ref(false)
const statusMessage = ref('')
const statusMessageType = ref<'success' | 'error'>('success')
const rowTimer = ref(7) // Time until next row
const rowTimerInterval = ref(7)

// Computed
const rowTimerPercent = computed(() => Math.max(0, Math.min(100, (rowTimer.value / rowTimerInterval.value) * 100)))

// Game loop
let gameLoopId: number | null = null
let lastTime = 0

const gameLoop = (currentTime: number) => {
  if (!lastTime) lastTime = currentTime
  const delta = (currentTime - lastTime) / 1000
  lastTime = currentTime

  if (!isGameOver.value) {
    updateTimer(delta)
    
    // Row timer
    rowTimer.value -= delta
    if (rowTimer.value <= 0) {
      const success = addNewRow()
      if (!success) {
        // Game over - tower reached top
      }
      rowTimerInterval.value = Math.max(3, rowTimerInterval.value - 0.05)
      rowTimer.value = rowTimerInterval.value
    }

    // Update scene with grid changes
    updateScene()
  }

    gameLoopId = requestAnimationFrame(gameLoop)
  }

// Update Three.js scene from grid state
const updateScene = () => {
    for (let row = 0; row < GRID_ROWS_VISIBLE; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const letter = grid.value[row][col]
        if (letter) {
          scene.updateTile(letter, row, col)
        }
      }
    }

    // Highlight selected tiles
    const positions = selectedTiles.value.map(t => t.position)
    scene.highlightTiles(positions)
  }

// Handle tile click
const handleTileClick = (event: MouseEvent | TouchEvent) => {
  if (isGameOver.value) return

  const x = 'touches' in event ? event.touches[0].clientX : event.clientX
  const y = 'touches' in event ? event.touches[0].clientY : event.clientY

  const position = scene.getTileFromScreen(x, y)
  if (!position) return

  const result = toggleTile(position)
  if (!result.success && result.message) {
    showStatus(result.message, 'error')
    scene.flashTiles([position])
  } else {
    updateScene()
  }
}

// Handle word submission
const handleSubmit = async () => {
  if (isSubmitting.value || !selectedTiles.value.length) return

  isSubmitting.value = true
  const result = await submitGameWord(isValidWord)
  isSubmitting.value = false

  if (result.success) {
    showStatus(result.message, 'success')
    // Animate cleared tiles
    for (const pos of result.clearedTiles) {
      scene.removeTile(pos.row, pos.col)
    }
    // Wait a bit for gravity animation, then update
    setTimeout(() => {
      updateScene()
    }, 200)
  } else {
    showStatus(result.message, 'error')
    scene.flashTiles(selectedTiles.value.map(t => t.position))
  }
}

// Show status message
const showStatus = (message: string, type: 'success' | 'error' = 'success') => {
  statusMessage.value = message
  statusMessageType.value = type
  setTimeout(() => {
    statusMessage.value = ''
  }, type === 'error' ? 2000 : 3000)
}

// Restart game
const restartGame = () => {
  resetGame()
  rowTimer.value = 7
  rowTimerInterval.value = 7
  lastTime = 0
  scene.dispose()
  nextTick(() => {
    scene.init()
    updateScene()
  })
}

// Navigation
const goHome = () => {
  scene.dispose()
  router.push('/')
}

// Save high score
const saveHighScore = () => {
  if (typeof window === 'undefined') return

  const highScores: Array<{ score: number; date: string; longestWord: string; bestCombo: number }> = JSON.parse(
    localStorage.getItem('lexistack-highscores') || '[]'
  )

  highScores.push({
    score: score.value,
    date: new Date().toISOString(),
    longestWord: longestWord.value,
    bestCombo: bestCombo.value
  })

  highScores.sort((a, b) => b.score - a.score)
  highScores.splice(10) // Keep top 10

  localStorage.setItem('lexistack-highscores', JSON.stringify(highScores))
}

// Watch for game over
watch(isGameOver, (over) => {
  if (over) {
    saveHighScore()
  }
})

// Setup
onMounted(async () => {
  await nextTick()
  if (!canvasRef.value) return

  // Preload dictionary
  preload()

  // Initialize scene
  scene.init()

  // Setup event listeners
  canvasRef.value.addEventListener('pointerdown', handleTileClick)
  canvasRef.value.addEventListener('touchstart', handleTileClick, { passive: true })
  window.addEventListener('resize', scene.handleResize)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      clearSelection()
      updateScene()
    }
  })

  // Initial scene update
  updateScene()

  // Start game loop
  lastTime = performance.now()
  gameLoopId = requestAnimationFrame(gameLoop)
})

onBeforeUnmount(() => {
  if (gameLoopId) {
    cancelAnimationFrame(gameLoopId)
  }
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('pointerdown', handleTileClick)
    canvasRef.value.removeEventListener('touchstart', handleTileClick)
  }
  window.removeEventListener('resize', scene.handleResize)
  scene.dispose()
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

