"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { animate } from "animejs";
import type React from "react";

interface AvatarUploadProps {
  currentImage: string | null;
  userName: string;
  isOwnProfile: boolean;
  onUploadComplete: (imageUrl: string) => void | Promise<void>;
  onRemove: () => void;
  fallback?: React.ReactNode;
}

export default function AvatarUpload({
  currentImage,
  userName,
  isOwnProfile,
  onUploadComplete,
  onRemove,
  fallback,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);
  const avatarBoxRef = useRef<HTMLDivElement>(null);

  const displayImage = preview || currentImage;
  const initial = userName?.charAt(0)?.toUpperCase() || "?";

  useEffect(() => {
    if (overlayRef.current) {
      animate(overlayRef.current, {
        opacity: hovering && isOwnProfile && !uploading ? [0, 1] : [1, 0],
        duration: 200,
        ease: "outQuad",
      });
    }
  }, [hovering, isOwnProfile, uploading]);

  useEffect(() => {
    if (uploading && spinnerRef.current) {
      const anim = animate(spinnerRef.current, {
        rotate: [0, 360],
        duration: 1000,
        loop: true,
        ease: "linear",
      });
      return () => {
        anim.pause();
      };
    }
  }, [uploading]);

  useEffect(() => {
    if (!avatarBoxRef.current) return;
    const anim = animate(avatarBoxRef.current, {
      boxShadow: [
        "inset 0 0 20px rgba(0,229,255,0.1), 0 0 8px rgba(0,229,255,0.4), 0 0 20px rgba(0,229,255,0.15)",
        "inset 0 0 20px rgba(0,229,255,0.1), 0 0 16px rgba(0,229,255,0.7), 0 0 40px rgba(0,229,255,0.3)",
        "inset 0 0 20px rgba(0,229,255,0.1), 0 0 8px rgba(0,229,255,0.4), 0 0 20px rgba(0,229,255,0.15)",
      ],
      duration: 2500,
      loop: true,
      ease: "inOutSine",
    });
    return () => { anim.pause(); };
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid type. Use JPG, PNG, GIF, or WebP.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Max 5MB.");
        return;
      }

      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("avatar", file);

        const res = await fetch("/api/user/avatar", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        await res.json();
        await onUploadComplete("");
        setPreview(null);
      } catch (err) {
        console.error("Avatar upload error:", err);
        setError(err instanceof Error ? err.message : "Upload failed");
        setPreview(null);
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [onUploadComplete]
  );

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(null), 5000);
    return () => window.clearTimeout(timer);
  }, [error]);

  const handleRemove = useCallback(async () => {
    try {
      const res = await fetch("/api/user/avatar", { method: "DELETE" });
      if (res.ok) {
        onRemove();
      }
    } catch {
      // silent
    }
  }, [onRemove]);

  const handleClick = useCallback(() => {
    if (isOwnProfile && !uploading) {
      fileInputRef.current?.click();
    }
  }, [isOwnProfile, uploading]);

  return (
    <div className="relative">
      <div
        ref={avatarBoxRef}
        className={`w-28 h-28 rounded-2xl flex items-center justify-center overflow-hidden relative ${
          isOwnProfile ? "cursor-pointer" : ""
        }`}
        style={{
          border: "3px solid rgba(0,229,255,0.6)",
          backgroundColor: "rgba(13,13,26,0.8)",
          boxShadow:
            "inset 0 0 20px rgba(0,229,255,0.1), 0 0 8px rgba(0,229,255,0.4), 0 0 20px rgba(0,229,255,0.15)",
        }}
        onClick={handleClick}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {uploading ? (
          <div
            ref={spinnerRef}
            className="w-10 h-10 border-4 rounded-full"
            style={{ borderColor: "#1a1a2e", borderTopColor: "#00e5ff" }}
          />
        ) : displayImage ? (
          <img
            src={displayImage}
            alt={userName}
            className="w-full h-full object-cover"
          />
        ) : fallback ? (
          fallback
        ) : (
          <span
            className="text-4xl font-black"
            style={{
              color: "#00e5ff",
              textShadow: "0 0 20px rgba(0,229,255,0.4)",
            }}
          >
            {initial}
          </span>
        )}

        {isOwnProfile && !uploading && (
          <div
            ref={overlayRef}
            className="absolute inset-0 flex flex-col items-center justify-center gap-1"
            style={{ backgroundColor: "rgba(0,0,0,0.6)", opacity: 0 }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span
              className="text-[10px] font-bold tracking-wider"
              style={{ color: "#00e5ff" }}
            >
              UPLOAD
            </span>
          </div>
        )}
      </div>

      {isOwnProfile && currentImage && !uploading && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-30"
          style={{
            backgroundColor: "#ff1744",
            color: "#fff",
            border: "2px solid #0d0d1a",
          }}
          title="Remove avatar"
        >
          ✕
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p
          className="absolute -bottom-7 left-0 right-0 text-[10px] font-bold text-center whitespace-nowrap z-40"
          style={{ color: "#ff6432" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
