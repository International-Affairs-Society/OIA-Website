"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle2, Loader2, HelpCircle, AlertTriangle } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onConfirm should return true if the action was successful, false if it failed.
  onConfirm: () => Promise<boolean>;
  onSuccess?: () => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  submittingLabel?: string;
  successLabel?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  onSuccess,
  title,
  message,
  confirmLabel = "Yes",
  cancelLabel = "No",
  submittingLabel = "Submitting...",
  successLabel = "Submitted!",
  isDestructive = false,
}: ConfirmModalProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  useEffect(() => {
    if (isOpen) setStatus("idle");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setStatus("submitting");
    try {
      const isSuccess = await onConfirm();
      if (isSuccess) {
        setStatus("success");
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 600);
      } else {
        setStatus("idle");
      }
    } catch (err) {
      console.error(err);
      setStatus("idle");
    }
  };

  const buttonBgColor = isDestructive ? "#c0392b" : "#1a1a1a";
  const successColor = "#5C6B3F";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes custom-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .custom-spinner {
          animation: custom-spin 1s linear infinite;
        }
      ` }} />
      <div
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)", zIndex: 10000,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}
      >
        <div
          style={{
            backgroundColor: "#fff", border: "1px solid #b5bda0", borderRadius: "16px",
            padding: "40px", maxWidth: "500px", width: "100%", textAlign: "center",
            boxShadow: "0 24px 64px rgba(0,0,0,0.12)", margin: "auto"
          }}
        >
          {status === "idle" && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              {isDestructive ? (
                <div style={{ backgroundColor: "#fdf2f2", padding: "16px", borderRadius: "50%" }}>
                  <AlertTriangle size={32} color="#c0392b" />
                </div>
              ) : (
                <div style={{ backgroundColor: "#f5f0e8", padding: "16px", borderRadius: "50%" }}>
                  <HelpCircle size={32} color="#5C6B3F" />
                </div>
              )}
            </div>
          )}

          <h3 style={{ margin: "0 0 12px 0", color: "#1a1a1a", fontSize: "22px", fontWeight: 600 }}>
            {status === "success" ? successLabel : title}
          </h3>
          
          {status === "idle" && (
            <p style={{ margin: "0 0 32px 0", color: "#6b6b6b", fontSize: "15px", lineHeight: 1.6 }}>
              {message || "Are you sure you want to proceed? Please confirm your action before continuing."}
            </p>
          )}

          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            {status === "idle" && (
              <>
                <button
                  onClick={onClose}
                  style={{
                    padding: "10px 28px", backgroundColor: "transparent", color: "#1a1a1a",
                    border: "1px solid #1a1a1a", fontWeight: 600, cursor: "pointer", borderRadius: "8px", fontSize: "15px"
                  }}
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={handleConfirm}
                  style={{
                    padding: "10px 28px", backgroundColor: buttonBgColor, color: "#fff",
                    border: "none", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", borderRadius: "8px", fontSize: "15px"
                  }}
                >
                  {confirmLabel}
                </button>
              </>
            )}

            {status === "submitting" && (
              <button
                disabled
                style={{
                  padding: "10px 28px", backgroundColor: buttonBgColor, color: "#fff",
                  border: "none", fontWeight: 600, cursor: "not-allowed", display: "flex", alignItems: "center", gap: "8px", opacity: 0.8, borderRadius: "8px", fontSize: "15px"
                }}
              >
                <Loader2 className="custom-spinner" size={18} />
                {submittingLabel}
              </button>
            )}

            {status === "success" && (
              <button
                disabled
                style={{
                  padding: "10px 28px", backgroundColor: successColor, color: "#fff",
                  border: "none", fontWeight: 600, cursor: "default", display: "flex", alignItems: "center", gap: "8px", borderRadius: "8px", fontSize: "15px"
                }}
              >
                <CheckCircle2 size={18} />
                {successLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
