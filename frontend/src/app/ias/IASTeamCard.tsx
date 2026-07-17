"use client";

import type { SpringOptions } from 'motion/react';
import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

interface TiltedCardProps {
  imageSrc?: string;
  altText?: string;
  name: string;
  role: string;
  containerHeight?: React.CSSProperties['height'];
  containerWidth?: React.CSSProperties['width'];
  imageHeight?: React.CSSProperties['height'];
  imageWidth?: React.CSSProperties['width'];
  scaleOnHover?: number;
  rotateAmplitude?: number;
  showTooltip?: boolean;
  department?: string;
  email?: string;
  className?: string;
}

const springValues: SpringOptions = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

export default function IASTeamCard({
  imageSrc,
  altText,
  name,
  role,
  containerHeight = '300px',
  containerWidth = '220px',
  imageHeight = '300px',
  imageWidth = '220px',
  scaleOnHover = 1.05,
  rotateAmplitude = 12,
  showTooltip = true,
  department,
  email,
  className,
}: TiltedCardProps) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const tooltipOpacity = useSpring(0);
  const rotateFigcaption = useSpring(0, {
    stiffness: 350,
    damping: 30,
    mass: 1,
  });

  const [lastY, setLastY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const src =
    imageSrc ??
    `https://randomuser.me/api/portraits/men/1.jpg`;

  function handleMouse(e: React.MouseEvent<HTMLElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude);
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude);
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
    const velocityY = offsetY - lastY;
    rotateFigcaption.set(-velocityY * 0.6);
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover);
    tooltipOpacity.set(1);
    setIsHovered(true);
  }

  function handleMouseLeave() {
    tooltipOpacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
    setIsHovered(false);
  }

  return (
    <figure
      ref={ref}
      className={`team-card-wrapper ${className || ''}`}
      style={{
        height: containerHeight,
        width: containerWidth,
        perspective: '800px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
        margin: 0,
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Tilting image container ── */}
      <motion.div
        className="team-card-inner"
        style={{
          width: imageWidth,
          height: imageHeight,
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d',
          position: 'relative',
          borderRadius: '4px',
          willChange: 'transform',
          boxShadow: isHovered
            ? '0 30px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(209,32,39,0.7)'
            : '0 10px 30px rgba(0,0,0,0.7), 0 0 0 1px rgba(80,80,80,0.3)',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Photo — grayscale default, color on hover */}
        <motion.img
          src={src}
          alt={altText ?? name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '4px',
            filter: isHovered
              ? 'grayscale(0%) contrast(105%) brightness(1.05)'
              : 'grayscale(100%) contrast(115%)',
            transition: 'filter 0.5s ease',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        />

        {/* Dark gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '4px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.05) 100%)',
          zIndex: 1,
        }} />

        {/* Red top border */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          borderRadius: '4px 4px 0 0',
          background: '#D12027',
          zIndex: 2,
        }} />

        {/* Corner dots — top right */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '10px',
          display: 'flex',
          gap: '4px',
          zIndex: 3,
        }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: '#D12027',
            }} />
          ))}
        </div>

        {/* Name + Role overlay */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '12px 14px 16px',
            zIndex: 4,
            translateZ: '30px',
          }}
        >
          <p style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 800,
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            fontFamily: 'var(--font-outfit), sans-serif',
            lineHeight: 1.2,
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          }}>
            {name}
          </p>
          <p style={{
            margin: '5px 0 0 0',
            fontSize: '10px',
            fontWeight: 600,
            color: '#D12027',
            textTransform: 'uppercase',
            letterSpacing: '0.13em',
            fontFamily: 'var(--font-outfit), sans-serif',
          }}>
            {role}
          </p>
          {department && (
            <p style={{
              margin: '3px 0 0 0',
              fontSize: '9px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.7)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontFamily: 'var(--font-outfit), sans-serif',
            }}>
              {department}
            </p>
          )}
          {email && (
            <p style={{
              margin: '3px 0 0 0',
              fontSize: '9px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.05em',
              fontFamily: 'var(--font-outfit), sans-serif',
            }}>
              {email}
            </p>
          )}
        </motion.div>
      </motion.div>

      {/* ── Floating red tooltip ── */}
      {showTooltip && (
        <motion.figcaption
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            left: 0,
            top: 0,
            borderRadius: '4px',
            backgroundColor: '#D12027',
            padding: '4px 10px',
            fontSize: '10px',
            fontWeight: 600,
            color: '#fff',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-outfit), sans-serif',
            zIndex: 10,
            whiteSpace: 'nowrap',
            x,
            y,
            opacity: tooltipOpacity,
            rotate: rotateFigcaption,
          }}
        >
          {name}
        </motion.figcaption>
      )}
    </figure>
  );
}
