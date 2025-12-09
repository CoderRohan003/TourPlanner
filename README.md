# ✈️ Tour Planner Mobile App

A modern, cross-platform travel itinerary planner built using **React Native** and **Expo**, designed to simplify multi-day trip planning. The app allows users to organize destinations day-wise, track completed spots, calculate distances between locations, and manage plans with seamless on-device storage.

---

## ✨ Features

### **Day-Wise Itinerary**

Organize your trip efficiently with destinations grouped by each day for a clean, structured itinerary.

### **Real-Time Progress Tracking**

Check off destinations with intuitive checkboxes. Completed items automatically receive a strikethrough for easy visual tracking.

### **Distance Calculation**

Select *exactly two* destinations using circular selection buttons to instantly generate distance and route information via **Google Maps**.

### **Edit Mode**

Switch to Edit Mode to add, delete, rename destinations, or reassign them to different days—all within a smooth UI.

### **Persistent Storage**

Itinerary changes are saved locally using **AsyncStorage**, ensuring your data remains intact across app restarts.

### **Responsive UI**

Clean, modern design using a custom **Blue/Teal theme**, optimized for mobile screens.

---

## 🛠️ Technology Stack

* **Framework:** React Native (TypeScript)
* **Platform:** Expo
* **Styling:** React Native Stylesheet API
* **Storage:** @react-native-async-storage/async-storage
* **UI Enhancements:** expo-linear-gradient

---

## 🚀 Getting Started

Follow these steps to run the project locally:

### **Prerequisites**

* Node.js (LTS recommended)
* npm or Yarn
* Expo Go app (for mobile testing)

---

### **Installation**

Clone the repository:

```bash
git clone [YOUR_REPOSITORY_URL]
cd TourPlanner
```

Install dependencies:

```bash
npm install
npx expo install expo-linear-gradient @react-native-async-storage/async-storage
```

Run the application:

```bash
npx expo start
```

Scan the QR code in the terminal using **Expo Go** on your phone to launch the app.

---

## ⚙️ Configuration & Customization

### **App Entry File**

All logic and UI are contained in:
`app/index.tsx`

### **Changing the App Icon**

The app uses:

* **Adaptive Icons** (Android)
* **Standard Icons** (iOS)

Steps:

1. Place your icon inside the `assets/` folder (e.g., `my-custom-icon.png`).
2. Update `app.json`:

```json
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/my-custom-icon.png",
    "backgroundColor": "#14b8a6"
  }
},
"icon": "./assets/my-custom-icon.png"
```

> For Android: keep the main artwork within the center **66% area** to avoid cropping.

### **Editing the Default Destination List**

Modify the list at the top of `app/index.tsx`.

If testers should receive the *new* list, increment the `STORAGE_KEY` version
(e.g., `v3` → `v4`) to overwrite previously saved data.

---

## 📦 Building for Testing / Production (EAS)

Install EAS:

```bash
npm install -g eas-cli
```

Login:

```bash
eas login
```

### **Build Android APK (Preview/Test)**

```bash
eas build --profile preview --platform android
```

### **Build for iOS (TestFlight)**

```bash
eas build --profile preview --platform ios
```

> iOS builds require an Apple Developer account.

---

Enjoy planning your trips with **Tour Planner Mobile App**! 🎒🌍

---
