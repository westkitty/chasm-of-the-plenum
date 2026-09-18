/**
 * Volumetric Rising/Falling Brine Ocean
 * Satisfies SIMU-02, SIMU-04
 */
export class BrineOcean {
  constructor(scene, state) {
    this.scene = scene;
    this.state = state;

    const geo = new THREE.PlaneGeometry(500, 2400, 64, 64);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x114433,
      roughness: 0.2,
      metalness: 0.4,
      transparent: true,
      opacity: 0.88
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.set(0, 50, 0); // Base floor Y=50
    this.scene.add(this.mesh);
  }

  update(deltaSec) {
    // Brine depth rises from 0 to 60m (Y: 50 to 110)
    const flood = this.state.floodDepth || 0;
    this.mesh.position.y = 50 + flood;
  }
}
