/**
 * FlavorCraft - Joyful Gourmet Recipe Studio & Kitchen Assistant
 * Comprehensive application logic: Zero-Delay Authentication, Focus Cook Mode,
 * 7-Day Weekly Meal Planner, Chef's Spotlight, Mood & Craving Filter,
 * Dynamic Servings Scaler, Web Audio SFX, Pure Canvas Confetti,
 * TheMealDB Online Search, Fridge Pantry Finder, and Grocery Lists.
 */

// ============================================================================
// State Management
// ============================================================================
const STATE = {
  // Authentication State
  currentUser: null,     // { name, email, avatar, provider, isGuest }
  registeredUsers: [],   // Array of { name, email, password, avatar }

  activeTab: 'exploreTab',
  currentCategory: 'all',
  currentCuisine: 'all',
  currentDifficulty: 'all',
  currentSort: 'recommended',
  activeMood: 'all',
  searchQuery: '',

  recipes: [],           // Combined list of local & custom recipes
  customRecipes: [],     // User created recipes in localStorage
  favorites: new Set(),  // Set of recipe IDs
  shoppingList: [],      // Array of { id, recipeId, recipeTitle, text, completed }
  pantryItems: [],       // Array of strings (e.g. ['Chicken', 'Paneer'])
  
  // Weekly Meal Plan: { monday: { breakfast: null, lunch: null, dinner: null }, ... }
  mealPlan: {},

  // User Ratings & Personal Notes
  ratings: {},           // { [recipeId]: number (1-5) }
  userNotes: {},         // { [recipeId]: string }

  // Sound & Delights
  soundEnabled: true,
  
  // Modal Active State
  currentRecipe: null,
  activeServings: 4,
  baseServings: 4,
  checkedIngredients: new Set(),

  // Focus Cook Mode State
  cookMode: {
    recipe: null,
    currentStep: 0,
    timerSeconds: 300,
    timerRemaining: 300,
    timerInterval: null,
    isRunning: false
  },

  // Modal Recipe Timer
  timer: {
    interval: null,
    totalSeconds: 0,
    remainingSeconds: 0,
    isRunning: false
  },

  // Theme
  theme: 'light',
  
  // Spotlight
  spotlightRecipe: null
};

// ============================================================================
// Initialization
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  initAuth();
  initTheme();
  initSound();
  initGreeting();
  initSpotlight();
  setupEventListeners();
  renderExploreRecipes();
  updateBadges();
});

// Load persistent data from localStorage
function loadFromLocalStorage() {
  try {
    // Registered Users & Current Session
    const savedUsers = localStorage.getItem('flavorcraft_registered_users');
    if (savedUsers) {
      STATE.registeredUsers = JSON.parse(savedUsers);
    } else {
      // Default accounts
      STATE.registeredUsers = [
        {
          name: 'Gordon Ramsay',
          email: 'chef@flavorcraft.com',
          password: 'password123',
          avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80'
        },
        {
          name: 'Alex Morgan',
          email: 'alex.morgan@gmail.com',
          password: 'password123',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        }
      ];
      localStorage.setItem('flavorcraft_registered_users', JSON.stringify(STATE.registeredUsers));
    }

    const savedSession = localStorage.getItem('flavorcraft_user_session');
    if (savedSession) {
      STATE.currentUser = JSON.parse(savedSession);
    }

    // Custom user recipes
    const savedCustom = localStorage.getItem('flavorcraft_custom_recipes');
    if (savedCustom) {
      STATE.customRecipes = JSON.parse(savedCustom);
    }
    
    // Combine INITIAL_RECIPES from recipes.js with custom user recipes
    STATE.recipes = [...(typeof INITIAL_RECIPES !== 'undefined' ? INITIAL_RECIPES : []), ...STATE.customRecipes];

    // Favorites
    const savedFavs = localStorage.getItem('flavorcraft_favorites');
    if (savedFavs) {
      STATE.favorites = new Set(JSON.parse(savedFavs));
    }

    // Shopping list
    const savedShop = localStorage.getItem('flavorcraft_shopping_list');
    if (savedShop) {
      STATE.shoppingList = JSON.parse(savedShop);
    }

    // Fridge pantry items
    const savedPantry = localStorage.getItem('flavorcraft_pantry');
    if (savedPantry) {
      STATE.pantryItems = JSON.parse(savedPantry);
    }

    // Meal Plan
    const savedMealPlan = localStorage.getItem('flavorcraft_meal_plan');
    if (savedMealPlan) {
      STATE.mealPlan = JSON.parse(savedMealPlan);
    } else {
      initEmptyMealPlan();
    }

    // Ratings & Notes
    const savedRatings = localStorage.getItem('flavorcraft_ratings');
    if (savedRatings) {
      STATE.ratings = JSON.parse(savedRatings);
    }

    const savedNotes = localStorage.getItem('flavorcraft_notes');
    if (savedNotes) {
      STATE.userNotes = JSON.parse(savedNotes);
    }

    // Theme & Sound
    const savedTheme = localStorage.getItem('flavorcraft_theme');
    if (savedTheme) STATE.theme = savedTheme;

    const savedSound = localStorage.getItem('flavorcraft_sound');
    if (savedSound !== null) STATE.soundEnabled = savedSound === 'true';

  } catch (e) {
    console.error('Error loading data from localStorage:', e);
  }
}

function initEmptyMealPlan() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  STATE.mealPlan = {};
  days.forEach(d => {
    STATE.mealPlan[d] = { breakfast: null, lunch: null, dinner: null };
  });
}

function saveCustomRecipes() {
  localStorage.setItem('flavorcraft_custom_recipes', JSON.stringify(STATE.customRecipes));
  STATE.recipes = [...(typeof INITIAL_RECIPES !== 'undefined' ? INITIAL_RECIPES : []), ...STATE.customRecipes];
}

function saveFavorites() {
  localStorage.setItem('flavorcraft_favorites', JSON.stringify(Array.from(STATE.favorites)));
  updateBadges();
}

function saveShoppingList() {
  localStorage.setItem('flavorcraft_shopping_list', JSON.stringify(STATE.shoppingList));
  updateBadges();
}

function savePantry() {
  localStorage.setItem('flavorcraft_pantry', JSON.stringify(STATE.pantryItems));
}

function saveMealPlan() {
  localStorage.setItem('flavorcraft_meal_plan', JSON.stringify(STATE.mealPlan));
}

function saveRatings() {
  localStorage.setItem('flavorcraft_ratings', JSON.stringify(STATE.ratings));
}

function saveNotes() {
  localStorage.setItem('flavorcraft_notes', JSON.stringify(STATE.userNotes));
}

// ============================================================================
// Cheerful Dynamic Greetings & Spotlight
// ============================================================================
function initGreeting() {
  const hour = new Date().getHours();
  const timeBadge = document.getElementById('greetingTimeBadge');
  const chefName = document.getElementById('greetingChefName');
  const quoteElem = document.getElementById('greetingQuote');
  const recipeCountElem = document.getElementById('statRecipeCount');

  if (recipeCountElem) {
    recipeCountElem.textContent = `${STATE.recipes.length}+ Recipes`;
  }

  let timeGreeting = '☀️ Good Afternoon';
  if (hour >= 5 && hour < 12) timeGreeting = '🌅 Good Morning';
  else if (hour >= 12 && hour < 17) timeGreeting = '☀️ Good Afternoon';
  else timeGreeting = '🌙 Good Evening';

  if (timeBadge) timeBadge.textContent = timeGreeting;

  const currentChef = STATE.currentUser ? STATE.currentUser.name.split(' ')[0] : 'Chef';
  if (chefName) chefName.textContent = `${currentChef}!`;

  const quotes = [
    '"Cooking is love made edible." ✨',
    '"Good food is the foundation of genuine happiness." 🍲',
    '"A recipe has no soul. You, as the cook, must bring soul to the recipe." 👨‍🍳',
    '"Food is our common ground, a universal experience." 🌍',
    '"Life is uncertain. Eat dessert first!" 🍰'
  ];
  if (quoteElem) {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteElem.textContent = randomQuote;
  }
}

function initSpotlight() {
  if (STATE.recipes.length === 0) return;

  // Pick a highlight dish (e.g. Hyderabadi Biryani or Butter Chicken or random)
  const spotlight = STATE.recipes.find(r => r.id === 'chicken-biryani') || STATE.recipes[0];
  STATE.spotlightRecipe = spotlight;

  const title = document.getElementById('spotlightTitle');
  const desc = document.getElementById('spotlightDesc');
  const timeTag = document.getElementById('spotlightTimeTag');
  const img = document.getElementById('spotlightImg');

  if (title) title.textContent = spotlight.title;
  if (desc) desc.textContent = spotlight.description || 'A wonderfully aromatic, freshly crafted gourmet specialty.';
  if (timeTag) timeTag.textContent = `⏱️ ${(spotlight.prepTime || 15) + (spotlight.cookTime || 25)} mins`;
  if (img) img.src = spotlight.image;

  const cookBtn = document.getElementById('spotlightCookBtn');
  const viewBtn = document.getElementById('spotlightQuickViewBtn');

  if (cookBtn) {
    cookBtn.onclick = () => {
      playSound('pop');
      openCookMode(spotlight);
    };
  }
  if (viewBtn) {
    viewBtn.onclick = () => {
      playSound('pop');
      openRecipeModal(spotlight);
    };
  }
}

// ============================================================================
// Zero-Delay Authentication Flow & Quick Login
// ============================================================================
function initAuth() {
  const authOverlay = document.getElementById('authOverlay');
  if (STATE.currentUser) {
    authOverlay.classList.remove('active');
    updateHeaderUserProfile();
    initGreeting();
  } else {
    authOverlay.classList.add('active');
  }
}

