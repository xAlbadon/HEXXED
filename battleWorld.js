import * as THREE from 'three';
import * as TWEEN from 'tween.js';

export class BattleWorld {
  constructor(container) {
    this.container = container;
    this.clock = new THREE.Clock();
    
    // Store orb meshes for interaction
    this.playerOneOrbs = new Map(); // hex -> mesh
    this.playerTwoOrbs = new Map(); // hex -> mesh
    this.selectedOrbsPlayer1 = [];
    this.selectedOrbsPlayer2 = [];
    
    // Preview orbs and lines
    this.playerOnePreviewOrb = null;
    this.playerTwoPreviewOrb = null;
    this.playerOnePreviewLines = [];
    this.playerTwoPreviewLines = [];
    
    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initLighting();
    this.initEnvironment();
    this.initTargetColorPedestal();
    this.initInteraction();
    this.animate();
  }
  
  // Method to attach click handler after construction
  attachClickHandler(handler) {
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.addEventListener('click', handler);
      this.renderer.domElement.style.cursor = 'pointer';
      this.clickHandler = handler;
    }
  }

  initRenderer() {
    // Clean up existing canvas
    const existingCanvas = this.container.querySelector('canvas');
    if (existingCanvas) {
      existingCanvas.remove();
    }
    
    try {
      this.renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
      });
    } catch (e) {
      console.error("[BattleWorld] Error creating WebGLRenderer:", e);
      this.container.innerHTML = '<div style="color:white; text-align:center; padding-top: 50px;">Sorry, your browser could not initialize the 3D graphics (WebGL).</div>';
      throw e;
    }
    
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setClearColor(0x1a0a30, 1); // Dark battle theme
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.container.appendChild(this.renderer.domElement);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x1a0a30, 15, 60);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    // Initial position to see both sides and center
    this.camera.position.set(0, 20, 25);
    this.camera.lookAt(0, 0, 0);
    
    // Store camera states (adjusted for larger ring area)
    this.cameraStates = {
      overview: { position: { x: 0, y: 20, z: 25 }, lookAt: { x: 0, y: 0, z: 0 } },
      playerOne: { position: { x: -10, y: 18, z: 14 }, lookAt: { x: -10, y: 1, z: 0 } },
      playerTwo: { position: { x: 10, y: 18, z: 14 }, lookAt: { x: 10, y: 1, z: 0 } }
    };
    
    this.currentCameraTarget = { x: 0, y: 0, z: 0 };
  }

  initLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x3a2a60, 0.3);
    this.scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(0, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 60;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    this.scene.add(directionalLight);

    // Player 1 area light (left side) - red glow
    const player1Light = new THREE.PointLight(0xff6b6b, 1.5, 15);
    player1Light.position.set(-10, 5, 0);
    this.scene.add(player1Light);

    // Player 2 area light (right side) - red glow
    const player2Light = new THREE.PointLight(0xff6b6b, 1.5, 15);
    player2Light.position.set(10, 5, 0);
    this.scene.add(player2Light);

    // Center target light - gold glow
    this.targetLight = new THREE.PointLight(0xffda77, 2, 12);
    this.targetLight.position.set(0, 5, 0);
    this.scene.add(this.targetLight);

    // Animated accent lights
    const accentLight1 = new THREE.PointLight(0x8a2be2, 0.6, 20);
    accentLight1.position.set(-8, 3, -8);
    this.scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0xff00ff, 0.6, 20);
    accentLight2.position.set(8, 3, -8);
    this.scene.add(accentLight2);

    // Store lights for animation
    this.accentLights = [accentLight1, accentLight2];
  }

  initEnvironment() {
    // Create battle arena floor
    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a0a30,
      roughness: 0.7,
      metalness: 0.3,
      emissive: 0x0a001c,
      emissiveIntensity: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Add glowing grid pattern
    const gridHelper = new THREE.GridHelper(50, 25, 0xff6b6b, 0x8a2be2);
    gridHelper.position.y = 0;
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);

    // Platform and rings will be created dynamically by updatePlayerPlatform
    this.platform1 = null;
    this.platform2 = null;
    this.ring1 = null;
    this.ring2 = null;

    // Create preview orbs for each player
    this.createPreviewOrbs();
    
    // Create best attempt comparison orbs
    this.createComparisonOrbs();

    // Add floating energy particles
    this.createEnergyParticles();
  }
  
  createPreviewOrbs() {
    // Player 1 preview orb (left side, low to ground)
    const preview1Geometry = new THREE.SphereGeometry(0.7, 32, 32);
    const preview1Material = new THREE.MeshStandardMaterial({
      color: 0x808080,
      emissive: 0x404040,
      emissiveIntensity: 0.3,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.8
    });
    this.playerOnePreviewOrb = new THREE.Mesh(preview1Geometry, preview1Material);
    this.playerOnePreviewOrb.position.set(-10, 0.7, 0); // Low to ground
    this.playerOnePreviewOrb.castShadow = true;
    this.scene.add(this.playerOnePreviewOrb);
    
    // Player 2 preview orb (right side, low to ground)
    const preview2Geometry = new THREE.SphereGeometry(0.7, 32, 32);
    const preview2Material = new THREE.MeshStandardMaterial({
      color: 0x808080,
      emissive: 0x404040,
      emissiveIntensity: 0.3,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.8
    });
    this.playerTwoPreviewOrb = new THREE.Mesh(preview2Geometry, preview2Material);
    this.playerTwoPreviewOrb.position.set(10, 0.7, 0); // Low to ground
    this.playerTwoPreviewOrb.castShadow = true;
    this.scene.add(this.playerTwoPreviewOrb);
  }
  
  createComparisonOrbs() {
    // Player 1's best attempt orb (visible to player 1, left side of their area)
    const p1BestGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const p1BestMaterial = new THREE.MeshStandardMaterial({
      color: 0x404040,
      emissive: 0x202020,
      emissiveIntensity: 0.2,
      roughness: 0.3,
      metalness: 0.7,
      transparent: true,
      opacity: 0.7
    });
    this.playerOneBestOrb = new THREE.Mesh(p1BestGeometry, p1BestMaterial);
    this.playerOneBestOrb.position.set(-10, 2.5, -5); // Left side, above platform
    this.playerOneBestOrb.castShadow = true;
    this.scene.add(this.playerOneBestOrb);
    
    // Player 2's best attempt orb (visible to player 2, right side of their area)
    const p2BestGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const p2BestMaterial = new THREE.MeshStandardMaterial({
      color: 0x404040,
      emissive: 0x202020,
      emissiveIntensity: 0.2,
      roughness: 0.3,
      metalness: 0.7,
      transparent: true,
      opacity: 0.7
    });
    this.playerTwoBestOrb = new THREE.Mesh(p2BestGeometry, p2BestMaterial);
    this.playerTwoBestOrb.position.set(10, 2.5, -5); // Right side, above platform
    this.playerTwoBestOrb.castShadow = true;
    this.scene.add(this.playerTwoBestOrb);
    
    // Opponent's best attempt orb for player 1 (shows player 2's best, positioned for player 1 to see)
    const p1OpponentGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const p1OpponentMaterial = new THREE.MeshStandardMaterial({
      color: 0x303030,
      emissive: 0x151515,
      emissiveIntensity: 0.2,
      roughness: 0.4,
      metalness: 0.6,
      transparent: true,
      opacity: 0.6
    });
    this.playerOneOpponentOrb = new THREE.Mesh(p1OpponentGeometry, p1OpponentMaterial);
    this.playerOneOpponentOrb.position.set(-10, 2.5, -6.5); // Slightly back and to side
    this.playerOneOpponentOrb.castShadow = true;
    this.scene.add(this.playerOneOpponentOrb);
    
    // Opponent's best attempt orb for player 2 (shows player 1's best, positioned for player 2 to see)
    const p2OpponentGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const p2OpponentMaterial = new THREE.MeshStandardMaterial({
      color: 0x303030,
      emissive: 0x151515,
      emissiveIntensity: 0.2,
      roughness: 0.4,
      metalness: 0.6,
      transparent: true,
      opacity: 0.6
    });
    this.playerTwoOpponentOrb = new THREE.Mesh(p2OpponentGeometry, p2OpponentMaterial);
    this.playerTwoOpponentOrb.position.set(10, 2.5, -6.5); // Slightly back and to side
    this.playerTwoOpponentOrb.castShadow = true;
    this.scene.add(this.playerTwoOpponentOrb);
  }

  initTargetColorPedestal() {
    // Create elevated pedestal in center for target color
    const pedestalGeometry = new THREE.CylinderGeometry(1.5, 2, 2, 32);
    const pedestalMaterial = new THREE.MeshStandardMaterial({
      color: 0xffda77,
      emissive: 0xff8c00,
      emissiveIntensity: 0.2,
      roughness: 0.4,
      metalness: 0.8
    });
    this.targetPedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
    this.targetPedestal.position.set(0, 1, 0);
    this.targetPedestal.castShadow = true;
    this.targetPedestal.receiveShadow = true;
    this.scene.add(this.targetPedestal);

    // Target orb will be placed here
    this.targetOrb = null;
  }

  createEnergyParticles() {
    // Create floating ambient particles
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      // Random colors between purple, pink, and cyan
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i * 3] = 0.54; colors[i * 3 + 1] = 0.17; colors[i * 3 + 2] = 0.89; // Purple
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.41; colors[i * 3 + 2] = 0.71; // Pink
      } else {
        colors[i * 3] = 0; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1; // Cyan
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  // Create orb for player area
  createPlayerOrb(color, position, isPlayerOne = true, orbData = null) {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.3,
      roughness: 0.2,
      metalness: 0.8
    });

    const orb = new THREE.Mesh(geometry, material);
    orb.position.copy(position);
    orb.castShadow = true;
    orb.receiveShadow = true;
    // Set userData with orbData included
    orb.userData.color = color;
    orb.userData.isPlayerOne = isPlayerOne;
    orb.userData.isSelected = false;
    orb.userData.originalY = position.y;
    orb.userData.orbData = orbData;

    // Add glow
    const glowGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.raycast = () => {}; // Disable raycasting for glow so parent orb is hit instead
    orb.add(glow);
    orb.userData.glow = glow;

    this.scene.add(orb);
    return orb;
  }

  // Render player's orbs in their area with multiple rings
  renderPlayerOrbs(orbs, isPlayerOne, ring2Orbs = [], ring3Orbs = []) {
    const xBase = isPlayerOne ? -10 : 10;
    const orbMap = isPlayerOne ? this.playerOneOrbs : this.playerTwoOrbs;
    const selectedArray = isPlayerOne ? this.selectedOrbsPlayer1 : this.selectedOrbsPlayer2;
    
    // Clear existing orbs
    orbMap.forEach(mesh => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      if (mesh.userData.glow) {
        mesh.userData.glow.geometry.dispose();
        mesh.userData.glow.material.dispose();
      }
    });
    orbMap.clear();
    
    // Clear selection array since we're recreating all orbs
    selectedArray.length = 0;
    
    // Clear preview lines and reset preview orb
    this.updatePreview(isPlayerOne);

    // Ring 1: Base orbs (inner ring)
    orbs.forEach((orb, index) => {
      const angle = (index / orbs.length) * Math.PI * 2;
      const radius = 2.5;
      const x = xBase + Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const position = new THREE.Vector3(x, 0.5, z);

      const mesh = this.createPlayerOrb(orb.hex, position, isPlayerOne, orb);
      mesh.userData.ring = 1;
      orbMap.set(orb.hex, mesh);

      // Animate in
      mesh.scale.set(0, 0, 0);
      new TWEEN.Tween(mesh.scale)
        .to({ x: 1, y: 1, z: 1 }, 500)
        .easing(TWEEN.Easing.Back.Out)
        .delay(index * 30)
        .start();
    });

    // Ring 2: Mixed colors (middle ring, max 15)
    ring2Orbs.forEach((orb, index) => {
      const angle = (index / Math.max(ring2Orbs.length, 1)) * Math.PI * 2;
      const radius = 4.5;
      const x = xBase + Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const position = new THREE.Vector3(x, 0.5, z);

      const mesh = this.createPlayerOrb(orb.hex, position, isPlayerOne, orb);
      mesh.userData.ring = 2;
      orbMap.set(orb.hex, mesh);

      // Animate in
      mesh.scale.set(0, 0, 0);
      new TWEEN.Tween(mesh.scale)
        .to({ x: 1, y: 1, z: 1 }, 500)
        .easing(TWEEN.Easing.Back.Out)
        .delay((orbs.length + index) * 30)
        .start();
    });

    // Ring 3: Additional mixed colors (outer ring, max 25)
    ring3Orbs.forEach((orb, index) => {
      const angle = (index / Math.max(ring3Orbs.length, 1)) * Math.PI * 2;
      const radius = 6.5;
      const x = xBase + Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const position = new THREE.Vector3(x, 0.5, z);

      const mesh = this.createPlayerOrb(orb.hex, position, isPlayerOne, orb);
      mesh.userData.ring = 3;
      orbMap.set(orb.hex, mesh);

      // Animate in
      mesh.scale.set(0, 0, 0);
      new TWEEN.Tween(mesh.scale)
        .to({ x: 1, y: 1, z: 1 }, 500)
        .easing(TWEEN.Easing.Back.Out)
        .delay((orbs.length + ring2Orbs.length + index) * 30)
        .start();
    });
    
    // Update platform size based on active rings
    this.updatePlayerPlatform(isPlayerOne, ring2Orbs.length > 0, ring3Orbs.length > 0);
  }
  
  // Update platform to match ring count
  updatePlayerPlatform(isPlayerOne, hasRing2, hasRing3) {
    const xPosition = isPlayerOne ? -10 : 10;
    const platformKey = isPlayerOne ? 'platform1' : 'platform2';
    const ringKey = isPlayerOne ? 'ring1' : 'ring2';
    
    // Remove old platform and ring
    if (this[platformKey]) {
      this.scene.remove(this[platformKey]);
      this[platformKey].geometry.dispose();
      this[platformKey].material.dispose();
    }
    if (this[ringKey]) {
      this.scene.remove(this[ringKey]);
      this[ringKey].geometry.dispose();
      this[ringKey].material.dispose();
    }
    
    // Determine radius based on rings
    let platformRadius = 4;
    if (hasRing3) {
      platformRadius = 7.5;
    } else if (hasRing2) {
      platformRadius = 5.5;
    }
    
    // Create new platform
    const geometry = new THREE.CylinderGeometry(platformRadius, platformRadius, 0.2, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff6b6b,
      emissive: 0xff6b6b,
      emissiveIntensity: 0.3,
      roughness: 0.5,
      metalness: 0.5,
      transparent: true,
      opacity: 0.3
    });
    const platform = new THREE.Mesh(geometry, material);
    platform.position.set(xPosition, 0.1, 0);
    platform.receiveShadow = true;
    this.scene.add(platform);
    this[platformKey] = platform;

    // Create new glowing ring
    const ringGeometry = new THREE.TorusGeometry(platformRadius, 0.1, 16, 50);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6b6b,
      emissive: 0xff6b6b,
      emissiveIntensity: 0.8,
      roughness: 0.3,
      metalness: 0.7
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(xPosition, 0.3, 0);
    ring.rotation.x = Math.PI / 2;
    this.scene.add(ring);
    this[ringKey] = ring;
    
    // Animate platform expansion
    platform.scale.set(0.1, 1, 0.1);
    ring.scale.set(0.1, 0.1, 1);
    
    new TWEEN.Tween(platform.scale)
      .to({ x: 1, y: 1, z: 1 }, 800)
      .easing(TWEEN.Easing.Elastic.Out)
      .start();
      
    new TWEEN.Tween(ring.scale)
      .to({ x: 1, y: 1, z: 1 }, 800)
      .easing(TWEEN.Easing.Elastic.Out)
      .start();
  }

  // Update target color display
  setTargetColor(color) {
    if (this.targetOrb) {
      this.scene.remove(this.targetOrb);
      this.targetOrb.geometry.dispose();
      this.targetOrb.material.dispose();
      if (this.targetOrb.userData.glow) {
        this.targetOrb.userData.glow.geometry.dispose();
        this.targetOrb.userData.glow.material.dispose();
      }
    }

    const geometry = new THREE.SphereGeometry(1.2, 64, 64);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.4,
      roughness: 0.1,
      metalness: 0.9
    });

    this.targetOrb = new THREE.Mesh(geometry, material);
    this.targetOrb.position.set(0, 3, 0);
    this.targetOrb.castShadow = true;

    // Add larger glow for target
    const glowGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.targetOrb.add(glow);
    this.targetOrb.userData.glow = glow;

    this.scene.add(this.targetOrb);

    // Update light color
    this.targetLight.color.setHex(parseInt(color.replace('#', ''), 16));

    // Animate in
    this.targetOrb.scale.set(0, 0, 0);
    new TWEEN.Tween(this.targetOrb.scale)
      .to({ x: 1, y: 1, z: 1 }, 800)
      .easing(TWEEN.Easing.Elastic.Out)
      .start();
  }

  // Handle orb selection
  selectOrb(hex, isPlayerOne) {
    const orbMap = isPlayerOne ? this.playerOneOrbs : this.playerTwoOrbs;
    const selectedArray = isPlayerOne ? this.selectedOrbsPlayer1 : this.selectedOrbsPlayer2;
    
    const mesh = orbMap.get(hex);
    if (!mesh) return;

    mesh.userData.isSelected = true;
    selectedArray.push(mesh);
    
    // Update preview (lines show selection)
    this.updatePreview(isPlayerOne);
  }

  // Handle orb deselection
  deselectOrb(hex, isPlayerOne) {
    const orbMap = isPlayerOne ? this.playerOneOrbs : this.playerTwoOrbs;
    const selectedArray = isPlayerOne ? this.selectedOrbsPlayer1 : this.selectedOrbsPlayer2;
    
    const mesh = orbMap.get(hex);
    if (!mesh) return;

    mesh.userData.isSelected = false;
    const index = selectedArray.indexOf(mesh);
    if (index > -1) selectedArray.splice(index, 1);
  }
  
  // Clear all selections for a player
  clearSelection(isPlayerOne) {
    const selectedArray = isPlayerOne ? this.selectedOrbsPlayer1 : this.selectedOrbsPlayer2;
    
    // Deselect all orbs
    [...selectedArray].forEach(mesh => {
      mesh.userData.isSelected = false;
    });
    
    // Clear array
    selectedArray.length = 0;
    
    // Update preview
    this.updatePreview(isPlayerOne);
  }
  
  // Update line positions in animation loop
  updatePreviewLines(isPlayerOne) {
    const selectedArray = isPlayerOne ? this.selectedOrbsPlayer1 : this.selectedOrbsPlayer2;
    const previewLines = isPlayerOne ? this.playerOnePreviewLines : this.playerTwoPreviewLines;
    const xPos = isPlayerOne ? -10 : 10;
    
    // Update each line to connect orb to preview
    previewLines.forEach((line, index) => {
      if (selectedArray[index]) {
        const positions = line.geometry.attributes.position.array;
        const orbPos = selectedArray[index].position;
        
        // Start point (orb position)
        positions[0] = orbPos.x;
        positions[1] = orbPos.y;
        positions[2] = orbPos.z;
        
        // End point (preview orb position)
        positions[3] = xPos;
        positions[4] = 0.7;
        positions[5] = 0;
        
        line.geometry.attributes.position.needsUpdate = true;
      }
    });
  }
  
  // Update preview orb and lines based on selection
  updatePreview(isPlayerOne) {
    const selectedArray = isPlayerOne ? this.selectedOrbsPlayer1 : this.selectedOrbsPlayer2;
    const previewOrb = isPlayerOne ? this.playerOnePreviewOrb : this.playerTwoPreviewOrb;
    const previewLines = isPlayerOne ? this.playerOnePreviewLines : this.playerTwoPreviewLines;
    const xPos = isPlayerOne ? -10 : 10;
    
    // Clear existing lines
    previewLines.forEach(line => {
      this.scene.remove(line);
      line.geometry.dispose();
      line.material.dispose();
    });
    previewLines.length = 0;
    
    if (selectedArray.length === 0) {
      // No selection - gray preview orb
      previewOrb.material.color.setHex(0x808080);
      previewOrb.material.emissive.setHex(0x404040);
      previewOrb.material.opacity = 0.5;
      return;
    }
    
    // Calculate preview color by averaging selected colors
    let r = 0, g = 0, b = 0;
    selectedArray.forEach(mesh => {
      const color = new THREE.Color(mesh.userData.color);
      r += color.r;
      g += color.g;
      b += color.b;
    });
    r /= selectedArray.length;
    g /= selectedArray.length;
    b /= selectedArray.length;
    
    const previewColor = new THREE.Color(r, g, b);
    previewOrb.material.color.copy(previewColor);
    previewOrb.material.emissive.copy(previewColor).multiplyScalar(0.5);
    previewOrb.material.opacity = 0.9;
    
    // Create lines from selected orbs to preview orb
    selectedArray.forEach(mesh => {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        mesh.position.clone(),
        new THREE.Vector3(xPos, 0.7, 0)
      ]);
      
      const lineMaterial = new THREE.LineBasicMaterial({
        color: mesh.userData.color,
        transparent: true,
        opacity: 0.6,
        linewidth: 2
      });
      
      const line = new THREE.Line(lineGeometry, lineMaterial);
      this.scene.add(line);
      previewLines.push(line);
    });
    
    // Store reference
    if (isPlayerOne) {
      this.playerOnePreviewLines = previewLines;
    } else {
      this.playerTwoPreviewLines = previewLines;
    }
  }

  // Show mixed result for a player (removed - we use preview orb instead)
  showMixedColor(color, isPlayerOne) {
    // No longer create floating result orb - the preview orb serves this purpose
    // Just clear the selection and preview will reset
    const selectedArray = isPlayerOne ? this.selectedOrbsPlayer1 : this.selectedOrbsPlayer2;
    selectedArray.length = 0;
    
    // Clear preview lines since mix is complete
    this.updatePreview(isPlayerOne);
  }
  
  // Update best attempt comparison orbs
  updateBestAttempt(yourBestColor, opponentBestColor, isPlayerOne) {
    // Update your best orb
    const yourBestOrb = isPlayerOne ? this.playerOneBestOrb : this.playerTwoBestOrb;
    if (yourBestColor && yourBestOrb) {
      const color = new THREE.Color(yourBestColor);
      yourBestOrb.material.color.copy(color);
      yourBestOrb.material.emissive.copy(color).multiplyScalar(0.4);
      yourBestOrb.material.opacity = 0.9;
    }
    
    // Update opponent's best orb (what you see of theirs)
    const opponentOrb = isPlayerOne ? this.playerOneOpponentOrb : this.playerTwoOpponentOrb;
    if (opponentBestColor && opponentOrb) {
      const color = new THREE.Color(opponentBestColor);
      opponentOrb.material.color.copy(color);
      opponentOrb.material.emissive.copy(color).multiplyScalar(0.3);
      opponentOrb.material.opacity = 0.8;
    }
  }

  // Clear mixed results
  clearMixedResults() {
    // Clear selections
    this.selectedOrbsPlayer1 = [];
    this.selectedOrbsPlayer2 = [];
    
    // Clear preview lines and reset preview orbs
    this.updatePreview(true);
    this.updatePreview(false);
  }

  initInteraction() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredOrb = null;

    this.container.addEventListener('mousemove', (event) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Update hover state
      this.updateHover();
    });
  }
  
  updateHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    const allOrbs = [
      ...Array.from(this.playerOneOrbs.values()),
      ...Array.from(this.playerTwoOrbs.values())
    ];
    
    const intersects = this.raycaster.intersectObjects(allOrbs);
    
    // Reset previous hover
    if (this.hoveredOrb && !this.hoveredOrb.userData.isSelected) {
      this.hoveredOrb.scale.set(1, 1, 1);
      this.hoveredOrb = null;
      this.container.style.cursor = 'default';
    }
    
    // Apply new hover
    if (intersects.length > 0 && !intersects[0].object.userData.isSelected) {
      this.hoveredOrb = intersects[0].object;
      this.hoveredOrb.scale.set(1.1, 1.1, 1.1);
      this.container.style.cursor = 'pointer';
    }
  }

  // Get clicked orb
  getClickedOrb(event) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    const allOrbs = [
      ...Array.from(this.playerOneOrbs.values()),
      ...Array.from(this.playerTwoOrbs.values())
    ];
    
    // Use recursive: true to check children (glow meshes)
    const intersects = this.raycaster.intersectObjects(allOrbs, true);
    
    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      
      // If we clicked the glow child, return the parent orb
      if (clickedObject.parent && clickedObject.parent.userData && clickedObject.parent.userData.orbData) {
        return clickedObject.parent;
      }
      
      return clickedObject;
    }
    return null;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // Update tweens
    TWEEN.update();
    
    // Update hover effects
    this.updateHover();

    // Animate particles
    if (this.particles) {
      this.particles.rotation.y = elapsed * 0.05;
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(elapsed + i) * 0.002;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    // Rotate target orb
    if (this.targetOrb) {
      this.targetOrb.rotation.y = elapsed * 0.5;
      this.targetOrb.position.y = 3 + Math.sin(elapsed * 2) * 0.2;
      
      if (this.targetOrb.userData.glow) {
        this.targetOrb.userData.glow.rotation.y = -elapsed * 0.7;
      }
    }

    // Animate selected orbs and update preview lines
    [...this.selectedOrbsPlayer1, ...this.selectedOrbsPlayer2].forEach(orb => {
      orb.rotation.y = elapsed * 2;
    });
    
    // Update preview lines to follow selected orbs
    this.updatePreviewLines(true);
    this.updatePreviewLines(false);

    // Pulse accent lights
    this.accentLights.forEach((light, index) => {
      light.intensity = 0.4 + Math.sin(elapsed * 2 + index) * 0.2;
    });

    // Animate preview orbs with gentle float
    if (this.playerOnePreviewOrb) {
      this.playerOnePreviewOrb.rotation.y = elapsed * 0.5;
      this.playerOnePreviewOrb.position.y = 0.7 + Math.sin(elapsed * 1.5) * 0.05;
    }
    if (this.playerTwoPreviewOrb) {
      this.playerTwoPreviewOrb.rotation.y = elapsed * 0.5;
      this.playerTwoPreviewOrb.position.y = 0.7 + Math.sin(elapsed * 1.5) * 0.05;
    }
    
    // Animate comparison orbs with gentle float
    if (this.playerOneBestOrb) {
      this.playerOneBestOrb.rotation.y = elapsed * 0.3;
      this.playerOneBestOrb.position.y = 2.5 + Math.sin(elapsed * 1.2) * 0.08;
    }
    if (this.playerTwoBestOrb) {
      this.playerTwoBestOrb.rotation.y = elapsed * 0.3;
      this.playerTwoBestOrb.position.y = 2.5 + Math.sin(elapsed * 1.2) * 0.08;
    }
    if (this.playerOneOpponentOrb) {
      this.playerOneOpponentOrb.rotation.y = elapsed * 0.25;
      this.playerOneOpponentOrb.position.y = 2.5 + Math.sin(elapsed * 1.1 + 0.5) * 0.07;
    }
    if (this.playerTwoOpponentOrb) {
      this.playerTwoOpponentOrb.rotation.y = elapsed * 0.25;
      this.playerTwoOpponentOrb.position.y = 2.5 + Math.sin(elapsed * 1.1 + 0.5) * 0.07;
    }

    this.renderer.render(this.scene, this.camera);
  }

  // Zoom camera to specific player's area
  zoomToPlayer(isPlayerOne) {
    const targetState = isPlayerOne ? this.cameraStates.playerOne : this.cameraStates.playerTwo;
    
    // Animate camera transition
    const startPos = {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z
    };
    
    const startLookAt = this.currentCameraTarget || { x: 0, y: 0, z: 0 };
    
    new TWEEN.Tween(startPos)
      .to(targetState.position, 1500)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        this.camera.position.set(startPos.x, startPos.y, startPos.z);
      })
      .start();
    
    new TWEEN.Tween(startLookAt)
      .to(targetState.lookAt, 1500)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        this.camera.lookAt(startLookAt.x, startLookAt.y, startLookAt.z);
        this.currentCameraTarget = { ...startLookAt };
      })
      .start();
  }

  // Show overview of both players
  showOverview() {
    const targetState = this.cameraStates.overview;
    
    const startPos = {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z
    };
    
    const startLookAt = this.currentCameraTarget || { x: 0, y: 0, z: 0 };
    
    new TWEEN.Tween(startPos)
      .to(targetState.position, 1500)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        this.camera.position.set(startPos.x, startPos.y, startPos.z);
      })
      .start();
    
    new TWEEN.Tween(startLookAt)
      .to(targetState.lookAt, 1500)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        this.camera.lookAt(startLookAt.x, startLookAt.y, startLookAt.z);
        this.currentCameraTarget = { ...startLookAt };
      })
      .start();
  }

  handleResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  dispose() {
    // Remove click handler
    if (this.clickHandler && this.renderer && this.renderer.domElement) {
      this.renderer.domElement.removeEventListener('click', this.clickHandler);
      this.clickHandler = null;
    }
    
    // Clean up preview lines
    [...this.playerOnePreviewLines, ...this.playerTwoPreviewLines].forEach(line => {
      this.scene.remove(line);
      line.geometry.dispose();
      line.material.dispose();
    });
    
    // Clean up resources
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }

    // Dispose of all meshes
    this.scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
}
