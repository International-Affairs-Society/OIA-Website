"use client";

export default function CrackedEarth() {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#FFFBF2", 
          filter: "url(#cracks)",
          opacity: 0.27,
          zIndex: 1,
        }}
      />
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
          <feFlood floodColor="#9ca38f" result="bgColor" />
          <feComposite operator="in" in="bgColor" in2="invertedEdges" />
        </filter>
      </svg>
    </>
  );
}
