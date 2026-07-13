"use client";
import React from "react";

export interface AdminTableColumn {
  key: string;
  label: React.ReactNode;
  width?: string;
}

export interface AdminTableProps {
  columns: AdminTableColumn[];
  data: Record<string, any>[];
  onRowClick?: (row: any) => void;
  actions?: (row: any) => React.ReactNode;
  loading?: boolean;
}

export default function AdminTable({
  columns,
  data,
  onRowClick,
  actions,
  loading,
}: AdminTableProps) {
  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table style={{ minWidth: "600px", width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  width: col.width,
                  padding: "16px",
                  borderBottom: "1px solid #b5bda0",
                  fontWeight: 600,
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#6b6b6b",
                }}
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th
                style={{
                  padding: "16px",
                  borderBottom: "1px solid #b5bda0",
                  fontWeight: 600,
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#6b6b6b",
                  textAlign: "right",
                }}
              >
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                style={{
                  padding: "52px 16px",
                  textAlign: "center",
                  color: "#6b6b6b",
                }}
              >
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                style={{
                  padding: "52px 16px",
                  textAlign: "center",
                  color: "#6b6b6b",
                }}
              >
                No records found.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                style={{
                  cursor: onRowClick ? "pointer" : "default",
                  transition: "background-color 0.2s ease",
                  height: "52px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ede8de";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: "0 16px",
                      borderBottom: "1px solid #b5bda0",
                      color: "#1a1a1a",
                    }}
                  >
                    {row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td
                    style={{
                      padding: "0 16px",
                      borderBottom: "1px solid #b5bda0",
                      textAlign: "right",
                    }}
                  >
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
