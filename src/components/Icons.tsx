import React from "react";

type IconProps = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

const defaults = { size: 24, className: "", style: {} };

function svg(size: number, className: string, style: React.CSSProperties, children: React.ReactNode) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ ...style, flexShrink: 0 }}
    >
      {children}
    </svg>
  );
}

export function KatanaIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" strokeWidth={2.5} />
    <line x1="18" y1="2" x2="22" y2="6" stroke="currentColor" strokeWidth={1.5} />
    <path d="M4 20 L2 22" stroke="currentColor" strokeWidth={2} />
    <path d="M3 17 Q5 19 3 21" stroke="currentColor" strokeWidth={1} opacity={0.5} />
  </>);
}

export function ShieldIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M12 2 L4 6 L4 12 C4 17 8 21 12 22 C16 21 20 17 20 12 L20 6 Z" strokeWidth={1.8} />
    <path d="M12 7 L12 13" strokeWidth={2} />
    <path d="M9 10 L15 10" strokeWidth={2} />
  </>);
}

export function GemIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <polygon points="12,1 22,9 18,22 6,22 2,9" strokeWidth={1.8} />
    <polyline points="2,9 8,9 12,1 16,9 22,9" strokeWidth={1.2} opacity={0.6} />
    <line x1="8" y1="9" x2="12" y2="22" strokeWidth={1} opacity={0.4} />
    <line x1="16" y1="9" x2="12" y2="22" strokeWidth={1} opacity={0.4} />
  </>);
}

export function FlameIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M12 22 C7 22 4 18 4 14 C4 9 8 5 12 2 C16 5 20 9 20 14 C20 18 17 22 12 22 Z" strokeWidth={1.8} />
    <path d="M12 22 C9.5 22 8 19.5 8 17 C8 13 10 10 12 8 C14 10 16 13 16 17 C16 19.5 14.5 22 12 22 Z" strokeWidth={1.2} opacity={0.6} />
  </>);
}

export function SkullIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M12 2 C7 2 4 5.5 4 10 C4 13 5.5 15 8 16.5 L8 19 C8 20 9 21 10 21 L14 21 C15 21 16 20 16 19 L16 16.5 C18.5 15 20 13 20 10 C20 5.5 17 2 12 2 Z" strokeWidth={1.8} />
    <circle cx="9" cy="10" r="2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="10" r="2" fill="currentColor" stroke="none" />
    <line x1="10" y1="18" x2="14" y2="18" strokeWidth={1.2} opacity={0.5} />
  </>);
}

export function EyeIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M2 12 C2 12 6 5 12 5 C18 5 22 12 22 12 C22 12 18 19 12 19 C6 19 2 12 2 12 Z" strokeWidth={1.8} />
    <circle cx="12" cy="12" r="3.5" strokeWidth={1.5} />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
  </>);
}

export function DragonIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M5 19 C5 14 7 11 10 9 C9 7 9 5 11 3 L13 3 C15 5 14 7 13 9 C16 11 18 14 18 19" strokeWidth={1.8} />
    <path d="M10 19 L10 22" strokeWidth={1.5} />
    <path d="M14 19 L14 22" strokeWidth={1.5} />
    <path d="M18 15 L21 13" strokeWidth={1.2} />
    <path d="M6 15 L3 13" strokeWidth={1.2} />
    <circle cx="11" cy="6" r="0.8" fill="currentColor" stroke="none" />
  </>);
}

export function StarIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" strokeWidth={1.8} />
  </>);
}

export function CrownIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M3 18 L3 8 L7 12 L12 5 L17 12 L21 8 L21 18 Z" strokeWidth={1.8} />
    <line x1="3" y1="18" x2="21" y2="18" strokeWidth={2} />
    <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
    <circle cx="3" cy="8" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="21" cy="8" r="0.8" fill="currentColor" stroke="none" />
  </>);
}

