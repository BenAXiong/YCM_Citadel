# Kilang Globalization & Color Migration Notes

This document captures the rationale and implementation details of the Kilang UI globalization and the subsequent theme engine rectification. It serves as a technical record for future maintenance.

## 🏗️ Architectural Overview

The Kilang UI uses a **Hybrid Theming Model**:
1.  **Globalized Shell**: The main Header, Sidebar, and UI Frames are reactive and linked to the Theme Engine (Core Palette).
2.  **Semantic Overlays**: Specific data-heavy views (Affixes & Stats Overlays) use a **Verbatim Semantic Palette** (e.g., Orange/Indigo/Fuchsia for morphological categories) to ensure data clarity and visual distinctiveness regardless of the global theme.

---

## 🛑 Major Technical Blockers & Solutions

During the globalization process, two critical "ghost" bugs were encountered that initially broke the responsiveness of the theme engine:

### 1. Tailwind Opacity Incompatibility (HEX Variables)
*   **Problem**: Tailwind's opacity modifier (e.g., `bg-[var(--kilang-primary)]/20`) fails silently when the CSS variable contains a HEX value (like `#3b82f6`). This caused most UI elements (BETA badge, search ring, etc.) to appear static.
*   **Fix**: All dynamic opacities in the shell components were refactored to use native CSS **`color-mix`**.
*   **Example**: `bg-[color-mix(in_srgb,var(--kilang-primary),transparent_80%)]`

### 2. CSS Variable Shadowing (Local Container Scope)
*   **Problem**: The `KilangView` root is a `div` with a `data-theme` attribute. The CSS blocks in `Kilang.css` (e.g., `[data-theme="kakarayan"]`) redefine core variables like `--kilang-primary` inside that scope.
*   **Result**: When the `ThemeBar` set a custom override on the **Root** (`documentElement`), the local `div` definition "shadowed" it, preventing children from seeing the global override.
*   **Fix**: The `ThemeBar` synchronization logic was updated to surgically apply overrides to **BOTH** the `documentElement` and any element carrying the `data-theme` attribute within the view.

---

## 🎨 Token Map (Globalized Elements)

The following tokens are now fully synchronized and react instantly to the **Core Palette** in the Theme Bar:

| Source Token | Targeted UI Elements | Fix Applied |
| :--- | :--- | :--- |
| `--kilang-primary` | BETA badge, Search ring, Sidebar active tabs, Logo glow. | `color-mix` Refactor |
| `--kilang-secondary` | "My Private Forest" button, Secondary highlights. | `color-mix` Refactor |
| `--kilang-tier-N` | Tree Nodes (Canvas). | Direct Link (No Opacity) |

---

## 📜 Verbatim Restoration Reference (Semantic Palette)

To preserve the complex data language of the Kilang engine, the following components were reverted from global variables to their **original hardcoded Tailwind classes**:

### Affixes Overlay
- **Header**: `bg-blue-600` (Logo), `text-blue-500` (Subtitle)
- **Categories**: `orange-400` (Infixes), `indigo-400` (Suffixes), `fuchsia-400` (Duplixies)
- **Modes**: `rose-400` (Strict), `blue-400` (Plus), `cyan-400` (Star)

### Stats Overlay
- **Gradients**: `from-indigo-400 via-blue-500 to-emerald-500` (Frequency Map)
- **Chains**: `text-indigo-400`, `bg-indigo-500/10`
- **Roots**: `text-emerald-400`, `bg-emerald-500/20`

*Documented for posterity by Antigravity on 2026-03-20.*
