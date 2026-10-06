"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader, FormField, CustomDropdown, ConfirmModal } from "../../components";
import { useAuth } from "@/app/admin/roles/AuthContext";
import { apiFetch } from "@/lib/apiFetch";

const MAX_WORDS = 80;

function countWords(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export default function CreatePastEventPage() {
  const router = useRouter();
  const { role } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [linkedMouId, setLinkedMouId] = useState("");
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [features, setFeatures] = useState<string[]>([""]);
  const [posterUrl, setPosterUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [mous, setMous] = useState<{ value: string; label: string }[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = countWords(description);
  const isOverLimit = wordCount > MAX_WORDS;

  // Fetch MOUs on mount
  useEffect(() => {
    const fetchMous = async () => {
      try {
        const res = await apiFetch(`/api/v1/mous`);
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

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploadingGallery(true);

      const uploaded: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const res = await apiFetch(`/api/v1/media`, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          uploaded.push(data.publicUrl || data.url);
        }
      }
      setGalleryUrls((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error("Error uploading gallery files:", err);
      alert("Error uploading some gallery files.");
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPoster(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await apiFetch(`/api/v1/media`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setPosterUrl(data.publicUrl || data.url);
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      console.error("Error uploading poster file:", err);
      alert("Error uploading poster file.");
    } finally {
      setIsUploadingPoster(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
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
      const payload = {
        title,
        description,
        location,
        date,
        linkedMouId: linkedMouId || null,
        addToHomepage: showOnHomepage,
        subtitle: showOnHomepage ? subtitle : undefined,
        highlights: showOnHomepage ? features.filter(f => f.trim() !== "") : [],
        posterUrl: showOnHomepage ? (posterUrl || null) : null,
        galleryUrls,
        eventType: "past"
      };

      const res = await apiFetch(`/api/v1/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

      <AdminPageHeader title="Add Past Event" />

      <div className="admin-form-container" style={{ border: "1px solid #b5bda0", padding: "2rem", backgroundColor: "#f5f0e8", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }}>
          <FormField label="Title" required>
            <input type="text" placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} required />
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
              <span style={{ fontSize: "12px", color: "#6b6b6b", lineHeight: 1.5 }}>
                ⚠ Keep description under <strong>{MAX_WORDS} words</strong> — this text appears on the past event detail card.
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
          <FormField label="Link MOU">
            <CustomDropdown
              value={linkedMouId}
              onChange={setLinkedMouId}
              options={mous}
            />
          </FormField>

          {/* ── Media Upload (Multiple) ── */}
          <div style={{ marginTop: "1.5rem" }}>
            <FormField label="Event Gallery (Images / Documents)">
              <div className="admin-upload-box" style={{ border: "1px dashed #b5bda0", padding: "2rem", textAlign: "center", backgroundColor: "transparent" }}>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime,application/pdf"
                  multiple
                  id="media-upload-past"
                  style={{ display: "none" }}
                  onChange={handleGalleryUpload}
                  disabled={isUploadingGallery}
                />
                <label htmlFor="media-upload-past" style={{ cursor: isUploadingGallery ? "not-allowed" : "pointer", color: "#1a1a1a", fontSize: "14px", fontWeight: 500, textDecoration: "underline" }}>
                  {isUploadingGallery ? "Uploading..." : "Click to upload media files"}
                </label>
                <div style={{ fontSize: "12px", color: "#6b6b6b", marginTop: "8px" }}>PNG, JPG, or WebP — multiple files allowed</div>
              </div>

              {/* Gallery Image Previews */}
              {galleryUrls.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "12px" }}>
                  {galleryUrls.map((url, index) => (
                    <div key={index} style={{ position: "relative", width: "100px", height: "100px", border: "1px solid #b5bda0", borderRadius: "4px", overflow: "hidden" }}>
                      <img src={url} alt={`Gallery ${index}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        style={{
                          position: "absolute",
                          top: "2px",
                          right: "2px",
                          backgroundColor: "rgba(192, 57, 43, 0.8)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
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
                <strong>⚠ Image Resolution Guide:</strong> Past event galleries display images at a <strong>16:9 landscape aspect ratio</strong>. For best results, upload images with a resolution of <strong>1280 × 720 px</strong>.
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
              <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid #b5bda0", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <FormField label="Homepage Card Subtitle" required>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. A celebration of international cultures"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #b5bda0",
                      backgroundColor: "#f5f0e8",
                      color: "#1a1a1a",
                      fontSize: "14px",
                    }}
                  />
                </FormField>

                <FormField label="Homepage Card Features (Max 4)" required>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {features.map((feature, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "10px" }}>
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => {
                            const newFeatures = [...features];
                            newFeatures[idx] = e.target.value;
                            setFeatures(newFeatures);
                          }}
                          placeholder={`Feature ${idx + 1}`}
                          style={{
                            flex: 1,
                            padding: "10px",
                            border: "1px solid #b5bda0",
                            backgroundColor: "#f5f0e8",
                            color: "#1a1a1a",
                            fontSize: "14px",
                          }}
                        />
                        {features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newFeatures = features.filter((_, i) => i !== idx);
                              setFeatures(newFeatures);
                            }}
                            style={{ padding: "0 10px", backgroundColor: "#c0392b", color: "white", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                          >
                            X
                          </button>
                        )}
                      </div>
                    ))}
                    {features.length < 4 && (
                      <button
                        type="button"
                        onClick={() => setFeatures([...features, ""])}
                        style={{ padding: "8px 12px", border: "1px dashed #b5bda0", background: "transparent", color: "#1a1a1a", cursor: "pointer", fontSize: "12px", alignSelf: "flex-start" }}
                      >
                        + Add Feature
                      </button>
                    )}
                  </div>
                </FormField>

                <FormField label="Homepage Card Image">
                  {posterUrl ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-start" }}>
                      <img src={posterUrl} alt="Homepage Poster Preview" style={{ maxWidth: "200px", borderRadius: "8px", border: "1px solid #b5bda0" }} />
                      <button
                        type="button"
                        onClick={() => setPosterUrl("")}
                        style={{ padding: "6px 12px", border: "1px solid #c0392b", color: "#c0392b", background: "transparent", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="admin-upload-box" style={{ border: "1px dashed #b5bda0", padding: "2rem", textAlign: "center", backgroundColor: "transparent" }}>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        id="homepage-media-upload"
                        style={{ display: "none" }}
                        onChange={handlePosterUpload}
                        disabled={isUploadingPoster}
                      />
                      <label htmlFor="homepage-media-upload" style={{ cursor: isUploadingPoster ? "not-allowed" : "pointer", color: "#1a1a1a", fontSize: "14px", fontWeight: 500, textDecoration: "underline" }}>
                        {isUploadingPoster ? "Uploading..." : "Click to upload homepage card image"}
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
                    <strong>⚠ Image Resolution Guide:</strong> The homepage events section displays cards at a <strong>~2.57:1 landscape aspect ratio</strong>. For best results, upload an image with a resolution of <strong>1280 × 500 px</strong>.
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
