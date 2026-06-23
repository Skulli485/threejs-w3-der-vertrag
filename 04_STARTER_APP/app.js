import * as THREE from 'three'

// ---------------------------------------------------------------------------
//  Lumen · Shader-Surface (Hero)
//  Three.js r184, zero-build via importmap.
//  Die Produktfarbe (uColor) und die ruhige Bewegung (uTime) laufen ueber
//  uniforms: JavaScript setzt Werte, der Fragment-Shader rechnet die Pixel.
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
  uniform vec3 uColor;
  uniform float uTime;

  varying vec2 vUv;

  void main() {
    float wave = sin(vUv.x * 8.0 + uTime * 1.2) * 0.05;
    float breath = sin(uTime * 0.45) * 0.035;
    float axis = clamp(vUv.y + wave + breath, 0.0, 1.0);

    vec3 color = mix(uColorBottom, uColorTop, axis);
    color *= uColor;

    gl_FragColor = vec4(color, 1.0);
  }
`

const uniforms = {
  uColorBottom: { value: new THREE.Color('#172033') },
  uColorTop: { value: new THREE.Color('#5ee0b5') },
  uColor: { value: new THREE.Color(tintInput.value) },
  uTime: { value: 0 },
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
  uniforms.uColor.value.set(event.target.value)
})

deployButton.addEventListener('click', () => {
  deployButton.firstChild.textContent = 'Anmeldung geprueft '
})

queueButton.addEventListener('click', () => {
  document.querySelector('.empty-core h3').textContent = 'Sitzung vorbereitet.'
})

window.addEventListener('resize', resize)

renderer.setAnimationLoop(() => {
  const elapsed = clock.getElapsedTime()
  uniforms.uTime.value = elapsed

  updateHud(elapsed)
  renderer.render(scene, camera)
})

resize()
