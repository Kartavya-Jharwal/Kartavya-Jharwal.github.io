/**
 * Animation Controllers
 * Anime.js for vector animations, Three.js for canvas glow
 */

// Anime.js wrapper (will be loaded from CDN)
export function animateMetrics() {
  if (typeof anime === 'undefined') return;
  
  const metrics = document.querySelectorAll('.metric-roll');
  
  metrics.forEach((el, i) => {
    anime({
      targets: el,
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 400,
      delay: i * 80,
      easing: 'cubicBezier(0.2, 0.7, 0.2, 1)'
    });
  });
}

// Logo glow pulse (continuous)
export function animateLogoPulse() {
  if (typeof anime === 'undefined') return;
  
  const logo = document.querySelector('.brand');
  if (!logo) return;
  
  anime({
    targets: logo,
    boxShadow: [
      { value: '0 0 18px rgba(255,255,255,0.3)' },
      { value: '0 0 28px rgba(255,255,255,0.5)' },
      { value: '0 0 18px rgba(255,255,255,0.3)' }
    ],
    duration: 3000,
    loop: true,
    easing: 'easeInOutSine'
  });
}

// Canvas scale animation on variant switch
export function animateCanvas() {
  if (typeof anime === 'undefined') return;
  
  const canvas = document.querySelector('.wrap');
  if (!canvas) return;
  
  anime({
    targets: canvas,
    scale: [0.98, 1],
    opacity: [0, 1],
    duration: 600,
    easing: 'cubicBezier(0.4, 0, 0.2, 1)'
  });
}

// Three.js setup for center glow
let scene, camera, renderer, glowMesh;

export function initThreeGlow() {
  if (typeof THREE === 'undefined') return;
  
  const container = document.getElementById('three-canvas');
  if (!container) return;
  
  // Scene setup
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;
  
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);
  
  // Radial gradient shader
  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uColor: { value: new THREE.Color(0xffffff) }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uCenter;
      uniform vec3 uColor;
      varying vec2 vUv;
      
      void main() {
        float dist = distance(vUv, uCenter);
        float glow = 1.0 - smoothstep(0.0, 0.6, dist);
        float pulse = sin(uTime * 0.5) * 0.1 + 0.9;
        float alpha = glow * 0.04 * pulse;
        gl_FragColor = vec4(uColor, alpha);
      }
    `
  });
  
  glowMesh = new THREE.Mesh(geometry, material);
  scene.add(glowMesh);
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    material.uniforms.uTime.value += 0.016;
    renderer.render(scene, camera);
  }
  
  animate();
  
  // Handle resize
  window.addEventListener('resize', () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

// Mouse parallax for glow
export function enableParallax() {
  const container = document.getElementById('three-canvas');
  if (!container || !glowMesh) return;
  
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    if (glowMesh.material.uniforms) {
      glowMesh.material.uniforms.uCenter.value.set(
        0.5 + x * 0.1,
        0.5 + y * 0.1
      );
    }
  });
}

// Initialize all animations
export function initAnimations() {
  // Anime.js animations
  if (typeof anime !== 'undefined') {
    animateLogoPulse();
  }
  
  // Three.js glow
  if (typeof THREE !== 'undefined') {
    initThreeGlow();
    enableParallax();
  }
}
