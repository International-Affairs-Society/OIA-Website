# Frontend Optimization Plan — Final Approved Version

**Target:** TTFB < 100ms, smooth 60fps on i3 / 4GB RAM, Lighthouse Performance > 90

---

## Phase 1: Images

### 1.1 Enable Next.js Image Optimization
Remove `unoptimized: true` from `next.config.ts`. Install `sharp` for production builds.

### 1.2 Compress Static Homepage Assets
Convert large images in `public/homepage assets/` to optimized WebP. Delete 12MB test image.

### 1.3 Add Upload Size Limit in Admin
Add client-side file size check (max 500KB) on image upload fields in event create pages.

### 1.4 Lazy Load Partner Logos
Wrap 23 logo images in IntersectionObserver. Add `loading="lazy"` and explicit dimensions.

---

## Phase 2: Fonts

### 2.1 Subset GmarketSans to Latin Only
Strip CJK glyphs. Each weight drops from ~850KB → ~30KB. Zero visual change.

### 2.2 Delete Unused & Duplicate Font Files
- Delete `Atavian-REGULAR.otf` (duplicate)
- Delete `gaston Honey.otf` (unused)
- Delete `fonnts.com-tan-pearl.otf` (unused)

---

## Phase 3: GPU Effects — Device-Adaptive Rendering

### 3.1 Create `useDeviceTier()` Hook
Detects device capability via browser APIs:
- `navigator.hardwareConcurrency` (cores)
- `navigator.deviceMemory` (RAM)
- WebGL renderer string (GPU model)

| Tier | Spec |
|------|------|
| Low | ≤4 cores OR ≤4GB RAM OR Intel HD/UHD |
| Mid | 4-6 cores, 8GB RAM, Intel Iris/AMD Vega |
| High | >6 cores OR >8GB OR discrete GPU |

**Mid and High have nearly identical settings** — only Low gets reduced effects.

### 3.2 Gate SplashCursor by Device Tier
- **Low:** CSS gradient fallback (zero GPU)
- **Mid/High:** Full quality SplashCursor

### 3.3 Optimize Globe (No Visual Changes)
- Lazy-load Three.js (dynamic import)
- Reduce arcs on low-end (15 → 5)
- Cap `devicePixelRatio` on low-end to 1

---

## Phase 4: Runtime Performance

### 4.1 Lenis Lightweight Mode on Low-End
Smooth scroll stays on ALL devices. Low-end gets lighter config:
- `lerp: 0.15` (was 0.08)
- `syncTouch: false`
- Native `requestAnimationFrame` instead of GSAP ticker

### 4.2 Shared `useWindowSize()` Hook
Single debounced resize listener replacing 6+ individual ones.

---

## Phase 5: TTFB < 100ms

### 5.1 ISR for Homepage
`revalidate = 300` (5 min). Events section already fetches client-side so always fresh.

### 5.2 Caching Headers + DNS Prefetch
Aggressive cache for fonts/static assets. Preconnect to external origins.

---

## Phase 6: Admin Optimization

### 6.1 Dynamic Import Recharts & D3
Wrap chart components in `next/dynamic` in admin/page.tsx.

### 6.2 Image Upload Size Limit
Add 500KB max file size validation on event create pages.

---

## Phase 7: Monitoring
- Bundle analyzer (`@next/bundle-analyzer`)
- Web Vitals (`reportWebVitals`)

---

## NOT Doing (Per User Decision)
- CrackedEarth static texture — keeping live SVG filter
- Animation library consolidation — keeping framer-motion & motion for now
- Plasma.tsx changes — user redesigning this section
