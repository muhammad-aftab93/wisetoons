# WiseToons for Kids (`@WiseToons_for_Kids`)

A kid-safe, COPPA-compliant, and YouTube API Services ToS-compliant cross-platform mobile and web application built with **React Native (Expo + TypeScript)** for the official [**WiseToons for Kids**](https://www.youtube.com/@WiseToons_for_Kids) YouTube channel.

---

## ✨ Key Features

- **Live YouTube Data API v3 Integration**:
  - Dynamically resolves the `@WiseToons_for_Kids` channel (`UCjg4bYwHHGwrHpGYXxSZGRA`), official channel avatar, uploads playlist (`UU...`), long-form **Videos** (`UULF...`), **Shorts** (`UUSH...`), and all public channel **Playlists** (e.g., *Rhymes*, *Little Owl Ollie Bedtime Stories & Moral Tales for Kids*).
  - Batches `/youtube/v3/videos` requests (`snippet`, `contentDetails`, `statistics`) to parse ISO-8601 durations, view counts, descriptions, and high-resolution thumbnails.
  - Falls back gracefully to a cached or offline catalog if the device loses connectivity.
- **Commercial Kids UI & Theme System**:
  - **Playtime (Day)** & **Bedtime (Night)** high-contrast themes designed for young learners (`Fredoka` rounded typography, large touch targets, Google `MaterialIcons` & `Ionicons`).
  - **Responsive Grid & Detail List Toggle**: Displays 3–4 video cards per row in `Cards` (`grid`) mode or a detailed horizontal layout in `List` (`list`) mode.
- **Strict YouTube Player Compliance (`VideoTheaterScreen`)**:
  - **Zero-Pixel Overlay Policy**: The 16:9 YouTube player (`react-native-youtube-iframe` on iOS/Android, official YouTube IFrame API on Web) sits inside an unobstructed viewport with `0px` overlap from custom UI controls.
  - **Automatic Playback Pause**: Immediately pauses video playback when the app moves to the background, loses navigation focus, or opens the Parental Gate or Bedtime Sleep modal.
- **COPPA & Families Policy Safeguards**:
  - **Parental Gate (`ParentalGateModal`)**: Randomized multiplication challenge required before accessing parent settings or opening any external link (`https://www.youtube.com/@WiseToons_for_Kids`).
  - **Bedtime Sleep Timer (`ParentDashboardScreen` & `SleepOverlayModal`)**: Configurable `15 min`, `30 min`, `45 min`, or `Off` sleep timer with a full-screen "Time for Sleep!" overlay featuring Little Owl Ollie.
  - **Zero PII / Local-Only Persistence (`storageService.ts`)**: All user preferences (theme mode, card/list view mode, active category/playlist, sleep timer) and starred videos are persisted strictly on-device via `@react-native-async-storage/async-storage`.

---

## 📁 Project Structure

```text
wisetoons/
├── App.tsx                         # Root provider, Fredoka font loader, and Navigation stack
├── app.json                        # Expo app config, bundle IDs, and iOS/Android channel icons
├── assets/                         # Official @WiseToons_for_Kids app icons & splash graphics
│   ├── icon.png                    # 1024×1024 iOS & main app icon
│   ├── android-icon-foreground.png # 1024×1024 circular-masked Android Adaptive Icon foreground
│   ├── splash-icon.png             # 1024×1024 splash icon
│   └── favicon.png                 # 64×64 Web favicon
└── src/
    ├── components/
    │   ├── Ollie.tsx               # Animated Little Owl Ollie vector mascot component
    │   ├── ParentalGateModal.tsx   # Randomized math gate protecting parent/external actions
    │   ├── SleepOverlayModal.tsx   # Full-screen bedtime lock overlay when sleep timer expires
    │   ├── VideoCard.tsx           # Responsive Grid/List video cards, skeletons, and ViewModeToggle
    │   ├── YouTubePlayer.tsx       # Native iOS/Android 16:9 YouTube player wrapper
    │   └── YouTubePlayer.web.tsx   # Web HTML5 YouTube IFrame API wrapper
    ├── context/
    │   └── AppContext.tsx          # Global state, initial hydration, persistence, and sleep timer loop
    ├── data/
    │   ├── videos.ts               # Domain types (WiseToonVideo, CatalogSection, Catalog) & offline fallback
    │   └── youtube.ts              # Catalog loader bridging YouTubeApiService and StorageService
    ├── navigation/
    │   └── types.ts                # Strongly typed React Navigation stack params
    ├── screens/
    │   ├── SplashScreen.tsx        # Animated starry splash screen with progress bar & channel badge
    │   ├── HomeHubScreen.tsx       # Main discovery screen with channel header, playlist tiles & grid/list
    │   ├── VideoTheaterScreen.tsx  # 16:9 compliant theater player + recommended videos list
    │   ├── LocalFavoritesScreen.tsx# On-device starred videos library ("My Starred Toons")
    │   └── ParentDashboardScreen.tsx# Gated parent controls (sleep timer, theme, clear stars, channel link)
    ├── services/
    │   ├── youtubeApiService.ts    # Google / YouTube Data API v3 client
    │   └── storageService.ts       # Local AsyncStorage persistence for settings, favorites & catalog cache
    └── theme/
        └── theme.ts                # Playtime (Day) & Bedtime (Night) palettes, spacing, and typography
```

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js** `>= 18.x`
- **npm** or **yarn**
- **Expo Go** app on your iOS/Android device (or Android Studio / Xcode simulator)

### 2. Install Dependencies

```bash
cd wisetoons
npm install
```

### 3. Configure YouTube Data API v3 Key

Create or update `.env.local` in the `wisetoons/` directory with your Google Cloud **YouTube Data API v3** key:

```env
EXPO_PUBLIC_YOUTUBE_API_KEY=YOUR_YOUTUBE_DATA_API_V3_KEY
EXPO_PUBLIC_YOUTUBE_CHANNEL_ID=UCjg4bYwHHGwrHpGYXxSZGRA
EXPO_PUBLIC_YOUTUBE_HANDLE=@WiseToons_for_Kids
```

> **Note:** Ensure **YouTube Data API v3** is enabled in your [Google Cloud Console](https://console.cloud.google.com/apis/library/youtube.googleapis.com).

### 4. Run the App

```bash
# Start Expo Dev Server
npm start

# Launch on Web
npm run web

# Launch on Android Emulator / Device
npm run android

# Launch on iOS Simulator / Device (macOS)
npm run ios
```

---

## 💾 Local Persistence Keys (`AsyncStorage`)

All user state is saved automatically on-device via [`src/services/storageService.ts`](./src/services/storageService.ts) and restored on app startup:

| Storage Key | Purpose |
| :--- | :--- |
| `@wisetoons_settings_v1` | Persists `themeMode` (`day` / `night`), `viewMode` (`grid` / `list`), `selectedSectionId`, `sleepMinutes`, and active `sleepEndAt` timestamp. |
| `@wisetoons_favorites` | Persists the ordered list of starred `videoId`s. |
| `@wisetoons_favorite_videos_v1` | Persists full `WiseToonVideo` metadata for starred videos so favorites render immediately even offline. |
| `@wisetoons_catalog_v4` | Caches the latest YouTube Data API v3 catalog (`videos`, `sections`, `channelLogoUrl`) for 30 minutes and offline fallback. |

---

## 🛡️ Compliance & Safety Summary

1. **YouTube API Services Terms of Service**:
   - Uses the official YouTube IFrame Player with `rel=0`, `iv_load_policy=3`, and `playsinline=1`.
   - Zero custom views, gradients, or buttons overlap the 16:9 player container (`VideoTheaterScreen.tsx`).
   - Automatically pauses playback whenever the player is backgrounded, covered by a modal, or unfocused.
2. **COPPA / Google Play Families & Apple Kids Category**:
   - No user accounts, no behavioral analytics, no third-party ad SDKs, and no personal data collection.
   - All external navigation and parent settings are protected behind `ParentalGateModal`.

