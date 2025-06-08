import * as THREE from 'three';
import * as TWEEN from 'tween.js';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
  }

  createBurst(position, color, particleCount = 50, spread = 1.5) {
    const particleMaterial = new THREE.PointsMaterial({
      color: color.hex,
      size: 0.1,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false, // Prevents particles from writing to depth buffer for better blending
    });

    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    for (let i = 0; i < particleCount; i++) {
      vertices.push(0, 0, 0); // Start all particles at the burst position
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const points = new THREE.Points(geometry, particleMaterial);
    points.position.copy(position);
    this.scene.add(points);

    const particleData = {
      points,
      velocities: [],
      lifespan: 1, // seconds
      age: 0,
    };

    // Animate each particle
    for (let i = 0; i < particleCount; i++) {
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * spread * 2,
        (Math.random() - 0.5) * spread * 2,
        (Math.random() - 0.5) * spread * 2
      );
      particleData.velocities.push(velocity);
    }
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
      for (let j = 0; j < positions.count; j++) {
        positions.setX(j, positions.getX(j) + pData.velocities[j].x * deltaTime);
        positions.setY(j, positions.getY(j) + pData.velocities[j].y * deltaTime);
        positions.setZ(j, positions.getZ(j) + pData.velocities[j].z * deltaTime);
      }
      positions.needsUpdate = true;

      // Fade out
      pData.points.material.opacity = 1 - (pData.age / pData.lifespan);
    }
  }
}