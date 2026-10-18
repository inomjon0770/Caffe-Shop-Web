// JavaGem Splash Screen, Onboarding Carousel & Authentication Manager
class AuthManager {
  constructor() {
    this.store = window.masterStore;
    this.currentSlide = 0;
    this.totalSlides = 3;
    this.authMode = 'login'; // 'login' | 'register'
  }

  init() {
    this.initSplash();
    this.bindOnboarding();
    this.bindAuthModal();
    this.bindFormValidation();
  }

  // 1. Splash Screen
  initSplash() {
    const splash = document.getElementById('splash-screen');
    if (!splash) return;

    // Check if user has seen onboarding previously
    const hasSeenOnboarding = localStorage.getItem('javagem_seen_onboarding');

    const finishSplash = () => {
      splash.classList.add('fade-out');
      setTimeout(() => {
        splash.style.display = 'none';
        if (!hasSeenOnboarding) {
          this.openOnboarding();
        }
      }, 600);
    };

    // Auto-advance after 1.8 seconds or tap to skip
    const timer = setTimeout(finishSplash, 1800);
    splash.addEventListener('click', () => {
      clearTimeout(timer);
      finishSplash();
    });
  }

  // 2. Onboarding Carousel
  openOnboarding() {
    const onboarding = document.getElementById('onboarding-screen');
    if (onboarding) {
      onboarding.classList.remove('hidden');
      this.showSlide(0);
    }
  }

  closeOnboarding() {
    const onboarding = document.getElementById('onboarding-screen');
    if (onboarding) {
      onboarding.classList.add('hidden');
      localStorage.setItem('javagem_seen_onboarding', 'true');
    }
  }

  showSlide(index) {
    this.currentSlide = index;
    const slides = document.querySelectorAll('.onboarding-slide');
    const dots = document.querySelectorAll('.onboarding-dot');
    const nextBtn = document.getElementById('btn-onboarding-next');

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    if (nextBtn) {
      if (index === this.totalSlides - 1) {
        nextBtn.textContent = 'Boshlash (Get Started) ☕';
      } else {
        nextBtn.textContent = 'Keyingisi (Next) →';
      }
    }
  }

