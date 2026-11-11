import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SelectedComponents, CaseType, StorageDrive } from '../types/hardware';
import {
  Eye,
  RefreshCw,
  ZoomIn,
  Info,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  CircuitBoard,
  HardDrive,
  Maximize2,
  Sliders,
  Fan
} from 'lucide-react';

interface PCViewer3DProps {
  components: SelectedComponents;
  onSelectComponentType?: (type: string) => void;
}

export interface HoveredComponentInfo {
  type: string;
  name: string;
  details: string;
  specs: string[];
  status: 'optimal' | 'warning' | 'empty';
  x: number;
  y: number;
}

export const PCViewer3D: React.FC<PCViewer3DProps> = ({ components, onSelectComponentType }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredInfo, setHoveredInfo] = useState<HoveredComponentInfo | null>(null);
  const [glassOpen, setGlassOpen] = useState(false);
  const [viewPreset, setViewPreset] = useState<'iso' | 'side' | 'mobo' | 'front'>('iso');
  const [showSocketHud, setShowSocketHud] = useState(true);
  const [coolerDismounted, setCoolerDismounted] = useState(false);
  const fpsSpanRef = useRef<HTMLSpanElement>(null);

  // Three.js instances refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const partsGroupRef = useRef<THREE.Group | null>(null);
  const animatedFansRef = useRef<{ obj: THREE.Object3D; axis: 'x' | 'y' | 'z'; speed?: number }[]>([]);
  const caseEdgesRef = useRef<THREE.LineSegments[]>([]);
  const interactiveMeshesRef = useRef<THREE.Mesh[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  // Position anchors
  const moboAnchorRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0.9, z: -0.15 });

  // References for ultra-responsive 60 FPS hover tracking
  const psuMeshRef = useRef<THREE.Mesh | null>(null);
  const tooltipDivRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef(new THREE.Vector2(-999, -999));
  const mouseScreenRef = useRef({ x: 0, y: 0 });
  const mouseMovedRef = useRef(false);
  const activeHoveredObjRef = useRef<THREE.Object3D | null>(null);

  // Interactive Shroud Reveal Uniforms & Hover state (compact aperture radius)
  const shroudUniformsRef = useRef<{
    uMouseHit: { value: THREE.Vector3 };
    uHoverProgress: { value: number };
    uRadius: { value: number };
    uFeather: { value: number };
    uBorderColor: { value: THREE.Color };
    uBaseColor: { value: THREE.Color };
  }>({
    uMouseHit: { value: new THREE.Vector3(999, 999, 999) },
    uHoverProgress: { value: 0.0 },
    uRadius: { value: 0.18 }, // Compact X-ray inspection aperture
    uFeather: { value: 0.05 },
    uBorderColor: { value: new THREE.Color(0x00f0ff) },
    uBaseColor: { value: new THREE.Color(0x1e293b) }
  });
  const targetShroudHoverRef = useRef(0.0);

  // Determine case form factor
  const caseType: CaseType = components.caseItem?.caseType || 'mid_tower';

  // Process multi-storage drives
  const allDrives: StorageDrive[] = useMemo(() => {
    return components.storageDrives && components.storageDrives.length > 0
      ? components.storageDrives
      : components.storage
        ? [components.storage]
        : [];
  }, [components.storageDrives, components.storage]);

  const nvmeDrives: StorageDrive[] = useMemo(() => allDrives.filter((d: StorageDrive) => d.driveType === 'NVMe M.2'), [allDrives]);
  const sataDrives: StorageDrive[] = useMemo(() => allDrives.filter((d: StorageDrive) => d.driveType === 'SATA SSD'), [allDrives]);
  const hddDrives: StorageDrive[] = useMemo(() => allDrives.filter((d: StorageDrive) => d.driveType === 'HDD'), [allDrives]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. SCENE WITH CLEAN, BRIGHT STUDIO SCI-FI AMBIANCE
    const scene = new THREE.Scene();
    // Brighter studio tech background
    scene.background = new THREE.Color(0x0e1726);
    // Soft distant fog that doesn't darken the PC at all
    scene.fog = new THREE.Fog(0x0e1726, 12, 28);
    sceneRef.current = scene;

    // 2. CAMERA (Zoomed-out initial perspective for complete showcase framing)
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(4.3, 2.3, -1.9);
    cameraRef.current = camera;

    // 3. HARDWARE-ACCELERATED RENDERER (Optimized for maximum FPS)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
      stencil: false,
      depth: true,
      precision: 'highp'
    });
    renderer.setSize(width, height);
    // 1.0 pixel ratio for maximum frame rates across all GPU tiers and displays
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    // On-demand shadows: only re-compute shadow depth map when components change, saving massive GPU cycles per frame
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. ORBIT CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 7.5;
    controls.minDistance = 0.8;
    controls.maxPolarAngle = Math.PI / 2 + 0.22; // Allows low-angle hero view while keeping clean floor perspective
    controls.minPolarAngle = 0.05;
    controls.target.set(0, 0.9, 0);
    controls.update();
    controlsRef.current = controls;

    // 5. STUDIO LIGHTING RIG (Crisp, High-Clarity, Vibrant)
    // Ambient fill light: balanced cool slate
    const ambientLight = new THREE.AmbientLight(0x475569, 2.6);
    scene.add(ambientLight);

    // Key studio light: pure white spotlight from top-right-front
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(4, 9, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 512;
    keyLight.shadow.mapSize.height = 512;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Front fill light: ensures front and sides are never dark
    const frontFill = new THREE.DirectionalLight(0x93c5fd, 1.8);
    frontFill.position.set(-3, 4, 4);
    scene.add(frontFill);

    // Rim/Backlight for beautiful edge separation
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    rimLight.position.set(0, 6, -6);
    scene.add(rimLight);

    // Internal High-Intensity Case Light (Brightens all components directly inside the chamber)
    const chamberLight = new THREE.PointLight(0xffffff, 4.5, 3.8);
    chamberLight.position.set(0.1, 1.2, 0.2);
    scene.add(chamberLight);

    // Neon Accent Lights
    const cyanNeon = new THREE.PointLight(0x00f0ff, 3.2, 4.5);
    cyanNeon.position.set(0.3, 1.4, 0.4);
    scene.add(cyanNeon);

    const magentaNeon = new THREE.PointLight(0xd946ef, 2.8, 4.5);
    magentaNeon.position.set(-0.2, 0.6, 0.3);
    scene.add(magentaNeon);

    // 6. CYBERNETIC STUDIO GRID FLOOR
    const gridHelper = new THREE.GridHelper(18, 36, 0x00f0ff, 0x1e3a5f);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Reflective floor platform
    const floorGeo = new THREE.PlaneGeometry(18, 18);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x09101d,
      roughness: 0.15,
      metalness: 0.75
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Subtle, soft ambient contact shadow directly underneath the case
    const contactShadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.35
    });
    const contactShadow = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.set(0, 0.005, 0);
    scene.add(contactShadow);

    // 7. CONTAINER GROUP FOR PC PARTS
    const partsGroup = new THREE.Group();
    scene.add(partsGroup);
    partsGroupRef.current = partsGroup;

    // 8. RAYCASTER SETUP FOR HOVER WITH DYNAMIC GLOW HIGHLIGHT (DECOUPLED FOR LOCKED 60 FPS)
    const raycaster = new THREE.Raycaster();

    // Track currently highlighted meshes to restore when mouse moves away
    const highlightedMeshes: { mesh: THREE.Mesh; origEmissive: number; origIntensity: number }[] = [];

    const clearHighlight = () => {
      // Clear case edge lines
      for (const line of caseEdgesRef.current) {
        if (line.material) {
          (line.material as THREE.LineBasicMaterial).opacity = 0.0;
        }
      }
      for (const item of highlightedMeshes) {
        if (item.mesh && item.mesh.material && (item.mesh.material as THREE.MeshStandardMaterial).emissive) {
          const mat = item.mesh.material as THREE.MeshStandardMaterial;
          mat.emissive.setHex(item.origEmissive);
          mat.emissiveIntensity = item.origIntensity;
        }
      }
      highlightedMeshes.length = 0;
    };

    const applyHighlight = (root: THREE.Object3D) => {
      clearHighlight();

      // IF HOVERING THE CASE: Only highlight the 3D contour edge wireframe lines!
      if (root.userData?.isCase) {
        for (const line of caseEdgesRef.current) {
          if (line.material) {
            (line.material as THREE.LineBasicMaterial).opacity = 0.95;
          }
        }
        return;
      }

      // FOR INTERNAL COMPONENTS: Highlight component mesh
      root.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          if (m.material && (m.material as THREE.MeshStandardMaterial).emissive) {
            const mat = m.material as THREE.MeshStandardMaterial;
            highlightedMeshes.push({
              mesh: m,
              origEmissive: mat.emissive.getHex(),
              origIntensity: mat.emissiveIntensity || 0
            });
            // Bright electric cyan highlight pulse
            mat.emissive.setHex(0x00f0ff);
            mat.emissiveIntensity = 1.8;
          }
        }
      });
    };

    // Ultra-lightweight pointer listener: purely records position and updates tooltip transform
    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      mouseRef.current.x = (mouseX / rect.width) * 2 - 1;
      mouseRef.current.y = -(mouseY / rect.height) * 2 + 1;
      mouseScreenRef.current.x = mouseX;
      mouseScreenRef.current.y = mouseY;
      mouseMovedRef.current = true;

      // Update tooltip position via GPU-accelerated translate3d without React re-render
      if (tooltipDivRef.current) {
        const tx = Math.min(mouseX + 14, rect.width - 240);
        const ty = Math.max(10, Math.min(mouseY - 26, rect.height - 50));
        tooltipDivRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }
    };

    const onPointerLeave = () => {
      clearHighlight();
      activeHoveredObjRef.current = null;
      setHoveredInfo(null);
      targetShroudHoverRef.current = 0.0;
      mouseMovedRef.current = false;
      container.style.cursor = 'default';
    };

    container.addEventListener('mousemove', onPointerMove, { passive: true });
    container.addEventListener('mouseleave', onPointerLeave);

    // 9. ANIMATION LOOP (LOCKED TO 60 FPS WITH DELTA TIME)
    const clock = new THREE.Clock();
    let frameCounter = 0;
    let prevFpsTime = performance.now();
    let lastRaycastTime = 0;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Track real FPS smoothly every 500ms
      frameCounter++;
      const now = performance.now();
      if (now >= prevFpsTime + 500) {
        const rawFps = Math.round((frameCounter * 1000) / (now - prevFpsTime));
        if (fpsSpanRef.current) {
          fpsSpanRef.current.textContent = `${rawFps} FPS`;
        }
        frameCounter = 0;
        prevFpsTime = now;
      }

      // Smooth fan rotation on the correct physical rotation axis
      const fanDelta = delta * 5.2;
      for (const fan of animatedFansRef.current) {
        if (fan.axis === 'x') fan.obj.rotation.x += fanDelta * (fan.speed || 1.0);
        else if (fan.axis === 'y') fan.obj.rotation.y += fanDelta * (fan.speed || 1.0);
        else fan.obj.rotation.z += fanDelta * (fan.speed || 1.0);
      }

      // Raycasting throttled to ~35Hz to eliminate frame drops during rapid mouse swipes
      if (mouseMovedRef.current && now - lastRaycastTime >= 28) {
        lastRaycastTime = now;
        mouseMovedRef.current = false;
        raycaster.setFromCamera(mouseRef.current, camera);
        const intersects = raycaster.intersectObjects(interactiveMeshesRef.current, true);

        // Check for PSU Shroud / Lower Panel Hover for Spherical X-Ray Reveal
        let isHoveringShroud = false;
        let shroudHitPoint: THREE.Vector3 | null = null;
        for (const hit of intersects) {
          if (hit.object.userData?.isShroudSide || hit.object.userData?.isPsu) {
            isHoveringShroud = true;
            shroudHitPoint = hit.point;
            break;
          }
        }

        if (isHoveringShroud && shroudHitPoint) {
          targetShroudHoverRef.current = 1.0;
          shroudUniformsRef.current.uMouseHit.value.copy(shroudHitPoint);
        } else {
          targetShroudHoverRef.current = 0.0;
        }

        let foundObj: THREE.Object3D | null = null;
        if (intersects.length > 0) {
          let topObj: THREE.Object3D | null = intersects[0].object;

          // If cursor is over shroud panel, look through to internal basement items (HDDs, PSU)
          if (topObj && (topObj.userData?.isShroudSide || topObj.userData?.isPsu)) {
            // Find any specific internal component penetrated by the ray (e.g. HDD bay or PSU)
            let internalHitObj: THREE.Object3D | null = null;
            for (const hit of intersects) {
              if (hit.object.userData?.componentType && !hit.object.userData?.isShroudSide) {
                internalHitObj = hit.object;
                break;
              }
            }

            if (internalHitObj) {
              topObj = internalHitObj;
            } else if (shroudHitPoint && shroudHitPoint.z < -0.15 && hddDrives.length > 0) {
              // Mouse is over front basement where HDDs are installed
              topObj = interactiveMeshesRef.current.find(m => m.userData?.componentType?.includes('HDD')) || psuMeshRef.current;
            } else {
              topObj = psuMeshRef.current;
            }
          } else {
            while (topObj && !topObj.userData?.componentType && topObj.parent && topObj.parent !== partsGroupRef.current) {
              topObj = topObj.parent;
            }
          }

          if (topObj && topObj.userData?.componentType) {
            foundObj = topObj;
          }
        }

        // Only update React state and highlight if the hovered component actually CHANGED
        if (foundObj !== activeHoveredObjRef.current) {
          activeHoveredObjRef.current = foundObj;
          if (foundObj) {
            applyHighlight(foundObj);
            const ud = foundObj.userData;
            setHoveredInfo({
              type: ud.componentType,
              name: ud.name,
              details: ud.details || '',
              specs: [],
              status: ud.status || 'optimal',
              x: mouseScreenRef.current.x,
              y: mouseScreenRef.current.y
            });
            container.style.cursor = 'pointer';
          } else {
            clearHighlight();
            setHoveredInfo(null);
            container.style.cursor = 'default';
          }
        }
      }

      // Smoothly animate dynamic spherical shroud reveal transition
      const curHover = shroudUniformsRef.current.uHoverProgress.value;
      const targetHover = targetShroudHoverRef.current;
      shroudUniformsRef.current.uHoverProgress.value += (targetHover - curHover) * Math.min(1.0, delta * 9.0);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      renderer.render(scene, camera);
    };
    animate();

    // 10. RESIZE LISTENER
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onPointerMove);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Re-build 3D scene when components or presets change
  useEffect(() => {
    if (!partsGroupRef.current || !sceneRef.current) return;
    const group = partsGroupRef.current;

    // Clear previous build
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
    }
    animatedFansRef.current = [];
    interactiveMeshesRef.current = [];
    caseEdgesRef.current = [];

    // Scale & dimensions based on Case Type
    let caseWidth = 0.95;
    let caseHeight = 1.85;
    let caseDepth = 1.95;

    if (caseType === 'mini_tower') {
      caseWidth = 0.82;
      caseHeight = 1.48;
      caseDepth = 1.62;
    } else if (caseType === 'full_tower') {
      caseWidth = 1.08;
      caseHeight = 2.15;
      caseDepth = 2.25;
    }

    const caseCenterY = caseHeight / 2 + 0.12;

    // Material helpers: Brushed Metallic Titanium with Irregular Chamfers
    const chassisMetalMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Gunmetal brushed titanium
      metalness: 0.92,
      roughness: 0.32
    });

    const chassisAccentMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Lighter metallic faceted panels
      metalness: 0.95,
      roughness: 0.28
    });

    const interiorTrayMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.35
    });

    const neonCyanMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.1,
      roughness: 0.1
    });

    const neonMagentaMat = new THREE.MeshStandardMaterial({
      color: 0xd946ef,
      emissive: 0xd946ef,
      emissiveIntensity: 1.0,
      roughness: 0.1
    });

    const neonAmberMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.9,
      roughness: 0.1
    });

    const goldContactsMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.95,
      roughness: 0.15
    });

    const silverMetalMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.2
    });

    // Helper to generate a realistic circular turbine fan with angled aerodynamic blades (replaces spinning boxes)
    const createRealisticFan = (
      outerSize: number,
      depth: number,
      bladeCount = 7,
      accentColor = 0x1e293b,
      hubRadiusRatio = 0.38
    ) => {
      const fanGroup = new THREE.Group();
      const radius = outerSize / 2;

      // Central circular cylinder hub
      const hubGeo = new THREE.CylinderGeometry(radius * hubRadiusRatio, radius * hubRadiusRatio, depth * 0.9, 16);
      const hubMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.25 });
      const hubMesh = new THREE.Mesh(hubGeo, hubMat);
      hubMesh.rotation.x = Math.PI / 2;
      fanGroup.add(hubMesh);

      // Radial aerodynamic angled blades
      const bladeMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        metalness: 0.7,
        roughness: 0.35
      });
      const bladeLen = radius * (1 - hubRadiusRatio) * 0.92;
      const bladeGeo = new THREE.BoxGeometry(depth * 0.5, bladeLen, 0.008);

      for (let b = 0; b < bladeCount; b++) {
        const angle = (b * Math.PI * 2) / bladeCount;
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        const dist = radius * (hubRadiusRatio + (1 - hubRadiusRatio) * 0.5);
        blade.position.set(Math.cos(angle) * dist, Math.sin(angle) * dist, 0);
        blade.rotation.z = angle + Math.PI / 2;
        blade.rotation.y = Math.PI / 5; // Aerodynamic pitch
        fanGroup.add(blade);
      }
      return fanGroup;
    };

    // ==========================================
    // A. CHASSIS / GABINETE CON SUPERFICIES METÁLICAS IRREGULARES
    // ==========================================
    const caseGroup = new THREE.Group();
    caseGroup.position.set(0, caseCenterY, 0);

    const halfW = caseWidth / 2;
    const halfD = caseDepth / 2;
    const halfH = caseHeight / 2;

    // Shared edge line material for wireframe contour highlight on hover only
    const edgeLineMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.0
    });

    // Helper to register case panels with edge wireframes
    const addCaseMeshWithEdges = (mesh: THREE.Mesh, isInteractive = true) => {
      mesh.userData = {
        isCase: true,
        componentType: 'Gabinete (Case)',
        name: components.caseItem ? `${components.caseItem.brand} ${components.caseItem.model}` : 'Gabinete Metálico',
        details: `Formato: ${caseType.toUpperCase().replace('_', ' ')} • Chasis Metálico Titanio`,
        specs: [
          `Tipo de Torre: ${caseType === 'mini_tower' ? 'Mini Tower (Compacto)' : caseType === 'mid_tower' ? 'Mid Tower (Estándar)' : 'Full Tower (Gran volumen)'}`,
          `GPU máx: ${components.caseItem?.maxGpuLengthMm || 365} mm`,
          `Cooler máx: ${components.caseItem?.maxCoolerHeightMm || 165} mm`,
          `Acabado: Titanio Cepillado con Bordes Biselados`
        ],
        status: 'optimal'
      };
      caseGroup.add(mesh);

      // Wireframe edge lines that light up on hover without affecting the metallic solid body
      const edgeGeo = new THREE.EdgesGeometry(mesh.geometry);
      const edgeLines = new THREE.LineSegments(edgeGeo, edgeLineMat);
      edgeLines.position.copy(mesh.position);
      edgeLines.rotation.copy(mesh.rotation);
      caseGroup.add(edgeLines);
      caseEdgesRef.current.push(edgeLines);
      if (isInteractive) {
        interactiveMeshesRef.current.push(mesh);
      }
    };

    // Frame pillars (Chamfered metallic pillars - visual only)
    const pillarGeo = new THREE.BoxGeometry(0.045, caseHeight, 0.045);
    const corners = [
      [-halfW, -halfD],
      [halfW, -halfD],
      [-halfW, halfD],
      [halfW, halfD]
    ];
    for (const [cx, cz] of corners) {
      const pillar = new THREE.Mesh(pillarGeo, chassisMetalMat);
      pillar.position.set(cx, 0, cz);
      addCaseMeshWithEdges(pillar, false);
    }

    // Top & Bottom panels with irregular chamfered bevels
    const topPlate = new THREE.Mesh(new THREE.BoxGeometry(caseWidth, 0.045, caseDepth), chassisMetalMat);
    topPlate.position.set(0, halfH, 0);
    addCaseMeshWithEdges(topPlate, true);

    const bottomPlate = new THREE.Mesh(new THREE.BoxGeometry(caseWidth, 0.045, caseDepth), chassisMetalMat);
    bottomPlate.position.set(0, -halfH, 0);
    addCaseMeshWithEdges(bottomPlate, true);

    // Irregular top ventilation louvers / faceted metallic slats (visual only)
    for (let v = -halfD * 0.65; v <= halfD * 0.65; v += 0.24) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(caseWidth * 0.65, 0.015, 0.08), chassisAccentMat);
      slat.position.set(0, halfH + 0.015, v);
      addCaseMeshWithEdges(slat, false);
    }

    // Rear panel with I/O and fan cutout (at +halfD, placing motherboard and rear ports on the LEFT)
    const rearPlate = new THREE.Mesh(new THREE.BoxGeometry(caseWidth, caseHeight, 0.03), chassisMetalMat);
    rearPlate.position.set(0, 0, halfD);
    addCaseMeshWithEdges(rearPlate, true);

    // PSU Basement / Shroud (Hollow lower compartment with dynamic spherical X-Ray reveal)
    const shroudHeight = 0.38;
    const shroudDeckY = -halfH + shroudHeight - 0.01;

    // 1. Shroud Top Deck (Horizontal floor supporting cable grommets and motherboard above)
    const shroudDeck = new THREE.Mesh(
      new THREE.BoxGeometry(caseWidth - 0.04, 0.02, caseDepth - 0.06),
      interiorTrayMat
    );
    shroudDeck.position.set(0, shroudDeckY, 0);
    addCaseMeshWithEdges(shroudDeck, false);

    // Cable pass-through rubber grommets on shroud deck
    for (const gz of [-0.25, 0.2]) {
      const grommet = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.025, 0.16),
        new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9 })
      );
      grommet.position.set(-0.12, shroudDeckY + 0.005, gz);
      caseGroup.add(grommet);
    }

    // 2. Shroud Front Wall (Vertical partition behind front fans at -halfD)
    const shroudFront = new THREE.Mesh(
      new THREE.BoxGeometry(caseWidth - 0.04, shroudHeight, 0.02),
      interiorTrayMat
    );
    shroudFront.position.set(0, -halfH + shroudHeight / 2, -halfD + 0.04);
    addCaseMeshWithEdges(shroudFront, false);

    // 3. Shroud Side Panel (Facing glass with spherical blur & neon border X-Ray reveal)
    const shroudSideMat = new THREE.ShaderMaterial({
      uniforms: {
        uMouseHit: shroudUniformsRef.current.uMouseHit,
        uHoverProgress: shroudUniformsRef.current.uHoverProgress,
        uRadius: shroudUniformsRef.current.uRadius,
        uFeather: shroudUniformsRef.current.uFeather,
        uBorderColor: shroudUniformsRef.current.uBorderColor,
        uBaseColor: shroudUniformsRef.current.uBaseColor
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        uniform vec3 uMouseHit;
        uniform float uHoverProgress;
        uniform float uRadius;
        uniform float uFeather;
        uniform vec3 uBorderColor;
        uniform vec3 uBaseColor;

        void main() {
          if (uHoverProgress <= 0.005) {
            gl_FragColor = vec4(uBaseColor * 0.72, 0.96);
            return;
          }
          float dist = distance(vWorldPosition, uMouseHit);
          // Compact spherical reveal with soft feathered blur edge
          float inside = smoothstep(uRadius + uFeather, uRadius - uFeather, dist) * uHoverProgress;
          
          // Aesthetic glowing neon border ringing the spherical reveal boundary
          float border = smoothstep(uRadius + uFeather * 1.1, uRadius, dist) * smoothstep(uRadius - uFeather * 1.4, uRadius, dist) * uHoverProgress;

          // Subtle metallic lighting
          vec3 lightDir = normalize(vec3(1.0, 1.5, 2.0));
          float diff = max(dot(vNormal, lightDir), 0.0) * 0.35 + 0.65;
          vec3 col = uBaseColor * diff;

          // Blend neon rim
          col = mix(col, uBorderColor * 2.0, border * 0.95);

          // Alpha transparency: solid (1.0) outside, highly transparent (0.04) inside spherical reveal
          float alpha = mix(1.0, 0.04, inside);
          alpha = max(alpha, border * 0.9);

          // Discard center of aperture so depth buffer permits full internal inspection
          if (alpha < 0.12) {
            discard;
          }

          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: true,
      side: THREE.DoubleSide
    });

    const shroudSide = new THREE.Mesh(
      new THREE.BoxGeometry(0.016, shroudHeight - 0.01, caseDepth - 0.06),
      shroudSideMat
    );
    shroudSide.position.set(halfW - 0.02, -halfH + shroudHeight / 2, 0);
    shroudSide.renderOrder = 5;
    // Pure inspection aperture trigger: no bulky "panel" tooltip
    shroudSide.userData = {
      isShroudSide: true
    };
    caseGroup.add(shroudSide);
    interactiveMeshesRef.current.push(shroudSide);

    // Front Panel (at -halfD, placed on the RIGHT side of the view)
    if (caseType === 'mini_tower') {
      // Mini Tower: Compact micro-mesh front panel with chamfered border
      const frontMesh = new THREE.Mesh(
        new THREE.BoxGeometry(caseWidth - 0.06, caseHeight - 0.08, 0.025),
        chassisAccentMat
      );
      frontMesh.position.set(0, 0, -halfD);
      addCaseMeshWithEdges(frontMesh);
    } else if (caseType === 'mid_tower') {
      // Mid Tower: Angular geometric 45° beveled facade with air intake slats
      const frontCenter = new THREE.Mesh(
        new THREE.BoxGeometry(caseWidth * 0.72, caseHeight - 0.08, 0.03),
        chassisMetalMat
      );
      frontCenter.position.set(0, 0, -halfD - 0.01);
      addCaseMeshWithEdges(frontCenter);

      // Angled side bevels
      for (const side of [-1, 1]) {
        const sideBevel = new THREE.Mesh(
          new THREE.BoxGeometry(caseWidth * 0.15, caseHeight - 0.1, 0.025),
          chassisAccentMat
        );
        sideBevel.position.set(side * (halfW - 0.08), 0, -halfD);
        addCaseMeshWithEdges(sideBevel);
      }
    } else {
      // Full Tower: Dual-pillar brushed aluminum front with expansive ventilation
      const frontLeft = new THREE.Mesh(
        new THREE.BoxGeometry(caseWidth * 0.2, caseHeight - 0.06, 0.04),
        chassisMetalMat
      );
      frontLeft.position.set(-halfW + 0.12, 0, -halfD - 0.01);
      addCaseMeshWithEdges(frontLeft);

      const frontRight = new THREE.Mesh(
        new THREE.BoxGeometry(caseWidth * 0.65, caseHeight - 0.08, 0.02),
        chassisAccentMat
      );
      frontRight.position.set(halfW * 0.28, 0, -halfD);
      addCaseMeshWithEdges(frontRight);
    }

    // Tempered Glass Panel (Ultra clear or swung open)
    const isMoboView = viewPreset === 'mobo';
    const effectiveGlassOpen = glassOpen || isMoboView; // Automatically open during socket close-up

    const glassThickness = 0.015;
    const glassGeo = new THREE.BoxGeometry(glassThickness, caseHeight - 0.06, caseDepth - 0.06);
    // Optimized high-performance glass material (zero framebuffer transmission cost for locked 60 FPS)
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      metalness: 0.1,
      roughness: 0.04,
      transparent: true,
      depthWrite: false, // Ensures internal panels like PSU shroud never clip when viewed from below
      opacity: effectiveGlassOpen ? 0.03 : 0.16
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.renderOrder = 20; // Renders after all interior parts to prevent depth sort glitches
    if (effectiveGlassOpen) {
      glassMesh.position.set(halfW + 0.55, 0, -halfD * 0.4);
      glassMesh.rotation.y = Math.PI / 3.5;
    } else {
      glassMesh.position.set(halfW, 0, 0);
      glassMesh.rotation.y = 0;
    }
    caseGroup.add(glassMesh);

    group.add(caseGroup);

    // ==========================================
    // B. PLACA MADRE (MOTHERBOARD) DETALLADA (A LA IZQUIERDA)
    // ==========================================
    const moboWidth = caseType === 'mini_tower' ? 0.78 : 0.94;
    const moboHeight = caseType === 'mini_tower' ? 0.82 : 1.04;
    const shroudTopWorldY = caseCenterY - halfH + shroudHeight;
    const moboBottomWorldY = shroudTopWorldY + 0.04; // Sits neatly 4cm above the PSU shroud deck
    const moboY = moboBottomWorldY + moboHeight / 2;
    // Align flush with rear I/O plate at +halfD (realistically positioned on the LEFT of the view)
    const moboZ = halfD - 0.08 - moboWidth / 2;
    const moboX = -halfW + 0.07;

    moboAnchorRef.current = { x: moboX, y: moboY, z: moboZ };

    // 1. Motherboard PCB Base (Matte dark blue/black with sharp contrast)
    const moboGeo = new THREE.BoxGeometry(0.02, moboHeight, moboWidth);
    const moboMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.55
    });
    const moboMesh = new THREE.Mesh(moboGeo, moboMat);
    moboMesh.position.set(moboX, moboY, moboZ);
    moboMesh.receiveShadow = true;

    // Glowing Neon Circuit Traces on PCB
    const traceGeo = new THREE.BoxGeometry(0.022, moboHeight * 0.94, moboWidth * 0.9);
    const traceMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0284c7,
      emissiveIntensity: 0.55,
      wireframe: true
    });
    const traces = new THREE.Mesh(traceGeo, traceMat);
    traces.position.set(moboX + 0.002, moboY, moboZ);
    group.add(traces);

    // 2. Rear I/O Armor Shield (Silver metallic block at back / +halfD)
    const ioShieldGeo = new THREE.BoxGeometry(0.08, 0.42, 0.14);
    const ioShield = new THREE.Mesh(ioShieldGeo, silverMetalMat);
    ioShield.position.set(moboX + 0.04, moboY + 0.25, moboZ + moboWidth / 2 - 0.08);
    group.add(ioShield);

    // 3. VRM Heatsinks (Fins around CPU socket)
    const vrmTop = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.1, 0.32), chassisMetalMat);
    vrmTop.position.set(moboX + 0.04, moboY + 0.36, moboZ + 0.08);
    group.add(vrmTop);

    // 4. Chipset Heatsink with Neon Logo (Bottom front towards -Z)
    const chipsetGeo = new THREE.BoxGeometry(0.05, 0.16, 0.20);
    const chipset = new THREE.Mesh(chipsetGeo, chassisMetalMat);
    chipset.position.set(moboX + 0.03, moboY - 0.28, moboZ - 0.22);
    group.add(chipset);

    const chipNeon = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.02, 0.14), neonCyanMat);
    chipNeon.position.set(moboX + 0.03, moboY - 0.28, moboZ - 0.22);
    group.add(chipNeon);

    // 5. PCIe Slots (Reinforced Steel Armor extending forward)
    for (let p = 0; p < 2; p++) {
      const pcieY = moboY - 0.14 - p * 0.22;
      const pcieSlot = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.03, 0.52), silverMetalMat);
      pcieSlot.position.set(moboX + 0.02, pcieY, moboZ - 0.05);
      group.add(pcieSlot);
    }

    moboMesh.userData = {
      componentType: 'Placa Madre (Motherboard)',
      name: components.motherboard ? `${components.motherboard.brand} ${components.motherboard.model}` : 'Placa Madre Estándar',
      details: components.motherboard ? `Chipset ${components.motherboard.chipset} • Socket ${components.motherboard.socket}` : 'Selecciona una placa base',
      specs: components.motherboard ? [
        `Formato: ${components.motherboard.formFactor}`,
        `Tipo de Memoria: ${components.motherboard.memoryType} (${components.motherboard.memorySlots} slots DIMM)`,
        `Fases VRM: Nivel ${components.motherboard.vrmQualityTier}`,
        `Ranuras M.2 NVMe: ${components.motherboard.m2Slots} puertos disponibles`
      ] : ['Requiere placa madre compatible'],
      status: components.motherboard ? 'optimal' : 'empty'
    };
    interactiveMeshesRef.current.push(moboMesh);
    group.add(moboMesh);

    // ==========================================
    // C. SOCKET CPU Y PROCESADOR (ALTO DETALLE)
    // ==========================================
    const cpuY = moboY + 0.18;
    const cpuZ = moboZ + 0.08;
    const cpuX = moboX + 0.025;

    // Metal Socket Housing & Retention Bracket
    const socketBase = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.22, 0.22), chassisMetalMat);
    socketBase.position.set(cpuX - 0.005, cpuY, cpuZ);
    group.add(socketBase);

    // Socket Lever (Palanca metálica de retención)
    const leverGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.24);
    const socketLever = new THREE.Mesh(leverGeo, silverMetalMat);
    socketLever.position.set(cpuX + 0.01, cpuY, cpuZ + 0.12);
    group.add(socketLever);

    // CPU Integrated Heat Spreader (IHS)
    const cpuGeo = new THREE.BoxGeometry(0.02, 0.17, 0.17);
    const cpuMat = components.cpu
      ? new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.95, roughness: 0.18 })
      : new THREE.MeshStandardMaterial({ color: 0x334155, wireframe: true });
    const cpuMesh = new THREE.Mesh(cpuGeo, cpuMat);
    cpuMesh.position.set(cpuX + 0.008, cpuY, cpuZ);

    // Serigrafía / Logo del CPU con neón sutil
    if (components.cpu) {
      const ihsLabel = new THREE.Mesh(
        new THREE.BoxGeometry(0.022, 0.09, 0.09),
        new THREE.MeshStandardMaterial({
          color: components.cpu.brand === 'Intel' ? 0x0284c7 : 0xe11d48,
          emissive: components.cpu.brand === 'Intel' ? 0x0284c7 : 0xe11d48,
          emissiveIntensity: 0.4
        })
      );
      ihsLabel.position.set(cpuX + 0.008, cpuY, cpuZ);
      group.add(ihsLabel);
    }

    cpuMesh.userData = {
      componentType: 'Procesador (CPU)',
      name: components.cpu ? `${components.cpu.brand} ${components.cpu.model}` : 'Socket CPU Vacío',
      details: components.cpu ? `${components.cpu.socket} • ${components.cpu.cores} Cores / ${components.cpu.threads} Hilos` : 'Haz clic para elegir procesador',
      specs: components.cpu ? [
        `Frecuencia Boost: ${components.cpu.boostClockGhz} GHz`,
        `Consumo TDP Base: ${components.cpu.tdpWatts} W`,
        `Potencia Pico Máxima: ${components.cpu.maxPowerWatts || components.cpu.tdpWatts} W`,
        `Puntuación IPC Gaming: ${components.cpu.cpuScoreSingle}/100`
      ] : ['Ranura de CPU lista para instalar'],
      status: components.cpu ? 'optimal' : 'empty'
    };
    interactiveMeshesRef.current.push(cpuMesh);
    group.add(cpuMesh);

    // ==========================================
    // D. SOCKETS DE RAM Y MÓDULOS (4 SLOTS DIMM REALES, A LA DERECHA DEL CPU)
    // ==========================================
    const ramZBase = cpuZ - 0.16;
    const totalDimmSlots = 4;
    const ramModuleCount = components.ram ? components.ram.modulesCount : 0;

    // Render 4 physical DIMM slots with latch clips
    for (let slotIdx = 0; slotIdx < totalDimmSlots; slotIdx++) {
      const slotZ = ramZBase - slotIdx * 0.038;

      // 1. Black/Grey plastic DIMM slot channel
      const slotChannelGeo = new THREE.BoxGeometry(0.035, 0.28, 0.022);
      const slotChannelMat = new THREE.MeshStandardMaterial({
        color: slotIdx % 2 === 1 ? 0x1e293b : 0x0f172a, // Alternate channel colors (Dual Channel A2 / B2)
        metalness: 0.7,
        roughness: 0.4
      });
      const dimmSlot = new THREE.Mesh(slotChannelGeo, slotChannelMat);
      dimmSlot.position.set(cpuX + 0.015, cpuY, slotZ);
      group.add(dimmSlot);

      // Top and Bottom White Locking Latches (Pestañas de anclaje)
      const latchGeo = new THREE.BoxGeometry(0.04, 0.025, 0.02);
      const latchTop = new THREE.Mesh(latchGeo, silverMetalMat);
      latchTop.position.set(cpuX + 0.018, cpuY + 0.14, slotZ);
      group.add(latchTop);

      const latchBottom = new THREE.Mesh(latchGeo, silverMetalMat);
      latchBottom.position.set(cpuX + 0.018, cpuY - 0.14, slotZ);
      group.add(latchBottom);

      // Determine if a RAM module is seated in this slot:
      // In 2-stick kits, standard dual-channel is Slot 2 and Slot 4 (indices 1 and 3)
      const isStickPresent =
        ramModuleCount === 4 ||
        (ramModuleCount === 2 && (slotIdx === 1 || slotIdx === 3)) ||
        (ramModuleCount === 1 && slotIdx === 1);

      if (isStickPresent && components.ram) {
        // Detailed RAM Stick inserted
        const ramStickGeo = new THREE.BoxGeometry(0.045, 0.24, 0.016);
        const ramStickMat = new THREE.MeshStandardMaterial({
          color: 0x18181b,
          metalness: 0.9,
          roughness: 0.2
        });
        const ramStick = new THREE.Mesh(ramStickGeo, ramStickMat);
        ramStick.position.set(cpuX + 0.032, cpuY, slotZ);

        // Gold connector pins at base
        const pinStrip = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.02, 0.018), goldContactsMat);
        pinStrip.position.set(cpuX + 0.02, cpuY - 0.12, slotZ);
        group.add(pinStrip);

        // Top ARGB Glowing Lightbar on RAM
        const lightbarGeo = new THREE.BoxGeometry(0.05, 0.028, 0.016);
        const lightbar = new THREE.Mesh(lightbarGeo, slotIdx % 2 === 1 ? neonCyanMat : neonMagentaMat);
        lightbar.position.set(cpuX + 0.035, cpuY + 0.125, slotZ);
        group.add(lightbar);

        ramStick.userData = {
          componentType: `Memoria RAM (Slot DIMM_${slotIdx + 1})`,
          name: `${components.ram.brand} ${components.ram.model}`,
          details: `Canal ${slotIdx % 2 === 1 ? 'Primario (Dual Channel)' : 'Secundario'} • ${components.ram.memoryType}`,
          specs: [
            `Capacidad del Módulo: ${components.ram.capacityGb / components.ram.modulesCount} GB`,
            `Frecuencia: ${components.ram.speedMhz} MHz`,
            `Latencia: CL${components.ram.casLatency}`,
            `Ranura: DIMM_${slotIdx + 1} (Fijado con latches)`
          ],
          status: 'optimal'
        };
        interactiveMeshesRef.current.push(ramStick);
        group.add(ramStick);
      } else {
        // Empty slot tooltip
        dimmSlot.userData = {
          componentType: `Ranura RAM (Slot DIMM_${slotIdx + 1})`,
          name: `Ranura DIMM_${slotIdx + 1} Vacía`,
          details: `Compatible con memorias ${components.motherboard?.memoryType || 'DDR4 / DDR5'}`,
          specs: [
            `Canal: ${slotIdx % 2 === 1 ? 'Recomendado para Dual Channel (A2/B2)' : 'Canal Secundario'}`,
            `Estado: Libre para expansión de memoria`
          ],
          status: 'empty'
        };
        interactiveMeshesRef.current.push(dimmSlot);
      }
    }

    // ==========================================
    // E. ALMACENAMIENTO Y RANURAS (NVMe M.2_1, M.2_2, SATA SSD 2.5'' Y HDD 3.5'')
    // ==========================================
    // Slot M.2_1: Just below the CPU socket and above primary PCIe
    const m2_1_Y = cpuY - 0.15;
    const m2_1_Z = moboZ + 0.02;

    // Metal Header Connector
    const m2Header = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.04), chassisMetalMat);
    m2Header.position.set(moboX + 0.02, m2_1_Y, m2_1_Z + 0.12);
    group.add(m2Header);

    // Standoff screw at 2280 distance
    const m2Screw = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 12), silverMetalMat);
    m2Screw.position.set(moboX + 0.02, m2_1_Y, m2_1_Z - 0.12);
    group.add(m2Screw);

    const primaryNvme = nvmeDrives[0];
    if (primaryNvme) {
      // Installed M.2 2280 Card with Controller + NAND + Thermal Heatsink
      const m2CardGeo = new THREE.BoxGeometry(0.025, 0.045, 0.22);
      const m2CardMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.9,
        roughness: 0.2
      });
      const m2Card = new THREE.Mesh(m2CardGeo, m2CardMat);
      m2Card.position.set(moboX + 0.026, m2_1_Y, m2_1_Z);

      // Metallic Thermal Shield with Neon Strip
      const shieldGeo = new THREE.BoxGeometry(0.028, 0.035, 0.2);
      const shieldMesh = new THREE.Mesh(shieldGeo, silverMetalMat);
      shieldMesh.position.set(moboX + 0.03, m2_1_Y, m2_1_Z);
      group.add(shieldMesh);

      const m2Led = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.008, 0.14), neonCyanMat);
      m2Led.position.set(moboX + 0.032, m2_1_Y, m2_1_Z);
      group.add(m2Led);

      const primaryNvmeData = {
        componentType: 'Almacenamiento (Slot M.2_1 NVMe)',
        name: `${primaryNvme.brand} ${primaryNvme.model}`,
        details: `${primaryNvme.driveType} • ${primaryNvme.capacityGb >= 1000 ? `${primaryNvme.capacityGb / 1000}TB` : `${primaryNvme.capacityGb}GB`}`,
        specs: [
          `Velocidad de Lectura: ${primaryNvme.readSpeedMbps} MB/s`,
          `Formato: M.2 2280 NVMe PCIe 4.0 / 5.0`,
          `Ubicación: Ranura Primaria M.2_1 (Líneas CPU)`
        ],
        status: 'optimal'
      };
      m2Card.userData = primaryNvmeData;
      shieldMesh.userData = primaryNvmeData;
      m2Led.userData = primaryNvmeData;
      interactiveMeshesRef.current.push(m2Card, shieldMesh, m2Led);
      group.add(m2Card);
    } else {
      // Empty M.2 slot outline
      const emptyM2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.04, 0.22),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, wireframe: true })
      );
      emptyM2.position.set(moboX + 0.022, m2_1_Y, m2_1_Z);
      emptyM2.userData = {
        componentType: 'Ranura M.2 NVMe (M.2_1)',
        name: 'Ranura M.2_1 NVMe Disponible',
        details: 'Admite unidades SSD M.2 formato 2280 PCIe 4.0/5.0',
        specs: ['Conexión directa al procesador para máxima velocidad'],
        status: 'empty'
      };
      interactiveMeshesRef.current.push(emptyM2);
      group.add(emptyM2);
    }

    // Secondary M.2 Slot (M.2_2 below chipset)
    const m2_2_Y = moboY - 0.30;
    const m2_2_Z = moboZ - 0.02;
    const secondaryNvme = nvmeDrives[1];

    if (secondaryNvme) {
      // Installed Secondary M.2 2280
      const m2_2_Geo = new THREE.BoxGeometry(0.025, 0.045, 0.22);
      const m2_2_Mat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.25 });
      const m2_2_Card = new THREE.Mesh(m2_2_Geo, m2_2_Mat);
      m2_2_Card.position.set(moboX + 0.026, m2_2_Y, m2_2_Z);

      const shield2 = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.035, 0.19), silverMetalMat);
      shield2.position.set(moboX + 0.03, m2_2_Y, m2_2_Z);
      group.add(shield2);

      const m2_2_Led = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.006, 0.12), neonMagentaMat);
      m2_2_Led.position.set(moboX + 0.032, m2_2_Y, m2_2_Z);
      group.add(m2_2_Led);

      const secondaryNvmeData = {
        componentType: 'Almacenamiento (Slot M.2_2 NVMe)',
        name: `${secondaryNvme.brand} ${secondaryNvme.model}`,
        details: `${secondaryNvme.driveType} • ${secondaryNvme.capacityGb >= 1000 ? `${secondaryNvme.capacityGb / 1000}TB` : `${secondaryNvme.capacityGb}GB`}`,
        specs: [
          `Velocidad de Lectura: ${secondaryNvme.readSpeedMbps} MB/s`,
          `Formato: M.2 2280 PCIe 4.0`,
          `Ubicación: Ranura M.2_2 conectada a líneas del Chipset`
        ],
        status: 'optimal'
      };
      m2_2_Card.userData = secondaryNvmeData;
      shield2.userData = secondaryNvmeData;
      m2_2_Led.userData = secondaryNvmeData;
      interactiveMeshesRef.current.push(m2_2_Card, shield2, m2_2_Led);
      group.add(m2_2_Card);
    } else {
      const m2_2_Slot = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.035, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 })
      );
      m2_2_Slot.position.set(moboX + 0.02, m2_2_Y, m2_2_Z);
      m2_2_Slot.userData = {
        componentType: 'Ranura M.2 Secundaria (M.2_2)',
        name: 'Ranura M.2_2 Disponible',
        details: 'Conectada a líneas del Chipset para almacenamiento secundario',
        specs: ['Formato 2280 / 2260 soportado'],
        status: 'empty'
      };
      interactiveMeshesRef.current.push(m2_2_Slot);
      group.add(m2_2_Slot);
    }

    // Tertiary M.2 Slot (M.2_3 lower motherboard edge)
    const m2_3_Y = moboY - 0.44;
    const m2_3_Z = moboZ + 0.10;
    const tertiaryNvme = nvmeDrives[2];

    if (tertiaryNvme) {
      const m2_3_Geo = new THREE.BoxGeometry(0.025, 0.045, 0.22);
      const m2_3_Mat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.25 });
      const m2_3_Card = new THREE.Mesh(m2_3_Geo, m2_3_Mat);
      m2_3_Card.position.set(moboX + 0.026, m2_3_Y, m2_3_Z);

      const shield3 = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.035, 0.19), silverMetalMat);
      shield3.position.set(moboX + 0.03, m2_3_Y, m2_3_Z);
      group.add(shield3);

      const m2_3_Led = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.006, 0.12), neonAmberMat);
      m2_3_Led.position.set(moboX + 0.032, m2_3_Y, m2_3_Z);
      group.add(m2_3_Led);

      const tertiaryNvmeData = {
        componentType: 'Almacenamiento (Slot M.2_3 NVMe)',
        name: `${tertiaryNvme.brand} ${tertiaryNvme.model}`,
        details: `${tertiaryNvme.driveType} • ${tertiaryNvme.capacityGb >= 1000 ? `${tertiaryNvme.capacityGb / 1000}TB` : `${tertiaryNvme.capacityGb}GB`}`,
        specs: [
          `Velocidad de Lectura: ${tertiaryNvme.readSpeedMbps} MB/s`,
          `Formato: M.2 2280 PCIe 4.0`,
          `Ubicación: Ranura M.2_3 inferior de placa madre`
        ],
        status: 'optimal'
      };
      m2_3_Card.userData = tertiaryNvmeData;
      shield3.userData = tertiaryNvmeData;
      m2_3_Led.userData = tertiaryNvmeData;
      interactiveMeshesRef.current.push(m2_3_Card, shield3, m2_3_Led);
      group.add(m2_3_Card);
    } else {
      const m2_3_Slot = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.032, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 })
      );
      m2_3_Slot.position.set(moboX + 0.02, m2_3_Y, m2_3_Z);
      m2_3_Slot.userData = {
        componentType: 'Ranura M.2 Terciaria (M.2_3)',
        name: 'Ranura M.2_3 Disponible',
        details: 'Ranura adicional para almacenamiento SSD M.2',
        specs: ['Formato 2280 soportado'],
        status: 'empty'
      };
      interactiveMeshesRef.current.push(m2_3_Slot);
      group.add(m2_3_Slot);
    }

    // 2.5'' SATA SSDs mounted on PSU Shroud Deck (Supports up to 3 drives)
    sataDrives.forEach((ssd: StorageDrive, sIdx: number) => {
      if (sIdx > 2) return; // Support up to 3 mounted 2.5" SSDs
      const ssdWidth = 0.16;
      const ssdHeight = 0.025;
      const ssdLength = 0.24;
      const ssdY = shroudTopWorldY + ssdHeight / 2 + 0.005;
      const ssdX = sIdx === 2 ? -0.10 : 0.08;
      const ssdZ = sIdx === 2 ? moboZ - 0.22 : moboZ - 0.22 - sIdx * 0.28;

      // Mounting Tray Caddy Bracket
      const bracketGeo = new THREE.BoxGeometry(ssdWidth + 0.02, 0.008, ssdLength + 0.02);
      const bracket = new THREE.Mesh(bracketGeo, chassisMetalMat);
      bracket.position.set(ssdX, shroudTopWorldY + 0.004, ssdZ);
      group.add(bracket);

      // 4 Chrome Screws on corners
      const screwGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.015, 8);
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => {
        const sc = new THREE.Mesh(screwGeo, silverMetalMat);
        sc.position.set(ssdX + (sx * ssdWidth) / 2, ssdY + 0.01, ssdZ + (sz * ssdLength) / 2);
        group.add(sc);
      });

      // 2.5" SSD Body
      const ssdBody = new THREE.Mesh(
        new THREE.BoxGeometry(ssdWidth, ssdHeight, ssdLength),
        new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.3 })
      );
      ssdBody.position.set(ssdX, ssdY, ssdZ);

      // Brand Logo / Metal Badge
      const ssdLabel = new THREE.Mesh(
        new THREE.BoxGeometry(ssdWidth * 0.7, 0.005, ssdLength * 0.5),
        new THREE.MeshStandardMaterial({
          color: 0x8b5cf6,
          emissive: 0x8b5cf6,
          emissiveIntensity: 0.4
        })
      );
      ssdLabel.position.set(ssdX, ssdY + ssdHeight / 2 + 0.003, ssdZ);
      group.add(ssdLabel);

      // SATA flat cable disappearing into shroud grommet
      const sataCable = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.012, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 })
      );
      sataCable.position.set(ssdX, ssdY - 0.005, ssdZ - ssdLength / 2 - 0.04);
      group.add(sataCable);

      const ssdData = {
        componentType: `Almacenamiento (SSD SATA 2.5'' Bahía ${sIdx + 1})`,
        name: `${ssd.brand} ${ssd.model}`,
        details: `${ssd.driveType} • ${ssd.capacityGb >= 1000 ? `${ssd.capacityGb / 1000}TB` : `${ssd.capacityGb}GB`} • Montado en cubierta`,
        specs: [
          `Velocidad de Lectura: ${ssd.readSpeedMbps} MB/s`,
          `Formato: 2.5" SATA III 6 Gb/s`,
          `Ubicación: Bandeja de anclaje #${sIdx + 1} sobre cubierta de fuente`
        ],
        status: 'optimal'
      };
      ssdBody.userData = ssdData;
      bracket.userData = ssdData;
      ssdLabel.userData = ssdData;
      interactiveMeshesRef.current.push(ssdBody, bracket, ssdLabel);
      group.add(ssdBody);
    });

    // ==========================================
    // F. DISIPADOR (COOLER - DETALLADO POR AIRE O LÍQUIDA AIO)
    // ==========================================
    if (components.cooler && !coolerDismounted) {
      const isLiquid = components.cooler.coolingType === 'aio_liquid';

      if (!isLiquid) {
        // Detailed Air Cooler: Copper heatpipes + Stacked aluminum cooling fins + RGB Fan
        // Copper Baseplate on CPU
        const baseplate = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.18, 0.18), goldContactsMat);
        baseplate.position.set(cpuX + 0.02, cpuY, cpuZ);
        group.add(baseplate);

        // Heatpipes looping up
        for (let hp = -0.06; hp <= 0.06; hp += 0.04) {
          const pipeGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.35);
          const pipe = new THREE.Mesh(pipeGeo, goldContactsMat);
          pipe.rotation.z = Math.PI / 2;
          pipe.position.set(cpuX + 0.16, cpuY + hp, cpuZ);
          group.add(pipe);
        }

        // Aluminum Fin Tower (Detailed layered block)
        const finStackGeo = new THREE.BoxGeometry(0.32, 0.34, 0.28);
        const finStackMat = new THREE.MeshStandardMaterial({
          color: 0x64748b,
          metalness: 0.9,
          roughness: 0.25
        });
        const coolerTower = new THREE.Mesh(finStackGeo, finStackMat);
        coolerTower.position.set(cpuX + 0.18, cpuY, cpuZ);
        coolerTower.castShadow = true;

        // Front 120mm Square Fan attached to fin stack
        const fanFrameGeo = new THREE.BoxGeometry(0.035, 0.28, 0.28);
        const fanFrameMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          metalness: 0.8,
          roughness: 0.3
        });
        const fanFrame = new THREE.Mesh(fanFrameGeo, fanFrameMat);
        fanFrame.position.set(cpuX + 0.36, cpuY, cpuZ);

        // Realistic circular turbine fan with angled aerodynamic blades
        const fanRotor = createRealisticFan(0.24, 0.025, 7, 0x334155);
        fanRotor.position.set(cpuX + 0.36, cpuY, cpuZ);
        fanRotor.rotation.y = Math.PI / 2; // Facing the side window (+X)
        animatedFansRef.current.push({ obj: fanRotor, axis: 'x' });

        coolerTower.userData = {
          componentType: 'Disipador (Cooler por Aire)',
          name: `${components.cooler.brand} ${components.cooler.model}`,
          details: `Torre de Láminas de Aluminio con ${components.cooler.heightMm || 155}mm de altura`,
          specs: [
            `Capacidad de Disipación: Hasta ${components.cooler.maxTdpCoolingCapacity} W`,
            `Nivel de Ruido: ${components.cooler.fanNoiseDb} dB`,
            `Ventilador: Formato 120mm PWM silencioso`
          ],
          status: 'optimal'
        };
        interactiveMeshesRef.current.push(coolerTower);
        group.add(coolerTower);
        group.add(fanFrame);
        group.add(fanRotor);
      } else {
        // Liquid AIO Cooler: Pump Head + Tubes + Top Radiator
        // 1. Waterblock Pump on CPU (Low-profile sleek block with glass top)
        const pumpBlock = new THREE.Mesh(
          new THREE.BoxGeometry(0.065, 0.17, 0.17),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 })
        );
        pumpBlock.position.set(cpuX + 0.045, cpuY, cpuZ);

        const pumpLogo = new THREE.Mesh(
          new THREE.BoxGeometry(0.07, 0.08, 0.08),
          neonCyanMat
        );
        pumpLogo.position.set(cpuX + 0.045, cpuY, cpuZ);
        group.add(pumpLogo);

        // 2. Radiator on Top (Centered over the motherboard / top exhaust)
        const radGeo = new THREE.BoxGeometry(0.26, 0.06, 0.72);
        const radiator = new THREE.Mesh(radGeo, chassisMetalMat);
        radiator.position.set(0.04, halfH - 0.06, moboZ - 0.05);
        group.add(radiator);

        // 3. Realistic Radiator Fans with circular turbine rotors (blowing upwards)
        for (let i = -0.19; i <= 0.19; i += 0.38) {
          const radFanFrame = new THREE.Mesh(
            new THREE.BoxGeometry(0.24, 0.025, 0.24),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
          );
          radFanFrame.position.set(0.04, halfH - 0.1, moboZ - 0.05 + i);
          group.add(radFanFrame);

          const radFanRotor = createRealisticFan(0.22, 0.025, 7, 0x1e293b);
          radFanRotor.position.set(0.04, halfH - 0.1, moboZ - 0.05 + i);
          radFanRotor.rotation.x = Math.PI / 2; // Horizontal fan blowing upwards
          animatedFansRef.current.push({ obj: radFanRotor, axis: 'y' });
          group.add(radFanRotor);
        }

        // 4. Flexible braided coolant tubes
        const tubeCurve1 = new THREE.CatmullRomCurve3([
          new THREE.Vector3(cpuX + 0.05, cpuY + 0.03, cpuZ - 0.02),
          new THREE.Vector3(cpuX + 0.16, cpuY + 0.28, cpuZ + 0.08),
          new THREE.Vector3(0.06, halfH - 0.14, 0.08)
        ]);
        const tubeMesh1 = new THREE.Mesh(
          new THREE.TubeGeometry(tubeCurve1, 24, 0.016, 12, false),
          chassisMetalMat
        );
        group.add(tubeMesh1);

        const tubeCurve2 = new THREE.CatmullRomCurve3([
          new THREE.Vector3(cpuX + 0.05, cpuY - 0.03, cpuZ + 0.02),
          new THREE.Vector3(cpuX + 0.14, cpuY + 0.24, cpuZ + 0.15),
          new THREE.Vector3(0.06, halfH - 0.14, 0.15)
        ]);
        const tubeMesh2 = new THREE.Mesh(
          new THREE.TubeGeometry(tubeCurve2, 24, 0.016, 12, false),
          chassisMetalMat
        );
        group.add(tubeMesh2);

        pumpBlock.userData = {
          componentType: 'Disipador (Cooler Líquido AIO)',
          name: `${components.cooler.brand} ${components.cooler.model}`,
          details: `Refrigeración Líquida con Radiador de ${components.cooler.radiatorSizeMm || 240}mm`,
          specs: [
            `Capacidad de Disipación: ${components.cooler.maxTdpCoolingCapacity} W`,
            `Bomba de Agua: Espejo Infinito ARGB`,
            `Mangueras: Trenzadas de alta densidad`,
            `Ventiladores del Radiador: Neón ARGB de alta presión estática`
          ],
          status: 'optimal'
        };
        interactiveMeshesRef.current.push(pumpBlock);
        group.add(pumpBlock);
      }
    }

    // ==========================================
    // G. TARJETA GRÁFICA (GPU) DETALLADA
    // ==========================================
    const gpuY = moboY - 0.14; // Aligned directly with primary PCIe x16 slot
    const gpuLength = components.gpu ? Math.max(0.68, Math.min(1.18, components.gpu.lengthMm / 310)) : 0.82;
    const gpuWidth = components.gpu && components.gpu.slotWidth >= 2.5 ? 0.36 : 0.28;
    const gpuHeight = 0.19;

    const gpuGeo = new THREE.BoxGeometry(gpuWidth, gpuHeight, gpuLength);
    const gpuMat = components.gpu
      ? new THREE.MeshStandardMaterial({ color: 0x182234, metalness: 0.9, roughness: 0.2 })
      : new THREE.MeshStandardMaterial({ color: 0x334155, wireframe: true });
    const gpuMesh = new THREE.Mesh(gpuGeo, gpuMat);
    // Align rear bracket flush against the chassis back plate at +halfD - 0.08 (LEFT of view)
    gpuMesh.position.set(moboX + gpuWidth / 2 + 0.035, gpuY, halfD - 0.08 - gpuLength / 2);
    gpuMesh.castShadow = true;

    if (components.gpu) {
      // GPU Backplate (Silver / Gunmetal with geometric cutouts)
      const backplate = new THREE.Mesh(
        new THREE.BoxGeometry(gpuWidth, 0.016, gpuLength),
        silverMetalMat
      );
      backplate.position.set(gpuMesh.position.x, gpuY + gpuHeight / 2 + 0.009, gpuMesh.position.z);
      group.add(backplate);

      // Glowing Side Brand Badge (e.g. GEFORCE RTX / RADEON)
      const sideLogo = new THREE.Mesh(
        new THREE.BoxGeometry(0.01, 0.045, 0.32),
        neonCyanMat
      );
      sideLogo.position.set(gpuMesh.position.x + gpuWidth / 2 + 0.006, gpuY + 0.03, gpuMesh.position.z);
      group.add(sideLogo);

      // Embedded GPU fans with realistic aerodynamic turbine rotors
      const fanCount = components.gpu.lengthMm > 265 ? 3 : 2;
      const fanSpacing = (gpuLength * 0.72) / fanCount;
      for (let i = 0; i < fanCount; i++) {
        const fanZ = gpuMesh.position.z + gpuLength * 0.3 - i * fanSpacing - 0.08;
        const gpuFan = createRealisticFan(gpuWidth * 0.65, 0.012, 9, 0x0f172a, 0.4);
        gpuFan.position.set(gpuMesh.position.x + gpuWidth / 2 + 0.005, gpuY, fanZ);
        gpuFan.rotation.y = Math.PI / 2;
        animatedFansRef.current.push({ obj: gpuFan, axis: 'x' });
        group.add(gpuFan);
      }

      // PCIe Power Cable Bundle with Comb
      const pcieCable = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.05, 0.06),
        goldContactsMat
      );
      pcieCable.position.set(
        gpuMesh.position.x + gpuWidth / 2 - 0.02,
        gpuY + 0.07,
        gpuMesh.position.z - gpuLength / 2 + 0.08
      );
      group.add(pcieCable);
    }

    gpuMesh.userData = {
      componentType: 'Tarjeta Gráfica (GPU)',
      name: components.gpu ? `${components.gpu.brand} ${components.gpu.model}` : 'Ranura PCIe x16 Libre',
      details: components.gpu ? `${components.gpu.vramGb}GB ${components.gpu.vramType} • ${components.gpu.tdpWatts}W • $${components.gpu.priceUsd} USD` : 'Sin tarjeta gráfica',
      specs: components.gpu ? [
        `Longitud Real: ${components.gpu.lengthMm} mm (Espacio disponible: ${components.caseItem ? components.caseItem.maxGpuLengthMm : 365} mm)`,
        `Grosor: ${components.gpu.slotWidth} ranuras de expansión`,
        `Fuente Sugerida: ${components.gpu.recommendedPsuWatts} W`,
        `Conexión Eléctrica: ${components.gpu.powerConnectors}`
      ] : ['Ranura PCIe lista para GPU'],
      status: components.gpu ? 'optimal' : 'empty'
    };
    interactiveMeshesRef.current.push(gpuMesh);
    group.add(gpuMesh);

    // ==========================================
    // H. FUENTE DE PODER (POWER SUPPLY - PSU) - SÓTANO TRASERO (IZQUIERDA)
    // ==========================================
    const psuWidth = 0.44;
    const psuHeight = 0.26;
    const psuDepth = 0.54;
    const psuX = -halfW + psuWidth / 2 + 0.06;
    // Positioned inside the lower basement compartment at the rear (+halfD)
    const psuY = (caseCenterY - halfH) + psuHeight / 2 + 0.035;
    const psuZ = halfD - psuDepth / 2 - 0.05;

    const psuMesh = new THREE.Mesh(
      new THREE.BoxGeometry(psuWidth, psuHeight, psuDepth),
      components.psu
        ? new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.85, roughness: 0.25 })
        : new THREE.MeshStandardMaterial({ color: 0x334155, wireframe: true })
    );
    psuMesh.position.set(psuX, psuY, psuZ);

    if (components.psu) {
      // PSU Illuminated Brand Badge facing the glass window
      const psuLabel = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 0.09, 0.26),
        new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          emissive: 0x0284c7,
          emissiveIntensity: 0.6
        })
      );
      psuLabel.position.set(psuX + psuWidth / 2 + 0.005, psuY, psuZ);
      group.add(psuLabel);

      // Gold-plated Modular Cable Connectors facing front (-Z)
      for (let mx = -0.12; mx <= 0.12; mx += 0.08) {
        for (let my = -0.06; my <= 0.06; my += 0.06) {
          const modSocket = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, 0.03, 0.02),
            goldContactsMat
          );
          modSocket.position.set(psuX + mx, psuY + my, psuZ - psuDepth / 2 - 0.008);
          group.add(modSocket);
        }
      }

      // Braided ATX & EPS Cable bundle emerging into the shroud deck grommet
      const cableBundle = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.14, 0.09),
        new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 })
      );
      cableBundle.position.set(psuX + 0.1, psuY + psuHeight / 2 + 0.04, psuZ - 0.16);
      group.add(cableBundle);
    }

    // PSU Top Intake Honeycomb Ventilation Mesh
    const psuMeshGrill = new THREE.Mesh(
      new THREE.BoxGeometry(psuWidth * 0.75, 0.01, psuDepth * 0.65),
      new THREE.MeshStandardMaterial({ color: 0x030712, metalness: 0.8, roughness: 0.5 })
    );
    psuMeshGrill.position.set(psuX, psuY + psuHeight / 2 + 0.008, psuZ);
    group.add(psuMeshGrill);

    psuMeshRef.current = psuMesh;
    psuMesh.userData = {
      isPsu: true,
      componentType: 'Fuente de Poder (PSU)',
      name: components.psu ? `${components.psu.brand} ${components.psu.model}` : 'Bahía PSU en Sótano',
      details: components.psu ? `${components.psu.wattage}W • ${components.psu.efficiencyRating}` : 'Sin fuente instalada',
      specs: [],
      status: components.psu ? 'optimal' : 'empty'
    };
    interactiveMeshesRef.current.push(psuMesh);
    group.add(psuMesh);

    // ==========================================
    // I. JAULA DE DISCOS 3.5'' HDD (SÓTANO DELANTERO)
    // ==========================================
    const hddCageX = psuX + 0.02;
    const hddCageY = (caseCenterY - halfH) + psuHeight / 2 + 0.01;
    const hddCageZ = -halfD + 0.38; // Front portion of basement

    // Steel Drive Cage Frame with ventilation cutouts
    const cageGeo = new THREE.BoxGeometry(0.32, 0.22, 0.32);
    const cageFrame = new THREE.Mesh(cageGeo, chassisMetalMat);
    cageFrame.position.set(hddCageX, hddCageY, hddCageZ);
    group.add(cageFrame);

    hddDrives.forEach((hdd: StorageDrive, hIdx: number) => {
      if (hIdx > 2) return; // Up to 3 HDDs supported in basement cage
      const driveY = hddCageY - 0.07 + hIdx * 0.07;
      const hddMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.06, 0.29),
        new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.9, roughness: 0.2 })
      );
      hddMesh.position.set(hddCageX, driveY, hddCageZ);

      // Silver metal lid on top
      const lidMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.008, 0.26),
        new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.15 })
      );
      lidMesh.position.set(hddCageX, driveY + 0.031, hddCageZ);
      group.add(lidMesh);

      // HDD Brand label sticker
      const stickerMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.004, 0.14),
        new THREE.MeshStandardMaterial({
          color: hdd.brand === 'Seagate' ? 0x10b981 : 0x0284c7,
          emissive: hdd.brand === 'Seagate' ? 0x10b981 : 0x0284c7,
          emissiveIntensity: 0.35
        })
      );
      stickerMesh.position.set(hddCageX, driveY + 0.036, hddCageZ);
      group.add(stickerMesh);

      const hddData = {
        componentType: `Almacenamiento (Disco Duro HDD 3.5'' Bahía ${hIdx + 1})`,
        name: `${hdd.brand} ${hdd.model}`,
        details: `${hdd.driveType} 3.5" • ${hdd.capacityGb >= 1000 ? `${hdd.capacityGb / 1000}TB` : `${hdd.capacityGb}GB`} • En jaula de sótano`,
        specs: [
          `Velocidad de Transferencia: ${hdd.readSpeedMbps} MB/s`,
          `Formato: 3.5" Mecánico SATA III 6 Gb/s`,
          `Ubicación: Bahía #${hIdx + 1} en jaula de almacenamiento inferior`
        ],
        status: 'optimal'
      };

      hddMesh.userData = hddData;
      lidMesh.userData = hddData;
      stickerMesh.userData = hddData;
      interactiveMeshesRef.current.push(hddMesh, lidMesh, stickerMesh);
      group.add(hddMesh);
    });

    // ==========================================
    // J. VENTILADORES DEL GABINETE (CHASSIS FANS CON ÁLABES AERODINÁMICOS REALES)
    // ==========================================
    const frontFanCount = caseType === 'mini_tower' ? 1 : caseType === 'mid_tower' ? 2 : 3;
    const fanBoxSize = caseType === 'mini_tower' ? 0.22 : 0.26;

    // Front intake fans (at -halfD, on the RIGHT side of the view)
    for (let i = 0; i < frontFanCount; i++) {
      const fanBox = new THREE.Mesh(
        new THREE.BoxGeometry(fanBoxSize, fanBoxSize, 0.025),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
      );
      fanBox.position.set(0, -0.2 + i * 0.38, -halfD + 0.04);
      group.add(fanBox);

      // Realistic circular aerodynamic turbine rotor
      const fanRotor = createRealisticFan(fanBoxSize * 0.88, 0.02, 7, 0x1e293b);
      fanRotor.position.set(0, -0.2 + i * 0.38, -halfD + 0.04);
      animatedFansRef.current.push({ obj: fanRotor, axis: 'z' });
      group.add(fanRotor);
    }

    // Rear exhaust fan (at +halfD, on the LEFT side of the view)
    const rearFanBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.24, 0.025),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
    );
    rearFanBox.position.set(0, caseCenterY + 0.28, halfD - 0.04);
    group.add(rearFanBox);

    const rearRotor = createRealisticFan(0.21, 0.02, 7, 0x1e293b);
    rearRotor.position.set(0, caseCenterY + 0.28, halfD - 0.04);
    animatedFansRef.current.push({ obj: rearRotor, axis: 'z' });
    group.add(rearRotor);

    // Update shadow map on demand once per build update
    if (rendererRef.current) {
      rendererRef.current.shadowMap.needsUpdate = true;
    }

  }, [components, glassOpen, caseType, viewPreset, coolerDismounted]);

  // Camera preset positions (including Motherboard / Sockets Close-up!)
  const setCameraPreset = (preset: 'iso' | 'side' | 'mobo' | 'front') => {
    if (!cameraRef.current || !controlsRef.current) return;
    setViewPreset(preset);
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    const mobo = moboAnchorRef.current;

    if (preset === 'iso') {
      camera.position.set(4.3, 2.3, -1.9);
      controls.target.set(0, 0.9, 0);
      setGlassOpen(false);
    } else if (preset === 'side') {
      camera.position.set(3.6, 1.0, 0);
      controls.target.set(0, 1.0, 0);
      setGlassOpen(true);
    } else if (preset === 'mobo') {
      // Direct close-up centered on Motherboard, RAM slots, and M.2 NVMe!
      camera.position.set(mobo.x + 1.35, mobo.y + 0.05, mobo.z);
      controls.target.set(mobo.x, mobo.y + 0.05, mobo.z);
      setGlassOpen(true); // Open glass automatically to view motherboard clearly
    } else if (preset === 'front') {
      camera.position.set(0, 1.1, -4.2);
      controls.target.set(0, 1.0, 0);
    }
    controls.update();
  };

  return (
    <div className="relative w-full h-full min-h-[520px] flex flex-col bg-slate-950 rounded-2xl overflow-hidden border border-cyan-500/40 shadow-2xl shadow-cyan-950/50">
      {/* 3D Top Status Bar & Viewport Modes */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Case Badge & WebGL State */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/40 text-xs shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#00f0ff]" />
          <span className="font-semibold text-slate-100">Visor 3D Neón Studio</span>
          <span className="text-cyan-300 font-mono uppercase font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40">
            {caseType === 'mini_tower' ? 'Mini Tower' : caseType === 'mid_tower' ? 'Mid Tower' : 'Full Tower'}
          </span>
          <span
            ref={fpsSpanRef}
            className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 shadow-[0_0_6px_rgba(16,185,129,0.3)]"
          >
            60 FPS
          </span>
        </div>

        {/* Camera Preset Toolbar */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 text-xs text-slate-200 shadow-xl">
          <button
            onClick={() => setCameraPreset('iso')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium ${viewPreset === 'iso'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/60 shadow-sm'
                : 'hover:bg-slate-800 text-slate-300'
              }`}
          >
            Isométrica
          </button>

          {/* DEDICATED MOTHERBOARD & SOCKETS VIEW */}
          <button
            onClick={() => setCameraPreset('mobo')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all font-bold ${viewPreset === 'mobo'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40'
              }`}
            title="Vista de cerca a la placa madre, slots de RAM y ranuras M.2"
          >
            <CircuitBoard className="w-3.5 h-3.5" />
            <span>Ver Placa & Sockets</span>
          </button>

          <button
            onClick={() => setCameraPreset('side')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium ${viewPreset === 'side'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/60'
                : 'hover:bg-slate-800 text-slate-300'
              }`}
          >
            Interior
          </button>

          <button
            onClick={() => setCameraPreset('front')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium ${viewPreset === 'front'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/60'
                : 'hover:bg-slate-800 text-slate-300'
              }`}
          >
            Frontal
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-1" />

          {/* Toggle Cooler Dismount */}
          <button
            onClick={() => setCoolerDismounted(!coolerDismounted)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all font-semibold ${coolerDismounted
                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-sm'
                : 'hover:bg-slate-800 text-slate-300'
              }`}
            title="Desmontar el disipador para ver el procesador y puertos M.2 al descubierto"
          >
            <Fan className={`w-3.5 h-3.5 ${coolerDismounted ? 'text-rose-400' : 'text-cyan-400'}`} />
            <span>{coolerDismounted ? 'Cooler Desmontado' : 'Cooler'}</span>
          </button>

          {/* Toggle Glass Panel */}
          <button
            onClick={() => setGlassOpen(!glassOpen)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors font-medium ${glassOpen ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50' : 'hover:bg-slate-800 text-slate-300'
              }`}
            title="Abrir o cerrar el panel de vidrio"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{glassOpen ? 'Vidrio Abierto' : 'Vidrio'}</span>
          </button>


          {/* Reset Camera */}
          <button
            onClick={() => setCameraPreset('iso')}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Restablecer posición"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full flex-1 cursor-grab active:cursor-grabbing" />

      {/* SOCKETS LIVE INSPECTOR HUD OVERLAY (When Motherboard mode is active or toggled) */}
      {viewPreset === 'mobo' && showSocketHud && (
        <div className="absolute top-16 right-3 z-10 w-72 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/60 rounded-xl p-3 shadow-2xl text-xs text-slate-200 animate-in fade-in slide-in-from-right-4 duration-150">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5 uppercase text-[11px] tracking-wide">
              <CircuitBoard className="w-3.5 h-3.5" />
              <span>Inspector de Sockets en Placa</span>
            </span>
            <button
              onClick={() => setShowSocketHud(false)}
              className="text-slate-400 hover:text-white text-[11px]"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            {/* RAM DIMM SLOTS STATUS */}
            <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                RANURAS RAM (DIMM 1 a 4):
              </span>
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-[10px]">
                <div className={`p-1 rounded border ${components.ram && components.ram.modulesCount >= 4 ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                  A1
                </div>
                <div className={`p-1 rounded border font-bold ${components.ram ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                  A2*
                </div>
                <div className={`p-1 rounded border ${components.ram && components.ram.modulesCount >= 4 ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                  B1
                </div>
                <div className={`p-1 rounded border font-bold ${components.ram && components.ram.modulesCount >= 2 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                  B2*
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {components.ram
                  ? `Instalado: ${components.ram.model} (${components.ram.memoryType})`
                  : 'Sin módulos instalados'}
              </p>
            </div>

            {/* M.2 NVMe SLOTS STATUS */}
            <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                PUERTOS M.2 NVMe:
              </span>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span>M.2_1 (PCIe CPU):</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${nvmeDrives[0] ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}`}>
                  {nvmeDrives[0] ? `${nvmeDrives[0].capacityGb >= 1000 ? `${nvmeDrives[0].capacityGb / 1000}TB` : `${nvmeDrives[0].capacityGb}GB`}` : 'Libre'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span>M.2_2 (Chipset):</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${nvmeDrives[1] ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}`}>
                  {nvmeDrives[1] ? `${nvmeDrives[1].capacityGb >= 1000 ? `${nvmeDrives[1].capacityGb / 1000}TB` : `${nvmeDrives[1].capacityGb}GB`}` : 'Libre'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span>M.2_3 (Secundario):</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${nvmeDrives[2] ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}`}>
                  {nvmeDrives[2] ? `${nvmeDrives[2].capacityGb >= 1000 ? `${nvmeDrives[2].capacityGb / 1000}TB` : `${nvmeDrives[2].capacityGb}GB`}` : 'Libre'}
                </span>
              </div>
            </div>

            {/* UNIDADES ADICIONALES (SATA SSD & HDD) */}
            {(sataDrives.length > 0 || hddDrives.length > 0) && (
              <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">
                  ALMACENAMIENTO ADICIONAL:
                </span>
                {sataDrives.map((ssd: StorageDrive, i: number) => (
                  <div key={`sata-hud-${i}`} className="flex items-center justify-between text-[10px] text-slate-300">
                    <span>SSD SATA {i + 1} (Cubierta):</span>
                    <span className="text-purple-400 font-bold">{ssd.brand} {ssd.capacityGb >= 1000 ? `${ssd.capacityGb / 1000}TB` : `${ssd.capacityGb}GB`}</span>
                  </div>
                ))}
                {hddDrives.map((hdd: StorageDrive, i: number) => (
                  <div key={`hdd-hud-${i}`} className="flex items-center justify-between text-[10px] text-slate-300">
                    <span>HDD {i + 1} (Sótano):</span>
                    <span className="text-amber-400 font-bold">{hdd.brand} {hdd.capacityGb >= 1000 ? `${hdd.capacityGb / 1000}TB` : `${hdd.capacityGb}GB`}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CPU SOCKET STATUS */}
            <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">SOCKET CPU:</span>
                  <span className="font-bold text-white text-xs">
                    {components.cpu ? `${components.cpu.brand} ${components.cpu.model}` : 'Sin Procesador'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                  {components.motherboard?.socket || 'Socket'}
                </span>
              </div>
              <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Estado Disipador:</span>
                <button
                  type="button"
                  onClick={() => setCoolerDismounted(!coolerDismounted)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border transition ${coolerDismounted
                      ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                      : 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                    }`}
                >
                  {coolerDismounted ? 'Desmontado (Ver CPU)' : 'Montado'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button to restore Socket HUD if closed in mobo mode */}
      {viewPreset === 'mobo' && !showSocketHud && (
        <button
          onClick={() => setShowSocketHud(true)}
          className="absolute top-16 right-3 z-10 bg-slate-900/90 border border-cyan-500/40 px-2.5 py-1 rounded-lg text-xs text-cyan-300 flex items-center gap-1.5 shadow-lg"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Abrir Info Sockets</span>
        </button>
      )}

      {/* Instructions Overlay at Bottom */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] text-slate-300">
        <span>🖱️ Arrastra para rotar en 360°</span>
        <span>•</span>
        <span>🔍 Rueda para Zoom</span>
        <span>•</span>
        <span>✨ Pasa el mouse sobre CPU, RAM o M.2 para ver detalles</span>
      </div>

      {/* Abbreviated Compact Floating Tooltip / HUD Overlay */}
      {hoveredInfo && (
        <div
          ref={tooltipDivRef}
          className="absolute top-0 left-0 z-20 pointer-events-none select-none transition-opacity duration-150 will-change-transform"
          style={{
            transform: `translate3d(${Math.min(hoveredInfo.x + 14, (containerRef.current?.clientWidth || 500) - 240)}px, ${Math.max(10, Math.min(hoveredInfo.y - 26, (containerRef.current?.clientHeight || 500) - 50))}px, 0)`
          }}
        >
          <div className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-md border border-cyan-400/60 rounded-lg px-2.5 py-1.5 shadow-xl shadow-black/80 text-slate-100 max-w-sm">
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${hoveredInfo.status === 'optimal'
                  ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                  : hoveredInfo.status === 'warning'
                    ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]'
                    : 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
                }`}
            />
            <div className="flex items-center gap-1.5 text-xs whitespace-nowrap overflow-hidden">
              <span className="font-bold text-[10px] uppercase text-cyan-400 tracking-wide">
                {hoveredInfo.type.split(' • ')[0].replace(/\(.*?\)/g, '').trim()}
              </span>
              <span className="text-slate-500 text-[10px]">•</span>
              <span className="font-semibold text-white truncate max-w-[170px]">
                {hoveredInfo.name}
              </span>
              {hoveredInfo.details && (
                <>
                  <span className="text-slate-600 text-[10px]">•</span>
                  <span className="text-[10px] text-slate-300 font-normal truncate max-w-[140px]">
                    {hoveredInfo.details}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
