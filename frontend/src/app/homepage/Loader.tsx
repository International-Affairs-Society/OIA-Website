"use client";

import React from "react";

const Loader: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "3rem",
      }}
    >
      <div className="vortex-loader" />
      <style>{`
        .vortex-loader {
          width: 12.25rem;
          height: 12.25rem;
          border: 0.4375rem #393939 solid;
          border-radius: 1.225rem;
          overflow: hidden;
          position: relative;
        }

        .vortex-loader:after, .vortex-loader:before {
          content: '';
          border-radius: 50%;
          position: absolute;
          width: inherit;
          height: inherit;
          animation: spVortex 2s infinite linear;
        }

        .vortex-loader:before {
          border-top: 1.575rem #e63946 solid;
          top: -0.7875rem;
          left: calc(-50% - 0.7875rem);
          transform-origin: right center;
        }

        .vortex-loader:after {
          border-bottom: 1.575rem #C5A880 solid;
          top: 0.7875rem;
          right: calc(-50% - 0.7875rem);
          transform-origin: left center;
        }

        @keyframes spVortex {
          from { transform: rotate(0deg); }
          to { transform: rotate(359deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
