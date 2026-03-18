# 🍃 Kilang Landing Versions Guide

This document serves as the technical and design reference for the **Kilang Landing Experience**. It defines how the various versions (V1, V2, V3) are structured, how they are selected at initialization, and the terminology used for their aesthetic components.

---

## 🏗️ Architecture: Where it Lives

The landing system is split across three layers of the application:

1.  **Component Layer**: [KilangLanding.tsx](file:///c:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/portal/components/views/kilang/components/KilangLanding.tsx)
    - Contains the actual JSX/TSX for rendering each version.
    - Uses a `version` prop to switch between the three UI states.
    - Manages the complex animations (Pulse, Glow, Floating) and the "Atmospheric" background logic.

2.  **State Layer**: [kilangReducer.ts](file:///c:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/portal/components/views/kilang/kilangReducer.ts)
    - Defines the `landingVersion` state (1 | 2 | 3).
    - Holds the `initialState` which determines the "hardcoded" default for the entire app.
    - Stores `logoSettings` and `logoStyles` unique to each version.

3.  **Persistence & Logic Hook**: [useKilang.ts](file:///c:/Users/Ben/Documents/LL/6_ycm/YCM_Citadel/portal/components/views/kilang/useKilang.ts)
    - Handles the **Responsive Initialization** logic.
    - Orchestrates the transition from "Waiting" to "Locked-In" for either Mobile or Desktop users.

---

## ⚙️ How to Switch the Default

### **1. The Responsive Default (New Users)**
The application uses a **Responsive Detection Strategy** to ensure the best first impression. This logic is located in the `useEffect` inside `useKilang.ts`.

- **Mobile Default (V1)**: If a user visits on a screen narrower than **1024px**, the app dispatches Version 1.
- **Desktop Default (V2)**: If the screen is larger, Version 2 is selected.

> [!NOTE] 
> This only applies if the user has **no saved session**. If someone (including developers) manually toggles a version in the Dev Tools, that choice is saved to `localStorage` and will override the responsive default on the next visit.

### **2. Hardcoded Global Default**
To change the fallback version that appears before the responsive logic kicks in, update the `initialState` in `kilangReducer.ts`:
```typescript
export const initialState: KilangState = {
  landingVersion: 2, // <--- Change this (1, 2, or 3)
  // ...
};
```

---

## 🎨 Terminology & Aesthetics

Each version follows a specific "Atmosphere" and structural logic:

### **Version 1: "The Pristine Original"**
- **Focus**: Centered branding, high-visibility logo.
- **Vibe**: Clean, minimalist, and peaceful. 
- **Animation**: "Peaceful Float" (A subtle vertical bobbing effect).
- **Background**: Subtle carbon fiber texture at ultra-low opacity.

### **Version 2: "The Immersive Lexicon"**
- **Focus**: The logo as an environmental layer.
- **Vibe**: "Modern Noir." The logo is massive and semi-transparent in the background.
- **Structure**: Title is absolutely positioned at `top-[35%]`.
- **Contrast**: High-clarity typography with thin, uppercase weights.

### **Version 3: "The Architectural Core"**
- **Focus**: Structural depth and "Techno-Organic" energy.
- **Vibe**: "Blade Runner" / "Cinematic Infrastructure."
- **Key Elements**:
    - **The Pillars**: Two massive logo slices framing the screen edges.
    - **The 'X' Geometry**: An architectural blue frame behind the title.
    - **The Atmospheric Fog**: Slowly drifting colored orbs (`#7b8e45`, `#d39a47`, `#a04a44`) at 10% opacity.
    - **The Glow Cycle**: A 4-second pulse that drives the central "Energy Disc."
    - **CRT Scanlines**: A thin, repeating-linear-gradient grid overlaying the background.

---

## 🛠️ Developer Checklist
- **Adding a new Version**: Create a new `if (version === N)` block in `KilangLanding.tsx` and increment the `initialState` types in the reducer.
- **Resetting Settings**: Use the **"Reset Settings"** button in the Theme Bar (while in dev mode) to clear `localStorage` and trigger a fresh responsive detection.
- **Hiding Scrollbars**: Use the **`.no-scrollbar`** utility on any container that needs to scroll without native UI interference (configured in `globals.css`).
