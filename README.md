# 🍳 FlavorCraft — React + Vite Gourmet Recipe Studio & Kitchen Assistant

[![FlavorCraft Banner](https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80)]
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-v6-CA4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-greens?tyle=for-the-badge)](LICENSE)

> **FlavorCraft** is an interactive, high-performance cooking studio developed with **React** and **Vite**. It features clearly identified **User** and **Admin** modules, **LocalStorage Authentication**, an instant 0ms search engine, a full-screen step-by-step cooking mode, a 7-day meal planner, interactive Web Audio SFX, HTML5 canvas confetti, and full **Vercel deployment** configuration.

---

### Module Responsibilities:

1. **User Module**:
   - **Explore & Instant Search**: 0ms local filtering across title, ingredients, cuisine, and category + TheMealDB online search.
   - **Focus Cook Mode**: Full-screen distraction-free step-by-step cooking guide with countdown timer, keyboard navigation, and confetti celebration upon completion.
   - **7-Day Meal Planner**: Breakfast, Lunch, and Dinner schedule with 1-click export to shopping list.
   - **Fridge Pantry Matcher**: Enter ingredients in your fridge; FlavorCraft ranks dishes by match percentage.
   - **Smart Grocery List**: Items grouped by recipe, quick check-offs, and 1-click clipboard copy.
   - **Ratings & Chef Notes**: 5-star ratings and personal cooking tweaks auto-saved to LocalStorage.

2. **Admin Module**:
   - **Dashboard Analytics**: Metrics on total recipes, active users, saved favorites, and category distribution.
   - **Recipe Catalog Management (CRUD)**: Create new recipes, edit instructions/ingredients, and delete recipes.
   - **User Management**: View all registered users and promote users to Admin or demote to User.
   - **Quick Demo Role Switcher**: Instant 1-click toggle between Admin and User views for testing and presentation.

---

## 🚀 Key Features

### 🔐 1. Zero-Delay Authentication & Quick Demo Sign-Ins

- **Instant Demo Access**: 1-Click login buttons for **Chef Gordon**, **Chef Alex**, or **Guest Pass** so users can explore immediately without typing credentials.
- **Full Auth Flow**: Supports custom Sign Up, Email/Password login with toggleable password visibility, simulated Google Sign-In, and `localStorage` session persistence.

### 🔍 2. Instant Zero-Lag Search & Multi-Filter Discovery

