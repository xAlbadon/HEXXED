import * as THREE from 'three';
import * as TWEEN from 'tween.js';
export class ColorOrbManager {
  constructor(scene, camera, onOrbClick, radiiConfig, baseRingYOffsets) {
    this.scene = scene;
    this.camera = camera;
    this.onOrbClick = onOrbClick;
    this.radiiConfig = radiiConfig || { 2: 6.5, 3: 8.0, 4: 9.5 }; // Default radii
    this.baseRingYOffsets = baseRingYOffsets || { 1: 0.5, 2: 0.8, 3: 0.85, 4: 0.9 }; // Default Y offsets
    this.orbs = [];
    this.selectedOrbs = new Set();
    this.textLabelFont = 'Bold 32px "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande", "Lucida Sans", Arial, sans-serif'; // Thematic font
    this.textLabelScale = 0.035; // Slightly smaller scale for text labels
    this.setupInteraction();
  }

  setupInteraction() {
    window.addEventListener('raycast', (event) => {
      const { raycaster } = event.detail;
      if (!this.orbs || this.orbs.length === 0) {
        console.log('[ColorOrbManager] Raycast event received, but no orbs to check.');
        return;
      }
      const orbMeshes = this.orbs.map(orb => orb.mesh);
      // We want to check against both the main mesh and its glowMesh directly.
      // Populate raycastTargets with all relevant meshes (main orb mesh and glow mesh).
      const raycastTargets = [];
      this.orbs.forEach(o => {
        raycastTargets.push(o.mesh); // Add main orb mesh
        if (o.glowMesh) {
          raycastTargets.push(o.glowMesh); // Add glow mesh
        }
      });
      const intersects = raycaster.intersectObjects(raycastTargets, false); // recursive: false, as we provide all meshes directly.
      
      console.log(`[ColorOrbManager] Raycast event. Orbs checked: ${this.orbs.length}, Raycast targets: ${raycastTargets.length}, Intersects found: ${intersects.length}`);
      
      if (intersects.length > 0) {
        const intersectedThreeObject = intersects[0].object;
        // Retrieve the orb reference from userData (set during orb creation)
        const orb = intersectedThreeObject.userData.orb; 
        
        if (orb && this.onOrbClick) {
          console.log(`[ColorOrbManager] Orb '${orb.colorData.name}' found via userData. Intersected mesh: '${intersectedThreeObject.name || 'unnamed'}'. Calling onOrbClick.`);
          this.onOrbClick(orb);
        } else if (!orb) {
          console.warn('[ColorOrbManager] Intersected object did not have a valid orb reference in userData:', intersectedThreeObject);
        } else if (!this.onOrbClick) {
          console.warn('[ColorOrbManager] Orb found, but onOrbClick callback is not defined.');
        }
      }
    });
  }

