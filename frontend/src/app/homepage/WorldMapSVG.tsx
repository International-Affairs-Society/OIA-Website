"use client";

import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ============================================================
// Partner countries data — ISO, coords, and university list
// ============================================================
interface PartnerCountry {
  name: string;
  iso: string;
  flag: string;
  coords: [number, number];
  universities: string[];
}

const PARTNER_COUNTRIES: PartnerCountry[] = [
  {
    name: "United Kingdom", iso: "GBR", flag: "🇬🇧", coords: [-1.5, 52.5],
    universities: [
      "University of Cambridge", "University College London (UCL)", "University of Sheffield",
      "University of Birmingham", "University of Exeter", "University of York",
      "University of Reading", "University of Strathclyde", "Heriot-Watt University",
      "Royal Holloway University of London", "University of Dundee", "University of Essex",
      "Staffordshire University", "Liverpool John Moores University",
    ],
  },
  {
    name: "United States", iso: "USA", flag: "🇺🇸", coords: [-98, 39],
    universities: [
      "University of California, Berkeley (UCB)", "Pennsylvania State University",
      "University of Wisconsin–Madison", "University of California, Davis",
      "Georgia Institute of Technology", "University of Florida", "Yeshiva University",
      "Iowa State University", "Babson College", "Northeastern University",
      "University of Nebraska Omaha", "University of Massachusetts Boston",
      "San Diego State University", "Kent State University", "Western Michigan University",
      "Seattle University", "George Mason University", "University of South Florida",
    ],
  },
  {
    name: "Australia", iso: "AUS", flag: "🇦🇺", coords: [134, -25],
    universities: [
      "Monash University", "University of Technology Sydney (UTS)",
      "University of Wollongong", "Western Sydney University", "Flinders University",
    ],
  },
  {
    name: "Canada", iso: "CAN", flag: "🇨🇦", coords: [-106, 56],
    universities: ["University of British Columbia", "University of Ottawa"],
  },
  {
    name: "Israel", iso: "ISR", flag: "🇮🇱", coords: [34.8, 31.5],
    universities: ["Tel Aviv University", "Hebrew University of Jerusalem"],
  },
  {
    name: "Malaysia", iso: "MYS", flag: "🇲🇾", coords: [101.7, 3.1],
    universities: ["Universiti Kebangsaan Malaysia", "UCSI University Malaysia", "INTI International University"],
  },
  {
    name: "Taiwan", iso: "TWN", flag: "🇹🇼", coords: [121, 23.5],
    universities: ["National Taiwan University"],
  },
  {
    name: "New Zealand", iso: "NZL", flag: "🇳🇿", coords: [174, -41],
    universities: ["University of Waikato"],
  },
  {
    name: "France", iso: "FRA", flag: "🇫🇷", coords: [2.2, 46.6],
    universities: ["University of Bordeaux"],
  },
  {
    name: "Indonesia", iso: "IDN", flag: "🇮🇩", coords: [113, -2],
    universities: ["Universitas Airlangga"],
  },
  {
    name: "United Arab Emirates", iso: "ARE", flag: "🇦🇪", coords: [54, 24],
    universities: ["University of Dubai"],
  },
  {
    name: "Italy", iso: "ITA", flag: "🇮🇹", coords: [12.5, 42.5],
    universities: ["Ca' Foscari University of Venice"],
  },
  {
    name: "Lithuania", iso: "LTU", flag: "🇱🇹", coords: [24, 55.2],
    universities: ["Kaunas University of Technology"],
  },
  {
    name: "Malta", iso: "MLT", flag: "🇲🇹", coords: [14.4, 35.9],
    universities: ["University of Malta"],
  },
  {
    name: "Netherlands", iso: "NLD", flag: "🇳🇱", coords: [5.3, 52.1],
    universities: ["University College Dublin"],
  },
];

const PARTNER_ISO_SET = new Set(PARTNER_COUNTRIES.map((c) => c.iso));

const ACCENT_RED = "#DF3036";

// ============================================================

