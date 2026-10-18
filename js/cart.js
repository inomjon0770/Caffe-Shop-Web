// JavaGem Cart, Coffee Customizer & Checkout Flow
class CartManager {
  constructor() {
    this.store = window.masterStore;
    this.currentCustomizeProduct = null;
    this.customConfig = {
      size: 'M',
      milk: 'Whole Milk',
      sweetness: '50% Sweet',
      temperature: 'Hot',
      extras: []
    };
  }

  init() {
    this.bindEvents();
    this.renderCart();
  }

  bindEvents() {
    // Cart Drawer Triggers
    const cartBtn = document.getElementById('navbar-cart-btn');
    const closeCartBtn = document.getElementById('btn-close-cart');
    const cartOverlay = document.getElementById('cart-drawer-overlay');

    if (cartBtn) {
      cartBtn.addEventListener('click', () => this.openCart());
    }
    if (closeCartBtn) {
      closeCartBtn.addEventListener('click', () => this.closeCart());
    }
    if (cartOverlay) {
      cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) this.closeCart();
      });
    }

    // Checkout Modal Triggers
    const proceedCheckoutBtn = document.getElementById('btn-proceed-checkout');
    const closeCheckoutBtn = document.getElementById('btn-close-checkout');
    const checkoutOverlay = document.getElementById('modal-checkout');

    if (proceedCheckoutBtn) {
      proceedCheckoutBtn.addEventListener('click', () => {
        if (this.store.cart.length === 0) {
          window.showWebToast('Your cart is empty!', '🛍️');
          return;
        }
        this.closeCart();
        this.openCheckout();
      });
    }
    if (closeCheckoutBtn) {
      closeCheckoutBtn.addEventListener('click', () => this.closeCheckout());
    }
    if (checkoutOverlay) {
      checkoutOverlay.addEventListener('click', (e) => {
        if (e.target === checkoutOverlay) this.closeCheckout();
      });
    }

    // Customizer Modal Triggers
    const closeCustomizerBtn = document.getElementById('btn-close-customizer');
    const customizerOverlay = document.getElementById('modal-customizer');
    const addToCartFromModalBtn = document.getElementById('btn-add-custom-to-cart');

    if (closeCustomizerBtn) {
      closeCustomizerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeCustomizer();
      });
    }
    if (customizerOverlay) {
      customizerOverlay.addEventListener('click', (e) => {
        if (e.target === customizerOverlay || e.target.classList.contains('btn-close-modal') || e.target.closest('.btn-close-modal')) {
          this.closeCustomizer();
        }
      });
    }

    // Global Modal Click Outside & Escape Key
    document.querySelectorAll('.web-modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
          this.checkBodyScrollLock();
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeCustomizer();
        this.closeCart();
        this.closeCheckout();
        document.querySelectorAll('.web-modal-overlay, .cart-drawer-overlay').forEach(el => el.classList.remove('active'));
        this.checkBodyScrollLock();
      }
    });

    if (addToCartFromModalBtn) {
      addToCartFromModalBtn.addEventListener('click', () => {
        this.addCurrentCustomizedProductToCart();
      });
    }

    // Apply Promo in Checkout
    const applyPromoBtn = document.getElementById('btn-apply-checkout-promo');
    if (applyPromoBtn) {
      applyPromoBtn.addEventListener('click', () => {
        const promoInput = document.getElementById('input-checkout-promo').value.trim();
        const promo = this.store.promos.find(p => p.code.toLowerCase() === promoInput.toLowerCase());
        if (promo) {
          this.store.activeDiscount = promo;
          this.renderCheckout();
          window.showWebToast(`Promo "${promo.code}" applied! (${promo.title})`, '🏷️');
        } else {
          window.showWebToast('Invalid promo code. Try "BOGO" or "COFFEE20"', '❌');
        }
      });
    }

    // Place Final Order
    const placeOrderBtn = document.getElementById('btn-confirm-place-order');
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', () => {
        this.placeOrder();
      });
    }

    // Delivery / Pickup Segment in Checkout
    document.querySelectorAll('.checkout-seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.checkout-seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderCheckout();
      });
    });
  }

  openCart() {
    document.body.classList.add('modal-open');
    document.getElementById('cart-drawer-overlay')?.classList.add('active');
    this.renderCart();
  }

  closeCart() {
    document.getElementById('cart-drawer-overlay')?.classList.remove('active');
    this.checkBodyScrollLock();
  }

  openCustomizer(productId) {
    const prod = this.store.products.find(p => p.id === productId);
    if (!prod) return;

    this.currentCustomizeProduct = prod;
    this.customConfig = {
      size: 'M',
      milk: 'Whole Milk',
      sweetness: '50% Sweet',
      temperature: 'Hot',
      extras: []
    };

    const modal = document.getElementById('modal-customizer');
    const imgEl = document.getElementById('customizer-hero-img');
    const titleEl = document.getElementById('customizer-prod-title');
    const subEl = document.getElementById('customizer-prod-sub');
    const priceBtnEl = document.getElementById('customizer-price-display');

    if (imgEl) imgEl.src = prod.image;
    if (titleEl) titleEl.textContent = prod.name;
    if (subEl) subEl.textContent = prod.description;
    if (priceBtnEl) priceBtnEl.textContent = `$ ${prod.prices.M.toFixed(2)}`;

    this.bindCustomizerOptionPills();
    this.renderCustomizerReviewsAndRatings(prod);
    document.body.classList.add('modal-open');
    if (modal) modal.classList.add('active');
  }


  closeCustomizer() {
    const modal = document.getElementById('modal-customizer');
    if (modal) modal.classList.remove('active');
    this.checkBodyScrollLock();
  }

  checkBodyScrollLock() {
    const hasActiveModal = document.querySelector('.web-modal-overlay.active, .cart-drawer-overlay.active');
    if (!hasActiveModal) {
      document.body.classList.remove('modal-open');
    }
  }


  bindCustomizerOptionPills() {
    const prod = this.currentCustomizeProduct;
    if (!prod) return;

    // Sizes
    document.querySelectorAll('.opt-size-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.size === this.customConfig.size);
      btn.onclick = () => {
        document.querySelectorAll('.opt-size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.customConfig.size = btn.dataset.size;
        this.updateCustomizerPrice();
      };
    });

    // Milk
    document.querySelectorAll('.opt-milk-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.milk === this.customConfig.milk);
      btn.onclick = () => {
        document.querySelectorAll('.opt-milk-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.customConfig.milk = btn.dataset.milk;
      };
    });

    // Sweetness
    document.querySelectorAll('.opt-sweet-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sweet === this.customConfig.sweetness);
      btn.onclick = () => {
        document.querySelectorAll('.opt-sweet-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.customConfig.sweetness = btn.dataset.sweet;
      };
    });

    // Temperature
    document.querySelectorAll('.opt-temp-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.temp === this.customConfig.temperature);
      btn.onclick = () => {
        document.querySelectorAll('.opt-temp-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.customConfig.temperature = btn.dataset.temp;
      };
    });
  }

  updateCustomizerPrice() {
    const prod = this.currentCustomizeProduct;
    if (!prod) return;
    const price = prod.prices[this.customConfig.size] || prod.basePrice;
    const priceDisplay = document.getElementById('customizer-price-display');
    if (priceDisplay) priceDisplay.textContent = `$ ${price.toFixed(2)}`;
  }

  addCurrentCustomizedProductToCart() {
    const prod = this.currentCustomizeProduct;
    if (!prod) return;

    const price = prod.prices[this.customConfig.size] || prod.basePrice;
    this.store.addToCart({
      productId: prod.id,
      name: prod.name,
      size: this.customConfig.size,
      price: price,
      quantity: 1,
      milk: this.customConfig.milk,
      sweetness: this.customConfig.sweetness,
      temperature: this.customConfig.temperature,
      extras: this.customConfig.extras,
      image: prod.image
    });

    this.closeCustomizer();
    window.showWebToast(`Added ${prod.name} (${this.customConfig.size}) to cart!`, '🛍️');
    this.openCart();
  }

  renderCart() {
    const cartScroll = document.getElementById('cart-items-container');
    const badgeEl = document.getElementById('navbar-cart-count');
    const subtotalEl = document.getElementById('cart-subtotal-val');
    const deliveryEl = document.getElementById('cart-delivery-val');
    const totalEl = document.getElementById('cart-total-val');

    const totals = this.store.getCartTotals();
    if (badgeEl) badgeEl.textContent = totals.itemCount;

    if (!cartScroll) return;

    if (this.store.cart.length === 0) {
      cartScroll.innerHTML = `
        <div style="text-align:center; padding: 60px 20px; color:var(--text-muted);">
          <div style="font-size:44px; margin-bottom:12px;">🛍️</div>
          <h4 style="font-size:18px; color:var(--text-main);">Your cart is empty</h4>
          <p style="font-size:13px; margin-top:6px;">Explore our artisanal menu and add delicious coffee!</p>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = '$ 0.00';
      if (deliveryEl) deliveryEl.textContent = '$ 0.00';
      if (totalEl) totalEl.textContent = '$ 0.00';
      return;
    }

    cartScroll.innerHTML = this.store.cart.map(item => `
      <div class="cart-item-card">
        <img class="cart-item-thumb" src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-spec">${item.size} • ${item.milk} • ${item.temperature} • ${item.sweetness}</div>
          <div class="cart-item-price-row">
            <span class="cart-price-bold">$ ${(item.price * item.quantity).toFixed(2)}</span>
            <div class="cart-stepper">
              <button class="cart-step-btn" data-minus-cart-id="${item.id}">−</button>
              <span class="cart-step-val">${item.quantity}</span>
              <button class="cart-step-btn" data-plus-cart-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    if (subtotalEl) subtotalEl.textContent = `$ ${totals.subtotal}`;
    if (deliveryEl) deliveryEl.textContent = `$ ${totals.deliveryFee}`;
    if (totalEl) totalEl.textContent = `$ ${totals.total}`;

    // Render Promo section in Cart
    if (window.promoManager) {
      window.promoManager.renderPromoUI();
    }

    // Steppers Handlers
    cartScroll.querySelectorAll('[data-minus-cart-id]').forEach(btn => {
      btn.onclick = () => {
        this.store.updateCartQuantity(btn.dataset.minusCartId, -1);
        this.renderCart();
      };
    });

    cartScroll.querySelectorAll('[data-plus-cart-id]').forEach(btn => {
      btn.onclick = () => {
        this.store.updateCartQuantity(btn.dataset.plusCartId, 1);
        this.renderCart();
      };
    });
  }

  openCheckout() {
    const modal = document.getElementById('modal-checkout');
    this.renderCheckout();
    document.body.classList.add('modal-open');
    if (modal) modal.classList.add('active');
  }

  closeCheckout() {
    document.getElementById('modal-checkout')?.classList.remove('active');
    this.checkBodyScrollLock();
  }


  renderCustomizerReviewsAndRatings(prod) {
    prod = this.store.products.find(p => p.id === prod.id) || prod;
    this.currentCustomizeProduct = prod;

    const starRow = document.getElementById('customizer-interactive-stars');
    const scoreText = document.getElementById('customizer-rating-score-text');
    const reviewsList = document.getElementById('customizer-reviews-list');
    const commentInput = document.getElementById('input-new-comment-text');
    const postCommentBtn = document.getElementById('btn-post-coffee-comment');

    if (scoreText) scoreText.textContent = `${prod.rating} (${prod.reviewCount || 0} reviews)`;

    // 5 Star Buttons
    if (starRow) {
      starRow.innerHTML = [1, 2, 3, 4, 5].map(starNum => `
        <button class="star-pick-btn ${starNum <= Math.round(prod.rating) ? 'active' : ''}" data-star="${starNum}">★</button>
      `).join('');

      starRow.querySelectorAll('.star-pick-btn').forEach(btn => {
        btn.onclick = () => {
          const score = parseInt(btn.dataset.star, 10);
          this.store.rateProduct(prod.id, score);
          this.renderCustomizerReviewsAndRatings(prod);
          window.showWebToast(`Rated ${score} stars for ${prod.name}! ⭐`, '⭐');
        };
      });
    }

    // Reviews List
    if (reviewsList) {
      const reviews = prod.reviews || [];
      if (reviews.length === 0) {
        reviewsList.innerHTML = `<p style="color:var(--text-muted); font-size:13px; text-align:center; padding:10px;">Be the first to review this delicious coffee!</p>`;
      } else {
        reviewsList.innerHTML = reviews.map(r => `
          <div class="review-item-card">
            <div class="review-top-line">
              <span class="review-author">👤 ${r.author}</span>
              <span class="review-stars">${'★'.repeat(r.rating || 5)}</span>
            </div>
            <p class="review-text">${r.comment}</p>
          </div>
        `).join('');
      }
    }

    // Post Comment Handler
    if (postCommentBtn) {
      postCommentBtn.onclick = () => {
        const text = commentInput ? commentInput.value.trim() : '';
        if (text) {
          this.store.addComment(prod.id, text, 5);
          if (commentInput) commentInput.value = '';
          this.renderCustomizerReviewsAndRatings(prod);
          window.showWebToast('Review and comment posted successfully! 💬', '🎉');
        } else {
          alert('Please type a comment before posting.');
        }
      };
    }

    if (commentInput && !commentInput._hasKeyHandler) {
      commentInput._hasKeyHandler = true;
      commentInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          postCommentBtn?.click();
        }
      });
    }
  }

  renderCheckout() {
    const totals = this.store.getCartTotals();
    const addressSelect = document.getElementById('checkout-address-select');
    const paymentSelect = document.getElementById('checkout-payment-select');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const deliveryEl = document.getElementById('checkout-delivery');
    const discountEl = document.getElementById('checkout-discount');
    const totalEl = document.getElementById('checkout-total');

    if (addressSelect) {
      const addresses = this.store.user.addresses || [];
      if (addresses.length === 0) {
        addressSelect.innerHTML = `<option value="${this.store.user.currentLocation || 'Toshkent shahar'}">📍 ${this.store.user.currentLocation || 'Toshkent shahar'}</option>`;
      } else {
        addressSelect.innerHTML = addresses.map(a => `
          <option value="${a.detail}">${a.title} — ${a.detail}</option>
        `).join('');
      }
    }

    if (paymentSelect) {
      const cards = this.store.user.savedCards || [];
      paymentSelect.innerHTML = `
        <option value="Karta orqali (Uzcard / Humo / Visa)">💳 Bank Kartasi (Uzcard / Humo / Visa)</option>
        <option value="Naqd pul (Yetkazilganda to‘lash)">💵 Naqd pul (Yetkazib berilganda to‘lash)</option>
        <option value="JavaGem Hamyoni ($${(this.store.user.walletBalance || 0).toFixed(2)})">💎 JavaGem Hamyoni ($${(this.store.user.walletBalance || 0).toFixed(2)})</option>
        ${cards.map(c => `<option value="${c.type} (${c.number})">💳 Saqlangan Karta: ${c.type} (${c.number})</option>`).join('')}
      `;
    }

    if (subtotalEl) subtotalEl.textContent = `$ ${totals.subtotal}`;
    if (deliveryEl) deliveryEl.textContent = `$ ${totals.deliveryFee}`;
    if (discountEl) discountEl.textContent = `-$ ${totals.discount}`;
    if (totalEl) totalEl.textContent = `$ ${totals.total}`;
  }

  placeOrder() {
    if (this.store.cart.length === 0) {
      window.showWebToast('Savatchangiz bo‘sh!', '🛍️');
      return;
    }

    const mode = document.querySelector('.checkout-seg-btn.active')?.dataset.mode || 'deliver';
    const address = document.getElementById('checkout-address-select')?.value || this.store.user.currentLocation;
    const payment = document.getElementById('checkout-payment-select')?.value || 'Karta orqali (Uzcard / Humo)';

    const newOrder = this.store.createOrder({
      deliveryMode: mode,
      address: address,
      paymentMethod: payment
    });

    this.closeCheckout();

    // Sound FX
    window.soundEngine?.playSuccessChime();

    // Trigger Admin Real-Time Notification & Audio Chime
    if (window.adminDashboard) {
      window.adminDashboard.showLiveOrderAlert(newOrder);
    }

    window.showWebToast(`🎉 Buyurtma #${newOrder.id} qabul qilindi! Qahvangiz tayyorlanmoqda ☕`, '☕');

    // Show Digital Thermal Receipt
    setTimeout(() => {
      if (window.receiptManager) {
        window.receiptManager.openReceipt(newOrder.id);
      }
    }, 400);

    // Switch to Tracking View
    if (window.app) {
      window.app.switchView('tracking');
    }
  }
}


window.cartManager = new CartManager();
window.openCartDrawer = () => window.cartManager.openCart();
window.openCoffeeCustomizer = (id) => window.cartManager.openCustomizer(id);

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.cartManager.init());
  } else {
    window.cartManager.init();
  }
}
