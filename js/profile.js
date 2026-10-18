// JavaGem User Profile & Settings Management
class ProfileManager {
  constructor() {
    this.store = window.masterStore;
    this.currentTab = 'info';
  }

  init() {
    this.bindEvents();
    this.render();
    this.applyPreferences();
  }

  bindEvents() {
    // Profile Tabs
    document.querySelectorAll('.profile-tab-link').forEach(link => {
      link.addEventListener('click', () => {
        this.switchTab(link.dataset.pane);
      });
    });

    // Save Personal Info
    const saveInfoBtn = document.getElementById('btn-save-profile-info');
    if (saveInfoBtn) {
      saveInfoBtn.addEventListener('click', () => {
        this.saveProfileInfo();
      });
    }

    // Add Address Form
    const addAddrBtn = document.getElementById('btn-add-new-address');
    if (addAddrBtn) {
      addAddrBtn.addEventListener('click', () => {
        const title = prompt('Enter address title (e.g., Home, Office, Gym):');
        if (title) {
          const detail = prompt('Enter full street address and house number:');
          if (detail) {
            this.store.addUserAddress(title, detail);
            this.render();
            window.showWebToast('New address added!', '📍');
          }
        }
      });
    }

    // App Preferences Toggles
    const themeToggle = document.getElementById('pref-theme-toggle');
    if (themeToggle) {
      themeToggle.checked = this.store.user.preferences.theme === 'light';
      themeToggle.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'light' : 'dark';
        this.store.updatePreference('theme', theme);
        this.applyPreferences();
        window.showWebToast(`Theme switched to ${theme.toUpperCase()} mode`, '🌓');
      });
    }

    const soundToggle = document.getElementById('pref-sound-toggle');
    if (soundToggle) {
      soundToggle.checked = this.store.user.preferences.soundEffects;
      soundToggle.addEventListener('change', (e) => {
        this.store.updatePreference('soundEffects', e.target.checked);
        window.showWebToast(e.target.checked ? 'Sound effects enabled 🔊' : 'Sound effects muted 🔇', '🎵');
      });
    }

    const langSelect = document.getElementById('pref-lang-select');
    if (langSelect) {
      langSelect.value = this.store.user.preferences.language || 'uz';
      langSelect.addEventListener('change', (e) => {
        this.store.updatePreference('language', e.target.value);
        this.applyLanguage(e.target.value);
        window.showWebToast(`Til o'zgartirildi: ${e.target.value.toUpperCase()}`, '🌐');
      });
    }
  }

  applyPreferences() {
    const theme = this.store.user.preferences.theme || 'dark';
    const isLight = theme === 'light';

    if (isLight) {
      document.body.classList.add('light-theme');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Update Quick Theme Toggle Button in Navbar (Sun vs Moon icon)
    const quickToggleBtn = document.getElementById('btn-quick-theme-toggle');
    if (quickToggleBtn) {
      quickToggleBtn.innerHTML = isLight
        ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
        : '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
      quickToggleBtn.title = isLight ? 'Tungi rejim (Dark Mode)' : 'Kunduzgi rejim (Light Mode)';
    }

    // Sync settings checkbox
    const themeCheckbox = document.getElementById('pref-theme-toggle');
    if (themeCheckbox) {
      themeCheckbox.checked = isLight;
    }
  }

  applyLanguage(lang) {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.uz;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (dict[key]) {
        el.placeholder = dict[key];
      }
    });

    const langSelect = document.getElementById('pref-lang-select');
    if (langSelect) langSelect.value = lang;

    document.querySelectorAll('.nav-lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Refresh sub-views so any dynamic text aligns with language
    if (window.adminDashboard) window.adminDashboard.render();
    if (window.cartManager) {
      window.cartManager.renderCart();
      window.cartManager.renderCheckout();
    }
    if (window.app && window.masterStore?.currentView === 'tracking') {
      window.app.renderTrackingView();
    }
  }

  render() {
    const user = this.store.user;

    // Sidebar Info
    const avatarEl = document.getElementById('profile-avatar-img');
    const nameEl = document.getElementById('profile-name-display');
    const emailEl = document.getElementById('profile-email-display');
    const walletEl = document.getElementById('profile-wallet-display');
    const navAvatar = document.querySelector('.nav-avatar');
    const navName = document.querySelector('.nav-user-name');

    if (avatarEl) avatarEl.src = user.avatar;
    if (nameEl) nameEl.textContent = user.name;
    if (emailEl) emailEl.textContent = user.email;
    if (walletEl) walletEl.textContent = `$ ${user.walletBalance.toFixed(2)}`;
    if (navAvatar) navAvatar.src = user.avatar;
    if (navName) navName.textContent = user.name;

    // Form inputs
    const inputName = document.getElementById('input-prof-name');
    const inputEmail = document.getElementById('input-prof-email');
    const inputPhone = document.getElementById('input-prof-phone');
    const inputAvatar = document.getElementById('input-prof-avatar');
    const previewAvatarEl = document.getElementById('avatar-preview-img');

    if (inputName) inputName.value = user.name;
    if (inputEmail) inputEmail.value = user.email;
    if (inputPhone) inputPhone.value = user.phone;
    if (inputAvatar) inputAvatar.value = user.avatar;
    if (previewAvatarEl) previewAvatarEl.src = user.avatar;

    // Show active pane
    document.querySelectorAll('.profile-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `pane-${this.currentTab}`);
    });

    this.renderAvatarPresets();
    this.renderOrderHistory();
    this.renderAddresses();
    this.renderCards();
    this.renderWallet();
  }

  renderAvatarPresets() {
    const container = document.getElementById('avatar-presets-grid');
    if (!container) return;

    const presets = window.PRESET_AVATARS || [
      { id: 'av-1', label: 'Barista Classic', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
      { id: 'av-2', label: 'Modern Gent', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
      { id: 'av-3', label: 'Urban Lady', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
      { id: 'av-4', label: 'Coffee Artisan', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
      { id: 'av-5', label: 'Cozy Morning', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&auto=format&fit=crop&q=80' },
      { id: 'av-6', label: 'Espresso Master', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80' },
      { id: 'av-7', label: 'Warm Latte', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
      { id: 'av-8', label: 'Business Pro', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80' },
      { id: 'av-9', label: 'Avatar 3D Gem', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80' },
      { id: 'av-10', label: 'Coffee Explorer', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&auto=format&fit=crop&q=80' }
    ];

    const currentUrl = this.store.user.avatar;

    container.innerHTML = presets.map(p => `
      <button type="button" class="avatar-preset-item ${p.url === currentUrl ? 'active' : ''}" data-avatar-url="${p.url}" title="${p.label}">
        <img src="${p.url}" alt="${p.label}">
      </button>
    `).join('');

    container.querySelectorAll('.avatar-preset-item').forEach(btn => {
      btn.onclick = () => {
        const url = btn.dataset.avatarUrl;
        this.selectAvatar(url);
      };
    });
  }

  selectAvatar(url) {
    this.store.updateUserProfile({ avatar: url });
    const input = document.getElementById('input-prof-avatar');
    if (input) input.value = url;
    this.previewAvatar(url);
    this.renderAvatarPresets();
    window.showWebToast('Avatar tanlandi va saqlandi! 📸', '✓');
  }

  previewAvatar(url) {
    const avatarEl = document.getElementById('profile-avatar-img');
    const previewEl = document.getElementById('avatar-preview-img');
    const navAvatar = document.querySelector('.nav-avatar');
    if (avatarEl && url) avatarEl.src = url;
    if (previewEl && url) previewEl.src = url;
    if (navAvatar && url) navAvatar.src = url;
  }

  handleAvatarFileUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Iltimos, rasm formatidagi fayl tanlang (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      this.selectAvatar(dataUrl);
      window.showWebToast('Kompyuterdan yangi avatar yuklandi! 📸', '🎉');
    };
    reader.readAsDataURL(file);
  }

  renderWallet() {
    const walletEl = document.getElementById('profile-wallet-display');
    const paneWalletEl = document.getElementById('profile-wallet-pane-balance');
    const val = `$ ${(this.store.user.walletBalance || 0).toFixed(2)}`;
    if (walletEl) walletEl.textContent = val;
    if (paneWalletEl) paneWalletEl.textContent = val;

    // Top up quick buttons
    document.querySelectorAll('.topup-btn').forEach(btn => {
      btn.onclick = () => {
        const amount = parseFloat(btn.dataset.amount) || 10;
        this.store.topUpWallet(amount);
        this.renderWallet();
        window.showWebToast(`Added $${amount}.00 to JavaGem Wallet! 💵`, '🎉');
      };
    });
  }

  renderCards() {
    const cardsContainer = document.getElementById('profile-cards-grid');
    if (!cardsContainer) return;

    const cards = this.store.user.savedCards || [];
    if (cards.length === 0) {
      cardsContainer.innerHTML = `<p style="color:var(--text-muted); font-size:13px; text-align:center; padding:16px;">No saved payment cards. Click "+ Add New Card" to add one.</p>`;
    } else {
      cardsContainer.innerHTML = cards.map(c => `
        <div class="saved-card-box">
          <div class="card-top-chip">
            <span>💳 ${c.type}</span>
            <button class="btn-table-action delete" style="color:#FFF;" data-del-card-id="${c.id}" title="Remove Card">×</button>
          </div>
          <div class="card-number-text">${c.number}</div>
          <div class="card-bottom-info">
            <span>HOLDER: ${c.holder.toUpperCase()}</span>
            <span>EXP: ${c.exp}</span>
          </div>
        </div>
      `).join('');

      cardsContainer.querySelectorAll('[data-del-card-id]').forEach(btn => {
        btn.onclick = () => {
          this.store.deleteUserCard(btn.dataset.delCardId);
          this.renderCards();
          window.showWebToast('Payment card removed', '💳');
        };
      });
    }

    // Add Card Modal Trigger
    const addCardBtn = document.getElementById('btn-profile-add-card');
    if (addCardBtn) {
      addCardBtn.onclick = () => {
        const modal = document.getElementById('modal-add-card');
        document.body.classList.add('modal-open');
        if (modal) modal.classList.add('active');
      };
    }

    // Auto format card number input
    const cardInput = document.getElementById('input-card-number');
    if (cardInput && !cardInput._hasListener) {
      cardInput._hasListener = true;
      cardInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').substring(0, 16);
        let parts = v.match(/.{1,4}/g);
        e.target.value = parts ? parts.join(' ') : v;
      });
    }

    // Auto format card expiry input
    const expInput = document.getElementById('input-card-exp');
    if (expInput && !expInput._hasListener) {
      expInput._hasListener = true;
      expInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (v.length >= 3) {
          e.target.value = v.substring(0, 2) + '/' + v.substring(2);
        } else {
          e.target.value = v;
        }
      });
    }

    // Save Card Submit
    const saveCardBtn = document.getElementById('btn-save-new-card');
    if (saveCardBtn) {
      saveCardBtn.onclick = () => {
        this.saveCardForm();
      };
    }
  }

  switchTab(paneName) {
    this.currentTab = paneName;
    document.querySelectorAll('.profile-tab-link').forEach(l => {
      l.classList.toggle('active', l.dataset.pane === paneName);
    });
    this.render();
  }

  saveProfileInfo() {
    const name = document.getElementById('input-prof-name')?.value.trim() || this.store.user.name;
    const email = document.getElementById('input-prof-email')?.value.trim() || this.store.user.email;
    const phone = document.getElementById('input-prof-phone')?.value.trim() || this.store.user.phone;
    const avatar = document.getElementById('input-prof-avatar')?.value.trim() || this.store.user.avatar;

    this.store.updateUserProfile({ name, email, phone, avatar });
    window.showWebToast('Profil ma‘lumotlari muvaffaqiyatli saqlandi! 👤', '✓');
    this.render();
  }

  saveCardForm() {
    const num = document.getElementById('input-card-number')?.value.trim();
    const holder = document.getElementById('input-card-holder')?.value.trim() || this.store.user.name;
    const exp = document.getElementById('input-card-exp')?.value.trim() || '12/28';

    if (num && num.replace(/\s+/g, '').length >= 12) {
      this.store.addUserCard({ number: num, holder, exp, type: 'Visa / Mastercard' });
      document.getElementById('modal-add-card')?.classList.remove('active');
      document.body.classList.remove('modal-open');
      if (document.getElementById('input-card-number')) document.getElementById('input-card-number').value = '';
      if (document.getElementById('input-card-cvv')) document.getElementById('input-card-cvv').value = '';
      this.renderCards();
      window.showWebToast('Yangi to‘lov kartasi saqlandi! 💳', '✓');
    } else {
      alert('Iltimos, 16-xonali karta raqamini to‘g‘ri kiriting');
    }
  }

  renderOrderHistory() {
    const historyContainer = document.getElementById('profile-orders-history');
    if (!historyContainer) return;

    if (this.store.orders.length === 0) {
      historyContainer.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:30px;">No previous orders found.</p>`;
      return;
    }

    historyContainer.innerHTML = this.store.orders.map(order => `
      <div class="history-order-card">
        <div class="history-card-top">
          <div>
            <span class="history-order-id">#${order.id}</span>
            <span class="history-order-date"> • ${order.date}</span>
          </div>
          <span class="status-pill ${order.status}">
            ${order.status === 'preparing' ? '☕ Tayyorlanmoqda' : order.status === 'on_the_way' ? '🛵 Yetkazilmoqda' : order.status === 'delivered' ? '✅ Yetkazildi' : order.status}
          </span>
        </div>
        <div class="history-items-list">
          ${order.items.map(item => `<div>☕ <strong>${item.name}</strong> (${item.size}) × ${item.quantity} — $${(item.price * item.quantity).toFixed(2)}</div>`).join('')}
          <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">💳 To‘lov: <strong>${order.paymentMethod || 'Karta'}</strong> • 📍 Manzil: ${order.address}</div>
        </div>
        <div class="history-card-foot">
          <div class="history-total">Jami: $ ${order.total.toFixed(2)}</div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-secondary btn-sm" data-track-id="${order.id}">📍 Kuzatish</button>
            <button class="btn btn-primary btn-sm" data-reorder-id="${order.id}">↻ Qayta Buyurtma</button>
          </div>
        </div>
      </div>
    `).join('');

    // Track Button Click
    historyContainer.querySelectorAll('[data-track-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.app) window.app.switchView('tracking');
      });
    });

    // Reorder Click
    historyContainer.querySelectorAll('[data-reorder-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const ord = this.store.orders.find(o => o.id === btn.dataset.reorderId);
        if (ord && ord.items.length > 0) {
          ord.items.forEach(it => {
            const prod = this.store.products.find(p => p.name === it.name) || this.store.products[0];
            this.store.addToCart({
              productId: prod.id,
              name: prod.name,
              size: it.size || 'M',
              price: it.price || prod.basePrice,
              quantity: it.quantity || 1,
              milk: 'Whole Milk',
              sweetness: '50% Sweet',
              temperature: 'Hot',
              extras: [],
              image: prod.image
            });
          });
          window.showWebToast('Oldingi buyurtma savatchaga qo‘shildi!', '🛍️');
          window.openCartDrawer();
        }
      });
    });
  }

  renderAddresses() {
    const addrContainer = document.getElementById('profile-addresses-grid');
    if (!addrContainer) return;

    addrContainer.innerHTML = (this.store.user.addresses || []).map(addr => `
      <div class="address-item-card ${addr.isDefault ? 'default' : ''}">
        <div class="addr-title-row">
          <span class="addr-title">${addr.title}</span>
          ${addr.isDefault ? `<span class="badge badge-primary">Default</span>` : `<button class="btn-table-action" data-set-default-id="${addr.id}" title="Set as default">★</button>`}
        </div>
        <p class="addr-text">${addr.detail}</p>
        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="btn-table-action delete" data-delete-addr-id="${addr.id}" title="Delete Address">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `).join('');

    // Handlers
    addrContainer.querySelectorAll('[data-set-default-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.store.setDefaultAddress(btn.dataset.setDefaultId);
        this.renderAddresses();
        window.showWebToast('Default delivery address updated', '📍');
      });
    });

    addrContainer.querySelectorAll('[data-delete-addr-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.store.deleteUserAddress(btn.dataset.deleteAddrId);
        this.renderAddresses();
        window.showWebToast('Address removed', '🗑️');
      });
    });
  }
}

window.profileManager = new ProfileManager();

window.toggleTheme = function() {
  const cur = window.masterStore?.user.preferences.theme || 'dark';
  const nxt = cur === 'dark' ? 'light' : 'dark';
  window.masterStore?.updatePreference('theme', nxt);
  window.profileManager?.applyPreferences();
  window.soundEngine?.playClick();
  window.showWebToast(nxt === 'light' ? 'Kunduzgi rejim (Light Mode) ☀️' : 'Tungi rejim (Dark Mode) 🌙', '🌓');
};

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.profileManager.init());
  } else {
    window.profileManager.init();
  }
}

