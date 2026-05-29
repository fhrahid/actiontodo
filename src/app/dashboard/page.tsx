"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { createScope, animate } from "animejs";
import Link from "next/link";
import { CATEGORY_CONFIG, STAGE_ICON, PRIORITY_CONFIG } from "@/lib/plants";
import type { PlantCategory, TaskPriority, GrowthStage } from "@/lib/plants";
import { calculateLevel, getTitle, xpForNextLevel } from "@/lib/gamification";
import { getStageIcon, getCategoryIcon, GemIcon, StreakIcon } from "@/components/IconMap";
import {
  staggerFadeInUp,
  scaleIn,
  floatAnimation,
  progressFill,
  fadeInUp,
} from "@/lib/anime-utils";

interface UserStats {
  xp: number;
  gems: number;
  streak: number;
  totalCompleted: number;
  luck: number;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  category: PlantCategory;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  completed: boolean;
  gachaTier?: string;
  gachaMultiplier?: number;
}

function getTaskGrowthStage(task: {
  completed: boolean;
  dueDate: string;
  createdAt: string;
}): GrowthStage {
  if (task.completed) return "blooming";
  const now = new Date();
  const due = new Date(task.dueDate);
  const created = new Date(task.createdAt);
  if (now > due) return "withered";
  const totalSpan = due.getTime() - created.getTime();
  const elapsed = now.getTime() - created.getTime();
  if (totalSpan <= 0) return "seed";
  const progress = elapsed / totalSpan;
  if (progress < 0.33) return "seed";
  if (progress < 0.66) return "sprout";
  return "budding";
}

