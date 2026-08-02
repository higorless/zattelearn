---
target: calendar + full app
total_score: 10
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-07-26T23-50-20Z
slug: src-features-calendar-calendarpage-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 1 | No feedback after card drops. Silent `catch {}` everywhere. Skeletons on load, nothing after write actions. |
| 2 | Match System / Real World | 2 | PT-BR copy is natural. "Kanban" untranslated. Month label capitalizes "De" incorrectly ("Julho De 2026"). |
| 3 | User Control and Freedom | 1 | No undo anywhere. No way to unschedule a card once all cards are scheduled (tray disappears). API failures silently revert state. |
| 4 | Consistency and Standards | 2 | Card visual language is consistent across Kanban and Calendar. Sidebar active state barely distinguishable from inactive. "Hoje" button misuses icon-size API. |
| 5 | Error Prevention | 0 | No guards on any action. `catch {}` swallows all errors. No confirmation on destructive moves. |
| 6 | Recognition Rather Than Recall | 1 | Core interaction (drag-to-schedule) has no affordance or discoverability cue. Tray cropped with no scroll indicator. |
| 7 | Flexibility and Efficiency of Use | 1 | Drag-only scheduling. No keyboard shortcuts. No filtering or sorting. "Iniciar sessão" button is dead (prop never passed). |
| 8 | Aesthetic and Minimalist Design | 2 | Minimal yes, but unintentionally so. ~70% of the calendar viewport is dead black space. The design achieved "empty" not "focused." |
| 9 | Error Recovery | 0 | No toast, no retry, no error boundary visible anywhere. Silent `catch {}` throughout. |
| 10 | Help and Documentation | 0 | Zero in-app guidance. No tooltip on drag interaction. No empty-state explanation of what to do. |
| **Total** | | **10/40** | **Critical — core flows broken** |

## Design Specificity Verdict

**Method: dual-agent (A: ab5b8beca52827d26 · B: acf2989dc18fa989c)**

**LLM assessment:** Rating 3/10. This could be any task manager. Strip the PT-BR copy and subject color accents and nothing says "personal study OS for finishing programming courses." The North Star "Focused Terminal / Vercel-monochromatic" exists in the color values (near-black canvas, Geist Variable) but not in the spatial, typographic, or interaction decisions. The subject color accent system — orange for Algoritmos, yellow for Matemática Discreta, green for Redes — is the single genuinely authored design decision in the product.

**Deterministic scan:** 2 findings, both `design-system-font-size` advisories in `CalendarPage.tsx` lines 80 and 135 (10px font for compact calendar card badges and "livre" ghost text). Line 135 is a likely false positive — intentional decorative de-emphasis. Line 80 is real: 10px badge text at 1440px is at the legibility boundary. No other files produced findings.

**Visual overlays:** Browser automation used for screenshots only; live injection was not performed. Findings confirmed visually: dead space in calendar grid, cropped unscheduled tray with no scroll affordance, near-invisible sidebar active state.

## Overall Impression

ZetteLearn has a sound architectural skeleton and one strong design move. Everything else is unfinished. The calendar is ugly because it has no visual substance in the middle 70% of the viewport — not because the concept is wrong. The kanban is broken for the user's most basic job: creating tasks. Error handling is completely absent. The product's core emotional promise — build the habit of finishing courses — has zero visual expression.

## What's Working

1. **Subject color accents as semantic signal.** The 3px colored left border on cards is genuinely elegant information design. At a glance, the user knows which course each task belongs to. It works consistently across Kanban and Calendar and is the strongest authored decision in the product.

2. **Drag-to-schedule mental model is sound.** A bottom tray of unscheduled cards you drag into day columns mirrors how someone would place sticky notes on a physical planner. The architecture is correct. The concept deserves a better visual execution.

3. **Framer Motion layout animations.** Card moves have physical weight. The `layoutId` nav indicator morphs between routes. These are subtle details that most boilerplate implementations skip.

## Priority Issues

**[P0] Create Card UI does not exist**
- **Why it matters:** The entire product is read-only. The user cannot add tasks. The kanban shows only server-seeded data. There is no `+` button, no form, no modal anywhere.
- **Fix:** Add a `+` button to the right of each column title in `KanbanColumn.tsx`. Wire it to a `Dialog`/`Sheet` with fields: title (required), description, subject (select), topic (select). POST to `/kanban/cards`. Also add a "+ Nova tarefa" shortcut in the Kanban page header.
- **Suggested command:** Build this directly — not a design command.

