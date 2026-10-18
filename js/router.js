// JavaGem Screen Router
class Router {
  constructor() {
    this.history = [];
    this.currentScreen = 'onboarding';
    this.screens = {
      onboarding: document.getElementById('screen-onboarding'),
      home: document.getElementById('screen-home'),
      detail: document.getElementById('screen-detail'),
      order: document.getElementById('screen-order'),
      tracking: document.getElementById('screen-tracking')
    };
  }

  init() {
    this.navigateTo('onboarding', false);
    
    // Bind desktop quick nav buttons
    document.querySelectorAll('.nav-pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetScreen = e.target.dataset.screen;
        if (targetScreen) {
          this.navigateTo(targetScreen);
        }
      });
    });
  }

  navigateTo(screenName, isForward = true) {
    if (!this.screens[screenName]) return;
    if (this.currentScreen === screenName && this.screens[screenName].classList.contains('active')) return;

    const prevScreenName = this.currentScreen;
    const prevScreenEl = this.screens[prevScreenName];
    const nextScreenEl = this.screens[screenName];

    // Update history stack
    if (isForward && prevScreenName !== screenName) {
      this.history.push(prevScreenName);
    }

    // Hide all screens
    Object.values(this.screens).forEach(el => {
      el.classList.remove('active', 'animate-in', 'animate-back');
    });

    // Show target screen
    nextScreenEl.classList.add('active');
    if (isForward) {
      nextScreenEl.classList.add('animate-in');
    } else {
      nextScreenEl.classList.add('animate-back');
    }

    this.currentScreen = screenName;
    window.appStore.state.activeScreen = screenName;

    // Update iOS status bar theme (dark text vs light text)
    const statusBar = document.querySelector('.status-bar');
    const homeIndicator = document.querySelector('.home-indicator');
    if (screenName === 'onboarding') {
      statusBar.classList.remove('dark-content');
      homeIndicator.classList.add('light');
    } else if (screenName === 'home') {
      statusBar.classList.remove('dark-content');
      homeIndicator.classList.remove('light');
    } else {
      statusBar.classList.add('dark-content');
      homeIndicator.classList.remove('light');
    }

    // Update desktop quick nav buttons
    document.querySelectorAll('.nav-pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.screen === screenName);
    });

    // Update bottom nav bar active item
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.nav === screenName);
    });

    // If navigated to tracking screen, initialize or start map animation
    if (screenName === 'tracking' && window.trackingMap) {
      window.trackingMap.startSimulation();
    }
  }

  goBack() {
    if (this.history.length > 0) {
      const prevScreen = this.history.pop();
      this.navigateTo(prevScreen, false);
    } else {
      this.navigateTo('home', false);
    }
  }
}

window.appRouter = new Router();
