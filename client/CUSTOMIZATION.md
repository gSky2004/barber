# Milestone Accessories — Frontend Customization Guide

This guide explains how to customize the most common things in the React frontend.

---

## Project Setup

```bash
cd client
npm install
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Production build
npm run lint      # Run linter
```

---

## 1. Adding / Changing Product Images

### Where images live

All public images are in:

```
client/public/images/
```

Any file you put here is served at `/images/<filename>`. For example, `client/public/images/my-photo.png` becomes `/images/my-photo.png`.

### How to replace a product image

1. Drop your new image into `client/public/images/`
2. Open `client/src/data/images.js`
3. Find the product in the `featuredShop` array (or in the `products` object)
4. Update the `image_url` field to point to your new file

**Example:**

```js
// Before
image_url: '/images/product-charger.svg',

// After (you added charger-v2.png to public/images/)
image_url: '/images/charger-v2.png',
```

### How to add a new product

In `client/src/data/images.js`, add a new entry to the `featuredShop` array:

```js
{
  id: 'feat-my-product',
  name: 'My New Product',
  category: 'phone',          // 'phone' | 'electrical' | 'gaming'
  description: 'Short description of the product.',
  price: 50000,               // Price in TZS (no commas)
  stock: 20,
  image_url: '/images/my-product.png',
},
```

### Recommended image specs

| Property | Value |
|----------|-------|
| Format | PNG, JPG, or SVG |
| Size | 600x600px minimum |
| Background | White or transparent |
| Max file size | 500KB for fast loading |

---

## 2. Changing Colors & Theme

Colors are defined in `client/src/index.css` inside the `@theme` block (lines 3–15):

```css
@theme {
  --color-bg: #101827;              /* Page background (dark navy) */
  --color-bg-elevated: ...;         /* Card/surface backgrounds */
  --color-text: #f5f7fb;            /* Main text color */
  --color-muted: #a5adc8;           /* Secondary/muted text */
  --color-primary: #d4af37;         /* Gold — buttons, accents */
  --color-primary-light: #f5d36b;   /* Light gold for gradients */
  --color-accent: #5b8cff;          /* Blue — links, highlights */
  --color-border: ...;              /* Border color */
}
```

**To change the brand gold:**
- Replace `--color-primary` and `--color-primary-light` with your new color.

**To change the accent blue:**
- Replace `--color-accent` with your new color.

These Tailwind colors are used throughout the app via classes like `bg-primary`, `text-accent`, `border-border`, etc.

---

## 3. Changing Fonts

Fonts are set in `client/src/index.css`:

```css
@theme {
  --font-sans: 'Outfit', system-ui, sans-serif;       /* Body text */
  --font-display: 'Cinzel', Georgia, serif;            /* Headings */
}
```

Font files are loaded in `client/index.html` via Google Fonts links. To change fonts:

1. Pick a font from [Google Fonts](https://fonts.google.com)
2. Update the `<link>` tags in `client/index.html`
3. Update the `--font-sans` and `--font-display` variables in `index.css`

---

## 4. Adding / Removing Pages

Pages are in `client/src/pages/`. Routes are defined in `client/src/App.jsx`.

**To add a new page:**

1. Create `client/src/pages/MyPage.jsx`
2. Add a route in `App.jsx`:

```jsx
import MyPage from './pages/MyPage';

// Inside the <Routes> block:
<Route path="/my-page" element={<MyPage />} />
```

**To add a nav link**, edit `client/src/components/Navbar.jsx` and add an entry to the `links` array.

---

## 5. Editing the Homepage Sections

The homepage is `client/src/pages/Home.jsx`. Each section has an `id` for anchor linking:

| Section ID | What it shows |
|------------|---------------|
| `#home` | Hero with typing animation |
| `#about` | About us + stats |
| `#services` | Service cards grid |
| `#shop` | Product cards (filtered) |
| `#gallery` | Photo gallery with lightbox |
| `#book` | Booking form |
| `#order` | Order / repair form |
| `#contact` | Contact info + map |

To edit a section's text, find the corresponding `{/* SECTION */}` comment block in `Home.jsx`.

---

## 6. Editing Services

Services are defined in `client/src/data/images.js` as the `serviceList` array.

Each service has:
```js
{
  image: images.services.repair,   // Image reference
  title: 'Phone Repair',           // Display name
  description: '...',              // Short description
  price: 'From TZS 30,000',       // Price text
  cta: 'Request Repair',          // Button label
  link: '#order',                  // Where the button scrolls to
}
```

**To change a service image:**
1. Add your image to `client/public/images/`
2. Update the `services` object in `images.js`:

```js
services: {
  repair: '/images/my-repair-photo.png',
  // ...
}
```

---

## 7. Gallery Images

Gallery images are in `client/src/data/images.js` as the `gallery` array:

```js
gallery: [
  { url: '/images/gallery-barbershop.png', caption: 'Premium cuts' },
  { url: '/images/my-new-photo.png', caption: 'My new caption' },
  // Add more here...
],
```

To add a gallery image:
1. Put the image in `client/public/images/`
2. Add an entry to the `gallery` array

---

## 8. Contact Info

Phone numbers and WhatsApp links are in `client/src/pages/Home.jsx` in the `#contact` section (around line 420):

```jsx
<a href="tel:+255700000000">+255 700 000 000</a>
<a href="https://wa.me/255700000000">Chat on WhatsApp →</a>
```

Replace the numbers with your actual contact details.

---

## 9. Background

The background gradient is in `client/src/index.css` under `.site-bg__image` (line 35). It uses a CSS gradient — no image file needed.

To tweak the gradient colors, edit the `background` property in that class.

---

## 10. Admin Panel

Admin pages are in `client/src/pages/admin/`. They require login. The admin panel lets you:

- Manage products (add, edit, delete)
- View orders
- Manage gallery images
- Manage bookings

Admin product images are uploaded through the admin form and stored via the API.

---

## File Quick Reference

| File | What it controls |
|------|-----------------|
| `src/index.css` | Colors, fonts, theme, background |
| `src/data/images.js` | All images, products, services, gallery |
| `src/pages/Home.jsx` | Homepage sections |
| `src/pages/Shop.jsx` | Shop page |
| `src/components/ProductCard.jsx` | Product card layout & buttons |
| `src/components/Navbar.jsx` | Navigation menu |
| `src/components/Footer.jsx` | Footer content |
| `public/images/` | All image files |
| `index.html` | Font imports, meta tags |
