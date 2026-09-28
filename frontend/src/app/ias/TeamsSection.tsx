"use client";

import React from "react";
import IASTeamCard from "./IASTeamCard";

/* ─── DATA ─── */
const DEPARTMENTS = [
  {
    name: "Core Leadership",
    accent: "#D12027",
    members: [
      { name: "Manav Garg",  role: "Mentor",    size: "lg" as const, img: "https://randomuser.me/api/portraits/men/32.jpg" },
      { name: "Raman Gupta", role: "President", size: "lg" as const, img: "https://randomuser.me/api/portraits/men/41.jpg" },
    ],
  },

  {
    name: "Tech",
    accent: "#D12027",
    members: [
      { name: "Divyanshi Jaiswal", role: "VP Tech",   img: "https://randomuser.me/api/portraits/women/47.jpg" },
      { name: "Anvesh Mishra",     role: "Head Tech",  img: "https://randomuser.me/api/portraits/men/49.jpg" },
      { name: "Siddharth Singh",   role: "Sub Head",   img: "https://randomuser.me/api/portraits/men/57.jpg" },
      { name: "Lakshya Sharma",    role: "Sub Head",   img: "https://randomuser.me/api/portraits/men/64.jpg" },
      { name: "Himanshi Gupta",    role: "Sub Head",   img: "https://randomuser.me/api/portraits/women/72.jpg" },
      { name: "Mayank B.",         role: "Sub Head",   img: "https://randomuser.me/api/portraits/men/76.jpg" },
    ],
  },
  {
    name: "Communication",
    accent: "#D12027",
    members: [
      { name: "Shyam Nayak",         role: "VP Communication",      img: "https://randomuser.me/api/portraits/men/55.jpg" },
      { name: "Ananya Mishra",       role: "Head Communication",    img: "https://randomuser.me/api/portraits/women/12.jpg" },
      { name: "Manthan Jain",        role: "Head Alumni Relations",  img: "https://randomuser.me/api/portraits/men/18.jpg" },
      { name: "Shreshta Shukla",     role: "Head Spon. & Budg.",    img: "https://randomuser.me/api/portraits/women/24.jpg" },
      { name: "Subhangi Sarkar",     role: "Sub Head",              img: "https://randomuser.me/api/portraits/women/33.jpg" },
      { name: "Ananya Barath",       role: "Sub Head",              img: "https://randomuser.me/api/portraits/women/44.jpg" },
      { name: "Nishika Upadhyay",    role: "Sub Head",              img: "https://randomuser.me/api/portraits/women/51.jpg" },
      { name: "Raghav Sharma",       role: "Sub Head",              img: "https://randomuser.me/api/portraits/men/62.jpg" },
      { name: "Aakushi Chakraborty", role: "Sub Head",              img: "https://randomuser.me/api/portraits/women/68.jpg" },
      { name: "Akshat Tiwari",       role: "Sub Head",              img: "https://randomuser.me/api/portraits/men/71.jpg" },
      { name: "Janvi Singh",         role: "Sub Head",              img: "https://randomuser.me/api/portraits/women/78.jpg" },
    ],
  },
  {
    name: "Design & Media",
    accent: "#D12027",
    members: [
      { name: "Yash Pratap Singh", role: "VP Design & Media",  img: "https://randomuser.me/api/portraits/men/83.jpg" },
      { name: "Ipsita Mondal",     role: "Head Design",        img: "https://randomuser.me/api/portraits/women/86.jpg" },
      { name: "Harshita Gupta",    role: "Head Design",        img: "https://randomuser.me/api/portraits/women/90.jpg" },
      { name: "Vaishnavi Mishra",  role: "Head Media",         img: "https://randomuser.me/api/portraits/women/4.jpg" },
      { name: "Anushka Singhal",   role: "Sub Head Design",    img: "https://randomuser.me/api/portraits/women/9.jpg" },
      { name: "Harsh Jain",        role: "Sub Head Media",     img: "https://randomuser.me/api/portraits/men/22.jpg" },
      { name: "Raghav Karnatak",   role: "Sub Head Design",    img: "https://randomuser.me/api/portraits/men/29.jpg" },
      { name: "Daksh Batra",       role: "Sub Head Media",     img: "https://randomuser.me/api/portraits/men/36.jpg" },
    ],
  },
  {
    name: "Hospitality",
    accent: "#D12027",
    members: [
      { name: "Laksh Joshi",   role: "VP Hospitality",   img: "https://randomuser.me/api/portraits/men/85.jpg" },
      { name: "Tushar Gupta",  role: "Head Hospitality",  img: "https://randomuser.me/api/portraits/men/88.jpg" },
      { name: "Jasmeet Kaur",  role: "Sub Head",          img: "https://randomuser.me/api/portraits/women/92.jpg" },
      { name: "Udhay Parihar", role: "Sub Head",          img: "https://randomuser.me/api/portraits/men/93.jpg" },
      { name: "Satyam Gupta",  role: "Sub Head",          img: "https://randomuser.me/api/portraits/men/96.jpg" },
    ],
  },
];