function setupAuthListeners() {
  // 1-Click Quick Demo Sign-Ins (Zero Delay)
  const demoGordon = document.getElementById('demoGordonBtn');
  const demoAlex = document.getElementById('demoAlexBtn');
  const demoGuest = document.getElementById('demoGuestBtn');

  if (demoGordon) {
    demoGordon.addEventListener('click', () => {
      const user = {
        name: 'Gordon Ramsay',
        email: 'chef@flavorcraft.com',
        avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80',
        provider: 'demo',
        isGuest: false
      };
      loginUser(user, 'Welcome back, Chef Gordon! 👨‍🍳');
    });
  }

  if (demoAlex) {
    demoAlex.addEventListener('click', () => {
      const user = {
        name: 'Alex Morgan',
        email: 'alex.morgan@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        provider: 'demo',
        isGuest: false
      };
      loginUser(user, 'Welcome, Chef Alex! ✨');
    });
  }

  if (demoGuest) {
    demoGuest.addEventListener('click', () => {
      const user = {
        name: 'Guest Chef',
        email: 'guest@flavorcraft.app',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
        provider: 'guest',
        isGuest: true
      };
      loginUser(user, 'Welcome, Guest Chef! Enjoy exploring! 🍽️');
    });
  }

  // Google Sign-In Simulation
  document.getElementById('googleSignInBtn').addEventListener('click', () => {
    const googleUser = {
      name: 'Alex Morgan',
      email: 'alex.morgan@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      provider: 'google',
      isGuest: false
    };
    loginUser(googleUser, 'Signed in with Google! Welcome, Alex! ✨');
  });

  // Tab switching between Sign In & Sign Up
  const tabSignInBtn = document.getElementById('tabSignInBtn');
  const tabSignUpBtn = document.getElementById('tabSignUpBtn');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');

  tabSignInBtn.addEventListener('click', () => {
    tabSignInBtn.classList.add('active');
    tabSignUpBtn.classList.remove('active');
    signInForm.classList.add('active');
    signUpForm.classList.remove('active');
  });

  tabSignUpBtn.addEventListener('click', () => {
    tabSignUpBtn.classList.add('active');
    tabSignInBtn.classList.remove('active');
    signUpForm.classList.add('active');
    signInForm.classList.remove('active');
  });

  // Password visibility toggle
  document.querySelectorAll('.password-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      const icon = btn.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-solid fa-eye-slash';
      } else {
        input.type = 'password';
        icon.className = 'fa-solid fa-eye';
      }
    });
  });

  // Email & Password Sign In
  signInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signInEmail').value.trim().toLowerCase();
    const password = document.getElementById('signInPassword').value;

    const matchedUser = STATE.registeredUsers.find(u => u.email.toLowerCase() === email && u.password === password);

    if (matchedUser) {
      const userSession = {
        name: matchedUser.name,
        email: matchedUser.email,
        avatar: matchedUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        provider: 'email',
        isGuest: false
      };
      loginUser(userSession, `Welcome back, ${matchedUser.name}! 👨‍🍳`);
    } else {
      showToast('Invalid email or password. Try the 1-Click Demo accounts above!', 'danger');
    }
  });

  // Sign Up Form
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signUpName').value.trim();
    const email = document.getElementById('signUpEmail').value.trim().toLowerCase();
    const password = document.getElementById('signUpPassword').value;
    const confirmPassword = document.getElementById('signUpConfirmPassword').value;

    if (password !== confirmPassword) {
      showToast('Passwords do not match. Please verify.', 'danger');
      return;
    }

    const exists = STATE.registeredUsers.some(u => u.email.toLowerCase() === email);
    if (exists) {
      showToast('An account with this email already exists. Please sign in.', 'danger');
      return;
    }

    const newUser = {
      name,
      email,
      password,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    };

    STATE.registeredUsers.push(newUser);
    localStorage.setItem('flavorcraft_registered_users', JSON.stringify(STATE.registeredUsers));

    const userSession = {
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      provider: 'email',
      isGuest: false
    };

    loginUser(userSession, `Account created! Welcome to FlavorCraft, ${name}! 🎉`);
  });

  // Guest Pass
  document.getElementById('guestSignInBtn').addEventListener('click', () => {
    const guestUser = {
      name: 'Guest Chef',
      email: 'guest@flavorcraft.app',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      provider: 'guest',
      isGuest: true
    };
    loginUser(guestUser, 'Welcome, Guest Chef! 🍽️');
  });

  // User Profile Dropdown & Logout
  const profileBtn = document.getElementById('userProfileBtn');
  const dropdownMenu = document.getElementById('userDropdownMenu');

  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#userProfileWrapper')) {
      dropdownMenu.classList.remove('open');
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', logoutUser);

  document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Password reset link sent to demo inbox.', 'info');
  });
}

function loginUser(userSession, message) {
  STATE.currentUser = userSession;
  localStorage.setItem('flavorcraft_user_session', JSON.stringify(userSession));
  
  const authOverlay = document.getElementById('authOverlay');
  authOverlay.classList.remove('active');

  updateHeaderUserProfile();
  initGreeting();
  playSound('success');
  triggerConfetti(60);
  showToast(message, 'success');
}

function logoutUser() {
  STATE.currentUser = null;
  localStorage.removeItem('flavorcraft_user_session');

  document.getElementById('userDropdownMenu').classList.remove('open');
  document.getElementById('authOverlay').classList.add('active');

  showToast('You have been logged out successfully.', 'info');
}

function updateHeaderUserProfile() {
  if (!STATE.currentUser) return;

  const avatarImg = document.getElementById('userAvatarImg');
  const userNameSpan = document.getElementById('userNameSpan');
  const dropdownUserName = document.getElementById('dropdownUserName');
  const dropdownUserEmail = document.getElementById('dropdownUserEmail');

  if (avatarImg) avatarImg.src = STATE.currentUser.avatar;
  if (userNameSpan) userNameSpan.textContent = STATE.currentUser.name.split(' ')[0];
  if (dropdownUserName) dropdownUserName.textContent = STATE.currentUser.name;
  if (dropdownUserEmail) dropdownUserEmail.textContent = STATE.currentUser.email;
}

// ============================================================================
// Sound FX & Pure Canvas Confetti Engine
// ============================================================================
function initSound() {
  const soundBtn = document.getElementById('soundToggleBtn');
  if (soundBtn) {
    soundBtn.innerHTML = STATE.soundEnabled 
      ? '<i class="fa-solid fa-volume-high"></i>' 
      : '<i class="fa-solid fa-volume-xmark"></i>';

    soundBtn.addEventListener('click', () => {
      STATE.soundEnabled = !STATE.soundEnabled;
      localStorage.setItem('flavorcraft_sound', STATE.soundEnabled);
      soundBtn.innerHTML = STATE.soundEnabled 
        ? '<i class="fa-solid fa-volume-high"></i>' 
        : '<i class="fa-solid fa-volume-xmark"></i>';
      showToast(STATE.soundEnabled ? 'Sound Effects Enabled 🔊' : 'Sound Effects Muted 🔇', 'info');
      if (STATE.soundEnabled) playSound('pop');
    });
  }
}

function playSound(type = 'chime') {
  if (!STATE.soundEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    if (type === 'pop') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } else if (type === 'success') {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.09);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.09 + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + i * 0.09);
        osc.stop(audioCtx.currentTime + i * 0.09 + 0.4);
      });
    } else if (type === 'chime') {
      const notes = [440, 659.25, 880];
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.12 + 0.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + i * 0.12);
        osc.stop(audioCtx.currentTime + i * 0.12 + 0.5);
      });
    }
  } catch (e) {
    // AudioContext blocked before interaction
  }
}

// Pure HTML5 Canvas Confetti Burst Engine
function triggerConfetti(count = 80) {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#f97316', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6'];
  const particles = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
      y: window.innerHeight / 2 + (Math.random() - 0.5) * 100,
      w: Math.random() * 10 + 6,
      h: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -14 - 4,
      gravity: 0.35,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 12,
      opacity: 1
    });
  }

  let animationFrame;
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeParticles = 0;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.vRot;
      p.opacity -= 0.012;

      if (p.opacity > 0) {
        activeParticles++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    });

    if (activeParticles > 0) {
      animationFrame = requestAnimationFrame(update);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  update();
}

// ============================================================================
// Theme Toggle
// ============================================================================
function initTheme() {
  document.documentElement.setAttribute('data-theme', STATE.theme);
  updateThemeIcon();
}

function toggleTheme() {
  STATE.theme = STATE.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', STATE.theme);
  localStorage.setItem('flavorcraft_theme', STATE.theme);
  updateThemeIcon();
  playSound('pop');
  showToast(`Switched to ${STATE.theme} mode`, 'info');
}

function updateThemeIcon() {
  const icon = document.querySelector('#themeToggleBtn i');
  if (icon) {
    icon.className = STATE.theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  }
}

// ============================================================================
// Event Listeners Setup
// ============================================================================
function setupEventListeners() {
  setupAuthListeners();

  // Brand Logo Click -> Explore Tab
  document.getElementById('brandLogo').addEventListener('click', () => switchTab('exploreTab'));

  // Theme Toggle Button
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

  // Tab Navigation Buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // Search Input with Instant local + Debounced online
  const searchInput = document.getElementById('recipeSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  let debounceTimeout;

  searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    clearSearchBtn.style.display = val ? 'flex' : 'none';

    // Instant local filtering as user types
    STATE.searchQuery = val.toLowerCase();
    renderFilteredList(STATE.recipes);

    // Debounced online API search
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      if (val) handleSearch(val);
    }, 300);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    handleSearch('');
    searchInput.focus();
  });

  document.getElementById('heroSearchBtn').addEventListener('click', () => {
    handleSearch(searchInput.value.trim());
  });

  // Surprise Me Button with Confetti & Sound
  document.getElementById('surpriseMeBtn').addEventListener('click', handleSurpriseMe);

  // Trending Query Pills
  document.querySelectorAll('.trend-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const q = pill.getAttribute('data-query');
      searchInput.value = q;
      clearSearchBtn.style.display = 'flex';
      handleSearch(q);
      playSound('pop');
    });
  });

  // Mood & Craving Filter Carousel
  document.querySelectorAll('.mood-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.mood-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      STATE.activeMood = pill.getAttribute('data-mood');
      playSound('pop');
      renderExploreRecipes();
    });
  });

  // Category Filter Pills
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      STATE.currentCategory = pill.getAttribute('data-category');
      playSound('pop');
      renderExploreRecipes();
    });
  });

  // Cuisine, Difficulty, and Sort Dropdowns
  document.getElementById('cuisineSelect').addEventListener('change', (e) => {
    STATE.currentCuisine = e.target.value;
    renderExploreRecipes();
  });

  document.getElementById('difficultySelect').addEventListener('change', (e) => {
    STATE.currentDifficulty = e.target.value;
    renderExploreRecipes();
  });

  document.getElementById('sortSelect').addEventListener('change', (e) => {
    STATE.currentSort = e.target.value;
    renderExploreRecipes();
  });

  // Reset Filters Button
  document.getElementById('resetFiltersBtn').addEventListener('click', resetFilters);
  document.getElementById('emptyResetBtn').addEventListener('click', resetFilters);

  // Add Recipe Modal Triggers
  document.getElementById('addRecipeBtn').addEventListener('click', openAddRecipeModal);
  document.getElementById('closeAddModalBtn').addEventListener('click', closeAddRecipeModal);
  document.getElementById('cancelAddRecipeBtn').addEventListener('click', closeAddRecipeModal);

  // Add Recipe Form
  document.getElementById('addIngredientInputBtn').addEventListener('click', () => addDynamicInputRow('ingredient'));
  document.getElementById('addInstructionInputBtn').addEventListener('click', () => addDynamicInputRow('instruction'));
  document.getElementById('customRecipeForm').addEventListener('submit', handleSaveCustomRecipe);

  // Recipe Detail Modal Close
  document.getElementById('closeRecipeModalBtn').addEventListener('click', closeRecipeModal);
  
  // Focus Cook Mode Controls
  setupCookModeListeners();

  // Weekly Meal Planner Listeners
  setupMealPlannerListeners();

  // Close modals on backdrop click or Escape
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      closeRecipeModal();
      closeAddRecipeModal();
      closeCookMode();
      closeAddToPlanModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeRecipeModal();
      closeAddRecipeModal();
      closeCookMode();
      closeAddToPlanModal();
    }
  });

  // Pantry & Shopping Listeners
  setupPantryListeners();
  setupShoppingListListeners();

  // Favorites Tab Listeners
  document.getElementById('clearAllFavoritesBtn').addEventListener('click', clearAllFavorites);
}

