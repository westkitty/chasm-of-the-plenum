/**
 * 3D Interactive Raycasting & Tactical Holographic HUD
 * Satisfies UIUX-49, UIUX-50, SIMU-31
 */

export class InteractionSystem {
  constructor(scene, camera, domElement, callbacks) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.callbacks = callbacks || {}; // { onSelectNPC, onSelectBourse, onSelectCistern, onSelectBridge }

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredObject = null;

    this.createHoverIndicator();
    this.createTooltipElement();
    this.setupListeners();
  }

  createHoverIndicator() {
    // 3D holographic ring indicator
    const ringGeo = new THREE.RingGeometry(1.2, 1.6, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x44ddff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    this.indicator = new THREE.Mesh(ringGeo, ringMat);
    this.indicator.rotation.x = -Math.PI / 2;
    this.indicator.visible = false;
    this.scene.add(this.indicator);
  }

  createTooltipElement() {
    this.tooltip = document.createElement('div');
    this.tooltip.id = 'holo-tooltip';
    this.tooltip.className = 'holo-tooltip';
    this.tooltip.style.display = 'none';
    this.tooltip.innerHTML = `
      <div class="holo-header">
        <span id="holo-title">TACTICAL TARGET</span>
        <span id="holo-tier" class="badge">SHELF</span>
      </div>
      <div id="holo-desc" class="holo-desc">Target description</div>
      <div id="holo-action" class="holo-action">[CLICK TO INTERACT]</div>
    `;
    document.body.appendChild(this.tooltip);
  }

  setupListeners() {
    this.domElement.addEventListener('mousemove', (e) => {
      const rect = this.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Position tooltip near cursor
      this.tooltip.style.left = `${e.clientX + 16}px`;
      this.tooltip.style.top = `${e.clientY + 16}px`;
    });

    this.domElement.addEventListener('click', () => {
      if (this.hoveredObject && this.hoveredObject.userData) {
        const u = this.hoveredObject.userData;
        if (u.type === 'npc' && this.callbacks.onSelectNPC) {
          this.callbacks.onSelectNPC(u.npcId);
        } else if (u.type === 'bourse' && this.callbacks.onSelectBourse) {
          this.callbacks.onSelectBourse();
        } else if (u.type === 'cistern' && this.callbacks.onSelectCistern) {
          this.callbacks.onSelectCistern();
        } else if (u.type === 'bridge' && this.callbacks.onSelectBridge) {
          this.callbacks.onSelectBridge();
        }
      }
    });
  }

  update() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    let target = null;
    for (const hit of intersects) {
      // Find parent with userData
      let obj = hit.object;
      while (obj && !obj.userData?.type && obj !== this.scene) {
        obj = obj.parent;
      }
      if (obj && obj.userData?.type) {
        target = obj;
        break;
      }
    }

    if (target) {
      this.hoveredObject = target;
      const u = target.userData;

      this.indicator.visible = true;
      this.indicator.position.set(target.position.x, target.position.y + 0.1, target.position.z);
      this.indicator.scale.set(u.type === 'npc' ? 1.5 : 8, u.type === 'npc' ? 1.5 : 8, 1);

      this.tooltip.style.display = 'block';
      const titleEl = document.getElementById('holo-title');
      const tierEl = document.getElementById('holo-tier');
      const descEl = document.getElementById('holo-desc');
      const actionEl = document.getElementById('holo-action');

      if (u.type === 'npc') {
        if (titleEl) titleEl.textContent = u.name;
        if (tierEl) tierEl.textContent = u.tier.toUpperCase();
        if (descEl) descEl.textContent = `${u.role} — 32h routine active`;
        if (actionEl) actionEl.textContent = '[CLICK TO INSPECT DOSSIER]';
      } else if (u.type === 'bourse') {
        if (titleEl) titleEl.textContent = 'SIPHON-BOURSE ARCADE';
        if (tierEl) tierEl.textContent = 'SHELF (710m)';
        if (descEl) descEl.textContent = 'Central commodity exchange for water scrip and vitrified timber.';
        if (actionEl) actionEl.textContent = '[CLICK TO OPEN BOURSE]';
      } else if (u.type === 'cistern') {
        if (titleEl) titleEl.textContent = 'GREAT CISTERN RIM';
        if (tierEl) tierEl.textContent = 'HIGH SCARP (1,400m)';
        if (descEl) descEl.textContent = 'Primary freshwater reservoir feeding cliffside flumes and rinse baths.';
        if (actionEl) actionEl.textContent = '[CLICK TO RINSE PLEATS (1L)]';
      } else if (u.type === 'bridge') {
        if (titleEl) titleEl.textContent = 'HANGING SPAN OF GHRAT';
        if (tierEl) tierEl.textContent = 'SHELF (712m)';
        if (descEl) descEl.textContent = 'Suspension span connecting the Strake to the West Siphon Pylon.';
        if (actionEl) actionEl.textContent = '[CLICK TO AUDIT STATUS]';
      }
    } else {
      this.hoveredObject = null;
      this.indicator.visible = false;
      this.tooltip.style.display = 'none';
    }
  }
}
