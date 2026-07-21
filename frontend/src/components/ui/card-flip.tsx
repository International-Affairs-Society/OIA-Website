"use client";

import { ArrowRight, Repeat2 } from "lucide-react";
import { useState, type CSSProperties } from "react";

export interface CardFlipProps {
  title?: string;
  subtitle?: string;
  description?: string;
  features?: string[];
  imageUrl?: string;
  fillContainer?: boolean;
}

export default function CardFlip({
  title = "Design Systems",
  subtitle = "Explore the fundamentals",
  description = "Dive deep into the world of modern UI/UX design.",
  features = ["UI/UX", "Modern Design", "Tailwind CSS", "Kokonut UI"],
  imageUrl,
  fillContainer = false,
}: CardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const containerStyle: CSSProperties = {
    position: "relative",
    height: fillContainer ? "100%" : "384px",
    width: "100%",
    maxWidth: fillContainer ? "none" : "336px",
    perspective: "2000px",
    cursor: "pointer",
    margin: fillContainer ? undefined : "0 auto",
  };

  const innerStyle: CSSProperties = {
    position: "relative",
    height: "100%",
    width: "100%",
    transformStyle: "preserve-3d",
    transition: "transform 500ms cubic-bezier(0.77, 0, 0.175, 1)",
    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
  };

  const faceBaseStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    height: "100%",
    width: "100%",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    borderRadius: "16px",
    overflow: "hidden",
  };

  const frontStyle: CSSProperties = {
    ...faceBaseStyle,
    transform: "rotateY(0deg)",
    backgroundColor: "#FFFBF2",
    border: "1px solid rgba(230, 57, 70, 0.15)",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
  };

  const backStyle: CSSProperties = {
    ...faceBaseStyle,
    transform: "rotateY(180deg)",
    backgroundColor: "#FFFBF2",
    border: "1px solid rgba(230, 57, 70, 0.25)",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
  };

  const imageContainerStyle: CSSProperties = {
    position: "relative",
    height: "100%",
    overflow: "hidden",
    backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: imageUrl ? "transparent" : "#f5f0e8",
    background: imageUrl
      ? `url(${imageUrl}) center/cover no-repeat`
      : "linear-gradient(to bottom, #f5f0e8, #FFFBF2)",
  };

  const overlayStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.1))",
  };

  return (
    <div
      style={containerStyle}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div style={innerStyle}>
        {/* ═══ FRONT FACE ═══ */}
        <div style={frontStyle}>
          <div style={imageContainerStyle}>
            {imageUrl && <div style={overlayStyle} />}

            {!imageUrl && (
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  paddingTop: "96px",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    height: "100px",
                    width: "200px",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        height: "50px",
                        width: "50px",
                        borderRadius: "140px",
                        opacity: 0,
                        boxShadow: "0 0 50px rgba(230, 57, 70, 0.5)",
                        animation: "cardflip-scale 3s linear infinite",
                        animationDelay: `${i * 0.3}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Front bottom text */}
          <div
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              left: 0,
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontWeight: 600,
                    fontSize: "18px",
                    lineHeight: 1.3,
                    letterSpacing: "-0.04em",
                    color: imageUrl ? "white" : "#393939",
                    margin: 0,
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    letterSpacing: "-0.01em",
                    color: imageUrl ? "rgba(255,255,255,0.8)" : "#6b6b6b",
                    margin: "6px 0 0 0",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {subtitle}
                </p>
              </div>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <Repeat2
                  aria-hidden="true"
                  style={{
                    height: "16px",
                    width: "16px",
                    color: "#e63946",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ═══ BACK FACE ═══ */}
        <div style={backStyle}>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <h3
              style={{
                fontWeight: 600,
                fontSize: "18px",
                lineHeight: 1.3,
                letterSpacing: "-0.01em",
                color: "#393939",
                margin: 0,
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: "14px",
                letterSpacing: "-0.01em",
                color: "#6b6b6b",
                margin: "8px 0 0 0",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {description}
            </p>

            <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "14px",
                    color: "#393939",
                    transition: "transform 300ms cubic-bezier(0.23,1,0.32,1), opacity 300ms cubic-bezier(0.23,1,0.32,1)",
                    transform: isFlipped ? "translateX(0)" : "translateX(-10px)",
                    opacity: isFlipped ? 1 : 0,
                    transitionDelay: `${index * 50 + 150}ms`,
                  }}
                >
                  <ArrowRight
                    aria-hidden="true"
                    style={{ height: "12px", width: "12px", color: "#e63946", flexShrink: 0 }}
                  />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: "24px",
              borderTop: "1px solid rgba(230, 57, 70, 0.1)",
              paddingTop: "24px",
            }}
          >
            <button
              type="button"
              className="cardflip-btn"
              style={{
                position: "relative",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px",
                margin: "-12px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(to right, #f5f0e8, #f5f0e8, #f5f0e8)",
                cursor: "pointer",
                transition: "transform 300ms, background 300ms",
              }}
            >
              <span
                className="cardflip-btn-text"
                style={{
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "#393939",
                  transition: "color 300ms",
                }}
              >
                View Details
              </span>
              <ArrowRight
                aria-hidden="true"
                className="cardflip-btn-icon"
                style={{
                  height: "16px",
                  width: "16px",
                  color: "#e63946",
                  transition: "transform 300ms",
                }}
              />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cardflip-scale {
          0% {
            transform: scale(2);
            opacity: 0;
            box-shadow: 0px 0px 50px rgba(230, 57, 70, 0.5);
          }
          50% {
            transform: translate(0px, -5px) scale(1);
            opacity: 1;
            box-shadow: 0px 8px 20px rgba(230, 57, 70, 0.5);
          }
          100% {
            transform: translate(0px, 5px) scale(0.1);
            opacity: 0;
            box-shadow: 0px 10px 20px rgba(230, 57, 70, 0);
          }
        }
        .cardflip-btn:hover {
          transform: scale(1.02);
          background: linear-gradient(to right, rgba(230,57,70,0.1), rgba(230,57,70,0.05), transparent) !important;
        }
        .cardflip-btn:active {
          transform: scale(0.98);
        }
        .cardflip-btn:hover .cardflip-btn-text {
          color: #e63946 !important;
        }
        .cardflip-btn:hover .cardflip-btn-icon {
          transform: translateX(2px) scale(1.1);
        }
      `}</style>
    </div>
  );
}