// ============================================================================
// Tab Switching
// ============================================================================
function switchTab(tabId) {
  STATE.activeTab = tabId;
  playSound('pop');

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === tabId);
  });

  if (tabId === 'plannerTab') {
    renderMealPlanner();
  } else if (tabId === 'favoritesTab') {
    renderFavorites();
  } else if (tabId === 'shoppingTab') {
    renderShoppingList();
  } else if (tabId === 'fridgeTab') {
    renderPantryChips();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateBadges() {
  const favBadge = document.getElementById('favCountBadge');
  if (favBadge) favBadge.textContent = STATE.favorites.size;

  const uncompletedGroceryCount = STATE.shoppingList.filter(item => !item.completed).length;
  const shopBadge = document.getElementById('shopCountBadge');
  if (shopBadge) shopBadge.textContent = uncompletedGroceryCount;
}

// ============================================================================
// Explore & Filter Recipes Logic
// ============================================================================
async function handleSearch(query) {
  const trimmed = (query || '').trim();
  STATE.searchQuery = trimmed.toLowerCase();
  
  if (!trimmed) {
    renderExploreRecipes();
    return;
  }

  // 1. INSTANT: Immediately display local matching recipes (0ms delay)
  renderFilteredList(STATE.recipes);

  // 2. ASYNC API SEARCH: Fetch from online database in background
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout guard

    const apiResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(trimmed)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await apiResponse.json();
    const apiRecipes = (data && data.meals) ? data.meals.map(normalizeMealDBRecipe) : [];
    
    if (apiRecipes.length > 0) {
      const combined = [...STATE.recipes, ...apiRecipes];
      const uniqueMap = new Map();
      combined.forEach(r => uniqueMap.set(r.id, r));
      renderFilteredList(Array.from(uniqueMap.values()));
    }
  } catch (err) {
    // Local results are already displayed cleanly
    console.log('Online search complete / offline mode');
  }
}

async function handleSurpriseMe() {
  playSound('success');
  triggerConfetti(90);
  showLoader(true);

  try {
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const data = await res.json();
    if (data && data.meals && data.meals.length > 0) {
      const recipe = normalizeMealDBRecipe(data.meals[0]);
      openRecipeModal(recipe);
      showToast(`🎉 Surprise Dish: ${recipe.title}! Enjoy!`, 'success');
    } else {
      const randomLocal = STATE.recipes[Math.floor(Math.random() * STATE.recipes.length)];
      openRecipeModal(randomLocal);
      showToast(`🎉 Surprise Dish: ${randomLocal.title}! Enjoy!`, 'success');
    }
  } catch (e) {
    const randomLocal = STATE.recipes[Math.floor(Math.random() * STATE.recipes.length)];
    openRecipeModal(randomLocal);
    showToast(`🎉 Surprise Dish: ${randomLocal.title}! Enjoy!`, 'success');
  } finally {
    showLoader(false);
  }
}

function normalizeMealDBRecipe(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      const parsed = parseMeasure(measure ? measure.trim() : '');
      ingredients.push({
        amount: parsed.amount,
        unit: parsed.unit,
        item: ing.trim()
      });
    }
  }

  const rawInstructions = meal.strInstructions || '';
  const instructions = rawInstructions
    .split(/\r?\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 5 && !s.toLowerCase().startsWith('step'));

  const cookTime = Math.floor(Math.random() * 20) + 15;
  const prepTime = 15;
  const calories = Math.floor(Math.random() * 300) + 350;

  return {
    id: `mealdb-${meal.idMeal}`,
    title: meal.strMeal,
    category: meal.strCategory || 'Miscellaneous',
    cuisine: meal.strArea || 'International',
    image: meal.strMealThumb,
    prepTime: prepTime,
    cookTime: cookTime,
    servings: 4,
    difficulty: cookTime > 30 ? 'Medium' : 'Easy',
    calories: calories,
    protein: `${Math.floor(calories * 0.05)}g`,
    carbs: `${Math.floor(calories * 0.08)}g`,
    fat: `${Math.floor(calories * 0.04)}g`,
    description: `A delicious traditional ${meal.strArea || ''} ${meal.strCategory || 'dish'} crafted with fresh ingredients and authentic flavors.`,
    ingredients: ingredients,
    instructions: instructions.length > 0 ? instructions : [rawInstructions],
    tags: [meal.strCategory, meal.strArea, 'Gourmet'].filter(Boolean),
    youtube: meal.strYoutube || null,
    isCustom: false
  };
}

function parseMeasure(measureStr) {
  if (!measureStr) return { amount: 1, unit: '' };
  const match = measureStr.match(/^([\d\s\/\.\-]+)\s*(.*)$/);
  if (!match) return { amount: 1, unit: measureStr };

  let numPart = match[1].trim();
  let unitPart = match[2].trim();
  let amount = 1;

  if (numPart.includes('/')) {
    const parts = numPart.split(' ');
    if (parts.length === 2) {
      const frac = parts[1].split('/');
      amount = parseFloat(parts[0]) + (parseFloat(frac[0]) / parseFloat(frac[1]));
    } else {
      const frac = numPart.split('/');
      amount = parseFloat(frac[0]) / parseFloat(frac[1]);
    }
  } else if (numPart.includes('-')) {
    const range = numPart.split('-');
    amount = parseFloat(range[0]) || 1;
  } else {
    amount = parseFloat(numPart) || 1;
  }

  return { amount: isNaN(amount) ? 1 : amount, unit: unitPart };
}

function renderExploreRecipes() {
  renderFilteredList(STATE.recipes);
}

