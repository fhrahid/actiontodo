"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import html2canvas from "html2canvas";
import { getItemIcon, getCategoryIcon, KatanaIcon, GemIcon } from "@/components/IconMap";
import AvatarUpload from "@/components/AvatarUpload";
import { animate, stagger } from "@/lib/anime-utils";

type UserData = {
  id: string;
  name: string;
  notificationEmail: string | null;
  level: number;
  xp: number;
  xpToNext: number;
  totalTasks: number;
  streak: number;
  gems: number;
  title: string;
  avatar: string | null;
  cardDesign: string | null;
  cardDesignClasses: string | null;
  equippedHead: string | null;
  equippedFace: string | null;
  equippedBody: string | null;
  equippedAura: string | null;
  image: string | null;
  totalItems: number;
  tierBreakdown: Record<string, number>;
  recentPulls: { name: string; tier: string; imageData: string }[];
};

const tierColors: Record<string, string> = {
  common: "bg-gray-600 text-gray-200",
  uncommon: "bg-green-700 text-green-100",
  rare: "bg-blue-700 text-blue-100",
  epic: "bg-purple-700 text-purple-100",
  legendary: "bg-yellow-700 text-yellow-100",
  mythic: "bg-gradient-to-r from-red-600 via-yellow-600 via-green-600 via-blue-600 to-purple-600 text-white",
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const params = useParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState("");
  const [editNotificationEmail, setEditNotificationEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emailSaveState, setEmailSaveState] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);
  const avatarBoxRef = useRef<HTMLDivElement>(null);
  const bgGlowRef = useRef<HTMLDivElement>(null);
  const xpBarRef = useRef<HTMLDivElement>(null);
  const exportBtnRef = useRef<HTMLButtonElement>(null);
  const pullsRef = useRef<HTMLDivElement>(null);
  const animsRef = useRef<ReturnType<typeof animate>[]>([]);
  const initialAnimDone = useRef(false);

  useEffect(() => {
    fetchUser();
  }, [params.id]);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditNotificationEmail(user.notificationEmail || "");
    }
  }, [user]);

  useEffect(() => {
    return () => {
      animsRef.current.forEach((a) => a?.revert?.());
      animsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (loading && spinnerRef.current) {
      const a = animate(spinnerRef.current, {
        rotate: 360,
        duration: 1000,
        loop: true,
        ease: "linear",
      });
      return () => { a.revert(); };
    }
  }, [loading]);

  async function fetchUser() {
    try {
      const res = await fetch(`/api/user/stats?id=${params.id}`);
      const data = await res.json();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveName() {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user/stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser((prev) =>
          prev
            ? {
                ...prev,
                name: data.user?.name ?? editName.trim(),
                notificationEmail:
                  data.user?.notificationEmail ?? prev.notificationEmail,
              }
            : prev
        );
        setIsEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveNotificationEmail() {
    setSaving(true);
    setEmailSaveState(null);
    try {
      const res = await fetch("/api/user/stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationEmail: editNotificationEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                notificationEmail: data.user?.notificationEmail ?? null,
              }
            : prev
        );
        setEditNotificationEmail(data.user?.notificationEmail ?? "");
        setIsEditingEmail(false);
        setEmailSaveState({
          type: "success",
          message: data.user?.notificationEmail
            ? "Notification email updated"
            : "Notification email cleared. Default account email will be used.",
        });
      } else {
        setEmailSaveState({
          type: "error",
          message: data?.error || "Failed to update notification email",
        });
      }
    } catch {
      setEmailSaveState({
        type: "error",
        message: "Failed to update notification email",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    const el = cardRef.current;
    if (!el) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(el, {
        backgroundColor: "#0d0d1a",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `${user?.name || "profile"}-card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setExporting(false);
    }
  }

  const handleExportEnter = () => {
    if (exportBtnRef.current) {
      animate(exportBtnRef.current, {
        scale: 1.05,
        duration: 200,
        ease: "outQuad",
      });
    }
  };
  const handleExportLeave = () => {
    if (exportBtnRef.current) {
      animate(exportBtnRef.current, {
        scale: 1,
        duration: 200,
        ease: "outQuad",
      });
    }
  };
  const handleExportDown = () => {
    if (exportBtnRef.current) {
      animate(exportBtnRef.current, {
        scale: 0.95,
        duration: 100,
        ease: "outQuad",
      });
    }
  };
  const handleExportUp = () => {
    if (exportBtnRef.current) {
      animate(exportBtnRef.current, {
        scale: 1.05,
        duration: 100,
        ease: "outQuad",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0d0d1a" }}>
        <div
          ref={spinnerRef}
          className="w-12 h-12 border-4 rounded-none"
          style={{ borderColor: "#1a1a2e", borderTopColor: "#00e5ff" }}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0d0d1a" }}>
        <div className="text-center">
          <p className="mb-4 flex items-center justify-center"><KatanaIcon size={64} className="text-gray-500" /></p>
          <p className="text-gray-500 text-lg tracking-wider uppercase">Warrior not found</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = session?.user?.id === params.id;
  const xpPercent = user.xpToNext > 0 ? (user.xp / user.xpToNext) * 100 : 0;
  const hasCardDesign = !!user.cardDesignClasses;

  if (!initialAnimDone.current) {
    initialAnimDone.current = true;
    requestAnimationFrame(() => {
      if (avatarBoxRef.current) {
        animsRef.current.push(
          animate(avatarBoxRef.current, {
            boxShadow: [
              "0 0 8px rgba(0,229,255,0.4), 0 0 20px rgba(0,229,255,0.15), inset 0 0 8px rgba(0,229,255,0.1)",
              "0 0 16px rgba(0,229,255,0.7), 0 0 40px rgba(0,229,255,0.3), inset 0 0 16px rgba(0,229,255,0.2)",
              "0 0 8px rgba(0,229,255,0.4), 0 0 20px rgba(0,229,255,0.15), inset 0 0 8px rgba(0,229,255,0.1)",
            ],
            duration: 2500,
            loop: true,
            ease: "inOutSine",
          })
        );
      }

      if (bgGlowRef.current) {
        animsRef.current.push(
          animate(bgGlowRef.current, {
            scale: [1, 1.15, 1],
            opacity: [0.08, 0.14, 0.08],
            duration: 6000,
            loop: true,
            ease: "inOutSine",
          })
        );
      }

      if (xpBarRef.current) {
        animsRef.current.push(
          animate(xpBarRef.current, {
            width: `${xpPercent}%`,
            duration: 1200,
            ease: "outExpo",
          })
        );
      }

      if (pullsRef.current) {
        const items = pullsRef.current.querySelectorAll(".pull-item");
        if (items.length > 0) {
          animsRef.current.push(
            animate(Array.from(items) as HTMLElement[], {
              opacity: [0, 1],
              translateX: [-20, 0],
              delay: stagger([0, 100]),
              duration: 500,
              ease: "outExpo",
            })
          );
        }
      }
    });
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#0d0d1a" }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-8">
          <div
            ref={cardRef}
            className="rounded-2xl p-8 w-full max-w-md relative overflow-hidden"
            style={{
              background: hasCardDesign ? undefined : "linear-gradient(180deg, rgba(26,26,46,0.9) 0%, rgba(13,13,26,0.95) 100%)",
              backdropFilter: "blur(20px)",
              border: "2px solid rgba(0,229,255,0.35)",
              boxShadow: "0 0 30px rgba(0,229,255,0.15), 0 20px 60px rgba(0,0,0,0.6), 0 0 1px rgba(0,229,255,0.5)",
            }}
          >
            {hasCardDesign && (
              <div
                className={`absolute inset-0 rounded-2xl pointer-events-none ${user.cardDesignClasses}`}
                style={{ opacity: 0.25 }}
              />
            )}
            {hasCardDesign && (
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ background: "linear-gradient(180deg, rgba(13,13,26,0.75) 0%, rgba(13,13,26,0.85) 100%)" }}
              />
            )}
            {hasCardDesign && (
              <div
                className={`absolute inset-0 rounded-2xl pointer-events-none border-2 ${user.cardDesignClasses}`}
                style={{ opacity: 0.6 }}
              />
            )}

            <div
              className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
              style={{ background: hasCardDesign ? "linear-gradient(90deg, rgba(124,77,255,0.5), rgba(0,229,255,0.5), rgba(124,77,255,0.5))" : "linear-gradient(90deg, #00e5ff, #7c4dff, #00e5ff)" }}
            />

            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: "rgba(0,229,255,0.5)" }} />
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: "rgba(0,229,255,0.5)" }} />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: "rgba(0,229,255,0.5)" }} />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: "rgba(0,229,255,0.5)" }} />

            <div
              ref={bgGlowRef}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: "280px",
                height: "280px",
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                margin: "auto",
                opacity: 0.08,
                background: "radial-gradient(circle, rgba(0,229,255,0.12) 0%, rgba(124,77,255,0.08) 40%, transparent 70%)",
                filter: "blur(30px)",
              }}
            />

            {user.equippedAura && (
              <div className="absolute inset-0 flex items-center justify-center text-[140px] opacity-[0.07] pointer-events-none select-none text-cyan-400">
                {getItemIcon(user.equippedAura, { size: 140, className: "text-cyan-400" })}
              </div>
            )}

            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  {user.equippedHead && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 drop-shadow-lg text-cyan-400">
                      {getItemIcon(user.equippedHead, { size: 28, className: "text-cyan-400" })}
                    </span>
                  )}
                  <AvatarUpload
                    currentImage={user.image}
                    userName={user.name}
                    isOwnProfile={isOwnProfile}
                    onUploadComplete={async () => {
                      try {
                        const res = await fetch(`/api/user/stats?id=${params.id}`);
                        if (res.ok) {
                          const data = await res.json();
                          setUser((prev) => (prev ? { ...prev, image: data.image } : prev));
                        }
                      } catch {}
                    }}
                    onRemove={() =>
                      setUser((prev) =>
                        prev ? { ...prev, image: null } : prev
                      )
                    }
                    fallback={
                      user.avatar ? (
                        getItemIcon(user.avatar, {
                          size: 48,
                          className: "text-cyan-400",
                        })
                      ) : (
                        <KatanaIcon size={48} className="text-cyan-400" />
                      )
                    }
                  />
                  {user.equippedFace && (
                    <span className="absolute top-1/2 -translate-y-1/2 -right-6 z-20 drop-shadow-lg text-cyan-400">
                      {getItemIcon(user.equippedFace, { size: 28, className: "text-cyan-400" })}
                    </span>
                  )}
                  {user.equippedBody && (
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-20 drop-shadow-lg text-cyan-400">
                      {getItemIcon(user.equippedBody, { size: 28, className: "text-cyan-400" })}
                    </span>
                  )}
                </div>
              </div>

              <h2
                className="text-3xl font-black text-white text-center tracking-wider mb-1"
                style={{ textShadow: "0 0 20px rgba(0,229,255,0.3), 0 2px 4px rgba(0,0,0,0.5)" }}
              >
                {user.name}
              </h2>
              <p
                className="text-sm font-bold text-center mb-4 tracking-[0.3em] uppercase"
                style={{ color: "#7c4dff", textShadow: "0 0 10px rgba(124,77,255,0.4)" }}
              >
                {user.title}
              </p>

              <div className="flex items-center justify-center gap-2 mb-5">
                <span className="text-sm font-black text-cyan-400">
                  LV. {user.level}
                </span>
                <div className="flex-1 max-w-[200px] h-3 overflow-hidden rounded-full" style={{ backgroundColor: "rgba(13,13,26,0.8)", boxShadow: "inset 0 0 6px rgba(0,0,0,0.5)" }}>
                  <div
                    ref={xpBarRef}
                    className="h-full rounded-full"
                    style={{
                      width: 0,
                      background: "linear-gradient(90deg, #00e5ff, #7c4dff)",
                      boxShadow: "0 0 10px rgba(0,229,255,0.6), 0 0 3px rgba(0,229,255,0.8)",
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 font-mono">
                  {user.xp}/{user.xpToNext}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                    <AvatarUpload
                      currentImage={user.image}
                      userName={user.name}
                      isOwnProfile={isOwnProfile}
                      onUploadComplete={(url) =>
                        setUser((prev) =>
                          prev ? { ...prev, image: url } : prev
                        )
                      }
                      onRemove={() =>
                        setUser((prev) =>
                          prev ? { ...prev, image: null } : prev
                        )
                      }
                      fallback={
                        user.avatar ? (
                          getItemIcon(user.avatar, {
                            size: 48,
                            className: "text-cyan-400",
                          })
                        ) : (
                          <KatanaIcon size={48} className="text-cyan-400" />
                        )
                      }
                    />
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: "rgba(255,23,68,0.04)",
                    border: "1px solid rgba(255,100,50,0.25)",
                    boxShadow: "0 0 8px rgba(255,100,50,0.08)",
                  }}
                >
                  <p className="text-xl font-black" style={{ color: "#ff6432", textShadow: "0 0 8px rgba(255,100,50,0.4)" }}>
                    {user.streak}
                  </p>
                  <p className="text-[10px] text-gray-500 tracking-widest font-bold">STREAK</p>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: "rgba(255,214,0,0.04)",
                    border: "1px solid rgba(255,214,0,0.25)",
                    boxShadow: "0 0 8px rgba(255,214,0,0.08)",
                  }}
                >
                  <p className="text-xl font-black" style={{ color: "#ffd600", textShadow: "0 0 8px rgba(255,214,0,0.4)" }}>
                    <span className="inline-flex items-center gap-1"><GemIcon size={16} className="text-yellow-400" /> {user.gems}</span>
                  </p>
                  <p className="text-[10px] text-gray-500 tracking-widest font-bold">GEMS</p>
                </div>
              </div>
            </div>

            <div
              className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-2xl"
              style={{ background: "linear-gradient(90deg, #00e5ff, #7c4dff, #00e5ff)" }}
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 mb-8">
          <button
            ref={exportBtnRef}
            onMouseEnter={handleExportEnter}
            onMouseLeave={handleExportLeave}
            onMouseDown={handleExportDown}
            onMouseUp={handleExportUp}
            onClick={handleExport}
            disabled={exporting}
            className="btn-primary px-8 py-3 rounded-none font-black tracking-widest text-sm uppercase"
          >
            {exporting ? "EXPORTING..." : "⚔️ EXPORT CARD"}
          </button>
          <Link
            href="/shop"
            className="px-8 py-3 rounded-none font-black tracking-widest text-sm uppercase border-2 transition-colors hover:bg-white/5"
            style={{ borderColor: "#7c4dff", color: "#7c4dff" }}
          >
            VISIT SHOP
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-none border-2" style={{ backgroundColor: "#1a1a2e", borderColor: "#2a2a3e" }}>
            <h3 className="text-lg font-black text-white mb-4 tracking-wider">
              PROFILE INFO
            </h3>

            {isOwnProfile && !isEditing && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1 tracking-wider uppercase">Display Name</p>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">
                    {user.name}
                  </span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-bold tracking-wider hover:underline"
                    style={{ color: "#00e5ff" }}
                  >
                    EDIT
                  </button>
                </div>
              </div>
            )}

            {isOwnProfile && !isEditingEmail && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1 tracking-wider uppercase">Notification Email</p>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white break-all">
                    {user.notificationEmail || "Use account email"}
                  </span>
                  <button
                    onClick={() => {
                      setEmailSaveState(null);
                      setIsEditingEmail(true);
                    }}
                    className="text-xs font-bold tracking-wider hover:underline"
                    style={{ color: "#00e5ff" }}
                  >
                    EDIT
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-gray-500">
                  Task creation and reminder emails are sent here.
                </p>
              </div>
            )}

            {isOwnProfile && isEditing && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1 tracking-wider uppercase">Display Name</p>
                <div className="flex gap-2">
                  <input
                    value={editName ?? ""}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-none text-sm font-bold focus:outline-none"
                    style={{ backgroundColor: "#0d0d1a", color: "#fff", border: "2px solid #2a2a3e" }}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving}
                    className="btn-primary px-4 py-2 text-sm font-black tracking-wider"
                  >
                    {saving ? "..." : "SAVE"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(user.name);
                    }}
                    className="btn-outline px-4 py-2 text-sm font-black tracking-wider"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}

            {isOwnProfile && isEditingEmail && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1 tracking-wider uppercase">Notification Email</p>
                <div className="flex gap-2">
                  <input
                    value={editNotificationEmail}
                    onChange={(e) => setEditNotificationEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 px-3 py-2 rounded-none text-sm font-bold focus:outline-none"
                    style={{ backgroundColor: "#0d0d1a", color: "#fff", border: "2px solid #2a2a3e" }}
                  />
                  <button
                    onClick={handleSaveNotificationEmail}
                    disabled={saving}
                    className="btn-primary px-4 py-2 text-sm font-black tracking-wider"
                  >
                    {saving ? "..." : "SAVE"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingEmail(false);
                      setEditNotificationEmail(user.notificationEmail || "");
                    }}
                    className="btn-outline px-4 py-2 text-sm font-black tracking-wider"
                  >
                    CANCEL
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-gray-500">
                  Leave blank to use your account email.
                </p>
              </div>
            )}

            {isOwnProfile && emailSaveState && (
              <p
                className="mb-4 text-xs font-bold tracking-wider uppercase"
                style={{ color: emailSaveState.type === "success" ? "#00e5ff" : "#ff6432" }}
              >
                {emailSaveState.message}
              </p>
            )}

            {!isOwnProfile && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1 tracking-wider uppercase">Display Name</p>
                <span className="font-bold text-white">{user.name}</span>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs text-gray-500 tracking-wider uppercase">Equipment</p>
              <div className="flex gap-3 text-2xl">
                {user.equippedHead && <span title="Head" className="text-cyan-400">{getItemIcon(user.equippedHead, { size: 28, className: "text-cyan-400" })}</span>}
                {user.equippedFace && <span title="Face" className="text-cyan-400">{getItemIcon(user.equippedFace, { size: 28, className: "text-cyan-400" })}</span>}
                {user.equippedBody && <span title="Body" className="text-cyan-400">{getItemIcon(user.equippedBody, { size: 28, className: "text-cyan-400" })}</span>}
                {user.equippedAura && <span title="Aura" className="text-cyan-400">{getItemIcon(user.equippedAura, { size: 28, className: "text-cyan-400" })}</span>}
                {!user.equippedHead &&
                  !user.equippedFace &&
                  !user.equippedBody &&
                  !user.equippedAura && (
                    <span className="text-sm text-gray-600 uppercase tracking-wider">
                      No equipment
                    </span>
                  )}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-none border-2" style={{ backgroundColor: "#1a1a2e", borderColor: "#2a2a3e" }}>
            <h3 className="text-lg font-black text-white mb-4 tracking-wider">
              COLLECTION
            </h3>

            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 tracking-wider uppercase">Total Items</p>
              <p className="text-3xl font-black" style={{ color: "#00e5ff" }}>
                {user.totalItems}
              </p>
            </div>

            {user.tierBreakdown &&
              Object.keys(user.tierBreakdown).length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2 tracking-wider uppercase">By Tier</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(user.tierBreakdown).map(([tier, count]) => (
                      <span
                        key={tier}
                        className={`text-xs font-black px-3 py-1 rounded-none tracking-wider uppercase ${
                          tierColors[tier] || "bg-gray-600 text-gray-200"
                        }`}
                      >
                        {tier}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {user.recentPulls && user.recentPulls.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2 tracking-wider uppercase">Recent Pulls</p>
                <div ref={pullsRef} className="space-y-2">
                  {user.recentPulls.slice(0, 5).map((pull, i) => (
                    <div
                      key={i}
                      className="pull-item flex items-center gap-2 px-3 py-2 rounded-none"
                      style={{
                        opacity: 0,
                        backgroundColor: "rgba(0,229,255,0.03)",
                        border: "1px solid rgba(0,229,255,0.08)",
                      }}
                    >
                      <span className="text-xl">{pull.imageData}</span>
                      <span className="text-sm font-bold text-white flex-1">
                        {pull.name}
                      </span>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-none tracking-wider uppercase ${
                          tierColors[pull.tier] || "bg-gray-600 text-gray-200"
                        }`}
                      >
                        {pull.tier}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
