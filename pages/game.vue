<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white">
    <div class="mx-auto max-w-6xl px-4 pb-28 pt-5 sm:px-6 sm:pt-6">
      <!-- Top Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-3">
        <div class="flex items-center gap-3">
          <UButton
            variant="ghost"
            icon="i-heroicons-arrow-left"
            @click="goHome"
            class="text-slate-300"
          >
            Home
          </UButton>
          <div class="leading-tight">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">3D Word Tower</p>
            <h1 class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              LexiStack
            </h1>
          </div>
        </div>
        <div class="flex items-center gap-2 sm:gap-3">
          <UButton icon="i-heroicons-question-mark-circle" variant="ghost" @click="openTutorial" class="text-slate-200">
            How to play
          </UButton>
          <UButton
            color="cyan"
            variant="ghost"
            :icon="isPaused ? 'i-heroicons-play' : 'i-heroicons-pause'"
            @click="togglePause"
            class="min-w-[96px]"
          >
            {{ isPaused ? 'Resume' : 'Pause' }}
          </UButton>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div class="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 shadow-lg">
          <p class="text-[11px] uppercase tracking-[0.18em] text-slate-300">Score</p>
          <p class="text-2xl sm:text-3xl font-bold">{{ score.toLocaleString() }}</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 shadow-lg">
          <p class="text-[11px] uppercase tracking-[0.18em] text-slate-300">Combo</p>
          <p class="text-2xl sm:text-3xl font-bold text-emerald-400">x{{ comboMultiplier.toFixed(1) }}</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 shadow-lg">
          <p class="text-[11px] uppercase tracking-[0.18em] text-slate-300">Time</p>
          <div class="flex items-baseline gap-2">
            <p class="text-2xl sm:text-3xl font-bold" :class="timeRemaining < 10 ? 'text-red-400' : 'text-cyan-400'">
              {{ Math.ceil(timeRemaining) }}s
            </p>
            <span class="text-xs text-slate-400">stay above danger</span>
          </div>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 shadow-lg">
          <p class="text-[11px] uppercase tracking-[0.18em] text-slate-300">Level</p>
          <p class="text-2xl sm:text-3xl font-bold text-blue-400">{{ level }}</p>
        </div>
      </div>

      <!-- Game Canvas -->
      <div class="relative h-[60vh] min-h-[400px] sm:min-h-[500px] rounded-2xl border border-white/10 bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden shadow-2xl mb-4">
        <canvas ref="canvasRef" class="h-full w-full touch-none" :class="{ 'pointer-events-none': isGameOver }"></canvas>

        <!-- Global Timer Bar -->
        <div class="absolute top-3 left-3 right-3 z-10 space-y-2">
          <div class="bg-black/70 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-md shadow-lg">
            <div class="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-gray-300">
              <span>Time Remaining</span>
              <span :class="timeRemaining < 10 ? 'text-red-300' : 'text-emerald-200'">{{ Math.ceil(timeRemaining) }}s</span>
            </div>
            <div class="w-full h-3 bg-white/10 rounded-full overflow-hidden mt-2">
              <div
                class="h-full transition-all duration-300"
                :class="timeBarClass"
                :style="{ width: `${timePercent}%` }"
              ></div>
            </div>
          </div>

          <div class="bg-black/60 border border-white/10 rounded-lg px-3 py-2 backdrop-blur-md">
            <div class="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-gray-300 mb-2 flex items-center justify-between">
              <span>Next Row</span>
              <span class="text-xs text-slate-200">{{ rowTimer.toFixed(1) }}s</span>
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
        <div class="absolute top-20 left-3 z-10 bg-black/60 border border-white/10 rounded-lg px-3 py-2 backdrop-blur-md">
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
      <UCard
        class="bg-slate-900/80 border-white/10 backdrop-blur-md shadow-2xl fixed bottom-3 left-4 right-4 sm:left-6 sm:right-6"
        style="padding-bottom: env(safe-area-inset-bottom)"
      >
        <div class="flex flex-col gap-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-300">
              <span class="i-heroicons-sparkles text-emerald-300"></span>
              Current Word
            </div>
            <div class="flex items-center gap-3 text-sm text-slate-200">
              <span class="text-emerald-300 font-semibold" v-if="potentialScore">Potential +{{ potentialScore }} pts</span>
              <span class="text-slate-400">{{ cursorLabel }}</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2" :class="{ 'word-shake': statusMessageType === 'error' && statusMessage }">
            <TransitionGroup name="letter" tag="div" class="flex flex-wrap gap-2 items-center">
              <template v-for="(tile, index) in selectedTiles" :key="`${tile.position.row}-${tile.position.col}-${index}`">
                <span
                  class="px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-100 font-semibold text-xl shadow-lg shadow-emerald-500/10"
                >
                  {{ tile.letter }}
                </span>
                <div v-if="index !== selectedTiles.length - 1" class="w-6 h-[2px] bg-emerald-400/40 rounded-full"></div>
              </template>
            </TransitionGroup>
            <span v-if="!selectedTiles.length" class="text-sm text-slate-400 italic">
              Tap connected letters to build a word
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <UButton
              variant="ghost"
              icon="i-heroicons-arrow-uturn-left"
              :disabled="!selectedTiles.length"
              @click="undoLastSelection"
              class="min-h-[48px]"
            >
              Undo
            </UButton>
            <UButton
              variant="ghost"
              icon="i-heroicons-x-mark"
              :disabled="!selectedTiles.length"
              @click="clearSelection"
              class="min-h-[48px]"
            >
              Clear
            </UButton>
            <UTooltip :text="submitTooltip" :open-delay="150">
              <UButton
                color="emerald"
                icon="i-heroicons-check"
                :disabled="!canSubmit || isGameOver || isSubmitting"
                :loading="isSubmitting"
                @click="handleSubmit"
                class="min-h-[48px] px-6 flex-1 sm:flex-none"
              >
                Submit word
              </UButton>
            </UTooltip>
          </div>

          <div class="flex flex-wrap items-center gap-3 text-sm">
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-2"
            >
              <p
                v-if="statusMessage"
                class="font-semibold"
                :class="statusMessageType === 'error' ? 'text-red-400' : 'text-emerald-300'"
              >
                {{ statusMessage }}
              </p>
            </Transition>
            <div v-if="isDictionaryLoading" class="flex items-center gap-2 text-xs text-slate-300">
              <span class="i-heroicons-arrow-path animate-spin"></span>
              Loading dictionary...
            </div>
            <div v-else-if="dictionaryFallback" class="flex items-center gap-2 text-xs text-amber-300 font-semibold">
              <span class="i-heroicons-exclamation-triangle"></span>
              Limited dictionary loaded; some words may be missing.
            </div>
          </div>
        </div>
      </UCard>

      <UModal v-model="showTutorial" :ui="{ width: 'max-w-lg' }">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-semibold">How to Play</h3>
              <UButton variant="ghost" icon="i-heroicons-x-mark" @click="dismissTutorial" />
            </div>
          </template>
          <div class="space-y-3 text-slate-200">
            <p class="text-sm text-slate-300">Connect glowing cubes to form words and keep the tower below the danger line.</p>
            <ul class="space-y-2 text-sm">
              <li class="flex gap-3">
                <span class="i-heroicons-cursor-arrow-rays text-emerald-300"></span>
                <span>Tap letters that touch each other (diagonals count) to build your word.</span>
              </li>
              <li class="flex gap-3">
                <span class="i-heroicons-arrow-uturn-left text-emerald-300"></span>
                <span>Use Undo if you tap the wrong block, or Clear to start over.</span>
              </li>
              <li class="flex gap-3">
                <span class="i-heroicons-check-circle text-emerald-300"></span>
                <span>Submit real words to clear tiles, earn time, and grow your combo.</span>
              </li>
              <li class="flex gap-3">
                <span class="i-heroicons-exclamation-triangle text-amber-400"></span>
                <span>Keep the tower under the danger line and race the timer.</span>
              </li>
            </ul>
          </div>
          <template #footer>
            <div class="flex justify-end">
              <UButton color="emerald" icon="i-heroicons-play" @click="dismissTutorial">
                Let&apos;s play
              </UButton>
            </div>
          </template>
        </UCard>
      </UModal>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  ssr: false
})

