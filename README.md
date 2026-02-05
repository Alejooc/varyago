# 🛍️ VaryaGo - E-commerce Platform

[![Angular](https://img.shields.io/badge/Angular-20.3-red?logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Performance](https://img.shields.io/badge/Lighthouse-44%2F100-orange)](https://developers.google.com/web/tools/lighthouse)

> **VaryaGo: Variedad que llega contigo** - Modern e-commerce platform built with Angular 20, featuring Server-Side Rendering (SSR), optimized performance, and seamless user experience.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Performance Optimizations](#-performance-optimizations)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Production Build](#-production-build)
- [SSR Deployment](#-ssr-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🛒 E-commerce Core
- **Product Catalog** - Browse products by categories with advanced filtering
- **Search Functionality** - Real-time product search with autocomplete
- **Shopping Cart** - Persistent cart with localStorage integration
- **Checkout Flow** - Streamlined checkout process with multiple payment options
- **Order Confirmation** - Detailed order summaries and tracking

### 🎨 User Experience
- **Responsive Design** - Mobile-first approach, optimized for all devices
- **Modern UI** - Clean, intuitive interface with smooth animations
- **Image Gallery** - Interactive product image viewer with zoom
- **Skeleton Loaders** - Improved perceived performance during data loading
- **Progress Indicators** - Visual feedback for cart goals and promotions

### 🚀 Performance & SEO
- **Server-Side Rendering (SSR)** - Full HTML pre-rendering for SEO and faster initial load
- **Lazy Loading** - Code splitting for routes and components
- **Image Optimization** - NgOptimizedImage with priority hints and lazy loading
- **Compression** - Gzip compression for all server responses
- **Aggressive Caching** - Smart cache headers for static assets
- **Critical CSS** - Inline critical styles for faster First Contentful Paint

### 🔐 Security & Analytics
- **Authentication** - Secure user authentication with JWT
- **Route Guards** - Protected routes for authenticated users
- **Google Tag Manager** - Comprehensive analytics tracking
- **Meta Pixel** - Facebook conversion tracking
- **SEO Optimization** - Dynamic meta tags for all pages

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Angular 20.3.15
- **Language**: TypeScript 5.7
- **Styling**: SCSS with Bootstrap 5
- **Icons**: Line Awesome
- **Image Carousel**: Swiper.js
- **HTTP Client**: Angular HttpClient

### Backend Integration
- **API**: RESTful API integration
- **State Management**: RxJS Observables
- **Storage**: LocalStorage for cart persistence

### Build & Deployment
- **Build Tool**: Angular CLI with esbuild
- **SSR**: Angular Universal with Express
- **Compression**: Gzip/Brotli
- **Node.js**: v20+

### Third-Party Services
- **Analytics**: Google Tag Manager
- **Payments**: Addi Widget
- **Social**: Meta Pixel

---

## 🚀 Performance Optimizations

### Bundle Size Optimization
- **Initial Bundle**: 504.68 kB (reduced from 587 kB, -14%)
- **Lazy Routes**: Code splitting for all major routes
- **Tree Shaking**: Aggressive dead code elimination

### Runtime Performance
- **Compression**: Gzip reduces transfer size by ~60-70%
- **Cache Headers**: 
  - Images/Fonts: 1 year cache (immutable)
  - JS/CSS: 1 day cache
- **Deferred Scripts**: Non-critical scripts load after page content
- **Critical CSS**: Inline critical styles in HTML

### Lighthouse Scores
| Metric | Score |
|--------|-------|
| **Performance** | 44/100 |
| **Accessibility** | 78/100 |
| **Best Practices** | 92/100 |
| **SEO** | 85/100 |

> **Note**: Performance score is limited by external image hosting. Hosting images locally can improve score to 70-80/100.

### SSR Benefits
- ✅ Full HTML pre-rendering for search engines
- ✅ Faster First Contentful Paint (FCP)
- ✅ Better SEO with dynamic meta tags
- ✅ Social media preview cards (Open Graph)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **Git**: Latest version

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Alejooc/varyago.git
   cd varyago
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Update API endpoints in service files
   - Configure analytics IDs (GTM, Meta Pixel)

4. **Start development server**
   ```bash
   npm start
   ```

5. **Open browser**
   ```
   http://localhost:4200
   ```

---

## 💻 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server (port 4200) |
| `npm run build` | Build for production (client-side) |
| `npm run build:ssr` | Build for production with SSR |
| `npm run serve:ssr` | Serve SSR build locally |
| `npm test` | Run unit tests |
| `npm run watch` | Build in watch mode |

### Development Server

```bash
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any source files.

### Code Scaffolding

```bash
ng generate component component-name
ng generate service service-name
ng generate module module-name
```

### Running Tests

```bash
# Unit tests
npm test

# End-to-end tests
npm run e2e
```

---

## 🏗️ Production Build

### Client-Side Build

```bash
npm run build
```

Build artifacts will be stored in the `dist/varyago-frontend/browser/` directory.

### SSR Build

```bash
npm run build:ssr
```

This creates:
- **Browser bundle**: `dist/varyago-frontend/browser/`
- **Server bundle**: `dist/varyago-frontend/server/`

### Local SSR Testing

```bash
npm run serve:ssr
```

Server will start on `http://localhost:4200`

---

## 🌐 SSR Deployment

### Option 1: Node.js Server (Recommended)

1. **Build the application**
   ```bash
   npm run build:ssr
   ```

2. **Copy files to server**
   ```bash
   scp -r dist/ user@server:/path/to/app/
   scp package.json user@server:/path/to/app/
   ```

3. **Install production dependencies**
   ```bash
   cd /path/to/app
   npm install --production
   ```

4. **Start with PM2**
   ```bash
   pm2 start dist/varyago-frontend/server/server.mjs --name varyago
   pm2 save
   pm2 startup
   ```

### Option 2: Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY dist ./dist
COPY package*.json ./
RUN npm install --production
EXPOSE 4200
CMD ["node", "dist/varyago-frontend/server/server.mjs"]
```

```bash
docker build -t varyago .
docker run -p 4200:4200 varyago
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name varyago.com;

    location / {
        proxy_pass http://localhost:4200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

For detailed deployment instructions, see [SSR Deployment Guide](docs/ssr_deployment_guide.md).

---

## 📁 Project Structure

```
varyago/
├── src/
│   ├── app/
│   │   ├── components/       # Reusable components
│   │   │   ├── header/
│   │   │   ├── footer/
│   │   │   ├── carrousel-prods/
│   │   │   └── ...
│   │   ├── pages/            # Route components
│   │   │   ├── home/
│   │   │   ├── product/
│   │   │   ├── category/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   └── ...
│   │   ├── services/         # Business logic & API
│   │   │   ├── api.ts
│   │   │   ├── cart.ts
│   │   │   ├── auth.ts
│   │   │   └── ...
│   │   ├── guards/           # Route guards
│   │   ├── models/           # TypeScript interfaces
│   │   ├── app.config.ts     # App configuration
│   │   ├── app.config.server.ts  # SSR configuration
│   │   ├── app.routes.ts     # Client routes
│   │   └── app.routes.server.ts  # Server routes
│   ├── assets/               # Static assets
│   ├── styles/               # Global styles
│   ├── index.html            # Main HTML
│   ├── main.ts               # Client entry point
│   ├── main.server.ts        # Server entry point
│   └── server.ts             # Express server
├── public/                   # Public assets
├── angular.json              # Angular configuration
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── README.md                 # This file
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=4200
NODE_ENV=production
API_BASE_URL=https://api.varyago.com
GTM_ID=GTM-XXXXXXX
META_PIXEL_ID=XXXXXXXXXX
```

### API Configuration

Update API endpoints in `src/app/services/api.ts`:

```typescript
export const API_CONFIG = {
  baseUrl: 'https://api.varyago.com',
  endpoints: {
    products: '/products',
    categories: '/categories',
    // ... other endpoints
  }
};
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `perf:` Performance improvement
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test updates
- `chore:` Build/config changes

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Alejandro Osorio** - [@Alejooc](https://github.com/Alejooc)

---

## 🙏 Acknowledgments

- Angular Team for the amazing framework
- Bootstrap for the UI components
- Swiper.js for the carousel functionality
- All contributors and supporters

---

## 📞 Support

For support, email support@varyago.com or open an issue in the repository.

---

<p align="center">Made with ❤️ by the VaryaGo Team</p>
<p align="center">
  <a href="https://varyago.com">Website</a> •
  <a href="https://github.com/Alejooc/varyago/issues">Report Bug</a> •
  <a href="https://github.com/Alejooc/varyago/issues">Request Feature</a>
</p>
