// ==========================================================================
// JavaGem Coffee Co. — Pro Features Manager
// Includes: AI Sommelier Quiz, Promo Engine, Thermal Receipt, Daily Spin Wheel,
// Voice Search, and Admin Analytics Charts & Exporter
// ==========================================================================

// 1. AI COFFEE SOMMELIER
class AISommelierManager {
  constructor() {
    this.currentStep = 0;
    this.answers = {};
    this.questions = [
      {
        id: 'strength',
        title: 'Qahvangiz qanchalik kuchli bo‘lishini xohlaysiz?',
        desc: 'Sizning tetiklik darajangizga mos',
        options: [
          { value: 'strong', icon: '⚡', title: 'Juda Kuchli & To‘yingan', desc: 'Ko‘proq espresso va chuqur qovurilgan' },
          { value: 'mild', icon: '☁️', title: 'Yumshoq & Kremli', desc: 'Ko‘proq ipakdek sut va silliq ta\'m' }
        ]
      },
      {
        id: 'temperature',
        title: 'Harorat qanday bo‘lsin?',
        desc: 'Bugungi ob-havo va kayfiyatingizga qarab',
        options: [
          { value: 'hot', icon: '🔥', title: 'Issiq & Isituvchi', desc: 'Finjondan bug‘i chiqib turadigan iliqlik' },
          { value: 'cold', icon: '🧊', title: 'Muzdek & Salqin', desc: 'Muz kubiklari bilan yangilovchi energiya' }
        ]
      },
      {
        id: 'sweetness',
        title: 'Shirinlik va qo‘shimchalar yoqadimi?',
        desc: 'Desert yoki sof qahva ta\'mi',
        options: [
          { value: 'sweet', icon: '🍫', title: 'Shokolad / Karamel / Shirin', desc: 'Mocha, karamel yoki vanil siropi' },
          { value: 'classic', icon: '☕', title: 'Klassik & Shirinsiz', desc: 'Tabiiy Arabica donalari hidi' }
        ]
      }
    ];
  }

