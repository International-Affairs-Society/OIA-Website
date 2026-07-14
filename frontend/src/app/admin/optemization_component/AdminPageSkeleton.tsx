"use client";
import React from "react";
import SkeletonPageHeader from "./SkeletonPageHeader";
import SkeletonFilterBar from "./SkeletonFilterBar";
import SkeletonTable from "./SkeletonTable";

/**
 * AdminPageSkeleton
 *
 * Drop-in skeleton for any admin list page (Programs, Events, MOUs, etc.).
 * Renders: PageHeader → FilterBar → Table.
 *
 * Usage:
 *   if (isLoading) return <AdminPageSkeleton />;
 *
 * @param columns     — table column count (default 5)
 * @param rows        — table row count (default 6)
 * @param showFilter  — whether to show filter bar (default true)
 * @param showAction  — whether to show action button in header (default true)
 * @param filterCount — number of filter dropdowns (default 2)
 */

export interface AdminPageSkeletonProps {
  columns?: number;
  rows?: number;
  showFilter?: boolean;
  showAction?: boolean;
  filterCount?: number;
}

export default function AdminPageSkeleton({
  columns = 5,
  rows = 6,
  showFilter = true,
  showAction = true,
  filterCount = 2,
}: AdminPageSkeletonProps) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        transition: "width 0.3s ease",
      }}
    >
      <SkeletonPageHeader showAction={showAction} />
      {showFilter && <SkeletonFilterBar filterCount={filterCount} />}
      <SkeletonTable columns={columns} rows={rows} />
    </div>
  );
}
