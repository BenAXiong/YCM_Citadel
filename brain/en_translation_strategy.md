# EN Translation Strategy: The Rosetta Pass

Our goal is to inject English (EN) into the Citadel to transform it into a trilingual (AB-ZH-EN) powerhouse. 

### 1. The Engine: Antigravity vs. Ollama
*   **Ollama (Local)**: Zero cost, 100% privacy. We use **Llama3.1 8B** or **Gemma2 9B**. Good for bulk, but may hallucinate in rare dialects.
*   **Antigravity (Gemini 1.5 Pro)**: High linguistic intelligence. Better for the "Deep-NLP Pass" where we need to understand the cultural nuance of the Aboriginal script.
*   **Recommendation**: Use **Ollama** for the first 80% of "easy" sentences. Use **Antigravity** for the "Syllabus Core" (Nine-Year) to ensure perfect educational fidelity.

### 2. The "Deep-NLP Pass"
This isn't just word-for-word swapping.
*   **Step A: Triple-Context Injection**: We feed the model `[AB text] + [ZH Meaning] + [Dialect/Source Context]`.
*   **Step B: Semantic Triangulation**: The model translates AB to EN, then cross-checks: Does the AB-to-EN match the ZH-to-EN? If not, flag for review.

### 3. Execution Scope
1.  **Phase Alpha**: The **Nine-Year Curriculum** (~15,000 unique souls). High priority for study tools.
2.  **Phase Beta**: **Grammar & Essay** (~20,000 souls). Essential for linguistic patterns.
3.  **Phase Gamma**: The **ILRDF Vocabulary** (Upcoming).
4.  **Phase Delta**: The remaining 100k "Data Lake" souls.

### 4. Technical Integration
*   New Column in `sentences`: `en_text`.
*   A dedicated script `core/en_translator.py` that batches queries to the selected engine.
