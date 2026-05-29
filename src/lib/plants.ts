export const PLANT_CATEGORIES = [
  "work",
  "personal",
  "health",
  "study",
  "creative",
  "social",
  "fitness",
] as const;

export type PlantCategory = (typeof PLANT_CATEGORIES)[number];

export const CATEGORY_CONFIG: Record<
  PlantCategory,
  { label: string; emoji: string; icon: string; color: string }
> = {
  work: { label: "Work", emoji: "", icon: "work", color: "text-amber-400" },
  personal: { label: "Personal", emoji: "", icon: "personal", color: "text-pink-400" },
  health: { label: "Health", emoji: "", icon: "health", color: "text-green-400" },
  study: { label: "Study", emoji: "", icon: "study", color: "text-purple-400" },
  creative: { label: "Creative", emoji: "", icon: "creative", color: "text-rose-400" },
  social: { label: "Social", emoji: "", icon: "social", color: "text-yellow-400" },
  fitness: { label: "Fitness", emoji: "", icon: "fitness", color: "text-emerald-400" },
};

export const GROWTH_STAGES = ["seed", "sprout", "budding", "blooming", "withered"] as const;
export type GrowthStage = (typeof GROWTH_STAGES)[number];

export const STAGE_EMOJI: Record<GrowthStage, string> = {
  seed: "",
  sprout: "",
  budding: "",
  blooming: "",
  withered: "",
};

export const STAGE_ICON: Record<GrowthStage, string> = {
  seed: "seed",
  sprout: "sprout",
  budding: "flame",
  blooming: "star",
  withered: "skull",
};

export function getTaskGrowthStage(
  task: { completed: boolean; dueDate: Date; createdAt: Date }
): GrowthStage {
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

export const GARDEN_THEMES: Record<
  string,
  { name: string; bg: string; ground: string; unlockLevel: number }
> = {
  basic: { name: "Meadow", bg: "bg-gradient-to-b from-sky-100 to-green-100", ground: "bg-green-300", unlockLevel: 1 },
  sakura: { name: "Sakura", bg: "bg-gradient-to-b from-pink-50 to-pink-100", ground: "bg-pink-200", unlockLevel: 3 },
  ocean: { name: "Ocean", bg: "bg-gradient-to-b from-blue-50 to-cyan-100", ground: "bg-cyan-200", unlockLevel: 5 },
  sunset: { name: "Sunset", bg: "bg-gradient-to-b from-orange-50 to-amber-100", ground: "bg-amber-200", unlockLevel: 7 },
  cosmic: { name: "Cosmic", bg: "bg-gradient-to-b from-violet-50 to-purple-100", ground: "bg-purple-200", unlockLevel: 10 },
};

export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; baseXP: number }> = {
  low: { label: "Low", color: "bg-slate-100 text-slate-700 border-slate-200", baseXP: 10 },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700 border-blue-200", baseXP: 15 },
  high: { label: "High", color: "bg-red-100 text-red-700 border-red-200", baseXP: 25 },
};
