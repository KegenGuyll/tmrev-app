# tmrev-app

A comprehensive movie review and tracking application built with React Native and Expo, allowing users to discover, review, and share their movie experiences.

## 📱 About

tmrev is a social movie review platform that combines movie discovery with community engagement. Users can write detailed reviews, track their watching history, create custom watchlists, and interact with other movie enthusiasts through comments and a social feed. The app integrates with The Movie Database (TMDB) for comprehensive movie data and provides rich analytics and insights into users' viewing habits.

## ✨ Features

### Core Features
- 🎬 **Movie Discovery**: Browse and search from TMDB's extensive movie database
- ⭐ **Detailed Reviews**: Write comprehensive reviews with custom ratings and advanced scoring
- 📊 **Movie Ratings**: Rate movies with custom sliders and multiple rating dimensions
- 🔍 **Advanced Search**: Search movies with filters and sorting options

### Social & Community
- 🏠 **Activity Feed**: View and interact with reviews from followed users
- 💬 **Comments & Discussions**: Comment on reviews and engage in conversations
- 👥 **User Profiles**: Follow other users and track their activity
- 🔔 **Push Notifications**: Real-time updates for interactions and new content
- 👍 **Vote System**: Upvote/downvote reviews and comments

### Tracking & Organization
- 📝 **Watched Movies**: Track all movies you've watched with personal notes
- 📚 **Custom Watchlists**: Create and manage multiple watchlists
- 📈 **Personal Insights**: View analytics on your viewing habits, including:
  - Genre preferences and statistics
  - Favorite actors and their appearance frequency
  - Viewing patterns with heatmap visualizations
  - Rating distributions and trends

### User Experience
- 🎨 **Dark Mode**: Built-in dark theme support
- 🔐 **Multiple Auth Methods**: Sign in with Google, Apple, or Firebase email
- 📱 **Cross-Platform**: Native iOS and Android apps with web support
- 🚀 **Optimized Performance**: Built with React Native's new architecture

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native 0.79.6 (New Architecture enabled)
- **Runtime**: React 19.0.0
- **Platform**: Expo SDK 53
- **Navigation**: Expo Router 5.1.10 (file-based routing)
- **State Management**: Redux Toolkit 2.2.3
- **Data Fetching**: TanStack Query (React Query) 5.90.16
- **UI Components**: React Native Paper 5.12.3
- **Charts & Visualizations**: 
  - React Native Gifted Charts 1.4.10
  - React Native Skia (for advanced graphics)
- **Language**: TypeScript 5.8.3

### Authentication & Backend
- **Authentication**: 
  - Firebase Auth 20.1.0
  - Google Sign-In 11.0.1
  - Apple Authentication 2.3.0
- **API Client**: Auto-generated with Orval from OpenAPI spec
- **HTTP Client**: Axios 1.13.2 with Firebase token interceptors
- **Backend**: Custom TMREV API v2 (Node.js backend, separate repository)

### Additional Libraries
- **Notifications**: Expo Notifications + Firebase Cloud Messaging
- **Error Tracking**: Sentry + Firebase Crashlytics
- **Forms & Inputs**: Custom sliders, date pickers, and input components
- **Media**: Image viewing, sharing, and media library access
- **Animations**: Reanimated 3.17.4 and Gesture Handler 2.24.0

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (LTS version 18.x or higher recommended)
- **Package Manager**: Yarn (project uses `yarn.lock`)
- **Expo CLI**: For running the development server
- **For iOS development** (macOS only):
  - Xcode 15.x or later
  - CocoaPods (for managing iOS dependencies)
- **For Android development**:
  - Android Studio
  - Android SDK (API level 34 or higher)
  - Java Development Kit (JDK) 17 or higher

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/KegenGuyll/tmrev-app.git
cd tmrev-app
```

### 2. Install dependencies
```bash
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# TMREV API v2 Backend URL
TMREV_V2_API_URL=https://your-api-url.com

