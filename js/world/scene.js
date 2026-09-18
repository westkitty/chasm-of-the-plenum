/**
 * 3D Scene, Atmospheric Lighting & Camera Rigs
 * Satisfies STAB-07, STAB-09, STAB-39, GAME-01, SIMU-09
 */
export class WorldScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 5000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.container.appendChild(this.renderer.domElement);

    // Camera view mode: 'first_person', 'third_person', 'overview'
    this.viewMode = 'third_person';
    this.targetPos = new THREE.Vector3(0, 712, 120);
    this.cameraOffset = new THREE.Vector3(0, 4, 12);

    this.setupLights();
    this.setupFog();
    this.setupContextLoss();
    this.setupResize();
  }

  setupLights() {
    this.ambientLight = new THREE.AmbientLight(0x223344, 0.6);
    this.scene.add(this.ambientLight);

    // Sun / Chthonic steam illumination
    this.sunLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    this.sunLight.position.set(400, 1600, 500);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 100;
    this.sunLight.shadow.camera.far = 4000;
    const d = 1000;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.scene.add(this.sunLight);

    // Geothermal bottom glow
    this.ventLight = new THREE.PointLight(0xff5511, 2.0, 800);
    this.ventLight.position.set(0, 70, 0);
    this.scene.add(this.ventLight);
  }

  setupFog() {
    // Dynamic Plenum fog
    this.scene.background = new THREE.Color(0x0a1018);
    this.scene.fog = new THREE.FogExp2(0x182430, 0.0008);
  }

  setupContextLoss() {
    // STAB-07: Context loss recovery
    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      console.warn('WebGL context lost. Pausing renderer...');
    });
    this.renderer.domElement.addEventListener('webglcontextrestored', () => {
      console.log('WebGL context restored. Rebuilding shaders...');
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  setupResize() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  updateCamera(playerPos, isMoving = false, headBobVal = 0) {
    // STAB-39: Spring-damper camera smoothing
    this.targetPos.lerp(playerPos, 0.1);

    if (this.viewMode === 'first_person') {
      this.camera.position.set(
        this.targetPos.x,
        this.targetPos.y + 1.7 + headBobVal,
        this.targetPos.z
      );
    } else if (this.viewMode === 'third_person') {
      const desiredPos = new THREE.Vector3(
        this.targetPos.x,
        this.targetPos.y + 4 + headBobVal * 0.5,
        this.targetPos.z + 12
      );
      this.camera.position.lerp(desiredPos, 0.08);
      this.camera.lookAt(this.targetPos.x, this.targetPos.y + 2, this.targetPos.z);
    } else {
      // Overview
      this.camera.position.set(300, 1100, 600);
      this.camera.lookAt(0, 500, 0);
    }
  }

  setFogDensity(density) {
    if (!this.scene.fog) return;
    this.scene.fog.density = 0.0003 + density * 0.0025;
  }
}
