/**
 * Director Photo Mode & Snapshot Export
 * Satisfies UIUX-37
 */
export class PhotoMode {
  constructor(renderer, camera) {
    this.renderer = renderer;
    this.camera = camera;
    this.isActive = false;
    this.gridElement = document.getElementById('photo-grid');
  }

  toggle() {
    this.isActive = !this.isActive;
    if (this.gridElement) {
      this.gridElement.style.display = this.isActive ? 'block' : 'none';
    }
  }

  capturePNG() {
    const dataUrl = this.renderer.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `chasm_plenum_snapshot_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
