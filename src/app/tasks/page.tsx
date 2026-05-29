"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import { animate, createTimeline, stagger } from "animejs";
import {
  CATEGORY_CONFIG,
  PRIORITY_CONFIG,
  PLANT_CATEGORIES,
  TASK_PRIORITIES,
} from "@/lib/plants";
import type { PlantCategory, TaskPriority } from "@/lib/plants";
import { getCategoryIcon, getItemIcon, GemIcon, GiftIcon, KatanaIcon } from "@/components/IconMap";

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
  xpAwarded?: number;
}

interface GachaModalData {
  tier: string;
  multiplier: number;
  xp: number;
}

interface BonusDropData {
  type: string;
  gemAmount?: number;
  tier?: string;
  itemType?: string;
}

const TIER_COLORS_SVG: Record<string, string> = {
  common: "#6b7280",
  uncommon: "#4ade80",
  rare: "#00e5ff",
  epic: "#7c4dff",
  legendary: "#ffd600",
};

const TIER_LABEL: Record<string, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

const TIER_DOT: Record<string, string> = {
  common: "bg-gray-500",
  uncommon: "bg-green-400",
  rare: "bg-cyan-400",
  epic: "bg-purple-500",
  legendary: "bg-yellow-400",
};

const CATEGORY_COLORS: Record<string, string> = {
  work: "text-amber-400",
  personal: "text-pink-400",
  health: "text-green-400",
  study: "text-purple-400",
  creative: "text-rose-400",
  social: "text-yellow-400",
  fitness: "text-emerald-400",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-gray-500",
  medium: "text-cyan-400",
  high: "text-red-400",
};