const TIER_DOT: Record<string, string> = {
  common: "bg-gray-500",
  uncommon: "bg-green-400",
  rare: "bg-cyan-400",
  epic: "bg-purple-500",
  legendary: "bg-yellow-400",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          fetch("/api/user/stats"),
          fetch("/api/tasks"),
        ]);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const level = stats ? calculateLevel(stats.xp) : 1;
  const title = getTitle(level);
  const xpInfo = stats
    ? xpForNextLevel(stats.xp)
    : { current: 0, needed: 100, progress: 0 };

  const loadingRoot = useRef<HTMLDivElement>(null);
  const mainRoot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading || !loadingRoot.current) return;
    const scope = createScope({ root: loadingRoot.current }).add(() => {
      animate(".skeleton-pulse", {
        opacity: [0.3, 0.6, 0.3],
        duration: 1500,
        loop: true,
        ease: "inOutSine",
      });
    });
    return () => scope.revert();
  }, [loading]);

  useEffect(() => {
    if (loading || !mainRoot.current) return;
    const scope = createScope({ root: mainRoot.current }).add(() => {
      staggerFadeInUp(".stat-card", 0, 50);

      progressFill(".xp-bar", xpInfo.progress);

      animate(".level-neon", {
        opacity: [1, 0.3, 0.8, 0.3, 1],
        duration: 1500,
        loop: true,
        ease: "linear",
      });

      scaleIn(".empty-state");
      floatAnimation(".seed-float");

      staggerFadeInUp(".task-card", 0, 50);
      floatAnimation(".task-float");

      animate(".task-neon", {
        opacity: [1, 0.3, 0.8, 0.3, 1],
        duration: 1500,
        loop: true,
        ease: "linear",
      });

      animate(".task-shake", {
        translateX: [0, -3, 3, -2, 2, 0],
        duration: 400,
        loop: true,
        ease: "linear",
      });

      fadeInUp(".bottom-buttons", 300);
    });
    return () => scope.revert();
  }, [loading, tasks]);

  if (loading) {
    return (
      <div ref={loadingRoot} className="bg-[#0d0d1a] min-h-screen px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="skeleton-pulse card-anime h-24 rounded-xl bg-[#1a1a2e]"
                style={{ opacity: 0.3 }}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="skeleton-pulse card-anime h-48 rounded-xl bg-[#1a1a2e]"
                style={{ opacity: 0.3 }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={mainRoot} className="bg-[#0d0d1a] min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <div
            className="stat-card card-anime flex flex-col items-center justify-center rounded-xl p-4 border border-cyan-500/30 bg-cyan-500/10"
            style={{ opacity: 0 }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/70">
              Level
            </span>
            <span className="level-neon text-2xl font-black text-cyan-400">
              LV. {level}
            </span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-500/60">
              {title}
            </span>
          </div>

          <div
            className="stat-card card-anime col-span-2 flex flex-col justify-center rounded-xl p-4"
            style={{ opacity: 0 }}
          >
            <span className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              XP Progress
            </span>
            <div className="h-3 w-full overflow-hidden rounded bg-[#0d0d1a] border border-cyan-900/50">
              <div
                className="xp-bar h-full rounded bg-gradient-to-r from-cyan-500 to-purple-500"
                style={{ width: "0%" }}
              />
            </div>
            <span className="mt-1.5 text-[11px] font-bold text-gray-500">
              {xpInfo.current}
              <span className="text-gray-700">/</span>
              {xpInfo.needed} XP
            </span>
          </div>

          <div
            className="stat-card card-anime flex flex-col items-center justify-center rounded-xl p-4"
            style={{ opacity: 0 }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              Gems
            </span>
            <span className="text-xl font-black text-cyan-400 inline-flex items-center gap-1">
              <GemIcon size={18} className="text-cyan-400" />{" "}
              {stats?.gems ?? 0}
            </span>
          </div>

          <div
            className="stat-card card-anime flex flex-col items-center justify-center rounded-xl p-4"
            style={{ opacity: 0 }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              Streak
            </span>
            <span className="text-xl font-black text-orange-400 inline-flex items-center gap-1">
              <StreakIcon size={18} className="text-orange-400" />{" "}
              {stats?.streak ?? 0}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">
            Your Garden
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/30 to-transparent" />
          <span className="text-xs font-bold text-gray-600">
            {stats?.totalCompleted ?? 0} COMPLETED
          </span>
        </div>

        {tasks.length === 0 ? (
          <div
            className="empty-state card-anime flex flex-col items-center justify-center rounded-xl p-16 text-center"
            style={{ opacity: 0 }}
          >
            <span className="seed-float mb-4">
              {getStageIcon("seed", { size: 64, className: "text-cyan-400" })}
            </span>
            <p className="text-lg font-black uppercase tracking-wider text-gray-300">
              No Missions Yet
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Deploy your first mission to begin.
            </p>
            <Link href="/tasks" className="btn-anime btn-primary mt-6">
              DEPLOY MISSION
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {tasks.map((task) => {
              const stage = getTaskGrowthStage(task);
              const stageIcon = stage;
              const catConfig = CATEGORY_CONFIG[task.category];
              const isCompleted = task.completed;
              const isOverdue =
                !task.completed && new Date(task.dueDate) < new Date();

              return (
                <div
                  key={task.id}
                  className={`task-card card-anime relative overflow-hidden rounded-xl p-4 ${
                    isCompleted
                      ? "border border-yellow-500/50 shadow-[0_0_20px_rgba(255,214,0,0.15)]"
                      : isOverdue
                        ? "border border-red-500/30 bg-red-950/20"
                        : ""
                  }`}
                  style={{ opacity: 0 }}
                >
                  {task.gachaTier && (
                    <span className="absolute top-2 right-2 flex items-center gap-1">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${TIER_DOT[task.gachaTier] ?? "bg-gray-600"}`}
                      />
                      <span className="text-[10px] font-bold uppercase text-gray-500">
                        {task.gachaMultiplier}x
                      </span>
                    </span>
                  )}
                  <div className="flex flex-col items-center text-center">
                    <span
                      className={`text-4xl ${
                        isCompleted
                          ? "task-neon"
                          : isOverdue
                            ? "opacity-60 task-shake"
                            : "task-float"
                      }`}
                    >
                      {getStageIcon(stageIcon, {
                        size: 40,
                        className: isCompleted
                          ? "text-yellow-400"
                          : isOverdue
                            ? "opacity-60 text-red-400"
                            : "text-cyan-400",
                      })}
                    </span>
                    <h3 className="mt-2 line-clamp-2 text-sm font-bold text-white">
                      {task.title}
                    </h3>
                    <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                      {getCategoryIcon(task.category, { size: 14, className: catConfig.color })}{" "}
                      {catConfig.label}
                    </span>
                    {task.dueDate && (
                      <p
                        className={`mt-1.5 text-[11px] font-semibold ${isOverdue ? "text-red-400" : "text-gray-600"}`}
                      >
                        {isOverdue ? "OVERDUE — " : ""}
                        {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div
          className="bottom-buttons flex flex-wrap gap-4"
          style={{ opacity: 0 }}
        >
          <Link href="/tasks" className="btn-anime btn-primary">
            ⚔️ New Task
          </Link>
          <Link href="/tasks" className="btn-anime btn-outline">
            View All
          </Link>
        </div>
      </div>
    </div>
  );
}
