/**
 * 3D Scene, Atmospheric Lighting, OrbitControls & Camera Rigs
 * Satisfies STAB-07, STAB-09, STAB-39, GAME-01, SIMU-09, UIUX-49
 */

export class WorldScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 6000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // OrbitControls for tactical drone & free inspection
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 3000;
    this.controls.minDistance = 5;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't flip under canyon floor
    this.controls.target.set(-160, 710, 0);

    // Camera view modes: 'orbit', 'third_person', 'first_person', 'fly_to'
    this.viewMode = 'orbit';
    this.targetPos = new THREE.Vector3(-160, 710, 0);
    this.cameraOffset = new THREE.Vector3(0, 4, 14);

    // Fly-to transition state
    this.flight = {
      active: false,
      startCamPos: new THREE.Vector3(),
      targetCamPos: new THREE.Vector3(),
      startLookAt: new THREE.Vector3(),
      targetLookAt: new THREE.Vector3(),
      elapsed: 0,
      duration: 1.5
    };

    this.setupLights();
    this.setupFog();
    this.setupContextLoss();
    this.setupResize();

    // Default starting camera
    this.camera.position.set(120, 850, 220);
    this.controls.update();
  }

  setupLights() {
    this.ambientLight = new THREE.AmbientLight(0x283848, 0.7);
    this.scene.add(this.ambientLight);

    // Sun light casting dynamic chasm shadows
    this.sunLight = new THREE.DirectionalLight(0xffeedd, 1.4);
    this.sunLight.position.set(350, 1600, 400);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 100;
    this.sunLight.shadow.camera.far = 4000;
    const d = 1200;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Geothermal floor vent glow
    this.ventLight = new THREE.PointLight(0xff5511, 2.8, 1200);
    this.ventLight.position.set(0, 70, 0);
    this.scene.add(this.ventLight);

    // High Scarp twilight rim light
    this.scarpLight = new THREE.DirectionalLight(0x4488bb, 0.4);
    this.scarpLight.position.set(-400, 1500, -300);
    this.scene.add(this.scarpLight);
  }

  setupFog() {
    this.scene.background = new THREE.Color(0x0e141d);
    this.scene.fog = new THREE.FogExp2(0x1a2634, 0.0007);
  }

  setupContextLoss() {
    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      console.warn('WebGL context lost. Pausing renderer...');
    });
    this.renderer.domElement.addEventListener('webglcontextrestored', () => {
      console.log('WebGL context restored.');
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

  flyTo(camPos, lookAtPos, durationSec = 1.5) {
    this.viewMode = 'fly_to';
    this.flight.active = true;
    this.flight.elapsed = 0;
    this.flight.duration = durationSec;

    this.flight.startCamPos.copy(this.camera.position);
    this.flight.targetCamPos.copy(camPos);

    this.flight.startLookAt.copy(this.controls.target);
    this.flight.targetLookAt.copy(lookAtPos);

    this.controls.enabled = false;
  }

  updateCamera(playerPos, isMoving = false, headBobVal = 0, deltaSec = 0.016) {
    if (this.viewMode === 'fly_to' && this.flight.active) {
      this.flight.elapsed += deltaSec;
      const progress = Math.min(1.0, this.flight.elapsed / this.flight.duration);
      // Smooth cubic ease-in-out
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      this.camera.position.lerpVectors(this.flight.startCamPos, this.flight.targetCamPos, ease);
      this.controls.target.lerpVectors(this.flight.startLookAt, this.flight.targetLookAt, ease);
      this.camera.lookAt(this.controls.target);

      if (progress >= 1.0) {
        this.flight.active = false;
        this.viewMode = 'orbit';
        this.controls.enabled = true;
      }
      return;
    }

    if (this.viewMode === 'orbit') {
      this.controls.enabled = true;
      this.controls.update();
      return;
    }

    this.controls.enabled = false;
    this.targetPos.lerp(playerPos, 0.12);

    if (this.viewMode === 'first_person') {
      this.camera.position.set(
        this.targetPos.x,
        this.targetPos.y + 2.8 + headBobVal,
        this.targetPos.z
      );
      this.camera.lookAt(this.targetPos.x, this.targetPos.y + 2.8, this.targetPos.z - 20);
    } else if (this.viewMode === 'third_person') {
      const desiredPos = new THREE.Vector3(
        this.targetPos.x + 8,
        this.targetPos.y + 6 + headBobVal * 0.5,
        this.targetPos.z + 18
      );
      this.camera.position.lerp(desiredPos, 0.1);
      this.camera.lookAt(this.targetPos.x, this.targetPos.y + 2.5, this.targetPos.z);
    }
  }

  updateAtmosphere(timeHours, weather) {
    // 32-hour planetary sun path across canyon
    const sunAngle = (timeHours / 32.0) * Math.PI * 2;
    const sunX = Math.cos(sunAngle) * 600;
    const sunY = 900 + Math.sin(sunAngle) * 700;
    const sunZ = Math.sin(sunAngle) * 500;
    this.sunLight.position.set(sunX, sunY, sunZ);

    // Atmosphere & Fog tuning across 4 strokes
    const stroke = timeHours < 4 ? 'GUSH' : timeHours < 14 ? 'STEAM' : timeHours < 18 ? 'DRAIN' : 'SILT';

    if (stroke === 'GUSH') {
      this.scene.background.setHex(0x0f1118);
      this.scene.fog.color.setHex(0x161a24);
      this.sunLight.color.setHex(0xddccaa);
      this.ventLight.intensity = 3.5;
    } else if (stroke === 'STEAM') {
      this.scene.background.setHex(0x221c14);
      this.scene.fog.color.setHex(0x2d2418);
      this.sunLight.color.setHex(0xffaa55);
      this.ventLight.intensity = 2.4;
    } else if (stroke === 'DRAIN') {
      this.scene.background.setHex(0x0d1824);
      this.scene.fog.color.setHex(0x182434);
      this.sunLight.color.setHex(0xffffff);
      this.ventLight.intensity = 2.0;
    } else {
      // SILT
      this.scene.background.setHex(0x0a0c10);
      this.scene.fog.color.setHex(0x12141a);
      this.sunLight.color.setHex(0x8899aa);
      this.ventLight.intensity = 2.2;
    }

    if (this.scene.fog) {
      this.scene.fog.density = 0.0004 + weather.fogDensity * 0.0022;
    }
  }

  setFogDensity(density) {
    if (!this.scene.fog) return;
    this.scene.fog.density = 0.0003 + density * 0.0022;
  }
}
