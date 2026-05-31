"use client";

import { useState, useEffect, useRef } from "react";
import {
  animate,
  createScope,
  stagger,
  fadeInUp,
  fadeIn,
  scaleIn,
} from "@/lib/anime-utils";
import { KatanaIcon, GemIcon, SettingsIcon, UsersIcon, CheckIcon, ChartIcon, GavelIcon, CalendarIcon, GiftIcon, WarningIcon, getItemIcon, SearchIcon } from "@/components/IconMap";

type Tab = "overview" | "users" | "items" | "gacha" | "bans" | "weekly";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  level: number;
  xp: number;
  gems: number;
  luck: number;
  gachaPity: number;
  dropPity: number;
  isCheater: boolean;
  isBanned: boolean;
  hiddenFromRanking?: boolean;
  streak: number;
  totalTasksCompleted: number;
  cheatWarnings: number;
  _count: { tasks: number; banLogs: number; inventory: number };
}

interface ItemTemplate {
  id: string;
  name: string;
  type: string;
  tier: string;
  imageData: string;
  isGachaEligible: boolean;
  description: string;
}

interface BanRecord {
  id: string;
  userId: string;
  reason: string;
  duration: string;
  bannedAt: string;
  expiresAt: string | null;
  user: { name: string; email: string };
}

interface ActivityEntry {
  _id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
}

interface WeeklyEntry {
  id: string;
  userId: string;
  userName: string;
  tasksCompleted: number;
  weekEnd: string;
  gemsAwarded: number;
}

