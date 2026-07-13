"use client";

export default function CrackedEarth() {
  return (
    <>
      {/* The cracked pattern layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#FFFBF2", // Keep base cream color
          filter: "url(#cracks)",
          opacity: 0.27,
          zIndex: 1,
        }}
      />

      {/* SVG filter definition — zero-size, invisible */}
      <svg width={0} height={0} className="absolute">
        <filter id="cracks">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02"
            numOctaves={5}
            seed={10}
            result="noise"
          />
          <feColorMatrix
            type="luminanceToAlpha"
            in="noise"
            result="alphaNoise"
          />
          <feComponentTransfer in="alphaNoise" result="plates">
            <feFuncA type="discrete" tableValues="0 1" />
          </feComponentTransfer>
          <feConvolveMatrix
            order="3 3"
            kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1"
            in="plates"
            result="edges"
          />
          <feComponentTransfer in="edges" result="invertedEdges">
            <feFuncR type="table" tableValues="1 0" />
            <feFuncG type="table" tableValues="1 0" />
            <feFuncB type="table" tableValues="1 0" />
          </feComponentTransfer>
          {/* Use the warm theme accent for the cracks instead of black */}
          <feFlood floodColor="#9ca38f" result="bgColor" />
          <feComposite operator="in" in="bgColor" in2="invertedEdges" />
        </filter>
      </svg>
    </>
  );
}
