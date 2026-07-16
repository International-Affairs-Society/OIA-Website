"use client";
import React, { useState } from "react";

export interface ActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onUpdateRole?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onLinkMOU?: () => void;
  isArchived?: boolean;
  rowId?: string;
  confirmingDeleteId?: string | null;
  onConfirmDelete?: (id: string) => void | Promise<void>;
  onCancelDelete?: () => void;
  setConfirmingDeleteId?: (id: string | null) => void;
}

export default function ActionButtons({
  onView,
  onEdit,
  onUpdateRole,
  onDelete,
  onArchive,
  onLinkMOU,
  isArchived,
  rowId,
  confirmingDeleteId,
  onConfirmDelete,
  onCancelDelete,
  setConfirmingDeleteId,
}: ActionButtonsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const isConfirming = confirmingDeleteId && confirmingDeleteId === rowId;

  const buttonStyle = (color: string): React.CSSProperties => ({
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0 6px",
    fontSize: "13px",
    color: color,
    textDecoration: "none",
  });

  const divider = <span style={{ color: "#b5bda0", margin: "0 4px" }}>|</span>;

  if (isConfirming) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: "13px", color: "#6b6b6b", minWidth: "140px" }}>
        {isDeleting ? (
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="animate-spin inline-block w-3 h-3 border-2 border-t-transparent border-[#c0392b] rounded-full"></span>
            Deleting...
          </span>
        ) : (
          <>
            <span>Confirm delete?</span>
            <button
              style={buttonStyle("#c0392b")}
              onClick={async (e) => {
                e.stopPropagation();
                if (onConfirmDelete && rowId) {
                  setIsDeleting(true);
                  try {
                    await onConfirmDelete(rowId);
                  } finally {
                    setIsDeleting(false);
                  }
                }
              }}
            >
              Yes
            </button>
            {divider}
            <button
              style={buttonStyle("#6b6b6b")}
              onClick={(e) => {
                e.stopPropagation();
                if (onCancelDelete) onCancelDelete();
              }}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    );
  }

  const buttons = [];

  if (onView) {
    buttons.push(
      <button
        key="view"
        style={buttonStyle("#6b6b6b")}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1a1a")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b6b")}
        onClick={(e) => {
          e.stopPropagation();
          onView();
        }}
      >
        View
      </button>
    );
  }

  if (onEdit) {
    buttons.push(
      <button
        key="edit"
        style={buttonStyle("#6b6b6b")}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1a1a")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b6b")}
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
      >
        Edit
      </button>
    );
  }

  if (onUpdateRole) {
    buttons.push(
      <button
        key="updateRole"
        style={buttonStyle("#6b6b6b")}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1a1a")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b6b")}
        onClick={(e) => {
          e.stopPropagation();
          onUpdateRole();
        }}
      >
        Update Role
      </button>
    );
  }

  if (onArchive) {
    buttons.push(
      <button
        key="archive"
        style={buttonStyle("#6b6b6b")}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1a1a")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b6b")}
        onClick={(e) => {
          e.stopPropagation();
          onArchive();
        }}
      >
        {isArchived ? "Unarchive" : "Archive"}
      </button>
    );
  }

  if (onLinkMOU) {
    buttons.push(
      <button
        key="link"
        style={buttonStyle("#6b6b6b")}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1a1a")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b6b")}
        onClick={(e) => {
          e.stopPropagation();
          onLinkMOU();
        }}
      >
        Link MOU
      </button>
    );
  }

  if (onDelete || setConfirmingDeleteId) {
    buttons.push(
      <button
        key="delete"
        style={buttonStyle("#c0392b")}
        onClick={(e) => {
          e.stopPropagation();
          if (setConfirmingDeleteId && rowId) {
            setConfirmingDeleteId(rowId);
          } else if (onDelete) {
            onDelete();
          }
        }}
      >
        Delete
      </button>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
      {buttons.map((btn, i) => (
        <React.Fragment key={i}>
          {btn}
          {i < buttons.length - 1 && divider}
        </React.Fragment>
      ))}
    </div>
  );
}
