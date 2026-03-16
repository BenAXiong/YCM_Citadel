# YCM Citadel: AI Operating Manual

> [!IMPORTANT]
> This document is the "North Star" for all development within the YCM Citadel. The ASSISTANT must read and apply these principles to every task to ensure consistency, performance, and long-term maintainability.

## 🧪 UI Proactivity: The "Structural First" Rule
When addressing UI issues (overlaps, clipping, alignment), **never** start with additive "patches" like `z-index` or `padding` tuning. Instead, perform a **Structural Audit**.

### Mandatory Structural Audit:
1. **Stacking Context Audit**: Check if the overlapping elements are siblings or if they are trapped in different `flex` or `overflow` containers. 
2. **The "Unified Scroll" Principle**: For sidebars or panels with fixed headers, prefer a single scroll container with `sticky` positioning for the header. This ensures tooltips/popups share the same parent context and can overlap the header.
3. **Clip Check**: Before using `overflow: hidden` or `overflow: auto`, verify if children have absolute-positioned components (tooltips, definitions) that need to protrude beyond the parent.

## 🌲 Kilang Engine Architecture
The Kilang view uses a specialized **Deterministic Coordinate Engine**.
- **Standard**: Always use the pre-calculated `nodeMap` from `kilangUtils.ts` for positioning elements.
- **Anti-Pattern**: Avoid DOM-dependent measurements (`getBoundingClientRect`) or polling-based positioning.
- **Maintenance**: Ensure any layout changes are tested in both `KilangDesktopLayout` and `KilangMobileLayout`.

## 🔄 Paradigm Challenge & Evolution Protocol
Hard rules are there to prevent regression, not to block innovation.
- **Rule as Default**: Treat the rules above as the "Strong Default."
- **The "Exception" Flow**: If you encounter a feature request or technical limitation where the current rule causes friction, YOU MUST:
    1. Identify the friction point.
    2. Propose a **Paradigm Shift** (e.g., "The coordinate engine is becoming too complex for this radial layout; should we consider D3-Force?").
    3. If approved, update this manual once the new pattern is established to prevent future drift.

## 📱 Mobile-First Scaling
The Citadel is evolving toward a global mobile view.
- Always use the `useIsMobile` hook for breakpoint-aware layout switching.
- Ensure isolation: Modifications for mobile should ideally live in separate Layout components to keep the desktop version "bit-for-bit" identical.
