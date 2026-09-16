<div align="center">

# ☔ UmbraMind — AI Umbrella Reminder Model

### *Personalized Weather Intelligence & Behavioral Machine Learning System*

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![Open-Meteo](https://img.shields.io/badge/API-Open--Meteo-06b6d4?style=for-the-badge)](https://open-meteo.com/)

[**Live Demo**](https://umbramind-app.vercel.app) • [**Report Bug**](https://github.com/iam-navaneeth/umbramind-app/issues) • [**Request Feature**](https://github.com/iam-navaneeth/umbramind-app/issues)

---

</div>

## 🌟 Overview

**UmbraMind** is a real-world Machine Learning web application that predicts whether you're likely to need an umbrella today. Unlike basic weather apps that only show rain percentages, **UmbraMind combines real-time meteorological metrics with your personal outdoor exposure history and transport habits** to make an intelligent, tailored recommendation.

Whether you're walking, cycling, taking public transit, or driving, UmbraMind adapts its decision boundary to fit your lifestyle! 🚶‍♂️🚴‍♀️🚌🚗

---

## 🔥 Key Features

- 🛰️ **GPS & Global Location Search**: Auto-detects location via HTML5 Geolocation or searches any city worldwide via Open-Meteo Weather API (no API key required).
- ⏱️ **12-Hour Hourly Rain Forecast**: Interactive timeline displaying precipitation probability (%) and rain volume (mm) hour by hour.
- 🧠 **Explainable AI (XAI)**: SHAP-style feature attribution bars revealing *why* the model made its decision (e.g. `+35% Rain Probability`, `+20% Cycling Commute`, `-15% Waterproof Jacket`).
- 🌪️ **High Wind Alert System**: Detects severe wind gusts (>38 km/h) where traditional umbrellas flip, alerting you to carry heavy-duty gear or rain ponchos.
- 🎯 **Habit Profile Tuner**: Adjust outdoor walking minutes, rain sensitivity (Zero Tolerance vs Risk Taker), and preferred gear.
- 📊 **ML Analytics & Confusion Matrix**: Real-time evaluation of Model Accuracy, Precision, Recall, and F1 Score.
- 🧪 **Interactive "What-If" Simulator**: Live control sliders allowing you to test how the model reacts under simulated weather conditions.
- 🔄 **Online Learning Feedback Loop**: Log today's ground truth ("Did you carry an umbrella? Did it rain?") to retrain model feature weights locally via Stochastic Gradient Descent (SGD).

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + Glassmorphism Aesthetics |
| **Weather Engine** | Open-Meteo Forecast & Geocoding API |
| **ML Classifier** | Custom In-Browser Logistic Regression & SGD Engine |
| **Icons & UI** | Lucide React + Framer Motion |
| **Deployment** | Vercel |

---

## 🔬 Machine Learning Concepts

### 1. Classification Model Equation
The probability $P(\text{Need Umbrella})$ is computed using a weighted logit $Z$ passed into a Sigmoid activation function:

$$Z = w_0 + w_{\text{rain\_prob}} \cdot X_{\text{rain\_prob}} + w_{\text{precip}} \cdot X_{\text{precip}} + w_{\text{commute}} \cdot X_{\text{commute}} + w_{\text{mode}} \cdot X_{\text{mode}} + \dots$$

$$P(\text{Need Umbrella}) = \frac{1}{1 + e^{-Z}}$$

### 2. Online Model Weight Retraining (SGD)
When users log daily outcomes, feature weights update automatically via Stochastic Gradient Descent:

$$w_j \leftarrow w_j + \eta \cdot (y - \hat{y}) \cdot X_j$$

---

## 🚀 Quick Start (Run Locally)

### Prerequisites
- Node.js (v18.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/iam-navaneeth/umbramind-app.git
   cd umbramind-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## ☁️ Deploy to Vercel

Deploy your own instance of UmbraMind in 1 click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fiam-navaneeth%2Fumbramind-app)

Or via Vercel CLI:
```bash
npx vercel
```

---

## 👤 Author

**Navaneeth**
- GitHub: [@iam-navaneeth](https://github.com/iam-navaneeth)

---

<div align="center">

*Made with 💖, Next.js, and Machine Learning*

</div>