# Add other required environment variables
```

### 4. Firebase Setup

You'll need to set up Firebase for authentication and notifications:

**iOS:**
1. Download `GoogleService-Info.plist` from Firebase Console
2. Place it in the project root (already referenced in `app.config.js`)
3. Set the path in your environment: `GOOGLE_SERVICES_PLIST=./GoogleService-Info.plist`

**Android:**
1. Download `google-services.json` from Firebase Console
2. Set the path in your environment: `GOOGLE_SERVICES_JSON=./google-services.json`

### 5. Generate API Client (Optional)

If you need to regenerate the API client from the OpenAPI spec:

```bash
yarn generate-queries
```

**Note**: This requires updating the `input` path in `orval.config.js` to point to your Swagger/OpenAPI specification file.

## 🏃 Running the App

### Development Server

Start the Expo development server:
```bash
yarn start
```

This opens Expo Dev Tools where you can:
- Press `i` to run on iOS simulator
- Press `a` to run on Android emulator
- Scan QR code with Expo Go app for physical device testing

### Platform-Specific Commands

**iOS** (macOS only):
```bash
yarn ios
```
Requires Xcode and CocoaPods. Builds and runs on iOS simulator.

**Android**:
```bash
yarn android
```
Requires Android Studio and Android emulator or connected device.

**Web**:
```bash
yarn web
```
Runs the app in your default web browser using Metro bundler.

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `yarn start` | Start Expo development server with Metro bundler |
| `yarn ios` | Build and run on iOS simulator/device |
| `yarn android` | Build and run on Android emulator/device |
| `yarn web` | Run the app in a web browser |
| `yarn generate-queries` | Generate API client code from OpenAPI spec using Orval |

## 📁 Project Structure

The project uses Expo Router for file-based routing with a feature-based organization:

```
tmrev-app/
├── api/                    # API client and auto-generated code
│   └── tmrev-api-v2/      # Generated from OpenAPI spec using Orval
│       ├── endpoints.ts   # React Query hooks for all API endpoints
│       ├── schemas/       # TypeScript types for request/response models
│       └── mutator/       # Axios instance with Firebase auth interceptors
├── app/                   # Expo Router file-based routing
│   ├── (tabs)/           # Main tab navigation
│   │   ├── home/         # Activity feed and reviews
│   │   ├── search/       # Movie search functionality
│   │   ├── movies/       # Browse movies
│   │   ├── addReview/    # Create/edit reviews
│   │   └── profile/      # User profiles, settings, insights
│   ├── login.tsx         # Authentication screens
│   └── _layout.tsx       # Root layout configuration
├── components/            # Reusable UI components
│   ├── AddReview/        # Review creation components
│   ├── MovieDetails/     # Movie detail screens
│   ├── Profile/          # Profile-related components
│   ├── Inputs/           # Custom input components
│   └── CustomCharts/     # Chart and visualization components
├── features/             # Feature-specific components
│   ├── feed/            # Social feed cards
│   ├── movieDetails/    # Movie detail features
│   └── listDetails/     # Watchlist features
├── redux/               # Redux state management
│   ├── store/          # Store configuration
│   ├── slice/          # Redux slices (bottom sheet, snackbar, user profile)
│   └── api/            # RTK Query API slices (if any)
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and helpers
├── models/             # TypeScript data models
├── providers/          # React context providers
├── types/              # Global TypeScript type definitions
├── utils/              # Utility functions
├── assets/             # Images, fonts, and static resources
└── constants/          # App-wide constants and configuration
```

### Key Directories

- **`api/`**: Contains the auto-generated API client. The `endpoints.ts` file exports React Query hooks for all backend operations.
- **`app/`**: File-based routing structure. Each file/folder maps to a route in the app.
- **`components/`**: Organized by feature/domain for better maintainability.
- **`redux/`**: Centralized state for global UI state (modals, snackbars, user session).
- **`features/`**: Feature-specific components that are used within specific routes.

## 🔐 Configuration

### Required Services

1. **Firebase Project**
   - Authentication (Email, Google, Apple)
   - Cloud Messaging (Push notifications)
   - Crashlytics (Error reporting)

2. **TMREV API v2 Backend**
   - Custom backend API for user data, reviews, and social features
   - Requires authentication via Firebase ID tokens
   - Set `TMREV_V2_API_URL` in your `.env` file

3. **OAuth Providers**
   - **Google Sign-In**: Configure OAuth client IDs in Firebase and Google Cloud Console
   - **Apple Sign-In**: Set up in Apple Developer Portal and Firebase (iOS only)

### Configuration Files

- **`app.config.js`**: Main Expo configuration
  - App name, version, bundle identifiers
  - Plugin configurations (Firebase, Google Sign-In, etc.)
  - Platform-specific settings (iOS, Android, Web)
  
- **`.env`**: Environment variables (not committed to repo)
  - API URLs
  - Feature flags (if any)
  
- **`GoogleService-Info.plist`** (iOS): Firebase configuration for iOS
- **`google-services.json`** (Android): Firebase configuration for Android

### EAS Configuration

The app uses Expo Application Services (EAS) for building and deployment:

- **Project ID**: `11919a23-d055-46b2-b7b5-4553413ad5c4`
- **Owner**: `guyllk`
- Build profiles defined in `eas.json`

## 📦 Building for Production

The app uses **EAS (Expo Application Services)** for building production-ready binaries.

### Build Profiles

Check `eas.json` for available build profiles:

```bash
# Development build (includes dev client)
eas build --profile development --platform ios
eas build --profile development --platform android

