# Jhon Verille Alterado - Portfolio

A high-performance, CMS-driven 3D web experience built with Next.js, Firebase, and GSAP.

## 🚀 Overview

This portfolio showcases professional creative works using a "Digital Abyss" aesthetic, featuring interactive 3D elements, smooth scroll-driven animations, and a powerful custom admin dashboard for content management.

### Key Features
- **Dynamic CMS**: Full control over projects, testimonials, and site-wide labels via a custom Admin Dashboard.
- **3D Background**: Immersive "Digital Abyss" experience powered by React Three Fiber.
- **GSAP Animations**: Fluid scrolling and interaction-driven micro-animations.
- **Firebase Integration**: Firestore for data, Authentication for admin access, and Firebase Hosting for deployment.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop viewports.

## 🛠️ Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: Vanilla CSS (CSS Modules)
- **Animations**: [GSAP](https://gsap.com/) & [Lenis](https://github.com/darkroomengineering/lenis)
- **3D Engine**: [Three.js](https://threejs.org/) via [React Three Fiber](https://r3f.docs.pmnd.rs/)
- **Backend/Hosting**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Storage, Hosting)

## 💻 Getting Started

### Prerequisites
- Node.js 18.x or later
- Firebase CLI (`npm install -g firebase-tools`)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/jhonverille/jhonverille-portfolio.git
   cd jhonverille-portfolio
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env.local` based on your Firebase configuration keys.

### Development
Run the development server:
```bash
npm run dev
```

### Deployment
Build and deploy to Firebase Hosting:
```bash
npm run deploy
```

## 🔐 Admin Dashboard
Access the CMS at `/admin`. Authentication is required via the dedicated login page.

---
Built with pride. 🇵🇭
