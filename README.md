<div align="center">

# ☔ Umbrella App (UmbraMind AI)

### *Predictive Weather Intelligence & Personalized Umbrella Companion*

**Developer**: Navaneeth Krishnan  
**Live Application**: [https://umbramind-app.vercel.app/](https://umbramind-app.vercel.app/)  
**GitHub Repository**: [https://github.com/iam-navaneeth/umbramind-app](https://github.com/iam-navaneeth/umbramind-app)

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_App-06b6d4?style=for-the-badge&logo=vercel)](https://umbramind-app.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

> 📢 **"Search your place to check if you need to bring an umbrella today!"**

---

</div>

## 🌟 Overview

**Umbrella App (UmbraMind AI)** is an intelligent, high-precision weather application developed by **Navaneeth Krishnan**. Unlike basic weather apps that only show generic rain percentages, Umbrella App combines **ECMWF & ICON High-Resolution Meteorological Models** with your personal outdoor exposure history and commute habits to give you an instant, definitive answer: **Do you need an umbrella today?**

Whether you are walking, cycling, taking public transit, or driving, Umbrella App adapts its predictive AI boundary to fit your lifestyle! 🚶‍♂️🚴‍♀️🚌🚗

---

## 🔥 Key Features

- ⚡ **Instant Umbrella Decision**: Prominent top recommendation card displaying clear decision tags (**"YES - UMBRELLA REQUIRED!"**, **"RECOMMENDED"**, **"OPTIONAL FOLDABLE UMBRELLA"**, **"NO UMBRELLA NEEDED"**).
- 📍 **Hyper-Local Village & Global Place Search**: Instant search covering global cities as well as local panchayats and villages (e.g. **Pallassana**, **Kollengode**, **Cheramangalam**, **Palakkad**, **Chittur**, **Alathur**, **Kochi**, etc.) using multi-provider geocoding (Open-Meteo + OpenStreetMap Nominatim fallback).
- 🧭 **Accurate GPS & Reverse Geocoding**: HTML5 Geolocation auto-detects your location and performs reverse geocoding to resolve your exact city or village name (e.g., *"Pallassana, Palakkad"*).
- 📱 **Mobile-First Layout**: The **Umbrella Recommendation Gauge comes FIRST** (especially on mobile devices), followed by **Detailed Weather Stats DOWN BELOW**.
- 🌡️ **High-Accuracy Meteorological System**: Syncs with ECMWF & ICON high-resolution regional/global ensemble models, tracking:
  - **Dew Point Spread** ($\le 2^\circ\text{C}$ condensation cloudburst tracking)
  - **Atmospheric CAPE Energy** ($> 250\text{ J/kg}$ convective thunderstorm detection)
  - **RealFeel Apparent Temp** & **Surface Pressure** (hPa)
  - **Wind Gusts** ($> 35\text{ km/h}$ windproof umbrella alerts)
- ⏱️ **12-Hour Hourly Rain Timeline**: Accurately synced to the current local hour, showing precipitation probability (%) and rain volume (mm) hour by hour.
- 🧠 **Explainable AI (XAI)**: SHAP-style feature attribution bars revealing *why* the model made its decision.
- 🎯 **Habit Profile Tuner**: Adjust outdoor exposure minutes, transport mode, and rain tolerance.
- 📊 **ML Analytics & Confusion Matrix**: Real-time evaluation of Model Accuracy, Precision, Recall, and F1 Score.
- 🔄 **In-Browser SGD Model Retraining**: Log daily ground truth outcomes to retrain model feature weights locally via Stochastic Gradient Descent (SGD).

---

## 🔒 Privacy & Data Protection Policy

Umbrella App is designed with **Privacy-First & Local-First Security Architecture**:

### 1. 100% Client-Side Local Storage Privacy
- Your personal habit profile, transport mode preferences, and daily feedback logs are **stored exclusively in your local browser storage (`localStorage`)**.
- **No user data is ever uploaded to central databases or external servers.**

### 2. Geolocation Privacy
- HTML5 GPS coordinates are used **transiently solely to request real-time weather forecasts and resolve your city/village name**.
- Coordinates are never saved, tracked, or shared.

### 3. Open-Source Codebase & Secret Protection
- Strictly enforced `.gitignore` security ensures no environment variables (`.env`, `.env.local`), private keys, or API credentials are committed to GitHub.
- Public environment template (`.env.example`) allows open-source contributions without exposing private keys.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Vanilla Tailwind CSS + Glassmorphism Aesthetics |
| **Weather Engine** | Open-Meteo High-Resolution Ensemble API (ECMWF / ICON) |
| **Geocoding** | Open-Meteo + OpenStreetMap Nominatim + BigDataCloud Reverse Geocoding |
| **ML Classifier** | Custom In-Browser Logistic Regression & SGD Retraining Engine |
| **Icons & UI** | Lucide React + Framer Motion |

---

## 🚀 Local Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/iam-navaneeth/umbramind-app.git
   cd umbramind-app
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build Production Bundle**:
   ```bash
   npm run build
   npm run start
   ```

---

## 👨‍💻 Developer Credit

Developed with 💖 by **Navaneeth Krishnan**  
- **GitHub**: [@iam-navaneeth](https://github.com/iam-navaneeth)  
- **Live Web Application**: [https://umbramind-app.vercel.app/](https://umbramind-app.vercel.app/)

---

<div align="center">

*Umbrella App (UmbraMind AI) — Intelligent Weather Companion*

</div>