export default function AdminPage() {
  const [session, setSession] = useState<{ user: SessionUser | null }>({ user: null });
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);

  const [overviewStats, setOverviewStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    totalGems: 0,
    avgLevel: 0,
    activeBans: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityEntry[]>([]);

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editLuck, setEditLuck] = useState(50);
  const [giveGemsAmount, setGiveGemsAmount] = useState(0);
  const [giftItemId, setGiftItemId] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("7d");

  const [items, setItems] = useState<ItemTemplate[]>([]);
  const [itemFilterType, setItemFilterType] = useState("all");
  const [itemFilterTier, setItemFilterTier] = useState("all");
  const [newItem, setNewItem] = useState({
    name: "",
    type: "avatar",
    tier: "common",
    imageData: "avatar_knight",
    description: "",
    isGachaEligible: true,
  });

  const [gachaPool, setGachaPool] = useState<ItemTemplate[]>([]);
  const [dropStats, setDropStats] = useState<Record<string, number>>({});

  const [bans, setBans] = useState<BanRecord[]>([]);
  const [banFormUser, setBanFormUser] = useState("");

  const [weeklyTop, setWeeklyTop] = useState<WeeklyEntry[]>([]);
  const [weeklyHistory, setWeeklyHistory] = useState<WeeklyEntry[]>([]);

  const rootRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          setSession(data);
          if (data?.user?.role !== "admin") {
            window.location.href = "/dashboard";
            return;
          }
        } else {
          window.location.href = "/login";
          return;
        }
      } catch {
        window.location.href = "/login";
        return;
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (session?.user?.role !== "admin") return;
    fetchTabData(activeTab);
    fetch("/api/admin/items").then((r) => r.ok ? r.json() : null).then((data) => {
      if (data?.templates) setItems(data.templates);
    });
  }, [activeTab, session]);

  const fetchTabData = async (tab: Tab) => {
    try {
      switch (tab) {
        case "overview": {
          const res = await fetch("/api/admin/overview");
          if (res.ok) {
            const data = await res.json();
            setOverviewStats(data.stats || {});
            setRecentActivity(data.recentActivity || []);
          }
          break;
        }
        case "users": {
          const res = await fetch("/api/admin/users");
          if (res.ok) {
            const data = await res.json();
            setUsers(data.users || []);
          }
          break;
        }
        case "items": {
          const res = await fetch("/api/admin/items");
          if (res.ok) {
            const data = await res.json();
            setItems(data.templates || []);
          }
          break;
        }
        case "gacha": {
          const poolRes = await fetch("/api/admin/gacha/pool");
          if (poolRes.ok) {
            const data = await poolRes.json();
            setGachaPool(data.items || []);
          }
          const statsRes = await fetch("/api/admin/gacha/stats");
          if (statsRes.ok) {
            const data = await statsRes.json();
            setDropStats(data.stats || {});
          }
          break;
        }
        case "bans": {
          const res = await fetch("/api/admin/bans");
          if (res.ok) {
            const data = await res.json();
            setBans(data.bans || []);
          }
          break;
        }
        case "weekly": {
          const topRes = await fetch("/api/admin/weekly/current");
          if (topRes.ok) {
            const data = await topRes.json();
            setWeeklyTop(data.topUsers || []);
          }
          const histRes = await fetch("/api/admin/weekly/history");
          if (histRes.ok) {
            const data = await histRes.json();
            setWeeklyHistory(data.history || []);
          }
          break;
        }
      }
    } catch {}
  };

  const handleEditUser = (user: UserRecord) => {
    setEditingUser(user);
    setEditLuck(user.luck);
    setGiveGemsAmount(0);
    setGiftItemId("");
  };

  const handleSaveLuck = async () => {
    if (!editingUser) return;
    await fetch(`/api/admin/users`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: editingUser.id, luck: editLuck }),
    });
    setEditingUser(null);
    fetchTabData("users");
  };

  const handleGiveGems = async () => {
    if (!editingUser || giveGemsAmount <= 0) return;
    await fetch(`/api/admin/users`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: editingUser.id, gems: giveGemsAmount }),
    });
    setEditingUser(null);
    fetchTabData("users");
  };

  const handleGiftItem = async () => {
    if (!editingUser || !giftItemId) return;
    await fetch(`/api/admin/gift`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: editingUser.id, itemTemplateId: giftItemId }),
    });
    setEditingUser(null);
    fetchTabData("users");
  };

  const handleToggleBan = async (userId: string, currentlyBanned: boolean) => {
    if (currentlyBanned) {
      await fetch(`/api/admin/users`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isBanned: false }),
      });
    } else {
      await fetch(`/api/admin/users`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isBanned: true, reason: banReason || "Admin ban", duration: banDuration }),
      });
    }
    fetchTabData("users");
  };

  const handleToggleHiddenFromRanking = async (userId: string, current: boolean) => {
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, hiddenFromRanking: !current }),
    });
    fetchTabData("users");
  };

  const handleToggleGachaEligible = async (itemId: string, current: boolean) => {
    await fetch(`/api/admin/items`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: itemId, isGachaEligible: !current }),
    });
    fetchTabData("items");
  };

  const handleCreateItem = async () => {
    await fetch("/api/admin/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    setNewItem({ name: "", type: "avatar", tier: "common", imageData: "avatar_knight", description: "", isGachaEligible: true });
    fetchTabData("items");
  };

  const handleTriggerWeeklyAward = async () => {
    await fetch("/api/weekly-award", { method: "POST" });
    fetchTabData("weekly");
  };

  const handleManualBan = async () => {
    if (!banFormUser || !banReason) return;
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: banFormUser, isBanned: true, reason: banReason, duration: banDuration }),
    });
    setBanFormUser("");
    setBanReason("");
    setBanDuration("7d");
    fetchTabData("bans");
  };

  const handleUnban = async (userId: string) => {
    await fetch(`/api/admin/users`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isBanned: false }),
    });
    fetchTabData("bans");
  };

  const tabs: { key: Tab; label: string; iconKey: string }[] = [
    { key: "overview", label: "OVERVIEW", iconKey: "chart" },
    { key: "users", label: "USERS", iconKey: "users" },
    { key: "items", label: "ITEMS", iconKey: "sword" },
    { key: "gacha", label: "GACHA", iconKey: "gem" },
    { key: "bans", label: "BANS", iconKey: "gavel" },
    { key: "weekly", label: "WEEKLY", iconKey: "calendar" },
  ];

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredItems = items.filter((item) => {
    if (itemFilterType !== "all" && item.type !== itemFilterType) return false;
    if (itemFilterTier !== "all" && item.tier !== itemFilterTier) return false;
    return true;
  });

  const statCards = [
    { label: "TOTAL USERS", value: overviewStats.totalUsers, iconEl: <UsersIcon size={24} className="text-cyan-400" /> },
    { label: "TOTAL TASKS", value: overviewStats.totalTasks, iconEl: <CheckIcon size={24} className="text-cyan-400" /> },
    { label: "GEMS IN CIRCULATION", value: overviewStats.totalGems, iconEl: <GemIcon size={24} className="text-cyan-400" /> },
    { label: "AVG LEVEL", value: overviewStats.avgLevel, iconEl: <ChartIcon size={24} className="text-cyan-400" /> },
    { label: "ACTIVE BANS", value: overviewStats.activeBans, iconEl: <GavelIcon size={24} className="text-cyan-400" /> },
  ];

  // === ANIMATION EFFECTS ===

  useEffect(() => {
    if (!spinnerRef.current) return;
    try {
      const a = animate(spinnerRef.current, {
        rotate: 360,
        duration: 1000,
        loop: true,
        ease: "linear",
      });
      return () => { a.revert(); };
    } catch {}
  }, []);

  useEffect(() => {
    if (!rootRef.current) return;
    try {
      const scope = createScope({ root: rootRef.current }).add(() => {
        fadeInUp('[data-animate="header"]');
      });
      return () => scope.revert();
    } catch {}
  }, []);

  useEffect(() => {
    if (!rootRef.current) return;
    try {
      const scope = createScope({ root: rootRef.current }).add(() => {
        fadeIn('[data-animate="tab-content"]');
      });
      return () => scope.revert();
    } catch {}
  }, [activeTab]);

  useEffect(() => {
    if (!rootRef.current || activeTab !== "overview") return;
    try {
      const scope = createScope({ root: rootRef.current }).add(() => {
        animate('[data-animate="stat-card"]', {
          opacity: [0, 1],
          translateY: [20, 0],
          delay: stagger(100),
          duration: 500,
          ease: "outExpo",
        });
        animate('[data-animate="activity-entry"]', {
          opacity: [0, 1],
          translateX: [-10, 0],
          delay: stagger(50),
          duration: 500,
          ease: "outExpo",
        });
      });
      return () => scope.revert();
    } catch {}
  }, [activeTab, overviewStats, recentActivity]);

  useEffect(() => {
    if (!rootRef.current || activeTab !== "users") return;
    try {
      const scope = createScope({ root: rootRef.current }).add(() => {
        animate('[data-animate="user-row"]', {
          opacity: [0, 1],
          translateY: [10, 0],
          delay: stagger(30),
          duration: 500,
          ease: "outExpo",
        });
      });
      return () => scope.revert();
    } catch {}
  }, [activeTab, users, userSearch]);

  useEffect(() => {
    if (!rootRef.current || !editingUser) return;
    try {
      const scope = createScope({ root: rootRef.current }).add(() => {
        scaleIn('[data-animate="edit-modal"]');
      });
      return () => scope.revert();
    } catch {}
  }, [editingUser]);

  useEffect(() => {
    if (!rootRef.current || activeTab !== "items") return;
    try {
      const scope = createScope({ root: rootRef.current }).add(() => {
        animate('[data-animate="item-card"]', {
          opacity: [0, 1],
          scale: [0.95, 1],
          delay: stagger(30),
          duration: 500,
          ease: "outExpo",
        });
      });
      return () => scope.revert();
    } catch {}
  }, [activeTab, items, itemFilterType, itemFilterTier]);

  useEffect(() => {
    if (!rootRef.current || activeTab !== "gacha") return;
    try {
      const root = rootRef.current;
      const scope = createScope({ root }).add(() => {
        animate('[data-animate="gacha-item"]', {
          opacity: [0, 1],
          scale: [0.9, 1],
          delay: stagger(50),
          duration: 500,
          ease: "outExpo",
        });
        root.querySelectorAll<HTMLElement>('[data-animate="drop-bar"]').forEach((bar) => {
          const targetWidth = bar.dataset.width;
          if (targetWidth) {
            animate(bar, {
              width: targetWidth,
              duration: 800,
              ease: "outExpo",
            });
          }
        });
      });
      return () => scope.revert();
    } catch {}
  }, [activeTab, gachaPool, dropStats]);

  useEffect(() => {
    if (!rootRef.current || activeTab !== "bans") return;
    try {
      const scope = createScope({ root: rootRef.current }).add(() => {
        animate('[data-animate="ban-row"]', {
          opacity: [0, 1],
          translateY: [10, 0],
          delay: stagger(30),
          duration: 500,
          ease: "outExpo",
        });
      });
      return () => scope.revert();
    } catch {}
  }, [activeTab, bans]);

  useEffect(() => {
    if (!rootRef.current || activeTab !== "weekly") return;
    try {
      const scope = createScope({ root: rootRef.current }).add(() => {
        animate('[data-animate="weekly-top"]', {
          opacity: [0, 1],
          translateX: [-20, 0],
          delay: stagger(50),
          duration: 500,
          ease: "outExpo",
        });
        animate('[data-animate="weekly-history"]', {
          opacity: [0, 1],
          translateY: [10, 0],
          delay: stagger(30),
          duration: 500,
          ease: "outExpo",
        });
      });
      return () => scope.revert();
    } catch {}
  }, [activeTab, weeklyTop, weeklyHistory]);

  // === RENDER ===

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0d0d1a" }}>
        <div ref={spinnerRef} className="text-4xl">
          <SettingsIcon size={32} className="text-cyan-400" />
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: "#0d0d1a" }}>
      <div
        ref={rootRef}
        data-animate="header"
        
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-3xl md:text-4xl font-black mb-6 tracking-wider" style={{ color: "#7c4dff" }}>
          ADMIN PANEL
        </h1>

        <div className="flex flex-wrap gap-0 mb-8 border-b-2" style={{ borderColor: "#1a1a2e" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 font-black text-xs tracking-widest transition-all border-b-2 -mb-[2px] ${
                activeTab === tab.key
                  ? "text-cyan-400 border-cyan-400"
                  : "text-gray-500 border-transparent hover:text-gray-300"
              }`}
            >
              {tab.iconKey === "chart" ? <ChartIcon size={14} className="text-cyan-400" /> : tab.iconKey === "users" ? <UsersIcon size={14} className="text-cyan-400" /> : tab.iconKey === "sword" ? <KatanaIcon size={14} className="text-cyan-400" /> : tab.iconKey === "gem" ? <GemIcon size={14} className="text-cyan-400" /> : tab.iconKey === "gavel" ? <GavelIcon size={14} className="text-cyan-400" /> : <CalendarIcon size={14} className="text-cyan-400" />} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div data-animate="tab-content"  className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {statCards.map((card, i) => (
                <div
                  key={card.label}
                  data-animate="stat-card"
                  className="card-anime p-4 rounded-none border-2"
                  style={{ opacity: 0, transform: "translateY(20px)", backgroundColor: "#1a1a2e", borderColor: "#2a2a3e" }}
                >
                  <div className="mb-1">{card.iconEl}</div>
                  <p className="text-2xl font-black" style={{ color: "#00e5ff" }}>
                    {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 tracking-wider">{card.label}</p>
                </div>
              ))}
            </div>

            <div className="card-anime p-6 rounded-none border-2" style={{ backgroundColor: "#1a1a2e", borderColor: "#2a2a3e" }}>
              <h2 className="text-lg font-black text-white mb-4 tracking-wider">RECENT ACTIVITY</h2>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {recentActivity.length === 0 && (
                  <p className="text-gray-600 text-sm text-center py-4 tracking-wider">No recent activity</p>
                )}
                {recentActivity.map((entry, i) => (
                  <div
                    key={entry._id || i}
                    data-animate="activity-entry"
                    className="flex items-center gap-3 p-2 text-sm"
                    style={{ opacity: 0, transform: "translateX(-10px)", backgroundColor: i % 2 === 0 ? "transparent" : "rgba(0,229,255,0.02)" }}
                  >
                    <span className="text-xs text-gray-600 w-32 shrink-0 font-mono">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                    <span className="font-bold" style={{ color: "#00e5ff" }}>{entry.user}</span>
                    <span className="text-gray-400">{entry.action}</span>
                    <span className="text-gray-600 text-xs">{entry.details}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div data-animate="tab-content"  className="space-y-4">
            <div className="card-anime p-4 rounded-none border-2" style={{ backgroundColor: "#1a1a2e", borderColor: "#2a2a3e" }}>
              <input
                type="text"
                placeholder="SEARCH USERS..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full px-4 py-2 rounded-none font-bold text-sm focus:outline-none"
                style={{ backgroundColor: "#0d0d1a", color: "#fff", border: "2px solid #2a2a3e" }}
              />
            </div>

            <div className="card-anime rounded-none border-2 overflow-hidden" style={{ backgroundColor: "#1a1a2e", borderColor: "#2a2a3e" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "#151530" }}>
                      <th className="px-3 py-3 text-left font-black tracking-wider text-xs text-gray-400">NAME</th>
                      <th className="px-3 py-3 text-left font-black tracking-wider text-xs text-gray-400">EMAIL</th>
                      <th className="px-3 py-3 text-left font-black tracking-wider text-xs text-gray-400">LV</th>
                      <th className="px-3 py-3 text-left font-black tracking-wider text-xs text-gray-400">XP</th>
                      <th className="px-3 py-3 text-left font-black tracking-wider text-xs text-gray-400">GEMS</th>
                      <th className="px-3 py-3 text-left font-black tracking-wider text-xs text-gray-400">LUCK</th>
                      <th className="px-3 py-3 text-left font-black tracking-wider text-xs text-gray-400">PITY</th>
                      <th className="px-3 py-3 text-left font-black tracking-wider text-xs text-gray-400">STATUS</th>
                      <th className="px-3 py-3 text-left font-black tracking-wider text-xs text-gray-400">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, i) => (
                      <tr
                        key={user.id}
                        data-animate="user-row"
                        className={`border-b ${user.isBanned ? "opacity-30" : ""}`}
                        style={{ opacity: 0, transform: "translateY(10px)", borderColor: "#2a2a3e", backgroundColor: i % 2 === 0 ? "#1a1a2e" : "#151530" }}
                      >
                        <td className="px-3 py-2 font-bold text-white">
                          {user.name}
                          {user.isCheater && (
                            <span className="ml-1 text-xs font-black px-1.5 py-0.5 rounded-none" style={{ backgroundColor: "#ff1744", color: "#fff" }}>
                              <WarningIcon size={12} className="text-white" />
                            </span>
                          )}
                          {user.hiddenFromRanking && (
                            <span className="ml-1 text-xs font-bold px-1.5 py-0.5 rounded-none tracking-wider" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#666" }}>
                              HIDDEN
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-gray-500">{user.email}</td>
                        <td className="px-3 py-2 text-gray-300 font-bold">{user.level}</td>
                        <td className="px-3 py-2 font-mono text-xs" style={{ color: "#00e5ff" }}>{user.xp.toLocaleString()}</td>
                        <td className="px-3 py-2" style={{ color: "#ffd600" }}>                        <span className="inline-flex items-center gap-1"><GemIcon size={14} className="text-yellow-400" /> {user.gems}</span></td>
                        <td className="px-3 py-2 text-xs text-gray-500">{user.luck}</td>
                        <td className="px-3 py-2 text-xs text-gray-500">{user.gachaPity}/{user.dropPity}</td>
                        <td className="px-3 py-2">
                          {user.isCheater ? (
                            <span className="text-xs font-black tracking-wider" style={{ color: "#ff1744" }}>CHEATER</span>
                          ) : user.isBanned ? (
                            <span className="text-xs font-black tracking-wider" style={{ color: "#ff1744" }}>BANNED</span>
                          ) : (
                            <span className="text-xs font-bold tracking-wider" style={{ color: "#00e5ff" }}>CLEAN</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1 flex-wrap">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="btn-secondary px-2 py-1 rounded-none text-xs font-black tracking-wider"
                            >
                              EDIT
                            </button>
                            <button
                              onClick={() => handleToggleBan(user.id, user.isBanned)}
                              className={`px-2 py-1 rounded-none text-xs font-black tracking-wider ${
                                user.isBanned ? "btn-primary" : "btn-outline"
                              }`}
                              style={user.isBanned ? {} : { borderColor: "#ff1744", color: "#ff1744" }}
                            >
                              {user.isBanned ? "UNBAN" : "BAN"}
                            </button>
                            <a
                              href={`/profile/${user.id}`}
                              className="btn-outline px-2 py-1 rounded-none text-xs font-black tracking-wider inline-block"
                            >
                              VIEW
                            </a>
                            <button
                              onClick={() => handleToggleHiddenFromRanking(user.id, !!user.hiddenFromRanking)}
                              className={`px-2 py-1 rounded-none text-xs font-black tracking-wider`}
                              style={
                                user.hiddenFromRanking
                                  ? { backgroundColor: "rgba(0,229,255,0.15)", color: "#00e5ff" }
                                  : { backgroundColor: "rgba(255,255,255,0.05)", color: "#666" }
                              }
                            >
                              {user.hiddenFromRanking ? "SHOW IN RANKS" : "HIDE FROM RANKS"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {editingUser && (
              <div
                data-animate="edit-modal"
                className="card-anime p-6 rounded-none border-2"
                style={{ opacity: 0, transform: "scale(0.95)", backgroundColor: "#1a1a2e", borderColor: "#7c4dff" }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-black text-white tracking-wider">
                    EDIT: {editingUser.name}
                  </h3>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="text-gray-500 hover:text-white text-xl font-black"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 mb-2 tracking-wider uppercase">
                      LUCK (HIDDEN): {editLuck}
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={editLuck}
                      onChange={(e) => setEditLuck(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                    <div className="flex justify-between text-xs text-gray-600 font-mono">
                      <span>0</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                    <button
                      onClick={handleSaveLuck}
                      className="btn-primary mt-2 px-4 py-1.5 rounded-none text-sm font-black tracking-wider"
                    >
                      SAVE LUCK
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-400 mb-2 tracking-wider uppercase">
                      GIVE GEMS
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={1}
                        value={giveGemsAmount}
                        onChange={(e) => setGiveGemsAmount(Number(e.target.value))}
                        className="flex-1 px-3 py-2 rounded-none text-sm font-bold focus:outline-none"
                        style={{ backgroundColor: "#0d0d1a", color: "#fff", border: "2px solid #2a2a3e" }}
                        placeholder="AMOUNT"
                      />
                      <button
                        onClick={handleGiveGems}
                        className="btn-primary px-4 py-2 rounded-none text-sm font-black tracking-wider"
                      >
                        GIVE GEMS
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-400 mb-2 tracking-wider uppercase">
                      GIFT ITEM
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={giftItemId}
                        onChange={(e) => setGiftItemId(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-none text-sm font-bold focus:outline-none"
                        style={{ backgroundColor: "#0d0d1a", color: "#fff", border: "2px solid #2a2a3e" }}
                      >
                        <option value="">SELECT ITEM...</option>
                        {items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.tier})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleGiftItem}
                        className="btn-secondary px-4 py-2 rounded-none text-sm font-black tracking-wider"
                      >
                        GIFT ITEM
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "items" && (
          <div data-animate="tab-content"  className="space-y-4">
            <div className="card-anime p-4 rounded-none border-2" style={{ backgroundColor: "#1a1a2e", borderColor: "#2a2a3e" }}>
              <h3 className="font-black text-white mb-3 tracking-wider">CREATE NEW ITEM</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="px-3 py-2 rounded-none text-sm font-bold focus:outline-none"
                  style={{ backgroundColor: "#0d0d1a", color: "#fff", border: "2px solid #2a2a3e" }}
                />
                  <select
                    value={newItem.type}
                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                    className="px-3 py-2 rounded-none text-sm font-bold focus:outline-none"
                    style={{ backgroundColor: "#0d0d1a", color: "#fff", border: "2px solid #2a2a3e" }}
                  >
                    <option value="avatar">Avatar</option>
                    <option value="card">Card</option>
                    <option value="equipment">Equipment</option>
                  </select>
                  <select
                    value={newItem.tier}
                    onChange={(e) => setNewItem({ ...newItem, tier: e.target.value })}
                    className="px-3 py-2 rounded-none text-sm font-bold focus:outline-none"
                    style={{ backgroundColor: "#0d0d1a", color: "#fff", border: "2px solid #2a2a3e" }}
                  >
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                    <option value="mythic">Mythic</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Image/Emoji"
                    value={newItem.imageData}
                    onChange={(e) => setNewItem({ ...newItem, imageData: e.target.value })}
                  className="px-3 py-2 rounded-none text-sm font-bold focus:outline-none"
                  style={{ backgroundColor: "#0d0d1a", color: "#fff", border: "2px solid #2a2a3e" }}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="px-3 py-2 rounded-none text-sm font-bold focus:outline-none"
                  style={{ backgroundColor: "#0d0d1a", color: "#fff", border: "2px solid #2a2a3e" }}
                />
                <button
                  onClick={handleCreateItem}
                  className="btn-primary px-4 py-2 rounded-none text-sm font-black tracking-wider"
                >
                  CREATE
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-2">
              <select
                value={itemFilterType}
                onChange={(e) => setItemFilterType(e.target.value)}
                className="px-3 py-2 rounded-none text-sm font-bold focus:outline-none"
                style={{ backgroundColor: "#1a1a2e", color: "#fff", border: "2px solid #2a2a3e" }}
              >
                <option value="all">ALL TYPES</option>
                <option value="avatar">Avatar</option>
                <option value="card">Card</option>
                <option value="equipment">Equipment</option>
              </select>
              <select
                value={itemFilterTier}
                onChange={(e) => setItemFilterTier(e.target.value)}
                className="px-3 py-2 rounded-none text-sm font-bold focus:outline-none"
                style={{ backgroundColor: "#1a1a2e", color: "#fff", border: "2px solid #2a2a3e" }}
              >
                <option value="all">ALL TIERS</option>
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
                <option value="mythic">Mythic</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredItems.map((item, i) => (
                <div
                  key={item.id}
                  data-animate="item-card"
                  className="card-anime p-4 rounded-none border-2"
                  style={{
                    opacity: 0,
                    transform: "scale(0.95)",
                    backgroundColor: "#1a1a2e",
                    borderColor: item.tier === "mythic" ? "#ffd600" : item.tier === "legendary" ? "#7c4dff" : "#2a2a3e",
                    boxShadow: item.tier === "mythic" ? "0 0 15px rgba(255,214,0,0.2)" : "none",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {item.type === "card" ? "CARD" : getItemIcon(item.id, { size: 24, className: "text-cyan-400" })}
                      </span>
                      <div>
                        <p className="font-black text-white">{item.name}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">
                          {item.type} • {item.tier}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-black px-2 py-0.5 rounded-none tracking-wider"
                      style={{
                        backgroundColor: item.isGachaEligible ? "rgba(0,229,255,0.1)" : "rgba(255,23,68,0.1)",
                        color: item.isGachaEligible ? "#00e5ff" : "#ff1744",
                      }}
                    >
                      {item.isGachaEligible ? "IN POOL" : "EXCLUDED"}
                    </span>
                    <button
                      onClick={() => handleToggleGachaEligible(item.id, item.isGachaEligible)}
                      className="btn-outline px-3 py-1 rounded-none text-xs font-black tracking-wider"
                    >
                      TOGGLE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "gacha" && (
          <div data-animate="tab-content"  className="space-y-6">
            <div className="card-anime p-6 rounded-none border-2" style={{ backgroundColor: "#1a1a2e", borderColor: "#2a2a3e" }}>
              <h2 className="text-lg font-black text-white mb-4 tracking-wider">CURRENT GACHA POOL</h2>
              {gachaPool.length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-4 tracking-wider">No items in gacha pool</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {gachaPool.map((item, i) => (
                    <div
                      key={item.id}
                      data-animate="gacha-item"
                      className="card-anime p-3 rounded-none border-2 text-center"
                      style={{
                        opacity: 0,
                        transform: "scale(0.9)",
                        backgroundColor: "#1a1a2e",
                        borderColor: item.tier === "mythic" ? "#ffd600" : item.tier === "legendary" ? "#7c4dff" : "#2a2a3e",
                      }}
                    >
                      <p className="text-2xl mb-1">{item.type === "card" ? "CARD" : getItemIcon(item.id, { size: 24, className: "text-cyan-400" })}</p>
                      <p className="text-xs font-black text-white">{item.name}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{item.tier}</p>
                      {item.tier === "mythic" && (
                        <button
                          onClick={() => handleToggleGachaEligible(item.id, true)}
                          className="btn-outline mt-2 px-2 py-0.5 rounded-none text-xs font-black tracking-wider"
                          style={{ borderColor: "#ff1744", color: "#ff1744" }}
                        >
                          DISABLE
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card-anime p-6 rounded-none border-2" style={{ backgroundColor: "#1a1a2e", borderColor: "#2a2a3e" }}>
              <h2 className="text-lg font-black text-white mb-4 tracking-wider">DROP STATISTICS</h2>
              {Object.keys(dropStats).length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-4 tracking-wider">No drop data available</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(dropStats).map(([tier, count]) => (
                    <div key={tier} className="flex items-center gap-3">
                      <span className="text-sm font-black uppercase tracking-wider w-24 text-gray-400">{tier}</span>
                      <div className="flex-1 h-4 overflow-hidden" style={{ backgroundColor: "#0d0d1a" }}>
                        <div
                          data-animate="drop-bar"
                          data-width={`${Math.min((count / (overviewStats.totalUsers || 1)) * 100, 100)}%`}
                          className="h-full"
                          style={{ width: 0, backgroundColor: "#7c4dff" }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-16 text-right font-mono">{count as number}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "bans" && (
          <div data-animate="tab-content"  className="space-y-6">
            <div className="card-anime p-6 rounded-none border-2" style={{ backgroundColor: "#1a1a2e", borderColor: "#ff1744" }}>
              <h2 className="text-lg font-black text-white mb-4 tracking-wider">MANUAL BAN</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <select
                  value={banFormUser}
                  onChange={(e) => setBanFormUser(e.target.value)}
                  className="px-3 py-2 rounded-none text-sm font-bold focus:outline-none"
                  style={{ backgroundColor: "#0d0d1a", color: "#fff", border: "2px solid #2a2a3e" }}
                >
                  <option value="">SELECT USER...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Reason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="px-3 py-2 rounded-none text-sm font-bold focus:outline-none"
                  style={{ backgroundColor: "#0d0d1a", color: "#fff", border: "2px solid #2a2a3e" }}
                />
                <select
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value)}
                  className="px-3 py-2 rounded-none text-sm font-bold focus:outline-none"
                  style={{ backgroundColor: "#0d0d1a", color: "#fff", border: "2px solid #2a2a3e" }}
                >
                  <option value="1d">1 DAY</option>
                  <option value="7d">7 DAYS</option>
                  <option value="30d">30 DAYS</option>
                  <option value="permanent">PERMANENT</option>
                </select>
                <button
                  onClick={handleManualBan}
                  className="px-4 py-2 rounded-none text-sm font-black tracking-wider uppercase"
                  style={{ backgroundColor: "#ff1744", color: "#fff" }}
                >
                  ISSUE BAN
                </button>
              </div>
            </div>

            <div className="card-anime rounded-none border-2 overflow-hidden" style={{ backgroundColor: "#1a1a2e", borderColor: "#2a2a3e" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "#151530" }}>
                      <th className="px-4 py-3 text-left font-black tracking-wider text-xs text-gray-400">USER</th>
                      <th className="px-4 py-3 text-left font-black tracking-wider text-xs text-gray-400">REASON</th>
                      <th className="px-4 py-3 text-left font-black tracking-wider text-xs text-gray-400">DURATION</th>
                      <th className="px-4 py-3 text-left font-black tracking-wider text-xs text-gray-400">DATE</th>
                      <th className="px-4 py-3 text-left font-black tracking-wider text-xs text-gray-400">EXPIRES</th>
                      <th className="px-4 py-3 text-left font-black tracking-wider text-xs text-gray-400">STATUS</th>
                      <th className="px-4 py-3 text-left font-black tracking-wider text-xs text-gray-400">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bans.map((ban, i) => {
                      const isActive = ban.expiresAt ? new Date(ban.expiresAt) > new Date() : true;
                      return (
                      <tr
                        key={ban.id}
                        data-animate="ban-row"
                        className={`border-b ${isActive ? "" : "opacity-50"}`}
                        style={{ opacity: 0, transform: "translateY(10px)", borderColor: "#2a2a3e", backgroundColor: i % 2 === 0 ? "#1a1a2e" : "#151530" }}
                      >
                        <td className="px-4 py-2 font-bold text-white">{ban.user.name}</td>
                        <td className="px-4 py-2 text-gray-400">{ban.reason}</td>
                        <td className="px-4 py-2 text-gray-400 uppercase tracking-wider text-xs">{ban.duration}</td>
                        <td className="px-4 py-2 text-xs text-gray-600 font-mono">
                          {new Date(ban.bannedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-600 font-mono">
                          {ban.expiresAt ? new Date(ban.expiresAt).toLocaleDateString() : "NEVER"}
                        </td>
                        <td className="px-4 py-2">
                          {isActive ? (
                            <span className="text-xs font-black px-2 py-0.5 rounded-none tracking-wider" style={{ backgroundColor: "rgba(255,23,68,0.15)", color: "#ff1744" }}>
                              ACTIVE
                            </span>
                          ) : (
                            <span className="text-xs font-black px-2 py-0.5 rounded-none tracking-wider" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#666" }}>
                              EXPIRED
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {isActive && (
                            <button
                              onClick={() => handleUnban(ban.userId)}
                              className="btn-primary px-3 py-1 rounded-none text-xs font-black tracking-wider"
                            >
                              UNBAN
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "weekly" && (
          <div data-animate="tab-content"  className="space-y-6">
            <div className="card-anime p-6 rounded-none border-2" style={{ backgroundColor: "#1a1a2e", borderColor: "#2a2a3e" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-white tracking-wider">
                  CURRENT WEEK TOP USERS
                </h2>
                <button
                  onClick={handleTriggerWeeklyAward}
                  className="px-4 py-2 rounded-none text-sm font-black tracking-wider"
                  style={{ backgroundColor: "#ffd600", color: "#0d0d1a" }}
                >
                  TRIGGER AWARD
                </button>
              </div>
              {weeklyTop.length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-4 tracking-wider">No data for this week yet</p>
              ) : (
                <div className="space-y-2">
                  {weeklyTop.map((entry, i) => (
                    <div
                      key={entry.id || i}
                      data-animate="weekly-top"
                      className="flex items-center gap-4 p-3 rounded-none"
                      style={{
                        opacity: 0,
                        transform: "translateX(-20px)",
                        backgroundColor: i % 2 === 0 ? "#151530" : "#1a1a2e",
                        borderLeft: "3px solid",
                        borderLeftColor: i === 0 ? "#ffd600" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "#2a2a3e",
                      }}
                    >
                      <span className="text-xl font-black w-8" style={{ color: "#ffd600" }}>#{i + 1}</span>
                      <span className="font-bold text-white">{entry.userName}</span>
                      <span className="text-sm text-gray-500 ml-auto font-mono">
                        {entry.tasksCompleted} tasks
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card-anime p-6 rounded-none border-2" style={{ backgroundColor: "#1a1a2e", borderColor: "#2a2a3e" }}>
              <h2 className="text-lg font-black text-white mb-4 tracking-wider">
                PAST WEEKLY AWARDS
              </h2>
              {weeklyHistory.length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-4 tracking-wider">No past awards yet</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {weeklyHistory.map((entry, i) => (
                    <div
                      key={entry.id || i}
                      data-animate="weekly-history"
                      className="flex items-center gap-4 p-3 rounded-none border-2"
                      style={{ opacity: 0, transform: "translateY(10px)", borderColor: "#2a2a3e", backgroundColor: "#151530" }}
                    >
                      <span className="text-sm text-gray-600 font-mono">
                        {new Date(entry.weekEnd).toLocaleDateString()}
                      </span>
                      <span className="font-bold" style={{ color: "#7c4dff" }}>{entry.userName}</span>
                      <span className="text-xs text-gray-500 font-mono">
                        {entry.tasksCompleted} tasks
                      </span>
                      <span className="text-xs ml-auto font-black tracking-wider" style={{ color: "#ffd600" }}>                      <span className="inline-flex items-center gap-1"><GemIcon size={14} className="text-yellow-400" /> {entry.gemsAwarded}</span></span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