const WorldMapSVG = memo(function WorldMapSVG() {
  const [hoveredISO, setHoveredISO] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    country: PartnerCountry;
    x: number;
    y: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // The active ISO is simply the hovered one
  const activeISO = hoveredISO;

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [20, 20],
        }}
        width={800}
        height={450}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies
              .filter((geo) => {
                const name = geo.properties?.name || geo.properties?.NAME;
                const iso = geo.properties?.ISO_A3 || geo.id;
                return iso !== "ATA" && name !== "Antarctica";
              })
              .map((geo) => {
                const geoName = geo.properties?.name || geo.properties?.NAME;
                const country = PARTNER_COUNTRIES.find(c => c.name === geoName || (c.name === "United States" && geoName === "United States of America"));
                const isPartner = !!country;
                const iso = country ? country.iso : geo.id; // Fallback to id if not partner
                const isHovered = activeISO === iso;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={(e: React.MouseEvent) => {
                      setHoveredISO(iso);
                      if (isPartner && country) {
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (rect) {
                          setTooltip({
                            country,
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                          });
                        }
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredISO(null);
                      setTooltip(null);
                    }}
                    style={{
                      default: {
                        fill: isHovered ? ACCENT_RED : "#d6cdb7",
                        stroke: "#fffbf2",
                        strokeWidth: 0.5,
                        outline: "none",
                        transition: "all 0.3s ease",
                        transform: isHovered ? "translateY(-2px) scale(1.02)" : "translateY(0) scale(1)",
                        transformOrigin: "center center",
                        transformBox: "fill-box",
                        filter: isHovered ? "drop-shadow(0px 6px 5px rgba(0,0,0,0.4)) drop-shadow(0px 2px 2px rgba(0,0,0,0.2))" : "none",
                        zIndex: isHovered ? 10 : 1,
                      },
                      hover: {
                        fill: ACCENT_RED,
                        stroke: "#fffbf2",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: isPartner ? "pointer" : "default",
                        transition: "all 0.3s ease",
                        transform: "translateY(-2px) scale(1.02)",
                        transformOrigin: "center center",
                        transformBox: "fill-box",
                        filter: "drop-shadow(0px 6px 5px rgba(0,0,0,0.4)) drop-shadow(0px 2px 2px rgba(0,0,0,0.2))",
                        zIndex: 10,
                      },
                      pressed: {
                        fill: ACCENT_RED,
                        stroke: "#fffbf2",
                        strokeWidth: 0.5,
                        outline: "none",
                        transition: "all 0.3s ease",
                        transform: "translateY(0) scale(1)",
                        transformOrigin: "center center",
                        transformBox: "fill-box",
                        filter: "none",
                        zIndex: 1,
                      },
                    }}
                  />
                );
              })
          }
        </Geographies>

        {/* Red dots on partner countries */}
        {PARTNER_COUNTRIES.map((country) => (
          <Marker
            key={country.iso}
            coordinates={country.coords}
            onMouseEnter={(e: React.MouseEvent) => {
              setHoveredISO(country.iso);
              const rect = containerRef.current?.getBoundingClientRect();
              if (rect) {
                setTooltip({
                  country,
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                });
              }
            }}
            onMouseLeave={() => {
              setHoveredISO(null);
              setTooltip(null);
            }}
            onClick={() => {}}
            style={{ cursor: "pointer" }}
          >
            {/* Pulse ring on hover */}
            {activeISO === country.iso && (
              <circle
                r={6}
                fill="none"
                stroke={ACCENT_RED}
                strokeWidth={0.8}
                opacity={0.5}
                style={{ pointerEvents: "none" }}
              >
                <animate
                  attributeName="r"
                  from="3"
                  to="8.4"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.6"
                  to="0"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
            {/* Solid dot */}
            <circle
              r={activeISO === country.iso ? 3.4 : 2.5}
              fill={ACCENT_RED}
              style={{
                pointerEvents: "none",
                transition: "r 0.2s ease",
              }}
            />
          </Marker>
        ))}
      </ComposableMap>

      {/* ── Tooltip — University List ── */}
      {tooltip && (
        <div
          data-tooltip
          className={`absolute z-50 pointer-events-none`}
          style={{
            left: tooltip.x,
            top: tooltip.y + 16,
            transform: "translate(-50%, 0)",
          }}
        >
          <div
            onWheel={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#FFFBF2",
              border: `1.5px solid ${ACCENT_RED}`,
              borderRadius: "12px",
              padding: "14px 18px",
              boxShadow: "0 8px 32px rgba(209, 32, 39, 0.15), 0 2px 8px rgba(0,0,0,0.08)",
              minWidth: "200px",
              maxWidth: "280px",
              maxHeight: "260px",
              overflowY: "auto" as const,
              backdropFilter: "blur(10px)",
              overscrollBehavior: "contain",
            }}
          >
            {/* Country header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "10px",
                paddingBottom: "8px",
                borderBottom: `1px solid rgba(209, 32, 39, 0.15)`,
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{tooltip.country.flag}</span>
              <span
                style={{
                  fontFamily: "var(--font-roboto), sans-serif",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  color: ACCENT_RED,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {tooltip.country.name}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: "var(--font-space-grotesk), monospace",
                  fontSize: "0.65rem",
                  color: "rgba(57, 57, 57, 0.4)",
                  fontWeight: 500,
                }}
              >
                {tooltip.country.universities.length} {tooltip.country.universities.length === 1 ? "partner" : "partners"}
              </span>
            </div>

            {/* University list */}
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {tooltip.country.universities.map((uni, idx) => (
                <li
                  key={idx}
                  style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: "0.72rem",
                    color: "#393939",
                    lineHeight: 1.45,
                    padding: "3px 0",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      backgroundColor: ACCENT_RED,
                      flexShrink: 0,
                      marginTop: "5px",
                      opacity: 0.6,
                    }}
                  />
                  {uni}
                </li>
              ))}
            </ul>
          </div>

          {/* Arrow pointer */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: `6px solid ${ACCENT_RED}`,
              margin: "0 auto",
            }}
          />
        </div>
      )}
    </div>
  );
});

export default WorldMapSVG;
