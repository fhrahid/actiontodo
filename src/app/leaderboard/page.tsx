"use client";

import { useState, useEffect, useRef } from "react";
import { animate, createScope, stagger, fadeInUp, scaleIn, spinLoader } from "@/lib/anime-utils";
import { KatanaIcon, CrownIcon, GemIcon, StreakIcon, TrophyIcon } from "@/components/IconMap";

interface RankingUser {
  id: string;
  name: string;
  image?: string | null;
  level: number;
  xp: number;
  streak: number;
  totalTasksCompleted: number;
  gems: number;
  isCheater?: boolean;
  isBanned?: boolean;
}

interface WeeklyWinner {
  user: { id: string; name: string };
  weekEnd: string;
  gemsAwarded: number;
}

export default function LeaderboardPage() {
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [weeklyWinner, setWeeklyWinner] = useState<WeeklyWinner | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loaderRef = useRef<HTMLDivElement>(null);

  const pageRef = useRef<HTMLDivElement>(null);
  const scopeRef = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        if (res.ok) {
          const data = await res.json();
          setRankings(data.rankings || []);
          setWeeklyWinner(data.weeklyWinner || null);
          setCurrentUserId(data.currentUserId || null);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (loading && loaderRef.current) {
      const anim = animate(loaderRef.current, {
        rotate: 360,
        duration: 1000,
        loop: true,
        ease: "linear",
      });
      return () => { anim.pause(); };
    }
  }, [loading]);

  useEffect(() => {
    if (loading || !pageRef.current) return;

    pageRef.current.style.transform = "none";

    scopeRef.current?.revert();
    scopeRef.current = createScope({ root: pageRef.current }).add(() => {
      fadeInUp(".leaderboard-header", 0, 600);

      if (document.querySelector(".weekly-winner-card")) {
        scaleIn(".weekly-winner-card", 200, 500);
      }

      animate(".podium-item-0", {
        opacity: [0, 1],
        translateY: [40, 0],
        delay: 300,
        duration: 500,
        ease: "outExpo",
      });
      animate(".podium-item-1", {
        opacity: [0, 1],
        translateY: [40, 0],
        delay: 450,
        duration: 500,
        ease: "outExpo",
      });
      animate(".podium-item-2", {
        opacity: [0, 1],
        translateY: [40, 0],
        delay: 600,
        duration: 500,
        ease: "outExpo",
      });

      animate(".leaderboard-table-wrapper", {
        opacity: [0, 1],
        delay: 600,
        duration: 400,
        ease: "outExpo",
      });

      animate(".leaderboard-row", {
        opacity: [0, 1],
        delay: stagger(50),
        duration: 400,
        ease: "outExpo",
      });
    });

    return () => {
      scopeRef.current?.revert();
    };
  }, [loading, rankings, weeklyWinner]);

  const podiumOrder = rankings.length >= 3 ? [rankings[1], rankings[0], rankings[2]] : [];

  const getMedalStyle = (position: number) => {
    switch (position) {
      case 0:
        return { border: "2px solid #c0c0c0", backgroundColor: "#1a1a2e", boxShadow: "0 0 15px rgba(192,192,192,0.2)" };
      case 1:
        return { border: "2px solid #ffd600", backgroundColor: "#1a1a2e", boxShadow: "0 0 30px rgba(255,214,0,0.4)" };
      case 2:
        return { border: "2px solid #cd7f32", backgroundColor: "#1a1a2e", boxShadow: "0 0 15px rgba(205,127,50,0.2)" };
      default:
        return { border: "2px solid #2a2a3e", backgroundColor: "#1a1a2e" };
    }
  };

  const getPodiumSize = (position: number) => {
    switch (position) {
      case 0:
        return "scale-90";
      case 1:
        return "scale-110 -translate-y-4";
      case 2:
        return "scale-90";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0d0d1a" }}>
        <div ref={loaderRef} className="text-4xl">
          <KatanaIcon size={32} className="text-cyan-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: "#0d0d1a" }}>
        <div ref={pageRef} className="max-w-6xl mx-auto" style={{ transform: "none" }}>
        <div className="leaderboard-header" style={{ opacity: 0 }}>
          <h1 className="text-4xl md:text-5xl font-black text-center mb-2 tracking-wider" style={{ color: "#ffd600" }}>
            HALL OF FAME
          </h1>
          <p className="text-center text-gray-600 mb-8 text-sm tracking-widest uppercase">
            Only the strongest survive
          </p>
        </div>

        {weeklyWinner && (
          <div
            className="weekly-winner-card card-anime mb-8 p-4 text-center rounded-none border-2"
            style={{ backgroundColor: "#1a1a2e", borderColor: "#7c4dff", opacity: 0 }}
          >
            <p className="text-xs font-black tracking-[0.3em] mb-1" style={{ color: "#7c4dff" }}>
              LAST WEEK&apos;S CHAMPION
            </p>
            <p className="text-lg font-black text-white">
              <TrophyIcon size={18} className="inline text-yellow-400" /> {weeklyWinner.user.name}
            </p>
            <p className="text-xs text-gray-500">
              <GemIcon size={14} className="inline text-cyan-400" /> {weeklyWinner.gemsAwarded} gems awarded •{" "}
              {new Date(weeklyWinner.weekEnd).toLocaleDateString()}
            </p>
          </div>
        )}

        {podiumOrder.length === 3 && (
          <div className="flex items-end justify-center gap-4 mb-10">
            {podiumOrder.map((user, idx) => (
              <div
                key={user.id}
                className={`podium-item-${idx} card-anime flex flex-col items-center p-4 md:p-6 rounded-none transition-transform ${getPodiumSize(idx)}`}
                style={{ ...getMedalStyle(idx), opacity: 0 }}
              >
                <div className="text-3xl mb-1">
                  {idx === 1 ? <CrownIcon size={24} className="text-yellow-400" /> : <KatanaIcon size={24} className="text-gray-400" />}
                </div>
                <div className="mb-2 text-cyan-400"><KatanaIcon size={28} className="text-cyan-400" /></div>
                <p className="font-black text-sm md:text-base text-white text-center truncate max-w-[120px] tracking-wide">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 font-bold">LV. {user.level}</p>
                <p className="text-xs font-black mt-1" style={{ color: "#00e5ff" }}>
                  {user.xp.toLocaleString()} XP
                </p>
                {idx === 1 && (
                  <div className="mt-2 text-xs font-black px-2 py-0.5 rounded-none tracking-wider" style={{ backgroundColor: "#ffd600", color: "#0d0d1a" }}>
                    1ST
                  </div>
                )}
                {idx === 0 && (
                  <div className="mt-2 text-xs font-black px-2 py-0.5 rounded-none tracking-wider" style={{ backgroundColor: "#c0c0c0", color: "#0d0d1a" }}>
                    2ND
                  </div>
                )}
                {idx === 2 && (
                  <div className="mt-2 text-xs font-black px-2 py-0.5 rounded-none tracking-wider" style={{ backgroundColor: "#cd7f32", color: "#0d0d1a" }}>
                    3RD
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div
          className="leaderboard-table-wrapper card-anime rounded-none border-2 overflow-hidden"
          style={{ backgroundColor: "#1a1a2e", borderColor: "#2a2a3e", opacity: 0 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr style={{ backgroundColor: "#151530" }}>
                  <th className="px-4 py-3 text-left font-black tracking-wider text-xs text-gray-400 w-[8%]">#</th>
                  <th className="px-4 py-3 text-left font-black tracking-wider text-xs text-gray-400 w-[32%]">NAME</th>
                  <th className="px-4 py-3 text-left font-black tracking-wider text-xs text-gray-400 w-[10%]">LV</th>
                  <th className="px-4 py-3 text-left font-black tracking-wider text-xs text-gray-400 w-[18%]">XP</th>
                  <th className="px-4 py-3 text-left font-black tracking-wider text-xs text-gray-400 w-[16%]">STREAK</th>
                  <th className="px-4 py-3 text-left font-black tracking-wider text-xs text-gray-400 w-[16%]">TASKS</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((user, i) => {
                  const isCurrentUser = user.id === currentUserId;
                  const rowBg = i % 2 === 0 ? "#1a1a2e" : "#151530";

                  return (
                    <tr
                      key={user.id}
                      className={`leaderboard-row transition-colors ${
                        user.isBanned ? "opacity-30" : user.isCheater ? "opacity-50" : ""
                      } ${isCurrentUser ? "border-l-4 border-cyan-500" : ""}`}
                      style={{ backgroundColor: rowBg, opacity: 0 }}
                    >
                      <td className="px-4 py-3 font-black align-middle" style={{ color: "#ffd600" }}>
                        #{i + 1}
                      </td>
                      <td className="px-4 py-3 font-black text-white align-middle">
                        <span className="flex items-center gap-2 truncate">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className="h-7 w-7 rounded-full object-cover border border-cyan-500/30"
                            />
                          ) : (
                            <span className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-black"
                              style={{
                                backgroundColor: "rgba(0,229,255,0.15)",
                                color: "#00e5ff",
                              }}
                            >
                              {user.name?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          )}
                          {user.name}
                          {user.isCheater && (
                            <span className="text-xs font-black px-2 py-0.5 rounded-none tracking-wider" style={{ backgroundColor: "#ff1744", color: "#fff" }}>
                              ⚠️ CHEATER
                            </span>
                          )}
                          {user.isBanned && (
                            <span className="text-xs font-black px-2 py-0.5 rounded-none tracking-wider" style={{ backgroundColor: "#ff1744", color: "#fff" }}>
                              🔨 BANNED
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-300 align-middle">{user.level}</td>
                      <td className="px-4 py-3 font-mono align-middle" style={{ color: "#00e5ff" }}>
                        {user.xp.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 align-middle" style={{ color: "#ff1744" }}><span className="inline-flex items-center gap-1"><StreakIcon size={14} className="text-orange-400" /> {user.streak}</span></td>
                      <td className="px-4 py-3 text-gray-300 align-middle">{user.totalTasksCompleted}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {rankings.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-600">
            <p className="mb-4 flex items-center justify-center"><KatanaIcon size={48} className="text-gray-500" /></p>
            <p className="text-lg tracking-wider uppercase">No warriors yet. Be the first.</p>
          </div>
        )}
      </div>
    </div>
  );
}
