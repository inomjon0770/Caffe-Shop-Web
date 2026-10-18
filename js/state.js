// JavaGem Application State Management
class Store {
  constructor() {
    this.state = {
      activeScreen: 'onboarding', // 'onboarding', 'home', 'detail', 'order', 'tracking'
      selectedProductId: 'caffe-mocha',
      selectedSize: 'M',
      activeCategory: 'All Coffee',
      searchQuery: '',
      deliveryMode: 'deliver', // 'deliver' | 'pickup'
      deliveryAddress: {
        title: 'Jl. Kpg Sutoyo',
        detail: 'Kpg. Sutoyo No. 620, Bilzen, Tanjungbalai',
        note: ''
      },
      cartItems: [
        {
          id: 'caffe-mocha',
          size: 'M',
          quantity: 1,
          price: 4.53
        }
      ],
      activeDiscount: PROMOS[0],
      appliedDiscounts: [PROMOS[0]],
      paymentMethod: {
        id: 'wallet',
        name: 'Cash/Wallet',
        balance: 5.53
      },
      favorites: ['caffe-mocha', 'caramel-macchiato'],
      tracking: {
        remainingSeconds: 600, // 10 minutes
        currentStep: 3, // 1: Confirmed, 2: Preparing, 3: On the way, 4: Delivered
        courierProgress: 0.35 // 0.0 to 1.0 along the route path
      }
    };

    this.listeners = [];
    this.loadPersistedState();
  }

  loadPersistedState() {
    try {
      const savedFavorites = localStorage.getItem('javagem_favorites');
      if (savedFavorites) {
        this.state.favorites = JSON.parse(savedFavorites);
      }
      const savedAddress = localStorage.getItem('javagem_address');
      if (savedAddress) {
        this.state.deliveryAddress = JSON.parse(savedAddress);
      }
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }

  savePersistedState() {
    try {
      localStorage.setItem('javagem_favorites', JSON.stringify(this.state.favorites));
      localStorage.setItem('javagem_address', JSON.stringify(this.state.deliveryAddress));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
    this.savePersistedState();
  }

  // Actions
  setSelectedProduct(productId) {
    this.state.selectedProductId = productId;
    this.notify();
  }

  setSelectedSize(size) {
    this.state.selectedSize = size;
    // Update active item in cart if single item active
    if (this.state.cartItems.length > 0) {
      const product = this.getSelectedProduct();
      this.state.cartItems[0].size = size;
      this.state.cartItems[0].price = product.prices[size] || product.basePrice;
    }
    this.notify();
  }

  setActiveCategory(category) {
    this.state.activeCategory = category;
    this.notify();
  }

  setSearchQuery(query) {
    this.state.searchQuery = query;
    this.notify();
  }

  setDeliveryMode(mode) {
    this.state.deliveryMode = mode;
    this.notify();
  }

  updateQuantity(delta) {
    if (this.state.cartItems.length === 0) {
      const product = this.getSelectedProduct();
      this.state.cartItems.push({
        id: product.id,
        size: this.state.selectedSize,
        quantity: 1,
        price: product.prices[this.state.selectedSize] || product.basePrice
      });
    } else {
      const current = this.state.cartItems[0].quantity;
      const next = Math.max(1, current + delta);
      this.state.cartItems[0].quantity = next;
    }
    this.notify();
  }

  toggleFavorite(productId) {
    if (this.state.favorites.includes(productId)) {
      this.state.favorites = this.state.favorites.filter(id => id !== productId);
    } else {
      this.state.favorites.push(productId);
    }
    this.notify();
  }

  setAddress(title, detail) {
    this.state.deliveryAddress.title = title;
    this.state.deliveryAddress.detail = detail;
    this.notify();
  }

  setAddressNote(note) {
    this.state.deliveryAddress.note = note;
    this.notify();
  }

  applyPromo(promoCode) {
    const promo = PROMOS.find(p => p.code.toLowerCase() === promoCode.toLowerCase());
    if (promo) {
      this.state.activeDiscount = promo;
      this.notify();
      return true;
    }
    return false;
  }

  // Getters
  getSelectedProduct() {
    return COFFEE_DATA.find(item => item.id === this.state.selectedProductId) || COFFEE_DATA[0];
  }

  getFilteredProducts() {
    return COFFEE_DATA.filter(item => {
      const matchesCategory = this.state.activeCategory === 'All Coffee' || item.category === this.state.activeCategory;
      const matchesSearch = !this.state.searchQuery || 
        item.name.toLowerCase().includes(this.state.searchQuery.toLowerCase()) ||
        item.subName.toLowerCase().includes(this.state.searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  getCartTotal() {
    if (this.state.cartItems.length === 0) return { subtotal: 0, delivery: 0, discount: 0, total: 0 };
    const item = this.state.cartItems[0];
    const subtotal = item.price * item.quantity;
    const delivery = this.state.deliveryMode === 'pickup' ? 0 : 1.00;
    const originalDelivery = 2.00;
    let discount = 0;
    if (this.state.activeDiscount) {
      if (this.state.activeDiscount.type === 'percentage') {
        discount = subtotal * this.state.activeDiscount.discountAmount;
      } else {
        discount = this.state.activeDiscount.discountAmount;
      }
    }
    const total = Math.max(0, subtotal + delivery - (this.state.deliveryMode === 'pickup' ? 0 : 0));
    return {
      subtotal: subtotal.toFixed(2),
      delivery: delivery.toFixed(2),
      originalDelivery: originalDelivery.toFixed(2),
      total: (subtotal + delivery).toFixed(2)
    };
  }
}

window.appStore = new Store();
