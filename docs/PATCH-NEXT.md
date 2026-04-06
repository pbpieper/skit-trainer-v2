# Next Patch Update

## Backend: Local-First + Supabase Sync

Build backend from scratch with long-term vision. Follow Stino's SSV advice: Supabase for immediate backup and cross-device sync.

**Architecture:**
- Local-first: optimistic writes to localStorage (instant UX)
- Debounced sync: batch writes to Supabase (not on every keystroke/tap)
- Offline-capable: works without connection, syncs when available
- Service layer already abstracted — swap Local* → Supabase* implementations

**Schema:** See `docs/supabase-schema-reference.sql` (profiles, skits, progress, stars, goals, tasks, streaks, sessions)

---

## Features

### 1. Stars
- [x] Star/unstar renditions from skit switcher
- [ ] Starred skits surface first in library
- [ ] Star state synced to backend

### 2. Learning Goals
- [x] Set goal with target date (e.g., Wednesday)
- [x] Auto-generate actionable plan from deadline
- [ ] Goal state synced to backend
- [ ] Edit/adjust goal deadlines

### 3. Difficulty Categories
- [x] 4 categories: foundation → retrieval → integration → transfer
- [x] Progressive weight shifting based on timeline position
- [ ] Visual difficulty indicator per task

### 4. Daily To-Dos
- [x] Generated across categories for each day
- [x] Dependency chains between tasks (foundation unlocks retrieval, etc.)
- [ ] Interaction between to-dos (completing one affects others)
- [ ] To-do state synced to backend

### 5. Streaks
- [x] Per-rendition streak tracking
- [x] Accomplish all daily to-dos for streak
- [ ] Streak state synced to backend
- [ ] Visual streak celebration/indicator

### 6. Inline Tags
- [x] Tags visible within skit (not just library)
- [x] Add/remove tags inline
- [ ] Tags stored in backend (not just localStorage)
- [ ] Tag suggestions/autocomplete

### 7. Edit in Read Tab
- [x] Edit text content through selectable edit function
- [ ] Edit section TITLES (chunk labels) in read mode
- [ ] Edits debounced — not synced immediately on press

### 8. Backend Sync Layer
- [ ] Supabase client setup (auth + DB)
- [ ] SupabaseSkitService (implements ISkitService)
- [ ] SupabaseProgressService (implements IProgressService)
- [ ] SupabaseStarService (implements IStarService)
- [ ] SupabaseGoalService (implements IGoalService)
- [ ] SupabaseTaskService (implements ITaskService)
- [ ] Debounced write queue (batch mutations, retry on failure)
- [ ] Auth flow (sign-in/sign-up)
- [ ] Conflict resolution (last-write-wins or merge strategy)