/* Card dimensions by tier */
const cardSize = (tier: "lg" | "md" | "sm" | undefined) => {
  if (tier === "lg") return { w: "286px", h: "374px" };
  return { w: "231px", h: "308px" };
};

export default function TeamsSection() {
  return (
    <section
      style={{
        backgroundColor: "#0a0a0a",
        backgroundImage: `
          linear-gradient(0deg, transparent 24%, rgba(114,114,114,0.3) 25%, rgba(114,114,114,0.3) 26%, transparent 27%,
            transparent 74%, rgba(114,114,114,0.3) 75%, rgba(114,114,114,0.3) 76%, transparent 77%, transparent),
          linear-gradient(90deg, transparent 24%, rgba(114,114,114,0.3) 25%, rgba(114,114,114,0.3) 26%, transparent 27%,
            transparent 74%, rgba(114,114,114,0.3) 75%, rgba(114,114,114,0.3) 76%, transparent 77%, transparent)
        `,
        backgroundSize: "55px 55px",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        fontFamily: "var(--font-outfit), sans-serif",
        paddingBottom: "140px",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .team-card-wrapper {
            width: 42vw !important;
            height: 56vw !important;
          }
          .team-card-inner {
            width: 100% !important;
            height: 100% !important;
          }
          .dept-heading-wrapper {
            justify-content: center !important;
            margin-bottom: 30px !important;
          }
          .dept-heading-bar, .dept-heading-line, .dept-heading-sub {
            display: none !important;
          }
          .dept-heading-main {
            color: #D12027 !important;
            text-align: center !important;
            letter-spacing: 0.15em !important;
            font-size: 1.5rem !important;
          }
          .dept-cards-grid {
            gap: 20px 15px !important;
          }
        }
      `}</style>
      {/* ── Giant "TEAM" Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "120px",
          paddingBottom: "60px",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(6rem, 16vw, 22rem)",
            fontWeight: 800,
            color: "#333",
            lineHeight: 0.8,
            fontFamily: "var(--font-outfit), sans-serif",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          TEAM
        </h1>
      </div>

      {/* ── Department Sections ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 5%",
        }}
      >
        {DEPARTMENTS.map((dept, di) => (
          <div key={di} style={{ marginBottom: "100px" }}>
            {/* Section heading */}
            <div
              className="dept-heading-wrapper"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                marginBottom: "48px",
              }}
            >
              {/* Red accent bar */}
              <div
                className="dept-heading-bar"
                style={{
                  width: "5px",
                  height: "48px",
                  backgroundColor: "#D12027",
                  borderRadius: "2px",
                  flexShrink: 0,
                }}
              />
              <div>
                <p
                  className="dept-heading-sub"
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    letterSpacing: "0.2em",
                    color: "#D12027",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  IAS Department
                </p>
                <h3
                  className="dept-heading-main"
                  style={{
                    margin: 0,
                    fontSize: "clamp(1.6rem, 3vw, 2.6rem)",
                    fontWeight: 800,
                    color: "#fff",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    lineHeight: 1,
                  }}
                >
                  {dept.name}
                </h3>
              </div>
              {/* Divider line */}
              <div
                className="dept-heading-line"
                style={{
                  flex: 1,
                  height: "1px",
                  background:
                    "linear-gradient(to right, #333, transparent)",
                  marginLeft: "8px",
                }}
              />
            </div>

            {/* Cards Grid */}
            <div
              className="dept-cards-grid"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "60px 40px",
                alignItems: "flex-start",
                justifyContent: "center",
              }}
            >
              {dept.members.map((member, mi) => {
                const tier = (member as any).size ?? "sm";
                const { w, h } = cardSize(tier);
                return (
                  <IASTeamCard
                    key={mi}
                    name={member.name}
                    role={member.role}
                    imageSrc={(member as any).img}
                    containerWidth={w}
                    containerHeight={h}
                    imageWidth={w}
                    imageHeight={h}
                    rotateAmplitude={12}
                    scaleOnHover={1.05}
                  />
                );
              })}
            </div>
            
            {(dept as any).footerText && (
              <div style={{ textAlign: "center", marginTop: "40px" }}>
                <p style={{ color: "#aaa", fontSize: "0.9rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>
                  {(dept as any).footerText}
                </p>
              </div>
            )}

          </div>
        ))}
      </div>
    </section>
  );
}