export function MaskIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M12 3 C7 3 3 7 3 11 C3 16 7 21 12 21 C17 21 21 16 21 11 C21 7 17 3 12 3 Z" strokeWidth={1.8} />
    <path d="M8 10 L10 12 L8 14" strokeWidth={2} />
    <path d="M16 10 L14 12 L16 14" strokeWidth={2} />
    <path d="M10 16 Q12 18 14 16" strokeWidth={1.2} opacity={0.5} />
  </>);
}

export function HaloIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <ellipse cx="12" cy="6" rx="7" ry="2.5" strokeWidth={1.5} />
    <circle cx="12" cy="14" r="5" strokeWidth={1.8} />
    <circle cx="10" cy="13" r="1" fill="currentColor" stroke="none" />
    <circle cx="14" cy="13" r="1" fill="currentColor" stroke="none" />
  </>);
}

export function HornsIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <circle cx="12" cy="14" r="5" strokeWidth={1.8} />
    <path d="M8 10 C6 6 4 3 3 2" strokeWidth={2} />
    <path d="M16 10 C18 6 20 3 21 2" strokeWidth={2} />
    <circle cx="10" cy="13" r="1" fill="currentColor" stroke="none" />
    <circle cx="14" cy="13" r="1" fill="currentColor" stroke="none" />
  </>);
}

export function ThunderIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <polygon points="13,2 5,13 11,13 9,22 19,10 13,10" strokeWidth={1.8} fill="none" />
  </>);
}

export function SpiralIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M12 22 C6 22 2 18 2 12 C2 6 6 2 12 2 C18 2 22 6 22 12" strokeWidth={1.8} />
    <path d="M12 18 C8 18 6 16 6 12 C6 8 8 6 12 6 C16 6 18 8 18 12" strokeWidth={1.4} opacity={0.6} />
    <circle cx="22" cy="12" r="1.2" fill="currentColor" stroke="none" />
  </>);
}

export function WindIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M3 8 L14 8 C16 8 18 6 16 4" strokeWidth={1.8} />
    <path d="M3 12 L18 12 C20 12 22 14 20 16" strokeWidth={1.8} />
    <path d="M5 16 L14 16 C16 16 18 18 16 20" strokeWidth={1.8} />
  </>);
}

export function SmokeIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M8 22 C8 18 6 16 6 12 C6 8 9 5 12 4 C15 5 18 8 18 12 C18 16 16 18 16 22" strokeWidth={1.5} opacity={0.7} />
    <path d="M10 22 C10 19 9 17 9 14 C9 10 11 8 12 7 C13 8 15 10 15 14 C15 17 14 19 14 22" strokeWidth={1.2} opacity={0.4} />
  </>);
}

export function IceIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <line x1="12" y1="2" x2="12" y2="22" strokeWidth={1.8} />
    <line x1="2" y1="12" x2="22" y2="12" strokeWidth={1.8} />
    <line x1="5" y1="5" x2="19" y2="19" strokeWidth={1.2} opacity={0.5} />
    <line x1="19" y1="5" x2="5" y2="19" strokeWidth={1.2} opacity={0.5} />
    <circle cx="12" cy="12" r="2" strokeWidth={1} opacity={0.3} />
  </>);
}

export function CosmicIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <circle cx="12" cy="12" r="8" strokeWidth={1.2} opacity={0.4} />
    <ellipse cx="12" cy="12" rx="11" ry="4" strokeWidth={1.8} transform="rotate(-30 12 12)" />
    <circle cx="12" cy="12" r="2.5" strokeWidth={1.5} />
    <circle cx="8" cy="6" r="0.8" fill="currentColor" stroke="none" opacity={0.5} />
    <circle cx="17" cy="8" r="0.6" fill="currentColor" stroke="none" opacity={0.4} />
  </>);
}

export function BookIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M4 4 C4 4 8 3 12 5 C16 3 20 4 20 4 L20 18 C20 18 16 17 12 19 C8 17 4 18 4 18 Z" strokeWidth={1.8} />
    <line x1="12" y1="5" x2="12" y2="19" strokeWidth={1.2} opacity={0.5} />
  </>);
}