  nextSlide() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.showSlide(this.currentSlide + 1);
    } else {
      this.closeOnboarding();
      this.openAuthModal('register');
    }
  }

  bindOnboarding() {
    // Skip Button
    document.getElementById('btn-onboarding-skip')?.addEventListener('click', () => {
      this.closeOnboarding();
      this.openAuthModal('login');
    });

    // Next Button
    document.getElementById('btn-onboarding-next')?.addEventListener('click', () => {
      this.nextSlide();
    });

    // Dots Click
    document.querySelectorAll('.onboarding-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const slideIdx = parseInt(dot.dataset.slide, 10) || 0;
        this.showSlide(slideIdx);
      });
    });
  }

  // 3. Auth Modal (Login / Register / Google)
  openAuthModal(mode = 'login') {
    this.switchAuthTab(mode);
    const modal = document.getElementById('modal-auth');
    if (modal) {
      document.body.classList.add('modal-open');
      modal.classList.remove('hidden');
    }
  }

  closeAuthModal() {
    const modal = document.getElementById('modal-auth');
    if (modal) {
      modal.classList.add('hidden');
      document.body.classList.remove('modal-open');
    }
  }

  switchAuthTab(mode) {
    this.authMode = mode;
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === mode);
    });

    const regNameGroup = document.getElementById('auth-name-group');
    const submitBtn = document.getElementById('btn-auth-submit');
    const modalTitle = document.getElementById('auth-modal-title');
    const subtitle = document.getElementById('auth-modal-subtitle');

    if (mode === 'register') {
      if (regNameGroup) regNameGroup.style.display = 'block';
      if (submitBtn) submitBtn.textContent = 'Ro‘yxatdan O‘tish (Create Account)';
      if (modalTitle) modalTitle.textContent = 'Yangi Hisob Ochish ✨';
      if (subtitle) subtitle.textContent = 'JavaGem oilasiga qo‘shiling va maxsus bonuslarga ega bo‘ling!';
    } else {
      if (regNameGroup) regNameGroup.style.display = 'none';
      if (submitBtn) submitBtn.textContent = 'Kirish (Sign In) ☕';
      if (modalTitle) modalTitle.textContent = 'Xush Kelibsiz! ☕';
      if (subtitle) subtitle.textContent = 'Qahva dunyosiga kirish uchun hisobingizga kiring';
    }

    // Reset feedback
    this.resetValidationFeedback();
  }

  resetValidationFeedback() {
    const emailFeedback = document.getElementById('auth-email-feedback');
    if (emailFeedback) {
      emailFeedback.textContent = '';
      emailFeedback.className = 'input-feedback-msg';
    }
    this.validatePassword('');
  }

  bindAuthModal() {
    // Tab switching
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchAuthTab(btn.dataset.tab);
      });
    });

    // Close button & overlay click
    document.getElementById('btn-close-auth')?.addEventListener('click', () => {
      this.closeAuthModal();
    });

    const modal = document.getElementById('modal-auth');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeAuthModal();
      });
    }

    // Google Login
    document.getElementById('btn-auth-google')?.addEventListener('click', () => {
      this.loginWithGoogle();
    });

    // Password Toggle Eye
    document.getElementById('btn-toggle-auth-pwd')?.addEventListener('click', () => {
      const pwdInput = document.getElementById('input-auth-pwd');
      if (pwdInput) {
        const isPwd = pwdInput.type === 'password';
        pwdInput.type = isPwd ? 'text' : 'password';
      }
    });

    // Guest browse
    document.getElementById('btn-auth-guest')?.addEventListener('click', () => {
      this.closeAuthModal();
      window.showWebToast('Mehmon rejimida davom etmoqdasiz ☕', '👋');
    });
  }

  // 4. Strict Validation: Gmail (@gmail.com) & Strong Password Rules
  bindFormValidation() {
    const emailInput = document.getElementById('input-auth-email');
    const pwdInput = document.getElementById('input-auth-pwd');
    const submitBtn = document.getElementById('btn-auth-submit');

    if (emailInput) {
      emailInput.addEventListener('input', (e) => {
        this.validateGmail(e.target.value.trim());
      });
    }

    if (pwdInput) {
      pwdInput.addEventListener('input', (e) => {
        this.validatePassword(e.target.value);
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }
  }

  validateGmail(email) {
    const feedback = document.getElementById('auth-email-feedback');
    if (!feedback) return false;

    if (!email) {
      feedback.textContent = '';
      feedback.className = 'input-feedback-msg';
      return false;
    }

    // Must end with @gmail.com and have valid prefix
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    const isValid = gmailRegex.test(email);

    if (isValid) {
      feedback.textContent = '✓ To‘g‘ri @gmail.com manzili';
      feedback.className = 'input-feedback-msg success';
      return true;
    } else {
      feedback.textContent = '✗ Faqat @gmail.com manzili qabul qilinadi (masalan: max@gmail.com)';
      feedback.className = 'input-feedback-msg error';
      return false;
    }
  }

  validatePassword(password) {
    const critLength = document.getElementById('crit-length');
    const critUpper = document.getElementById('crit-upper');
    const critNumber = document.getElementById('crit-number');
    const critSpecial = document.getElementById('crit-special');

    const hasMinLen = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (critLength) critLength.classList.toggle('valid', hasMinLen);
    if (critUpper) critUpper.classList.toggle('valid', hasUpper);
    if (critNumber) critNumber.classList.toggle('valid', hasNumber);
    if (critSpecial) critSpecial.classList.toggle('valid', hasSpecial);

    return hasMinLen && hasUpper && hasNumber && hasSpecial;
  }

  handleFormSubmit() {
    const email = document.getElementById('input-auth-email')?.value.trim() || '';
    const pwd = document.getElementById('input-auth-pwd')?.value || '';
    const name = document.getElementById('input-auth-name')?.value.trim() || 'JavaGem Member';

    const isGmailValid = this.validateGmail(email);
    const isPasswordValid = this.validatePassword(pwd);

    if (!isGmailValid) {
      alert('Iltimos, @gmail.com bilan tugaydigan haqiqiy Gmail manzilini kiriting (Masalan: ismingiz@gmail.com)');
      document.getElementById('input-auth-email')?.focus();
      return;
    }

    if (!isPasswordValid) {
      alert('Parol xavfsizlik talablariga javob bermaydi:\n• Kamida 8 ta belgi\n• Kamida 1 ta Katta harf (A-Z)\n• Kamida 1 ta Raqam (0-9)\n• Kamida 1 ta Maxsus belgi (!@#$...)');
      document.getElementById('input-auth-pwd')?.focus();
      return;
    }

    if (this.authMode === 'register') {
      // Register
      const newUser = {
        name: name,
        email: email,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        walletBalance: 15.00 // $15 welcome credit for new registered members!
      };
      this.store.updateUserProfile(newUser);
      this.closeAuthModal();
      window.showWebToast(`🎉 Tabriklaymiz, ${name}! $15 xush kelibsiz bonusi berildi!`, '🎁');
      if (window.profileManager) window.profileManager.render();
    } else {
      // Login
      const user = {
        name: name !== 'JavaGem Member' ? name : (email.split('@')[0].toUpperCase()),
        email: email
      };
      this.store.updateUserProfile(user);
      this.closeAuthModal();
      window.showWebToast(`Xush kelibsiz, ${this.store.user.name}! ☕`, '✨');
      if (window.profileManager) window.profileManager.render();
    }
  }

  loginWithGoogle() {
    const googleUser = {
      name: 'Mr. Max (Google User)',
      email: 'max.google.developer@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      walletBalance: (this.store.user.walletBalance || 0) + 10.00
    };
    this.store.updateUserProfile(googleUser);
    this.closeAuthModal();
    window.showWebToast('Google orqali muvaffaqiyatli kirdingiz! 🌐', '✓');
    if (window.profileManager) window.profileManager.render();
  }
}

window.authManager = new AuthManager();

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.authManager.init());
  } else {
    window.authManager.init();
  }
}
