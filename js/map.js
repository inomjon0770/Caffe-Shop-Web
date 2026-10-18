// JavaGem Live Interactive Tracking Map Module (Full-Screen Canvas)
class WebTrackingMap {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.store = window.masterStore;
    this.progress = 0.45;
    this.animId = null;

    this.route = [
      { x: 0.18, y: 0.72 }, // JavaGem Cafe
      { x: 0.18, y: 0.35 },
      { x: 0.48, y: 0.35 },
      { x: 0.48, y: 0.20 },
      { x: 0.75, y: 0.20 },
      { x: 0.75, y: 0.55 },
      { x: 0.85, y: 0.55 }  // Customer Home
    ];

    this.streets = [
      { name: 'Kamarajar Salai Blvd', x1: 0.08, y1: 0.05, x2: 0.08, y2: 0.95, w: 8 },
      { name: '88th Artisan Avenue', x1: 0.18, y1: 0.05, x2: 0.18, y2: 0.95, w: 10 },
      { name: 'Central Espresso St', x1: 0.48, y1: 0.05, x2: 0.48, y2: 0.95, w: 10 },
      { name: 'Jawaharlal Nehru Road', x1: 0.75, y1: 0.05, x2: 0.75, y2: 0.95, w: 8 },
      { name: '3rd Harmony Ave', x1: 0.88, y1: 0.05, x2: 0.88, y2: 0.95, w: 8 },
      // Horizontal
      { name: '96th North Way', x1: 0.05, y1: 0.20, x2: 0.95, y2: 0.20, w: 8 },
      { name: '95th Central Boulevard', x1: 0.05, y1: 0.35, x2: 0.95, y2: 0.35, w: 12 },
      { name: '84th Roast Avenue', x1: 0.05, y1: 0.55, x2: 0.95, y2: 0.55, w: 8 },
      { name: '80th South St', x1: 0.05, y1: 0.72, x2: 0.95, y2: 0.72, w: 8 }
    ];

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.start();
  }

  resize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.width = rect.width;
    this.height = rect.height;
    this.draw();
  }

  start() {
    if (this.animId) cancelAnimationFrame(this.animId);
    const step = () => {
      this.progress += 0.0003;
      if (this.progress > 1.0) this.progress = 0.2;
      this.draw();
      this.animId = requestAnimationFrame(step);
    };
    this.animId = requestAnimationFrame(step);
  }

  getPointAlongRoute(t) {
    let totalLen = 0;
    const segs = [];
    for (let i = 0; i < this.route.length - 1; i++) {
      const p1 = this.route[i];
      const p2 = this.route[i + 1];
      const dx = (p2.x - p1.x) * this.width;
      const dy = (p2.y - p1.y) * this.height;
      const len = Math.hypot(dx, dy);
      segs.push({ p1, p2, len, start: totalLen, end: totalLen + len });
      totalLen += len;
    }

    const targetDist = t * totalLen;
    for (const s of segs) {
      if (targetDist >= s.start && targetDist <= s.end) {
        const segT = (targetDist - s.start) / s.len;
        return {
          x: (s.p1.x + (s.p2.x - s.p1.x) * segT) * this.width,
          y: (s.p1.y + (s.p2.y - s.p1.y) * segT) * this.height
        };
      }
    }
    const last = this.route[this.route.length - 1];
    return { x: last.x * this.width, y: last.y * this.height };
  }

  draw() {
    const ctx = this.ctx;
    if (!ctx) return;
    const w = this.width;
    const h = this.height;

    const isLight = document.body.classList.contains('light-theme');

    // Background Map Tone
    ctx.fillStyle = isLight ? '#EAEFF2' : '#181A1C';
    ctx.fillRect(0, 0, w, h);

    // Streets
    ctx.strokeStyle = isLight ? '#FFFFFF' : '#262A2E';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.streets.forEach(st => {
      ctx.lineWidth = st.w * 2;
      ctx.beginPath();
      ctx.moveTo(st.x1 * w, st.y1 * h);
      ctx.lineTo(st.x2 * w, st.y2 * h);
      ctx.stroke();
    });

    // Street Names
    ctx.fillStyle = isLight ? '#9CA3AF' : '#5E6570';
    ctx.font = '500 11px Sora';
    this.streets.forEach(st => {
      ctx.save();
      const midX = ((st.x1 + st.x2) / 2) * w;
      const midY = ((st.y1 + st.y2) / 2) * h;
      ctx.translate(midX, midY);
      if (st.x1 === st.x2) ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText(st.name, 0, -4);
      ctx.restore();
    });

    // Route Polyline (Caramel #C67C4E)
    ctx.strokeStyle = '#C67C4E';
    ctx.lineWidth = 5;
    ctx.beginPath();
    this.route.forEach((pt, idx) => {
      const px = pt.x * w;
      const py = pt.y * h;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Coffee Shop Pin
    const shop = this.route[0];
    const sx = shop.x * w;
    const sy = shop.y * h;
    ctx.fillStyle = '#C67C4E';
    ctx.beginPath();
    ctx.arc(sx, sy, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Sora';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☕', sx, sy);

    // Customer Home Pin
    const dest = this.route[this.route.length - 1];
    const dx = dest.x * w;
    const dy = dest.y * h;
    ctx.fillStyle = '#36B37E';
    ctx.beginPath();
    ctx.arc(dx, dy, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Sora';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📍', dx, dy);

    // Moving Courier Scooter Pin
    const pos = this.getPointAlongRoute(this.progress);
    ctx.fillStyle = 'rgba(198, 124, 78, 0.3)';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#C67C4E';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Sora';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🛵', pos.x, pos.y);
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.webTrackingMap = new WebTrackingMap('web-tracking-canvas');
    });
  } else {
    window.webTrackingMap = new WebTrackingMap('web-tracking-canvas');
  }
}
