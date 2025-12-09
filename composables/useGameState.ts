/**
 * Core game state management composable
 * Handles grid, selection, scoring, timer, and game flow
 */

import type { GridPosition, SelectedTile, WordSubmissionResult, GameState } from '~/types'
import { isAdjacentPosition, scoreWord } from '~/utils/gameLogic'

const GRID_COLS = 8
const GRID_ROWS_VISIBLE = 10
const INITIAL_ROWS = 5
const START_TIME = 60 // seconds
const MIN_TIME_BONUS = 1
const MAX_TIME_BONUS = 3
const COMBO_DECAY_TIME = 5 // seconds without valid word resets combo
const COMBO_INCREASE = 0.1

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

export const useGameState = () => {
  // Grid state
  const grid = ref<Array<Array<string | null>>>([])
  const selectedTiles = ref<SelectedTile[]>([])
  
  // Game metrics
  const score = ref(0)
  const comboMultiplier = ref(1)
  const bestCombo = ref(1)
  const timeRemaining = ref(START_TIME)
  const level = ref(1)
  const isGameOver = ref(false)
  const longestWord = ref('')
  const potentialScore = computed(() => {
    if (selectedTiles.value.length < 2) return 0
    return scoreWord(selectedTiles.value.map(t => t.letter), comboMultiplier.value)
  })
  
  // Combo decay timer
  const lastValidWordTime = ref(0)
  const comboDecayTimer = ref(0)

  const currentWord = computed(() => 
    selectedTiles.value.map(t => t.letter).join('')
  )

  const gameState = computed<GameState>(() => ({
    score: score.value,
    comboMultiplier: comboMultiplier.value,
    bestCombo: bestCombo.value,
    timeRemaining: timeRemaining.value,
    level: level.value,
    isGameOver: isGameOver.value,
    selectedTiles: selectedTiles.value,
    currentWord: currentWord.value
  }))

  // Generate random letter based on weights
  const getRandomLetter = (): string => {
    const totalWeight = LETTER_POOL.reduce((sum, entry) => sum + entry.weight, 0)
    const roll = Math.random() * totalWeight
    let cumulative = 0
    for (const entry of LETTER_POOL) {
      cumulative += entry.weight
      if (roll <= cumulative) return entry.letter
    }
    return 'E'
  }

  // Initialize grid
  const initGrid = () => {
    grid.value = Array.from({ length: GRID_ROWS_VISIBLE }, () => 
      Array.from({ length: GRID_COLS }, () => null)
    )
    
    for (let r = 0; r < INITIAL_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        grid.value[r][c] = getRandomLetter()
      }
    }
  }

  // Add new row at top
  const addNewRow = (): boolean => {
    // Check if game over (top row is full)
    if (grid.value[GRID_ROWS_VISIBLE - 1].some(cell => cell !== null)) {
      return false
    }

    // Shift all rows down
    for (let row = GRID_ROWS_VISIBLE - 1; row >= 1; row--) {
      for (let col = 0; col < GRID_COLS; col++) {
        grid.value[row][col] = grid.value[row - 1][col]
      }
    }

    // Add new row at top
    for (let col = 0; col < GRID_COLS; col++) {
      grid.value[0][col] = getRandomLetter()
    }

    return true
  }

  // Toggle tile selection
  const toggleTile = (position: GridPosition): { success: boolean; message?: string } => {
    if (isGameOver.value) {
      return { success: false, message: 'Game over' }
    }

    const { row, col } = position
    if (row < 0 || row >= GRID_ROWS_VISIBLE || col < 0 || col >= GRID_COLS) {
      return { success: false, message: 'Invalid position' }
    }

    if (!grid.value[row][col]) {
      return { success: false, message: 'Empty cell' }
    }

    const letter = grid.value[row][col]!
    const existingIndex = selectedTiles.value.findIndex(
      t => t.position.row === row && t.position.col === col
    )

    // Deselect if already selected
    if (existingIndex !== -1) {
      selectedTiles.value.splice(existingIndex, 1)
      // Re-index remaining tiles
      selectedTiles.value.forEach((t, i) => { t.index = i })
      return { success: true }
    }

    // Check adjacency
    if (selectedTiles.value.length > 0) {
      const lastTile = selectedTiles.value[selectedTiles.value.length - 1]
      if (!isAdjacentPosition(lastTile.position, position)) {
        return { success: false, message: 'Tiles must be adjacent' }
      }
    }

    // Add to selection
    selectedTiles.value.push({
      letter,
      position,
      id: `${row}-${col}`,
      index: selectedTiles.value.length
    })

    return { success: true }
  }

  const undoLastSelection = () => {
    if (!selectedTiles.value.length) return
    selectedTiles.value.pop()
    selectedTiles.value.forEach((tile, idx) => {
      tile.index = idx
    })
  }

  // Clear selection
  const clearSelection = () => {
    selectedTiles.value = []
  }

  // Submit word and process result
  const submitWord = async (
    isValidWordFn: (word: string) => Promise<boolean>
  ): Promise<WordSubmissionResult> => {
    if (selectedTiles.value.length < 2) {
      return {
        success: false,
        word: currentWord.value,
        score: 0,
        message: 'Select at least 2 letters',
        clearedTiles: []
      }
    }

    const word = currentWord.value.toUpperCase()
    const isValid = await isValidWordFn(word)

    if (!isValid) {
      // Reset combo on invalid word
      comboMultiplier.value = 1
      comboDecayTimer.value = 0
      return {
        success: false,
        word,
        score: 0,
        message: `${word} is not a valid word`,
        clearedTiles: []
      }
    }

    // Valid word - calculate score
    const letters = selectedTiles.value.map(t => t.letter)
    const points = scoreWord(letters, comboMultiplier.value)
    score.value += points

    // Update longest word
    if (word.length > longestWord.value.length) {
      longestWord.value = word
    }

    // Increase combo
    comboMultiplier.value = Math.min(5, comboMultiplier.value + COMBO_INCREASE)
    bestCombo.value = Math.max(bestCombo.value, comboMultiplier.value)
    lastValidWordTime.value = Date.now()

    // Add time bonus based on word length
    const timeBonus = Math.min(
      MAX_TIME_BONUS,
      MIN_TIME_BONUS + Math.floor(word.length / 3)
    )
    timeRemaining.value += timeBonus

    // Clear tiles
    const clearedTiles = selectedTiles.value.map(t => t.position)
    for (const { position } of selectedTiles.value) {
      grid.value[position.row][position.col] = null
    }

    // Apply gravity (collapse columns)
    applyGravity()

    // Clear selection
    clearSelection()

    return {
      success: true,
      word,
      score: points,
      message: `Cleared ${word}! +${points} points`,
      clearedTiles
    }
  }

  // Apply gravity - tiles fall down
  const applyGravity = () => {
    for (let col = 0; col < GRID_COLS; col++) {
      let writeRow = 0
      for (let row = 0; row < GRID_ROWS_VISIBLE; row++) {
        if (grid.value[row][col] !== null) {
          if (row !== writeRow) {
            grid.value[writeRow][col] = grid.value[row][col]
            grid.value[row][col] = null
          }
          writeRow++
        }
      }
    }
  }

  // Update timer
  const updateTimer = (delta: number) => {
    if (isGameOver.value) return

    timeRemaining.value -= delta
    if (timeRemaining.value <= 0) {
      timeRemaining.value = 0
      isGameOver.value = true
      clearSelection()
    }

    // Combo decay
    const timeSinceLastWord = (Date.now() - lastValidWordTime.value) / 1000
    if (timeSinceLastWord > COMBO_DECAY_TIME && comboMultiplier.value > 1) {
      comboDecayTimer.value += delta
      if (comboDecayTimer.value >= 1) {
        comboMultiplier.value = Math.max(1, comboMultiplier.value - 0.1)
        comboDecayTimer.value = 0
      }
    }
  }

  // Reset game
  const reset = () => {
    score.value = 0
    comboMultiplier.value = 1
    bestCombo.value = 1
    timeRemaining.value = START_TIME
    level.value = 1
    isGameOver.value = false
    longestWord.value = ''
    selectedTiles.value = []
    lastValidWordTime.value = Date.now()
    comboDecayTimer.value = 0
    initGrid()
  }

  // Initialize on first use
  if (grid.value.length === 0) {
    initGrid()
  }

  return {
    // State
    grid: readonly(grid),
    selectedTiles: readonly(selectedTiles),
    score: readonly(score),
    comboMultiplier: readonly(comboMultiplier),
    bestCombo: readonly(bestCombo),
    timeRemaining: readonly(timeRemaining),
    level: readonly(level),
    isGameOver: readonly(isGameOver),
    longestWord: readonly(longestWord),
    potentialScore,
    currentWord,
    gameState,
    
    // Constants
    GRID_COLS,
    GRID_ROWS_VISIBLE,
    
    // Methods
    toggleTile,
    undoLastSelection,
    clearSelection,
    submitWord,
    addNewRow,
    updateTimer,
    reset,
    getRandomLetter
  }
}