export function PaletteIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
    <circle cx="9" cy="8" r="1.5" fill="currentColor" stroke="none" opacity={0.7} />
    <circle cx="15" cy="8" r="1.5" fill="currentColor" stroke="none" opacity={0.7} />
    <circle cx="7" cy="13" r="1.5" fill="currentColor" stroke="none" opacity={0.7} />
    <circle cx="17" cy="13" r="1.5" fill="currentColor" stroke="none" opacity={0.7} />
    <circle cx="12" cy="16" r="2" strokeWidth={1.2} />
  </>);
}

export function UsersIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <circle cx="9" cy="7" r="4" strokeWidth={1.8} />
    <path d="M2 21 C2 16 5 13 9 13 C13 13 16 16 16 21" strokeWidth={1.8} />
    <circle cx="17" cy="7" r="3" strokeWidth={1.4} opacity={0.6} />
    <path d="M16 21 C16 17 18 15 21 14" strokeWidth={1.2} opacity={0.4} />
  </>);
}

export function HeartIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M12 21 C12 21 3 14 3 8 C3 5 5 3 8 3 C9.5 3 11 4 12 5 C13 4 14.5 3 16 3 C19 3 21 5 21 8 C21 14 12 21 12 21 Z" strokeWidth={1.8} />
    <line x1="8" y1="10" x2="16" y2="10" strokeWidth={1.5} opacity={0.5} />
    <line x1="12" y1="6" x2="12" y2="16" strokeWidth={1.5} opacity={0.5} />
  </>);
}

export function DumbbellIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <rect x="2" y="9" width="4" height="6" rx="1" strokeWidth={1.5} />
    <rect x="18" y="9" width="4" height="6" rx="1" strokeWidth={1.5} />
    <line x1="6" y1="12" x2="18" y2="12" strokeWidth={2} />
  </>);
}

export function TargetIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
    <circle cx="12" cy="12" r="5.5" strokeWidth={1.2} opacity={0.6} />
    <circle cx="12" cy="12" r="2" strokeWidth={1} />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" />
  </>);
}

export function WrenchIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M14.7 6.3 C14 4 15 2 17 2 L18 3 L15 6 L18 9 L21 6 L22 7 C22 9 20 10 17.7 9.3 L7 20 L4 17 Z" strokeWidth={1.8} />
  </>);
}

export function CheckIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <polyline points="4,12 10,18 20,6" strokeWidth={2.5} />
  </>);
}

export function XIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <line x1="5" y1="5" x2="19" y2="19" strokeWidth={2} />
    <line x1="19" y1="5" x2="5" y2="19" strokeWidth={2} />
  </>);
}

export function TrophyIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M8 2 L16 2 L16 8 C16 12 14 14 12 14 C10 14 8 12 8 8 Z" strokeWidth={1.8} />
    <path d="M8 4 L4 4 C4 8 6 10 8 10" strokeWidth={1.5} />
    <path d="M16 4 L20 4 C20 8 18 10 16 10" strokeWidth={1.5} />
    <line x1="12" y1="14" x2="12" y2="18" strokeWidth={1.5} />
    <rect x="7" y="18" width="10" height="3" rx="1" strokeWidth={1.5} />
  </>);
}

export function ScrollIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M5 3 C3 3 3 5 5 5 L19 5 C21 5 21 3 19 3" strokeWidth={1.5} />
    <path d="M5 21 C3 21 3 19 5 19 L19 19 C21 19 21 21 19 21" strokeWidth={1.5} />
    <rect x="5" y="5" width="14" height="14" strokeWidth={1.2} />
    <line x1="8" y1="9" x2="16" y2="9" strokeWidth={1} opacity={0.4} />
    <line x1="8" y1="12" x2="14" y2="12" strokeWidth={1} opacity={0.4} />
    <line x1="8" y1="15" x2="12" y2="15" strokeWidth={1} opacity={0.4} />
  </>);
}