**[P0] Error handling is completely absent**
- **Why it matters:** Every `catch {}` in both `KanbanPage.tsx` and `CalendarPage.tsx` is empty. Drag a card to a day: if the API is down, the card snaps back with no message. The user cannot distinguish "saved" from "failed silently."
- **Fix:** Add a toast library (or use `console.error` temporarily). Replace all `catch {}` with `catch { toast.error('Erro ao salvar — tente novamente') }`. Apply to both pages.
- **Suggested command:** Code fix, not a design command.

**[P1] Calendar is visually empty and core interaction is undiscoverable**
- **Why it matters:** 70% of the calendar viewport is dead black space. The drag-to-schedule interaction has no affordance — no tooltip, no hint, no animated guide. The "livre" ghost text at 10px/40% opacity is functionally invisible. The unscheduled card tray is cropped at the right edge with no scroll indicator.
- **Fix:** (a) Add subtle column grid lines (`border-r border-border/30`) to give the day columns structural presence. (b) Make the `isOver` state on empty columns more dramatic: pulsing ring + "Solte aqui" label. (c) Fix tray scroll: add `overflow-x-auto` with a gradient fade on the right edge. (d) Add a persistent instruction on the tray: "Arraste para agendar."
- **Suggested command:** `/impeccable layout` then `/impeccable onboard`

**[P1] "Iniciar sessão" button is dead — the study session loop is broken**
- **Why it matters:** The hover action "Iniciar sessão" (Clock icon) on kanban cards never renders because `onStartSession` is never passed from `KanbanPage` → `KanbanColumnView` → `KanbanCardItem`. The entire study-session-to-Zettelkasten pipeline is unreachable from the UI.
- **Fix:** Either remove the button and the prop chain until the feature is ready, or wire up a session start handler (modal with timer). This is the product's most differentiating feature and it's invisible.
- **Suggested command:** Build this directly — missing feature, not a design command.

**[P2] No progress signals — the product cannot motivate finishing**
- **Why it matters:** PRODUCT.md says "Finishing is the metric." The "Concluído" column looks identical to "A Fazer." No streak. No weekly summary. No celebration. The UI passively mirrors state instead of reinforcing habit.
- **Fix:** (a) "Concluído" column header gets a green accent. (b) Moving a card there triggers a brief celebration (confetti or toast "Parabéns!"). (c) Calendar header shows "N tarefas agendadas esta semana." (d) Add a streak counter to the sidebar.
- **Suggested command:** `/impeccable delight`

## Persona Red Flags

**Alex (Power User):** No keyboard shortcuts. No filtering by subject. No bulk operations. "Iniciar sessão" on hover is motor-intensive for a repeated action. On a screen with 20+ cards, the kanban has no way to focus on one subject.

**Riley (Stress Tester):** Silent API failures everywhere. Kanban column has no `overflow-y-auto` — with 50 cards, content clips. Cross-month week math (`setDate`) is correct in JS but the month label only shows Monday's month, so a Dec 28–Jan 3 week shows "dezembro de 2026." The "Iniciar sessão" button always undefined — clicking it (if it somehow rendered) would throw.

**Higor (the actual user — project-specific):** The interface communicates emptiness, not possibility. An abandoned week of study looks identical to a planned one. The calendar's void is an accusation, not an invitation. There is no signal that "you studied 4 days last week" or "you haven't touched Redes de Computadores in 12 days." The product cannot build habit without feedback.

## Minor Observations

- "Julho De 2026" — CSS `capitalize` on a hyphenated locale string capitalizes "De" incorrectly. Should be "Julho de 2026."
- `setActiveCard` is dispatched to Redux store in KanbanPage but never read by any visible component. Dead write.
- `CalendarCardItem` is a near-duplicate of `KanbanCardItem` — share a base component with a `compact` prop.
- `getWeekDays` starting on Monday is correct for pt-BR; `DAY_NAMES` indexed from Sunday is also correct. But it's fragile coupling — a comment would help.

## Questions to Consider

- "What if scheduling a task also prompted starting a session right now — collapsing planning and execution into one gesture?"
- "What would the calendar look like if it showed yesterday's completed sessions alongside tomorrow's planned ones?"
- "Does 'Zettelkasten' need to be a top-level nav item if the user can't manually create notes there yet?"
