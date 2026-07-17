"use client";
import React from "react";
import CustomDropdown from "./CustomDropdown";

export interface FilterBarProps {
  filters?: {
    key: string;
    label: string;
    options: { label: string; value: string }[];
  }[];
  sortOptions?: { label: string; value: string }[];
  onFilterChange?: (key: string, value: string) => void;
  onSortChange?: (value: string) => void;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  extraRightNode?: React.ReactNode;
}

export default function FilterBar({
  filters = [],
  sortOptions = [],
  onFilterChange,
  onSortChange,
  searchPlaceholder,
  onSearch,
  extraRightNode,
}: FilterBarProps) {
  const inputStyle: React.CSSProperties = {
    padding: "6px 10px",
    border: "1px solid #b5bda0",
    backgroundColor: "#f5f0e8",
    color: "#1a1a1a",
    fontSize: "13px",
    outline: "none",
    height: "100%",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        paddingBottom: "12px",
        marginBottom: "16px",
        borderBottom: "1px solid #b5bda0",
      }}
    >
      <div style={{ flex: "1 1 200px" }}>
        <input
          type="text"
          placeholder={searchPlaceholder || "Search..."}
          onChange={(e) => onSearch && onSearch(e.target.value)}
          style={{
            ...inputStyle,
            width: "100%",
            maxWidth: "300px",
          }}
        />
      </div>

      <div className="admin-filter-right" style={{ display: "flex", alignItems: "center", gap: "12px", height: "100%" }}>
        {filters.map((filter) => (
          <CustomDropdown
            key={filter.key}
            placeholder={filter.label}
            options={filter.options}
            onChange={(val) => onFilterChange && onFilterChange(filter.key, val)}
          />
        ))}

        {sortOptions.length > 0 && (
          <CustomDropdown
            placeholder="Sort by..."
            options={sortOptions}
            onChange={(val) => onSortChange && onSortChange(val)}
          />
        )}
        
        {extraRightNode && extraRightNode}
      </div>
    </div>
  );
}
