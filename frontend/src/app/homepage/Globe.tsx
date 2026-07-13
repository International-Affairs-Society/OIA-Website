"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as THREE from "three";

// Dynamically import react-globe.gl to prevent SSR issues (WebGL needs window/document)
const GlobeGL = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e63946]"></div>
    </div>
  ),
});

const CITIES = [
  { name: "New York", lat: 40.7128, lng: -74.006 },
  { name: "London", lat: 51.5074, lng: -0.1276 },
  { name: "Tokyo", lat: 35.6895, lng: 139.6917 },
  { name: "Sydney", lat: -33.8688, lng: 151.2093 },
  { name: "Sao Paulo", lat: -23.5505, lng: -46.6333 },
  { name: "Cairo", lat: 30.0444, lng: 31.2357 },
  { name: "Delhi", lat: 28.6139, lng: 77.209 },
  { name: "Moscow", lat: 55.7558, lng: 37.6173 },
  { name: "Cape Town", lat: -33.9249, lng: 18.4241 },
  { name: "Beijing", lat: 39.9042, lng: 116.4074 },
];

// Pre-generate arcs with fixed initial gaps (not random on every render)
const ARCS = (() => {
  const result = [];
  for (let i = 0; i < 15; i++) {
    const c1 = CITIES[i % CITIES.length];
    const c2 = CITIES[(i + 3) % CITIES.length];
    if (c1.name !== c2.name) {
      result.push({
        startLat: c1.lat,
        startLng: c1.lng,
        endLat: c2.lat,
        endLng: c2.lng,
        color: "#e63946",
        initialGap: (i * 0.7) % 5,
      });
    }
  }
  return result;
})();

// Stable callback functions (defined outside component to prevent re-creation)
const POLYGON_CAP_COLOR = () => "#C4CBB7";
const POLYGON_SIDE_COLOR = () => "rgba(196, 203, 183, 0.2)";
const POLYGON_STROKE_COLOR = () => "#9CA38F";
const ARC_COLOR = (d: any) => d.color;
const ARC_INITIAL_GAP = (d: any) => d.initialGap;
const EMPTY_LABEL = () => "";
const NOOP = () => {};

// --- MOU Marker types ---
export interface MOUMarker {
  name: string;
  coords: [number, number];
  status: "active" | "expired" | "draft" | "dormant";
  country?: string;
}

export interface GlobeProps {
  mouMarkers?: MOUMarker[];
  compact?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  active: "#5c6b47",
  expired: "#c0392b",
  draft: "#a89b7a",
  dormant: "#a89b7a",
};

export default function Globe({ mouMarkers, compact }: GlobeProps = {}) {
  const globeEl = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState({ features: [] });
  const [globeSize, setGlobeSize] = useState(compact ? 600 : 2500);

  // Detect screen size for responsive globe
  useEffect(() => {
    if (compact) {
      setGlobeSize(600);
      return;
    }
    const updateSize = () => {
      const w = window.innerWidth;
      if (w < 768) {
        setGlobeSize(800);
      } else if (w < 1024) {
        setGlobeSize(2000);
      } else {
        setGlobeSize(2500);
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [compact]);

  // Load Geographic Data for the globe base
  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson"
    )
      .then((res) => res.json())
      .then((data) => setCountries(data))
      .catch((err) => console.error("Failed to load map data", err));
  }, []);

  // Create a tinted glass material
  const invisibleMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: "#939185",
      transparent: true,
      opacity: 0.4,
      depthWrite: true,
    });
  }, []);

  // Build points data from mouMarkers
  const pointsData = useMemo(() => {
    if (!mouMarkers) return [];
    return mouMarkers.map((m) => ({
      lat: m.coords[0],
      lng: m.coords[1],
      name: m.name,
      status: m.status,
      country: m.country || "",
      color: STATUS_COLORS[m.status] || "#a89b7a",
      size: m.status === "dormant" ? 0.4 : 0.6,
    }));
  }, [mouMarkers]);

  // ─── CONTROLS SETUP + ZOOM LOCK ───
  // Uses requestAnimationFrame to continuously enforce enableZoom=false.
  // This is necessary because the library may re-initialize controls,
  // and a one-time useEffect can be overridden.
  useEffect(() => {
    let rafId: number;
    let lockedDistance = 0;

    const enforceNoZoom = () => {
      if (globeEl.current) {
        try {
          const controls = globeEl.current.controls();
          if (controls) {
            // Keep auto-rotate and drag-rotate on
            controls.autoRotate = true;
            controls.autoRotateSpeed = compact ? 0.6 : 0.4;
            controls.enableRotate = true;
            controls.enablePan = false;

            // FORCE zoom off every frame
            controls.enableZoom = false;

            // Lock the camera distance
            if (lockedDistance === 0) {
              const dist = controls.getDistance();
              if (dist > 0) lockedDistance = dist;
            }
            if (lockedDistance > 0) {
              controls.minDistance = lockedDistance;
              controls.maxDistance = lockedDistance;
            }
          }
        } catch {
          // controls not ready yet
        }
      }
      rafId = requestAnimationFrame(enforceNoZoom);
    };

    rafId = requestAnimationFrame(enforceNoZoom);
    return () => cancelAnimationFrame(rafId);
  }, [compact]);

  // Point callbacks
  const pointColor = useCallback((d: any) => d.color, []);
  const pointAlt = useCallback(() => 0.01, []);
  const pointRadius = useCallback((d: any) => d.size, []);
  const pointLabel = useCallback((d: any) => {
    return `<div style="background:#1a1a1a;color:#f5f0e8;padding:8px 12px;border-radius:0;font-size:12px;font-family:inherit;line-height:1.4;">
      <strong>${d.name}</strong><br/>
      <span style="text-transform:capitalize">${d.status}</span>${d.country ? ` · ${d.country}` : ""}
    </div>`;
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-visible"
      style={{ width: compact ? "100%" : globeSize, height: compact ? 380 : globeSize }}
    >
      <GlobeGL
        ref={globeEl}
        width={compact ? 600 : globeSize}
        height={compact ? 380 : globeSize}
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere={true}
        atmosphereColor="#EEE0B7"
        atmosphereAltitude={0.15}
        showGlobe={true}
        globeMaterial={invisibleMaterial}

        // Polygons
        polygonsData={countries.features}
        polygonCapColor={POLYGON_CAP_COLOR}
        polygonSideColor={POLYGON_SIDE_COLOR}
        polygonStrokeColor={POLYGON_STROKE_COLOR}
        polygonAltitude={0.005}
        onPolygonHover={NOOP}
        polygonLabel={EMPTY_LABEL}

        // Arcs — only show when NOT using mouMarkers
        arcsData={mouMarkers ? [] : ARCS}
        arcColor={ARC_COLOR}
        arcAltitudeAutoScale={0.6}
        arcStroke={0.1}
        arcDashLength={0.9}
        arcDashGap={4}
        arcDashAnimateTime={3000}
        arcDashInitialGap={ARC_INITIAL_GAP}
        onArcHover={NOOP}
        arcLabel={EMPTY_LABEL}

        // Point markers for MOUs
        pointsData={pointsData}
        pointColor={pointColor}
        pointAltitude={pointAlt}
        pointRadius={pointRadius}
        pointLabel={pointLabel}
      />
    </div>
  );
}