function renderFilteredList(recipePool) {
  const grid = document.getElementById('recipeGrid');
  const emptyState = document.getElementById('emptyState');
  const resultsCount = document.getElementById('resultsCount');
  const resultsHeading = document.getElementById('resultsHeading');

  const query = (STATE.searchQuery || '').trim().toLowerCase();

  let filtered = recipePool.filter(r => {
    if (!r) return false;

    // Search query filter
    if (query) {
      const titleMatch = (r.title || '').toLowerCase().includes(query);
      const categoryMatch = (r.category || '').toLowerCase().includes(query);
      const cuisineMatch = (r.cuisine || '').toLowerCase().includes(query);
      const descriptionMatch = (r.description || '').toLowerCase().includes(query);
      
      const tagMatch = Array.isArray(r.tags) && r.tags.some(t => 
        (typeof t === 'string' ? t : '').toLowerCase().includes(query)
      );

      const ingredientMatch = Array.isArray(r.ingredients) && r.ingredients.some(ing => {
        if (!ing) return false;
        const itemText = typeof ing === 'string' ? ing : (ing.item || ing.name || '');
        return itemText.toLowerCase().includes(query);
      });

      const matched = titleMatch || categoryMatch || cuisineMatch || descriptionMatch || tagMatch || ingredientMatch;
      if (!matched) return false;
    }

    // Mood & Craving filter (only apply if activeMood != 'all' and no explicit search query)
    if (STATE.activeMood !== 'all' && !query) {
      const totalTime = (r.prepTime || 15) + (r.cookTime || 20);
      const cuisineLower = (r.cuisine || '').toLowerCase();
      const catLower = (r.category || '').toLowerCase();

      if (STATE.activeMood === 'quick' && totalTime > 25) return false;
      if (STATE.activeMood === 'desi' && cuisineLower !== 'indian') return false;
      if (STATE.activeMood === 'sweet' && catLower !== 'dessert') return false;
      if (STATE.activeMood === 'healthy' && catLower !== 'vegetarian' && (r.calories || 500) > 420) return false;
      if (STATE.activeMood === 'comfort' && !['curry', 'pasta', 'beef', 'chicken', 'rice'].includes(catLower)) return false;
    }

    // Category filter (only apply if currentCategory != 'all' and no explicit search query)
    if (STATE.currentCategory !== 'all' && !query) {
      if ((r.category || '').toLowerCase() !== STATE.currentCategory.toLowerCase()) {
        if (!r.tags || !r.tags.some(t => (typeof t === 'string' ? t : '').toLowerCase() === STATE.currentCategory.toLowerCase())) {
          return false;
        }
      }
    }

    // Cuisine filter
    if (STATE.currentCuisine !== 'all' && !query) {
      if ((r.cuisine || '').toLowerCase() !== STATE.currentCuisine.toLowerCase()) {
        return false;
      }
    }

    // Difficulty filter
    if (STATE.currentDifficulty !== 'all' && !query) {
      if ((r.difficulty || '').toLowerCase() !== STATE.currentDifficulty.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  // Apply Sorting
  if (STATE.currentSort === 'quickest') {
    filtered.sort((a, b) => ((a.prepTime || 0) + (a.cookTime || 0)) - ((b.prepTime || 0) + (b.cookTime || 0)));
  } else if (STATE.currentSort === 'calories-low') {
    filtered.sort((a, b) => (a.calories || 0) - (b.calories || 0));
  } else if (STATE.currentSort === 'alphabetical') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (STATE.currentSort === 'rating') {
    filtered.sort((a, b) => (STATE.ratings[b.id] || 4.8) - (STATE.ratings[a.id] || 4.8));
  }

  // Update UI Counters
  resultsCount.textContent = `Showing ${filtered.length} dishes`;
  resultsHeading.textContent = STATE.searchQuery ? `Results for "${STATE.searchQuery}"` : 'Explore Gourmet Recipes';

  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    grid.innerHTML = filtered.map(createRecipeCardHTML).join('');
    attachCardEventListeners(grid, filtered);
  }
}

function createRecipeCardHTML(recipe) {
  const isFav = STATE.favorites.has(recipe.id);
  const totalTime = (recipe.prepTime || 10) + (recipe.cookTime || 15);
  const diffClass = (recipe.difficulty || 'Easy').toLowerCase();
  const rating = STATE.ratings[recipe.id] || 5;

  return `
    <article class="recipe-card" data-recipe-id="${recipe.id}">
      <div class="recipe-card-media">
        <img class="recipe-img" src="${recipe.image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80'}" alt="${escapeHtml(recipe.title)}" loading="lazy" />
        <button class="card-favorite-btn ${isFav ? 'active' : ''}" data-fav-id="${recipe.id}" title="${isFav ? 'Remove from favorites' : 'Save to favorites'}" aria-label="Favorite">
          <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
        ${recipe.cuisine ? `<span class="card-cuisine-tag">${escapeHtml(recipe.cuisine)}</span>` : ''}
        ${recipe.matchScore ? `<span class="match-score-badge">${recipe.matchScore}% Match</span>` : ''}
      </div>
      <div class="recipe-card-body">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span class="card-category">${escapeHtml(recipe.category || 'Gourmet')}</span>
          <div class="star-rating-preview" style="color: #f59e0b; font-size: 0.8rem; font-weight: 700;">
            <i class="fa-solid fa-star"></i> ${rating}.0
          </div>
        </div>
        <h3 class="card-title">${escapeHtml(recipe.title)}</h3>
        
        <div class="card-meta-row">
          <div class="card-meta-item" title="Total preparation & cooking time">
            <i class="fa-regular fa-clock"></i>
            <span>${totalTime} mins</span>
          </div>
          <div class="card-meta-item" title="Estimated calories">
            <i class="fa-solid fa-fire"></i>
            <span>${recipe.calories || 450} kcal</span>
          </div>
          <span class="difficulty-pill ${diffClass}">${recipe.difficulty || 'Easy'}</span>
        </div>

        <div class="card-actions-bar">
          <button class="card-action-btn btn-cook-mode" data-cook-id="${recipe.id}" title="Enter Step-by-Step Cooking Mode">
            <i class="fa-solid fa-hat-chef"></i> Cook Mode
          </button>
          <button class="card-action-btn btn-add-plan" data-plan-id="${recipe.id}" title="Add to Weekly Meal Plan">
            <i class="fa-solid fa-calendar-plus"></i> Add to Plan
          </button>
        </div>
      </div>
    </article>
  `;
}

function attachCardEventListeners(container, recipeList) {
  container.querySelectorAll('.recipe-card').forEach(card => {
    const recipeId = card.getAttribute('data-recipe-id');
    const recipe = recipeList.find(r => r.id === recipeId) || STATE.recipes.find(r => r.id === recipeId);

    // Card click opens detail modal
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-favorite-btn') || e.target.closest('.card-action-btn')) return;
      if (recipe) {
        playSound('pop');
        openRecipeModal(recipe);
      }
    });

    // Favorite heart button
    const favBtn = card.querySelector('.card-favorite-btn');
    if (favBtn) {
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(recipeId, favBtn);
      });
    }

    // Cook Mode quick button
    const cookBtn = card.querySelector('.btn-cook-mode');
    if (cookBtn) {
      cookBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (recipe) {
          playSound('pop');
          openCookMode(recipe);
        }
      });
    }

    // Add to Plan quick button
    const planBtn = card.querySelector('.btn-add-plan');
    if (planBtn) {
      planBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (recipe) {
          playSound('pop');
          openAddToPlanModal(recipe);
        }
      });
    }
  });
}

function resetFilters() {
  STATE.searchQuery = '';
  STATE.currentCategory = 'all';
  STATE.currentCuisine = 'all';
  STATE.currentDifficulty = 'all';
  STATE.currentSort = 'recommended';
  STATE.activeMood = 'all';

  document.getElementById('recipeSearchInput').value = '';
  document.getElementById('clearSearchBtn').style.display = 'none';
  document.getElementById('cuisineSelect').value = 'all';
  document.getElementById('difficultySelect').value = 'all';
  document.getElementById('sortSelect').value = 'recommended';

  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.classList.toggle('active', pill.getAttribute('data-category') === 'all');
  });

  document.querySelectorAll('.mood-pill').forEach(pill => {
    pill.classList.toggle('active', pill.getAttribute('data-mood') === 'all');
  });

  renderExploreRecipes();
  playSound('pop');
  showToast('All filters have been reset', 'info');
}

function showLoader(visible) {
  const loader = document.getElementById('loadingSpinner');
  if (loader) loader.style.display = visible ? 'flex' : 'none';
}

// ============================================================================
// Favorites Feature
// ============================================================================
function toggleFavorite(recipeId, favBtnElement) {
  const isFav = STATE.favorites.has(recipeId);
  const targetRecipe = STATE.recipes.find(r => r.id === recipeId);
  const recipeName = targetRecipe ? targetRecipe.title : 'Recipe';

  if (isFav) {
    STATE.favorites.delete(recipeId);
    if (favBtnElement) {
      favBtnElement.classList.remove('active');
      favBtnElement.querySelector('i').className = 'fa-regular fa-heart';
    }
    playSound('pop');
    showToast(`Removed "${recipeName}" from favorites`, 'info');
  } else {
    STATE.favorites.add(recipeId);
    if (favBtnElement) {
      favBtnElement.classList.add('active');
      favBtnElement.querySelector('i').className = 'fa-solid fa-heart';
    }
    playSound('chime');
    showToast(`Added "${recipeName}" to your Favorites! ❤️`, 'success');
  }

  saveFavorites();

  if (STATE.activeTab === 'favoritesTab') {
    renderFavorites();
  }
}

function renderFavorites() {
  const grid = document.getElementById('favoritesGrid');
  const emptyState = document.getElementById('emptyFavoritesState');

  const favRecipes = STATE.recipes.filter(r => STATE.favorites.has(r.id));

  if (favRecipes.length === 0) {
    grid.innerHTML = '';
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    grid.innerHTML = favRecipes.map(createRecipeCardHTML).join('');
    attachCardEventListeners(grid, favRecipes);
  }
}

function clearAllFavorites() {
  if (STATE.favorites.size === 0) {
    showToast('No saved recipes to clear', 'info');
    return;
  }
  if (confirm('Clear all your saved favorite recipes?')) {
    STATE.favorites.clear();
    saveFavorites();
    renderFavorites();
    renderExploreRecipes();
    showToast('All saved recipes cleared', 'danger');
  }
}

// ============================================================================
// FOCUS COOK MODE (Full-Screen Step-by-Step Focus Experience)
// ============================================================================
function setupCookModeListeners() {
  document.getElementById('closeCookModeBtn').addEventListener('click', closeCookMode);
  document.getElementById('cookModePrevBtn').addEventListener('click', cookModePrevStep);
  document.getElementById('cookModeNextBtn').addEventListener('click', cookModeNextStep);
  document.getElementById('cookModeTimerToggleBtn').addEventListener('click', toggleCookModeTimer);
  document.getElementById('cookModeTimerResetBtn').addEventListener('click', resetCookModeTimer);

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    const modal = document.getElementById('cookModeModal');
    if (!modal.classList.contains('open')) return;

    if (e.key === 'ArrowRight' || e.key === 'Space') {
      cookModeNextStep();
    } else if (e.key === 'ArrowLeft') {
      cookModePrevStep();
    }
  });
}

