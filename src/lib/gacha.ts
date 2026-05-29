export type GachaTier = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface GachaResult {
  tier: GachaTier;
  multiplier: number;
}

const BASE_RATES: Record<GachaTier, number> = {
  common: 0.40,
  uncommon: 0.30,
  rare: 0.20,
  epic: 0.08,
  legendary: 0.02,
};

const MULTIPLIERS: Record<GachaTier, number> = {
  common: 1,
  uncommon: 1.5,
  rare: 3,
  epic: 5,
  legendary: 10,
};

function applyLuck(rates: Record<GachaTier, number>, luck: number): Record<GachaTier, number> {
  if (luck <= 0) return { ...rates };
  const clampedLuck = Math.min(luck, 100);
  const shift = clampedLuck / 100;
  const adjusted = { ...rates };
  adjusted.common -= 0.30 * shift;
  adjusted.uncommon -= 0.15 * shift;
  adjusted.rare += 0.10 * shift;
  adjusted.epic += 0.20 * shift;
  adjusted.legendary += 0.15 * shift;
  return adjusted;
}

function weightedRandom(rates: Record<GachaTier, number>): GachaTier {
  const rand = Math.random();
  let cumulative = 0;
  const tiers: GachaTier[] = ["common", "uncommon", "rare", "epic", "legendary"];
  for (const tier of tiers) {
    cumulative += rates[tier];
    if (rand <= cumulative) return tier;
  }
  return "common";
}

export function rollGacha(
  luck: number = 0,
  pity: number = 0
): GachaResult {
  let forcedMinTier: GachaTier | null = null;
  if (pity >= 20) forcedMinTier = "epic";
  else if (pity >= 10) forcedMinTier = "rare";

  const rates = applyLuck(BASE_RATES, luck);
  const tier = forcedMinTier
    ? rollWithGuarantee(rates, forcedMinTier)
    : weightedRandom(rates);

  return { tier, multiplier: MULTIPLIERS[tier] };
}

function rollWithGuarantee(
  rates: Record<GachaTier, number>,
  minTier: GachaTier
): GachaTier {
  const tiers: GachaTier[] = ["common", "uncommon", "rare", "epic", "legendary"];
  const minIndex = tiers.indexOf(minTier);
  const eligibleTiers = tiers.slice(minIndex);
  const eligibleRates: Record<string, number> = {};
  let total = 0;
  for (const t of eligibleTiers) {
    eligibleRates[t] = rates[t];
    total += rates[t];
  }
  const rand = Math.random() * total;
  let cumulative = 0;
  for (const t of eligibleTiers) {
    cumulative += eligibleRates[t];
    if (rand <= cumulative) return t;
  }
  return eligibleTiers[eligibleTiers.length - 1];
}

export function isRareOrBetter(tier: GachaTier): boolean {
  return ["rare", "epic", "legendary"].includes(tier);
}

export type BonusDropType = "gems" | "item" | "nothing";

export interface BonusDropResult {
  type: BonusDropType;
  tier?: GachaTier;
  gemAmount?: number;
  itemType?: "avatar" | "card" | "equipment";
}

export function rollBonusDrop(
  luck: number = 0,
  dropPity: number = 0
): BonusDropResult {
  let forcedMinTier: GachaTier | null = null;
  if (dropPity >= 20) forcedMinTier = "epic";
  else if (dropPity >= 10) forcedMinTier = "rare";

  const luckBonus = Math.min(luck, 100) / 500;

  const baseDropRates = {
    nothing: 0.8989 - luckBonus,
    gems: 0.05 + luckBonus * 0.5,
    common: 0.03 + luckBonus * 0.2,
    uncommon: 0.015 + luckBonus * 0.15,
    rare: 0.005 + luckBonus * 0.1,
    epic: 0.001 + luckBonus * 0.05,
    legendary: 0.0001,
  };

  const rand = Math.random();
  let cumulative = 0;

  if (rand < (cumulative += baseDropRates.nothing)) {
    return { type: "nothing" };
  }
  if (rand < (cumulative += baseDropRates.gems)) {
    return { type: "gems", gemAmount: Math.floor(Math.random() * 3) + 1 };
  }

  const itemTiers: GachaTier[] = ["common", "uncommon", "rare", "epic", "legendary"];
  let itemTier: GachaTier = "common";

  if (forcedMinTier) {
    itemTier = forcedMinTier;
  } else {
    const itemRand = Math.random();
    if (itemRand < baseDropRates.legendary) itemTier = "legendary";
    else if (itemRand < baseDropRates.epic) itemTier = "epic";
    else if (itemRand < baseDropRates.rare) itemTier = "rare";
    else if (itemRand < baseDropRates.uncommon) itemTier = "uncommon";
    else itemTier = "common";
  }

  const itemTypes: Array<"avatar" | "card" | "equipment"> = ["avatar", "card", "equipment"];
  const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];

  return { type: "item", tier: itemTier, itemType };
}
