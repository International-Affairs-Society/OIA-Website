// ═══════════════════════════════════════════════
//  Skeleton Loaders – YouTube-style shimmer
//  Drop-in replacements for "Loading..." text
// ═══════════════════════════════════════════════

// ─── Primitives ───
export { default as SkeletonPulse } from "./SkeletonPulse";

// ─── Atomic Skeletons (match admin components 1-to-1) ───
export { default as SkeletonPageHeader } from "./SkeletonPageHeader";
export { default as SkeletonTable } from "./SkeletonTable";
export { default as SkeletonStatCard } from "./SkeletonStatCard";
export { default as SkeletonChart } from "./SkeletonChart";
export { default as SkeletonFormField } from "./SkeletonFormField";
export { default as SkeletonFilterBar } from "./SkeletonFilterBar";

// ─── Composite Page Skeletons (drop-in full pages) ───
export { default as AdminPageSkeleton } from "./AdminPageSkeleton";
export { default as AdminDashboardSkeleton } from "./AdminDashboardSkeleton";
export { default as AdminFormSkeleton } from "./AdminFormSkeleton";
