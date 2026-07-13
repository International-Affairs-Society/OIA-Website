"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader, FormField, CustomDropdown } from "../../components";
import { useAuth } from "@/app/admin/roles/AuthContext";

export default function CreateEventPage() {
  const router = useRouter();
  const { role } = useAuth();

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/admin/events" style={{ color: "#6b6b6b", textDecoration: "none", fontSize: "14px" }}>
          &larr; Back to Events
        </Link>
      </div>

      <AdminPageHeader title="Create Event" />

      <div style={{ border: "1px solid #b5bda0", padding: "2rem", backgroundColor: "#f5f0e8", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <form onSubmit={(e) => { e.preventDefault(); router.push("/admin/events"); }}>
          <FormField label="Title" required>
            <input type="text" placeholder="Enter here" />
          </FormField>
          <FormField label="Description">
            <textarea rows={4} placeholder="Enter here..." />
          </FormField>
          <FormField label="Date">
            <input type="date" />
          </FormField>
          <FormField label="Location">
            <input type="text" placeholder="Enter here" />
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

          <div style={{ marginTop: "1.5rem" }}>
            <FormField label="Add Media (Images/Documents)">
              <div style={{ border: "1px dashed #b5bda0", padding: "2rem", textAlign: "center", backgroundColor: "transparent" }}>
                <input type="file" multiple id="media-upload" style={{ display: "none" }} />
                <label htmlFor="media-upload" style={{ cursor: "pointer", color: "#1a1a1a", fontSize: "14px", fontWeight: 500, textDecoration: "underline" }}>
                  Click to upload media files
                </label>
                <div style={{ fontSize: "12px", color: "#6b6b6b", marginTop: "8px" }}>PNG, JPG, PDF up to 10MB</div>
              </div>
            </FormField>
          </div>

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
