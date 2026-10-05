"use client";

import React, { memo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const BackgroundMap = memo(() => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.55]" style={{ zIndex: 1, transform: "translateY(12%)" }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 189,
          center: [0, 30],
        }}
        width={1200}
        height={700}
        style={{ width: "117%", height: "117%" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies
              .filter((geo) => {
                const name = geo.properties?.name || geo.properties?.NAME;
                const iso = geo.id;
                return iso !== "ATA" && name !== "Antarctica";
              })
              .map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: "#cbbfa4",
                      stroke: "#f5f0e8",
                      strokeWidth: 0.75,
                      outline: "none",
                    },
                    hover: {
                      fill: "#cbbfa4",
                      outline: "none",
                    },
                    pressed: {
                      fill: "#cbbfa4",
                      outline: "none",
                    },
                  }}
                />
              ))
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
});

BackgroundMap.displayName = "BackgroundMap";

export default BackgroundMap;
