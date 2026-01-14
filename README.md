# tmrev-app

A mobile application for reviewing and tracking movies built with React Native and Expo.

## 📱 About

tmrev is a feature-rich movie review and tracking application that allows users to discover, review, and manage their movie watchlist. Built with modern React Native technologies, it provides a seamless experience across iOS, Android, and web platforms.

## ✨ Features

- 🎬 Browse and search movies
- ⭐ Write and read movie reviews
- 📝 Track watched movies with custom ratings
- 📚 Create and manage watchlists
- 🔥 View trending and most reviewed movies
- 👥 Follow user activity and reviews
- 🔔 Push notifications for updates
- 🎨 Dark mode support
- 🔐 Authentication with Google, Apple, and Firebase

## 🛠️ Tech Stack

- **Framework**: React Native 0.73.6
- **Platform**: Expo ~50.0.14
- **Navigation**: Expo Router ^3.4.8
- **State Management**: Redux Toolkit ^2.2.3
- **Data Fetching**: TanStack Query ^5.90.16
- **UI Components**: React Native Paper ^5.12.3
- **Charts**: React Native Gifted Charts ^1.4.10
- **Authentication**: Firebase Auth, Google Sign-In, Apple Authentication
- **Language**: TypeScript ^5.1.3

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- For iOS development: [Xcode](https://developer.apple.com/xcode/) (macOS only)
- For Android development: [Android Studio](https://developer.android.com/studio)

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/KegenGuyll/tmrev-app.git
cd tmrev-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables (Firebase configuration, API keys, etc.)

## 🏃 Running the App

### Start the development server:
```bash
npm start
# or
yarn start
```

### Run on specific platforms:

**iOS:**
```bash
npm run ios
# or
yarn ios
```

**Android:**
```bash
npm run android
# or
yarn android
```

**Web:**
```bash
npm run web
# or
yarn web
```

## 🔧 Available Scripts

- `npm start` - Start the Expo development server
- `npm run ios` - Run the app on iOS simulator/device
- `npm run android` - Run the app on Android emulator/device
- `npm run web` - Run the app in a web browser
- `npm run generate-queries` - Generate API client code using Orval (runs `npx orval`)

## 📁 Project Structure

```
tmrev-app/
├── api/              # API client and generated queries
├── app/              # Expo Router pages and navigation
├── assets/           # Images, fonts, and other static assets
├── components/       # Reusable UI components
├── constants/        # App constants and configuration
├── features/         # Feature-specific components
├── hooks/            # Custom React hooks
├── lib/              # Utility libraries
├── models/           # TypeScript models and types
├── providers/        # Context providers
├── redux/            # Redux store and slices
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## 🔐 Configuration

This app requires the following configurations:

- Firebase project setup (Authentication, Crashlytics, Messaging)
- Google Sign-In credentials
- Apple Sign-In setup (for iOS)
- TMDB API access (for movie data)

Configuration files:
- `GoogleService-Info.plist` (iOS)
- `google-services.json` (Android)

## 📦 Build

The app uses EAS (Expo Application Services) for building:

```bash
# Development build
eas build --profile development

# Preview build
eas build --profile preview

# Production build
eas build --profile production
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 👨‍💻 Developer

Developed by Kegen Guyll (@KegenGuyll)

---

Built with ❤️ using React Native and Expo
