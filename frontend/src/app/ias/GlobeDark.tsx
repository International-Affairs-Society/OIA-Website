"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useDeviceTierContext } from "@/hooks/useDeviceTier";

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

const ALL_ARCS = (() => {
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
        color: "#D12027",
        initialGap: (i * 0.7) % 5,
      });
    }
  }
  return result;
})();

const LOW_END_ARCS = ALL_ARCS.slice(0, 5);

// Dark-themed callbacks
const POLYGON_CAP_COLOR = () => "#1a2a3a";
const POLYGON_SIDE_COLOR = () => "rgba(30, 58, 95, 0.3)";
const POLYGON_STROKE_COLOR = () => "#2a4a6a";
const ARC_COLOR = (d: any) => d.color;
const ARC_INITIAL_GAP = (d: any) => d.initialGap;
const EMPTY_LABEL = () => "";
const NOOP = () => { };

export default function GlobeDark() {
  const globeEl = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState({ features: [] });
  const [globeSize, setGlobeSize] = useState(2500);
  const deviceTier = useDeviceTierContext();
  const isLowEnd = deviceTier === "low";
  const ARCS = isLowEnd ? LOW_END_ARCS : ALL_ARCS;

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    fetch(
      "/geo-data/ne_110m_admin_0_countries.geojson"
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => setCountries(data))
      .catch((err) => console.warn("Failed to load map data", err));
  }, []);

  // Dark glass material — MeshBasicMaterial is cheaper (no lighting calculations)
  const [darkMaterial, setDarkMaterial] = useState<any>(null);
  useEffect(() => {
    import("three").then((THREE) => {
      setDarkMaterial(
        new THREE.MeshBasicMaterial({
          color: "#0d1b2a",
          transparent: true,
          opacity: 0.6,
          depthWrite: true,
        })
      );
    });
  }, []);

  // Controls — setInterval at 500ms instead of rAF (60x less CPU)
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    let lockedDistance = 0;

    const setupControls = () => {
      if (!globeEl.current) return;

      try {
        const controls = globeEl.current.controls();
        if (controls) {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.4;
          controls.enableRotate = true;
          controls.enablePan = false;
          controls.enableZoom = false;

          if (lockedDistance === 0) {
            const dist = controls.getDistance();
            if (dist > 0) lockedDistance = dist;
          }
          if (lockedDistance > 0) {
            controls.minDistance = lockedDistance;
            controls.maxDistance = lockedDistance;
          }
        }

        // Cap pixel ratio on low-end
        if (isLowEnd) {
          const renderer = globeEl.current.renderer();
          if (renderer) {
            renderer.setPixelRatio(1);
          }
        }
      } catch {
        // controls not ready yet
      }
    };

    intervalId = setInterval(setupControls, 500);
    setupControls();

    return () => clearInterval(intervalId);
  }, [isLowEnd]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-visible"
      style={{ width: globeSize, height: globeSize }}
    >
      {isLowEnd ? (
        <div 
          style={{ 
            width: "100%", 
            height: "100%", 
            borderRadius: "50%", 
            background: "radial-gradient(circle at 30% 30%, rgba(30, 58, 95, 0.4), rgba(0,0,0,0) 70%)",
            border: "1px dashed rgba(30, 58, 95, 0.3)" 
          }} 
        />
      ) : (
        <GlobeGL
          ref={globeEl}
          width={globeSize}
          height={globeSize}
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere={true}
          atmosphereColor="#1e3a5f"
          atmosphereAltitude={0.18}
          showGlobe={true}
          globeMaterial={darkMaterial}

          // Polygons — dark land masses
          polygonsData={countries.features}
          polygonCapColor={POLYGON_CAP_COLOR}
          polygonSideColor={POLYGON_SIDE_COLOR}
          polygonStrokeColor={POLYGON_STROKE_COLOR}
          polygonAltitude={0.005}
          onPolygonHover={NOOP}
          polygonLabel={EMPTY_LABEL}

          // Arcs — red connection lines
          arcsData={ARCS}
          arcColor={ARC_COLOR}
          arcAltitudeAutoScale={0.6}
          arcStroke={0.1}
          arcDashLength={0.9}
          arcDashGap={4}
          arcDashAnimateTime={3000}
          arcDashInitialGap={ARC_INITIAL_GAP}
          onArcHover={NOOP}
          arcLabel={EMPTY_LABEL}
        />
      )}
    </div>
  );
}
