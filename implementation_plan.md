# Implementation Plan — Final
### Full Backend Integration, Zero Mock Data
### Workspace: `c:\Users\HP\Documents\oia-website\frontend`

---

## Verified State of All Overwritten Files

| File | After Replacement | Status |
|------|-------------------|--------|
| `admin/mou/[id]/page.tsx` | ✅ Has real `GET /api/v1/mous/{id}` fetch | **Fine — keep** |
| `admin/visits/[id]/page.tsx` | ❌ Uses `MOCK_VISITS_LIST` — API call **lost** | **Must restore** |
| `admin/submissions/page.tsx` | ✅ Has real `GET /api/v1/reviews` fetch | **Fine — keep** |

---

## Phase 0 — Restore Overwritten API Call (1 file) ⚠️ URGENT

#### [RESTORE] [admin/visits/[id]/page.tsx](file:///c:/Users/HP/Documents/oia-website/frontend/src/app/admin/visits/[id]/page.tsx)
- Currently uses `MOCK_VISITS_LIST` after replacement
- **Fix:** Add `useEffect` + `fetch` call to `GET /api/v1/visits/{id}` with `credentials: "include"`
- Map response fields: `id`, `visitor_name`, `institution`, `date`, `purpose`, `status`, `photos[]`

---

## Phase 1 — Upcoming Events Page Fix 🔴 HIGH PRIORITY

**Root cause confirmed:** Reference version uses static `MOCK_UPCOMING_EVENTS` (which renders correctly). Our workspace version has real API fetch but backend returns 0 events → blank page.

**Strategy:** Take the reference version's UI structure (correct, renders the carousel) and replace its static mock constant with our dynamic API fetch. No mock data in the final output — empty state handled with a styled "No events scheduled" UI if API returns empty.

#### [MODIFY] [UpcomingEventsCarousel.tsx](file:///c:/Users/HP/Documents/oia-website/frontend/src/app/events/upcoming/components/UpcomingEventsCarousel.tsx)
1. Copy the reference file (383 lines — correct working UI)
2. Remove `import { MOCK_UPCOMING_EVENTS }` and `const events = MOCK_UPCOMING_EVENTS`
3. Add `useState<any[]>([])` + `useEffect` fetch from `/api/v1/events?eventType=upcoming`
4. Map API response to match the shape of `UpcomingEvent` type
5. Replace `const NUM = events.length` with `const NUM = events.length` (dynamic)
6. Loading state: show spinner
7. Empty state: show styled "No upcoming events scheduled" section instead of plain text

#### [MODIFY] [MobileUpcoming.tsx](file:///c:/Users/HP/Documents/oia-website/frontend/src/app/events/upcoming/components/MobileUpcoming.tsx)
1. Copy the reference file (185 lines — correct working UI)
2. Same treatment: remove static mock, add `useState` + `useEffect` API fetch
3. Styled empty state if no events

---

## Phase 2 — Student Profile Components (Copy from reference — pure UI)

#### [COPY] [GlassCard.tsx](file:///c:/Users/HP/Documents/oia-website/frontend/src/app/student/profile/components/GlassCard.tsx)
- `useCallback` + `requestAnimationFrame` performance fix — no API calls involved

#### [COPY] [Sidebar.tsx](file:///c:/Users/HP/Documents/oia-website/frontend/src/app/student/profile/components/Sidebar.tsx)
#### [COPY] [ApplicationList.tsx](file:///c:/Users/HP/Documents/oia-website/frontend/src/app/student/profile/components/ApplicationList.tsx)
#### [COPY] [NotificationsPage.tsx](file:///c:/Users/HP/Documents/oia-website/frontend/src/app/student/profile/components/NotificationsPage.tsx)
#### [COPY] [ApplicationStatus/index.tsx](file:///c:/Users/HP/Documents/oia-website/frontend/src/app/student/profile/components/ApplicationStatus/index.tsx)

#### [MODIFY] [student/profile/page.tsx](file:///c:/Users/HP/Documents/oia-website/frontend/src/app/student/profile/page.tsx)
- Copy reference version layout (ambient orbs, background, structure)
- Replace `mockUser`, `mockStudentRecord`, `mockApplicationsList` with real API fetch to `GET /api/v1/applications/me`
- For `mockNotifications` — no backend endpoint exists yet → keep as static placeholder, mark `// TODO: GET /api/v1/notifications`

---

## Phase 3 — Programs Pages (Copy reference UI + keep existing API fetches)

> All 3 programs pages already have real API fetches in workspace. Copy the reference for UI, preserve the `fetch()` calls.

#### [MODIFY] [programs/other/page.tsx](file:///c:/Users/HP/Documents/oia-website/frontend/src/app/programs/other/page.tsx)
- UI from reference + keep `GET /api/v1/programs`

#### [MODIFY] [programs/other/[id]/page.tsx](file:///c:/Users/HP/Documents/oia-website/frontend/src/app/programs/other/[id]/page.tsx)
- UI from reference + keep `GET /api/v1/programs/{id}`