import { onMounted, onBeforeUnmount, ref, nextTick, watch, computed } from 'vue'
import { useGameState } from '~/composables/useGameState'
import { useDictionary } from '~/composables/useDictionary'
import { useThreeTowerScene } from '~/composables/useThreeTowerScene'

const router = useRouter()
const { isValidWord, preload, isLoading: isDictionaryLoading, fallbackUsed: dictionaryFallback } = useDictionary()
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
  potentialScore,
  GRID_COLS,
  GRID_ROWS_VISIBLE,
  toggleTile,
  undoLastSelection,
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
const isPaused = ref(false)
const cursorPosition = ref({ row: 0, col: 0 })
const showTutorial = ref(false)

// Computed
const rowTimerPercent = computed(() => Math.max(0, Math.min(100, (rowTimer.value / rowTimerInterval.value) * 100)))
const canSubmit = computed(() => selectedTiles.value.length >= 2)
const submitTooltip = computed(() => {
  if (isGameOver.value) return 'Game over'
  if (!selectedTiles.value.length) return 'Select connected letters to submit'
  if (!canSubmit.value) return 'Pick at least two letters'
  return 'Submit your word'
})
const cursorLabel = computed(() => `Row ${cursorPosition.value.row + 1}, Col ${cursorPosition.value.col + 1}`)
const timePercent = computed(() => Math.min(100, Math.max(0, (timeRemaining.value / 60) * 100)))
const timeBarClass = computed(() => {
  if (timeRemaining.value < 8) return 'bg-gradient-to-r from-red-500 to-orange-400 animate-pulse'
  if (timeRemaining.value < 18) return 'bg-gradient-to-r from-amber-400 to-red-400'
  return 'bg-gradient-to-r from-emerald-400 to-cyan-400'
})