export function SettingsIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <circle cx="12" cy="12" r="3" strokeWidth={1.8} />
    <path d="M12 2 L12 4 M12 20 L12 22 M2 12 L4 12 M20 12 L22 12 M4.93 4.93 L6.34 6.34 M17.66 17.66 L19.07 19.07 M4.93 19.07 L6.34 17.66 M17.66 6.34 L19.07 4.93" strokeWidth={1.5} />
  </>);
}

export function SparkleIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z" strokeWidth={1.5} />
    <path d="M19 2 L19.5 4 L21.5 4.5 L19.5 5 L19 7 L18.5 5 L16.5 4.5 L18.5 4 Z" strokeWidth={1} opacity={0.5} />
  </>);
}

export function MoonIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M21 12.79 C20.1 16.4 16.8 19 13 19 C8.6 19 5 15.4 5 11 C5 7.2 7.6 3.9 11.2 3 C10.4 4.5 10 6.2 10 8 C10 12.4 13.6 16 18 16 C19.1 16 20.1 15.8 21 15.4 Z" strokeWidth={1.8} />
  </>);
}

export function CyborgIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <rect x="5" y="4" width="14" height="16" rx="3" strokeWidth={1.8} />
    <circle cx="10" cy="11" r="2" strokeWidth={1.5} />
    <circle cx="14" cy="11" r="2" strokeWidth={1.5} />
    <line x1="10" y1="11" x2="14" y2="11" strokeWidth={1.2} opacity={0.5} />
    <line x1="5" y1="11" x2="2" y2="9" strokeWidth={1.5} />
  </>);
}

export function ClawIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M8 20 L8 10" strokeWidth={2} />
    <path d="M12 20 L12 8" strokeWidth={2} />
    <path d="M16 20 L16 10" strokeWidth={2} />
    <path d="M6 10 Q8 6 10 10" strokeWidth={1.5} />
    <path d="M10 8 Q12 3 14 8" strokeWidth={1.5} />
    <path d="M14 10 Q16 6 18 10" strokeWidth={1.5} />
  </>);
}

export function CrossIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <line x1="12" y1="3" x2="12" y2="21" strokeWidth={2} />
    <line x1="6" y1="9" x2="18" y2="9" strokeWidth={2} />
  </>);
}

export function GhostIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M4 21 L4 10 C4 5 8 2 12 2 C16 2 20 5 20 10 L20 21 L17 18 L14 21 L12 18 L10 21 L7 18 Z" strokeWidth={1.8} />
    <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="15" cy="10" r="1.5" fill="currentColor" stroke="none" />
  </>);
}

export function VisorIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M3 12 L3 10 C3 7 7 5 12 5 C17 5 21 7 21 10 L21 12" strokeWidth={1.8} />
    <rect x="3" y="10" width="18" height="6" rx="2" strokeWidth={1.5} />
    <line x1="12" y1="10" x2="12" y2="16" strokeWidth={1} opacity={0.4} />
    <circle cx="12" cy="13" r="1" fill="currentColor" stroke="none" />
  </>);
}

export function ArmorIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M6 4 L12 2 L18 4 L20 10 L18 14 L18 20 L6 20 L6 14 L4 10 Z" strokeWidth={1.8} />
    <line x1="12" y1="2" x2="12" y2="20" strokeWidth={1} opacity={0.3} />
    <line x1="6" y1="10" x2="18" y2="10" strokeWidth={1} opacity={0.3} />
  </>);
}

export function HatIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M6 14 L18 14" strokeWidth={2.5} />
    <path d="M8 14 L8 8 Q12 4 16 8 L16 14" strokeWidth={1.8} />
    <path d="M7 14 Q12 16 17 14" strokeWidth={1.2} opacity={0.5} />
  </>);
}

