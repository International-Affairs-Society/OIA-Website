"use client";
import React from "react";

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function AdminButton({ children, className = "", ...props }: AdminButtonProps) {
  return (
    <>
      <style>{`
        .btn-12,
        .btn-12 *,
        .btn-12 :after,
        .btn-12 :before,
        .btn-12:after,
        .btn-12:before {
          border: 0 solid;
          box-sizing: border-box;
        }

        .btn-12 {
          -webkit-tap-highlight-color: transparent;
          -webkit-appearance: button;
          background-color: #000;
          background-image: none;
          color: #fff;
          cursor: pointer;
          font-family: var(--font-outfit), sans-serif;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.5;
          margin: 0;
          -webkit-mask-image: -webkit-radial-gradient(#000, #fff);
          padding: 0;
          text-transform: uppercase;
          border-radius: 99rem;
          border-width: 2px;
          overflow: hidden;
          padding: 0.6rem 2rem;
          position: relative;
        }

        .btn-12:disabled {
          cursor: default;
          opacity: 0.5;
        }

        .btn-12:-moz-focusring {
          outline: auto;
        }

        .btn-12 span {
          position: relative;
          z-index: 10;
          mix-blend-mode: difference;
        }

        .btn-12:after,
        .btn-12:before {
          background: linear-gradient(
            90deg,
            #fff 25%,
            transparent 0,
            transparent 50%,
            #fff 0,
            #fff 75%,
            transparent 0
          );
          content: "";
          inset: 0;
          position: absolute;
          transform: translateY(var(--progress, 100%));
          transition: transform 0.2s ease;
          z-index: 0;
        }

        .btn-12:after {
          --progress: -100%;
          background: linear-gradient(
            90deg,
            transparent 0,
            transparent 25%,
            #fff 0,
            #fff 50%,
            transparent 0,
            transparent 75%,
            #fff 0
          );
          z-index: -1;
        }

        .btn-12:hover:after,
        .btn-12:hover:before {
          --progress: 0;
        }

        @media (max-width: 768px) {
          .btn-12 {
            font-size: 11.5px;
            padding: 0.5rem 1.6rem;
          }
        }
      `}</style>
      <button className={`btn-12 ${className}`} {...props}>
        <span>{children}</span>
      </button>
    </>
  );
}
