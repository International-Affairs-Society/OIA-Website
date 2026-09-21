"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/admin/roles/AuthContext";
import { User, Phone, Image as ImageIcon, GraduationCap, BookOpen, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/apiFetch";


export default function CompleteProfilePage() {
  const { user, isLoading } = useAuth();

  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [school, setSchool] = useState("");
  const [course, setCourse] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setGender(user.gender || "");
      setMobile(user.phone_number || "");
      setPhotoUrl(user.photo_url || "");
      setSchool((user as any).school || "");
      setCourse((user as any).course || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setError("");
    setIsSubmitting(true);

    try {
      const payload: any = {
        gender,
        mobile,
        photoUrl,
      };

      if (user.role === "student") {
        payload.school = school;
        payload.course = course;
      }

      const res = await apiFetch(`/api/v1/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        window.location.href = "/";
      } else {
        const data = await res.json();
        setError(data?.error?.message || "Failed to update profile.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-[var(--background)]" style={{ minHeight: "100vh" }}>
        <Loader2 className="animate-spin text-rose-800" size={40} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-[var(--background)] relative overflow-hidden font-sans" style={{ minHeight: "100vh", padding: "48px 16px" }}>
      {/* Background decorations matching OIA theme */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full border-[1px] border-rose-200/40" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full border-[1px] border-rose-200/40" />

      <div className="relative z-10 w-full max-w-xl rounded-[32px] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.05)]" style={{ padding: "48px" }}>
        <div className="text-center" style={{ marginBottom: "40px" }}>
          <h1 className="text-4xl md:text-5xl font-instrument-serif text-gray-900 tracking-tight" style={{ marginBottom: "12px" }}>Complete Your Profile</h1>
          <p className="text-gray-500 font-outfit text-sm md:text-base max-w-sm mx-auto">
            Welcome to the Office of International Affairs.<br/>Please provide a few more details to continue.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start" style={{ padding: "16px", gap: "12px", marginBottom: "32px" }}>
            <div className="font-bold" style={{ marginTop: "2px" }}>!</div>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: "24px" }}>
          <div className="flex flex-col" style={{ gap: "8px" }}>
            <label className="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase text-xs">Gender</label>
            <div className="relative">
              <div className="absolute top-1/2 -translate-y-1/2 text-gray-400" style={{ left: "16px" }}>
                <User size={18} />
              </div>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="w-full rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 focus:outline-none focus:border-rose-800 focus:ring-1 focus:ring-rose-800 transition-all appearance-none"
                style={{ padding: "14px 16px 14px 44px" }}
              >
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col" style={{ gap: "8px" }}>
            <label className="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase text-xs">Mobile Number</label>
            <div className="relative">
              <div className="absolute top-1/2 -translate-y-1/2 text-gray-400" style={{ left: "16px" }}>
                <Phone size={18} />
              </div>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                placeholder="+91 9876543210"
                className="w-full rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-rose-800 focus:ring-1 focus:ring-rose-800 transition-all"
                style={{ padding: "14px 16px 14px 44px" }}
              />
            </div>
          </div>

          <div className="flex flex-col" style={{ gap: "8px" }}>
            <label className="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase text-xs">Profile Picture</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                id="profile-picture-upload"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  setError("");
                  setIsUploadingImage(true);
                  const formData = new FormData();
                  formData.append("file", file);
                  
                  try {
                    const res = await apiFetch(`/api/v1/media`, {
                      method: "POST",
                      body: formData,
                      credentials: "include"
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setPhotoUrl(data.url);
                    } else {
                      const errData = await res.json();
                      setError(errData?.error?.message || "Failed to upload image");
                    }
                  } catch (err: any) {
                    setError("Failed to upload image");
                  } finally {
                    setIsUploadingImage(false);
                  }
                }}
              />
              <label htmlFor="profile-picture-upload" className="w-full flex items-center justify-between rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 cursor-pointer hover:bg-gray-100 transition-all" style={{ padding: "14px 16px" }}>
                <div className="flex items-center gap-3">
                  <div className="text-gray-400">
                    {isUploadingImage ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                  </div>
                  <span className={photoUrl ? "text-gray-900 text-sm" : "text-gray-400 text-sm"}>
                    {isUploadingImage ? "Uploading..." : (photoUrl ? "Image uploaded successfully (Click to change)" : "Click to upload a profile picture")}
                  </span>
                </div>
                {photoUrl && !isUploadingImage && (
                  <img src={photoUrl} alt="Preview" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                )}
              </label>
              {/* Fallback hidden input to ensure required validation if needed, though we manage required differently now */}
              <input type="hidden" required value={photoUrl} />
            </div>
          </div>

          {user?.role === "student" && (
            <div className="flex flex-col md:flex-row" style={{ gap: "24px" }}>
              <div className="flex flex-col w-full" style={{ gap: "8px" }}>
                <label className="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase text-xs">School</label>
                <div className="relative">
                  <div className="absolute top-1/2 -translate-y-1/2 text-gray-400" style={{ left: "16px" }}>
                    <GraduationCap size={18} />
                  </div>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    required
                    placeholder="e.g. SCSE"
                    className="w-full rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-rose-800 focus:ring-1 focus:ring-rose-800 transition-all"
                    style={{ padding: "14px 16px 14px 44px" }}
                  />
                </div>
              </div>
              
              <div className="flex flex-col w-full" style={{ gap: "8px" }}>
                <label className="text-sm font-semibold text-[var(--foreground)] tracking-wide uppercase text-xs">Course</label>
                <div className="relative">
                  <div className="absolute top-1/2 -translate-y-1/2 text-gray-400" style={{ left: "16px" }}>
                    <BookOpen size={18} />
                  </div>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    required
                    placeholder="e.g. B.Tech"
                    className="w-full rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-rose-800 focus:ring-1 focus:ring-rose-800 transition-all"
                    style={{ padding: "14px 16px 14px 44px" }}
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isUploadingImage}
            className="w-full bg-rose-900 text-white font-outfit font-medium rounded-xl hover:bg-rose-950 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-rose-900/20"
            style={{ padding: "16px", gap: "12px", marginTop: "16px" }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Saving Profile...
              </>
            ) : (
              "Save & Continue"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