  createOrb(colorData, position, animate = false) {
    const geometry = new THREE.SphereGeometry(0.4, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: colorData.hex,
      emissive: colorData.hex, // Orb emits its own color
      emissiveIntensity: 0.15, // Reduced intensity for the emission
      roughness: 0.4,         // Slightly rougher surface
      metalness: 0.1,         // Slightly metallic (unchanged)
      transparent: true,
      opacity: 0.9
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: colorData.hex,
      transparent: true,
      opacity: 0.2, // Reduced outer glow opacity
      blending: THREE.AdditiveBlending
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.name = 'orbGlow'; // Assign a name to identify glow meshes
    mesh.add(glowMesh);
    const orb = {
      mesh,
      glowMesh,
      colorData,
      basePosition: position.clone(),
      animationOffset: Math.random() * Math.PI * 2,
      pulseSpeed: 1 + Math.random() * 0.5,
      complexityRings: [],
      textLabel: null // Placeholder for the text label
    };
    // Store a reference to the orb object in the userData of its meshes for easy retrieval during raycasting
    mesh.userData.orb = orb;
    if (glowMesh) { // glowMesh should always exist based on current logic
        glowMesh.userData.orb = orb;
    }
    // Add complexity rings
    if (colorData.mixArity && colorData.mixArity > 1) {
        const ringColors = [0xffffff, 0xc0c0c0, 0xffd700]; // White, Silver, Gold for 2, 3, 4 mix orbs respectively
        const baseRingRadius = 0.45; // Just outside the orb's sphere
        const radiusStep = 0.06; // Space between concentric rings
        const ringThickness = 0.02;
        // mixArity 2 gets 1 ring, 3 gets 2 rings, etc.
        const numberOfRings = colorData.mixArity - 1; 
        for (let i = 0; i < numberOfRings; i++) {
            // Use the first color for all rings of a 2-mix, second for 3-mix, etc.
            // Or, cycle through colors if more rings than defined colors.
            const ringColorIndex = Math.min(i, ringColors.length -1);
            
            const currentRingRadius = baseRingRadius + (i * radiusStep);
            const complexityRingGeometry = new THREE.RingGeometry(
                currentRingRadius,
                currentRingRadius + ringThickness,
                32
            );
            const complexityRingMaterial = new THREE.MeshBasicMaterial({
                color: ringColors[ringColorIndex],
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.75,
                depthWrite: false // Prevent rings from incorrectly occluding/being occluded by orb surface
            });
            const complexityRingMesh = new THREE.Mesh(complexityRingGeometry, complexityRingMaterial);
            complexityRingMesh.renderOrder = 1; // Ensure rings are rendered after the main orb body
            complexityRingMesh.rotation.x = Math.PI / 2; // Orient horizontally
            mesh.add(complexityRingMesh);
            orb.complexityRings.push(complexityRingMesh);
        }
    }
    // Create and add text label
    orb.textLabel = this.createTextLabel(orb.colorData.name);
    orb.textLabel.position.set(0, 0.8, 0); // Position slightly higher above the orb
    orb.textLabel.visible = false; // Initially hidden
    mesh.add(orb.textLabel); // Add as child of the orb mesh
    this.orbs.push(orb);
    this.scene.add(mesh);
    if (animate) {
      this.animateOrbEntry(orb);
    }
    return orb;
  }

  animateOrbEntry(orb) {
    // Start from above and animate down
    orb.mesh.position.y += 5;
    orb.mesh.scale.set(0, 0, 0);

    new TWEEN.Tween(orb.mesh.position)
      .to({ y: orb.basePosition.y }, 1000)
      .easing(TWEEN.Easing.Bounce.Out)
      .start();

    new TWEEN.Tween(orb.mesh.scale)
      .to({ x: 1, y: 1, z: 1 }, 800)
      .easing(TWEEN.Easing.Back.Out)
      .start();
  }

  selectOrb(orb) {
    this.selectedOrbs.add(orb);
    // if (orb.textLabel) { // Text labels on orbs are no longer shown on selection
    //   orb.textLabel.visible = true; 
    // }
    // Scale up and add selection ring
    new TWEEN.Tween(orb.mesh.scale)
      .to({ x: 1.3, y: 1.3, z: 1.3 }, 200)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();

    // Create selection ring
    const ringGeometry = new THREE.RingGeometry(0.6, 0.7, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    orb.selectionRing = new THREE.Mesh(ringGeometry, ringMaterial);
    orb.selectionRing.rotation.x = Math.PI / 2;
    orb.mesh.add(orb.selectionRing);
  }

  deselectOrb(orb) {
    this.selectedOrbs.delete(orb);
    if (orb.textLabel) {
      orb.textLabel.visible = false;
    }
    // Scale back down
    new TWEEN.Tween(orb.mesh.scale)
      .to({ x: 1, y: 1, z: 1 }, 200)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();

    // Remove selection ring
    if (orb.selectionRing) {
      orb.mesh.remove(orb.selectionRing);
      orb.selectionRing = null;
    }
  }

  update(deltaTime) {
    TWEEN.update(); // Critical for all TWEEN animations used by orbs
    
    const time = Date.now() * 0.001; // Current time for sinusoidal animations
    
    this.orbs.forEach(orb => {
      // Floating animation
      orb.mesh.position.y = orb.basePosition.y + 
        Math.sin(time * orb.pulseSpeed + orb.animationOffset) * 0.1;
      
      // Gentle rotation
      orb.mesh.rotation.y += deltaTime * 0.5;
      
      // Pulsing glow
      if (orb.glowMesh) {
        orb.glowMesh.material.opacity = 0.1 + 
          Math.sin(time * 2 + orb.animationOffset) * 0.1;
      }
      
      // Selection ring rotation
      if (orb.selectionRing) {
        orb.selectionRing.rotation.z += deltaTime * 2;
      }
      // Complexity rings animation
      if (orb.complexityRings && orb.complexityRings.length > 0) {
        orb.complexityRings.forEach((ring, index) => {
          // Slow, alternating rotation for each ring
          ring.rotation.z += deltaTime * (0.3 + index * 0.1) * (index % 2 === 0 ? 1 : -1);
        });
      }
    });
  }
  recalculateRingLayout(mixArity) {
    if (mixArity < 2) return; // Primary orbs (arity 1) have their own fixed layout logic
    const orbsInRing = this.orbs.filter(
      (orb) => orb.colorData.mixArity === mixArity && !orb.colorData.isPrimary
    );
    if (orbsInRing.length === 0) return;
    const radius = this.radiiConfig[mixArity];
    const yOffset = this.baseRingYOffsets[mixArity];
    if (radius === undefined || yOffset === undefined) {
      console.warn(`[ColorOrbManager.recalculateRingLayout] No radius or yOffset defined for mixArity: ${mixArity}. Skipping layout for this ring.`);
      return;
    }
    const angleStep = (Math.PI * 2) / orbsInRing.length;
    orbsInRing.forEach((orb, index) => {
      const angle = index * angleStep;
      const newPosition = new THREE.Vector3(
        Math.cos(angle) * radius,
        yOffset, // Using the consistent Y offset for the ring
        Math.sin(angle) * radius
      );
      // Update the orb's logical base position
      orb.basePosition.copy(newPosition);
      // Animate the orb's mesh to the new base position
      new TWEEN.Tween(orb.mesh.position)
        .to({ x: newPosition.x, y: newPosition.y, z: newPosition.z }, 750)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();
    });
  }
  removeOrb(orbToRemove, onRemovalCompleteCallback) {
    const index = this.orbs.indexOf(orbToRemove);
    if (index > -1) {
      const removedOrbMixArity = orbToRemove.colorData.mixArity;
      new TWEEN.Tween(orbToRemove.mesh.scale)
        .to({ x: 0.01, y: 0.01, z: 0.01 }, 500)
        .easing(TWEEN.Easing.Quadratic.In)
        .start();
      new TWEEN.Tween(orbToRemove.mesh.material)
        .to({ opacity: 0 }, 500)
        .easing(TWEEN.Easing.Quadratic.In)
        .onComplete(() => {
          this.scene.remove(orbToRemove.mesh);
          if (orbToRemove.mesh.geometry) orbToRemove.mesh.geometry.dispose();
          if (orbToRemove.mesh.material) orbToRemove.mesh.material.dispose();
          if (orbToRemove.glowMesh) {
            if (orbToRemove.glowMesh.geometry) orbToRemove.glowMesh.geometry.dispose();
            if (orbToRemove.glowMesh.material) orbToRemove.glowMesh.material.dispose();
          }
          orbToRemove.complexityRings.forEach(ringMesh => {
            if (ringMesh.geometry) ringMesh.geometry.dispose();
            if (ringMesh.material) ringMesh.material.dispose();
          });
          if (orbToRemove.selectionRing) {
            orbToRemove.mesh.remove(orbToRemove.selectionRing);
            if (orbToRemove.selectionRing.geometry) orbToRemove.selectionRing.geometry.dispose();
            if (orbToRemove.selectionRing.material) orbToRemove.selectionRing.material.dispose();
          }
          // Dispose and remove text label
          if (orbToRemove.textLabel) {
            if (orbToRemove.textLabel.material.map) {
              orbToRemove.textLabel.material.map.dispose();
            }
            orbToRemove.textLabel.material.dispose();
            // No geometry to dispose for THREE.Sprite
            orbToRemove.mesh.remove(orbToRemove.textLabel); // Remove from parent mesh
          }
          
          // Remove from internal orbs array *after* cleanup
          this.orbs.splice(index, 1);
          // If the orb was selected, remove it from selectedOrbs as well
          if (this.selectedOrbs.has(orbToRemove)) {
            this.selectedOrbs.delete(orbToRemove);
          }
          
          console.log(`[ColorOrbManager] Orb ${orbToRemove.colorData.name} fully removed and disposed.`);
          // Recalculate layout for the ring the orb belonged to
          if (removedOrbMixArity >= 2) {
            this.recalculateRingLayout(removedOrbMixArity);
          }
          // Execute the callback after everything is done
          if (onRemovalCompleteCallback) {
            onRemovalCompleteCallback();
          }
        })
        .start();
      
      // Note: Splicing is now done in onComplete to ensure recalculateRingLayout uses the correct count.
      return true;
    }
    console.warn(`[ColorOrbManager] Orb ${orbToRemove.colorData.name} not found for removal.`);
    return false;
  }
  createTextLabel(message) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = this.textLabelFont;
    
    // Measure text width for canvas sizing
    const metrics = context.measureText(message);
    const textWidth = metrics.width;
    
    // Estimate text height. Using actualBoundingBoxAscent/Descent is more accurate if available.
    // Fallback to font size parsing if not.
    let textHeight = 0;
    if (metrics.actualBoundingBoxAscent && metrics.actualBoundingBoxDescent) {
        textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    } else {
        // Fallback to parsing font size (less reliable for actual painted height)
        const fontSizeMatch = this.textLabelFont.match(/(\d+)\s*px/i);
        textHeight = fontSizeMatch ? parseInt(fontSizeMatch[1], 10) : 40; // Default to 40 if parse fails
    }
    const paddingWidth = 20; // Horizontal padding
    const paddingHeight = 10; // Vertical padding
    // Ensure canvas dimensions are never zero.
    canvas.width = Math.max(1, Math.ceil(textWidth + paddingWidth));
    canvas.height = Math.max(1, Math.ceil(textHeight + paddingHeight));
    
    // Re-apply font after canvas resize (important for some browsers)
    context.font = this.textLabelFont;
    
    // Rounded rectangle background
    const cornerRadius = 10;
    context.fillStyle = 'rgba(20, 10, 40, 0.75)'; // Dark purple, semi-transparent
    context.beginPath();
    context.moveTo(cornerRadius, 0);
    context.lineTo(canvas.width - cornerRadius, 0);
    context.quadraticCurveTo(canvas.width, 0, canvas.width, cornerRadius);
    context.lineTo(canvas.width, canvas.height - cornerRadius);
    context.quadraticCurveTo(canvas.width, canvas.height, canvas.width - cornerRadius, canvas.height);
    context.lineTo(cornerRadius, canvas.height);
    context.quadraticCurveTo(0, canvas.height, 0, canvas.height - cornerRadius);
    context.lineTo(0, cornerRadius);
    context.quadraticCurveTo(0, 0, cornerRadius, 0);
    context.closePath();
    context.fill();
    // Text properties
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = 'rgba(230, 230, 255, 0.95)'; // Light lavender text
    context.shadowColor = 'rgba(0, 0, 0, 0.7)';
    context.shadowBlur = 3;
    context.shadowOffsetX = 1;
    context.shadowOffsetY = 1;
    
    // Draw text centered in the padded canvas
    context.fillText(message, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true; // Ensure texture is updated
    texture.minFilter = THREE.LinearFilter; // Avoids mipmap generation, can help with non-power-of-two textures
    const material = new THREE.SpriteMaterial({ 
        map: texture, 
        transparent: true, 
        depthTest: false, // Render on top of other objects
        depthWrite: false, // Don't write to depth buffer
        sizeAttenuation: false, // Scale in world units, not screen pixels
        renderOrder: 999, // Attempt to render last (on top)
        fog: false // Ensure labels are not affected by scene fog
    });
    const sprite = new THREE.Sprite(material);
    
    // Scale the sprite. With sizeAttenuation: false, this.textLabelScale is world height.
    // Scale the sprite. With sizeAttenuation: false, this.textLabelScale is world height.
    // Ensure aspect ratio is valid.
    const aspect = (canvas.height > 0) ? (canvas.width / canvas.height) : 1;
    sprite.scale.set(this.textLabelScale * aspect, this.textLabelScale, 1);
    console.log(`[ColorOrbManager] createTextLabel for "${message}": canvas W=${canvas.width}, H=${canvas.height}, aspect=${aspect.toFixed(2)}, spriteScale=(${sprite.scale.x.toFixed(2)}, ${sprite.scale.y.toFixed(2)})`);
    return sprite;
  }
}