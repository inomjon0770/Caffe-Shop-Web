// JavaGem Master Reactive State Store
class MasterStore {
  constructor() {
    this.products = this.load('javagem_products', INITIAL_PRODUCTS);
    this.orders = this.load('javagem_orders', INITIAL_ORDERS);
    this.promos = this.load('javagem_promos', INITIAL_PROMOS);
    this.user = this.load('javagem_user', INITIAL_USER);
    this.cart = this.load('javagem_cart', [
      {
        id: 'cart-1',
        productId: 'caffe-mocha',
        name: 'Caffe Mocha',
        size: 'M',
        price: 4.53,
        quantity: 1,
        milk: 'Oat Milk',
        sweetness: '50% Sweet',
        temperature: 'Ice',
        extras: ['Whipped Cream'],
        image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&auto=format&fit=crop&q=80'
      }
    ]);
    this.favorites = this.load('javagem_favorites', ['caffe-mocha', 'caramel-macchiato']);
    this.activeDiscount = this.promos[0];
    this.currentView = 'home';
    this.activeCategory = 'All Coffee';
    this.searchQuery = '';
    this.sortOption = 'default';
    this.listeners = [];
  }

  load(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn('Storage read error:', e);
      return fallback;
    }
  }

  save() {
    try {
      localStorage.setItem('javagem_products', JSON.stringify(this.products));
      localStorage.setItem('javagem_orders', JSON.stringify(this.orders));
      localStorage.setItem('javagem_promos', JSON.stringify(this.promos));
      localStorage.setItem('javagem_user', JSON.stringify(this.user));
      localStorage.setItem('javagem_cart', JSON.stringify(this.cart));
      localStorage.setItem('javagem_favorites', JSON.stringify(this.favorites));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.save();
    this.listeners.forEach(fn => fn(this));
  }

  setView(viewName) {
    this.currentView = viewName;
    this.notify();
  }

  // --------------------------------------------------------------------------
  // Product Operations
  // --------------------------------------------------------------------------
  addProduct(productData) {
    const newProduct = {
      id: 'coffee-' + Date.now(),
      name: productData.name || 'New Coffee Brew',
      subName: productData.subName || 'Artisanal Specialty',
      category: productData.category || 'Specialty',
      rating: 5.0,
      reviewCount: 1,
      likes: 1,
      basePrice: parseFloat(productData.basePrice) || 4.50,
      prices: {
        S: (parseFloat(productData.basePrice) * 0.85).toFixed(2) * 1,
        M: parseFloat(productData.basePrice) || 4.50,
        L: (parseFloat(productData.basePrice) * 1.15).toFixed(2) * 1
      },
      inStock: true,
      featured: !!productData.featured,
      calories: productData.calories || '200 kcal',
      description: productData.description || 'Freshly brewed artisan coffee.',
      image: productData.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      tags: ['Fresh Brew', 'New Arrival'],
      reviews: []
    };
    this.products.unshift(newProduct);
    this.notify();
    return newProduct;
  }

  updateProduct(id, updatedFields) {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.products[idx] = { ...this.products[idx], ...updatedFields };
      const priceVal = updatedFields.basePrice || updatedFields.price;
      if (priceVal) {
        const bp = parseFloat(priceVal);
        this.products[idx].basePrice = bp;
        this.products[idx].prices = {
          S: (bp * 0.85).toFixed(2) * 1,
          M: bp,
          L: (bp * 1.15).toFixed(2) * 1
        };
      }
      this.notify();
      return this.products[idx];
    }
    return null;
  }

  deleteProduct(id) {
    this.products = this.products.filter(p => p.id !== id);
    this.notify();
  }

  toggleProductStock(id) {
    const product = this.products.find(p => p.id === id);
    if (product) {
      product.inStock = !product.inStock;
      this.notify();
    }
  }

  // --------------------------------------------------------------------------
  // Rating, Comments & Likes
  // --------------------------------------------------------------------------
  rateProduct(productId, score) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      const currentReviews = product.reviewCount || 1;
      const currentRating = product.rating || 5.0;
      const newReviews = currentReviews + 1;
      const newRating = ((currentRating * currentReviews + score) / newReviews).toFixed(1) * 1;

      product.rating = newRating;
      product.reviewCount = newReviews;
      this.notify();
      return product;
    }
  }

  addComment(productId, commentText, rating = 5, authorName = null) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      if (!product.reviews) product.reviews = [];
      const newReview = {
        id: 'rev-' + Date.now(),
        author: authorName || this.user.name || 'Coffee Lover',
        avatar: this.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
        rating: rating,
        date: new Date().toISOString().split('T')[0],
        comment: commentText
      };
      product.reviews.unshift(newReview);
      this.rateProduct(productId, rating);
      this.notify();
      return newReview;
    }
  }

  toggleLike(productId) {
    const product = this.products.find(p => p.id === productId);
    const isFav = this.favorites.includes(productId);

    if (isFav) {
      this.favorites = this.favorites.filter(id => id !== productId);
      if (product && product.likes > 0) product.likes--;
    } else {
      this.favorites.push(productId);
      if (product) product.likes = (product.likes || 0) + 1;
    }
    this.notify();
    return !isFav;
  }

  // --------------------------------------------------------------------------
  // Cart Operations
  // --------------------------------------------------------------------------
  addToCart(itemConfig) {
    const existingIndex = this.cart.findIndex(item => 
      item.productId === itemConfig.productId &&
      item.size === itemConfig.size &&
      item.milk === itemConfig.milk &&
      item.sweetness === itemConfig.sweetness &&
      item.temperature === itemConfig.temperature
    );

    if (existingIndex !== -1) {
      this.cart[existingIndex].quantity += (itemConfig.quantity || 1);
    } else {
      this.cart.push({
        id: 'cart-item-' + Date.now(),
        ...itemConfig
      });
    }
    this.notify();
  }

  updateCartQuantity(cartItemId, delta) {
    const idx = this.cart.findIndex(item => item.id === cartItemId);
    if (idx !== -1) {
      const newQty = this.cart[idx].quantity + delta;
      if (newQty <= 0) {
        this.cart.splice(idx, 1);
      } else {
        this.cart[idx].quantity = newQty;
      }
      this.notify();
    }
  }

  removeFromCart(cartItemId) {
    this.cart = this.cart.filter(item => item.id !== cartItemId);
    this.notify();
  }

  clearCart() {
    this.cart = [];
    this.notify();
  }

  getCartTotals() {
    const subtotal = this.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    let deliveryFee = subtotal > 0 ? 1.00 : 0.00;
    let discount = 0;

    // Support Promo Codes (JAVAMAX, MAXCOFFEE, FREESHIP)
    if (this.appliedPromo && subtotal > 0) {
      if (this.appliedPromo.type === 'percent') {
        discount = subtotal * (this.appliedPromo.value / 100);
      } else if (this.appliedPromo.type === 'fixed') {
        discount = Math.min(subtotal, this.appliedPromo.value);
      } else if (this.appliedPromo.type === 'free_delivery') {
        discount = deliveryFee;
        deliveryFee = 0;
      }
    } else if (this.activeDiscount && subtotal > 0) {
      if (this.activeDiscount.type === 'percentage') {
        discount = subtotal * this.activeDiscount.discountAmount;
      } else if (this.activeDiscount.type === 'flat') {
        discount = Math.min(subtotal, this.activeDiscount.discountAmount);
      } else if (this.activeDiscount.type === 'delivery_discount') {
        discount = deliveryFee;
        deliveryFee = 0;
      }
    }

    const total = Math.max(0, subtotal + deliveryFee - discount);
    return {
      subtotal: subtotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      discount: discount.toFixed(2),
      total: total.toFixed(2),
      itemCount: this.cart.reduce((acc, item) => acc + item.quantity, 0)
    };
  }

  // --------------------------------------------------------------------------
  // Orders Operations
  // --------------------------------------------------------------------------
  createOrder(orderData) {
    const totals = this.getCartTotals();
    const paymentMethod = orderData.paymentMethod || 'Naqd Pul (Yetkazilganda to‘lash)';
    let paymentType = 'card';
    const pLow = paymentMethod.toLowerCase();
    if (pLow.includes('naqd') || pLow.includes('cash')) {
      paymentType = 'cash';
    } else if (pLow.includes('hamyon') || pLow.includes('wallet')) {
      paymentType = 'wallet';
    }

    const orderTotal = parseFloat(totals.total);

    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      customerName: this.user.name || 'Mr. Max',
      customerPhone: this.user.phone || '+998 90 123-45-67',
      address: orderData.address || this.user.currentLocation || 'Bilzen, Tanjungbalai',
      deliveryMode: orderData.deliveryMode || 'deliver',
      paymentMethod: paymentMethod,
      paymentType: paymentType,
      items: this.cart.map(c => ({
        name: c.name,
        size: c.size || 'M',
        quantity: c.quantity || 1,
        price: c.price,
        custom: `${c.milk || 'Whole Milk'}, ${c.sweetness || '50% Sweet'}, ${c.temperature || 'Hot'}`
      })),
      subtotal: parseFloat(totals.subtotal),
      deliveryFee: parseFloat(totals.deliveryFee),
      discount: parseFloat(totals.discount),
      total: orderTotal,
      status: 'preparing', // When ordered, barista starts preparing it immediately!
      courier: {
        name: 'Brooklyn Simmons',
        phone: '+1 (555) 234-8901',
        rating: 4.9,
        vehicle: 'Honda PCX Scooter'
      }
    };

    if (paymentType === 'wallet') {
      this.user.walletBalance = Math.max(0, (this.user.walletBalance || 0) - orderTotal);
    }

    this.orders.unshift(newOrder);
    this.clearCart();
    this.notify();
    return newOrder;
  }

  updateOrderStatus(orderId, nextStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = nextStatus;
      this.notify();
    }
  }

  // --------------------------------------------------------------------------
  // User Profile, Location & Cards Management
  // --------------------------------------------------------------------------
  updateUserProfile(profileData) {
    this.user = { ...this.user, ...profileData };
    this.notify();
  }

  setUserLocation(locationText) {
    this.user.currentLocation = locationText;
    this.notify();
  }

  addUserAddress(title, detail) {
    if (!this.user.addresses) this.user.addresses = [];
    this.user.addresses.push({
      id: 'addr-' + Date.now(),
      title,
      detail,
      isDefault: this.user.addresses.length === 0
    });
    this.notify();
  }

  deleteUserAddress(addressId) {
    this.user.addresses = this.user.addresses.filter(a => a.id !== addressId);
    if (this.user.addresses.length > 0 && !this.user.addresses.some(a => a.isDefault)) {
      this.user.addresses[0].isDefault = true;
    }
    this.notify();
  }

  setDefaultAddress(addressId) {
    this.user.addresses.forEach(a => {
      a.isDefault = a.id === addressId;
    });
    this.notify();
  }

  addUserCard(cardData) {
    if (!this.user.savedCards) this.user.savedCards = [];
    const cleanNum = cardData.number.replace(/\s+/g, '');
    const masked = '•••• •••• •••• ' + cleanNum.slice(-4);
    this.user.savedCards.push({
      id: 'card-' + Date.now(),
      number: masked,
      rawNumber: cardData.number,
      exp: cardData.exp || '12/28',
      holder: cardData.holder || this.user.name,
      type: cardData.type || 'Visa / Mastercard'
    });
    this.notify();
  }

  deleteUserCard(cardId) {
    if (this.user.savedCards) {
      this.user.savedCards = this.user.savedCards.filter(c => c.id !== cardId);
      this.notify();
    }
  }

  topUpWallet(amount) {
    this.user.walletBalance = (this.user.walletBalance || 0) + amount;
    this.notify();
  }

  updatePreference(key, value) {
    this.user.preferences[key] = value;
    this.notify();
  }

  getFilteredProducts() {
    return this.products.filter(item => {
      const matchCat = this.activeCategory === 'All Coffee' || item.category === this.activeCategory;
      const matchSearch = !this.searchQuery || 
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.subName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }
}

window.masterStore = new MasterStore();
