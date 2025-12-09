<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white">
    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <!-- Hero Section -->
      <div class="text-center space-y-6 mb-12">
        <h1 class="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
          LexiStack
        </h1>
        <p class="text-xl sm:text-2xl text-slate-300 max-w-2xl mx-auto">
          A beautiful 3D word tower game. Connect adjacent letters to form words and clear the tower before it reaches the top!
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <UButton
            size="xl"
            color="emerald"
            icon="i-heroicons-play"
            @click="startGame"
            class="px-8 py-6 text-lg font-semibold"
          >
            Play Now
          </UButton>
          <UButton
            size="xl"
            variant="outline"
            color="white"
            icon="i-heroicons-trophy"
            @click="showHighScores = true"
            class="px-8 py-6 text-lg"
          >
            High Scores
          </UButton>
        </div>
      </div>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <UCard class="bg-slate-900/50 border-white/10">
          <template #header>
            <div class="text-2xl mb-2">🎮</div>
            <h3 class="text-lg font-semibold">3D Word Tower</h3>
          </template>
          <p class="text-sm text-slate-400">
            Beautiful Three.js 3D graphics with smooth animations and particle effects
          </p>
        </UCard>

        <UCard class="bg-slate-900/50 border-white/10">
          <template #header>
            <div class="text-2xl mb-2">⏱️</div>
            <h3 class="text-lg font-semibold">Timed Runs</h3>
          </template>
          <p class="text-sm text-slate-400">
            Race against the clock as new rows appear. Clear words to buy more time!
          </p>
        </UCard>

        <UCard class="bg-slate-900/50 border-white/10">
          <template #header>
            <div class="text-2xl mb-2">🔥</div>
            <h3 class="text-lg font-semibold">Combo System</h3>
          </template>
          <p class="text-sm text-slate-400">
            Build your combo multiplier with consecutive words for massive scores
          </p>
        </UCard>

        <UCard class="bg-slate-900/50 border-white/10">
          <template #header>
            <div class="text-2xl mb-2">📱</div>
            <h3 class="text-lg font-semibold">Mobile Friendly</h3>
          </template>
          <p class="text-sm text-slate-400">
            Fully responsive design optimized for touch devices and all screen sizes
          </p>
        </UCard>
      </div>

      <!-- How to Play -->
      <UCard class="bg-slate-900/50 border-white/10 mb-8">
        <template #header>
          <h2 class="text-2xl font-bold text-center">How to Play</h2>
        </template>
        <div class="space-y-4 text-slate-300">
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold">
              1
            </div>
            <div>
              <h3 class="font-semibold mb-1">Connect Letters</h3>
              <p class="text-sm text-slate-400">
                Tap or click adjacent letters (including diagonals) to build words
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold">
              2
            </div>
            <div>
              <h3 class="font-semibold mb-1">Submit Words</h3>
              <p class="text-sm text-slate-400">
                Submit valid words to clear tiles, score points, and gain time
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold">
              3
            </div>
            <div>
              <h3 class="font-semibold mb-1">Watch the Timer</h3>
              <p class="text-sm text-slate-400">
                Keep an eye on the timer bar - cleared words add time to keep you going
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold">
              4
            </div>
            <div>
              <h3 class="font-semibold mb-1">Avoid the Danger Line</h3>
              <p class="text-sm text-slate-400">
                Keep the tower below the danger line or it's game over!
              </p>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Tips -->
      <UCard class="bg-slate-900/50 border-white/10">
        <template #header>
          <h2 class="text-xl font-semibold">💡 Pro Tips</h2>
        </template>
        <ul class="space-y-2 text-sm text-slate-300">
          <li class="flex items-start gap-2">
            <span class="text-emerald-400">•</span>
            <span>Longer words give bigger time bonuses and boost your combo multiplier</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-emerald-400">•</span>
            <span>Small clears buy time; long words push your streak for maximum points</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-emerald-400">•</span>
            <span>Diagonal chains are allowed - use all 8 directions to find words</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-emerald-400">•</span>
            <span>Invalid words reset your combo, so choose carefully!</span>
          </li>
        </ul>
      </UCard>
    </div>

    <!-- High Scores Modal -->
    <UModal v-model="showHighScores">
      <UCard>
        <template #header>
          <h2 class="text-2xl font-bold">🏆 High Scores</h2>
        </template>
        <div v-if="highScores.length === 0" class="text-center py-8 text-slate-400">
          No scores yet. Be the first!
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="(score, index) in highScores"
            :key="index"
            class="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-white/10"
          >
            <div class="flex items-center gap-4">
              <div class="text-2xl font-bold text-emerald-400">#{{ index + 1 }}</div>
              <div>
                <div class="font-semibold text-lg">{{ score.score.toLocaleString() }} points</div>
                <div class="text-sm text-slate-400">
                  {{ new Date(score.date).toLocaleDateString() }} • Combo: x{{ score.bestCombo.toFixed(1) }}
                </div>
              </div>
            </div>
            <div class="text-right text-sm text-slate-300">
              <div>Longest: {{ score.longestWord }}</div>
            </div>
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="showHighScores = false">Close</UButton>
            <UButton color="emerald" @click="clearHighScores">Clear All</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { HighScore } from '~/types'

const router = useRouter()
const showHighScores = ref(false)

const highScores = ref<HighScore[]>([])

const loadHighScores = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('lexistack-highscores')
    if (stored) {
      try {
        highScores.value = JSON.parse(stored)
      } catch {
        highScores.value = []
      }
    }
  }
}

const clearHighScores = () => {
  highScores.value = []
  if (typeof window !== 'undefined') {
    localStorage.removeItem('lexistack-highscores')
  }
  showHighScores.value = false
}

const startGame = () => {
  router.push('/game')
}

onMounted(() => {
  loadHighScores()
})
</script>