# Preview build (production-like, for testing)
eas build --profile preview --platform ios
eas build --profile preview --platform android

# Production build (for app stores)
eas build --profile production --platform ios
eas build --profile production --platform android
```

### Important Build Notes

- **New Architecture**: This project has React Native's New Architecture enabled (`newArchEnabled: true`)
- **iOS**: Uses static frameworks (`useFrameworks: 'static'`)
- **Android**: Minimum SDK version as defined in `eas.json`
- Ensure all environment variables are configured in EAS Secrets before building

## 🏗️ Architecture & Patterns

### Data Flow

1. **API Integration**: Auto-generated React Query hooks from OpenAPI spec
   - Type-safe API calls with full TypeScript support
   - Automatic request/response validation
   - Built-in caching and refetching strategies

2. **Authentication Flow**:
   - Firebase Auth manages user authentication
   - Axios interceptors automatically attach Firebase ID tokens to API requests
   - Token refresh handled automatically on 401 responses

3. **State Management**:
   - **React Query**: Server state, caching, and data fetching
   - **Redux Toolkit**: Global UI state (modals, snackbars, user profile)
   - **React Context**: Theme and app-wide providers

4. **Navigation**:
   - File-based routing with Expo Router
   - Nested tab navigation with stack navigators
   - Deep linking support configured

### Key Technologies Explained

- **Orval**: Generates TypeScript-first API client from OpenAPI/Swagger spec
- **React Query (TanStack Query)**: Handles all server state with caching, background refetching, and optimistic updates
- **Redux Toolkit**: Minimal Redux for UI state (bottom sheets, snackbars, user session)
- **Expo Router**: File-based routing similar to Next.js, built on React Navigation
- **React Native Paper**: Material Design component library for consistent UI

## 🧪 Development

### Code Generation

Regenerate API client when the backend API changes:

```bash
yarn generate-queries
```

This runs Orval, which:
1. Reads the OpenAPI spec from the configured path
2. Generates TypeScript types and React Query hooks
3. Applies custom mutators (Axios instance with auth)
4. Runs Prettier to format the generated code

### Code Quality

The project uses:
- **ESLint**: Airbnb configuration with TypeScript support
- **Prettier**: Code formatting (see `.prettierrc`)
- **TypeScript**: Strict type checking

### Environment-Specific Notes

- **iOS**: Requires CocoaPods installation after `yarn install`. Run `cd ios && pod install` if needed.
- **Android**: Uses Gradle for builds. First build may take longer.
- **Web**: Limited functionality compared to native platforms (some native modules not available)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

When contributing:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the existing code style
4. Ensure code passes linting (`npx eslint .`)
5. Commit your changes with clear commit messages
6. Push to your branch and open a Pull Request

## 📄 License

This project is **private and proprietary**.

## 👨‍💻 Developer

**Developed by**: Kegen Guyll ([@KegenGuyll](https://github.com/KegenGuyll))

## 🔗 Related Repositories

- **TMREV API v2**: Backend API service (separate private repository)
- Movie data sourced from **The Movie Database (TMDB)**

## 📱 App Details

- **Current Version**: 1.5.2
- **Bundle ID (iOS)**: `com.tmrev`
- **Package Name (Android)**: `com.tmrev`
- **Supported Platforms**: iOS 14.0+, Android API 24+, Web

---

**Built with ❤️ using React Native and Expo**

*For questions or support, please open an issue on GitHub.*
