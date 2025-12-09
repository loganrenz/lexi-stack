/**
 * Core type definitions for LexiStack game
 */

export interface GridPosition {
  row: number
  col: number
}

export interface Tile {
  letter: string
  position: GridPosition
  id: string
}

export interface SelectedTile extends Tile {
  index: number // Order in selection
}

export interface WordSubmissionResult {
  success: boolean
  word: string
  score: number
  message: string
  clearedTiles: GridPosition[]
}

export interface GameState {
  score: number
  comboMultiplier: number
  bestCombo: number
  timeRemaining: number
  level: number
  isGameOver: boolean
  selectedTiles: SelectedTile[]
  currentWord: string
}

export interface GameSettings {
  reducedMotion: boolean
  soundEnabled: boolean
}

export interface HighScore {
  score: number
  date: string
  longestWord: string
  bestCombo: number
}

export interface TowerSceneOptions {
  gridCols: number
  gridRows: number
  tileSize: number
  tileGap: number
  cameraAngle?: number
  enableShadows?: boolean
}