export function BandanaIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M4 10 Q12 6 20 10" strokeWidth={2} />
    <path d="M4 10 Q12 14 20 10" strokeWidth={2} />
    <path d="M18 10 L21 6" strokeWidth={1.5} />
    <path d="M19 11 L22 8" strokeWidth={1.2} opacity={0.5} />
  </>);
}

export function HoodIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M4 12 C4 6 8 3 12 3 C16 3 20 6 20 12" strokeWidth={1.8} />
    <path d="M3 12 L4 20 L8 16 L12 20 L16 16 L20 20 L21 12" strokeWidth={1.5} opacity={0.6} />
    <path d="M8 9 Q12 7 16 9" strokeWidth={1.2} opacity={0.4} />
  </>);
}

export function HelmetIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M5 14 C5 8 8 4 12 4 C16 4 19 8 19 14" strokeWidth={1.8} />
    <path d="M4 14 L20 14" strokeWidth={2} />
    <line x1="12" y1="4" x2="12" y2="8" strokeWidth={1.5} />
    <rect x="8" y="14" width="8" height="3" rx="1" strokeWidth={1.2} opacity={0.5} />
  </>);
}

export function GlassesIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <circle cx="7" cy="12" r="4" strokeWidth={1.8} />
    <circle cx="17" cy="12" r="4" strokeWidth={1.8} />
    <line x1="11" y1="12" x2="13" y2="12" strokeWidth={1.5} />
    <line x1="3" y1="12" x2="3" y2="10" strokeWidth={1.2} />
    <line x1="21" y1="12" x2="21" y2="10" strokeWidth={1.2} />
  </>);
}

export function SunglassesIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <rect x="2" y="9" width="8" height="5" rx="2" strokeWidth={1.8} />
    <rect x="14" y="9" width="8" height="5" rx="2" strokeWidth={1.8} />
    <line x1="10" y1="11" x2="14" y2="11" strokeWidth={1.5} />
  </>);
}

export function CapeIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M8 4 L16 4 L16 8 L20 20 L12 17 L4 20 L8 8 Z" strokeWidth={1.8} />
    <path d="M8 8 Q12 10 16 8" strokeWidth={1.2} opacity={0.4} />
  </>);
}

export function ChainIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <ellipse cx="8" cy="8" rx="3" ry="4" strokeWidth={1.5} transform="rotate(-30 8 8)" />
    <ellipse cx="14" cy="12" rx="3" ry="4" strokeWidth={1.5} transform="rotate(30 14 12)" />
    <ellipse cx="8" cy="18" rx="3" ry="4" strokeWidth={1.5} transform="rotate(-30 8 18)" />
  </>);
}

export function WarningIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M12 2 L22 20 L2 20 Z" strokeWidth={1.8} />
    <line x1="12" y1="9" x2="12" y2="14" strokeWidth={2} />
    <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
  </>);
}

export function GavelIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <rect x="10" y="2" width="6" height="10" rx="1" strokeWidth={1.5} transform="rotate(-30 13 7)" />
    <line x1="8" y1="12" x2="5" y2="18" strokeWidth={2} />
    <line x1="2" y1="20" x2="18" y2="20" strokeWidth={1.5} />
  </>);
}

export function CalendarIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={1.8} />
    <line x1="3" y1="10" x2="21" y2="10" strokeWidth={1.5} />
    <line x1="8" y1="2" x2="8" y2="6" strokeWidth={1.5} />
    <line x1="16" y1="2" x2="16" y2="6" strokeWidth={1.5} />
  </>);
}

export function DiceIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth={1.8} />
    <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="16" cy="8" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="8" cy="16" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none" />
  </>);
}

export function SearchIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <circle cx="11" cy="11" r="7" strokeWidth={1.8} />
    <line x1="16" y1="16" x2="21" y2="21" strokeWidth={2} />
  </>);
}

export function StreakIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <path d="M12 2 C10 6 6 8 6 13 C6 17 9 20 12 20 C15 20 18 17 18 13 C18 8 14 6 12 2 Z" strokeWidth={1.8} />
    <path d="M12 20 C10.5 20 10 18.5 10 17 C10 14 11 12 12 10 C13 12 14 14 14 17 C14 18.5 13.5 20 12 20 Z" strokeWidth={1.2} opacity={0.6} />
  </>);
}