- **0ms Instant Local Filtering**: Searches match across recipe **titles**, **ingredients**, **categories**, **cuisines**, **tags**, and **descriptions** instantly as you type.
- **Asynchronous Online Enrichment**: Background queries to [TheMealDB API](https://www.themealdb.com/api.php) with a 3.5-second timeout guard, smoothly appending online global recipes.
- **"What's Your Cooking Vibe?" Mood Selector**: 1-click filter pills for **⚡ Quick (<25m)**, **🇮🇳 Desi (Indian)**, **🍲 Comfort**, **🥗 Healthy**, **🍰 Sweet**, and **🎉 Party**.
- **Trending Query Chips & Surprise Me**: Quick-search buttons for popular dishes (_Biryani, Paneer, Chicken, Dosa, Pasta_) and a random recipe picker with celebration confetti.

### 🍳 3. Full-Screen Focus Cook Mode

- **Distraction-Free Guidance**: Dedicated full-screen modal showing one cooking step at a time in large, accessible typography.
- **Keyboard Navigation**: Advance steps using `Right Arrow` / `Spacebar` and go back with `Left Arrow`.
- **Integrated Timer & Progress Bar**: Automatically parses minutes from step text to configure cooking timers.
- **Confetti Explosion**: Interactive HTML5 canvas particle celebration upon dish completion!

### 📅 4. 7-Day Weekly Meal Planner

- **Organized Meal Grid**: Plan **Breakfast**, **Lunch**, and **Dinner** slots from Monday through Sunday.
- **1-Click Grocery Export**: Automatically compiles all ingredients from your 7-day meal plan directly into your shopping list.

### 🧊 5. Fridge Pantry Finder ("What's in Your Fridge?")

- Add ingredients you already have at home (e.g., _Chicken, Rice, Paneer, Potatoes, Yogurt_).
- Calculates a **Match Percentage Algorithm** ranking dishes by pantry overlap to reduce food waste.

### 🛒 6. Smart Grocery Shopping List

- Auto-groups items by recipe or dish.
- Features quick ingredient check-off, custom item addition, uncompleted item badges, and 1-click clipboard copying.

### ⚖️ 7. Dynamic Servings Scaler & Recipe Timer

- Real-time ingredient yield multiplier (0.5x, 1x, 2x, 3x, 4x, or custom controls).
- Built-in Web Audio stopwatch/timer with start, pause, and reset controls.

### ⭐ 8. Personal Ratings & Chef Notes

- Interactive **5-Star Rating System** for every dish.
- Auto-saved personal chef scratchpad for recording family tweaks, secret spices, and preparation notes.

### 🎨 9. Glassmorphic UI, Audio SFX & Delight Engine

- **Warm Gourmet Palette**: Saffron gold, strawberry coral, basil emerald, and gourmet plum themes.
- **Light & Dark Mode**: Persistent theme toggle matching system preferences.
- **Web Audio Synthesizer**: Custom retro audio feedback for button taps, favorite toggles, and recipe completions.
- **Pure Canvas Confetti Engine**: Custom lightweight 60fps particle physics engine without heavy external libraries.

---

## 🍛 Curated Recipe Bank

FlavorCraft comes pre-loaded with an extensive bank of curated Indian and international recipes:

| Recipe Title                            | Category   | Cuisine  | Prep/Cook Time | Difficulty |
| :-------------------------------------- | :--------- | :------- | :------------- | :--------- |
| **Hyderabadi Chicken Biryani**          | Chicken    | Indian   | 30m / 45m      | Hard       |
| **Crispy South Indian Masala Dosa**     | Breakfast  | Indian   | 20m / 15m      | Medium     |
| **Butter Chicken (Murgh Makhani)**      | Chicken    | Indian   | 20m / 30m      | Medium     |
| **Aloo Paratha / Aloo Roti**            | Breakfast  | Indian   | 20m / 15m      | Easy       |
| **Aloo Gobi Fry**                       | Vegetarian | Indian   | 15m / 20m      | Easy       |
| **Palak / Saag Paneer**                 | Vegetarian | Indian   | 20m / 20m      | Easy       |
| **Gajar Ka Halwa**                      | Dessert    | Indian   | 15m / 35m      | Medium     |
| **Matar Paneer**                        | Vegetarian | Indian   | 15m / 20m      | Easy       |
| **Veg Dum Biryani**                     | Rice       | Indian   | 25m / 35m      | Medium     |
| **Paneer Butter Masala**                | Vegetarian | Indian   | 15m / 25m      | Easy       |
| **Chole Bhature**                       | Vegetarian | Indian   | 25m / 20m      | Medium     |
| **Classic Italian Spaghetti Carbonara** | Pasta      | Italian  | 10m / 15m      | Easy       |
| **Authentic Mexican Street Tacos**      | Beef       | Mexican  | 15m / 15m      | Easy       |
| **Japanese Teriyaki Salmon Bowl**       | Seafood    | Japanese | 15m / 15m      | Easy       |

---

## Project Architecture

FlavorCraft cleanly separates concerns into dedicated functional modules:

```
src/
├── modules/
│   ├── auth/                      # 🔐 Authentication Module
│   │   ├── Login.jsx              # 1-Click zero-delay demo logins & credentials
│   │   └── Signup.jsx             # Role-based registration (User / Admin)
│   ├── user/                      # 👨‍🍳 User Module (Home Chef Experience)
│   │   ├── UserDashboard.jsx      # Explore, instant search, mood pills, category filters
│   │   ├── RecipeCard.jsx         # Recipe card with cook mode & plan shortcuts
│   │   ├── RecipeDetailModal.jsx  # Servings multiplier, timer, checklist & notes
│   │   ├── FocusCookMode.jsx      # Step-by-step full-screen cooking guide
│   │   ├── MealPlanner.jsx        # 7-day calendar & 1-click grocery export
│   │   ├── PantryFinder.jsx       # "What's in your fridge?" % match algorithm
│   │   ├── ShoppingList.jsx       # Grouped grocery list with check-off & clipboard copy
│   │   └── Favorites.jsx          # Saved recipes cookbox
│   └── admin/                     # 👑 Admin Module (Control Center & Supervision)
│       ├── AdminLayout.jsx        # Admin header, breadcrumbs, module tabs & user switch
│       ├── AdminDashboard.jsx     # Analytics, catalog stats, category distribution
│       ├── AdminRecipes.jsx       # Recipe Catalog CRUD table with search & filter
│       ├── AdminRecipeModal.jsx   # Create & Edit recipe modal with dynamic lists
│       └── AdminUsers.jsx         # User directory & role promotion/demotion
```

## 🔐 Authentication via LocalStorage

All authentication and session state is persisted in browser `localStorage`:

- `flavorcraft_users`: Stored accounts with encrypted passwords and role attributes.
- `flavorcraft_session`: Active user session.

### Pre-Configured Demo Accounts:

| Role         | Email                   | Password      | Access                                     |
| :----------- | :---------------------- | :------------ | :----------------------------------------- |
| **👑 Admin** | `admin@flavorcraft.com` | `admin123`    | Full access to Admin Console & User Module |
| **👨‍🍳 User**  | `chef@flavorcraft.com`  | `password123` | Home chef experience (Explore, Plan, Cook) |
| **🍽️ Guest** | `guest@flavorcraft.app` | `guest`       | Instant preview without typing credentials |

---

## ⚡ Quick Start & Local Running

1. **Clone the repository**:

   ```bash
   git clone https://github.com/YOUR_GITHUB_USERNAME/FlavorCraft-Recipe-App.git
   cd FlavorCraft-Recipe-App
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the local development server**:

   ```bash
   npm run dev
   Open [http://localhost:5173](http://localhost:5173) in your browser.

   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

---

### Steps to Deploy to Vercel:

1. Push your project to GitHub:
   git add .
   git commit -m "feat: ready for Vercel deployment"
   git push -u origin main

2. Log in to [Vercel.com](https://Vercel.com).
3. Click **"Add New..."** → **"Project"** and import your repository.
4. Vercel automatically detects the Vite framework settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Deploy"**. Your application will be live in seconds!

---

## 📄 License

# Distributed under the **MIT License**.
