# 🏠 Elite Maids — Premium Home Cleaning Services

A modern, responsive, premium website for **Elite Maids**, a professional home cleaning service located in **Dallas, TX**.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

---

## ✨ Features

- **Premium UI/UX** — Clean, minimalist light theme with glassmorphic elements and a leaf-green (`#4c9519`) accent color system.
- **Interactive Booking Estimator** — Real-time price calculator with draggable range sliders for Bedrooms, Bathrooms (0.5 step support), and Home Square Footage.
- **Frequency Discounts** — Weekly (20%), Every 2 Weeks (15%), Every 3 Weeks (10%), and Monthly (5%) frequency selection cards with badges.
- **Service Address Form** — Multi-column responsive address inputs for street, city, state, and ZIP code.
- **Cleaning Add-Ons** — Toggle cards for extras like Fridge, Oven, Cabinets, Windows, and Pet Hair cleaning.
- **Service Checklists** — Dialog modals showing detailed task lists for Standard, Deep, and Move-In/Out cleaning plans.
- **Customer Reviews** — Testimonial cards with star ratings, verified booking badges, and service type tags.
- **Fully Responsive** — Flawless experience on desktop, tablet, and mobile with a sticky booking CTA bar on mobile.
- **Scroll Animations** — Smooth reveal-on-scroll effects using Intersection Observer.

---

## 📁 Project Structure

```
Elite-Maid/
├── index.html          # Main website page
├── styles.css          # Complete design system & responsive styles
├── app.js              # Booking logic, sliders, pricing & interactions
├── README.md           # Project documentation
├── .gitignore          # Git ignore rules
└── assets/
    ├── logo.jpg        # Company logo
    └── hero-bg.png     # Hero section background image
```

---

## 🚀 How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/DarshanCHKargal/Elite-Maid.git
   ```
2. Open `index.html` in your browser — no build tools required!

---

## 💰 Pricing Logic

| Component | Rate |
|-----------|------|
| Base Price (1 bed, 1 bath, up to 1000 sqft) | $90.00 |
| Each Additional Bedroom | +$25.00 |
| Each Additional Bathroom | +$35.00 |
| Square Footage over 1000 sqft | +$0.05/sqft |
| Deep Cleaning Multiplier | 1.5× |
| Move-In/Out Multiplier | 1.8× |

---

## 📄 License

This project is for personal/commercial use by Elite Maids, Dallas TX.
