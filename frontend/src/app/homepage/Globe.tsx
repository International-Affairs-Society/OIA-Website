"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useInView } from "framer-motion";

// Dynamically import react-globe.gl to prevent SSR issues (WebGL needs window/document)
const GlobeGL = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: '2px solid transparent',
        borderTopColor: '#9CA38F',
        borderBottomColor: '#9CA38F',
        animation: 'spin 1s linear infinite',
      }} />
    </div>
  ),
});

const INDIA_COORDS = { lat: 20.5937, lng: 78.9629 };

export interface CountryData {
  name: string;
  lat: number;
  lng: number;
  time: string;
}

export const LISTED_COUNTRIES: CountryData[] = [
  { name: "AUSTRALIA", lat: -25.2744, lng: 133.7751, time: "10h" },
  { name: "CANADA", lat: 56.1304, lng: -106.3468, time: "14h" },
  { name: "FRANCE", lat: 46.2276, lng: 2.2137, time: "8.5h" },
  { name: "GERMANY", lat: 51.1657, lng: 10.4515, time: "8h" },
  { name: "GREECE", lat: 39.0742, lng: 21.8243, time: "7h" },
  { name: "INDONESIA", lat: -0.7893, lng: 113.9213, time: "5.5h" },
  { name: "IRELAND", lat: 53.1424, lng: -7.6921, time: "9.5h" },
  { name: "ITALY", lat: 41.8719, lng: 12.5674, time: "8h" },
  { name: "MALAYSIA", lat: 4.2105, lng: 101.9758, time: "5h" },
  { name: "NETHERLANDS", lat: 52.1326, lng: 5.2913, time: "8.5h" },
  { name: "NEW ZEALAND", lat: -40.9006, lng: 174.8860, time: "15h" },
  { name: "RUSSIA", lat: 55.7558, lng: 37.6173, time: "6h" },
  { name: "SINGAPORE", lat: 1.3521, lng: 103.8198, time: "5h" },
  { name: "SOUTH AFRICA", lat: -30.5595, lng: 22.9375, time: "10h" },
  { name: "SOUTH KOREA", lat: 35.9078, lng: 127.7669, time: "6.5h" },
  { name: "SPAIN", lat: 40.4637, lng: -3.7492, time: "9h" },
  { name: "SWITZERLAND", lat: 46.8182, lng: 8.2275, time: "8h" },
  { name: "THAILAND", lat: 15.8700, lng: 100.9925, time: "4h" },
  { name: "UNITED ARAB EMIRATES (UAE)", lat: 23.4241, lng: 53.8478, time: "3.5h" },
  { name: "UNITED KINGDOM", lat: 55.3781, lng: -3.4360, time: "9h" },
  { name: "UNITED STATES (USA)", lat: 37.0902, lng: -95.7129, time: "15h" },
  { name: "VIETNAM", lat: 14.0583, lng: 108.2772, time: "4.5h" },
];

const HIGHLIGHTED_ISO = [
  "IND", "AUS", "CAN", "FRA", "DEU", "GRC", "IDN", "IRL", "ISR", "ITA",
  "JAM", "LTU", "MYS", "MDV", "MLT", "MNG", "MAR", "NLD", "NZL", "NGA",
  "RUS", "SGP", "ZAF", "KOR", "ESP", "CHE", "TWN", "THA", "ARE", "GBR",
  "USA", "VNM"
];

// Generate arcs from India to other countries
const ARCS_DATA = LISTED_COUNTRIES.map((c, i) => ({
  startLat: INDIA_COORDS.lat,
  startLng: INDIA_COORDS.lng,
  endLat: c.lat,
  endLng: c.lng,
  color: "#e63946",
  initialGap: (i * 0.4) % 5,
}));

// Stable callback functions
const POLYGON_CAP_COLOR = (d: any) => HIGHLIGHTED_ISO.includes(d?.properties?.ADM0_A3) ? "#C4CBB7" : "transparent";
const POLYGON_SIDE_COLOR = () => "transparent";
const POLYGON_STROKE_COLOR = () => "#393939"; // Using heading grey for borders
const ARC_COLOR = (d: any) => d.color;
const ARC_INITIAL_GAP = (d: any) => d.initialGap;
const EMPTY_LABEL = () => "";
const NOOP = () => { };

export interface GlobeProps {
  compact?: boolean;
}

