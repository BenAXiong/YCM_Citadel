# 🧠 Morphological Logic: Mode Significations (MoE vs. + vs. *)

This document details the deep technical and linguistic logic behind the three morphology toggles in the Kilang engine. These modes determine how the system constructs the "Forest" (the hierarchical tree) from the base `moe_entries` dataset.

---

## 🏛️ 1. MoE Mode (Strict / Authoritative)
**Table**: `moe_hierarchy_moe`  | **UI Label**: `MoE` (Indigo/Red/Yellow)

### The Philosophy
**"Trust only the Authoritative Source."** This mode is a 1:1 reproduction of the official `amis-moedict` morphological links. It represents the "Gold Standard" of documented linguistic relationships.

### The Logic
- **Stems**: Only the `stem` column in the database is used to define parents.
- **Rules**: 
    - No heuristics or substring matching.
    - If a word lacks a defined stem in the original dictionary, it remains an isolated root.
    - Resulting trees are **Sparse but Solid**.
- **Use Case**: Best for academic verification or when absolute linguistic certainty is required.

---

## 🏗️ 2. + Mode (Standard / Heuristic)
**Table**: `moe_hierarchy_plus` | **UI Label**: `+` (Blue) | **Default**

### The Philosophy
**"Bridge the Documented Gaps."** Realizing that many related words are missing official stem pointers in the source data, the `Plus` mode uses a **Lexical Priority Engine** to infer relationships.

### The Logic
- **Priority 1**: Inherit all official links from the MoE mode.
- **Priority 2 (Substring Logic)**: If no official stem exists, look for the **longest internal word** that already exists in the dictionary.
- **Safety Guards (Pseudo-Root Protection)**:
    - Longest-match must be `> 3` characters.
    - Short matches (`<= 3`) are only accepted if the candidate is an **Official Stem** and appears as a **Prefix**.
- **Result**: Highly connected "Dense Forests" that reveal broad semantic clusters.
- **Use Case**: Standard research, pattern discovery, and exploring word families.

---

## ✨ 3. * Mode (Experimental / Future)
**Table**: `moe_hierarchy_star` | **UI Label**: `*` (Cyan)

### The Philosophy
**"Crossing the Drift."** This mode is intended for **Dialectal Triangulation** and extreme morphological drift.

### The Logic
- **Current State**: A technical clone of the `Plus` mode to ensure structural parity in the UI.
- **In-Progress Spec**:
    - **Phonetic Law Matching**: Linking words across `u/o` or `q/h` drift laws (e.g., linking `to'as` and `tu'as`).
    - **Cross-Source Fusion**: Aggregating roots from disparate sources that the official dictionary treats as distinct.
- **Use Case**: Advanced dialectal studies and experimental linguistic reconstruction.

---

## 🔄 Relationship Summary

| Feature | MoE (Strict) | + (Plus) | * (Star) |
| :--- | :--- | :--- | :--- |
| **Connectivity** | Low (Isolated) | High (Bridges) | High (Bridges) |
| **Confidence** | absolute (Official) | High (Heuristic) | Experimental |
| **Source** | `stem` column | Substring Match | Phonetic Law (Future) |
| **Engine** | `moe_builder_strict.js` | `moe_builder_plus.js` | `moe_builder_star.js` |
