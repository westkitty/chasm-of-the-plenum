/**
 * Procedural Canvas Texture Synthesizer (100% Offline & Pure Canvas)
 * Generates rich PBR-like textures for basalt rock strata, timber, masonry, and crystals.
 */

export class TextureSynthesizer {
  static createBasaltTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base dark basalt gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#12161c');
    grad.addColorStop(0.3, '#191f27');
    grad.addColorStop(0.6, '#141820');
    grad.addColorStop(1, '#0e1116');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Geological horizontal rock strata striations
    for (let y = 0; y < 512; y += 4) {
      const alpha = 0.05 + Math.sin(y * 0.08) * 0.04 + Math.sin(y * 0.02) * 0.03;
      ctx.fillStyle = y % 32 < 8 ? `rgba(45, 55, 68, ${alpha * 1.5})` : `rgba(20, 25, 32, ${alpha})`;
      ctx.fillRect(0, y, 512, 4);
    }

    // Mineral flecks and noise
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 25;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise * 1.2)); // Slight silica blue-gray
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 12);
    return texture;
  }

  static createTimberTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base weathered wood
    ctx.fillStyle = '#423325';
    ctx.fillRect(0, 0, 512, 512);

    // Plank slats
    const plankHeight = 64;
    for (let y = 0; y < 512; y += plankHeight) {
      // Grain
      for (let gy = y; gy < y + plankHeight; gy += 2) {
        const grainAlpha = 0.08 + Math.random() * 0.12;
        ctx.fillStyle = `rgba(30, 20, 10, ${grainAlpha})`;
        ctx.fillRect(0, gy, 512, 2);
      }

      // Plank separator gap
      ctx.fillStyle = '#16100a';
      ctx.fillRect(0, y, 512, 4);

      // Iron rivet bolts at intervals
      for (let rx = 32; rx < 512; rx += 128) {
        ctx.beginPath();
        ctx.arc(rx, y + plankHeight / 2, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#111111';
        ctx.fill();
        ctx.strokeStyle = '#665544';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 4);
    return texture;
  }

  static createMasonryTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Ashlar stone masonry
    ctx.fillStyle = '#262c33';
    ctx.fillRect(0, 0, 512, 512);

    const rowH = 32;
    const colW = 64;
    for (let y = 0; y < 512; y += rowH) {
      const offsetX = (y / rowH) % 2 === 0 ? 0 : colW / 2;
      for (let x = -colW; x < 512 + colW; x += colW) {
        const bx = x + offsetX;
        // Stone shading
        const tone = 30 + Math.floor(Math.random() * 20);
        ctx.fillStyle = `rgb(${tone}, ${tone + 4}, ${tone + 8})`;
        ctx.fillRect(bx + 2, y + 2, colW - 4, rowH - 4);

        // Mortar lines
        ctx.strokeStyle = '#11151a';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx + 1, y + 1, colW - 2, rowH - 2);
      }
    }

    // Windows with warm amber oil light
    for (let wy = 64; wy < 448; wy += 128) {
      for (let wx = 64; wx < 448; wx += 128) {
        ctx.fillStyle = '#ffaa33';
        ctx.fillRect(wx, wy, 24, 32);
        // Window mullion cross
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(wx + 11, wy, 2, 32);
        ctx.fillRect(wx, wy + 15, 24, 2);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  static createWaterTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a2e28';
    ctx.fillRect(0, 0, 256, 256);

    // Swirling brine caustics
    for (let i = 0; i < 60; i++) {
      const cx = Math.random() * 256;
      const cy = Math.random() * 256;
      const r = 15 + Math.random() * 45;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(120, 240, 200, ${0.05 + Math.random() * 0.1})`;
      ctx.lineWidth = 3 + Math.random() * 5;
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 32);
    return texture;
  }

  static createCrystalTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Silica crystal gradient
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, '#55ddcc');
    grad.addColorStop(0.5, '#227766');
    grad.addColorStop(1, '#99ffee');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Facet lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 16; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 256, 0);
      ctx.lineTo(Math.random() * 256, 256);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }
}