#### [MODIFY] [programs/other/[id]/apply/page.tsx](file:///c:/Users/HP/Documents/oia-website/frontend/src/app/programs/other/[id]/apply/page.tsx)
- UI from reference + keep `GET /api/v1/programs/{id}`

#### [COPY] [programs/other/components/DefaultApplicationForm.tsx](file:///c:/Users/HP/Documents/oia-website/frontend/src/app/programs/other/components/DefaultApplicationForm.tsx)
#### [COPY] [programs/other/components/ProgramsFooter.tsx](file:///c:/Users/HP/Documents/oia-website/frontend/src/app/programs/other/components/ProgramsFooter.tsx)

---

## Phase 4 — Events Past Page (Keep existing real API fetch)

#### [MODIFY] [events/past/page.tsx](file:///c:/Users/HP/Documents/oia-website/frontend/src/app/events/past/page.tsx)
- Already has real `GET /api/v1/events?eventType=past` — apply UI layout changes from reference on top
- Keep `credentials: "include"` and `cache: 'no-store'`

#### [COPY] Timeline sub-components (no direct API calls — data passed via props)
- `events/past/components/Timeline/DateScroller.tsx`
- `events/past/components/Timeline/MobileTimeline.tsx`
- `events/past/components/Timeline/PastTimeline.tsx`
- `events/past/components/Timeline/TimelineEvent.tsx`

#### [COPY] [events/upcoming/components/EventsFooter.tsx](file:///c:/Users/HP/Documents/oia-website/frontend/src/app/events/upcoming/components/EventsFooter.tsx)

---

## Phase 5 — IAS Pages (Copy from reference — pure UI)

#### [COPY] `ias/GlobeDark.tsx`, `ias/IASPageClient.tsx`, `ias/TimelineSection.tsx`, `ias/page.tsx`

---

## Phase 6 — Missing Admin Leads Page

#### [NEW] [admin/leads/page.tsx](file:///c:/Users/HP/Documents/oia-website/frontend/src/app/admin/leads/page.tsx)
- Nav link added in `admin/layout.tsx` but directory doesn't exist → 404
- Copy from reference
- **No backend endpoint yet** → static data, marked `// TODO: GET /api/v1/leads`

---

## Phase 7 — Files to Never Touch

| File | Reason |
|------|--------|
| `admin/roles/AuthContext.tsx` | Real Supabase OAuth + Azure MSAL |
| `lib/supabaseClient.ts` | Required by AuthContext |
| `complete-profile/page.tsx` | Full backend wiring confirmed ✅ |
| `admin/audit/page.tsx` | Real `GET /api/v1/audit` ✅ |
| `admin/visits/create/page.tsx` | Real `GET /api/v1/users` + events ✅ |
| `admin/mou/[id]/page.tsx` | Real `GET /api/v1/mous/{id}` ✅ |
| `admin/submissions/page.tsx` | Real `GET /api/v1/reviews` ✅ |

---

## Phase 8 — Mock Removal Pass (Backend Endpoints Exist)

After all file replacements, do one final sweep to remove remaining mock imports where a real endpoint exists:

| File | Mock to Remove | Replace With |
|------|---------------|--------------|
| `student/profile/page.tsx` | `mockUser`, `mockStudentRecord`, `mockApplicationsList` | `GET /api/v1/applications/me` |
| `events/upcoming/` components | `MOCK_UPCOMING_EVENTS` | `GET /api/v1/events?eventType=upcoming` |
| `admin/visits/[id]/page.tsx` | `MOCK_VISITS_LIST` | `GET /api/v1/visits/{id}` (Phase 0) |

**Mocks that stay** (no endpoint exists yet — marked with TODO):
| File | Mock | Reason |
|------|------|--------|
| `student/profile/mock-data.ts` | `mockNotifications` | No `/api/v1/notifications` endpoint |
| `team/TeamPageClient.tsx` | `TEAM_DATA` | No team management endpoint |
| `admin/leads/page.tsx` | leads array | No `/api/v1/leads` endpoint |

---

## Phase 9 — Cleanup

- Delete `src/app/changes_ref.txt` (temp analysis file)
- Confirm zero `.rej` files remain (done)

---

## Verification Plan

### Build
```bash
cd c:\Users\HP\Documents\oia-website\frontend
npm run build
```

### Route Verification

| Route | Expected Result |
|-------|----------------|
| `/events/upcoming` | Full carousel renders — poster, countdown, dial, thumbnail strip |
| `/events/past` | Timeline with real DB events |
| `/programs/other` | Programs list from API |
| `/student/profile` | Profile page with real application data |
| `/admin` | Icon sidebar, analytics |
| `/admin/leads` | Leads page — no 404 |
| `/admin/mou/[id]` | Real MOU data from API |
| `/admin/visits/[id]` | Real visit data from API |
| `/admin/visits/create` | Live dropdowns from API |
| `/admin/audit` | Real audit logs |
| `/admin/submissions` | Real review items |
| `/complete-profile` | Form submits to backend |
| `/ias` | Globe + timeline animations |
| `/team` | GSAP team member scroll |
