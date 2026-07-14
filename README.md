# 🩸 BloodLink — Frontend

BloodLink is a real-time blood matching and notification platform designed to connect people in need of urgent blood transfusions with nearby eligible donors. This repository contains the Next.js frontend application.

---

## 🚀 Key Features

* **Urgent Request Dashboard**: Post critical blood requests and monitor local active cases.
* **Geocoding & Location Autocomplete**: Built-in location search (via OpenStreetMap's Nominatim API) to easily find cities/hospitals and automatically capture coordinate coordinates, with fallback to HTML5 GPS geolocation.
* **Fulfillment Checklist Modal**: Allows requesters to mark requests as fulfilled and checkmark which donors helped save a life, immediately rewarding those helpers.
* **Email Acceptance Redirection**: Receptive route confirmation handlers (`/request/confirm/[id]`) that prompt guest users to login and redirect them back to automatically confirm their donation.
* **Secure HTTP-Only Cookies**: JWT session token stored inside browser-invisible HTTP-Only cookies to secure sessions against XSS token theft.

---

## 🛠️ Tech Stack

* **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
* **Styling**: Vanilla CSS with custom responsive layouts
* **Components**: Radix UI primitives & Base UI components
* **HTTP Client**: Axios with credentials enabled
* **Icons**: Lucide React

---

## ⚙️ Project Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` or `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL= your_next_url
```

### 3. Start Development Server
```bash
npm run dev
```
Open https://bloodlink1.vercel.app/ with your browser to see the application.

---

## 📦 Scripts

* `npm run dev`: Starts the Next.js development server.
* `npm run build`: Compiles the application for production using Next.js Turbopack compiler.
* `npm run lint`: Runs ESLint validation check.
* `npx tsc --noEmit`: Performs typescript compiler check.
