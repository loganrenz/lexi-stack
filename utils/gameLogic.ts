export const LETTER_SCORES: Record<string, number> = Object.freeze({
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3, N: 1,
  O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
})

export interface GridPosition {
  row: number
  col: number
}

export function isAdjacentPosition(a: GridPosition, b: GridPosition): boolean {
  const rowDiff = Math.abs(a.row - b.row)
  const colDiff = Math.abs(a.col - b.col)
  return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0)
}

export function scoreWord(letters: string[], comboMultiplier: number): number {
  const wordScore = letters.reduce((sum, letter) => sum + (LETTER_SCORES[letter.toUpperCase()] ?? 0), 0)
  const lengthBonus = 1 + letters.length * 0.1
  return Math.round(wordScore * lengthBonus * comboMultiplier)
}

