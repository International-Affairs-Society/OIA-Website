"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader, FormField, CustomDropdown } from "../../../components";
import { useAuth } from "@/app/admin/roles/AuthContext";

const MAX_WORDS = 60;

function countWords(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export default function EditEventPage() {
  const router = useRouter();
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<"details" | "media">("details");
  const [description, setDescription] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = countWords(description);
  const isOverLimit = wordCount > MAX_WORDS;

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/admin/events" style={{ color: "#6b6b6b", textDecoration: "none", fontSize: "14px" }}>
          &larr; Back to Events
        </Link>
      </div>

      <AdminPageHeader title="Edit Event" />

      <div style={{ border: "1px solid #b5bda0", padding: "2rem", backgroundColor: "#f5f0e8", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <form onSubmit={(e) => { e.preventDefault(); router.push("/admin/events"); }}>
          <FormField label="Title" required>
            <input type="text" placeholder="Enter here" />
          </FormField>
          <FormField label="Description">
            <textarea
              ref={textareaRef}
              rows={4}
              placeholder="Enter a brief description of the event..."
              value={description}
              onChange={handleDescriptionChange}
              style={{
                resize: "none",
                overflow: "hidden",
                minHeight: "100px",
                transition: "height 0.1s ease",
              }}
            />
            {/* Word count disclaimer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
              <span style={{ fontSize: "12px", color: "#6b6b6b", lineHeight: 1.5 }}>
                ⚠ Keep description under <strong>{MAX_WORDS} words</strong> — this text appears alongside the event poster in the upcoming events carousel. Longer descriptions may overflow the display area.
              </span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: isOverLimit ? "#c0392b" : "#5C6B3F", whiteSpace: "nowrap", marginLeft: "12px" }}>
                {wordCount} / {MAX_WORDS}
              </span>
            </div>
          </FormField>
          <FormField label="Location">
            <input type="text" placeholder="Enter here" />
          </FormField>
          <FormField label="Date">
            <input type="date" />
          </FormField>

          <FormField label="Link MOU">
            <CustomDropdown
              onChange={() => { }}
              options={[
                { value: "", label: "None" },
                { value: "1", label: "UOL MOU" },
                { value: "2", label: "TII MOU" },
              ]}
            />
          </FormField>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "1rem" }}>
            <input type="checkbox" id="archive-event" />
            <label htmlFor="archive-event" style={{ fontSize: "13px", color: "#6b6b6b" }}>Archive this event</label>
          </div>

          {/* ── Media Upload ── */}
          <div style={{ marginTop: "1.5rem" }}>
            <FormField label="Event Poster / Cover Image">
              <div style={{ border: "1px dashed #b5bda0", padding: "2rem", textAlign: "center", backgroundColor: "transparent" }}>
                <input type="file" accept="image/png,image/jpeg,image/webp" id="media-upload-upcoming" style={{ display: "none" }} />
                <label htmlFor="media-upload-upcoming" style={{ cursor: "pointer", color: "#1a1a1a", fontSize: "14px", fontWeight: 500, textDecoration: "underline" }}>
                  Click to upload cover image
                </label>
                <div style={{ fontSize: "12px", color: "#6b6b6b", marginTop: "8px" }}>PNG, JPG, or WebP — only one file allowed</div>
              </div>
              <div
                style={{
                  marginTop: "10px",
                  padding: "10px 14px",
                  backgroundColor: "rgba(122, 140, 94, 0.08)",
                  border: "1px solid rgba(122, 140, 94, 0.25)",
                  fontSize: "12px",
                  lineHeight: 1.6,
                  color: "#5C6B3F",
                }}
              >
                <strong>⚠ Image Resolution Guide:</strong> For the upcoming events section, the card displays images at a <strong>3:4 portrait aspect ratio</strong>. 
                For best results, upload an image with a resolution of <strong>600 × 800 px</strong> (or any resolution maintaining a 3:4 ratio, e.g. 900 × 1200 px). 
                Images that do not match this ratio will be center-cropped automatically.
              </div>
            </FormField>
          </div>



          {/* ── Submit / Cancel ── */}
          <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
            <button
              type="submit"
              style={{
                padding: "10px 24px",
                backgroundColor: "#1a1a1a",
                color: "#f5f0e8",
                border: "none",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {role === 'editor' || role === 'admin' ? 'Send for Approval' : 'Update Event'}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/events")}
              style={{
                padding: "10px 24px",
                backgroundColor: "transparent",
                color: "#1a1a1a",
                border: "1px solid #1a1a1a",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