  open() {
    this.currentStep = 0;
    this.answers = {};
    const modal = document.getElementById('modal-ai-sommelier');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.classList.add('modal-open');
      this.renderQuestion();
      window.soundEngine?.playClick();
    }
  }

  close() {
    const modal = document.getElementById('modal-ai-sommelier');
    if (modal) {
      modal.classList.add('hidden');
      document.body.classList.remove('modal-open');
    }
  }

  renderQuestion() {
    const container = document.getElementById('ai-sommelier-body');
    if (!container) return;

    if (this.currentStep >= this.questions.length) {
      this.renderRecommendation();
      return;
    }

    const q = this.questions[this.currentStep];
    let stepBars = '';
    for (let i = 0; i < this.questions.length; i++) {
      stepBars += `<div class="quiz-step-bar ${i <= this.currentStep ? 'active' : ''}"></div>`;
    }

    let optionsHtml = '';
    q.options.forEach(opt => {
      optionsHtml += `
        <div class="quiz-option-card" onclick="window.aiSommelier?.selectOption('${q.id}', '${opt.value}')">
          <div class="quiz-option-icon">${opt.icon}</div>
          <div class="quiz-option-title">${opt.title}</div>
          <div class="quiz-option-desc">${opt.desc}</div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="ai-quiz-header">
        <div class="ai-quiz-icon">🤖</div>
        <h3 class="ai-quiz-title">${q.title}</h3>
        <p style="font-size:13px; color:var(--text-muted);">${q.desc}</p>
        <div class="ai-quiz-step-indicator">${stepBars}</div>
      </div>
      <div class="quiz-options-grid">${optionsHtml}</div>
    `;
  }

  selectOption(questionId, value) {
    window.soundEngine?.playClick();
    this.answers[questionId] = value;
    this.currentStep++;
    this.renderQuestion();
  }

  renderRecommendation() {
    const container = document.getElementById('ai-sommelier-body');
    if (!container) return;

    // AI recommendation logic
    let matchedId = 'caffe-mocha';
    let matchReason = 'Siz uchun ipakdek yumshoq espresso, shokolad va yangi sut mutanosibligi!';

    if (this.answers.strength === 'strong' && this.answers.sweetness === 'classic') {
      matchedId = 'americano';
      matchReason = 'Kuchli va sof Arabica ta\'mi sizga ajoyib energiya beradi!';
    } else if (this.answers.temperature === 'cold') {
      matchedId = 'cold-brew';
      matchReason = '18 soat davomida sovuq damlangan, tetiklantiruvchi muzdek cold brew!';
    } else if (this.answers.sweetness === 'sweet') {
      matchedId = 'caramel-macchiato';
      matchReason = 'Karamelli va kremli shirin qatlamlar sizning sevimli lazzatingizga aylanadi!';
    } else {
      matchedId = 'cappuccino';
      matchReason = 'Qalin baxmalsimon sut ko‘pigi va boy espresso uyg‘unligi!';
    }

    const product = window.masterStore?.products.find(p => p.id === matchedId) || window.masterStore?.products[0];

    container.innerHTML = `
      <div class="ai-quiz-header">
        <div class="ai-quiz-icon">✨</div>
        <h3 class="ai-quiz-title">AI Siz Uchun Tanlagan Qahva!</h3>
        <p style="font-size:13px; color:var(--text-muted);">Sizning javoblaringiz asosida ideal ta'm aniqlandi</p>
      </div>

      <div class="ai-match-result-box">
        <img src="${product.image}" class="ai-match-img" alt="${product.name}">
        <div class="ai-match-name">${product.name}</div>
        <div style="font-size:18px; font-weight:800; color:var(--text-primary); margin-bottom:8px;">$${product.basePrice.toFixed(2)}</div>
        <div class="ai-match-reason">"${matchReason}"</div>

        <div style="display:flex; gap:10px; justify-content:center;">
          <button class="btn btn-primary" onclick="window.aiSommelier?.orderRecommended('${product.id}')">
            Finjonni Moslash & Buyurtma Berish ☕
          </button>
        </div>
      </div>
    `;
    window.soundEngine?.playSuccessChime();
  }

  orderRecommended(productId) {
    this.close();
    if (window.app?.openCustomizer) {
      window.app.openCustomizer(productId);
    }
  }
}

// 2. PROMO CODE ENGINE
class PromoCodeManager {
  constructor() {
    this.store = window.masterStore;
    this.availablePromos = {
      'JAVAMAX': { type: 'percent', value: 20, desc: '20% Chegirma' },
      'MAXCOFFEE': { type: 'fixed', value: 3.00, desc: '$3.00 Chegirma' },
      'FREESHIP': { type: 'free_delivery', value: 2.00, desc: 'Bepul Yetkazib Berish' }
    };
  }

  applyPromo(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) return { success: false, msg: 'Iltimos, promo-kodni kiriting' };

    const promo = this.availablePromos[cleanCode];
    if (!promo) {
      return { success: false, msg: 'Noto‘g‘ri promo-kod! (Misol: JAVAMAX yoki MAXCOFFEE)' };
    }

    this.store.appliedPromo = { code: cleanCode, ...promo };
    window.soundEngine?.playSuccessChime();
    window.showWebToast(`🎉 Promo-kod faollashtirildi: ${cleanCode} (${promo.desc})`, '🎁');
    this.renderPromoUI();
    if (window.renderCartDrawer) window.renderCartDrawer();
    return { success: true, promo };
  }

  removePromo() {
    this.store.appliedPromo = null;
    window.soundEngine?.playClick();
    window.showWebToast('Promo-kod bekor qilindi', 'ℹ️');
    this.renderPromoUI();
    if (window.renderCartDrawer) window.renderCartDrawer();
  }

  renderPromoUI() {
    const container = document.getElementById('cart-promo-section');
    if (!container) return;

    if (this.store.appliedPromo) {
      container.innerHTML = `
        <div class="applied-promo-tag">
          <span>🏷️ <strong>${this.store.appliedPromo.code}</strong> (${this.store.appliedPromo.desc})</span>
          <button class="btn-remove-promo" onclick="window.promoManager?.removePromo()" title="Bekor qilish">✕</button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="promo-input-row">
          <input type="text" class="form-control" id="input-cart-promo" placeholder="Promo-kod: JAVAMAX">
          <button class="btn btn-secondary btn-apply-promo" onclick="window.promoManager?.applyPromo(document.getElementById('input-cart-promo')?.value)">Qo‘llash</button>
        </div>
      `;
    }
  }
}

