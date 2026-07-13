import React from "react";
import GlassCard from "../GlassCard";
import { ApplicationStage, StageHistory } from "../../types";
import { Check } from "lucide-react";

interface Props {
  currentStage: ApplicationStage;
  history: StageHistory[];
}

const STAGES: { id: ApplicationStage; label: string }[] = [
  { id: "applied", label: "Application Received" },
  { id: "documents_verified", label: "Document Verification" },
  { id: "offer_letter", label: "Offer Letter Generated" },
  { id: "visa_docs", label: "Visa Documentation" },
  { id: "enrolled", label: "Enrolled" },
];

export default function PipelineStepper({ currentStage, history }: Props) {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);
  const progressPercent = (currentIndex / (STAGES.length - 1)) * 100;

  return (
    <GlassCard className="w-full p-6 mb-6">
      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0px 0px rgba(122,140,94,0.60); }
          50% { box-shadow: 0 0 14px 4px rgba(122,140,94,0.40); }
          100% { box-shadow: 0 0 0px 0px rgba(122,140,94,0); }
        }
          50% { box-shadow: 0 0 14px 4px rgba(126,184,212,0.45); }
          100% { box-shadow: 0 0 0px 0px rgba(126,184,212,0); }
        }
      `}</style>

      <div className="flex justify-between items-center mb-6">
        <h3
          className="text-[13px] uppercase tracking-[0.12em]"
          style={{
            color: "rgba(57, 57, 57, 0.6)",
            fontFamily: "var(--font-roboto-condensed)",
          }}
        >
          Application Pipeline
        </h3>
        <div
          className="text-sm font-bold"
          style={{ fontFamily: "var(--font-space-grotesk)", color: "#7A8C5E" }}
        >
          {Math.round(progressPercent)}%
        </div>
      </div>

      <div style={{ marginTop: "24px", position: "relative" }}>
        {/* Stepper Nodes */}
        <div className="flex flex-col md:flex-row items-start md:items-start w-full relative pl-4 md:pl-0 gap-0 md:gap-0">
          {/* Vertical connecting line for mobile */}
          <div className="md:hidden absolute left-[31px] top-[16px] bottom-[16px] w-[2px] z-0" style={{
            background: `linear-gradient(to bottom, #7A8C5E 0%, #7A8C5E ${progressPercent}%, rgba(57,57,57,0.18) ${progressPercent}%, rgba(57,57,57,0.18) 100%)`
          }} />
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isPending = idx > currentIndex;

            const stageHist = history.find((h) => h.to_stage === stage.id);
            const dateStr = stageHist
              ? new Date(stageHist.changed_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
              : "";

            return (
              <div key={stage.id} className="flex-1 flex flex-row md:flex-col items-start md:items-center relative min-w-0 z-10 gap-[14px] md:gap-0 pb-[24px] md:pb-0 w-full" style={{ paddingBottom: idx === STAGES.length - 1 ? 0 : undefined }}>
                {idx !== STAGES.length - 1 && (
                  <div
                    className="hidden md:block absolute top-[16px] left-[50%] right-[-50%] h-[2px] z-0"
                    style={{
                      background: isCompleted || isCurrent ? "linear-gradient(to right, #7A8C5E, #A3B580)" : "var(--foreground)",
                    }}
                  />
                )}

                <div
                  className="transition-all duration-300"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    marginBottom: "0px",
                    marginTop: "2px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isCompleted ? "#7A8C5E" : "#FAF8F2",
                    border: isCompleted
                      ? "none"
                      : isCurrent
                        ? "2px solid #7A8C5E"
                        : "1px solid var(--muted-3)",
                    boxShadow: isCompleted
                      ? "0 0 12px rgba(122,140,94,0.45)"
                      : "none",
                    animation: isCurrent ? "pulse-ring 1.8s ease-in-out infinite" : "none",
                    zIndex: 1
                  }}
                >
                  {isCompleted && <Check size={14} color="white" strokeWidth={3} />}
                </div>

                <div className="flex flex-col gap-[2px] pt-[4px] md:pt-0">
                  <p
                    className="transition-colors text-left md:text-center max-w-none md:max-w-[100px]"
                    style={{
                      fontSize: "13px",
                      lineHeight: 1.3,
                      color: isCurrent || isCompleted ? "var(--foreground)" : "rgba(57, 57, 57, 0.6)",
                      fontFamily: "var(--font-space-grotesk)",
                    }}
                  >
                    {stage.label}
                  </p>
                  {dateStr && (
                    <p
                      style={{
                        fontSize: "11px",
                        marginTop: "0px",
                        textAlign: "left",
                        opacity: 0.5,
                        color: "var(--foreground)",
                        fontFamily: "var(--font-space-grotesk)",
                      }}
                    >
                      {dateStr}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="text-[12px] mt-[12px] md:mt-0 w-full"
        style={{
          color: "rgba(57, 57, 57, 0.6)",
          fontFamily: "var(--font-space-grotesk)",
          lineHeight: 1.5,
        }}
      >
        Next step: {
          currentStage === "offer_letter"
            ? "Download your offer letter and begin visa documentation"
            : currentStage === "documents_verified"
              ? "Wait for the OIA to generate your offer letter"
              : currentStage === "applied"
                ? "Submit and verify all required documents"
                : "Complete your visa process"
        }
      </div>
    </GlassCard>
  );
}
