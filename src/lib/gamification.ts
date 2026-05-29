export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function xpForNextLevel(xp: number): { current: number; needed: number; progress: number } {
  const level = calculateLevel(xp);
  const currentLevelXp = (level - 1) * 100;
  const xpInLevel = xp - currentLevelXp;
  return { current: xpInLevel, needed: 100, progress: (xpInLevel / 100) * 100 };
}

export const TITLES: Record<number, string> = {
  1: "Seedling",
  2: "Sprout",
  3: "Gardener",
  4: "Botanist",
  5: "Flower Keeper",
  6: "Nature Adept",
  7: "Bloom Master",
  8: "Garden Sage",
  9: "Floral Mystic",
  10: "Celestial Gardener",
};

export function getTitle(level: number): string {
  if (level >= 10) return "Celestial Gardener";
  return TITLES[level] || "Seedling";
}

export function calculateStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;
  const sorted = [...completedDates]
    .map((d) => new Date(d).toISOString().split("T")[0])
    .sort()
    .reverse();
  const uniqueDays = [...new Set(sorted)];
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (Math.abs(diff - 1) < 0.5) streak++;
    else break;
  }
  return streak;
}
