"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader, FormField, CustomDropdown, ConfirmModal } from "../../components";
import { useAuth } from "@/app/admin/roles/AuthContext";

const MAX_WORDS = 60;

function countWords(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export default function CreateUpcomingEventPage() {
  const router = useRouter();
  const { role } = useAuth();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState("");
  const [posterRatio, setPosterRatio] = useState<number | null>(null);
  const [linkedMouId, setLinkedMouId] = useState("");
  const [isArchived, setIsArchived] = useState(false);
  const [posterUrl, setPosterUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [mous, setMous] = useState<{ value: string; label: string }[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = countWords(description);
  const isOverLimit = wordCount > MAX_WORDS;

  // Fetch MOUs on mount
  useEffect(() => {
    const fetchMous = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${API_URL}/api/v1/mous`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const json = await res.json();
          const mapped = (json.data || []).map((m: any) => ({
            value: m.id,
            label: m.name
          }));
          setMous([{ value: "", label: "None" }, ...mapped]);
        }
      } catch (err) {
        console.error("Failed to fetch MOUs:", err);
      }
    };
    fetchMous();
  }, []);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const token = localStorage.getItem("access_token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/api/v1/media`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const url = data.publicUrl || data.url;
        setPosterUrl(url);
        
        // Auto-calculate poster ratio from the uploaded image
        const img = new window.Image();
        img.onload = () => {
          const ratio = img.naturalWidth / img.naturalHeight;
          setPosterRatio(Number(ratio.toFixed(4)));
        };
        img.src = url;
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Error uploading file.");
    } finally {
      setIsUploading(false);
    }
  };

  const [showConfirm, setShowConfirm] = useState(false);

  const executeSave = async () => {
    if (!title.trim()) {
      alert("Title is required.");
      return false;
    }
    if (!date) {
      alert("Date is required.");
      return false;
    }
    if (isOverLimit) {
      alert(`Description exceeds the word limit of ${MAX_WORDS} words.`);
      return false;
    }

    try {
      const token = localStorage.getItem("access_token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const payload = {
        title,
        description,
        location,
        date,
        endDate: endDate || null,
        highlights,
        posterRatio,
        linkedMOU: linkedMouId || null,
        isArchived,
        posterUrl: posterUrl || null,
        eventType: "upcoming"
      };

      const res = await fetch(`${API_URL}/api/v1/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return true;
      } else {
        const errorJson = await res.json();
        alert(`Failed to save event: ${errorJson.error?.message || "Unknown error"}`);
        return false;
      }
    } catch (err) {
      console.error("Failed to save event:", err);
      alert("An error occurred while saving the event.");
      return false;
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/admin/events" style={{ color: "#6b6b6b", textDecoration: "none", fontSize: "14px" }}>
          &larr; Back to Events
        </Link>
      </div>

      <AdminPageHeader title="Create Upcoming Event" />

      <div style={{ border: "1px solid #b5bda0", padding: "2rem", backgroundColor: "#f5f0e8", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }}>
          <FormField label="Title" required>
            <input type="text" placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} required />
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
              <span style={{ fontSize: "12px", color: "#6b6b6b", lineHeight: 1.5 }}>
                ⚠ Keep description under <strong>{MAX_WORDS} words</strong> — this text appears alongside the event poster in the upcoming events carousel.
              </span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: isOverLimit ? "#c0392b" : "#5C6B3F", whiteSpace: "nowrap", marginLeft: "12px" }}>
                {wordCount} / {MAX_WORDS}
              </span>
            </div>
          </FormField>
          <FormField label="Location">
            <input type="text" placeholder="Enter location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </FormField>
          <FormField label="Date" required>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </FormField>

          <FormField label="End Date (Optional for multi-day events)">
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </FormField>

          <FormField label="Event Highlights (Max 3 tags)">
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <input
                type="text"
                placeholder="Add a highlight (e.g. Academic, Workshop)"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                disabled={highlights.length >= 3}
                style={{ flex: 1, padding: "8px", border: "1px solid #b5bda0", backgroundColor: "#fff" }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newHighlight.trim() && highlights.length < 3) {
                    setHighlights([...highlights, newHighlight.trim()]);
                    setNewHighlight("");
                  }
                }}
                disabled={!newHighlight.trim() || highlights.length >= 3}
                style={{ padding: "8px 16px", cursor: "pointer", backgroundColor: "#1a1a1a", color: "#f5f0e8", border: "none", fontWeight: 600 }}
              >
                Add
              </button>
            </div>
            {highlights.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                {highlights.map((h, i) => (
                  <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#e8e5d3", border: "1px solid #b5bda0", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>
                    {h}
                    <button
                      type="button"
                      onClick={() => setHighlights(highlights.filter((_, idx) => idx !== i))}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#c0392b", fontWeight: "bold", padding: 0, fontSize: "14px" }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FormField>

          <FormField label="Link MOU">
            <CustomDropdown
              value={linkedMouId}
              onChange={setLinkedMouId}
              options={mous}
            />
          </FormField>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "1rem" }}>
            <input type="checkbox" id="archive-event" checked={isArchived} onChange={(e) => setIsArchived(e.target.checked)} />
            <label htmlFor="archive-event" style={{ fontSize: "13px", color: "#6b6b6b", cursor: "pointer" }}>Archive this event</label>
          </div>

          {/* ── Media Upload ── */}
          <div style={{ marginTop: "1.5rem" }}>
            <FormField label="Event Poster / Cover Image">
              {posterUrl ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-start" }}>
                  <img src={posterUrl} alt="Cover Preview" style={{ maxWidth: "200px", borderRadius: "8px", border: "1px solid #b5bda0" }} />
                  <button
                    type="button"
                    onClick={() => setPosterUrl("")}
                    style={{ padding: "6px 12px", border: "1px solid #c0392b", color: "#c0392b", background: "transparent", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div style={{ border: "1px dashed #b5bda0", padding: "2rem", textAlign: "center", backgroundColor: "transparent" }}>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    id="media-upload-upcoming"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <label htmlFor="media-upload-upcoming" style={{ cursor: isUploading ? "not-allowed" : "pointer", color: "#1a1a1a", fontSize: "14px", fontWeight: 500, textDecoration: "underline" }}>
                    {isUploading ? "Uploading..." : "Click to upload cover image"}
                  </label>
                  <div style={{ fontSize: "12px", color: "#6b6b6b", marginTop: "8px" }}>PNG, JPG, or WebP — only one file allowed</div>
                </div>
              )}
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
                <strong>⚠ Image Resolution Guide:</strong> For the upcoming events section, the card displays images at a <strong>3:4 portrait aspect ratio</strong>. For best results, upload an image with a resolution of <strong>600 × 800 px</strong>.
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

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={executeSave}
        onSuccess={() => router.push("/admin/events")}
        title="Save Event?"
        confirmLabel="Yes"
        cancelLabel="No"
        submittingLabel="Submitting..."
        successLabel="Submitted!"
      />
    </div>
  );
}
