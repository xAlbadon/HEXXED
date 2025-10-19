import * as THREE from 'three';
import * as TWEEN from 'tween.js';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
  }

  createBurst(position, colorData, particleCount = 50, spread = 1.5) {
    const particleMaterial = new THREE.PointsMaterial({
      color: colorData.hex,
      size: 0.1,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < particleCount; i++) {
      vertices.push(0, 0, 0);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const points = new THREE.Points(geometry, particleMaterial);
    points.position.copy(position);
    this.scene.add(points);
    const particleData = {
      points,
      velocities: [],
      lifespan: 1.5, // slightly longer lifespan
      age: 0,
    };
    // Animate each particle's velocity and animate the material's opacity
    for (let i = 0; i < particleCount; i++) {
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * spread * 2,
        (Math.random() - 0.5) * spread * 2,
        (Math.random() - 0.5) * spread * 2
      );
      particleData.velocities.push(velocity);
    }
    
    // Use TWEEN for a smooth fade-out
    new TWEEN.Tween(particleMaterial)
      .to({ opacity: 0 }, particleData.lifespan * 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
    this.particles.push(particleData);
  }

  update(deltaTime) {
    TWEEN.update(); // Ensure Tween updates are processed if used by particles, though not directly here

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pData = this.particles[i];
      pData.age += deltaTime;

      if (pData.age >= pData.lifespan) {
        this.scene.remove(pData.points);
        pData.points.geometry.dispose();
        pData.points.material.dispose();
        this.particles.splice(i, 1);
        continue;
      }

      const positions = pData.points.geometry.attributes.position;
      const gravity = -0.5; // A gentle downward pull
      for (let j = 0; j < positions.count; j++) {
        // Apply gravity to vertical velocity
        pData.velocities[j].y += gravity * deltaTime;
        // Update positions
        positions.setX(j, positions.getX(j) + pData.velocities[j].x * deltaTime);
        positions.setY(j, positions.getY(j) + pData.velocities[j].y * deltaTime);
        positions.setZ(j, positions.getZ(j) + pData.velocities[j].z * deltaTime);
      }
      positions.needsUpdate = true;
      // Opacity is now handled by TWEEN, so no manual update is needed here.
    }
  }
}