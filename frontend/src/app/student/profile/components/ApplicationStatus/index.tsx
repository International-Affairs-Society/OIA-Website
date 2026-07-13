import React from "react";
import { Application, Program, Document, StageHistory } from "../../types";
import StatusBadge from "../StatusBadge";
import ProgramInfoRow from "./ProgramInfoRow";
import PipelineStepper from "./PipelineStepper";
import DocumentChecklist from "./DocumentChecklist";
import ActivityTimeline from "./ActivityTimeline";
import ApplicationComments from "./ApplicationComments";
import { motion } from "framer-motion";

interface Props {
  application: Application;
  program: Program;
  documents: Document[];
  history: StageHistory[];
  comments: import("../../types").ApplicationComment[];
  onBack?: () => void;
}

export default function ApplicationStatus({ application, program, documents, history, comments, onBack }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex flex-col w-full"
      style={{ display: "flex", flexDirection: "column", gap: "30px" }}
    >
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 md:gap-0" style={{ marginBottom: "30px" }}>
        <div>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(57, 57, 57, 0.6)",
                fontFamily: "var(--font-space-grotesk)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: "4px",
                marginBottom: "16px",
                fontWeight: 600
              }}
            >
              &larr; Back to Applications
            </button>
          )}
          <h1
            style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              marginBottom: "24px",
              lineHeight: 1,
              color: "#393939",
              fontFamily: "var(--font-display)",
            }}
          >
            Application Status
          </h1>
          <p
            style={{
              fontSize: "clamp(10px, 1.2vw, 12px)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              whiteSpace: "normal",
              color: "rgba(57, 57, 57, 0.6)",
              fontFamily: "var(--font-roboto-condensed)",
            }}
          >
            {program.title}
          </p>
        </div>
        
        {program.poc && (
          <div
            className="mt-4 md:mt-0 flex flex-col items-start min-w-[260px]"
            style={{
              padding: "14px 16px",
              borderRadius: "12px",
              background: "rgba(255, 251, 242, 0.35)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(255, 255, 255, 0.45)",
              boxShadow: "0 4px 16px rgba(57,57,57,0.06), inset 0 1px 0 rgba(255,255,255,0.7)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D12027]" />
              <span className="text-[10px] uppercase tracking-[0.15em] text-foreground/60 font-space-grotesk font-semibold">
                Point of Contact
              </span>
            </div>
            <h4 style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 600, color: "#393939", margin: "0 0 2px 0" }}>
              {program.poc.name}
            </h4>
            <p style={{ fontFamily: "var(--font-outfit)", fontSize: "12px", color: "rgba(57,57,57,0.6)", margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {program.poc.designation}
            </p>
            <div className="w-full h-[1px] bg-[rgba(57,57,57,0.1)] mb-3" />
            <p style={{ fontFamily: "var(--font-outfit)", fontSize: "13px", color: "#393939", margin: "0 0 4px 0" }}>
              <strong className="font-semibold text-foreground/70">Email:</strong> {program.poc.email}
            </p>
            <p style={{ fontFamily: "var(--font-outfit)", fontSize: "13px", color: "#393939", margin: 0 }}>
              <strong className="font-semibold text-foreground/70">Contact:</strong> {program.poc.contactNumber}
            </p>
          </div>
        )}
      </div>

      <ProgramInfoRow application={application} program={program} />

      <PipelineStepper currentStage={application.stage} history={history} />

      <ApplicationComments comments={comments} />

    </motion.div>
  );
}
