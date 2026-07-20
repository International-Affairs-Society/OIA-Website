import React from 'react';

interface LiquidGlassProps {
  backgroundColor?: string;
  borderColor?: string;
}

export default function LiquidGlass({ 
  backgroundColor = "rgba(240, 235, 225, 0.4)",
  borderColor = "rgba(255, 255, 255, 0.7)"
}: LiquidGlassProps) {
  return (
    <>
      <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true">
        <filter id="lg-dist">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      
      {/* Base blur + SVG distortion */}
      <div style={{
        position: "absolute", inset: 0, zIndex: -1,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        filter: "url(#lg-dist)",
        pointerEvents: "none",
        borderRadius: "inherit"
      }} />
      
      {/* Color overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: -1,
        backgroundColor,
        pointerEvents: "none",
        borderRadius: "inherit"
      }} />
      
      {/* Specular highlight (shiny edge) */}
      <div style={{
        position: "absolute", inset: 0, zIndex: -1,
        boxShadow: `inset 1px 1px 0 ${borderColor}, inset 0 0 10px rgba(255,255,255,0.2)`,
        borderRadius: "inherit",
        pointerEvents: "none"
      }} />
    </>
  );
}
