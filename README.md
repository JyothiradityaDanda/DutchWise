# 💰 DutchWise - Split Expenses with Friends

A vibrant, modern expense-sharing app inspired by Splitwise, built with **Next.js 16**, **TypeScript**, **Framer Motion**, and **Google OAuth**. Features beautiful glass-morphism UI, smooth animations, and intelligent device detection for optimal experience on web and iPhone.

## ✨ Features

### Core Functionality
- 🔐 **Google OAuth Authentication** - Secure sign-in with Google
- 👥 **Group Management** - Create and manage expense groups
- 💸 **Smart Expense Splitting**:
  - Equal split
  - Exact amounts
  - Percentage-based
  - Share/ratio-based
- 📊 **Real-time Balance Tracking** - See who owes whom instantly
- 💰 **Debt Simplification** - Minimizes number of transactions needed
- 📱 **Activity Feed** - Timeline of all expenses and settlements
- ⚙️ **Profile & Settings** - Manage preferences and theme

### Design & UX
- 🎨 **Vibrant Glass-Morphism UI** - Modern frosted glass effects
- 🌈 **Electric Gradients** - Bold, flashy color schemes
- ✨ **Smooth Animations** - Spring physics and motion effects
- 🌓 **Light & Dark Themes** - Fully themed with system detection
- 📱 **Mobile-First Design** - Optimized for touch interfaces
- 🍎 **iPhone PWA Support** - Installable as native-feeling app

### Technical Features
- 🔍 **Device Detection** - Automatically detects device type, platform, and display mode
- 📱 **PWA Ready** - Works offline, installable on iPhone/Android
- 🎯 **Safe Area Support** - Respects iPhone notches and home indicators
- ⚡ **Fast & Responsive** - Optimized performance
- 💾 **Persistent Storage** - Data saved with Zustand + localStorage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Google Cloud Project with OAuth credentials

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd DutchWise
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Copy the example file:
```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your Google OAuth credentials:

```env
AUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
```

### Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy Client ID and Client Secret to `.env.local`

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Install as iPhone App

### Method 1: PWA Installation (Recommended)
1. Open the app in Safari on your iPhone
2. Tap the Share button (square with arrow)
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"
5. The app icon will appear on your home screen
6. Open it for a native app experience!

### Features in PWA Mode:
- ✅ Fullscreen experience
- ✅ App icon on home screen
- ✅ Respects iPhone safe areas (notch)
- ✅ Standalone mode detection
- ✅ Optimized UI for iOS

## 🎨 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Animation**: Framer Motion
- **State Management**: Zustand (with persist)
- **Authentication**: NextAuth.js v5
- **OAuth**: Google OAuth 2.0

## 🔐 Security

- OAuth 2.0 authentication via Google
- JWT session tokens
- Route protection middleware
- Secure cookie handling
- Environment variable protection

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AUTH_SECRET` | NextAuth secret key | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Yes |
| `NEXTAUTH_URL` | App base URL | Yes |

## 🐛 Troubleshooting

### OAuth Errors
- Check Google OAuth credentials are correct
- Verify redirect URIs match exactly
- Ensure Google+ API is enabled

### PWA Not Installing
- Must be served over HTTPS (production)
- Use Safari on iOS
- Check manifest.json is accessible

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard.

## 📄 License

MIT License - feel free to use for personal or commercial projects!

---

**Made with ❤️ and lots of vibrant gradients** 🌈
