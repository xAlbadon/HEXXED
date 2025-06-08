import * as THREE from 'three';
import * as TWEEN from 'tween.js';
export class GameWorld {
  constructor(container) {
    this.container = container;
    this.clock = new THREE.Clock();
    
    this.initRenderer();
    this.initScene();
    this.initCamera(); // Initial camera setup
    this.initLighting();
    this.initEnvironment();
    this.initInteraction();
    this.maxOrbRadius = 5; // Initial default, will be updated by updateCameraZoom
  }

  initRenderer() {
    // Clean up any existing canvas first
    const existingCanvas = this.container.querySelector('canvas');
    if (existingCanvas) {
      console.warn('[GameWorld] Removing existing canvas before creating new renderer.');
      existingCanvas.remove();
      // Potentially, if a renderer instance was associated, call renderer.dispose() here,
      // but we don't have access to a previous renderer instance in this specific init method.
    }
    try {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance" // Request high-performance context
        });
    } catch (e) {
        console.error("[GameWorld] Error creating WebGLRenderer:", e);
        // Display a user-friendly message or fallback
        this.container.innerHTML = '<div style="color:white; text-align:center; padding-top: 50px;">Sorry, your browser could not initialize the 3D graphics (WebGL). Please try refreshing, updating your browser, or checking browser settings.</div>';
        throw e; // Re-throw to stop further game initialization
    }
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x2d1b69, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x2d1b69, 10, 50); // Increased far plane for potentially higher camera
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 15, 0.01); // Start higher for top-down, small Z offset
    this.camera.lookAt(0, 0, 0);
    this.baseCameraHeightY = 15; // Store base Y height for top-down view
    // this.baseCameraPositionZ is no longer needed for top-down
    // this.baseCameraPositionY (old meaning) is no longer needed
    this.minZoomDistance = 5; // Min height from the scene origin
    this.maxZoomDistance = 40; // Max height from the scene origin
  }

  initLighting() {
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0x4a4a7a, 0.4);
    this.scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    this.scene.add(directionalLight);

    // Colored accent lights
    const purpleLight = new THREE.PointLight(0x8a2be2, 0.5, 20);
    purpleLight.position.set(-5, 3, -5);
    this.scene.add(purpleLight);

    const pinkLight = new THREE.PointLight(0xff69b4, 0.3, 15);
    pinkLight.position.set(5, 2, -3);
    this.scene.add(pinkLight);
  }

  initEnvironment() {
    // Create mystical floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshLambertMaterial({
      color: 0x1a0a3a,
      transparent: true,
      opacity: 0.7
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Add floating particles for atmosphere
    this.createFloatingParticles();
  }

  createFloatingParticles() {
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 30;
      positions[i + 1] = Math.random() * 10;
      positions[i + 2] = (Math.random() - 0.5) * 30;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  initInteraction() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    this.renderer.domElement.addEventListener('click', this.handleInteraction.bind(this));
    this.renderer.domElement.addEventListener('touchend', this.handleInteraction.bind(this));
  }
  handleInteraction(event) {
    let clientX, clientY;
    const eventType = event.type;
    if (event.changedTouches && event.changedTouches.length > 0) { // Touch event
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
      console.log(`[GameWorld] Touch event (${eventType}) detected at: ${clientX.toFixed(0)}, ${clientY.toFixed(0)}`);
    } else if (event.clientX !== undefined && event.clientY !== undefined) { // Mouse event
      clientX = event.clientX;
      clientY = event.clientY;
      console.log(`[GameWorld] Mouse event (${eventType}) detected at: ${clientX.toFixed(0)}, ${clientY.toFixed(0)}`);
    } else {
      console.warn(`[GameWorld] Interaction event (${eventType}) without recognizable coordinates.`);
      return; // Cannot process if no coordinates
    }
    this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    console.log(`[GameWorld] Normalized device coordinates: X=${this.mouse.x.toFixed(3)}, Y=${this.mouse.y.toFixed(3)}`);
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    console.log('[GameWorld] Raycaster updated. Dispatching raycast event.');
    
    // Dispatch custom event with raycast results
    const intersectEvent = new CustomEvent('raycast', {
      detail: { raycaster: this.raycaster, mouse: this.mouse }
    });
    window.dispatchEvent(intersectEvent);
    
    // Prevent default for touch events to avoid potential double-actions or unwanted scrolling/zooming
    if (eventType === 'touchend' || eventType === 'touchstart' || eventType === 'touchmove') {
        event.preventDefault();
    }
  }
  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    // Animate particles
    if (this.particles) {
      this.particles.rotation.y += 0.001;
    }
    this.renderer.render(this.scene, this.camera);
  }
updateCameraZoom(maxOrbRadius) {
    this.maxOrbRadius = Math.max(this.maxOrbRadius, maxOrbRadius); // Keep track of the largest radius of orb spread
    const aspect = this.camera.aspect;
    const tanHalfFovY = Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2);
    // Calculate the minimum camera Y distance to fit the current maxOrbRadius horizontally.
    // The fittingPaddingFactor (e.g., 1.1) adds 10% padding around the orb radius for a tighter fit.
    const fittingPaddingFactor = 1.1; 
    let targetY;
    // For portrait or square screens (aspect < 1.2), calculate Y to fit maxOrbRadius horizontally AND vertically.
    // This ensures that corner orbs (like Black/White) are visible if they define maxOrbRadius.
    if (aspect < 1.2) {
        const yFitHorizontally = (this.maxOrbRadius * fittingPaddingFactor) / (tanHalfFovY * aspect);
        const yFitVertically = (this.maxOrbRadius * fittingPaddingFactor) / tanHalfFovY;
        targetY = Math.max(yFitHorizontally, yFitVertically);
         // Add a small additional distance for portrait for better framing, less than before
        targetY += 1.0;
    } else { // Landscape screens (aspect >= 1.2)
        // Primarily fit horizontally, as vertical space is less constrained.
        targetY = (this.maxOrbRadius * fittingPaddingFactor) / (tanHalfFovY * aspect);
        // Ensure a minimum comfortable distance for landscape. Reduced the multiplier and constant.
        const comfortableLandscapeY = this.maxOrbRadius * 1.5 + 5.0; 
        targetY = Math.max(targetY, comfortableLandscapeY);
    }
    
    // Clamp the targetY to predefined min/max zoom distances.
    // MinZoomDistance might need to be lower if maxOrbRadius itself is small.
    // MaxZoomDistance can also be adjusted if needed.
    targetY = Math.max(this.minZoomDistance, Math.min(targetY, this.maxZoomDistance));
    // Smoothly animate the camera to the new Y position.
    // X and Z positions remain constant for the top-down view.
    new TWEEN.Tween(this.camera.position)
        .to({
            x: 0,    // Keep camera centered on X
            y: targetY,  // Animate to the new height
            z: 0.01  // Keep small Z offset for slight perspective
        }, 750)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();
    
    // Ensure the camera continues to look at the scene origin.
    // This is generally maintained if X and Z are 0, but good to be explicit.
    this.camera.lookAt(0, 0, 0);
}
}