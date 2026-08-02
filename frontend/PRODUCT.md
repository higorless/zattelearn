# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user is the builder (Higor): a developer who starts programming courses but consistently stops partway through. He needs a system that keeps him studying, shows him how far he's gotten, and makes the accumulated knowledge feel real and worth protecting. Not a general audience — the tool is built to solve his own problem.

## Product Purpose

ZetteLearn is a personal study operating system for finishing programming courses. It closes the "start but never finish" loop by connecting planning (kanban), scheduling (weekly calendar), curriculum structure (subjects, topics, objectives), and knowledge retention (zettelkasten notes auto-generated from study sessions) into a single tool. Success means finishing more courses than before and being able to see the knowledge built along the way.

## Positioning

The one tool that turns a study session into a permanent record. Anki tracks cards; Notion tracks notes; Obsidian tracks links. ZetteLearn tracks the full arc — what to study, when to study it, that you actually studied it, and what you learned — without switching apps. The study-session → auto-generated Zettelkasten note pipeline is the mechanism no competing tool offers out of the box.

## Operating Context

Used at a desk, desktop browser, dark environment (long study sessions in low light). A solo productivity tool — no collaboration, no sharing, no multi-user state. The user opens it to plan a study day (kanban + calendar), works through a session, and expects the knowledge to be captured without extra effort (zettelkasten). Subjects map 1:1 to courses being studied.

## Capabilities and Constraints

- Four surfaces: Kanban board (task pipeline), Weekly calendar (drag-to-schedule), Subjects (course + topic + objective tracking), Zettelkasten (linked atomic notes)
- Kanban cards carry subject/topic associations and a `scheduledFor` date
- Study sessions are time-tracked; notes are generated automatically at session end
- All UI copy is in Portuguese (pt-BR) — no i18n, no English labels in the interface
- Desktop-first layout; mobile is not a target
- Dark mode is required — light mode exists but dark is the primary usage mode
- Backend API assumed at runtime (axios + React Query); no offline mode documented

## Brand Commitments

Name: **ZetteLearn** (displayed in sidebar as "ZetteLearn"). No logo asset on file yet. Geist Mono Variable is the committed typeface. No other brand commitments locked.

## Evidence on Hand

- Working frontend implementation: React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui + Redux Toolkit + React Query + Framer Motion + dnd-kit
- Neutral (achromatic) shadcn default color palette in place — no brand hue committed beyond destructive red
- Subject color is a per-subject configurable hex value used as an accent (border-left on calendar cards, colored dot on subject list)
- No testimonials, case studies, press coverage, or marketing copy exists — do not fabricate

## Product Principles

1. **Finishing is the metric.** Every surface should make it easier to pick up where you left off and harder to let a course quietly die.
2. **Progress must be visible.** At any moment the user should be able to see what he's working on, how far along he is, and what he has already learned.
3. **Sessions generate knowledge automatically.** The study loop closes itself — doing the work should produce the record, not require a separate documentation step.
4. **One OS, no switching.** Planning, scheduling, curriculum, and knowledge retention are one product. Any friction that pushes the user to another tool is a product failure.
5. **Dark, calm, focused.** The environment is a long study session at night. The design should reduce stimulation and support deep work.

## Accessibility & Inclusion

No formal accessibility standard required beyond standard browser defaults. Dark mode support is required as a functional feature (not optional theming).
