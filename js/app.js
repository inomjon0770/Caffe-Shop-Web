// JavaGem Main Web App Controller & UI Renderer
class Application {
  constructor() {
    this.store = window.masterStore;
  }

  init() {
    if (window.adminDashboard) window.adminDashboard.init();
    if (window.profileManager) window.profileManager.init();
    if (window.cartManager) window.cartManager.init();
    this.bindNavigation();
    this.bindHomeFilters();
    this.bindLocationModal();
    this.bindLanguageSwitchers();
    this.renderHomeMenu();
    this.renderLocationNavbar();
    if (window.profileManager) {
      window.profileManager.applyLanguage(this.store.user.preferences.language || 'uz');
      window.profileManager.applyPreferences();
    }
    this.store.subscribe(() => this.onStoreUpdate());
  }

  bindLanguageSwitchers() {
    document.querySelectorAll('.nav-lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        this.store.updatePreference('language', lang);
        if (window.profileManager) window.profileManager.applyLanguage(lang);
        this.showToast(`Language: ${lang.toUpperCase()}`, '🌐');
      });
    });
  }

  // Global Toast
  showToast(message, icon = '☕') {
    const toast = document.getElementById('global-web-toast');
    const msgEl = document.getElementById('web-toast-msg');
    const iconEl = document.getElementById('web-toast-icon');
    if (!toast) return;

    msgEl.textContent = message;
    iconEl.textContent = icon;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  switchView(viewName) {
    this.store.setView(viewName);

    // Update View Containers
    document.querySelectorAll('.app-main-view').forEach(view => {
      view.classList.toggle('hidden', view.id !== `view-${viewName}`);
    });

    // Update Nav Links Active
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.view === viewName);
    });

    const adminBtn = document.getElementById('navbar-admin-btn');
    if (adminBtn) adminBtn.classList.toggle('active', viewName === 'admin');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh sub-controllers
    if (viewName === 'admin' && window.adminDashboard) {
      window.adminDashboard.render();
    }
    if (viewName === 'profile' && window.profileManager) {
      window.profileManager.render();
    }
    if (viewName === 'tracking') {
      this.renderTrackingView();
      if (window.webTrackingMap) window.webTrackingMap.resize();
    }
  }

  bindNavigation() {
    // Nav Brand Logo -> Home
    document.getElementById('brand-logo-btn')?.addEventListener('click', () => {
      this.switchView('home');
    });

    // Nav Links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.dataset.view;
        if (targetView) {
          this.switchView(targetView);
        } else if (link.getAttribute('href')?.startsWith('#')) {
          const targetId = link.getAttribute('href').substring(1);
          const el = document.getElementById(targetId);
          if (el) {
            this.switchView('home');
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // Admin Button in Navbar
    document.getElementById('navbar-admin-btn')?.addEventListener('click', () => {
      this.switchView(this.store.currentView === 'admin' ? 'home' : 'admin');
    });

    // Profile Button in Navbar
    document.getElementById('navbar-profile-btn')?.addEventListener('click', () => {
      this.switchView('profile');
    });

    // Back to Web Button in Admin
    document.getElementById('btn-admin-back-web')?.addEventListener('click', () => {
      this.switchView('home');
    });

    // Quick Order / Explore Buttons in Hero
    document.getElementById('btn-hero-explore')?.addEventListener('click', () => {
      document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('btn-hero-order')?.addEventListener('click', () => {
      document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Theme Toggle in Navbar
    document.getElementById('btn-quick-theme-toggle')?.addEventListener('click', () => {
      const current = this.store.user.preferences.theme;
      const next = current === 'dark' ? 'light' : 'dark';
      this.store.updatePreference('theme', next);
      if (window.profileManager) window.profileManager.applyPreferences();
      this.showToast(`Switched to ${next.toUpperCase()} mode`, '🌓');
    });
  }

  bindHomeFilters() {
    // Category Pills
    document.querySelectorAll('.cat-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.store.activeCategory = btn.dataset.cat;
        this.renderHomeMenu();
      });
    });

    // Search Input
    const searchInput = document.getElementById('menu-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.store.searchQuery = e.target.value.trim();
        this.renderHomeMenu();
      });
    }

    // Promo Code Click
    document.querySelectorAll('.promo-banner-card').forEach(card => {
      card.addEventListener('click', () => {
        const code = card.dataset.promoCode;
        const promo = this.store.promos.find(p => p.code === code);
        if (promo) {
          this.store.activeDiscount = promo;
          this.showToast(`🎉 Promo applied: ${promo.title}`, '🏷️');
          window.openCartDrawer();
        }
      });
    });
  }

  // Location Selector
  bindLocationModal() {
    const locBtn = document.getElementById('navbar-location-btn');
    const modal = document.getElementById('modal-location');
    const locList = document.getElementById('location-items-list');
    const gpsBtn = document.getElementById('btn-use-gps-loc');
    const searchInput = document.getElementById('input-search-location');

    if (locBtn) {
      locBtn.onclick = () => {
        this.renderLocationList(POPULAR_LOCATIONS);
        document.body.classList.add('modal-open');
        if (modal) modal.classList.add('active');
      };
    }

    if (searchInput) {
      searchInput.oninput = (e) => {
        const q = e.target.value.toLowerCase();
        const filtered = POPULAR_LOCATIONS.filter(l => 
          l.city.toLowerCase().includes(q) || l.district.toLowerCase().includes(q)
        );
        this.renderLocationList(filtered);
      };
    }

    if (gpsBtn) {
      gpsBtn.onclick = () => {
        if ('geolocation' in navigator) {
          gpsBtn.textContent = 'Locating... 📡';
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const detected = `Toshkent, GPS (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`;
              this.selectLocation(detected);
              gpsBtn.textContent = '📍 Use Current GPS Location';
            },
            (err) => {
              const fallback = 'Toshkent, Amir Temur ko‘chasi 108';
              this.selectLocation(fallback);
              gpsBtn.textContent = '📍 Use Current GPS Location';
            },
            { timeout: 4000 }
          );
        } else {
          this.selectLocation('Toshkent, Amir Temur ko‘chasi 108');
        }
      };
    }
  }

  renderLocationList(locations) {
    const container = document.getElementById('location-items-list');
    if (!container) return;

    if (locations.length === 0) {
      container.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:10px;">No locations found.</p>`;
      return;
    }

    container.innerHTML = locations.map(loc => `
      <button class="location-item-btn" data-loc-full="${loc.city}, ${loc.district}">
        <span class="loc-icon-pin">📍</span>
        <div class="loc-details">
          <h4>${loc.city}</h4>
          <p>${loc.district}</p>
        </div>
      </button>
    `).join('');

    container.querySelectorAll('.location-item-btn').forEach(btn => {
      btn.onclick = () => {
        this.selectLocation(btn.dataset.locFull);
      };
    });
  }

  selectLocation(locText) {
    this.store.setUserLocation(locText);
    this.renderLocationNavbar();
    document.getElementById('modal-location')?.classList.remove('active');
    document.body.classList.remove('modal-open');
    this.showToast(`Delivery location set to: ${locText}`, '📍');
  }

  renderLocationNavbar() {
    const locTextEl = document.getElementById('nav-location-text');
    if (locTextEl) {
      locTextEl.textContent = this.store.user.currentLocation || 'Bilzen, Tanjungbalai';
    }
  }

  // Like Click Handler
  handleLikeClick(productId) {
    const isLiked = this.store.toggleLike(productId);
    const prod = this.store.products.find(p => p.id === productId);
    this.showToast(isLiked ? `Added ${prod?.name || 'coffee'} to Favorites ❤️` : `Removed from Favorites 🤍`, isLiked ? '❤️' : '🤍');
    this.renderHomeMenu();
  }

  renderHomeMenu() {
    const grid = document.getElementById('products-web-grid');
    if (!grid) return;

    const products = this.store.getFilteredProducts();

    if (products.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <div style="font-size: 48px; margin-bottom: 12px;">☕</div>
          <h3 style="font-size: 20px; color: var(--text-main);">No coffee found</h3>
          <p style="font-size: 14px; margin-top: 6px;">Try searching with different keywords or switch categories.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = products.map(prod => {
      const isLiked = this.store.favorites.includes(prod.id);
      return `
        <div class="web-coffee-card" data-product-id="${prod.id}" style="cursor:pointer;">
          <div class="card-img-box">
            <img src="${prod.image}" alt="${prod.name}" loading="lazy">
            <button class="card-like-btn ${isLiked ? 'liked' : ''}" data-like-id="${prod.id}" title="${isLiked ? 'Unlike' : 'Like'}">
              <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
            <div class="card-rating-float">
              <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span>${prod.rating}</span>
            </div>
          </div>
          <div class="card-body">
            <h3 class="card-title">${prod.name}</h3>
            <p class="card-sub">${prod.subName}</p>
            <div class="card-tags">
              ${prod.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}
              <span class="card-tag" style="background:rgba(237,81,81,0.12); color:#ED5151;">❤️ ${prod.likes || 0}</span>
            </div>
            <div class="card-foot">
              <div class="card-price"><span>$</span>${prod.basePrice.toFixed(2)}</div>
              <div class="card-actions-row">
                <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); window.openCoffeeCustomizer('${prod.id}')">Customize</button>
                <button class="btn-icon" style="border-radius:12px; width:38px; height:38px;" onclick="event.stopPropagation(); window.masterStore.addToCart({productId:'${prod.id}', name:'${prod.name}', size:'M', price:${prod.basePrice}, quantity:1, milk:'Whole Milk', sweetness:'50% Sweet', temperature:'Hot', extras:[], image:'${prod.image}'}); window.showWebToast('Added ${prod.name} to cart!', '🛍️'); window.openCartDrawer();" title="Quick Add">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Whole card click handler & Like buttons
    grid.querySelectorAll('.web-coffee-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        const prodId = card.dataset.productId;
        window.openCoffeeCustomizer(prodId);
      });
    });

    grid.querySelectorAll('.card-like-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleLikeClick(btn.dataset.likeId);
      });
    });
  }

  renderTrackingView() {
    const activeOrder = this.store.orders[0];
    const timerEl = document.getElementById('tracking-live-timer');
    const destEl = document.getElementById('tracking-live-address');
    const orderNumEl = document.getElementById('tracking-live-ord-id');
    const courierNameEl = document.getElementById('tracking-courier-name');
    const lang = this.store.user.preferences.language || 'uz';

    if (activeOrder) {
      if (orderNumEl) orderNumEl.textContent = `Buyurtma #${activeOrder.id} • ${activeOrder.items.map(i => i.name).join(', ')}`;
      if (destEl) destEl.textContent = activeOrder.address;
      if (courierNameEl) courierNameEl.textContent = activeOrder.courier?.name || 'Brooklyn Simmons (Kuryer)';
      
      if (timerEl) {
        if (activeOrder.status === 'delivered') {
          timerEl.textContent = lang === 'uz' ? '✅ Yetkazildi! Yoqimli ishtaha!' : lang === 'ru' ? '✅ Доставлено! Приятного аппетита!' : '✅ Delivered! Enjoy your coffee!';
        } else if (activeOrder.status === 'on_the_way') {
          timerEl.textContent = lang === 'uz' ? '🛵 Kuryer yo‘lda (Yetkazilmoqda ~10-15 daqiqa)' : lang === 'ru' ? '🛵 Курьер в пути (~10-15 минут)' : '🛵 Courier is on the way (~10-15 min)';
        } else if (activeOrder.status === 'preparing') {
          timerEl.textContent = lang === 'uz' ? '☕ Qahvangiz tayyorlanmoqda (Tayyorlanyapti)' : lang === 'ru' ? '☕ Ваш кофе готовится (Свежая обжарка)' : '☕ Brewing your fresh coffee';
        } else {
          timerEl.textContent = lang === 'uz' ? '⏳ Buyurtma qabul qilindi' : lang === 'ru' ? '⏳ Заказ принят' : '⏳ Order received';
        }
      }

      const steps = ['pending', 'preparing', 'on_the_way', 'delivered'];
      let currentIdx = steps.indexOf(activeOrder.status);
      if (currentIdx === -1) currentIdx = 1;

      document.querySelectorAll('.timeline-step').forEach((el, idx) => {
        el.classList.remove('completed', 'active');
        if (idx < currentIdx) el.classList.add('completed');
        else if (idx === currentIdx) el.classList.add('active');
      });
    }
  }

  onStoreUpdate() {
    this.renderHomeMenu();
    this.renderLocationNavbar();
    if (window.cartManager) window.cartManager.renderCart();
    if (window.adminDashboard) window.adminDashboard.render();
    if (window.profileManager) window.profileManager.render();
    if (this.store.currentView === 'tracking') this.renderTrackingView();
  }
}

window.app = new Application();
window.showWebToast = (msg, icon) => {
  if (window.app && window.app.showToast) {
    window.app.showToast(msg, icon);
  } else {
    console.log('[JavaGem Toast]:', msg);
  }
};

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.app.init());
  } else {
    window.app.init();
  }
}
