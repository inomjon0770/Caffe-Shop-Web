// JavaGem Admin Management Dashboard Logic
class AdminDashboard {
  constructor() {
    this.store = window.masterStore;
    this.currentTab = 'overview';
    this.editingProductId = null;
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    // Admin Tabs
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTab = btn.dataset.tab;
        this.render();
      });
    });

    // Add Coffee Button
    const addProductBtn = document.getElementById('btn-admin-add-product');
    if (addProductBtn) {
      addProductBtn.addEventListener('click', () => {
        this.openProductModal(null);
      });
    }

    // Save Product Form
    const saveProductBtn = document.getElementById('btn-save-admin-product');
    if (saveProductBtn) {
      saveProductBtn.addEventListener('click', () => {
        this.saveProductForm();
      });
    }

    // Modal Close Trigger
    const adminModal = document.getElementById('modal-admin-product');
    if (adminModal) {
      adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal || e.target.closest('.btn-close-modal')) {
          this.closeProductModal();
        }
      });
    }
  }

  render() {
    this.renderStats();
    this.renderProductsTable();
    this.renderOrdersTable();

    // Show / Hide panes based on active tab
    const productsSec = document.getElementById('admin-pane-products');
    const ordersSec = document.getElementById('admin-pane-orders');

    if (productsSec) {
      productsSec.style.display = (this.currentTab === 'overview' || this.currentTab === 'products') ? 'block' : 'none';
    }
    if (ordersSec) {
      ordersSec.style.display = (this.currentTab === 'overview' || this.currentTab === 'orders') ? 'block' : 'none';
    }

    // Render Pro Visual Analytics Charts
    if (window.adminAnalytics) {
      window.adminAnalytics.renderCharts();
    }
  }

  renderStats() {
    let totalRevenue = 0;
    let cardRevenue = 0;
    let cashRevenue = 0;
    let walletRevenue = 0;

    this.store.orders.forEach(o => {
      if (o.status !== 'cancelled') {
        const val = parseFloat(o.total) || 0;
        totalRevenue += val;
        if (o.paymentType === 'cash' || (o.paymentMethod && o.paymentMethod.toLowerCase().includes('naqd'))) {
          cashRevenue += val;
        } else if (o.paymentType === 'wallet' || (o.paymentMethod && o.paymentMethod.toLowerCase().includes('hamyon'))) {
          walletRevenue += val;
        } else {
          cardRevenue += val;
        }
      }
    });

    const totalOrders = this.store.orders.length;
    const totalProducts = this.store.products.length;
    const activeDeliveries = this.store.orders.filter(o => o.status === 'on_the_way' || o.status === 'preparing').length;

    const revEl = document.getElementById('admin-stat-revenue');
    const cardRevEl = document.getElementById('admin-stat-card-rev');
    const cashRevEl = document.getElementById('admin-stat-cash-rev');
    const walletRevEl = document.getElementById('admin-stat-wallet-rev');
    const ordersEl = document.getElementById('admin-stat-orders');
    const prodEl = document.getElementById('admin-stat-products');
    const delivEl = document.getElementById('admin-stat-deliveries');

    if (revEl) revEl.textContent = `$ ${totalRevenue.toFixed(2)}`;
    if (cardRevEl) cardRevEl.textContent = `$ ${cardRevenue.toFixed(2)}`;
    if (cashRevEl) cashRevEl.textContent = `$ ${cashRevenue.toFixed(2)}`;
    if (walletRevEl) walletRevEl.textContent = `$ ${walletRevenue.toFixed(2)}`;
    if (ordersEl) ordersEl.textContent = totalOrders;
    if (prodEl) prodEl.textContent = totalProducts;
    if (delivEl) delivEl.textContent = activeDeliveries;
  }

  playAdminChime() {
    try {
      if (!this.store.user.preferences.soundEffects) return;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.15);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1320, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.2);
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.5);
      }, 150);
    } catch (e) {
      console.log('Audio chime not supported:', e);
    }
  }

  showLiveOrderAlert(order) {
    this.playAdminChime();

    // 1. Update Admin Live Notification Banner in Admin View
    const alertBox = document.getElementById('admin-live-notification-box');
    if (alertBox) {
      alertBox.style.display = 'block';
      alertBox.innerHTML = `
        <div class="admin-live-alert-banner">
          <div class="admin-alert-left">
            <div class="admin-alert-icon">🔥</div>
            <div class="admin-alert-details">
              <h4>🔔 YANGI BUYURTMA KELDI! #${order.id}</h4>
              <p>Mijoz: <strong>${order.customerName}</strong> (${order.customerPhone}) • ☕ ${order.items.map(i => `${i.name} (${i.size}) ×${i.quantity}`).join(', ')} • 💳 <strong>${order.paymentMethod || 'Karta'}</strong> • Summa: <strong style="color:var(--c-green); font-size:15px;">$ ${order.total.toFixed(2)}</strong></p>
            </div>
          </div>
          <div class="admin-alert-actions">
            <button class="btn btn-primary btn-sm" onclick="window.adminDashboard.quickDispatch('${order.id}', 'on_the_way'); document.getElementById('admin-live-notification-box').style.display='none';">
              🛵 Tayyor bo'ldi (Kuryerga berish)
            </button>
            <button class="btn btn-secondary btn-sm" onclick="document.getElementById('admin-live-notification-box').style.display='none';">
              Yopish ✕
            </button>
          </div>
        </div>
      `;
    }

    // 2. Global Floating Order Alert (Visible anywhere on screen)
    const globalAlert = document.getElementById('global-admin-order-alert');
    const globalAlertText = document.getElementById('global-order-alert-text');
    if (globalAlert) {
      if (globalAlertText) {
        globalAlertText.innerHTML = `Buyurtma <strong>#${order.id}</strong> • <strong>$${order.total.toFixed(2)}</strong> (${order.customerName}, ${order.paymentMethod || 'Karta'})`;
      }
      globalAlert.style.display = 'flex';
      setTimeout(() => {
        if (globalAlert) globalAlert.style.display = 'none';
      }, 8000);
    }

    // 3. Update floating Admin Button badge
    const badgeEl = document.getElementById('admin-orders-badge');
    if (badgeEl) {
      const activeCount = this.store.orders.filter(o => o.status === 'preparing' || o.status === 'on_the_way').length;
      badgeEl.textContent = activeCount;
      badgeEl.style.display = activeCount > 0 ? 'inline-block' : 'none';
    }

    this.render();
  }

  quickDispatch(orderId, nextStatus) {
    this.store.updateOrderStatus(orderId, nextStatus);
    if (nextStatus === 'on_the_way') {
      window.showWebToast(`Buyurtma #${orderId} tayyor bo'ldi va kuryerga berildi! 🛵`, '🛵');
    } else if (nextStatus === 'delivered') {
      window.showWebToast(`Buyurtma #${orderId} muvaffaqiyatli yetkazildi! ✅`, '🎉');
    } else if (nextStatus === 'preparing') {
      window.showWebToast(`Buyurtma #${orderId} tayyorlanish bosqichiga o'tkazildi! ☕`, '☕');
    }
    this.render();
  }

  renderProductsTable() {
    const tableBody = document.getElementById('admin-products-tbody');
    if (!tableBody) return;

    tableBody.innerHTML = this.store.products.map(p => `
      <tr>
        <td>
          <div class="table-product-info">
            <img class="table-product-thumb" src="${p.image}" alt="${p.name}">
            <div>
              <div class="product-name-bold">${p.name}</div>
              <div class="product-sub-muted">${p.subName}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-primary">${p.category}</span></td>
        <td><strong>$ ${p.basePrice.toFixed(2)}</strong></td>
        <td>
          <button class="stock-toggle-btn ${p.inStock ? 'in-stock' : 'out-of-stock'}" data-stock-id="${p.id}">
            ${p.inStock ? '● In Stock' : '○ Out of Stock'}
          </button>
        </td>
        <td>
          <div class="table-action-btns">
            <button class="btn-table-action" data-edit-id="${p.id}" title="Edit Coffee (Tahrirlash)">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-table-action delete" data-delete-id="${p.id}" title="Delete Coffee">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Attach Event Handlers
    tableBody.querySelectorAll('[data-stock-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.store.toggleProductStock(btn.dataset.stockId);
        window.showWebToast('Mahsulot ombor holati yangilandi!', '📦');
      });
    });

    tableBody.querySelectorAll('[data-edit-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openProductModal(btn.dataset.editId);
      });
    });

    tableBody.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Ushbu kofeni menyudan o‘chirmoqchimisiz?')) {
          this.store.deleteProduct(btn.dataset.deleteId);
          window.showWebToast('Kofe menyudan o‘chirildi', '🗑️');
        }
      });
    });
  }

  renderOrdersTable() {
    const tableBody = document.getElementById('admin-orders-tbody');
    if (!tableBody) return;

    if (this.store.orders.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">Hozircha hech qanday buyurtma mavjud emas</td></tr>`;
      return;
    }

    tableBody.innerHTML = this.store.orders.map(o => {
      let paymentBadge = '';
      if (o.paymentType === 'cash' || (o.paymentMethod && o.paymentMethod.toLowerCase().includes('naqd'))) {
        paymentBadge = `<span class="badge" style="background:rgba(54,179,126,0.15); color:var(--c-green); font-size:11px;">💵 ${o.paymentMethod}</span>`;
      } else if (o.paymentType === 'wallet' || (o.paymentMethod && o.paymentMethod.toLowerCase().includes('hamyon'))) {
        paymentBadge = `<span class="badge" style="background:rgba(156,39,176,0.15); color:#9C27B0; font-size:11px;">💎 ${o.paymentMethod}</span>`;
      } else {
        paymentBadge = `<span class="badge" style="background:rgba(78,124,198,0.15); color:#4E7CC6; font-size:11px;">💳 ${o.paymentMethod || 'Karta'}</span>`;
      }

      let quickActionButton = '';
      if (o.status === 'preparing') {
        quickActionButton = `
          <button class="btn btn-primary btn-sm btn-quick-dispatch" data-order-id="${o.id}" data-target-status="on_the_way" style="padding:6px 12px; font-size:12px;">
            🛵 Tayyor bo'ldi (Kuryerga berish)
          </button>
        `;
      } else if (o.status === 'on_the_way') {
        quickActionButton = `
          <button class="btn btn-primary btn-sm btn-quick-dispatch" data-order-id="${o.id}" data-target-status="delivered" style="padding:6px 12px; font-size:12px; background:var(--c-green); border-color:var(--c-green);">
            ✅ Yetkazildi (Mijozga topshirildi)
          </button>
        `;
      } else if (o.status === 'delivered') {
        quickActionButton = `
          <span style="color:var(--c-green); font-weight:700; font-size:12px; display:inline-flex; align-items:center; gap:4px;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Yetkazib berildi
          </span>
        `;
      } else if (o.status === 'cancelled') {
        quickActionButton = `<span style="color:var(--c-red); font-size:12px; font-weight:600;">Bekor qilingan</span>`;
      } else {
        quickActionButton = `
          <button class="btn btn-secondary btn-sm btn-quick-dispatch" data-order-id="${o.id}" data-target-status="preparing" style="padding:6px 12px; font-size:12px;">
            ☕ Tayyorlashni boshlash
          </button>
        `;
      }

      return `
        <tr>
          <td>
            <strong>#${o.id}</strong>
            <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${o.date}</div>
          </td>
          <td>
            <div style="font-weight:700; color:var(--text-main);">${o.customerName}</div>
            <div style="font-size:12px; color:var(--text-muted);">${o.customerPhone}</div>
          </td>
          <td>
            <div style="font-size:13px; font-weight:600; color:var(--text-main);">${o.items.map(i => `${i.name} (${i.size}) ×${i.quantity}`).join(', ')}</div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:3px;">📍 ${o.address}</div>
          </td>
          <td>${paymentBadge}</td>
          <td><strong style="color:var(--c-primary); font-size:15px;">$ ${o.total.toFixed(2)}</strong></td>
          <td>
            <span class="status-pill ${o.status}">
              ${o.status === 'preparing' ? '☕ Tayyorlanmoqda' : o.status === 'on_the_way' ? '🛵 Kuryer yo‘lda' : o.status === 'delivered' ? '✅ Yetkazildi' : o.status === 'cancelled' ? '❌ Bekor qilingan' : '⏳ Kutilmoqda'}
            </span>
          </td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              ${quickActionButton}
              <select class="order-status-select" data-order-id="${o.id}" style="padding:4px 8px; font-size:12px;">
                <option value="preparing" ${o.status === 'preparing' ? 'selected' : ''}>☕ Tayyorlanmoqda</option>
                <option value="on_the_way" ${o.status === 'on_the_way' ? 'selected' : ''}>🛵 Yetkazilmoqda</option>
                <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>✅ Yetkazildi</option>
                <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>❌ Bekor qilish</option>
              </select>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach Quick Dispatch Click Handlers
    tableBody.querySelectorAll('.btn-quick-dispatch').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.orderId;
        const targetStatus = btn.dataset.targetStatus;
        this.quickDispatch(orderId, targetStatus);
      });
    });

    // Attach Status Change Listener
    tableBody.querySelectorAll('.order-status-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const orderId = select.dataset.orderId;
        const newStatus = e.target.value;
        this.quickDispatch(orderId, newStatus);
      });
    });
  }

  openProductModal(productId = null) {
    this.editingProductId = productId;
    const modal = document.getElementById('modal-admin-product');
    const titleEl = document.getElementById('admin-product-modal-title');
    const nameInput = document.getElementById('admin-input-prod-name');
    const subInput = document.getElementById('admin-input-prod-sub');
    const catInput = document.getElementById('admin-input-prod-cat');
    const priceInput = document.getElementById('admin-input-prod-price');
    const descInput = document.getElementById('admin-input-prod-desc');
    const imgInput = document.getElementById('admin-input-prod-img');

    if (productId) {
      const prod = this.store.products.find(p => p.id === productId);
      if (prod) {
        if (titleEl) titleEl.textContent = 'Edit Coffee Product (Tahrirlash)';
        if (nameInput) nameInput.value = prod.name;
        if (subInput) subInput.value = prod.subName;
        if (catInput) catInput.value = prod.category;
        if (priceInput) priceInput.value = prod.basePrice;
        if (descInput) descInput.value = prod.description;
        if (imgInput) imgInput.value = prod.image;
      }
    } else {
      if (titleEl) titleEl.textContent = 'Add New Coffee Product (Yangi Kofe)';
      if (nameInput) nameInput.value = '';
      if (subInput) subInput.value = '';
      if (catInput) catInput.value = 'Specialty';
      if (priceInput) priceInput.value = '4.50';
      if (descInput) descInput.value = '';
      if (imgInput) imgInput.value = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80';
    }

    document.body.classList.add('modal-open');
    if (modal) modal.classList.add('active');
  }

  closeProductModal() {
    const modal = document.getElementById('modal-admin-product');
    if (modal) modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    this.editingProductId = null;
  }

  saveProductForm() {
    const name = document.getElementById('admin-input-prod-name')?.value.trim();
    const subName = document.getElementById('admin-input-prod-sub')?.value.trim() || 'Artisanal Specialty';
    const category = document.getElementById('admin-input-prod-cat')?.value || 'Specialty';
    const basePrice = parseFloat(document.getElementById('admin-input-prod-price')?.value) || 4.50;
    const description = document.getElementById('admin-input-prod-desc')?.value.trim() || 'Crafted with premium beans.';
    const image = document.getElementById('admin-input-prod-img')?.value.trim() || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80';

    if (!name) {
      alert('Please enter a coffee product name');
      return;
    }

    if (this.editingProductId) {
      this.store.updateProduct(this.editingProductId, {
        name, subName, category, basePrice, description, image
      });
      window.showWebToast(`Product "${name}" updated successfully! ☕`, '✓');
    } else {
      this.store.addProduct({
        name, subName, category, basePrice, description, image
      });
      window.showWebToast(`New coffee "${name}" added to menu! 🎉`, '☕');
    }

    this.closeProductModal();
    this.render();
  }
}

window.adminDashboard = new AdminDashboard();

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.adminDashboard.init());
  } else {
    window.adminDashboard.init();
  }
}

