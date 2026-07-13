import React from "react";
import GlassCard from "../GlassCard";
import StatusBadge from "../StatusBadge";
import { Document } from "../../types";
import { FileText, Image, CreditCard, Syringe, GraduationCap } from "lucide-react";

interface Props {
  documents: Document[];
}

export default function DocumentChecklist({ documents }: Props) {
  const pendingCount = documents.filter((d) => d.status === "pending" || d.status === "not_uploaded").length;

  const getIcon = (type: string) => {
    switch (type) {
      case "passport":
      case "aadhaar":
        return <CreditCard size={16} />;
      case "photo":
        return <Image size={16} />;
      case "vaccination":
        return <Syringe size={16} />;
      case "transcript":
        return <GraduationCap size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const getDisplayName = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <GlassCard className="w-full" style={{ minWidth: 0, boxSizing: "border-box" }}>
      <div className="flex justify-between items-center mb-5">
        <h3
          className="text-[13px] uppercase tracking-[0.12em]"
          style={{
            color: "rgba(57, 57, 57, 0.6)",
            fontFamily: "var(--font-roboto-condensed)",
          }}
        >
          Document Checklist
        </h3>
        {pendingCount > 0 && (
          <StatusBadge variant="pending" label={`${pendingCount} Pending`} />
        )}
      </div>

      <div className="flex flex-col">
        {documents.map((doc, index) => {
          const isLast = index === documents.length - 1;
          return (
            <div
              key={doc.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: isLast ? "none" : "1px solid rgba(122, 140, 94, 0.20)",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
                <div style={{ opacity: 0.65, color: "var(--foreground)" }}>
                  {getIcon(doc.type)}
                </div>
                <span
                  style={{ fontSize: "13px", color: "var(--foreground)", fontFamily: "var(--font-space-grotesk)" }}
                >
                  {getDisplayName(doc.type)}
                </span>
              </div>
              
              <StatusBadge 
                variant={doc.status === "not_uploaded" ? "pending" : doc.status} 
                label={doc.status === "not_uploaded" ? "Pending" : doc.status} 
              />
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
