"use client";
import React from "react";

interface SearchInputProps {
  placeholder?: string;
  onChange?: (value: string) => void;
}

export default function SearchInput({ placeholder, onChange }: SearchInputProps) {
  return (
    <div className="custom-search-container">
      <div className="search-container-inner">
        <input 
          className="search-input" 
          type="text" 
          placeholder={placeholder || "Search..."}
          onChange={(e) => onChange && onChange(e.target.value)}
        />
        <svg viewBox="0 0 24 24" className="search-icon">
          <g>
            <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z">
            </path>
          </g>
        </svg>
      </div>

      <style>{`
        .custom-search-container {
          position: relative;
          background: linear-gradient(135deg, #d3d9c3 0%, #b5bda0 100%);
          border-radius: 1000px;
          padding: 8px;
          display: flex;
          z-index: 0;
          width: 100%;
          max-width: 100%;
        }

        .search-container-inner {
          position: relative;
          width: 100%;
          border-radius: 50px;
          background: linear-gradient(135deg, #fdfaf5 0%, #f5f0e8 100%);
          padding: 4px;
          display: flex;
          align-items: center;
        }

        .search-container-inner::after, .search-container-inner::before {
          content: "";
          width: 100%;
          height: 100%;
          border-radius: inherit;
          position: absolute;
        }

        .search-container-inner::before {
          top: -1px;
          left: -1px;
          background: linear-gradient(0deg, #fdfaf5 0%, #ffffff 100%);
          z-index: -1;
        }

        .search-container-inner::after {
          bottom: -1px;
          right: -1px;
          background: linear-gradient(0deg, #b5bda0 0%, #e2e6d5 100%);
          box-shadow: rgba(122, 140, 94, 0.25) 3px 3px 5px 0px, rgba(122, 140, 94, 0.15) 5px 5px 20px 0px;
          z-index: -2;
        }

        .search-input {
          padding: 8px 12px;
          width: 100%;
          background: transparent;
          border: none;
          color: #1a1a1a;
          font-size: 14px;
          font-family: var(--font-outfit), sans-serif;
          border-radius: 50px;
        }

        .search-input::placeholder {
          color: #8c8c8c;
        }

        .search-input:focus {
          outline: none;
          background: linear-gradient(135deg, #ffffff 0%, #fdfaf5 100%);
        }

        .search-icon {
          width: 36px;
          aspect-ratio: 1;
          border-left: 2px solid #b5bda0;
          border-top: 3px solid transparent;
          border-bottom: 3px solid transparent;
          border-radius: 50%;
          padding-left: 8px;
          margin-right: 6px;
          transition: border-color 0.2s;
        }

        .search-container-inner:hover .search-icon {
          border-left: 3px solid #7A8C5E;
        }

        .search-icon path {
          fill: #7A8C5E;
        }
      `}</style>
    </div>
  );
}
