# Kilang Canvas & UI Stabilization: Architectural Revamp

This document chronicles the major stabilization and performance overhaul of the Kilang Canvas and its surrounding UI components.

## 1. The Core Performance Bottleneck: "The 223k Freeze"
The most critical issue identified was a complete UI lockup when selecting a root from the "Bloom" sidebar. 
- **Cause**: The application was attempting to render a list of 223,310 root entries into the DOM simultaneously. This blocked the main thread for several seconds, making the Sidebar and Header completely unresponsive.
- **Solution**: Implemented result-capping in `RootList.tsx`. The list is now limited to the first 100 entries via `filteredRoots.slice(0, 100)`. This restored the "Functional responsiveness" of the UI immediately.

## 2. The Navigation Engine: "Unified Camera System"
To support massive trees without sacrificing interaction speed, we moved to a **Decoupled Camera Engine**.

### The "Schizophrenic" State Conflict
Previously, the camera's coordinates (x, y, k) were stored in the global Redux-like context. Every single mouse movement (panning) triggered a full dashboard re-render, which was too slow.
- **Decoupling**: We introduced a local high-performance `cam` state in `KilangCanvas.tsx`.
- **Fails & Persistence**: Initially, the `ForestView` (the tree itself) would "freeze" while the minimap moved. This was due to a restrictive `React.memo` configuration that didn't watch the new local `cam` state. We updated the memoization to include the local camera as a dependency.
- **Final Sync**: To ensure persistence across tab resets, the local `cam` position is synchronized back to the global store only at the **end of a gesture** (on `pointerup`).

## 3. Interaction Refinement: "The Grab & The Wheel"

### Bulletproof Grab Panning
Traditional `onPointerMove` handlers on the canvas div were flaky because they lost capture if the mouse moved too fast or hovered over a child element like a node.
- **Solution**: Shifted to window-level listeners. `onPointerDown` now attaches temporary listeners to `window` for `pointermove` and `pointerup`. This ensures every pixel is tracked regardless of target identity or speed.

### Non-Passive Wheel Zooming
Browsers prioritize scrolling performance by making wheel listeners "passive", which prevents `e.preventDefault()`. This caused the browser to try and "Zoom the whole page" instead of just the canvas.
- **Solution**: Used a `React.useLayoutEffect` to manually attach a non-passive `wheel` event handler directly to the DOM element (`treeRef.current`).

## 4. UI Layout & Visibility

### The "Dropdown Clipper"
A mysterious failure in the "Engine Settings" dropdown was traced back to CSS clipping.
- **Issue**: The `div` wrapping the `KilangHeader` in `KilangDesktopLayout` had `overflow-hidden`. Since the dropdown is an `absolute top-full` child, it was being rendered but immediately clipped by its own parent.
- **Fix**: Removed `overflow-hidden` from the header container.

### Sidebar Height Integrity
The Sidebar was leaking its internal height to over 200,000 pixels, breaking the scroll behavior.
- **Fix**: Enforced `h-full` and `overflow-hidden` on the Sidebar's main `aside` container to contain the scrollable children.

---

## Technical Debt & Remaining Items
- **"Laggy" Gestures**: While the logic is now robust, the sheer number of absolute-positioned DOM nodes in a massive tree still stresses the browser's paint engine. Further improvements would require canvas virtualization or a Canvas/WebGL renderer.
- **Button Alignment**: The alignment of header control groups (Zoom, Layout) remains tight and may require further visual padding adjustments.
