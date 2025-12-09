/**
 * Three.js scene composable for 3D tower rendering
 * Handles scene setup, camera, lighting, tile rendering, and interactions
 */

import * as THREE from 'three'
import type { GridPosition } from '~/types'

export interface TowerSceneOptions {
  gridCols: number
  gridRows: number
  tileSize?: number
  tileGap?: number
  cameraAngle?: number
  enableShadows?: boolean
}

export interface TileMesh extends THREE.Mesh {
  userData: {
    row: number
    col: number
    letter: string
  }
}

export const useThreeTowerScene = (
  canvasRef: Ref<HTMLCanvasElement | null>,
  options: TowerSceneOptions
) => {
  const { gridCols, gridRows, tileSize = 0.9, tileGap = 0.14, enableShadows = true } = options

  let scene: THREE.Scene | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let renderer: THREE.WebGLRenderer | null = null
  let animationId: number | null = null
  let raycaster: THREE.Raycaster | null = null
  let pointer: THREE.Vector2 | null = null

  const tileMeshes = new Map<string, TileMesh>()
  const selectedMeshes = new Set<TileMesh>()
  const clearedMeshes = new Set<TileMesh>()

  const boardWidth = gridCols * (tileSize + tileGap) - tileGap
  const boardHeight = gridRows * (tileSize + tileGap) - tileGap
  const boardOriginY = -boardHeight / 2

  // Calculate tile positions
  const getTileY = (row: number) => boardOriginY + row * (tileSize + tileGap)
  const getTileX = (col: number) => (col - (gridCols - 1) / 2) * (tileSize + tileGap)

  // Create letter texture
  const createLetterTexture = (letter: string): THREE.CanvasTexture => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    
    const gradient = ctx.createLinearGradient(0, 0, size, size)
    gradient.addColorStop(0, '#0f172a')
    gradient.addColorStop(1, '#1a1f3a')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    
    ctx.fillStyle = '#e5e7eb'
    ctx.font = 'bold 140px Inter, -apple-system, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(letter, size / 2, size / 2)
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }

  // Create tile mesh
  const createTileMesh = (letter: string, row: number, col: number): TileMesh => {
    const geometry = new THREE.BoxGeometry(tileSize, tileSize, tileSize * 0.5)
    const texture = createLetterTexture(letter)
    const material = new THREE.MeshStandardMaterial({
      color: '#cbd5f5',
      emissive: '#0ea5e9',
      emissiveIntensity: 0.3,
      metalness: 0.2,
      roughness: 0.4,
      map: texture,
      transparent: true
    })

    const mesh = new THREE.Mesh(geometry, material) as TileMesh
    mesh.position.set(getTileX(col), getTileY(row), 0)
    mesh.castShadow = enableShadows
    mesh.receiveShadow = enableShadows
    mesh.userData = { row, col, letter }

    return mesh
  }

  // Initialize scene
  const init = () => {
    if (!canvasRef.value) return

    // Scene
    scene = new THREE.Scene()
    scene.background = new THREE.Color('#0a0f1a')

    // Camera
    const width = canvasRef.value.clientWidth
    const height = canvasRef.value.clientHeight
    const aspect = width / height
    const fov = 50
    const near = 0.1
    const far = 100

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    camera.position.set(0, boardHeight / 3, 15)
    camera.lookAt(0, boardHeight / 3, 0)

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.value,
      antialias: true,
      alpha: false
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = enableShadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace

    // Lighting
    const ambient = new THREE.AmbientLight('#ffffff', 0.5)
    scene.add(ambient)

    const dir1 = new THREE.DirectionalLight('#87d1ff', 0.9)
    dir1.position.set(4, 8, 6)
    if (enableShadows) {
      dir1.castShadow = true
      dir1.shadow.mapSize.width = 1024
      dir1.shadow.mapSize.height = 1024
      dir1.shadow.camera.near = 0.5
      dir1.shadow.camera.far = 50
    }
    scene.add(dir1)

    const dir2 = new THREE.DirectionalLight('#ffd787', 0.3)
    dir2.position.set(-4, 4, -6)
    scene.add(dir2)

    // Background plane
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
    if (enableShadows) base.receiveShadow = true
    scene.add(base)

    // Danger line indicator
    const dangerLineGeo = new THREE.PlaneGeometry(boardWidth * 1.2, 0.1)
    const dangerLineMat = new THREE.MeshBasicMaterial({
      color: '#f97316',
      transparent: true,
      opacity: 0.3
    })
    const dangerLine = new THREE.Mesh(dangerLineGeo, dangerLineMat)
    dangerLine.position.set(0, boardOriginY + boardHeight * 0.9, 0.1)
    scene.add(dangerLine)

    // Raycaster for interactions
    raycaster = new THREE.Raycaster()
    pointer = new THREE.Vector2()

    // Start render loop
    const clock = new THREE.Clock()
    const render = () => {
      if (!scene || !camera || !renderer) return

      const delta = clock.getDelta()

      // Idle camera animation
      if (camera) {
        const time = clock.getElapsedTime()
        camera.position.x = Math.sin(time * 0.1) * 0.5
        camera.lookAt(0, boardHeight / 3, 0)
      }

      // Update tile animations
      for (const mesh of tileMeshes.values()) {
        const targetY = getTileY(mesh.userData.row)
        mesh.position.y += (targetY - mesh.position.y) * Math.min(12 * delta, 1)
      }

      // Animate cleared tiles
      for (const mesh of clearedMeshes) {
        mesh.scale.multiplyScalar(0.95)
        const material = mesh.material as THREE.MeshStandardMaterial
        material.opacity *= 0.95
        if (material.opacity < 0.01) {
          scene.remove(mesh)
          mesh.geometry.dispose()
          if (material.map) material.map.dispose()
          material.dispose()
          clearedMeshes.delete(mesh)
          tileMeshes.delete(`${mesh.userData.row}-${mesh.userData.col}`)
        }
      }

      renderer.render(scene, camera)
      animationId = requestAnimationFrame(render)
    }
    render()
  }

  // Update tile in scene
  const updateTile = (letter: string, row: number, col: number) => {
    if (!scene) return

    const key = `${row}-${col}`
    const existing = tileMeshes.get(key)

    if (existing) {
      // Update existing
      existing.userData.letter = letter
      existing.userData.row = row
      existing.userData.col = col
      existing.position.x = getTileX(col)
      existing.position.y = getTileY(row)
      
      // Update texture
      const material = existing.material as THREE.MeshStandardMaterial
      if (material.map) material.map.dispose()
      material.map = createLetterTexture(letter)
    } else {
      // Create new
      const mesh = createTileMesh(letter, row, col)
      scene.add(mesh)
      tileMeshes.set(key, mesh)
    }
  }

  // Remove tile
  const removeTile = (row: number, col: number) => {
    const key = `${row}-${col}`
    const mesh = tileMeshes.get(key)
    if (mesh && scene) {
      selectedMeshes.delete(mesh)
      clearedMeshes.add(mesh)
    }
  }

  // Highlight selected tiles
  const highlightTiles = (positions: GridPosition[]) => {
    // Reset all
    for (const mesh of selectedMeshes) {
      const material = mesh.material as THREE.MeshStandardMaterial
      material.color.set('#cbd5f5')
      material.emissive.set('#0ea5e9')
      material.emissiveIntensity = 0.3
      mesh.scale.setScalar(1)
    }
    selectedMeshes.clear()

    // Highlight new selection
    for (const pos of positions) {
      const key = `${pos.row}-${pos.col}`
      const mesh = tileMeshes.get(key)
      if (mesh) {
        const material = mesh.material as THREE.MeshStandardMaterial
        material.color.set('#67e8f9')
        material.emissive.set('#22d3ee')
        material.emissiveIntensity = 0.8
        mesh.scale.setScalar(1.1)
        selectedMeshes.add(mesh)
      }
    }
  }

  // Flash tiles (error feedback)
  const flashTiles = (positions: GridPosition[]) => {
    for (const pos of positions) {
      const key = `${pos.row}-${pos.col}`
      const mesh = tileMeshes.get(key)
      if (mesh) {
        const material = mesh.material as THREE.MeshStandardMaterial
        const originalEmissive = material.emissive.clone()
        material.emissive.set('#f97316')
        material.emissiveIntensity = 0.8
        
        setTimeout(() => {
          if (material) {
            material.emissive.copy(originalEmissive)
            material.emissiveIntensity = 0.3
          }
        }, 300)
      }
    }
  }

  // Get tile position from screen coordinates
  const getTileFromScreen = (x: number, y: number): GridPosition | null => {
    if (!renderer || !camera || !raycaster || !pointer) return null

    const rect = renderer.domElement.getBoundingClientRect()
    pointer.x = ((x - rect.left) / rect.width) * 2 - 1
    pointer.y = -((y - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(pointer, camera)
    const meshes = Array.from(tileMeshes.values())
    const intersects = raycaster.intersectObjects(meshes)

    if (intersects.length > 0) {
      const mesh = intersects[0].object as TileMesh
      return {
        row: mesh.userData.row,
        col: mesh.userData.col
      }
    }

    return null
  }

  // Resize handler
  const handleResize = () => {
    if (!canvasRef.value || !camera || !renderer) return

    const width = canvasRef.value.clientWidth
    const height = canvasRef.value.clientHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  // Cleanup
  const dispose = () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }

    if (scene) {
      for (const mesh of tileMeshes.values()) {
        scene.remove(mesh)
        mesh.geometry.dispose()
        const material = mesh.material as THREE.MeshStandardMaterial
        if (material.map) material.map.dispose()
        material.dispose()
      }
      tileMeshes.clear()
      selectedMeshes.clear()
      clearedMeshes.clear()
    }

    if (renderer) {
      renderer.dispose()
      renderer = null
    }

    scene = null
    camera = null
    raycaster = null
    pointer = null
  }

  return {
    init,
    updateTile,
    removeTile,
    highlightTiles,
    flashTiles,
    getTileFromScreen,
    handleResize,
    dispose,
    boardWidth,
    boardHeight
  }
}