export function SeedIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <ellipse cx="12" cy="16" rx="4" ry="2.5" strokeWidth={1.5} />
    <path d="M12 13.5 L12 8" strokeWidth={1.8} />
    <path d="M10 10 Q12 6 14 10" strokeWidth={1.5} opacity={0.6} />
  </>);
}

export function SproutIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <line x1="12" y1="22" x2="12" y2="10" strokeWidth={1.8} />
    <path d="M12 16 Q6 14 6 10 Q8 8 12 10" strokeWidth={1.5} />
    <path d="M12 13 Q18 11 18 7 Q16 5 12 7" strokeWidth={1.5} />
  </>);
}

export function BladeIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <line x1="6" y1="20" x2="18" y2="4" strokeWidth={2.2} />
    <line x1="16" y1="2" x2="20" y2="6" strokeWidth={1.5} />
    <path d="M6 20 Q4 21 3 22" strokeWidth={1.8} />
    <line x1="8" y1="16" x2="6" y2="18" strokeWidth={1} opacity={0.3} />
  </>);
}

export function CloverIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <circle cx="12" cy="7" r="3" strokeWidth={1.5} />
    <circle cx="7" cy="13" r="3" strokeWidth={1.5} />
    <circle cx="17" cy="13" r="3" strokeWidth={1.5} />
    <line x1="12" y1="15" x2="12" y2="22" strokeWidth={1.8} />
  </>);
}

export function RosetteIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <circle cx="12" cy="12" r="4" strokeWidth={1.5} />
    <path d="M12 2 L13 6 L17 3 L16 7 L20 8 L17 11 L20 14 L16 14 L17 18 L13 16 L12 20 L11 16 L7 18 L8 14 L4 14 L7 11 L4 8 L8 7 L7 3 L11 6 Z" strokeWidth={1.2} opacity={0.5} />
  </>);
}

export function SunIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <circle cx="12" cy="12" r="4" strokeWidth={1.8} />
    <line x1="12" y1="2" x2="12" y2="5" strokeWidth={1.5} />
    <line x1="12" y1="19" x2="12" y2="22" strokeWidth={1.5} />
    <line x1="2" y1="12" x2="5" y2="12" strokeWidth={1.5} />
    <line x1="19" y1="12" x2="22" y2="12" strokeWidth={1.5} />
    <line x1="5.6" y1="5.6" x2="7.8" y2="7.8" strokeWidth={1.2} />
    <line x1="16.2" y1="16.2" x2="18.4" y2="18.4" strokeWidth={1.2} />
    <line x1="5.6" y1="18.4" x2="7.8" y2="16.2" strokeWidth={1.2} />
    <line x1="16.2" y1="7.8" x2="18.4" y2="5.6" strokeWidth={1.2} />
  </>);
}

export function ChartIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <line x1="3" y1="20" x2="21" y2="20" strokeWidth={1.5} />
    <line x1="3" y1="20" x2="3" y2="4" strokeWidth={1.5} />
    <polyline points="6,16 10,10 14,13 20,6" strokeWidth={2} />
  </>);
}

export function GiftIcon({ size = defaults.size, className = defaults.className, style = defaults.style }: IconProps) {
  return svg(size, className, style, <>
    <rect x="3" y="10" width="18" height="11" rx="1" strokeWidth={1.8} />
    <rect x="5" y="6" width="14" height="4" rx="1" strokeWidth={1.5} />
    <line x1="12" y1="10" x2="12" y2="21" strokeWidth={1.2} opacity={0.4} />
    <path d="M12 6 Q9 2 6 4" strokeWidth={1.5} opacity={0.6} />
    <path d="M12 6 Q15 2 18 4" strokeWidth={1.5} opacity={0.6} />
  </>);
}