// 3. DIGITAL THERMAL RECEIPT
class DigitalReceiptManager {
  openReceipt(orderId) {
    const order = window.masterStore?.orders.find(o => o.id === orderId) || window.masterStore?.orders[0];
    if (!order) return;

    const modal = document.getElementById('modal-receipt');
    const container = document.getElementById('receipt-content-body');
    if (!modal || !container) return;

    let itemsHtml = '';
    order.items.forEach(it => {
      itemsHtml += `
        <tr>
          <td>${it.quantity}x ${it.name} (${it.size})</td>
          <td style="text-align:right;">$${(it.price * it.quantity).toFixed(2)}</td>
        </tr>
      `;
    });

    const dateStr = new Date(order.createdAt).toLocaleString();

    container.innerHTML = `
      <div class="receipt-header">
        <div class="receipt-logo">☕ JavaGem COFFEE</div>
        <div style="font-size:11px; color:#6b7280; margin-top:2px;">Bilzen, Tanjungbalai & Samarqand HQ</div>
        <div style="font-size:11px; color:#6b7280;">Tel: +998 (90) 123-45-67</div>
      </div>

      <div class="receipt-meta-row">
        <span>Chek: #${order.id}</span>
        <span>${dateStr}</span>
      </div>
      <div class="receipt-meta-row">
        <span>Mijoz: ${order.user || 'Mr. Max'}</span>
        <span>To‘lov: ${order.paymentMethod}</span>
      </div>
      <div class="receipt-meta-row">
        <span>Manzil: ${order.address}</span>
      </div>

      <table class="receipt-items-table" style="margin-top:12px;">
        <tbody>${itemsHtml}</tbody>
      </table>

      <table class="receipt-totals-table">
        <tr>
          <td>Oraliq summa (Subtotal):</td>
          <td style="text-align:right;">$${(order.total - 1.50).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Yetkazib berish (Delivery):</td>
          <td style="text-align:right;">$1.50</td>
        </tr>
        <tr class="grand-total">
          <td>JAMI TO‘LANGAN:</td>
          <td style="text-align:right;">$${order.total.toFixed(2)}</td>
        </tr>
      </table>

      <div class="receipt-barcode">||| | |||| | || |||| | ||</div>
      <div style="text-align:center; font-size:11px; color:#6b7280;">Rahmat! Kuningiz xushbo‘y o‘tsin! ☕</div>

      <div class="receipt-actions-row">
        <button class="btn btn-secondary" style="flex:1;" onclick="window.print()">🖨️ Chop etish (Print)</button>
        <button class="btn btn-primary" style="flex:1;" onclick="window.receiptManager?.closeReceipt()">Yopish ✕</button>
      </div>
    `;

    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    window.soundEngine?.playCoin();
  }

  closeReceipt() {
    const modal = document.getElementById('modal-receipt');
    if (modal) {
      modal.classList.add('hidden');
      document.body.classList.remove('modal-open');
    }
  }
}

// 4. DAILY COFFEE FORTUNE WHEEL (GAMIFICATION)
class DailyRewardManager {
  constructor() {
    this.prizes = [
      { text: '$1.00 Bonus', type: 'wallet', value: 1.00, color: '#C67C4E' },
      { text: '20% Chegirma', type: 'promo', value: 'JAVAMAX', color: '#8c4e28' },
      { text: '$2.00 Bonus', type: 'wallet', value: 2.00, color: '#d97706' },
      { text: 'Shirinlik Kuponi', type: 'gift', value: 'free_cookie', color: '#b45309' },
      { text: '$5.00 VIP Bonus', type: 'wallet', value: 5.00, color: '#eab308' },
      { text: '$0.50 Keshbek', type: 'wallet', value: 0.50, color: '#a16207' }
    ];
    this.isSpinning = false;
  }

