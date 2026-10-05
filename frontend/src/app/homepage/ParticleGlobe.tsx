'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ParticleGlobeProps {
  /** When true, finishes the loader sequence and prepares to transition to grid */
  active: boolean;
  /** When true, starts the morph from globe → 2D grid */
  morphToGrid?: boolean;
  /** Loading percentage (0 to 100) */
  loadPercent?: number;
  /** Called when the morph animation completes */
  onComplete?: () => void;
}

export default function ParticleGlobe({ active, morphToGrid = false, loadPercent = 100, onComplete }: ParticleGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Phase 1: Loader to Hero transition pause
  const transitionStartedRef = useRef(false);
  const transitionStartTimeRef = useRef(0);
  const transitionDoneRef = useRef(false);
  
  // Phase 2: Sphere -> Grid
  const gridMorphStartedRef = useRef(false);
  const gridMorphStartTimeRef = useRef(0);
  const gridMorphDoneRef = useRef(false);

  const activeRef = useRef(active);
  activeRef.current = active;
  
  const morphToGridRef = useRef(morphToGrid);
  morphToGridRef.current = morphToGrid;

  const loadPercentRef = useRef(loadPercent);
  loadPercentRef.current = loadPercent;
  
  const currentAssemblePercentRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // ---- Particle count & geometry ----
    const COUNT = 8000;
    const geometry = new THREE.BufferGeometry();

    const vFOV = (camera.fov * Math.PI) / 180;
    const halfHeight = Math.tan(vFOV / 2) * camera.position.z;
    const halfWidth = halfHeight * camera.aspect;

    const targetPositions = new Float32Array(COUNT * 3);
    const currentPositions = new Float32Array(COUNT * 3);
    const spawnPositions = new Float32Array(COUNT * 3);

    const SCATTER_Z_DEPTH = 6;
    for (let i = 0; i < COUNT; i++) {
      // Pick a random corner (0: Top-Left, 1: Top-Right, 2: Bottom-Left, 3: Bottom-Right)
      const corner = Math.floor(Math.random() * 4);
      const isRight = corner === 1 || corner === 3;
      const isTop = corner === 0 || corner === 1;
      
      // Push them slightly off-screen in the corners
      const baseX = isRight ? halfWidth * 1.5 : -halfWidth * 1.5;
      const baseY = isTop ? halfHeight * 1.5 : -halfHeight * 1.5;
      
      // Add some spread around the corners so they fly in dynamically
      spawnPositions[i * 3] = baseX + (Math.random() - 0.5) * halfWidth * 0.5;
      spawnPositions[i * 3 + 1] = baseY + (Math.random() - 0.5) * halfHeight * 0.5;
      spawnPositions[i * 3 + 2] = (Math.random() * 2 - 1) * SCATTER_Z_DEPTH;
    }

    // Target state: Fibonacci sphere
    const SPHERE_RADIUS = 4.5;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      targetPositions[i * 3] = x * SPHERE_RADIUS;
      targetPositions[i * 3 + 1] = y * SPHERE_RADIUS;
      targetPositions[i * 3 + 2] = z * SPHERE_RADIUS;
    }

    // Grid state: 2D Screen Grid (arranged in actual lines to mimic background SVG)
    const gridPositions = new Float32Array(COUNT * 3);
    const aspect = window.innerWidth / window.innerHeight;
    
    // We want a square grid. Let's make ~20 vertical lines and ~11 horizontal lines
    const vLines = 20;
    const hLines = Math.floor(vLines / aspect);
    const totalLines = vLines + hLines;
    const particlesPerLine = Math.floor(COUNT / totalLines);
    
    let pIdx = 0;
    
    // Horizontal lines
    for (let h = 0; h < hLines; h++) {
      const y = halfHeight - (h / (hLines - 1)) * (halfHeight * 2);
      for (let p = 0; p < particlesPerLine; p++) {
        if (pIdx >= COUNT) break;
        const x = -halfWidth + (p / (particlesPerLine - 1)) * (halfWidth * 2);
        gridPositions[pIdx * 3] = x;
        gridPositions[pIdx * 3 + 1] = y;
        gridPositions[pIdx * 3 + 2] = 0;
        pIdx++;
      }
    }
    
    // Vertical lines
    for (let v = 0; v < vLines; v++) {
      const x = -halfWidth + (v / (vLines - 1)) * (halfWidth * 2);
      for (let p = 0; p < particlesPerLine; p++) {
        if (pIdx >= COUNT) break;
        const y = halfHeight - (p / (particlesPerLine - 1)) * (halfHeight * 2);
        gridPositions[pIdx * 3] = x;
        gridPositions[pIdx * 3 + 1] = y;
        gridPositions[pIdx * 3 + 2] = 0;
        pIdx++;
      }
    }
    
    // Any leftovers just place randomly on the edge or fill
    for (; pIdx < COUNT; pIdx++) {
      gridPositions[pIdx * 3] = -halfWidth;
      gridPositions[pIdx * 3 + 1] = halfHeight;
      gridPositions[pIdx * 3 + 2] = 0;
    }

    // We initialize them at spawnPositions
    currentPositions.set(spawnPositions);
    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));

    // ---- Per-particle size + opacity ----
    const SCATTER_SIZE_MIN = 0.036;
    const SCATTER_SIZE_MAX = 0.24;
    const spawnSizes = new Float32Array(COUNT);
    const targetSizes = new Float32Array(COUNT);
    const spawnAlphas = new Float32Array(COUNT);
    const targetAlphas = new Float32Array(COUNT);
    const currentSizes = new Float32Array(COUNT);
    const currentAlphas = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const bias = Math.pow(Math.random(), 3);
      spawnSizes[i] = SCATTER_SIZE_MIN + bias * (SCATTER_SIZE_MAX - SCATTER_SIZE_MIN);
      targetSizes[i] = 0.06 + Math.random() * 0.025;

      spawnAlphas[i] = 0.85 - bias * 0.4 + Math.random() * 0.1;
      targetAlphas[i] = 0.7 + Math.random() * 0.15;
    }
    currentSizes.set(spawnSizes);
    currentAlphas.set(spawnAlphas);
    geometry.setAttribute('size', new THREE.BufferAttribute(currentSizes, 1));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(currentAlphas, 1));

    // Per-particle random drift
    const noisePhase = new Float32Array(COUNT * 3);
    const noiseSpeed = new Float32Array(COUNT);
    const noiseAmp = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      noisePhase[i * 3] = Math.random() * Math.PI * 2;
      noisePhase[i * 3 + 1] = Math.random() * Math.PI * 2;
      noisePhase[i * 3 + 2] = Math.random() * Math.PI * 2;
      noiseSpeed[i] = 0.375 + Math.random() * 0.75;
      noiseAmp[i] = 0.225 + Math.random() * 0.525;
    }
    const clock = new THREE.Clock();

    // Circular dot texture
    function createCircleTexture(): THREE.Texture {
      const size = 128;
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d')!;
      const gradient = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2
      );
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.65, 'rgba(255,255,255,1)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
      const tex = new THREE.CanvasTexture(c);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      return tex;
    }
    const circleTexture = createCircleTexture();

    // ---- Custom shader material ----
    const uScale = 0.5 * window.innerHeight * renderer.getPixelRatio();
    const material = new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: { value: circleTexture },
        uColor: { value: new THREE.Color('#9CA38F') },
        opacity: { value: 0.75 },
        uScale: { value: uScale },
      },
      vertexShader: `
        attribute float size;
        attribute float alpha;
        varying float vAlpha;
        uniform float uScale;
        void main() {
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (uScale / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        uniform vec3 uColor;
        uniform float opacity;
        varying float vAlpha;
        void main() {
          vec4 tex = texture2D(pointTexture, gl_PointCoord);
          if (tex.a < 0.08) discard;
          gl_FragColor = vec4(uColor, tex.a * opacity * vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // ---- Time-driven progress ----
    const TRANSITION_DURATION = 1.0; // 1s pause before hero transitions (added 0.5s delay)
    const GRID_MORPH_DURATION = 1.5; // seconds

    function easeInOutCubic(x: number) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.uScale.value = 0.5 * window.innerHeight * renderer.getPixelRatio();
    }

    window.addEventListener('resize', onResize);

    let frameId = 0;

    function animate() {
      frameId = requestAnimationFrame(animate);

      // Phase 1: Brief pause when active is true before transitioning hero
      let transitionRawProgress = 0;
      if (activeRef.current) {
        if (!transitionStartedRef.current) {
          transitionStartedRef.current = true;
          transitionStartTimeRef.current = performance.now();
        }
        const elapsed = (performance.now() - transitionStartTimeRef.current) / 1000;
        transitionRawProgress = Math.min(elapsed / TRANSITION_DURATION, 1);

        if (transitionRawProgress >= 1 && !transitionDoneRef.current) {
          transitionDoneRef.current = true;
          onComplete?.();
        }
      }

      // Phase 2: Sphere -> Grid
      let gridRawProgress = 0;
      if (morphToGridRef.current) {
        if (!gridMorphStartedRef.current) {
          gridMorphStartedRef.current = true;
          gridMorphStartTimeRef.current = performance.now();
        }
        const gridElapsed = (performance.now() - gridMorphStartTimeRef.current) / 1000;
        gridRawProgress = Math.min(gridElapsed / GRID_MORPH_DURATION, 1);
        
        if (gridRawProgress >= 1 && !gridMorphDoneRef.current) {
          gridMorphDoneRef.current = true;
        }
      }

      const gridEased = easeInOutCubic(gridRawProgress);
      
      // Calculate assemble progress (Spawn -> Sphere during load)
      const targetPercent = activeRef.current ? 100 : loadPercentRef.current;
      currentAssemblePercentRef.current += (targetPercent - currentAssemblePercentRef.current) * 0.015; 
      
      // Snap to 100 if we are close
      if (activeRef.current && currentAssemblePercentRef.current > 99.9) {
        currentAssemblePercentRef.current = 100;
      }
      
      const assembleProgress = currentAssemblePercentRef.current / 100;
      const assembleEased = 1 - Math.pow(1 - assembleProgress, 3);
      
      const t = clock.getElapsedTime();
      
      // Wiggle interpolation between full (corners) and minimal (sphere formed)
      const wiggle = (1.0 * (1 - assembleEased) + 0.05 * assembleEased) * (1 - gridEased);

      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const sizeAttr = geometry.attributes.size as THREE.BufferAttribute;
      const alphaAttr = geometry.attributes.alpha as THREE.BufferAttribute;
      
      for (let i = 0; i < COUNT; i++) {
        const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;

        // Base interpolation: Spawn -> Sphere (during load)
        const ax = spawnPositions[ix] * (1 - assembleEased) + targetPositions[ix] * assembleEased;
        const ay = spawnPositions[iy] * (1 - assembleEased) + targetPositions[iy] * assembleEased;
        const az = spawnPositions[iz] * (1 - assembleEased) + targetPositions[iz] * assembleEased;

        const dx = Math.sin(t * noiseSpeed[i] + noisePhase[ix]) * noiseAmp[i] * wiggle;
        const dy = Math.cos(t * noiseSpeed[i] * 1.3 + noisePhase[iy]) * noiseAmp[i] * wiggle;
        const dz = Math.sin(t * noiseSpeed[i] * 0.7 + noisePhase[iz]) * noiseAmp[i] * wiggle * 0.5;

        let finalX = ax + dx;
        let finalY = ay + dy;
        let finalZ = az + dz;

        // Apply Phase 2 interpolation (Sphere -> Grid)
        if (gridEased > 0) {
           finalX = finalX * (1 - gridEased) + gridPositions[ix] * gridEased;
           finalY = finalY * (1 - gridEased) + gridPositions[iy] * gridEased;
           finalZ = finalZ * (1 - gridEased) + gridPositions[iz] * gridEased;
        }

        posAttr.array[ix] = finalX;
        posAttr.array[iy] = finalY;
        posAttr.array[iz] = finalZ;

        sizeAttr.array[i] = spawnSizes[i] + (targetSizes[i] - spawnSizes[i]) * assembleEased;
        
        const baseAlpha = spawnAlphas[i] + (targetAlphas[i] - spawnAlphas[i]) * assembleEased;
        alphaAttr.array[i] = baseAlpha * (1 - gridEased * 0.8);
      }
      posAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      alphaAttr.needsUpdate = true;

      // Rotate continuously based on assembly progress, stop rotating when morphing to grid
      points.rotation.y = t * 0.1 * assembleEased * (1 - gridEased);

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      material.dispose();
      circleTexture.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
