"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/admin/roles/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { GlobeIcon, ArrowRight } from "lucide-react";

export default function LeadCaptureModal() {
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const hasFilled = localStorage.getItem("leadFormFilled_v4") === "true";
    // Temporarily removed !isAuthenticated check so you can test it while logged in
    if (!hasFilled) {
      setShowModal(true);
      document.body.style.overflow = "hidden";

      window.history.pushState(null, "", window.location.href);
      const handlePopState = () => {
        window.history.pushState(null, "", window.location.href);
      };
      window.addEventListener("popstate", handlePopState);

      return () => {
        document.body.style.overflow = "auto";
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!showModal) return;

    const blockScroll = (e: Event) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      const scrollKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
      if (scrollKeys.includes(e.key)) e.preventDefault();
    };

    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });
    window.addEventListener("keydown", blockKeys, { passive: false });

    return () => {
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
      window.removeEventListener("keydown", blockKeys);
    };
  }, [showModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !number.trim() || !email.trim()) {
      setError("All fields are required to continue.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        phone: number.trim(),
        email: email.trim(),
        source_page: typeof window !== "undefined" ? window.location.pathname : "/programs"
      };

      const res = await apiFetch(`/api/v1/program-leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.error?.message || "Failed to save details. Please try again.");
        return;
      }

      const newLead = {
        id: Date.now().toString(),
        name: name.trim(),
        phone: number.trim(),
        email: email.trim(),
        date: new Date().toISOString(),
      };

      const existingLeads = JSON.parse(localStorage.getItem("program_leads_data") || "[]");
      existingLeads.push(newLead);
      localStorage.setItem("program_leads_data", JSON.stringify(existingLeads));

      localStorage.setItem("leadFormFilled_v4", "true");
      setShowModal(false);
      document.body.style.overflow = "auto";
    } catch (err) {
      console.error("Failed to save lead:", err);
      setError("Network error. Please try again.");
    }
  };

  if (!showModal) return null;

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%",
    padding: "14px 16px",
    fontSize: "14px",
    fontFamily: "var(--font-outfit)",
    color: "#1a1a1a",
    backgroundColor: focusedField === field ? "#fff" : "#f9f7f1",
    border: focusedField === field ? "1.5px solid #5C6B3F" : "1px solid #d4cfc4",
    borderRadius: "10px",
    outline: "none",
    transition: "all 0.25s ease",
    boxShadow: focusedField === field ? "0 0 0 3px rgba(92, 107, 63, 0.12)" : "none",
  });

  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#5C6B3F",
    fontFamily: "var(--font-outfit)",
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(10, 10, 10, 0.70)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.92 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "540px",
            margin: "0 16px",
            overflow: "hidden",
            backgroundColor: "#FFFBF2",
            borderRadius: "20px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(181,189,160,0.3)",
          }}
        >
          {/* Top accent bar */}
          <div
            style={{
              width: "100%",
              height: "5px",
              background: "linear-gradient(90deg, #5C6B3F, #7A8C5E, #b5bda0)",
            }}
          />

          {/* Icon + Header area */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "clamp(32px, 6vw, 48px) clamp(24px, 5vw, 56px) clamp(16px, 4vw, 24px)",
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                backgroundColor: "rgba(92, 107, 63, 0.1)",
                border: "1px solid rgba(92, 107, 63, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "24px",
              }}
            >
              <GlobeIcon size={28} color="#5C6B3F" strokeWidth={1.5} />
            </motion.div>

            <h2
              style={{
                textAlign: "center",
                lineHeight: 1.1,
                marginBottom: "12px",
                fontFamily: "var(--font-instrument-serif)",
                fontSize: "32px",
                color: "#1a1a1a",
                fontWeight: 400,
              }}
            >
              Unlock Global Opportunities
            </h2>

            <p
              style={{
                textAlign: "center",
                fontFamily: "var(--font-outfit)",
                fontSize: "14px",
                color: "#7a7a7a",
                lineHeight: 1.6,
                maxWidth: "340px",
                margin: 0,
              }}
            >
              Tell us a bit about yourself and explore international exchange
              programs, immersions, and pathways.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: "8px clamp(24px, 5vw, 56px) clamp(32px, 6vw, 48px)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Name */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g. Arjun Sharma"
                  style={inputStyle("name")}
                />
              </div>

              {/* Phone */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={labelStyle}>Phone Number</label>
                <input
                  type="tel"
                  value={number}
                  onChange={(e) => { setNumber(e.target.value); setError(""); }}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="+91 98765 43210"
                  style={inputStyle("phone")}
                />
              </div>

              {/* Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  style={inputStyle("email")}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: "12px",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  textAlign: "center",
                  fontSize: "12px",
                  fontWeight: 500,
                  backgroundColor: "rgba(192, 57, 43, 0.08)",
                  color: "#c0392b",
                  border: "1px solid rgba(192, 57, 43, 0.15)",
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Submit button */}
            <motion.button
              type="submit"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                marginTop: "28px",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "16px 24px",
                borderRadius: "12px",
                backgroundColor: "#1a1a1a",
                color: "#FFFBF2",
                border: "none",
                fontFamily: "var(--font-outfit)",
                fontSize: "13px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                transition: "box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.15)";
              }}
            >
              Explore Programs
              <ArrowRight size={16} />
            </motion.button>

            {/* Bottom note */}
            <p
              style={{
                marginTop: "20px",
                textAlign: "center",
                fontFamily: "var(--font-outfit)",
                fontSize: "11px",
                color: "#aaa",
                lineHeight: 1.5,
              }}
            >
              Your information is secure and will only be used to personalise your experience.
            </p>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
