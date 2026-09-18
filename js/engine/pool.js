/**
 * Object Pool and Memory Management
 * Satisfies STAB-03, STAB-09, STAB-36
 */
export class MemoryPool {
  constructor() {
    this.vectors = [];
    this.raycasters = [];
  }

  acquireVector(x = 0, y = 0, z = 0) {
    const v = this.vectors.pop() || new THREE.Vector3();
    v.set(x, y, z);
    return v;
  }

  releaseVector(v) {
    if (v) this.vectors.push(v);
  }

  static cleanSceneHierarchy(root) {
    if (!root) return;
    root.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }

  static guardNumber(val, fallback = 0) {
    if (typeof val !== 'number' || Number.isNaN(val) || !Number.isFinite(val)) {
      return fallback;
    }
    return val;
  }
}
