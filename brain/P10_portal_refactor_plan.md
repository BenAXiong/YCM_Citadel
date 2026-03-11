# Phase 10: Portal Architecture Refactor (The Great Componentization)

## 🎯 Context & Objective
The `portal/app/page.tsx` file has ballooned into a classic "God Component" spanning over 1,400 lines of code. It currently manages global state, routing logic, multiple highly complex analytical views (VS-1, VS-2, VS-3, Raw DB), data fetching, modal overlays, localized event listeners, and styling all inside a single file. 

**Objective**: Modularize the Next.js/React frontend to improve maintainability, reduce cognitive load, enable unit testing, and clear the path for advanced features like React Context and the ILRDF Dictionary tooltips.

---

## 🏗️ Refactoring Plan & Blueprint

### 1. State Management & Hooks Extraction
*   **Methodology**: Isolate data fetching and window-based state into custom React Hooks.
*   **Targets**:
    *   `useClickOutside(ref, handler)`: Extract the repetitive native DOM event logic used to close dropdowns.
    *   `useLocalStorage(key, initialValue)`: Formalize the mechanism for persisting map UI choices and recent searches.
    *   `useRawDbQuery(params)` & `useCorpusQuery(params)`: Move `fetch("/api/...")` logic into reusable data-layer hooks.

### 2. View Component Separation (The "Modes")
*   **Methodology**: Split the monolithic `return ( ... )` block into dedicated Top-Level View Components.
*   **Targets**:
    *   `components/views/Vs1Matrix.tsx`: The side-by-side comparative table.
    *   `components/views/Vs2Heatmap.tsx`: Phonetic analysis grids.
    *   `components/views/Vs3EssayReader.tsx`: Paragraph breakdown text reader.
    *   `components/views/RawDbExplorer.tsx`: The SQL data table overlay.

### 3. UI Primitives & Atoms
*   **Methodology**: Identify deeply nested repetitive markup (like dropdowns, buttons, tooltips) and create pure generic components.
*   **Targets**:
    *   `components/ui/DropdownMenu.tsx`
    *   `components/ui/FilterPill.tsx`
    *   `components/ui/ModalOverlay.tsx`

### 4. Layout Abstraction
*   **Methodology**: Break out the persistent shells that surround the core content.
*   **Targets**:
    *   `components/layout/Sidebar.tsx`: The main navigation and glid selection columns.
    *   `components/layout/TopToolbar.tsx`: The mode selector (VS-1, VS-2, etc.).

### 5. Context Providers (Optional but Recommended)
*   **Methodology**: Avoid prop drilling (passing `glid`, `mode`, `selectedDialects` down 5 levels) by wrapping the application in a Global State Context.
*   **Targets**:
    *   `providers/CitadelStateProvider.tsx`

---

## 📋 Execution Checklist

- [x] **Step 1: Scaffolding**
  - Create the `components/views`, `components/ui`, `components/layout`, and `hooks` directories in `portal/`.
- [x] **Step 2: Hooks Migration**
  - Build `useClickOutside.ts` and `usePersistedState.ts` and replace inline `useEffect` calls in `page.tsx`.
- [x] **Step 3: Component Slicing**
  - Extract the Raw DB modal out of `page.tsx` first (since it's an overlay and highly decoupled).
  - Extract VS-1, VS-2, VS-3 into their respective files.
  - Extract Sidebar and TopToolbar.
- [x] **Step 4: Cleanup & Type Definitions**
  - Centralize all TypeScript interfaces (`Sentence`, `RawDbRow`, `DialectDef`) in a `types/index.ts` file instead of inline declarations.
- [x] **Step 5: Testing & Verification**
  - Confirm that map clicks, dropdowns, mode switching, and data fetching operate identically to the legacy monolith.
- [x] **Step 6: Dictionary System Implementation**
  - Launch `DICT` mode with full architectural separation (VsDictView, VsDictToolbar).
  - Implement Strict/Global filtering logic and contextual harvesting.
