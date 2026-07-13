import React from "react";
import GlassCard from "../GlassCard";
import { Application, Program } from "../../types";

interface Props {
  application: Application;
  program: Program;
}

export default function ProgramInfoRow({ application, program }: Props) {
  const StatCol = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: "12px",
        background: "rgba(255, 251, 242, 0.35)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.45)",
        boxShadow: "0 4px 16px rgba(57,57,57,0.06), inset 0 1px 0 rgba(255,255,255,0.7)",
        minWidth: 0,
        overflow: "hidden",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <span style={{
        display: "block", fontSize: "9px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        letterSpacing: "0.12em",
        color: "rgba(57, 57, 57, 0.6)",
        marginBottom: "6px",
        fontFamily: "var(--font-roboto-condensed)",
        textTransform: "uppercase"
      }}>{label}</span>
      <span style={{
        display: "block", fontSize: "13px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        fontWeight: 600,
        color: "var(--foreground)",
        fontFamily: "var(--font-space-grotesk)"
      }}>{value}</span>
    </div>
  );

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", width: "100%" }}
    >
      <StatCol
        label="Applied On"
        value={new Date(application.applied_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      />
      <StatCol
        label="Departure"
        value={new Date(application.departure_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      />
      <StatCol label="Duration" value={program.duration} />
      <StatCol
        label="Fee Paid"
        value={
          <span className="flex items-center justify-center sm:justify-start gap-1.5">
            {application.fee_paid ? (
              <span className="w-1.5 h-1.5 rounded-full bg-[#4a5e1a]"></span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-[#404040]"></span>
            )}
            ₹{program.fee.toLocaleString("en-IN")}
          </span>
        }
      />
    </div>
  );
}
