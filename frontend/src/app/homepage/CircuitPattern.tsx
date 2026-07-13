import React from 'react';

const CircuitPattern = () => {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: 0,
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 19px,
            rgba(0, 0, 0, 0.03) 19px,
            rgba(0, 0, 0, 0.03) 20px,
            transparent 20px,
            transparent 39px,
            rgba(0, 0, 0, 0.03) 39px,
            rgba(0, 0, 0, 0.03) 40px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 19px,
            rgba(0, 0, 0, 0.03) 19px,
            rgba(0, 0, 0, 0.03) 20px,
            transparent 20px,
            transparent 39px,
            rgba(0, 0, 0, 0.03) 39px,
            rgba(0, 0, 0, 0.03) 40px
          ),
          radial-gradient(
            circle at 20px 20px,
            rgba(0, 0, 0, 0.05) 2px,
            transparent 2px
          ),
          radial-gradient(
            circle at 40px 40px,
            rgba(0, 0, 0, 0.05) 2px,
            transparent 2px
          )
        `,
        backgroundSize: '40px 40px, 40px 40px, 40px 40px, 40px 40px',
      }}
    />
  );
};

export default CircuitPattern;
