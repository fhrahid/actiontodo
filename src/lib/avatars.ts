export interface AvatarDefinition {
  id: string;
  name: string;
  emoji: string;
  tier: string;
  bodyColor: string;
  hairColor: string;
  skinColor: string;
  accessory?: string;
}

export const AVATARS: AvatarDefinition[] = [
  { id: "avatar_student", name: "Student", emoji: "😊", tier: "common", bodyColor: "#3B82F6", hairColor: "#1F2937", skinColor: "#FCD5B0" },
  { id: "avatar_worker", name: "Office Worker", emoji: "💼", tier: "common", bodyColor: "#6B7280", hairColor: "#4B3621", skinColor: "#F5D0A9" },
  { id: "avatar_casual", name: "Casual", emoji: "😎", tier: "common", bodyColor: "#10B981", hairColor: "#92400E", skinColor: "#FDE68A" },
  { id: "avatar_sporty", name: "Sporty", emoji: "🏃", tier: "common", bodyColor: "#EF4444", hairColor: "#1F2937", skinColor: "#FBBF24" },
  { id: "avatar_mage", name: "Mage", emoji: "🧙", tier: "uncommon", bodyColor: "#7C3AED", hairColor: "#4C1D95", skinColor: "#FCD5B0" },
  { id: "avatar_knight", name: "Knight", emoji: "⚔️", tier: "uncommon", bodyColor: "#6B7280", hairColor: "#D4A574", skinColor: "#F5D0A9" },
  { id: "avatar_ninja", name: "Ninja", emoji: "🥷", tier: "uncommon", bodyColor: "#1F2937", hairColor: "#111827", skinColor: "#FCD5B0" },
  { id: "avatar_celestial", name: "Celestial Guardian", emoji: "✨", tier: "rare", bodyColor: "#F59E0B", hairColor: "#FDE68A", skinColor: "#FEF3C7" },
  { id: "avatar_forest", name: "Forest Spirit", emoji: "🍃", tier: "rare", bodyColor: "#059669", hairColor: "#065F46", skinColor: "#D1FAE5" },
  { id: "avatar_crystal", name: "Crystal Mage", emoji: "💎", tier: "epic", bodyColor: "#8B5CF6", hairColor: "#C4B5FD", skinColor: "#EDE9FE" },
  { id: "avatar_shadow", name: "Shadow Warrior", emoji: "🌑", tier: "epic", bodyColor: "#1E1B4B", hairColor: "#312E81", skinColor: "#A5B4FC" },
  { id: "avatar_dragon", name: "Dragon Tamer", emoji: "🐉", tier: "legendary", bodyColor: "#DC2626", hairColor: "#991B1B", skinColor: "#FECACA" },
  { id: "avatar_emperor", name: "Celestial Emperor", emoji: "👑", tier: "mythic", bodyColor: "#F59E0B", hairColor: "#FFD700", skinColor: "#FFFBEB" },
];

export function getAvatarById(id: string): AvatarDefinition | undefined {
  return AVATARS.find((a) => a.id === id);
}

export function renderAvatarSVG(avatar: AvatarDefinition, size: number = 80): string {
  const r = size / 2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${r}" cy="${r}" r="${r - 2}" fill="${avatar.skinColor}" stroke="${avatar.bodyColor}" stroke-width="2"/>
    <circle cx="${r * 0.65}" cy="${r * 0.75}" r="${r * 0.08}" fill="#1F2937"/>
    <circle cx="${r * 1.35}" cy="${r * 0.75}" r="${r * 0.08}" fill="#1F2937"/>
    <path d="M ${r * 0.7} ${r * 1.2} Q ${r} ${r * 1.45} ${r * 1.3} ${r * 1.2}" fill="none" stroke="#1F2937" stroke-width="1.5" stroke-linecap="round"/>
    <ellipse cx="${r}" cy="${r * 0.35}" rx="${r * 0.6}" ry="${r * 0.35}" fill="${avatar.hairColor}"/>
    <rect x="${r * 0.2}" y="${r * 1.5}" width="${size * 0.6}" height="${r * 0.6}" rx="4" fill="${avatar.bodyColor}"/>
    <text x="${r}" y="${size - 2}" text-anchor="middle" font-size="${r * 0.4}">${avatar.emoji}</text>
  </svg>`;
}
