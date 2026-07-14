"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader, FormField, CustomDropdown } from "../../../components";
import { useAuth } from "@/app/admin/roles/AuthContext";

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { role } = useAuth();
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;

  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [eventType, setEventType] = useState<"upcoming" | "past">("upcoming");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [linkedMouId, setLinkedMouId] = useState("");
  const [isArchived, setIsArchived] = useState(false);
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const [posterUrl, setPosterUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [endDate, setEndDate] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState("");
  const [posterRatio, setPosterRatio] = useState<number | null>(null);
  
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [mous, setMous] = useState<{ value: string; label: string }[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxWords = eventType === "upcoming" ? 60 : 80;
  const wordCount = description.trim() === "" ? 0 : description.trim().split(/\s+/).length;
  const isOverLimit = wordCount > maxWords;

  // Fetch MOUs and Event Details on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        
        // 1. Fetch MOUs
        const mousRes = await fetch(`${API_URL}/api/v1/mous`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        let loadedMous = [{ value: "", label: "None" }];
        if (mousRes.ok) {
          const mousJson = await mousRes.json();
          loadedMous = [...loadedMous, ...(mousJson.data || []).map((m: any) => ({
            value: m.id,
            label: m.name
          }))];
          setMous(loadedMous);
        }

        // 2. Fetch Event details
        const eventRes = await fetch(`${API_URL}/api/v1/events/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (eventRes.ok) {
          const event = await eventRes.json();
          setTitle(event.title || "");
          setDescription(event.description || "");
          setLocation(event.location || "");
          setEventType(event.event_type || "upcoming");
          setIsArchived(event.is_archived || false);
          setShowOnHomepage(event.add_to_homepage || false);
          setPosterUrl(event.posterUrl || "");
          setGalleryUrls(event.galleryUrls || []);
          setLinkedMouId(event.linked_mou_id || "");
          setHighlights(event.highlights || []);
          setPosterRatio(event.posterRatio || null);

          if (event.date) {
            setDate(new Date(event.date).toISOString().split('T')[0]);
          }
          if (event.endDate) {
            setEndDate(new Date(event.endDate).toISOString().split('T')[0]);
          }
        } else {
          alert("Event not found.");
          router.push("/admin/events");
        }
      } catch (err) {
        console.error("Failed to load data for edit event:", err);
      } finally {
        setIsLoadingEvent(false);
      }
    };
    fetchData();
  }, [id]);

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
      const token = localStorage.getItem("access_token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      const uploaded: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const res = await fetch(`${API_URL}/api/v1/media`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
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
      alert("Error uploading gallery files.");
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPoster(true);
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
        alert("Upload failed.");
      }
    } catch (err) {
      console.error("Error uploading cover image:", err);
      alert("Error uploading cover image.");
    } finally {
      setIsUploadingPoster(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required.");
      return;
    }
    if (!date) {
      alert("Date is required.");
      return;
    }
    if (isOverLimit) {
      alert(`Description exceeds the word limit of ${maxWords} words.`);
      return;
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
        linkedMouId: linkedMouId || null,
        isArchived,
        addToHomepage: eventType === "past" ? showOnHomepage : undefined,
        posterUrl: (eventType === "upcoming" || showOnHomepage) ? (posterUrl || null) : null,
        galleryUrls: eventType === "past" ? galleryUrls : undefined,
      };

      const res = await fetch(`${API_URL}/api/v1/events/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/events");
      } else {
        const errorJson = await res.json();
        alert(`Failed to save event: ${errorJson.error?.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Failed to update event:", err);
      alert("An error occurred while saving the event.");
    }
  };

  if (isLoadingEvent) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#6b6b6b" }}>Loading event details...</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/admin/events" style={{ color: "#6b6b6b", textDecoration: "none", fontSize: "14px" }}>
          &larr; Back to Events
        </Link>
      </div>

      <AdminPageHeader title={`Edit ${eventType === "past" ? "Past" : "Upcoming"} Event`} />

      <div style={{ border: "1px solid #b5bda0", padding: "2rem", backgroundColor: "#f5f0e8", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <form onSubmit={handleSubmit}>
          <FormField label="Title" required>
            <input type="text" placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </FormField>
          <FormField label="Description">
            <textarea
              ref={textareaRef}
              rows={4}
              placeholder="Enter a brief description..."
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
                ⚠ Keep description under <strong>{maxWords} words</strong>.
              </span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: isOverLimit ? "#c0392b" : "#5C6B3F", whiteSpace: "nowrap", marginLeft: "12px" }}>
                {wordCount} / {maxWords}
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

          {/* ── Media Upload (Upcoming Cover) ── */}
          {eventType === "upcoming" && (
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
                      onChange={handlePosterUpload}
                      disabled={isUploadingPoster}
                    />
                    <label htmlFor="media-upload-upcoming" style={{ cursor: isUploadingPoster ? "not-allowed" : "pointer", color: "#1a1a1a", fontSize: "14px", fontWeight: 500, textDecoration: "underline" }}>
                      {isUploadingPoster ? "Uploading..." : "Click to upload cover image"}
                    </label>
                    <div style={{ fontSize: "12px", color: "#6b6b6b", marginTop: "8px" }}>PNG, JPG, or WebP — only one file allowed</div>
                  </div>
                )}
              </FormField>
            </div>
          )}

          {/* ── Media Upload (Past Gallery & Optional Homepage Card) ── */}
          {eventType === "past" && (
            <>
              <div style={{ marginTop: "1.5rem" }}>
                <FormField label="Event Gallery (Images / Documents)">
                  <div style={{ border: "1px dashed #b5bda0", padding: "2rem", textAlign: "center", backgroundColor: "transparent" }}>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
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

                {showOnHomepage && (
                  <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid #b5bda0" }}>
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
                        <div style={{ border: "1px dashed #b5bda0", padding: "2rem", textAlign: "center", backgroundColor: "transparent" }}>
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
                    </FormField>
                  </div>
                )}
              </div>
            </>
          )}

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
