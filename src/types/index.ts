export type GachaTier = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface GachaResult {
  tier: GachaTier;
  multiplier: number;
}

export interface BonusDropResult {
  type: "gems" | "item" | "nothing";
  tier?: GachaTier;
  gemAmount?: number;
  itemType?: "avatar" | "card" | "equipment";
}

export type PlantCategory = "work" | "personal" | "health" | "study" | "creative" | "social" | "fitness";
export type TaskPriority = "low" | "medium" | "high";
export type GrowthStage = "seed" | "sprout" | "budding" | "blooming" | "withered";
export type EquipSlot = "head" | "face" | "body" | "aura";
export type ItemType = "avatar" | "card" | "equipment";
export type ItemTier = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";
export type UserRole = "user" | "admin";
