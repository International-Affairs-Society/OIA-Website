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

      {/* ── Hero: President card ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "4rem",
          padding: "40px 5% 120px 5%",
          flexWrap: "wrap",
        }}
      >
        {/* Left label */}
        <div
          style={{
            flex: "1 1 260px",
            textAlign: "right",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(2.5rem, 4.5vw, 5rem)",
              fontWeight: 800,
              lineHeight: 1,
              margin: 0,
              color: "#fff",
              textTransform: "uppercase",
            }}
          >
            PRESIDENT
            <br />
            <span style={{ color: "#D12027" }}>IAS</span>
          </h2>
          <div
            style={{
              width: "60px",
              height: "4px",
              backgroundColor: "#D12027",
              marginTop: "20px",
            }}
          />
        </div>

        {/* Photo card */}
        <div
          style={{
            width: "clamp(280px, 28vw, 380px)",
            height: "clamp(420px, 38vw, 520px)",
            position: "relative",
            borderRadius: "3px",
            overflow: "hidden",
            boxShadow: "0 24px 64px rgba(0,0,0,0.9), 0 0 0 1px #222",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop"
            alt="Raman Gupta"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "grayscale(60%) contrast(115%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "220px",
              background:
                "linear-gradient(to top, rgba(0,0,0,1), transparent)",
            }}
          />
          <div style={{ position: "absolute", bottom: 28, left: 24, right: 24 }}>
            <h3
              style={{
                margin: 0,
                fontSize: "1.8rem",
                color: "#fff",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
              }}
            >
              Raman Gupta
            </h3>
            <p
              style={{
                margin: "6px 0 0",
                color: "#D12027",
                fontSize: "0.85rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
              }}
            >
              President, 2025-26
            </p>
          </div>
          {/* Corner dots */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              display: "flex",
              gap: "4px",
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#D12027",
                }}
              />
            ))}
          </div>
        </div>

        {/* Right text */}
        <div style={{ flex: "1 1 260px", textAlign: "left" }}>
          <p
            style={{
              maxWidth: "340px",
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.85,
              fontSize: "1.05rem",
              margin: 0,
            }}
          >
            Leading the International Affairs Society with a vision to foster
            global awareness, diplomatic discourse, and cross-cultural
            engagement among students. Preparing India to move with the times.
          </p>
        </div>
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
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                marginBottom: "48px",
              }}
            >
              {/* Red accent bar */}
              <div
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