// Game loop
let gameLoopId: number | null = null
let lastTime = 0
let handleKeyDown: ((e: KeyboardEvent) => void) | null = null

const gameLoop = (currentTime: number) => {
  if (!lastTime) lastTime = currentTime
  const delta = (currentTime - lastTime) / 1000
  lastTime = currentTime

  if (!isGameOver.value && !isPaused.value) {
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
  if (isGameOver.value || isPaused.value) return

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
  if (isSubmitting.value || !canSubmit.value) return

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
  clearSelection()
  resetGame()
  rowTimer.value = 7
  rowTimerInterval.value = 7
  lastTime = 0
  isPaused.value = false
  scene.dispose()
  nextTick(() => {
    scene.init()
    updateScene()
  })
}

const togglePause = () => {
  if (isGameOver.value) return
  isPaused.value = !isPaused.value
  showStatus(isPaused.value ? 'Game paused' : 'Game resumed', 'success')
}

const openTutorial = () => {
  showTutorial.value = true
}

const dismissTutorial = () => {
  showTutorial.value = false
  if (typeof window !== 'undefined') {
    localStorage.setItem('lexistack-tutorial-seen', 'true')
  }
}

const moveCursor = (dx: number, dy: number) => {
  const nextRow = Math.min(Math.max(cursorPosition.value.row + dy, 0), GRID_ROWS_VISIBLE - 1)
  const nextCol = Math.min(Math.max(cursorPosition.value.col + dx, 0), GRID_COLS - 1)
  cursorPosition.value = { row: nextRow, col: nextCol }
  showStatus(`Cursor: ${cursorLabel.value}`, 'success')
}

const toggleCursorTile = () => {
  if (isGameOver.value || isPaused.value) return
  const position = { ...cursorPosition.value }
  const result = toggleTile(position)
  if (!result.success && result.message) {
    showStatus(result.message, 'error')
    scene.flashTiles([position])
  } else {
    updateScene()
  }
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
    clearSelection()
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Setup
onMounted(async () => {
  await nextTick()
  if (!canvasRef.value) return

  // Preload dictionary
  preload()

  if (typeof window !== 'undefined') {
    const tutorialSeen = localStorage.getItem('lexistack-tutorial-seen')
    showTutorial.value = !tutorialSeen
  }

  // Initialize scene
  scene.init()

  // Setup event listeners
  canvasRef.value.addEventListener('pointerdown', handleTileClick)
  canvasRef.value.addEventListener('touchstart', handleTileClick, { passive: true })
  window.addEventListener('resize', scene.handleResize)
  handleKeyDown = (e: KeyboardEvent) => {
    if (['ArrowUp', 'w', 'W'].includes(e.key)) {
      e.preventDefault()
      moveCursor(0, -1)
    } else if (['ArrowDown', 's', 'S'].includes(e.key)) {
      e.preventDefault()
      moveCursor(0, 1)
    } else if (['ArrowLeft', 'a', 'A'].includes(e.key)) {
      e.preventDefault()
      moveCursor(-1, 0)
    } else if (['ArrowRight', 'd', 'D'].includes(e.key)) {
      e.preventDefault()
      moveCursor(1, 0)
    } else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleCursorTile()
    } else if (e.key === 'Escape') {
      clearSelection()
      updateScene()
    }
  }

  window.addEventListener('keydown', handleKeyDown)

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
  if (handleKeyDown) {
    window.removeEventListener('keydown', handleKeyDown)
  }
  scene.dispose()
  document.body.style.overflow = ''
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

@keyframes wordShake {
  0% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
  100% { transform: translateX(0); }
}

.word-shake {
  animation: wordShake 0.4s ease;
}
</style>