export default function TasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState<PlantCategory>("personal");
  const [formPriority, setFormPriority] = useState<TaskPriority>("medium");
  const [formDueDate, setFormDueDate] = useState("");
  const [formReminder, setFormReminder] = useState(false);
  const [formReminderInterval, setFormReminderInterval] = useState<number>(30);
  const [submitting, setSubmitting] = useState(false);

  const [gachaModal, setGachaModal] = useState<GachaModalData | null>(null);
  const [bonusModal, setBonusModal] = useState<BonusDropData | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState<PlantCategory>("personal");
  const [editPriority, setEditPriority] = useState<TaskPriority>("medium");
  const [editDueDate, setEditDueDate] = useState("");

  const [formMounted, setFormMounted] = useState(false);
  const [gachaMounted, setGachaMounted] = useState(false);
  const [bonusMounted, setBonusMounted] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const gachaOverlayRef = useRef<HTMLDivElement>(null);
  const gachaCardRef = useRef<HTMLDivElement>(null);
  const gachaIconRef = useRef<HTMLDivElement>(null);
  const bonusOverlayRef = useRef<HTMLDivElement>(null);
  const bonusCardRef = useRef<HTMLDivElement>(null);
  const bonusIconRef = useRef<HTMLDivElement>(null);
  const emptyStateRef = useRef<HTMLDivElement>(null);
  const emptyIconRef = useRef<HTMLSpanElement>(null);

  const TASKS_PER_PAGE = 10;

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : data.tasks ?? []);
        setHasMore((Array.isArray(data) ? data : data.tasks ?? []).length > TASKS_PER_PAGE * page);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      !search ||
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description?.toLowerCase() ?? "").includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || task.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && task.completed) ||
      (statusFilter === "active" && !task.completed);
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const paginatedTasks = filteredTasks.slice(0, TASKS_PER_PAGE * page);

  const tasksKey = paginatedTasks.map((t) => t.id).join(",");
  const isEmpty = filteredTasks.length === 0;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          category: formCategory,
          priority: formPriority,
          dueDate: formDueDate,
          reminder: formReminder,
          reminderInterval: formReminder ? formReminderInterval : 0,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.gachaResult) {
          setGachaModal({
            tier: data.gachaResult.tier,
            multiplier: data.gachaResult.multiplier,
            xp: data.xpAwarded ?? 10,
          });
        }
        setFormTitle("");
        setFormDescription("");
        setFormCategory("personal");
        setFormPriority("medium");
        setFormDueDate("");
        setFormReminder(false);
        setFormReminderInterval(30);
        setShowForm(false);
        fetchTasks();
      }
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.bonusDrop && data.bonusDrop.type !== "nothing") {
          setBonusModal(data.bonusDrop);
        }
        fetchTasks();
      }
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      fetchTasks();
    } catch {}
  };

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setEditCategory(task.category);
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
  };

  const handleEditSave = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          category: editCategory,
          priority: editPriority,
          dueDate: editDueDate,
        }),
      });
      setEditingTaskId(null);
      fetchTasks();
    } catch {}
  };

  const getGachaGlow = (tier: string) => {
    switch (tier) {
      case "legendary":
        return "shadow-[0_0_60px_rgba(255,214,0,0.6)]";
      case "epic":
        return "shadow-[0_0_40px_rgba(124,77,255,0.5)]";
      case "rare":
        return "shadow-[0_0_30px_rgba(0,229,255,0.5)]";
      case "uncommon":
        return "shadow-[0_0_20px_rgba(74,222,128,0.4)]";
      default:
        return "shadow-[0_0_10px_rgba(156,163,175,0.3)]";
    }
  };

  const getGachaTextColor = (tier: string) => {
    switch (tier) {
      case "legendary":
        return "text-yellow-400";
      case "epic":
        return "text-purple-400";
      case "rare":
        return "text-cyan-400";
      case "uncommon":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const triggerGachaIconAnimation = useCallback((tier: string) => {
    const el = gachaIconRef.current;
    if (!el) return;

    switch (tier) {
      case "legendary": {
        const tl = createTimeline();
        tl.add(el, {
          scale: [
            { to: 0, duration: 0 },
            { to: 1.5, duration: 400, ease: "outBack" },
            { to: 1, duration: 300, ease: "outQuad" },
          ],
          opacity: [
            { to: 0, duration: 0 },
            { to: 1, duration: 200 },
          ],
          filter: [
            { to: "brightness(1)", duration: 0 },
            { to: "brightness(3)", duration: 300 },
            { to: "brightness(1)", duration: 600 },
          ],
          rotate: [0, 10, -5, 0],
          duration: 700,
        });
        tl.add(
          el,
          {
            rotate: [0, 360],
            duration: 4000,
            loop: true,
            ease: "linear",
          },
          "-=300"
        );
        animate(el, {
          boxShadow: [
            "0 0 10px rgba(255,214,0,0.3)",
            "0 0 40px rgba(255,214,0,0.8), 0 0 80px rgba(255,214,0,0.3)",
            "0 0 10px rgba(255,214,0,0.3)",
          ],
          duration: 1500,
          loop: true,
          ease: "inOutSine",
        });
        break;
      }
      case "epic": {
        animate(el, {
          scale: [
            { to: 0, duration: 0 },
            { to: 1.3, duration: 350, ease: "outBack" },
            { to: 1, duration: 200, ease: "outQuad" },
          ],
          opacity: [
            { to: 0, duration: 0 },
            { to: 1, duration: 200 },
          ],
          duration: 550,
        });
        animate(el, {
          filter: [
            "hue-rotate(0deg) brightness(1)",
            "hue-rotate(180deg) brightness(1.5)",
            "hue-rotate(360deg) brightness(1)",
          ],
          duration: 2000,
          loop: true,
          ease: "linear",
        });
        animate(el, {
          boxShadow: [
            "0 0 10px rgba(124,77,255,0.3)",
            "0 0 30px rgba(124,77,255,0.7), 0 0 60px rgba(124,77,255,0.3)",
            "0 0 10px rgba(124,77,255,0.3)",
          ],
          duration: 1500,
          loop: true,
          ease: "inOutSine",
        });
        break;
      }
      case "rare": {
        const tl = createTimeline();
        tl.add(el, {
          scale: [
            { to: 0, duration: 0 },
            { to: 1.3, duration: 300, ease: "outBack" },
            { to: 1, duration: 200, ease: "outQuad" },
          ],
          opacity: [
            { to: 0, duration: 0 },
            { to: 1, duration: 200 },
          ],
        });
        tl.add(
          el,
          {
            translateX: [
              { to: 0, duration: 0 },
              { to: -8, duration: 50 },
              { to: 8, duration: 50 },
              { to: -8, duration: 50 },
              { to: 8, duration: 50 },
              { to: 0, duration: 50 },
            ],
          },
          "-=100"
        );
        animate(el, {
          boxShadow: [
            "0 0 5px rgba(0,229,255,0.2)",
            "0 0 25px rgba(0,229,255,0.6), 0 0 50px rgba(0,229,255,0.2)",
            "0 0 5px rgba(0,229,255,0.2)",
          ],
          duration: 1500,
          loop: true,
          ease: "inOutSine",
        });
        break;
      }
      case "uncommon": {
        const tl = createTimeline();
        tl.add(el, {
          scale: [
            { to: 0, duration: 0 },
            { to: 1.2, duration: 300, ease: "outBack" },
            { to: 1, duration: 200, ease: "outQuad" },
          ],
          opacity: [
            { to: 0, duration: 0 },
            { to: 1, duration: 200 },
          ],
        });
        tl.add(el, {
          rotateY: [0, 360],
          duration: 800,
          ease: "outQuad",
        });
        animate(el, {
          boxShadow: [
            "0 0 5px rgba(74,222,128,0.2)",
            "0 0 20px rgba(74,222,128,0.5)",
            "0 0 5px rgba(74,222,128,0.2)",
          ],
          duration: 1500,
          loop: true,
          ease: "inOutSine",
        });
        break;
      }
      default: {
        animate(el, {
          scale: [
            { to: 0, duration: 0 },
            { to: 1.2, duration: 250, ease: "outBack" },
            { to: 1, duration: 150, ease: "outQuad" },
          ],
          opacity: [
            { to: 0, duration: 0 },
            { to: 1, duration: 200 },
          ],
          duration: 400,
        });
        break;
      }
    }
  }, []);

  const triggerBonusIconAnimation = useCallback(() => {
    const el = bonusIconRef.current;
    if (!el) return;
    animate(el, {
      scale: [
        { to: 0, duration: 0 },
        { to: 1.3, duration: 300, ease: "outBack" },
        { to: 1, duration: 200, ease: "outQuad" },
      ],
      opacity: [
        { to: 0, duration: 0 },
        { to: 1, duration: 200 },
      ],
      duration: 500,
    });
  }, []);

  useEffect(() => {
    if (showForm && !formMounted) {
      setFormMounted(true);
    }
  }, [showForm, formMounted]);

  useLayoutEffect(() => {
    if (!formMounted) return;
    if (!formRef.current) return;

    if (showForm) {
      animate(formRef.current, {
        opacity: [0, 1],
        translateY: [-15, 0],
        duration: 300,
        ease: "outQuad",
      });
    } else {
      animate(formRef.current, {
        opacity: [1, 0],
        translateY: [0, -15],
        duration: 250,
        ease: "inQuad",
        onComplete: () => setFormMounted(false),
      });
    }
  }, [formMounted, showForm]);

  useLayoutEffect(() => {
    if (!rootRef.current) return;
    const cards = rootRef.current.querySelectorAll(".task-card");
    if (cards.length === 0) return;

    animate(cards, {
      opacity: [0, 1],
      translateX: [-20, 0],
      delay: stagger(30),
      duration: 400,
      ease: "outExpo",
    });
  }, [tasksKey]);

  useEffect(() => {
    if (!isEmpty) return;

    if (emptyStateRef.current) {
      animate(emptyStateRef.current, {
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 400,
        ease: "outExpo",
      });
    }

    let floatAnim: ReturnType<typeof animate> | null = null;
    if (emptyIconRef.current) {
      floatAnim = animate(emptyIconRef.current, {
        translateY: [0, -10, 0],
        duration: 3000,
        loop: true,
        ease: "inOutSine",
      });
    }

    return () => {
      floatAnim?.revert?.();
    };
  }, [isEmpty]);

  useEffect(() => {
    if (gachaModal) {
      setGachaMounted(true);
    }
  }, [gachaModal]);

  useLayoutEffect(() => {
    if (!gachaMounted || !gachaModal) return;

    if (gachaOverlayRef.current) {
      animate(gachaOverlayRef.current, {
        opacity: [0, 1],
        duration: 300,
        ease: "outQuad",
      });
    }

    if (gachaCardRef.current) {
      animate(gachaCardRef.current, {
        scale: [0, 1],
        rotate: [-10, 0],
        duration: 600,
        ease: "outBack",
      });
    }

    triggerGachaIconAnimation(gachaModal.tier);
  }, [gachaMounted, gachaModal, triggerGachaIconAnimation]);

  const closeGachaModal = useCallback(() => {
    if (gachaOverlayRef.current) {
      animate(gachaOverlayRef.current, {
        opacity: [1, 0],
        duration: 250,
        ease: "inQuad",
      });
    }
    if (gachaCardRef.current) {
      animate(gachaCardRef.current, {
        scale: [1, 0],
        rotate: [0, 10],
        duration: 300,
        ease: "inBack",
        onComplete: () => {
          setGachaModal(null);
          setGachaMounted(false);
        },
      });
    } else {
      setGachaModal(null);
      setGachaMounted(false);
    }
  }, []);

  useEffect(() => {
    if (bonusModal) {
      setBonusMounted(true);
    }
  }, [bonusModal]);

  useLayoutEffect(() => {
    if (!bonusMounted || !bonusModal) return;

    if (bonusOverlayRef.current) {
      animate(bonusOverlayRef.current, {
        opacity: [0, 1],
        duration: 300,
        ease: "outQuad",
      });
    }

    if (bonusCardRef.current) {
      animate(bonusCardRef.current, {
        scale: [0, 1],
        duration: 500,
        ease: "outBack",
      });
    }

    triggerBonusIconAnimation();
  }, [bonusMounted, bonusModal, triggerBonusIconAnimation]);

  const closeBonusModal = useCallback(() => {
    if (bonusOverlayRef.current) {
      animate(bonusOverlayRef.current, {
        opacity: [1, 0],
        duration: 250,
        ease: "inQuad",
      });
    }
    if (bonusCardRef.current) {
      animate(bonusCardRef.current, {
        scale: [1, 0],
        duration: 300,
        ease: "inBack",
        onComplete: () => {
          setBonusModal(null);
          setBonusMounted(false);
        },
      });
    } else {
      setBonusModal(null);
      setBonusMounted(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="bg-[#0d0d1a] min-h-screen px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="card-anime animate-pulse h-16 rounded-xl bg-[#1a1a2e]" />
          <div className="card-anime animate-pulse h-60 rounded-xl bg-[#1a1a2e]" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card-anime animate-pulse h-32 rounded-xl bg-[#1a1a2e]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="bg-[#0d0d1a] min-h-screen px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black uppercase tracking-[0.15em] text-white">
            <span className="text-cyan-400 inline-flex items-center"><KatanaIcon size={20} className="text-cyan-400" /></span> Mission Control
          </h1>
          <button
            onClick={() => setShowForm((p) => !p)}
            className="btn-anime btn-primary text-xs"
          >
            {showForm ? "✕ CLOSE" : "NEW MISSION"}
          </button>
        </div>

        {formMounted && (
          <div ref={formRef} className="overflow-hidden" style={{ opacity: 0 }}>
            <form
              onSubmit={handleCreateTask}
              className="card-anime space-y-4 rounded-xl p-6 border border-cyan-500/20"
            >
              <h2 className="text-sm font-black uppercase tracking-widest text-cyan-400">
                New Mission
              </h2>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Mission designation..."
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Intel details..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as PlantCategory)}
                  >
                    {PLANT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_CONFIG[cat].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                  >
                    {TASK_PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {PRIORITY_CONFIG[p].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormReminder((p) => !p)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      formReminder ? "bg-cyan-500 shadow-[0_0_10px_rgba(0,229,255,0.4)]" : "bg-gray-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        formReminder ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Reminder
                  </span>
                </div>
                {formReminder && (
                  <div className="flex items-center gap-3 pl-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Remind every
                    </span>
                    <select
                      value={formReminderInterval}
                      onChange={(e) => setFormReminderInterval(Number(e.target.value))}
                      className="bg-[#0d0d1a] border border-cyan-900/40 text-sm px-3 py-1.5"
                    >
                      <option value={5}>5 minutes</option>
                      <option value={10}>10 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={360}>6 hours</option>
                      <option value={720}>12 hours</option>
                      <option value={1440}>24 hours</option>
                    </select>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-anime btn-primary w-full disabled:opacity-50"
              >
                {submitting ? "DEPLOYING..." : "DEPLOY MISSION"}
              </button>
            </form>
          </div>
        )}

        <div className="glass rounded-xl p-4 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH MISSIONS..."
              className="flex-1 bg-[#0d0d1a] border border-cyan-900/40"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#0d0d1a] border border-cyan-900/40 sm:w-36"
            >
              <option value="all">ALL CATS</option>
              {PLANT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_CONFIG[cat].label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0d0d1a] border border-cyan-900/40 sm:w-28"
            >
              <option value="all">ALL STATUS</option>
              <option value="active">ACTIVE</option>
              <option value="completed">DONE</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#0d0d1a] border border-cyan-900/40 sm:w-28"
            >
              <option value="all">ALL PRI</option>
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_CONFIG[p].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isEmpty ? (
          <div
            ref={emptyStateRef}
            className="card-anime flex flex-col items-center justify-center rounded-xl p-16 text-center"
            style={{ opacity: 0 }}
          >
            <span ref={emptyIconRef} className="mb-4 inline-block">
              <KatanaIcon size={64} className="text-cyan-400" />
            </span>
            <h3 className="text-lg font-black uppercase tracking-wider text-gray-300">
              No Missions Yet
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {tasks.length === 0
                ? "Deploy your first mission to begin the fight."
                : "Adjust your filters."}
            </p>
            {tasks.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-anime btn-primary mt-6"
              >
                DEPLOY MISSION
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedTasks.map((task) => {
              const catConfig = CATEGORY_CONFIG[task.category];
              const priConfig = PRIORITY_CONFIG[task.priority];
              const isOverdue = !task.completed && new Date(task.dueDate) < new Date();
              const isEditing = editingTaskId === task.id;

              return (
                <div
                  key={task.id}
                  data-task-id={task.id}
                  className={`task-card card-anime rounded-xl p-4 ${
                    task.completed
                      ? "border-l-4 border-l-yellow-500 bg-yellow-950/10"
                      : isOverdue
                      ? "border-l-4 border-l-red-500 bg-red-950/10"
                      : ""
                  } ${task.gachaTier ? `tier-${task.gachaTier}` : ""}`}
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-[#0d0d1a]"
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={2}
                        className="bg-[#0d0d1a]"
                      />
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value as PlantCategory)}
                          className="bg-[#0d0d1a]"
                        >
                          {PLANT_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {CATEGORY_CONFIG[cat].label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                          className="bg-[#0d0d1a]"
                        >
                          {TASK_PRIORITIES.map((p) => (
                            <option key={p} value={p}>
                              {PRIORITY_CONFIG[p].label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                          className="bg-[#0d0d1a]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSave(task.id)}
                          className="btn-anime btn-primary text-xs"
                        >
                          SAVE
                        </button>
                        <button
                          onClick={() => setEditingTaskId(null)}
                          className="btn-anime btn-outline text-xs"
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleComplete(task)}
                        className={`mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${
                          task.completed
                            ? "border-cyan-400 bg-cyan-400 text-[#0d0d1a] shadow-[0_0_10px_rgba(0,229,255,0.4)]"
                            : "border-gray-700 hover:border-cyan-500 hover:bg-cyan-950/30"
                        }`}
                      >
                        {task.completed && (
                          <span className="text-xs font-black">✓</span>
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`font-bold text-white ${
                              task.completed ? "line-through opacity-40" : ""
                            }`}
                          >
                            {task.title}
                          </h3>
                          {task.gachaTier && (
                            <span className="flex items-center gap-1">
                              <span className={`inline-block h-2 w-2 rounded-full ${TIER_DOT[task.gachaTier] ?? "bg-gray-600"}`} />
                              <span className="text-[10px] font-bold uppercase text-gray-500">
                                {TIER_LABEL[task.gachaTier]} {task.gachaMultiplier}x
                              </span>
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                            {task.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[task.category] ?? "text-gray-500"}`}>
                            <span className="inline-flex items-center gap-1">{getCategoryIcon(task.category, { size: 14, className: CATEGORY_COLORS[task.category] ?? "text-gray-500" })} {catConfig.label}</span>
                          </span>
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${PRIORITY_COLORS[task.priority] ?? "text-gray-500"}`}>
                            {priConfig.label}
                          </span>
                          {task.dueDate && (
                            <span
                              className={`text-[11px] font-bold ${
                                isOverdue ? "text-red-400" : "text-gray-600"
                              }`}
                            >
                              {isOverdue ? "OVERDUE — " : ""}{new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 gap-1">
                        <button
                          onClick={() => startEdit(task)}
                          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="rounded-lg p-1.5 text-red-500/60 transition-colors hover:bg-red-950/30 hover:text-red-400"
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {hasMore && paginatedTasks.length < filteredTasks.length && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="btn-anime btn-outline text-xs"
            >
              LOAD MORE ({filteredTasks.length - paginatedTasks.length} REMAINING)
            </button>
          </div>
        )}

        {gachaMounted && gachaModal && (
          <div
            ref={gachaOverlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            style={{ opacity: 0 }}
            onClick={closeGachaModal}
          >
            <div
              ref={gachaCardRef}
              onClick={(e) => e.stopPropagation()}
              className={`card-anime mx-4 max-w-sm rounded-xl p-8 text-center border ${getGachaGlow(gachaModal.tier)}`}
              style={{ transform: "scale(0)" }}
            >
              <div ref={gachaIconRef} className="inline-flex items-center justify-center" style={{ opacity: 0 }}>
                <KatanaIcon size={80} className={getGachaTextColor(gachaModal.tier)} />
              </div>
              <h2 className={`mt-4 text-2xl font-black uppercase tracking-wider ${getGachaTextColor(gachaModal.tier)}`}>
                {TIER_LABEL[gachaModal.tier] ?? gachaModal.tier}!
              </h2>
              <p className="mt-2 text-lg font-black text-gray-300">
                {gachaModal.multiplier}x XP MULTIPLIER
              </p>
              <div className="mt-3 inline-block rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-4 py-2 text-sm font-black text-cyan-400">
                +{gachaModal.xp} XP EARNED
              </div>
              <button
                onClick={closeGachaModal}
                className="btn-anime btn-primary mt-6 w-full"
              >
                ACCEPT
              </button>
            </div>
          </div>
        )}

        {bonusMounted && bonusModal && (
          <div
            ref={bonusOverlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            style={{ opacity: 0 }}
            onClick={closeBonusModal}
          >
            <div
              ref={bonusCardRef}
              onClick={(e) => e.stopPropagation()}
              className="card-anime mx-4 max-w-sm rounded-xl p-8 text-center border border-yellow-500/30 shadow-[0_0_30px_rgba(255,214,0,0.2)]"
              style={{ transform: "scale(0)" }}
            >
              <div ref={bonusIconRef} className="inline-flex items-center justify-center" style={{ opacity: 0 }}>
                {bonusModal.type === "gems" ? <GemIcon size={80} className="text-cyan-400" /> : <GiftIcon size={80} className="text-yellow-400" />}
              </div>
              <h2 className="mt-4 text-xl font-black uppercase tracking-wider text-yellow-400">
                Bonus Drop!
              </h2>
              {bonusModal.type === "gems" && (
                <p className="mt-2 text-lg font-black text-cyan-400">
                  +{bonusModal.gemAmount} GEMS
                </p>
              )}
              {bonusModal.type === "item" && bonusModal.tier && (
                <p className="mt-2 text-lg font-black text-purple-400">
                  {TIER_LABEL[bonusModal.tier]}{" "}
                  {bonusModal.itemType ?? "Item"}!
                </p>
              )}
              <button
                onClick={closeBonusModal}
                className="btn-anime btn-primary mt-6 w-full"
              >
                ACCEPT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
