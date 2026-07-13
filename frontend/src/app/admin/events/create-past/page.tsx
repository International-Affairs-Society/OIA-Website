"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader, FormField, CustomDropdown } from "../../components";
import { useAuth } from "@/app/admin/roles/AuthContext";

const MAX_WORDS = 80;

function countWords(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export default function CreatePastEventPage() {
  const router = useRouter();
  const { role } = useAuth();
  const [showOnHomepage, setShowOnHomepage] = useState(false);
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

      <AdminPageHeader title="Add Past Event" />

      <div style={{ border: "1px solid #b5bda0", padding: "2rem", backgroundColor: "#f5f0e8", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <form onSubmit={(e) => { e.preventDefault(); router.push("/admin/events"); }}>
          <FormField label="Title" required>
            <input type="text" placeholder="Enter here" />
          </FormField>
          <FormField label="Description">
            <textarea
              ref={textareaRef}
              rows={4}
              placeholder="Enter a brief description of the past event..."
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
                ⚠ Keep description under <strong>{MAX_WORDS} words</strong> — this text appears on the past event detail card. Longer descriptions may get clipped or overflow the layout.
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


          {/* ── Media Upload (Multiple) ── */}
          <div style={{ marginTop: "1.5rem" }}>
            <FormField label="Event Gallery (Images / Documents)">
              <div style={{ border: "1px dashed #b5bda0", padding: "2rem", textAlign: "center", backgroundColor: "transparent" }}>
                <input type="file" accept="image/png,image/jpeg,image/webp" multiple id="media-upload-past" style={{ display: "none" }} />
                <label htmlFor="media-upload-past" style={{ cursor: "pointer", color: "#1a1a1a", fontSize: "14px", fontWeight: 500, textDecoration: "underline" }}>
                  Click to upload media files
                </label>
                <div style={{ fontSize: "12px", color: "#6b6b6b", marginTop: "8px" }}>PNG, JPG, or WebP — multiple files allowed</div>
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
                <strong>⚠ Image Resolution Guide:</strong> Past event galleries display images at a <strong>16:9 landscape aspect ratio</strong>. 
                For best results, upload images with a resolution of <strong>1280 × 720 px</strong> (or any resolution maintaining a 16:9 ratio, e.g. 1920 × 1080 px). 
                Images that do not match this ratio will be center-cropped automatically. You can upload multiple images to create a gallery carousel.
              </div>
            </FormField>
          </div>

          {/* ── Add to Homepage ── */}
          <div style={{ marginTop: "1.5rem", padding: "1.25rem", border: "1px solid #b5bda0", backgroundColor: "rgba(245, 240, 232, 0.5)" }}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a", marginBottom: "12px", fontFamily: "var(--font-outfit)" }}>
              Add this event to the homepage?
            </div>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "14px", color: "#1a1a1a" }}>
                <input
                  type="radio"
                  name="show-on-homepage"
                  checked={showOnHomepage}
                  onChange={() => setShowOnHomepage(true)}
                  style={{ accentColor: "#5C6B3F" }}
                />
                Yes
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "14px", color: "#1a1a1a" }}>
                <input
                  type="radio"
                  name="show-on-homepage"
                  checked={!showOnHomepage}
                  onChange={() => setShowOnHomepage(false)}
                  style={{ accentColor: "#5C6B3F" }}
                />
                No
              </label>
            </div>

            {/* ── Extended form when "Yes" is selected ── */}
            {showOnHomepage && (
              <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid #b5bda0" }}>
                <FormField label="Homepage Card Image">
                  <div style={{ border: "1px dashed #b5bda0", padding: "2rem", textAlign: "center", backgroundColor: "transparent" }}>
                    <input type="file" accept="image/png,image/jpeg,image/webp" id="homepage-media-upload" style={{ display: "none" }} />
                    <label htmlFor="homepage-media-upload" style={{ cursor: "pointer", color: "#1a1a1a", fontSize: "14px", fontWeight: 500, textDecoration: "underline" }}>
                      Click to upload homepage card image
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
                    <strong>⚠ Image Resolution Guide:</strong> The homepage events section displays cards at a <strong>3:4 portrait aspect ratio</strong> in a 4-column grid. 
                    For sharp rendering, upload an image with a resolution of <strong>600 × 800 px</strong> (or any resolution maintaining a 3:4 ratio, e.g. 900 × 1200 px). 
                    The event title from above will be used as the card label. Images that do not match this ratio will be center-cropped.
                  </div>
                </FormField>
              </div>
            )}
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
              {role === 'editor' || role === 'admin' ? 'Send for Approval' : 'Save Event'}
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