function openCookMode(recipe) {
  STATE.cookMode.recipe = recipe;
  STATE.cookMode.currentStep = 0;
  STATE.cookMode.timerSeconds = 300;
  STATE.cookMode.timerRemaining = 300;
  stopCookModeTimer();

  const modal = document.getElementById('cookModeModal');
  document.getElementById('cookModeRecipeTitle').textContent = recipe.title;

  renderCookModeStep();

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCookMode() {
  const modal = document.getElementById('cookModeModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
  stopCookModeTimer();
}

function renderCookModeStep() {
  const recipe = STATE.cookMode.recipe;
  if (!recipe || !recipe.instructions) return;

  const totalSteps = recipe.instructions.length;
  const currentIdx = STATE.cookMode.currentStep;

  // Progress Bar
  const percent = Math.round(((currentIdx + 1) / totalSteps) * 100);
  document.getElementById('cookProgressBar').style.width = `${percent}%`;

  // Step indicator & text
  document.getElementById('cookStepIndicator').textContent = `Step ${currentIdx + 1} of ${totalSteps}`;
  document.getElementById('cookStepText').textContent = recipe.instructions[currentIdx];

  // Prev / Next button labels
  const prevBtn = document.getElementById('cookModePrevBtn');
  const nextBtn = document.getElementById('cookModeNextBtn');

  prevBtn.disabled = currentIdx === 0;
  if (currentIdx === totalSteps - 1) {
    nextBtn.innerHTML = '<span>Finish & Celebrate! 🎊</span> <i class="fa-solid fa-crown"></i>';
  } else {
    nextBtn.innerHTML = '<span>Next Step</span> <i class="fa-solid fa-chevron-right"></i>';
  }

  // Parse potential timer time from step text (e.g. "cook for 10 minutes")
  const stepText = recipe.instructions[currentIdx].toLowerCase();
  const timeMatch = stepText.match(/(\d+)\s*(?:-|to)?\s*(\d+)?\s*(?:min|minute|mins)/);
  if (timeMatch) {
    const minutes = parseInt(timeMatch[2] || timeMatch[1], 10);
    STATE.cookMode.timerSeconds = minutes * 60;
    STATE.cookMode.timerRemaining = minutes * 60;
  } else {
    STATE.cookMode.timerSeconds = 300;
    STATE.cookMode.timerRemaining = 300;
  }
  updateCookModeTimerUI();
}

function cookModePrevStep() {
  if (STATE.cookMode.currentStep > 0) {
    STATE.cookMode.currentStep -= 1;
    playSound('pop');
    stopCookModeTimer();
    renderCookModeStep();
  }
}

function cookModeNextStep() {
  const totalSteps = STATE.cookMode.recipe.instructions.length;
  if (STATE.cookMode.currentStep < totalSteps - 1) {
    STATE.cookMode.currentStep += 1;
    playSound('pop');
    stopCookModeTimer();
    renderCookModeStep();
  } else {
    // Finished all steps - Celebrate!
    playSound('success');
    triggerConfetti(120);
    showToast(`🌟 Dish Completed! Delicious job, Chef! Bon Appétit! 🍽️`, 'success');
    closeCookMode();
  }
}

function toggleCookModeTimer() {
  if (STATE.cookMode.isRunning) {
    stopCookModeTimer();
  } else {
    startCookModeTimer();
  }
}

function startCookModeTimer() {
  if (STATE.cookMode.timerRemaining <= 0) {
    STATE.cookMode.timerRemaining = STATE.cookMode.timerSeconds;
  }
  STATE.cookMode.isRunning = true;
  updateCookModeTimerUI();

  STATE.cookMode.timerInterval = setInterval(() => {
    STATE.cookMode.timerRemaining -= 1;
    updateCookModeTimerUI();

    if (STATE.cookMode.timerRemaining <= 0) {
      stopCookModeTimer();
      playSound('success');
      showToast('⏰ Step Cooking Time is Complete!', 'success');
    }
  }, 1000);
}

function stopCookModeTimer() {
  if (STATE.cookMode.timerInterval) {
    clearInterval(STATE.cookMode.timerInterval);
    STATE.cookMode.timerInterval = null;
  }
  STATE.cookMode.isRunning = false;
  updateCookModeTimerUI();
}

function resetCookModeTimer() {
  stopCookModeTimer();
  STATE.cookMode.timerRemaining = STATE.cookMode.timerSeconds;
  updateCookModeTimerUI();
}

function updateCookModeTimerUI() {
  const display = document.getElementById('cookModeTimerDisplay');
  const btn = document.getElementById('cookModeTimerToggleBtn');

  if (display) display.textContent = formatTime(STATE.cookMode.timerRemaining);
  if (btn) {
    btn.innerHTML = STATE.cookMode.isRunning
      ? '<i class="fa-solid fa-pause"></i> Pause'
      : '<i class="fa-solid fa-play"></i> Start Timer';
  }
}

// ============================================================================
// 7-Day Weekly Meal Planner
// ============================================================================
let pendingPlanRecipe = null;

function setupMealPlannerListeners() {
  document.getElementById('exportWeekToGroceryBtn').addEventListener('click', exportWeekToGrocery);
  document.getElementById('clearWeekPlanBtn').addEventListener('click', clearWeekPlan);
  document.getElementById('closeAddToPlanBtn').addEventListener('click', closeAddToPlanModal);
  document.getElementById('confirmAddToPlanBtn').addEventListener('click', confirmAddToPlan);
}

function openAddToPlanModal(recipe) {
  pendingPlanRecipe = recipe;
  document.getElementById('planModalRecipeTitle').textContent = `Add "${recipe.title}" to your schedule.`;
  const modal = document.getElementById('addToMealPlanModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAddToPlanModal() {
  const modal = document.getElementById('addToMealPlanModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
  pendingPlanRecipe = null;
}

function confirmAddToPlan() {
  if (!pendingPlanRecipe) return;

  const day = document.getElementById('planDaySelect').value;
  const mealType = document.getElementById('planMealTypeSelect').value;

  if (!STATE.mealPlan[day]) {
    STATE.mealPlan[day] = { breakfast: null, lunch: null, dinner: null };
  }

  STATE.mealPlan[day][mealType] = pendingPlanRecipe;
  saveMealPlan();
  closeAddToPlanModal();
  playSound('success');
  showToast(`Added ${pendingPlanRecipe.title} to ${day.toUpperCase()} (${mealType})! 📅`, 'success');

  if (STATE.activeTab === 'plannerTab') {
    renderMealPlanner();
  }
}

function renderMealPlanner() {
  const container = document.getElementById('weeklyPlannerGrid');
  if (!container) return;

  const days = [
    { key: 'monday', label: 'Monday', emoji: '🌟' },
    { key: 'tuesday', label: 'Tuesday', emoji: '🌮' },
    { key: 'wednesday', label: 'Wednesday', emoji: '🥗' },
    { key: 'thursday', label: 'Thursday', emoji: '🥘' },
    { key: 'friday', label: 'Friday', emoji: '🍕' },
    { key: 'saturday', label: 'Saturday', emoji: '🍲' },
    { key: 'sunday', label: 'Sunday', emoji: '🍛' }
  ];

  container.innerHTML = days.map(day => {
    const plan = STATE.mealPlan[day.key] || { breakfast: null, lunch: null, dinner: null };

    return `
      <div class="day-plan-card">
        <div class="day-plan-header">
          <span class="day-name">${day.emoji} ${day.label}</span>
          <button class="text-btn btn-sm" onclick="clearSingleDay('${day.key}')" title="Clear this day">Clear</button>
        </div>

        <!-- Breakfast Slot -->
        <div class="meal-slot-row">
          <div class="slot-label">🥞 Breakfast</div>
          <div class="meal-slot-content">
            ${renderMealSlotItem(day.key, 'breakfast', plan.breakfast)}
          </div>
        </div>

        <!-- Lunch Slot -->
        <div class="meal-slot-row">
          <div class="slot-label">🍛 Lunch</div>
          <div class="meal-slot-content">
            ${renderMealSlotItem(day.key, 'lunch', plan.lunch)}
          </div>
        </div>

        <!-- Dinner Slot -->
        <div class="meal-slot-row">
          <div class="slot-label">🍲 Dinner</div>
          <div class="meal-slot-content">
            ${renderMealSlotItem(day.key, 'dinner', plan.dinner)}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderMealSlotItem(dayKey, slotKey, dish) {
  if (!dish) {
    return `
      <button class="empty-slot-btn" onclick="promptAddDishToSlot('${dayKey}', '${slotKey}')">
        <i class="fa-solid fa-plus"></i> Add Dish
      </button>
    `;
  }

  return `
    <div class="planned-dish-chip">
      <div class="dish-info" onclick="viewPlannedDish('${dish.id}')" style="cursor: pointer;">
        <img src="${dish.image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=80&q=80'}" alt="${escapeHtml(dish.title)}" />
        <span class="dish-title">${escapeHtml(dish.title)}</span>
      </div>
      <button class="remove-slot-btn" onclick="removePlannedSlot('${dayKey}', '${slotKey}')" title="Remove">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  `;
}

function promptAddDishToSlot(dayKey, slotKey) {
  switchTab('exploreTab');
  showToast(`Select a recipe and tap "Add to Plan" for ${dayKey.toUpperCase()} (${slotKey})!`, 'info');
}

function viewPlannedDish(recipeId) {
  const dish = STATE.recipes.find(r => r.id === recipeId);
  if (dish) {
    playSound('pop');
    openRecipeModal(dish);
  }
}

function removePlannedSlot(dayKey, slotKey) {
  if (STATE.mealPlan[dayKey]) {
    STATE.mealPlan[dayKey][slotKey] = null;
    saveMealPlan();
    renderMealPlanner();
    playSound('pop');
    showToast(`Removed from ${dayKey.toUpperCase()}`, 'info');
  }
}

function clearSingleDay(dayKey) {
  STATE.mealPlan[dayKey] = { breakfast: null, lunch: null, dinner: null };
  saveMealPlan();
  renderMealPlanner();
  playSound('pop');
  showToast(`Cleared plan for ${dayKey.toUpperCase()}`, 'info');
}

function clearWeekPlan() {
  if (confirm('Are you sure you want to clear the entire week\'s meal plan?')) {
    initEmptyMealPlan();
    saveMealPlan();
    renderMealPlanner();
    showToast('Weekly meal plan reset', 'danger');
  }
}

function exportWeekToGrocery() {
  let count = 0;
  const days = Object.keys(STATE.mealPlan);

  days.forEach(day => {
    ['breakfast', 'lunch', 'dinner'].forEach(slot => {
      const dish = STATE.mealPlan[day][slot];
      if (dish && dish.ingredients) {
        dish.ingredients.forEach(ing => {
          const unitText = ing.unit ? ` ${ing.unit}` : '';
          const fullText = `${ing.amount}${unitText} ${ing.item}`.trim();
          STATE.shoppingList.push({
            id: 'shop-week-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            recipeId: dish.id,
            recipeTitle: `${dish.title} (${day})`,
            text: fullText,
            completed: false
          });
          count++;
        });
      }
    });
  });

  if (count === 0) {
    showToast('No planned recipes found. Add some dishes to your days first!', 'info');
    return;
  }

  saveShoppingList();
  playSound('success');
  triggerConfetti(60);
  showToast(`Exported ${count} ingredients for the whole week to your Grocery List! 🛒`, 'success');
}

// ============================================================================
// Recipe Detail Modal & Scaler & Ratings & Chef Notes
// ============================================================================
function openRecipeModal(recipe) {
  STATE.currentRecipe = recipe;
  STATE.baseServings = recipe.servings || 4;
  STATE.activeServings = STATE.baseServings;
  STATE.checkedIngredients.clear();

  resetCookingTimer();
  STATE.timer.totalSeconds = (recipe.cookTime || 20) * 60;
  STATE.timer.remainingSeconds = STATE.timer.totalSeconds;

  const modalBody = document.getElementById('recipeModalContent');
  modalBody.innerHTML = renderRecipeModalContent(recipe);

  setupModalInteractions(recipe);

  const modal = document.getElementById('recipeModal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeRecipeModal() {
  const modal = document.getElementById('recipeModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  stopCookingTimer();
}

function renderRecipeModalContent(recipe) {
  const totalTime = (recipe.prepTime || 10) + (recipe.cookTime || 15);
  const isFav = STATE.favorites.has(recipe.id);
  const mult = STATE.activeServings / STATE.baseServings;
  const rating = STATE.ratings[recipe.id] || 5;
  const savedNote = STATE.userNotes[recipe.id] || '';

  return `
    <div class="modal-hero">
      <img src="${recipe.image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80'}" alt="${escapeHtml(recipe.title)}" />
      <div class="modal-hero-overlay">
        <div class="modal-hero-badges">
          <span class="card-cuisine-tag">${escapeHtml(recipe.cuisine || 'International')}</span>
          <span class="difficulty-pill ${(recipe.difficulty || 'easy').toLowerCase()}">${recipe.difficulty || 'Easy'}</span>
        </div>
        <h2 class="modal-hero-title">${escapeHtml(recipe.title)}</h2>
        <p class="modal-hero-desc">${escapeHtml(recipe.description || 'A wonderfully flavorful, freshly crafted gourmet recipe.')}</p>
      </div>
    </div>

    <div class="modal-content-inner">
      <!-- Quick Stats Grid -->
      <div class="recipe-stats-grid">
        <div class="stat-item">
          <div class="stat-icon"><i class="fa-regular fa-clock"></i></div>
          <div class="stat-info">
            <span class="stat-label">Prep Time</span>
            <span class="stat-value">${recipe.prepTime || 15} mins</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon"><i class="fa-solid fa-fire-burner"></i></div>
          <div class="stat-info">
            <span class="stat-label">Cook Time</span>
            <span class="stat-value">${recipe.cookTime || 20} mins</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon"><i class="fa-solid fa-hourglass-half"></i></div>
          <div class="stat-info">
            <span class="stat-label">Total Time</span>
            <span class="stat-value">${totalTime} mins</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon"><i class="fa-solid fa-utensils"></i></div>
          <div class="stat-info">
            <span class="stat-label">Category</span>
            <span class="stat-value">${escapeHtml(recipe.category || 'Main')}</span>
          </div>
        </div>
      </div>

      <!-- Interactive Servings Scaler Card -->
      <div class="servings-scaler-card">
        <div class="scaler-info">
          <i class="fa-solid fa-users"></i>
          <div>
            <div class="scaler-title">Adjust Recipe Yield</div>
            <div class="scaler-subtitle">Ingredient amounts recalculate automatically in real time</div>
          </div>
        </div>
        <div class="scaler-controls">
          <div class="scaler-stepper">
            <button id="decrementServingsBtn" class="step-btn" title="Decrease servings">−</button>
            <span id="servingsDisplay" class="servings-count">${STATE.activeServings} servings</span>
            <button id="incrementServingsBtn" class="step-btn" title="Increase servings">+</button>
          </div>
          <div class="preset-multipliers">
            <button class="mult-pill ${mult === 0.5 ? 'active' : ''}" data-mult="0.5">0.5x</button>
            <button class="mult-pill ${mult === 1.0 ? 'active' : ''}" data-mult="1.0">1x</button>
            <button class="mult-pill ${mult === 2.0 ? 'active' : ''}" data-mult="2.0">2x</button>
            <button class="mult-pill ${mult === 3.0 ? 'active' : ''}" data-mult="3.0">3x</button>
          </div>
        </div>
      </div>

      <!-- Ingredients Checklist Section -->
      <div class="modal-section">
        <div class="section-header-row">
          <h3 class="section-title"><i class="fa-solid fa-basket-shopping"></i> Ingredients</h3>
          <button id="modalAddAllToGroceryBtn" class="btn btn-secondary btn-sm">
            <i class="fa-solid fa-cart-plus"></i> Add to Grocery List
          </button>
        </div>

        <div id="modalIngredientsList" class="ingredients-list">
          ${renderIngredientsListHTML(recipe.ingredients, mult)}
        </div>
      </div>

      <!-- Focus Cook Mode Quick Launcher -->
      <div style="margin-bottom: 24px;">
        <button id="modalLaunchCookModeBtn" class="btn btn-primary btn-block btn-lg btn-glow">
          <i class="fa-solid fa-hat-chef"></i> Enter Focus Step-by-Step Cook Mode
        </button>
      </div>

      <!-- Integrated Cooking Timer -->
      <div class="cooking-timer-card">
        <div class="timer-info-side">
          <div class="timer-icon-wrapper">
            <i class="fa-solid fa-stopwatch"></i>
          </div>
          <div class="timer-heading">
            <h4>Step-by-Step Cooking Timer</h4>
            <p>Ready to simmer? Keep track of your cooking time with audio chimes.</p>
          </div>
        </div>
        <div class="timer-clock-side">
          <div id="timerDisplay" class="timer-display">${formatTime(STATE.timer.remainingSeconds)}</div>
          <div class="timer-controls-row">
            <button id="startTimerBtn" class="timer-btn timer-start">
              <i class="fa-solid fa-play"></i> Start
            </button>
            <button id="resetTimerBtn" class="timer-btn timer-reset">
              <i class="fa-solid fa-rotate-left"></i> Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Step-by-Step Instructions -->
      <div class="modal-section">
        <h3 class="section-title"><i class="fa-solid fa-list-check"></i> Step-by-Step Instructions</h3>
        <div class="instructions-list">
          ${recipe.instructions.map((step, idx) => `
            <div class="instruction-step-card">
              <span class="step-badge">${idx + 1}</span>
              <div class="step-content">
                <p class="step-instruction-text">${escapeHtml(step)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 5-Star Rating & Personal Chef Notes -->
      <div class="modal-section">
        <div class="section-header-row">
          <h3 class="section-title"><i class="fa-solid fa-star" style="color: #f59e0b;"></i> Rate this Recipe</h3>
          <div class="star-rating-box" id="modalStarRating">
            ${[1, 2, 3, 4, 5].map(star => `
              <i class="fa-solid fa-star ${star <= rating ? 'filled' : ''}" data-star="${star}"></i>
            `).join('')}
          </div>
        </div>

        <div class="chef-notes-box">
          <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #b45309; margin-bottom: 6px;">
            <i class="fa-solid fa-pen-nib"></i> My Personal Chef Notes & Tweaks:
          </label>
          <textarea id="modalChefNotes" rows="2" placeholder="e.g. Added 1 extra green chili, pair with garlic naan!">${escapeHtml(savedNote)}</textarea>
        </div>
      </div>

      <!-- Nutrition Breakdown -->
      <div class="modal-section">
        <h3 class="section-title"><i class="fa-solid fa-chart-pie"></i> Nutrition Facts (Per Serving)</h3>
        <div class="nutrition-grid">
          <div class="nutri-item">
            <span class="nutri-val">${recipe.calories || 450}</span>
            <span class="nutri-name">Calories (kcal)</span>
          </div>
          <div class="nutri-item">
            <span class="nutri-val">${recipe.protein || '25g'}</span>
            <span class="nutri-name">Protein</span>
          </div>
          <div class="nutri-item">
            <span class="nutri-val">${recipe.carbs || '35g'}</span>
            <span class="nutri-name">Carbs</span>
          </div>
          <div class="nutri-item">
            <span class="nutri-val">${recipe.fat || '18g'}</span>
            <span class="nutri-name">Fat</span>
          </div>
        </div>
      </div>

      <!-- Video Tutorial Embed if Available -->
      ${recipe.youtube ? `
        <div class="modal-section">
          <h3 class="section-title"><i class="fa-brands fa-youtube" style="color: #ef4444;"></i> Video Tutorial</h3>
          <div class="video-wrapper">
            <iframe src="${getYoutubeEmbedUrl(recipe.youtube)}" title="YouTube video player" allowfullscreen></iframe>
          </div>
        </div>
      ` : ''}

      <!-- Modal Bottom Actions -->
      <div class="modal-bottom-actions">
        <div class="left-actions">
          <button id="modalFavBtn" class="btn btn-secondary">
            <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart" style="${isFav ? 'color: var(--accent-red);' : ''}"></i>
            <span>${isFav ? 'Favorited' : 'Save to Favorites'}</span>
          </button>
          <button id="modalAddPlanBtn" class="btn btn-secondary">
            <i class="fa-solid fa-calendar-plus"></i> Add to Meal Plan
          </button>
          <button id="printRecipeBtn" class="btn btn-secondary" title="Print recipe sheet">
            <i class="fa-solid fa-print"></i> Print
          </button>
        </div>
        <div class="right-actions">
          <button id="shareRecipeBtn" class="btn btn-secondary" title="Copy recipe link">
            <i class="fa-solid fa-share-nodes"></i> Share
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderIngredientsListHTML(ingredients, multiplier) {
  if (!ingredients || ingredients.length === 0) {
    return '<p class="text-muted">No ingredients listed for this recipe.</p>';
  }

  return ingredients.map((ing, idx) => {
    const isChecked = STATE.checkedIngredients.has(idx);
    const scaledQty = scaleIngredientAmount(ing.amount, multiplier);
    const displayQty = formatAmount(scaledQty);
    const unitText = ing.unit ? ` ${ing.unit}` : '';

    return `
      <label class="ingredient-checkbox-item ${isChecked ? 'checked' : ''}" data-ing-index="${idx}">
        <input type="checkbox" ${isChecked ? 'checked' : ''} />
        <span class="ing-text">
          <strong>${displayQty}${escapeHtml(unitText)}</strong> ${escapeHtml(ing.item)}
        </span>
      </label>
    `;
  }).join('');
}

function setupModalInteractions(recipe) {
  const modalContent = document.getElementById('recipeModalContent');

  // Servings Stepper Buttons
  const decrementBtn = modalContent.querySelector('#decrementServingsBtn');
  const incrementBtn = modalContent.querySelector('#incrementServingsBtn');

  decrementBtn.addEventListener('click', () => {
    if (STATE.activeServings > 1) {
      STATE.activeServings -= 1;
      playSound('pop');
      updateServingsView();
    }
  });

  incrementBtn.addEventListener('click', () => {
    if (STATE.activeServings < 50) {
      STATE.activeServings += 1;
      playSound('pop');
      updateServingsView();
    }
  });

  // Multiplier Preset Pills
  modalContent.querySelectorAll('.mult-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const mult = parseFloat(pill.getAttribute('data-mult'));
      STATE.activeServings = Math.max(1, Math.round(STATE.baseServings * mult));
      playSound('pop');
      updateServingsView();
    });
  });

  // Ingredient Checkbox Toggle
  modalContent.querySelectorAll('.ingredient-checkbox-item').forEach(item => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    const idx = parseInt(item.getAttribute('data-ing-index'), 10);

    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        STATE.checkedIngredients.add(idx);
        item.classList.add('checked');
        playSound('pop');
      } else {
        STATE.checkedIngredients.delete(idx);
        item.classList.remove('checked');
      }
    });
  });

  // Launch Cook Mode
  const launchCookModeBtn = modalContent.querySelector('#modalLaunchCookModeBtn');
  if (launchCookModeBtn) {
    launchCookModeBtn.addEventListener('click', () => {
      closeRecipeModal();
      openCookMode(recipe);
    });
  }

  // Add to Grocery List
  const addAllGroceryBtn = modalContent.querySelector('#modalAddAllToGroceryBtn');
  addAllGroceryBtn.addEventListener('click', () => {
    const mult = STATE.activeServings / STATE.baseServings;
    let addedCount = 0;

    recipe.ingredients.forEach(ing => {
      const scaledQty = scaleIngredientAmount(ing.amount, mult);
      const displayQty = formatAmount(scaledQty);
      const unitText = ing.unit ? ` ${ing.unit}` : '';
      const fullText = `${displayQty}${unitText} ${ing.item}`.trim();

      STATE.shoppingList.push({
        id: 'shop-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        text: fullText,
        completed: false
      });
      addedCount++;
    });

    saveShoppingList();
    playSound('success');
    showToast(`Added ${addedCount} ingredients to your Grocery List! 🛒`, 'success');
  });

  // Star Ratings
  const starBox = modalContent.querySelector('#modalStarRating');
  if (starBox) {
    starBox.querySelectorAll('i').forEach(star => {
      star.addEventListener('click', () => {
        const ratingVal = parseInt(star.getAttribute('data-star'), 10);
        STATE.ratings[recipe.id] = ratingVal;
        saveRatings();
        playSound('pop');
        starBox.querySelectorAll('i').forEach(s => {
          const sVal = parseInt(s.getAttribute('data-star'), 10);
          s.classList.toggle('filled', sVal <= ratingVal);
        });
        showToast(`Rated ${ratingVal} Stars! ⭐`, 'success');
        renderExploreRecipes();
      });
    });
  }

  // Chef Notes Auto-save
  const notesTextarea = modalContent.querySelector('#modalChefNotes');
  if (notesTextarea) {
    notesTextarea.addEventListener('input', (e) => {
      STATE.userNotes[recipe.id] = e.target.value;
      saveNotes();
    });
  }

  // Timer Controls
  const startTimerBtn = modalContent.querySelector('#startTimerBtn');
  const resetTimerBtn = modalContent.querySelector('#resetTimerBtn');

  startTimerBtn.addEventListener('click', toggleCookingTimer);
  resetTimerBtn.addEventListener('click', resetCookingTimer);

  // Favorite Button
  const favBtn = modalContent.querySelector('#modalFavBtn');
  favBtn.addEventListener('click', () => {
    toggleFavorite(recipe.id);
    const isFav = STATE.favorites.has(recipe.id);
    favBtn.querySelector('i').className = isFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    favBtn.querySelector('i').style.color = isFav ? 'var(--accent-red)' : '';
    favBtn.querySelector('span').textContent = isFav ? 'Favorited' : 'Save to Favorites';
  });

  // Add to Meal Plan
  const addPlanBtn = modalContent.querySelector('#modalAddPlanBtn');
  if (addPlanBtn) {
    addPlanBtn.addEventListener('click', () => {
      closeRecipeModal();
      openAddToPlanModal(recipe);
    });
  }

  // Print Recipe
  modalContent.querySelector('#printRecipeBtn').addEventListener('click', () => {
    window.print();
  });

  // Share Recipe
  modalContent.querySelector('#shareRecipeBtn').addEventListener('click', () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      playSound('pop');
      showToast('Recipe link copied to clipboard! 📋', 'success');
    } else {
      showToast('Sharing not supported on this browser', 'info');
    }
  });
}

function updateServingsView() {
  const servingsDisplay = document.getElementById('servingsDisplay');
  if (servingsDisplay) {
    servingsDisplay.textContent = `${STATE.activeServings} servings`;
  }

  const mult = STATE.activeServings / STATE.baseServings;

  document.querySelectorAll('.mult-pill').forEach(pill => {
    const pMult = parseFloat(pill.getAttribute('data-mult'));
    pill.classList.toggle('active', Math.abs(pMult - mult) < 0.05);
  });

  const listContainer = document.getElementById('modalIngredientsList');
  if (listContainer && STATE.currentRecipe) {
    listContainer.innerHTML = renderIngredientsListHTML(STATE.currentRecipe.ingredients, mult);
    listContainer.querySelectorAll('.ingredient-checkbox-item').forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const idx = parseInt(item.getAttribute('data-ing-index'), 10);
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          STATE.checkedIngredients.add(idx);
          item.classList.add('checked');
          playSound('pop');
        } else {
          STATE.checkedIngredients.delete(idx);
          item.classList.remove('checked');
        }
      });
    });
  }
}

function scaleIngredientAmount(baseAmount, multiplier) {
  if (typeof baseAmount !== 'number' || isNaN(baseAmount)) return baseAmount;
  return baseAmount * multiplier;
}

function formatAmount(num) {
  if (typeof num !== 'number' || isNaN(num)) return '';
  const rounded = Math.round(num * 100) / 100;
  const whole = Math.floor(rounded);
  const frac = rounded - whole;

  if (Math.abs(frac - 0.5) < 0.05) return whole > 0 ? `${whole} ½` : '½';
  if (Math.abs(frac - 0.25) < 0.05) return whole > 0 ? `${whole} ¼` : '¼';
  if (Math.abs(frac - 0.75) < 0.05) return whole > 0 ? `${whole} ¾` : '¾';
  if (Math.abs(frac - 0.33) < 0.05) return whole > 0 ? `${whole} ⅓` : '⅓';
  if (Math.abs(frac - 0.67) < 0.05) return whole > 0 ? `${whole} ⅔` : '⅔';

  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
}

function getYoutubeEmbedUrl(url) {
  if (!url) return '';
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

// ============================================================================
// Modal Cooking Timer with Web Audio Alert
// ============================================================================
function toggleCookingTimer() {
  if (STATE.timer.isRunning) {
    stopCookingTimer();
  } else {
    startCookingTimer();
  }
}

function startCookingTimer() {
  if (STATE.timer.remainingSeconds <= 0) {
    STATE.timer.remainingSeconds = STATE.timer.totalSeconds;
  }
  STATE.timer.isRunning = true;
  updateTimerUI();

  STATE.timer.interval = setInterval(() => {
    STATE.timer.remainingSeconds -= 1;
    updateTimerUI();

    if (STATE.timer.remainingSeconds <= 0) {
      stopCookingTimer();
      playSound('success');
      showToast('⏰ Cooking time is up! Bon Appétit!', 'success');
    }
  }, 1000);
}

function stopCookingTimer() {
  if (STATE.timer.interval) {
    clearInterval(STATE.timer.interval);
    STATE.timer.interval = null;
  }
  STATE.timer.isRunning = false;
  updateTimerUI();
}

function resetCookingTimer() {
  stopCookingTimer();
  STATE.timer.remainingSeconds = STATE.timer.totalSeconds;
  updateTimerUI();
}

function updateTimerUI() {
  const display = document.getElementById('timerDisplay');
  const startBtn = document.getElementById('startTimerBtn');

  if (display) display.textContent = formatTime(STATE.timer.remainingSeconds);
  if (startBtn) {
    if (STATE.timer.isRunning) {
      startBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
      startBtn.className = 'timer-btn timer-pause';
    } else {
      startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start';
      startBtn.className = 'timer-btn timer-start';
    }
  }
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ============================================================================
// Fridge / Pantry Mode (What's in Your Fridge?)
// ============================================================================
function setupPantryListeners() {
  const pantryInput = document.getElementById('pantryInput');
  const addBtn = document.getElementById('addPantryItemBtn');
  const clearBtn = document.getElementById('clearPantryBtn');
  const matchBtn = document.getElementById('matchPantryBtn');

  addBtn.addEventListener('click', () => {
    addPantryItem(pantryInput.value.trim());
    pantryInput.value = '';
    pantryInput.focus();
  });

  pantryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addPantryItem(pantryInput.value.trim());
      pantryInput.value = '';
    }
  });

  clearBtn.addEventListener('click', () => {
    STATE.pantryItems = [];
    savePantry();
    renderPantryChips();
    document.getElementById('pantryResultsSection').style.display = 'none';
  });

  matchBtn.addEventListener('click', calculatePantryMatches);

  document.querySelectorAll('.quick-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const item = tag.getAttribute('data-item');
      addPantryItem(item);
      playSound('pop');
    });
  });
}

function addPantryItem(name) {
  if (!name) return;
  const formatted = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  if (!STATE.pantryItems.includes(formatted)) {
    STATE.pantryItems.push(formatted);
    savePantry();
    renderPantryChips();
    playSound('pop');
  }
}

function removePantryItem(name) {
  STATE.pantryItems = STATE.pantryItems.filter(item => item !== name);
  savePantry();
  renderPantryChips();
  playSound('pop');
}

function renderPantryChips() {
  const container = document.getElementById('pantryChips');
  const countSpan = document.getElementById('pantryCount');
  const matchBtn = document.getElementById('matchPantryBtn');

  countSpan.textContent = STATE.pantryItems.length;
  matchBtn.disabled = STATE.pantryItems.length === 0;

  if (STATE.pantryItems.length === 0) {
    container.innerHTML = '<p class="empty-pantry-hint">No ingredients added yet. Add ingredients above to start matching!</p>';
    return;
  }

  container.innerHTML = STATE.pantryItems.map(item => `
    <span class="pantry-chip">
      <span>${escapeHtml(item)}</span>
      <button onclick="removePantryItem('${escapeHtml(item)}')" title="Remove"><i class="fa-solid fa-xmark"></i></button>
    </span>
  `).join('');
}

function calculatePantryMatches() {
  if (STATE.pantryItems.length === 0) return;

  const resultsSection = document.getElementById('pantryResultsSection');
  const grid = document.getElementById('pantryRecipeGrid');
  const countBadge = document.getElementById('pantryResultsCount');

  const pantrySet = new Set(STATE.pantryItems.map(i => i.toLowerCase()));

  const scoredRecipes = STATE.recipes.map(recipe => {
    let matched = 0;
    const total = recipe.ingredients.length;

    recipe.ingredients.forEach(ing => {
      const itemLower = ing.item.toLowerCase();
      for (const pantryItem of pantrySet) {
        if (itemLower.includes(pantryItem) || pantryItem.includes(itemLower)) {
          matched++;
          break;
        }
      }
    });

    const score = total > 0 ? Math.round((matched / total) * 100) : 0;
    return { ...recipe, matchScore: score, matchedCount: matched, totalCount: total };
  }).filter(r => r.matchScore > 0);

  scoredRecipes.sort((a, b) => b.matchScore - a.matchScore);

  countBadge.textContent = `${scoredRecipes.length} dishes`;
  resultsSection.style.display = 'block';

  playSound('success');
  if (scoredRecipes.length > 0 && scoredRecipes[0].matchScore >= 80) {
    triggerConfetti(50);
  }

  if (scoredRecipes.length === 0) {
    grid.innerHTML = '<div class="empty-state-card"><p>No recipes match the entered ingredients. Try adding staples like garlic, chicken, or paneer!</p></div>';
  } else {
    grid.innerHTML = scoredRecipes.map(createRecipeCardHTML).join('');
    attachCardEventListeners(grid, scoredRecipes);
  }

  resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// ============================================================================
// Grocery Shopping List Feature
// ============================================================================
function setupShoppingListListeners() {
  const input = document.getElementById('customGroceryInput');
  const addBtn = document.getElementById('addGroceryItemBtn');
  const copyBtn = document.getElementById('copyShoppingListBtn');
  const clearCheckedBtn = document.getElementById('clearCheckedShoppingBtn');
  const clearAllBtn = document.getElementById('clearAllShoppingBtn');

  addBtn.addEventListener('click', () => {
    const val = input.value.trim();
    if (val) {
      STATE.shoppingList.push({
        id: 'shop-' + Date.now(),
        recipeId: 'custom',
        recipeTitle: 'Extra Grocery Items',
        text: val,
        completed: false
      });
      input.value = '';
      saveShoppingList();
      renderShoppingList();
      playSound('pop');
      showToast('Item added to grocery list! 🛒', 'success');
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addBtn.click();
  });

  copyBtn.addEventListener('click', () => {
    if (STATE.shoppingList.length === 0) {
      showToast('Your grocery list is empty', 'info');
      return;
    }
    const textList = STATE.shoppingList.map(item => `[${item.completed ? 'x' : ' '}] ${item.text} (${item.recipeTitle})`).join('\n');
    if (navigator.clipboard) {
      navigator.clipboard.writeText('🛒 FlavorCraft Grocery List:\n' + textList);
      playSound('pop');
      showToast('Grocery list copied to clipboard! 📋', 'success');
    }
  });

  clearCheckedBtn.addEventListener('click', () => {
    STATE.shoppingList = STATE.shoppingList.filter(item => !item.completed);
    saveShoppingList();
    renderShoppingList();
    playSound('pop');
    showToast('Completed items cleared', 'info');
  });

  clearAllBtn.addEventListener('click', () => {
    if (STATE.shoppingList.length === 0) return;
    if (confirm('Clear entire grocery shopping list?')) {
      STATE.shoppingList = [];
      saveShoppingList();
      renderShoppingList();
      showToast('Grocery list cleared', 'danger');
    }
  });
}

function renderShoppingList() {
  const container = document.getElementById('shoppingListContainer');
  const emptyState = document.getElementById('emptyShoppingState');

  if (STATE.shoppingList.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  const groups = {};
  STATE.shoppingList.forEach(item => {
    const title = item.recipeTitle || 'General Items';
    if (!groups[title]) groups[title] = [];
    groups[title].push(item);
  });

  container.innerHTML = Object.keys(groups).map(title => `
    <div class="shopping-group-card">
      <div class="shopping-group-header">
        <h4 class="shopping-group-title"><i class="fa-solid fa-utensils"></i> ${escapeHtml(title)}</h4>
        <span class="results-badge">${groups[title].length} items</span>
      </div>
      <div class="grocery-items-list">
        ${groups[title].map(item => `
          <div class="grocery-item-row ${item.completed ? 'completed' : ''}" data-item-id="${item.id}">
            <label class="grocery-item-label">
              <input type="checkbox" class="grocery-checkbox" ${item.completed ? 'checked' : ''} />
              <span class="grocery-text">${escapeHtml(item.text)}</span>
            </label>
            <button class="delete-grocery-btn" title="Remove item"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.grocery-item-row').forEach(row => {
    const itemId = row.getAttribute('data-item-id');
    const checkbox = row.querySelector('.grocery-checkbox');
    const deleteBtn = row.querySelector('.delete-grocery-btn');

    checkbox.addEventListener('change', (e) => {
      const item = STATE.shoppingList.find(i => i.id === itemId);
      if (item) {
        item.completed = e.target.checked;
        saveShoppingList();
        row.classList.toggle('completed', item.completed);
        playSound('pop');
      }
    });

    deleteBtn.addEventListener('click', () => {
      STATE.shoppingList = STATE.shoppingList.filter(i => i.id !== itemId);
      saveShoppingList();
      renderShoppingList();
      playSound('pop');
    });
  });
}

// ============================================================================
// Add Custom Recipe Modal
// ============================================================================
function openAddRecipeModal() {
  const modal = document.getElementById('addRecipeModal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeAddRecipeModal() {
  const modal = document.getElementById('addRecipeModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function addDynamicInputRow(type) {
  if (type === 'ingredient') {
    const container = document.getElementById('ingredientInputsContainer');
    const row = document.createElement('div');
    row.className = 'ingredient-input-row';
    row.innerHTML = `
      <input type="number" step="any" placeholder="Qty (e.g. 2)" class="ing-amount" required />
      <input type="text" placeholder="Unit (tbsp, cup, g)" class="ing-unit" />
      <input type="text" placeholder="Ingredient name (e.g. Basmati Rice)" class="ing-item" required />
      <button type="button" class="remove-row-btn" title="Remove"><i class="fa-solid fa-xmark"></i></button>
    `;
    row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove());
    container.appendChild(row);
  } else if (type === 'instruction') {
    const container = document.getElementById('instructionInputsContainer');
    const stepCount = container.querySelectorAll('.instruction-input-row').length + 1;
    const row = document.createElement('div');
    row.className = 'instruction-input-row';
    row.innerHTML = `
      <span class="step-num">${stepCount}</span>
      <textarea rows="2" placeholder="Describe this cooking step in detail..." class="step-text" required></textarea>
      <button type="button" class="remove-row-btn" title="Remove"><i class="fa-solid fa-xmark"></i></button>
    `;
    row.querySelector('.remove-row-btn').addEventListener('click', () => {
      row.remove();
      container.querySelectorAll('.instruction-input-row').forEach((r, idx) => {
        r.querySelector('.step-num').textContent = idx + 1;
      });
    });
    container.appendChild(row);
  }
}

function handleSaveCustomRecipe(e) {
  e.preventDefault();

  const title = document.getElementById('newTitle').value.trim();
  const category = document.getElementById('newCategory').value;
  const cuisine = document.getElementById('newCuisine').value.trim() || 'Home Cooked';
  const difficulty = document.getElementById('newDifficulty').value;
  const servings = parseInt(document.getElementById('newServings').value, 10) || 4;
  const prepTime = parseInt(document.getElementById('newPrepTime').value, 10) || 15;
  const cookTime = parseInt(document.getElementById('newCookTime').value, 10) || 20;
  const calories = parseInt(document.getElementById('newCalories').value, 10) || 450;
  const image = document.getElementById('newImage').value.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
  const description = document.getElementById('newDescription').value.trim() || 'A delightful custom home-cooked specialty.';

  const ingredients = [];
  document.querySelectorAll('#ingredientInputsContainer .ingredient-input-row').forEach(row => {
    const amount = parseFloat(row.querySelector('.ing-amount').value) || 1;
    const unit = row.querySelector('.ing-unit').value.trim();
    const item = row.querySelector('.ing-item').value.trim();
    if (item) ingredients.push({ amount, unit, item });
  });

  const instructions = [];
  document.querySelectorAll('#instructionInputsContainer .instruction-input-row').forEach(row => {
    const text = row.querySelector('.step-text').value.trim();
    if (text) instructions.push(text);
  });

  if (ingredients.length === 0 || instructions.length === 0) {
    showToast('Please provide at least one ingredient and instruction step.', 'danger');
    return;
  }

  const newRecipe = {
    id: 'custom-' + Date.now(),
    title,
    category,
    cuisine,
    image,
    prepTime,
    cookTime,
    servings,
    difficulty,
    calories,
    protein: `${Math.floor(calories * 0.05)}g`,
    carbs: `${Math.floor(calories * 0.08)}g`,
    fat: `${Math.floor(calories * 0.04)}g`,
    description,
    ingredients,
    instructions,
    tags: [category, cuisine, 'Custom'],
    isCustom: true
  };

  STATE.customRecipes.push(newRecipe);
  saveCustomRecipes();

  document.getElementById('customRecipeForm').reset();
  closeAddRecipeModal();
  renderExploreRecipes();
  playSound('success');
  triggerConfetti(70);
  showToast(`"${title}" created and saved to your cookbook! 🌟`, 'success');
}

// ============================================================================
// Toast Notification Utility
// ============================================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'danger') icon = 'fa-circle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 250ms ease';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// ============================================================================
// Sanitization Helper
// ============================================================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
