"use client";

import React, { useState } from "react";
import { Camera, CheckCircle2, ChevronRight, UploadCloud } from "lucide-react";

interface CompleteProfileModalProps {
  user?: {
    name: string;
    email: string;
    enrollmentNumber: string;
    course: string;
    mobile?: string;
  };
  onComplete?: (data: { mobile: string; photo: File | null }) => void;
}

export default function CompleteProfileModal({
  user = {
    name: "John Doe",
    email: "john.doe@bennett.edu.in",
    enrollmentNumber: "E20CS123",
    course: "B.Tech CSE",
  },
  onComplete,
}: CompleteProfileModalProps) {
  const [mobile, setMobile] = useState(user.mobile || "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onComplete) {
      onComplete({ mobile, photo });
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(26,26,26,0.6)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "#f5f0e8",
        width: "100%",
        maxWidth: "520px",
        borderRadius: "16px",
        padding: "40px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Subtle Background Accent */}
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "150px",
          height: "150px",
          backgroundColor: "#5C6B3F",
          opacity: 0.05,
          borderRadius: "50%"
        }} />

        <div style={{ textAlign: "center", marginBottom: "32px", position: "relative", zIndex: 1 }}>
          <h2 style={{
            fontFamily: "var(--font-space-grotesk)",
            fontSize: "28px",
            fontWeight: 600,
            color: "#1a1a1a",
            margin: "0 0 8px 0"
          }}>
            Complete Your Profile
          </h2>
          <p style={{ margin: 0, color: "rgba(26,26,26,0.5)", fontSize: "14px" }}>
            Please verify your details and add a photo to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ position: "relative", zIndex: 1 }}>
          {/* Photo Upload Area */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
            <label style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              backgroundColor: "rgba(92,107,63,0.08)",
              border: "1px dashed rgba(92,107,63,0.3)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              overflow: "hidden",
              position: "relative",
              transition: "all 0.3s ease"
            }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(92,107,63,0.12)" }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(92,107,63,0.08)" }}
            >
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
              {preview ? (
                <img src={preview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <>
                  <Camera size={28} color="#5C6B3F" style={{ marginBottom: "8px", opacity: 0.8 }} />
                  <span style={{ fontSize: "11px", color: "#5C6B3F", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Add Photo</span>
                </>
              )}
            </label>
          </div>

          {/* Form Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
            
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(26,26,26,0.5)", marginBottom: "6px" }}>Full Name</label>
                <div style={{ padding: "12px 16px", backgroundColor: "rgba(255,255,255,0.4)", borderRadius: "8px", color: "#1a1a1a", fontSize: "14px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  {user.name}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(26,26,26,0.5)", marginBottom: "6px" }}>Enrollment No.</label>
                <div style={{ padding: "12px 16px", backgroundColor: "rgba(255,255,255,0.4)", borderRadius: "8px", color: "#1a1a1a", fontSize: "14px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  {user.enrollmentNumber}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(26,26,26,0.5)", marginBottom: "6px" }}>Email</label>
                <div style={{ padding: "12px 16px", backgroundColor: "rgba(255,255,255,0.4)", borderRadius: "8px", color: "#1a1a1a", fontSize: "14px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  {user.email}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(26,26,26,0.5)", marginBottom: "6px" }}>Course</label>
                <div style={{ padding: "12px 16px", backgroundColor: "rgba(255,255,255,0.4)", borderRadius: "8px", color: "#1a1a1a", fontSize: "14px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  {user.course}
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(26,26,26,0.5)", marginBottom: "6px" }}>Mobile Number <span style={{color: "#D12027"}}>*</span></label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 "
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  color: "#1a1a1a",
                  fontSize: "14px",
                  border: "1px solid rgba(92,107,63,0.3)",
                  outline: "none",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => e.target.style.borderColor = "#5C6B3F"}
                onBlur={(e) => e.target.style.borderColor = "rgba(92,107,63,0.3)"}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "16px",
              backgroundColor: "#5C6B3F",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#4a5632"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#5C6B3F"; }}
          >
            Save & Continue
            <ChevronRight size={18} />
          </button>

        </form>
      </div>
    </div>
  );
}
