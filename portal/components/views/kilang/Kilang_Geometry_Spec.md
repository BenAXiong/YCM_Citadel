# 📐 Kilang Geometry & Coordinate System Spec

This document defines the structural significance of the layers and indicators monitored in the `KilangDimensionsOverlay`. The system uses two distinct coordinate spaces: **Viewport (PX)** for layout monitoring and **Logical (World)** for tree positioning.

---

## 🏗️ 1. Layout Layers (Absolute PX)
Measured relative to the browser viewport. These help verify the "Hole" in the UI where the tree is visible.

| Element | UI Color | Significance |
| :--- | :--- | :--- |
| **HEADER** | Indigo | The global application header. Defines the top boundary of the workspace. |
| **SIDEBAR** | Amber | The navigation and configuration panel. Defines the left boundary on Desktop. |
| **MAIN** | Emerald | The **Workspace Container**. This is the physical pane to the right of the sidebar and below the header where the tree engine resides. |
| **WINDOW** | Red | The **View Portal**. This is the "Glass Panel" frame that acts as the window into the infinite canvas. Measurements here help verify padding and constraints. |

---

## 🌲 2. Logical World Space (Relative)
Calculated relative to the **Window** (Red) portal. These values determine what part of the infinite forest is currently being "captured" by the viewer.

| Element | UI Color | Significance |
| :--- | :--- | :--- |
| **CANVAS** | Blue | The **Logical World State**. A virtual 4000x4000px box where nodes are plotted. Its coordinates shift as you scroll. |
| **TREE** | Purple | The **Forest Extent**. The local bounding box of only the active nodes. Used by the "Fit to Screen" logic. |
| **ROOT** | Blue (Pulse) | The **Anchor Point**. The coordinate of the selected root node, around which the rest of the forest blooms. |

---

## 📊 3. Proportional & Metadata Indicators

- **VP (Viewport)**: The raw resolution of the browser window.
- **ASPECT**: The ratio of Width/Height. Used to debug layout shifts during window resizing.
- **SCALE**: The current zoom factor applied to the logical canvas. Note: Visual PX = Logical PX * Scale.
- **ALT + SCROLL ZOOM**: A high-efficiency interaction that allows zooming into specific nodes. It uses "Zoom to Cursor" logic, keeping the area under the mouse pointer stationary during scaling.
- **BLUEPRINT (Mini-map)**: A high-fidelity SVG reconstruction of the layout. It uses a `0.05x` scale factor to visualize the relationship between the stationary UI (Header/Sidebar) and the drifting world space.

---

## 🛠️ Internal Implementation
- **Selectors**: 
  - `Main`: `treeRef.current?.closest('main')`
  - `Window`: `treeRef.current?.closest('.kilang-glass-panel')`
- **Rule**: All Layout values must be queried via `getBoundingClientRect()` per update cycle, while World values are derived from the state-driven `viewPos`.
