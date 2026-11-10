---
target: liquid-glass todo app UI
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:C:\\Users\\kizif\\Documents\\MyProjects\\habr\\ts-vue-app\\tsvue-todo-app\\src\\assets\\css\\main.css"
target_fingerprint: "sha256:07e5d1bdb48d6b1ebf526fdd3e9000e9efb0c9e49d08db6e9d302a2d7a83fd99"
target_path: "C:\\Users\\kizif\\Documents\\MyProjects\\habr\\ts-vue-app\\tsvue-todo-app\\src\\assets\\css\\main.css"
timestamp: 2026-11-10T10-25-20Z
slug: src-assets-css-main-css
---
⚠️ DEGRADED: single-context (sub-agents not spawned: the session forbids spawning agents unless the user asks; design review was completed before the detector ran)

Target: liquid-glass todo app (src/assets/css/main.css + Vue components). Mode: Operate.
Scores describe the UI as found, before the border reduction applied in the same session.

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | No tab is active while editing a saved note |
| 2 | Match System / Real World | 3 | Solid |
| 3 | User Control and Freedom | 3 | Deleting a note cannot be undone |
| 4 | Consistency and Standards | 3 | "Confirm" in one delete dialog, "Delete" in the other |
| 5 | Error Prevention | 3 | A draft is lost if the tab is closed |
| 6 | Recognition Rather Than Recall | 3 | Solid |
| 7 | Flexibility and Efficiency | 2 | Enter does not start the next todo; no Ctrl+Z |
| 8 | Aesthetic and Minimalist Design | 2 | About 23 outlines on the editor screen; every control same weight |
| 9 | Error Recovery | 2 | A dead note link redirects silently |
| 10 | Help and Documentation | 2 | Placeholders only |
| **Total** | | **26/40** | **Acceptable** |

## Design Specificity Verdict

LLM assessment: the palette (petrol, lagoon, coral, periwinkle), Bricolage Grotesque and the sliding nav droplet are authored choices. The control layer was generic: every button, row and field was the same outlined pill, three outlines deep (sheet > row > button).

Deterministic scan: 2 advisory findings, both `bounce-easing` in main.css (the `--spring` curve, line 43, and its use in the checkbox animation). No other findings. Browser overlay not run: no browser automation tool; headless screenshots used instead.

## Priority Issues

- [P1] Outline overload. Editor showed ~23 outlines (sheet, 4 rows, 8 row buttons, 4 checkboxes, 2 undo/redo, add, divider, 3 actions). FIXED in session: 2 border rules remain (glass sheet edge, checkbox ring); secondary actions became text buttons.
- [P2] Redundant row controls. Each todo has Edit although its text is already a click-to-edit button; "Delete" appears five times on one screen. Fix: drop Edit, make row delete an icon button. Command: /impeccable distill
- [P2] Overshoot easing on eight transitions (buttons, checkbox, modal, cards, nav). Fix: keep it only on the nav droplet, ease-out elsewhere. Command: /impeccable animate
- [P2] Keyboard flow for writing a list. Enter closes the field instead of starting the next todo; Undo has no Ctrl+Z. Command: /impeccable harden
- [P3] Unicode glyphs as icons (↶ ↷ × +). Fix: one SVG icon set. Command: /impeccable polish

## Persona Red Flags

Alex (power user): a five-item list takes 15 actions (Add, click text, type) x5; no Ctrl+Z; Enter does not chain.
Casey (mobile): a draft is not kept if the tab is discarded mid-note; mobile layout unverified on a device.
Sam (keyboard / screen reader): focus is not moved to the new view after navigation.

## Minor Observations

- Empty new note leaves a gap where the list will be.
- No tab is highlighted on the edit route.
- "Confirm" vs "Delete" in the two delete dialogs.
