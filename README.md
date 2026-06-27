# 🎬 FoMo Cinema Clone

A premium, interactive web application for **FoMo Cinema** built using React, Vite, and Tailwind CSS. The app features a complete movie browsing experience, custom session filtering, and a state-of-the-art interactive seat booking system.

---

## 🚀 Live Demo

🔗 **[View Live Portfolio](https://fomo-cinema.vercel.app/)**

---

## 🚀 Key Features

### 1. Interactive Seat Booking System
- **Aligned Seat Map Grid:** A custom-designed 10-column theater seating grid where standard, recliner, and share table seats line up perfectly.
- **Seat Categories & Pricing:**
  - **Standard Seat:** $15.00
  - **Recliner Seat:** $18.00 (marked with premium pink borders)
  - **Share Table Seat:** $20.00 (marked with purple borders)
  - **Booking Fee:** $1.75 per seat automatically calculated.
- **Interactive Selection:** Real-time seat selection with live subtotal calculation, seat lists, and checkout controls.
- **Dashed-Edge Ticket Pass Modal:** Upon successful booking, a premium ticket pass overlay is generated featuring a custom booking ID, dynamic barcode graphic, order summary, and navigation shortcuts.
- **Unified Checkout Header:** A sticky, responsive header that neatly houses the back button, movie title, and showtime info with zero overlap.

### 2. Rich Movie Discovery
- **Hero Banner:** Premium cinematic carousel featuring active highlights.
- **Smart Filters:** Real-time title search and dynamic day-wise session dropdown filtering.
- **MovieDetails Page:** Comprehensive information for each title, including cast lists, duration, IMDb ratings, custom genre badges, embedded YouTube trailer playback, and session showtime selection.
- **Film-by-Day Page:** A dedicated route that organizes and displays showtimes for all movies playing on a chosen day of the week.
- **Upcoming Shows & Details:** A showcase of upcoming cinema releases with previews and details.

### 3. Additional Customer Pages
- **Memberships & Offers:** Pages describing exclusive VIP memberships and deals.
- **Login Drawer:** A slide-out sidebar login drawer for customer accounts.
- **General info:** About Us, FAQs, Contact form, Group Bookings, Terms of Service, and Privacy Policy.

---

## 🛠️ Technology Stack

- **Core Library:** React 19 (Functional components, Hooks)
- **Build Tool:** Vite (Ultra-fast development server and asset bundling)
- **Routing:** React Router DOM (Dynamic nested paths and parameter management)
- **Styling:** Tailwind CSS (Modern, utility-first CSS styling)
- **Icons:** Lucide React (Clean, scalable SVG iconography)
- **Assets:** Curated movie poster imagery, custom trailer integration, and brand logos.

---

## 💻 Installation & Setup

Follow these steps to run the project locally:

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/Fomo-Cinema-Clone.git
cd Fomo-Cinema-Clone
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
The application will start running locally (usually at `http://localhost:5173/`).

### 4. Build for Production
To bundle the project for production deployment:
```bash
npm run build
```
Vite will compile and optimize the assets, exporting them into the `dist/` directory.

---

## 📂 Project Structure

```text
├── public/                 # Static assets (Favicon, logos, PDF downloads)
├── src/
│   ├── assets/             # Movie posters, banners, and local styling images
│   ├── components/         # Reusable widgets (Navbar, Footer, MovieCard, MovieSection, etc.)
│   ├── data/               # Static mock data (Movies list, timings, data schemas)
│   ├── pages/              # Main view components (Home, Booking, FilmByDay, etc.)
│   ├── App.jsx             # Main routing registry
│   ├── main.jsx            # Application mount point
│   └── index.css           # Global Tailwind CSS configurations
├── index.html              # Main HTML entry point
├── vite.config.js          # Vite configurations
└── package.json            # Script registries & dependency list
```