  open() {
    const modal = document.getElementById('modal-spin-wheel');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.classList.add('modal-open');
      this.drawWheel();
      window.soundEngine?.playClick();
    }
  }

  close() {
    const modal = document.getElementById('modal-spin-wheel');
    if (modal) {
      modal.classList.add('hidden');
      document.body.classList.remove('modal-open');
    }
  }

  drawWheel() {
    const canvas = document.getElementById('wheel-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const total = this.prizes.length;
    const arc = (2 * Math.PI) / total;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 8;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.prizes.forEach((prize, idx) => {
      const angle = idx * arc;
      ctx.beginPath();
      ctx.fillStyle = prize.color;
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + arc);
      ctx.lineTo(cx, cy);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Sora, sans-serif';
      ctx.fillText(prize.text, r - 20, 5);
      ctx.restore();
    });
  }

  spin() {
    if (this.isSpinning) return;
    this.isSpinning = true;

    const canvas = document.getElementById('wheel-canvas');
    const spinBtn = document.getElementById('btn-spin-action');
    if (spinBtn) spinBtn.disabled = true;

    const winningIdx = Math.floor(Math.random() * this.prizes.length);
    const totalArcs = this.prizes.length;
    const arcDeg = 360 / totalArcs;
    const targetDeg = 360 * 5 + (360 - (winningIdx * arcDeg + arcDeg / 2));

    canvas.style.transform = `rotate(${targetDeg}deg)`;

    const tickInterval = setInterval(() => {
      window.soundEngine?.playSpinTick();
    }, 200);

    setTimeout(() => {
      clearInterval(tickInterval);
      this.isSpinning = false;
      const prize = this.prizes[winningIdx];
      this.handlePrizeWin(prize);
      if (spinBtn) spinBtn.disabled = false;
    }, 4000);
  }

  handlePrizeWin(prize) {
    window.soundEngine?.playSuccessChime();
    if (prize.type === 'wallet') {
      window.masterStore?.topUpWallet(prize.value);
      alert(`🎉 Tabriklaymiz! Siz ${prize.text} yutib oldingiz! Balansingizga qo‘shildi.`);
    } else if (prize.type === 'promo') {
      window.promoManager?.applyPromo(prize.value);
      alert(`🎉 Tabriklaymiz! 20% Chegirma promo-kodingiz faollashtirildi!`);
    } else {
      alert(`🎉 Tabriklaymiz! ${prize.text} yutib oldingiz!`);
    }
    if (window.profileManager) window.profileManager.render();
  }
}

// 5. VOICE SEARCH
class VoiceSearchManager {
  constructor() {
    this.isListening = false;
    this.recognition = null;
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new Speech();
      this.recognition.lang = 'uz-UZ';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const searchInput = document.getElementById('input-hero-search');
        if (searchInput) {
          searchInput.value = transcript;
          window.app?.filterProducts(transcript);
          window.showWebToast(`Ovoz orqali qidirildi: "${transcript}"`, '🎙️');
        }
        this.stop();
      };

      this.recognition.onerror = () => this.stop();
      this.recognition.onend = () => this.stop();
    }
  }

  toggle() {
    if (this.isListening) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    if (!this.recognition) {
      const query = prompt('Ovozli qidiruv uchun qahva nomini kiriting (masalan: Mocha, Latte, Cold Brew):');
      if (query) {
        const searchInput = document.getElementById('input-hero-search');
        if (searchInput) {
          searchInput.value = query;
          window.app?.filterProducts(query);
        }
      }
      return;
    }
    try {
      this.recognition.start();
      this.isListening = true;
      const btn = document.getElementById('btn-voice-search');
      if (btn) btn.classList.add('listening');
      window.showWebToast('Eshitmoqdaman... Qahva nomini ayting 🎙️', '🎤');
    } catch (e) {
      this.stop();
    }
  }

  stop() {
    this.isListening = false;
    const btn = document.getElementById('btn-voice-search');
    if (btn) btn.classList.remove('listening');
  }
}

