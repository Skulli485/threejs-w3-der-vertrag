import * as THREE from 'three'

// ---------------------------------------------------------------------------
//  Lumen · Shader-Surface (Hero)
//  Three.js r184, zero-build via importmap.
//  Die Basis-Surface (vertikaler Verlauf) laeuft sofort. Die mit GAP markierten
//  Stellen sind deine Schritte heute: Produktfarbe (uColor) und Bewegung (uTime).
//  Wie genau, steht im Brief, nicht im Code.
// ---------------------------------------------------------------------------

const canvas = document.querySelector('#shader-surface')
const hudText = document.querySelector('#hud-text')
const tintInput = document.querySelector('#surface-tint')
const deployButton = document.querySelector('#deploy-button')
const queueButton = document.querySelector('#queue-button')

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const scene = new THREE.Scene()

// Orthografische Kamera: die Plane fuellt die Hero-Flaeche formatfuellend.
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
camera.position.z = 1

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  precision mediump float;

  uniform vec3 uColorBottom;
  uniform vec3 uColorTop;
  // GAP 1 — Surface-Uniforms: deklariere hier die Produktfarbe und die Zeit
  //         als eigene uniforms (siehe Brief, Schritt 1).

  varying vec2 vUv;

  void main() {
    float axis = vUv.y;

    // GAP 3 — Bewegung: verschiebe die Misch-Achse leicht ueber die Zeit,
    //         damit die Surface ruhig atmet (siehe Brief, Schritt 3).

    vec3 color = mix(uColorBottom, uColorTop, axis);

    // GAP 2 — Produktfarbe: rechne die Live-Produktfarbe in 'color' ein
    //         (siehe Brief, Schritt 2).

    gl_FragColor = vec4(color, 1.0);
  }
`

const uniforms = {
  uColorBottom: { value: new THREE.Color('#172033') },
  uColorTop: { value: new THREE.Color('#5ee0b5') },
  // GAP 4 — Kanal oeffnen: trage hier die uniforms uColor und uTime ein,
  //         jeweils in der Form { value: ... } (siehe Brief, Schritt 4).
}

const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms })

const geometry = new THREE.PlaneGeometry(2, 2)
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

const clock = new THREE.Clock()

function resize() {
  const rect = canvas.parentElement.getBoundingClientRect()
  const width = Math.max(1, Math.floor(rect.width))
  const height = Math.max(1, Math.floor(rect.height))
  renderer.setSize(width, height, false)

  // Cover: die 2x2-Plane fuellt die Flaeche, ueberstehende Raender werden beschnitten.
  const aspect = width / height
  if (aspect >= 1) {
    camera.left = -1; camera.right = 1
    camera.top = 1 / aspect; camera.bottom = -1 / aspect
  } else {
    camera.left = -aspect; camera.right = aspect
    camera.top = 1; camera.bottom = -1
  }
  camera.updateProjectionMatrix()
}

function updateHud(elapsed) {
  const tint = 'uColor' in uniforms ? 'uColor aktiv' : 'uColor offen'
  const time = 'uTime' in uniforms ? `uTime ${elapsed.toFixed(1)}s` : 'uTime offen'
  hudText.textContent = `ShaderMaterial · ${tint} · ${time}`
}

tintInput.addEventListener('input', (event) => {
  // GAP 5 — Farbe verbinden: schreibe den gewaehlten Wert in das uColor-uniform
  //         (siehe Brief, Schritt 5).
  void event
})

deployButton.addEventListener('click', () => {
  deployButton.firstChild.textContent = 'Release geprueft '
})

queueButton.addEventListener('click', () => {
  document.querySelector('.empty-core h3').textContent = 'Report vorbereitet.'
})

window.addEventListener('resize', resize)

renderer.setAnimationLoop(() => {
  const elapsed = clock.getElapsedTime()

  // GAP 5 — Zeit verbinden: setze das uTime-uniform einmal pro Frame
  //         (siehe Brief, Schritt 5).

  updateHud(elapsed)
  renderer.render(scene, camera)
})

resize()
