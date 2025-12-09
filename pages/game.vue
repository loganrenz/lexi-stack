<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white">
    <div class="mx-auto max-w-6xl px-2 sm:px-4 pb-4 pt-2 sm:pt-4">
      <!-- Top Bar -->
      <div class="flex flex-wrap items-center justify-between gap-2 sm:gap-4 mb-2 sm:mb-3">
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
        <div class="flex items-center gap-1 sm:gap-2">
          <UButton 
            icon="i-heroicons-question-mark-circle" 
            variant="ghost" 
            @click="openTutorial" 
            class="text-slate-200 p-2 sm:p-2.5"
            size="sm"
          >
            <span class="hidden sm:inline">How to play</span>
          </UButton>
          <UButton
            color="cyan"
            variant="ghost"
            :icon="isPaused ? 'i-heroicons-play' : 'i-heroicons-pause'"
            @click="togglePause"
            class="p-2 sm:p-2.5 min-w-[60px] sm:min-w-[96px]"
            size="sm"
          >
            <span class="hidden sm:inline">{{ isPaused ? 'Resume' : 'Pause' }}</span>
          </UButton>
        </div>
      </div>


      <!-- Stats Overlay -->
      <div class="fixed top-2 right-2 sm:top-4 sm:right-4 z-40">
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="statsExpanded"
            class="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-2xl min-w-[120px] sm:min-w-[140px]"
          >
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase tracking-wider text-slate-400">Score</span>
                <span class="text-lg font-bold">{{ score.toLocaleString() }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase tracking-wider text-slate-400">Combo</span>
                <span class="text-lg font-bold text-emerald-400">x{{ comboMultiplier.toFixed(1) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase tracking-wider text-slate-400">Time</span>
                <span class="text-lg font-bold" :class="timeRemaining < 10 ? 'text-red-400' : 'text-cyan-400'">
                  {{ Math.ceil(timeRemaining) }}s
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase tracking-wider text-slate-400">Level</span>
                <span class="text-lg font-bold text-blue-400">{{ level }}</span>
              </div>
            </div>
          </div>
        </Transition>
        <button
          @click="statsExpanded = !statsExpanded"
          class="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-2.5 shadow-lg hover:bg-black/90 transition-colors"
        >
          <div class="flex items-center gap-2">
            <span class="i-heroicons-chart-bar text-white text-lg"></span>
            <span v-if="!statsExpanded" class="text-xs font-semibold text-white">
              {{ score.toLocaleString() }}
            </span>
            <span class="i-heroicons-chevron-down text-white text-xs transition-transform" :class="{ 'rotate-180': statsExpanded }"></span>
          </div>
        </button>
      </div>

      <!-- Game Canvas -->
      <div
        class="relative h-[60vh] min-h-[400px] sm:h-[65vh] sm:min-h-[500px] rounded-2xl border border-white/10 bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden shadow-2xl"
      >
        <canvas ref="canvasRef" class="h-full w-full" :class="{ 'pointer-events-none': isGameOver }" style="touch-action: none;"></canvas>

        <!-- Global Timer Bar (Simplified for Mobile) -->
        <div class="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 z-10">
          <div class="bg-black/70 border border-white/10 rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-4 sm:py-2 backdrop-blur-md shadow-lg">
            <div class="flex items-center justify-between text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-300 mb-1">
              <span class="hidden sm:inline">Time</span>
              <span :class="timeRemaining < 10 ? 'text-red-300' : 'text-emerald-200'">{{ Math.ceil(timeRemaining) }}s</span>
            </div>
            <div class="w-full h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                class="h-full transition-all duration-300"
                :class="timeBarClass"
                :style="{ width: `${timePercent}%` }"
              ></div>
            </div>
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

      <!-- Floating Word Feedback -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-90"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-90"
      >
        <div
          v-if="isDragging && floatingWordPosition && selectedTiles.length > 0"
          class="fixed pointer-events-none z-50"
          :style="{
            left: floatingWordPosition ? `${Math.min(Math.max(floatingWordPosition.x, 80), (typeof window !== 'undefined' ? window.innerWidth : 1000) - 80)}px` : '50%',
            top: floatingWordPosition ? `${Math.max(floatingWordPosition.y - 70, 20)}px` : '50%',
            transform: 'translateX(-50%)'
          }"
        >
          <div class="bg-emerald-500/95 backdrop-blur-md border border-emerald-400/50 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-2xl">
            <div class="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              {{ currentWord }}
            </div>
            <div v-if="potentialScore" class="text-[10px] sm:text-xs text-emerald-100 mt-0.5 sm:mt-1 text-center">
              +{{ potentialScore }} pts
            </div>
          </div>
        </div>
      </Transition>

      <!-- Toast Notifications -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div
          v-if="statusMessage"
          class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div
            class="px-6 py-3 rounded-xl shadow-2xl backdrop-blur-md border"
            :class="statusMessageType === 'error' 
              ? 'bg-red-500/95 border-red-400/50 text-white' 
              : 'bg-emerald-500/95 border-emerald-400/50 text-white'"
          >
            <p class="font-semibold text-sm sm:text-base">{{ statusMessage }}</p>
          </div>
        </div>
      </Transition>

      <UModal v-model="showTutorial" :ui="{ width: 'max-w-lg' }">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-semibold">How to Play</h3>
              <UButton variant="ghost" icon="i-heroicons-x-mark" @click="dismissTutorial" />
            </div>
          </template>
          <div class="space-y-3 text-slate-200">
            <p class="text-sm text-slate-300">Drag your finger across connected letters to form words and keep the tower below the danger line.</p>
            <ul class="space-y-2 text-sm">
              <li class="flex gap-3">
                <span class="i-heroicons-hand-raised text-emerald-300"></span>
                <span>Touch and drag across adjacent letters (diagonals count) to build your word.</span>
              </li>
              <li class="flex gap-3">
                <span class="i-heroicons-arrow-up-on-square text-emerald-300"></span>
                <span>Lift your finger to automatically submit the word if it's valid (2+ letters).</span>
              </li>
              <li class="flex gap-3">
                <span class="i-heroicons-sparkles text-emerald-300"></span>
                <span>Valid words clear tiles, earn points, add time, and increase your combo multiplier.</span>
              </li>
              <li class="flex gap-3">
                <span class="i-heroicons-exclamation-triangle text-amber-400"></span>
                <span>Keep the tower under the danger line and race the timer to survive!</span>
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

// Drag interaction state
const isDragging = ref(false)
const dragStartPosition = ref<{ x: number; y: number } | null>(null)
const floatingWordPosition = ref<{ x: number; y: number } | null>(null)
const lastDragTile = ref<GridPosition | null>(null)
const statsExpanded = ref(false)

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
let handlePointerMove: ((e: MouseEvent | TouchEvent) => void) | null = null
let handlePointerEnd: ((e: MouseEvent | TouchEvent) => void) | null = null

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

// Handle drag start
const handleDragStart = (event: MouseEvent | TouchEvent) => {
  if (isGameOver.value || isPaused.value) return
  
  // Don't prevent default on touchstart to allow scrolling if needed
  const x = 'touches' in event ? event.touches[0].clientX : event.clientX
  const y = 'touches' in event ? event.touches[0].clientY : event.clientY
  
  dragStartPosition.value = { x, y }
  floatingWordPosition.value = { x, y }
  isDragging.value = true
  lastDragTile.value = null
  
  // Clear previous selection when starting new drag
  clearSelection()
  
  const position = scene.getTileFromScreen(x, y)
  if (position) {
    const result = toggleTile(position)
    if (result.success) {
      lastDragTile.value = position
      updateScene()
      // Prevent default after we've started selecting
      event.preventDefault()
    }
  }
}

// Handle drag move
const handleDragMove = (event: MouseEvent | TouchEvent) => {
  if (!isDragging.value || isGameOver.value || isPaused.value) return
  
  event.preventDefault()
  const x = 'touches' in event ? event.touches[0].clientX : event.clientX
  const y = 'touches' in event ? event.touches[0].clientY : event.clientY
  
  floatingWordPosition.value = { x, y }
  
  const position = scene.getTileFromScreen(x, y)
  if (position) {
    // Check if this is a different tile than the last one we processed
    const isNewTile = !lastDragTile.value || 
      lastDragTile.value.row !== position.row || 
      lastDragTile.value.col !== position.col
    
    if (isNewTile) {
      // Check if tile is already in selection
      const alreadySelected = selectedTiles.value.some(
        t => t.position.row === position.row && t.position.col === position.col
      )
      
      if (!alreadySelected) {
        // Try to add tile to selection (only if adjacent to last selected)
        const result = toggleTile(position)
        if (result.success) {
          lastDragTile.value = position
          updateScene()
        }
      } else {
        // Already selected, update last drag tile but don't deselect
        lastDragTile.value = position
      }
    }
  }
}

// Handle drag end
const handleDragEnd = async (event: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return
  
  event.preventDefault()
  isDragging.value = false
  floatingWordPosition.value = null
  lastDragTile.value = null
  
  // Auto-submit if valid word
  if (selectedTiles.value.length >= 2) {
    await handleSubmit()
  } else if (selectedTiles.value.length > 0) {
    // Clear selection if too short
    clearSelection()
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
  
  // Clear selection after submission attempt
  clearSelection()
  updateScene()
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

  // Setup event listeners for drag interaction
  canvasRef.value.addEventListener('pointerdown', handleDragStart)
  canvasRef.value.addEventListener('touchstart', handleDragStart, { passive: false })
  
  handlePointerMove = (e: MouseEvent | TouchEvent) => {
    if (isDragging.value) {
      handleDragMove(e)
    }
  }
  handlePointerEnd = (e: MouseEvent | TouchEvent) => {
    if (isDragging.value) {
      handleDragEnd(e)
    }
  }
  
  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', handlePointerEnd)
  window.addEventListener('touchmove', handlePointerMove, { passive: false })
  window.addEventListener('touchend', handlePointerEnd)
  window.addEventListener('touchcancel', handlePointerEnd)
  
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
    canvasRef.value.removeEventListener('pointerdown', handleDragStart)
    canvasRef.value.removeEventListener('touchstart', handleDragStart)
  }
  if (handlePointerMove) {
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('touchmove', handlePointerMove)
  }
  if (handlePointerEnd) {
    window.removeEventListener('pointerup', handlePointerEnd)
    window.removeEventListener('touchend', handlePointerEnd)
    window.removeEventListener('touchcancel', handlePointerEnd)
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