// 6. ADMIN ANALYTICS & CSV EXPORTER
class AdminAnalyticsManager {
  renderCharts() {
    const container = document.getElementById('admin-analytics-section');
    if (!container) return;

    const days = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];
    const salesData = [120, 190, 150, 240, 310, 420, 380];
    const maxSale = Math.max(...salesData);

    let barsHtml = '';
    days.forEach((day, i) => {
      const val = salesData[i];
      const heightPct = Math.round((val / maxSale) * 100);
      barsHtml += `
        <div class="chart-bar-col">
          <div class="chart-val-tooltip">$${val}</div>
          <div class="chart-bar-fill" style="height: ${heightPct}%;"></div>
          <div class="chart-day-label">${day}</div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="admin-analytics-grid">
        <!-- Sales Chart -->
        <div class="analytics-card">
          <div class="analytics-header-row">
            <div>
              <h3 style="font-size:18px; font-weight:700; color:var(--text-primary);">📊 Haftalik Savdo Statistikasi</h3>
              <p style="font-size:12px; color:var(--text-muted);">So‘nggi 7 kunlik daromad dinamikasi</p>
            </div>
            <button class="btn btn-secondary" style="font-size:12px; padding:6px 12px;" onclick="window.adminAnalytics?.exportCSV()">
              📥 CSV Hisobotni Yuklab Olish
            </button>
          </div>
          <div class="analytics-chart-container">
            ${barsHtml}
          </div>
        </div>

        <!-- Bestsellers -->
        <div class="analytics-card">
          <h3 style="font-size:18px; font-weight:700; color:var(--text-primary); margin-bottom:16px;">🏆 Eng Ko‘p Sotilganlar</h3>
          <div class="bestsellers-list">
            <div class="bestseller-item">
              <div style="display:flex; align-items:center;">
                <div class="bestseller-rank">1</div>
                <div>
                  <div style="font-weight:700; font-size:13px;">Caffe Mocha</div>
                  <div style="font-size:11px; color:var(--text-muted);">142 buyurtma</div>
                </div>
              </div>
              <div style="font-weight:800; color:var(--color-primary);">$643.26</div>
            </div>

            <div class="bestseller-item">
              <div style="display:flex; align-items:center;">
                <div class="bestseller-rank">2</div>
                <div>
                  <div style="font-weight:700; font-size:13px;">Caramel Macchiato</div>
                  <div style="font-size:11px; color:var(--text-muted);">118 buyurtma</div>
                </div>
              </div>
              <div style="font-weight:800; color:var(--color-primary);">$578.20</div>
            </div>

            <div class="bestseller-item">
              <div style="display:flex; align-items:center;">
                <div class="bestseller-rank">3</div>
                <div>
                  <div style="font-weight:700; font-size:13px;">Cold Brew Cream</div>
                  <div style="font-size:11px; color:var(--text-muted);">95 buyurtma</div>
                </div>
              </div>
              <div style="font-weight:800; color:var(--color-primary);">$451.25</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  exportCSV() {
    const orders = window.masterStore?.orders || [];
    let csv = 'Order ID,Customer,Total,Status,Payment,Date\n';
    orders.forEach(o => {
      csv += `"${o.id}","${o.user || 'Customer'}",$${o.total.toFixed(2)},"${o.status}","${o.paymentMethod}","${new Date(o.createdAt).toISOString()}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `JavaGem_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.showWebToast('Hisobot CSV formatida yuklab olindi! 📥', '📊');
  }
}

// Global Instances
window.aiSommelier = new AISommelierManager();
window.promoManager = new PromoCodeManager();
window.receiptManager = new DigitalReceiptManager();
window.dailyReward = new DailyRewardManager();
window.voiceSearch = new VoiceSearchManager();
window.adminAnalytics = new AdminAnalyticsManager();
