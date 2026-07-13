import React from "react";
import GlassCard from "../GlassCard";
import StatusBadge from "../StatusBadge";
import { StageHistory } from "../../types";

interface Props {
  history: StageHistory[];
}

export default function ActivityTimeline({ history }: Props) {
  // Mocking an upcoming event
  const events = [
    {
      id: "upcoming",
      note: "Visa documentation review",
      date: null,
      isUpcoming: true,
    },
    ...history
      .map((h) => ({
        id: h.id,
        note: h.note,
        date: new Date(h.changed_at),
        isUpcoming: false,
      }))
      .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0)),
  ];

  return (
    <GlassCard className="w-full" style={{ overflow: "visible", minWidth: 0 }}>
      <div className="flex justify-between items-center mb-6">
        <h3
          className="text-[13px] uppercase tracking-[0.12em]"
          style={{
            color: "rgba(57, 57, 57, 0.6)",
            fontFamily: "var(--font-roboto-condensed)",
          }}
        >
          Activity Timeline
        </h3>
        <StatusBadge variant="verified" label="Up to date" />
      </div>

      <div style={{ position: "relative", paddingLeft: "24px" }}>
        {/* Vertical line */}
        <div
          style={{
            position: "absolute",
            left: "7px",
            top: "8px",
            bottom: "8px",
            width: "1px",
            background: "rgba(122, 140, 94, 0.20)",
          }}
        />

        {events.map((event, idx) => {
          const isLast = idx === events.length - 1;
          return (
            <div key={event.id} style={{ position: "relative", paddingBottom: isLast ? 0 : "16px" }}>
              {/* Timeline Dot */}
              <div
                style={{
                  position: "absolute",
                  left: "-24px",
                  top: "4px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: event.isUpcoming ? "rgba(122, 140, 94, 0.20)" : "#7A8C5E",
                }}
              />
              
              <p
                style={{
                  fontSize: "12px",
                  lineHeight: 1.5,
                  marginBottom: "4px",
                  color: event.isUpcoming ? "rgba(57, 57, 57, 0.6)" : "var(--foreground)",
                  fontFamily: "var(--font-space-grotesk)",
                }}
              >
                {event.note}
              </p>
              
              <p
                style={{
                  fontSize: "10px",
                  opacity: 0.40,
                  color: "var(--foreground)",
                  fontFamily: "var(--font-space-grotesk)",
                }}
              >
                {event.isUpcoming ? (
                  "Upcoming"
                ) : (
                  <>
                    {event.date?.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    &middot;{" "}
                    {event.date?.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
