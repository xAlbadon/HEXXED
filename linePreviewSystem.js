import * as THREE from 'three';
import * as TWEEN from 'tween.js';

export class LinePreviewSystem {
    constructor(scene) {
        this.scene = scene;
        this.previewLines = [];
        this.previewPool = null;
        this.centerPoint = new THREE.Vector3(0, 0.05, 0); // Slightly above the floor
        this.lineMaterialCache = {}; // To reuse materials
        this.poolMaterial = null;
    }

    getLineMaterial(hexColor) {
        if (!this.lineMaterialCache[hexColor]) {
            this.lineMaterialCache[hexColor] = new THREE.LineBasicMaterial({
                color: new THREE.Color(hexColor),
                linewidth: 2, // Note: linewidth > 1 might not work on all platforms/drivers
                transparent: true,
                opacity: 0
            });
        }
        return this.lineMaterialCache[hexColor];
    }

    updatePreview(selectedOrbs, potentialMixedColor) {
        this.clearPreviewVisuals(true); // Clear existing visuals before creating new ones

        if (selectedOrbs.length < 2 || !potentialMixedColor) {
            return;
        }

        // Create lines from each selected orb to the center
        // Create lines from each selected orb to the center
        selectedOrbs.forEach(orb => {
            const material = this.getLineMaterial(orb.colorData.hex);
            let startPoint;
            // For primary Black or White orbs, connect the line to their non-animated base position.
            // This makes the line connection stable despite the orb's bobbing animation.
            // For other orbs, connect to their current animated mesh position.
            if (orb.colorData.isShadingColor && orb.colorData.isPrimary) {
                startPoint = orb.basePosition.clone();
            } else {
                startPoint = orb.mesh.position.clone();
            }
            const points = [
                startPoint, // Start at orb (either base or mesh position)
                this.centerPoint.clone()      // End at center
            ];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            line.userData.isPreviewLine = true; // Tag for easy identification/cleanup
            
            this.scene.add(line);
            this.previewLines.push(line);
            // Animate line opacity
            new TWEEN.Tween(material)
                .to({ opacity: 0.85 }, 300)
                .easing(TWEEN.Easing.Sinusoidal.Out)
                .start();
        });

        // Create preview pool
        if (this.previewPool) {
             this.scene.remove(this.previewPool);
             if (this.previewPool.geometry) this.previewPool.geometry.dispose();
             if (this.previewPool.material) this.previewPool.material.dispose();
             this.previewPool = null;
        }

        const poolGeometry = new THREE.CircleGeometry(0.8, 32); // Radius 0.8
        this.poolMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(potentialMixedColor.hex),
            transparent: true,
            opacity: 0, // Start transparent
            side: THREE.DoubleSide
        });
        this.previewPool = new THREE.Mesh(poolGeometry, this.poolMaterial);
        this.previewPool.position.copy(this.centerPoint);
        this.previewPool.rotation.x = -Math.PI / 2; // Lay flat on XZ plane
        this.previewPool.userData.isPreviewPool = true;
        this.scene.add(this.previewPool);

        // Animate pool scale and opacity
        this.previewPool.scale.set(0.1, 0.1, 0.1);
        new TWEEN.Tween(this.previewPool.scale)
            .to({ x: 1, y: 1, z: 1 }, 400)
            .easing(TWEEN.Easing.Elastic.Out)
            .delay(150) // Start after lines begin appearing
            .start();
        
        new TWEEN.Tween(this.poolMaterial)
            .to({ opacity: 0.75 }, 400)
            .easing(TWEEN.Easing.Sinusoidal.Out)
            .delay(150)
            .start();
    }

    clearPreview(animate = true) {
        this.clearPreviewVisuals(animate);
    }
    
    clearPreviewVisuals(animate = true) {
        this.previewLines.forEach(line => {
            if (animate) {
                new TWEEN.Tween(line.material)
                    .to({ opacity: 0 }, 250)
                    .easing(TWEEN.Easing.Sinusoidal.In)
                    .onComplete(() => {
                        this.scene.remove(line);
                        if (line.geometry) line.geometry.dispose();
                        // Material is cached, no need to dispose here unless it's the last line using it
                    })
                    .start();
            } else {
                this.scene.remove(line);
                if (line.geometry) line.geometry.dispose();
            }
        });
        this.previewLines = [];

        if (this.previewPool) {
            const poolToRemove = this.previewPool; // Keep reference for tween
            if (animate) {
                new TWEEN.Tween(poolToRemove.scale)
                    .to({ x: 0.01, y: 0.01, z: 0.01 }, 300)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .start();
                new TWEEN.Tween(poolToRemove.material)
                    .to({ opacity: 0 }, 300)
                    .easing(TWEEN.Easing.Sinusoidal.In)
                    .onComplete(() => {
                        this.scene.remove(poolToRemove);
                        if (poolToRemove.geometry) poolToRemove.geometry.dispose();
                        if (poolToRemove.material) poolToRemove.material.dispose();
                    })
                    .start();
            } else {
                this.scene.remove(poolToRemove);
                if (poolToRemove.geometry) poolToRemove.geometry.dispose();
                if (poolToRemove.material) poolToRemove.material.dispose();
            }
            this.previewPool = null;
            this.poolMaterial = null; // Clear reference to its material too
        }
    }

    update(deltaTime) {
        // TWEEN.update() is called globally, so no need here unless specific per-frame logic
        // is needed for the lines/pool beyond tweens.
        // For example, if lines needed to dynamically follow moving orbs (not the case here after selection).
    }
}