export default function Globe({ compact }: GlobeProps = {}) {
  const globeEl = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { amount: 0.2 });
  const [countries, setCountries] = useState({ features: [] });
  const [globeSize, setGlobeSize] = useState(compact ? 600 : 2500);

  // Toggle rotation based on visibility
  useEffect(() => {
    if (globeEl.current) {
      try {
        const controls = globeEl.current.controls();
        if (controls) {
          controls.autoRotate = isInView;
        }
      } catch {}
    }
  }, [isInView]);

  useEffect(() => {
    if (compact) {
      setGlobeSize(545); // 4% reduction
      return;
    }
    const updateSize = () => {
      const w = window.innerWidth;
      const isMobileDevice = w < 768;

      if (globeEl.current) {
        try {
          const controls = globeEl.current.controls();
          if (controls) {
            controls.enableRotate = !isMobileDevice;
          }
        } catch {}
      }

      if (w < 380) {
        setGlobeSize(370);
      } else if (w < 480) {
        setGlobeSize(420);
      } else if (w < 640) {
        setGlobeSize(470);
      } else if (w < 768) {
        setGlobeSize(500);
      } else if (w < 1024) {
        setGlobeSize(470);
      } else if (w < 1280) {
        setGlobeSize(518);
      } else if (w < 1536) {
        setGlobeSize(653);
      } else {
        setGlobeSize(727);
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [compact]);

  // Load Geographic Data for the globe base
  useEffect(() => {
    fetch(
      "/geo-data/ne_110m_admin_0_countries.geojson"
    )
      .then((res) => res.json())
      .then((data) => setCountries(data))
      .catch((err) => console.error("Failed to load map data", err));
  }, []);

  // Create globe material — transparent/wireframe look
  const [globeMaterial, setGlobeMaterial] = useState<any>(null);
  useEffect(() => {
    import("three").then((THREE) => {
      setGlobeMaterial(
        new THREE.MeshBasicMaterial({
          color: "#F6EEDD", // Same as bg to make it look transparent
          transparent: true,
          opacity: 0.1,
          depthWrite: true,
        })
      );
    });
  }, []);

  // ─── CONTROLS SETUP ───
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    let initialized = false;

    const setupControls = () => {
      if (!globeEl.current) return;

      try {
        const controls = globeEl.current.controls();
        if (controls && !initialized) {
          initialized = true;
          const isMobileDevice = window.innerWidth < 768;
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.5;
          controls.enableRotate = !isMobileDevice;
          controls.enablePan = false;
          controls.enableZoom = false;

          // Set initial camera position looking at India
          globeEl.current.pointOfView({ lat: 20.5937, lng: 78.9629, altitude: 2.2 }, 0);

          const dist = controls.getDistance();
          if (dist > 0) {
            controls.minDistance = dist;
            controls.maxDistance = dist;
          }

          clearInterval(intervalId);
        }
      } catch {
        // controls not ready yet
      }
    };

    intervalId = setInterval(setupControls, 200);
    setupControls();

    return () => clearInterval(intervalId);
  }, []);

  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth < 768 : false));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        overflow: 'visible',
        width: compact ? '100%' : globeSize,
        height: compact ? 380 : globeSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: isMobile ? 'none' : 'auto',
      }}
    >
      <GlobeGL
        ref={globeEl}
        width={compact ? 600 : globeSize}
        height={compact ? 380 : globeSize}
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere={false} // Removed atmosphere for clean wireframe look
        showGlobe={true}
        globeMaterial={globeMaterial}

        // Polygons — wireframe look with highlighted countries
        polygonsData={countries.features}
        polygonCapColor={POLYGON_CAP_COLOR}
        polygonSideColor={POLYGON_SIDE_COLOR}
        polygonStrokeColor={POLYGON_STROKE_COLOR}
        polygonAltitude={0.002}
        onPolygonHover={NOOP}
        polygonLabel={EMPTY_LABEL}

        // Arcs — Red lines emerging from India
        arcsData={ARCS_DATA}
        arcColor={ARC_COLOR}
        arcAltitudeAutoScale={0.4}
        arcStroke={0.6}
        arcDashLength={0.4}
        arcDashGap={1}
        arcDashAnimateTime={2000}
        arcDashInitialGap={ARC_INITIAL_GAP}
        onArcHover={NOOP}
        arcLabel={EMPTY_LABEL}
      />
    </div>
  );
}
