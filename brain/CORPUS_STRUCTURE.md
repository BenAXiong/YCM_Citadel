# Yincumin Citadel: Corpus Structure & Content Map

This document outlines the architecture, pedagogical focus, and data resolution of the corpora currently integrated into the YCM Central Database.

---

## 1. GRMPTS (Grammatical Structure)
*   **Source**: Grammatical structure and patterns module.
*   **Resolution**: Language Group (16 Primary Groups).
*   **Focus**: Sentence-level grammar drills focusing on syntactic patterns (active/passive voice, focus systems).
*   **Structure**: 
    - 2,000 sentences per major language group.
    - Systematic variations of core verbs and sentence types.
*   **Interactions**: Purely text-based drills.

## 2. ESSAY (Cultural Readings)
*   **Source**: Indigenous Language Essays (族語短文).
*   **Resolution**: Sub-Dialect (42+ Dialects).
*   **Focus**: Reading comprehension, cultural stories, and traditional ecological knowledge.
*   **Structure**:
    - Organized by "Topics" (e.g., Topic 32020: Family, Topic 32021: Nature).
    - Long-form dialogues and prose fragments.
*   - **Audio**: High coverage of studio-recorded reading audio.

## 3. TWELVE (Twelve-Year Curriculum)
*   **Source**: MOE Twelve-Year Basic Education platform.
*   **Resolution**: Dialect (42 Dialects).
*   **Focus**: Standardized school curriculum for grades 1-12.
*   **Structure**:
    - **Levels**: 1-12 (Primary to Senior High).
    - **Lessons**: Fixed count per level (typically 10-20 lessons).
    - Contains: Vocabulary, Phrases, and Dialogues.
*   **Yield**: Comprehensive coverage of everyday nouns and basic conversational syntax.

## 4. NINE (Nine-Year Curriculum)
*   **Source**: Previous Nine-Year Primary Education corpus.
*   **Resolution**: Dialect (42 Dialects).
*   **Focus**: Foundational literacy for younger students.
*   **Structure**:
    - Organized in segments/episodes.
    - Wealth of word-to-sentence mapping metadata.
*   **Status**: Legacy data, used to fill gaps in contemporary word-frequency models.

## 5. ILRDF (Vocabulary Hub)
*   **Source**: Indigenous Languages Research and Development Foundation.
*   **Resolution**: Dialect (42 Dialects).
*   **Focus**: Lexicography and lexical variation.
*   **Content**: Primarily word-lists/definitions with some usage examples.
*   **Structure**: Interaction-heavy dictionary data.

## 6. DIALOGUE (Conversational Situations)
*   **Source**: Situational Dialogue module.
*   **Resolution**: Mixed (42 Dialects).
*   **Focus**: Practical, everyday communicative competence.
*   **Structure**:
    - Scenarios: Hospital, Market, School, Home.
    - Highly contextual sentence structures.

---

## Technical Summary Table

| Corpus | Data Type | Audio | Resolution | Hierarchy |
| :--- | :--- | :---: | :--- | :--- |
| **Grmpts** | Sentences | ❌ | Language Family | Linear Drills |
| **Essay** | Prose/Dialogue | ✅ | Dialect | Topic-based |
| **Twelve** | Pedagogy | ✅ | Dialect | Level > Lesson |
| **Nine** | Pedagogy | ✅ | Dialect | Segment-based |
| **ILRDF** | Lexicography | ✅ | Dialect | Word > Entry |
| **Dialogue**| Contextual | ✅ | Dialect | Scenario-based |
