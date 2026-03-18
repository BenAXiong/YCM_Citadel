# 🗿 Amis (Pangcah) Morphology: The Affix Engine

Amis is a highly agglutinative language. Words are transformed through an elaborate system of prefixes, suffixes, and infixes that determine the "Focus" (which part of the sentence is being emphasized).

## 1. The Anatomy of a Word
| Component | Function | Examples |
| :--- | :--- | :--- |
| **Root** | Core Meaning | `'orip` (Life), `radiw` (Song), `tikid` (Cup) |
| **Prefix** | Mood/Focus/Intent | `ma-`, `mi-`, `pa-`, `saka-`, `kasa-` |
| **Infix** | Aspect/Tense | `-in-` (Perfective), `-um-` (Actor Focus) |
| **Suffix** | Location/Derivation | `-ay`, `-an`, `-en` |

## 2. Common Transformations (Root: `'orip`)
*   **`ma'orip`**: Stative - "To be alive / To live"
*   **`pa'orip`**: Causative - "To cause to live / To save" (Prefix `pa-`)
*   **`saka'orip`**: Instrumental - "The means of living / Food" (Prefix `saka-`)
*   **`ka'oripan`**: Locative - "The place/time of living" (Suffix `-an`)
*   **`mao'ripay`**: Linked - "The one who lives / The living" (Suffix `-ay`)

## 3. Reduplication Patterns
Amis uses partial or full reduplication for intensity or plurality:
*   **`roma`** (Other) -> **`romaroma`** (Every kind of other).
*   **`tamtamdaw`** (Humans/People) from root `tamdaw` (Person).

## 4. The `MOE` Hyper-Token Syntax
The MOE dictionary uses `` `...~ `` to mark links. This system is **morphology-aware**:
*   **Targeted Link**: `mao'rip` + `` `ay~ ``
    *   Here, only the **`ay`** marker is linked.
*   **Root Hidden Link**: `ma` + `` `'orip~ `` + `ay`
    *   The user sees `ma'oripay` but the dictionary hyperlink points to the root **`'orip`**.

## 5. Token-Level Marking Origins (Archaeology)
Our investigation of the `g0v/amis-moedict` source code reveals that these markers are generated via a specialized build script: **`autolink.js`**.

### The Mechanism:
1.  **Vocabulary Dictionary**: The script loads the entire dictionary index (e.g., `dict-amis-safolu.json`).
2.  **Regex Generation**: it generates massive regular expression pools based on headword lengths.
3.  **Recursive Markup**: It scans every definition and example sentence. If it finds a substring that matches a known headword, it wraps it in `` `...~ `` markers.
4.  **Escaping**: The markers themselves are technically escaped strings: `return escape("\`" + it + "~");`

### Transferability:
This system is highly transferable. By running a similar "Autolink" pass over our **VS-1/VS-2** sentence corpus using the **Sovereign ILRDF Vocabulary**, we can turn any static sentence into an interactive, clickable grammar map.

---

## 🪵 Maintenance & Logs
- [**`KILANG_ENGINE.md`**](KILANG_ENGINE.md): Detailed technical arch of the Weaver (Morph Engine).
- [**`PSEUDO_ROOTS_LOG.md`**](../PSEUDO_ROOTS_LOG.md): Case studies of dictionary chain breaks.
