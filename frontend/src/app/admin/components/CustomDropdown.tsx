"use client";
import React, { useState, useRef, useEffect } from "react";

export interface Option {
  label: string;
  value: string;
  isHeader?: boolean;
}

export interface CustomDropdownProps {
  value?: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
}

export default function CustomDropdown({ value, onChange, options, placeholder = "Select..." }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalVal, setInternalVal] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentValue = value !== undefined ? value : internalVal;
  const selectedOption = options.find((opt) => opt.value === currentValue && !opt.isHeader);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className="custom-dropdown-container" ref={dropdownRef}>
      <div 
        className={`dropdown-link ${isOpen ? "open" : ""}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ position: "relative", zIndex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0, flex: 1 }}>{displayLabel}</span>
        <svg viewBox="0 0 360 360" xmlSpace="preserve">
          <g id="SVGRepo_iconCarrier">
            <path id="XMLID_225_" d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393 c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393 s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z" />
          </g>
        </svg>
      </div>

      <div className={`dropdown-submenu ${isOpen ? "open" : ""}`}>
        <div 
          className="dropdown-scroll-area"
          onWheel={(e) => e.stopPropagation()}
        >
          {options.map((opt, index) => (
            <div key={`${opt.value}-${index}`} className="dropdown-item">
              {opt.isHeader ? (
                <div style={{ padding: "8px 16px", fontSize: "11px", fontWeight: 700, color: "#798264", textTransform: "uppercase", letterSpacing: "0.05em", backgroundColor: "rgba(121, 130, 100, 0.05)", borderTop: "1px solid rgba(121, 130, 100, 0.1)", borderBottom: "1px solid rgba(121, 130, 100, 0.1)", marginTop: "4px", marginBottom: "4px" }}>
                  {opt.label}
                </div>
              ) : (
                <div 
                  className="dropdown-link-item"
                  onClick={() => {
                    setInternalVal(opt.value);
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  <span style={{ position: "relative", zIndex: 1 }}>{opt.label}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-dropdown-container {
          font-size: 14px;
          line-height: 1.6;
          color: #1a1a1a;
          position: relative;
          width: 100%;
          min-width: 180px;
          font-family: inherit;
        }

        .dropdown-link {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 16px;
          border-radius: 8px;
          border: 1px solid #b5bda0;
          background-color: #f5f0e8;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.48s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .dropdown-link::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #e63946; /* Bennett Red */
          z-index: 0;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.48s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .dropdown-link svg {
          position: relative;
          z-index: 1;
          width: 12px;
          height: 12px;
          fill: #1a1a1a;
          transition: all 0.48s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .dropdown-link.open {
          color: #ffffff;
          border-radius: 8px 8px 0 0;
          border-color: #e63946;
        }

        .dropdown-link.open::after {
          transform: scaleX(1);
          transform-origin: right;
        }

        .dropdown-link.open svg {
          fill: #ffffff;
          transform: rotate(-180deg);
        }

        .dropdown-submenu {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          border-radius: 0 0 8px 8px;
          border: 1px solid #e63946;
          border-top: transparent;
          background-color: #f5f0e8;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-12px);
          transition: all 0.48s cubic-bezier(0.23, 1, 0.32, 1);
          z-index: 9999;
          overflow: hidden;
        }

        .dropdown-submenu.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
          pointer-events: auto;
        }

        .dropdown-scroll-area {
          max-height: 240px;
          overflow-y: auto;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: #b5bda0 transparent;
          display: flex;
          flex-direction: column;
          width: 100%;
          /* Add slight padding so the square scrollbar track doesn't clip the rounded bottom corner */
          padding-bottom: 4px;
        }

        .dropdown-scroll-area::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .dropdown-scroll-area::-webkit-scrollbar-track {
          background: transparent;
          margin-bottom: 8px; /* keeps scrollbar away from the bottom curve */
        }
        .dropdown-scroll-area::-webkit-scrollbar-thumb {
          background-color: #b5bda0;
          border-radius: 10px;
        }

        .dropdown-item {
          width: 100%;
          transition: all 0.48s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .dropdown-link-item {
          display: block;
          padding: 10px 16px;
          width: 100%;
          position: relative;
          text-align: left;
          cursor: pointer;
          color: #1a1a1a;
          transition: all 0.48s cubic-bezier(0.23, 1, 0.32, 1);
          white-space: nowrap;
        }

        .dropdown-link-item::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          transform: scaleX(0);
          width: 100%;
          height: 100%;
          background-color: #e63946;
          z-index: 0;
          transform-origin: left;
          transition: transform 0.48s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .dropdown-link-item:hover {
          color: #ffffff;
        }

        .dropdown-link-item:hover::before {
          transform: scaleX(1);
          transform-origin: right;
        }
      ` }} />
    </div>
  );
}
