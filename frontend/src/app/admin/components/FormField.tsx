"use client";
import React from "react";

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export default function FormField({
  label,
  required,
  error,
  children,
}: FormFieldProps) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          fontSize: "13px",
          color: "#6b6b6b",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "#c0392b", marginLeft: "4px" }}>*</span>
        )}
      </label>
      
      <style>{`
        .form-field-wrapper input:not([type="checkbox"]):not([type="radio"]):not([type="file"]),
        .form-field-wrapper select,
        .form-field-wrapper textarea {
          width: 100%;
          padding: 1rem;
          border: none;
          background-color: #ffffff;
          border-radius: 1rem;
          font-size: 1rem;
          color: #1a1a1a;
          outline: none;
          box-shadow: 0 0.4rem #b5bda0; /* Solid olive shadow */
          transition: outline 0.2s, box-shadow 0.2s, transform 0.1s;
        }
        
        .form-field-wrapper input:not([type="checkbox"]):not([type="file"]):focus,
        .form-field-wrapper select:focus,
        .form-field-wrapper textarea:focus {
          outline: 2px solid #e63946;
          outline-offset: 2px;
        }

        .form-field-wrapper input:not([type="checkbox"]):not([type="file"]):active,
        .form-field-wrapper select:active,
        .form-field-wrapper textarea:active {
          transform: translateY(0.2rem);
          box-shadow: 0 0.2rem #b5bda0;
        }

        .form-field-wrapper input::placeholder,
        .form-field-wrapper textarea::placeholder {
          color: #a0a0a0;
        }
      `}</style>
      <div className="form-field-wrapper" style={{ width: "100%" }}>
        {children}
      </div>

      {error && (
        <p
          style={{
            margin: "4px 0 0 0",
            fontSize: "12px",
            color: "#c0392b",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
