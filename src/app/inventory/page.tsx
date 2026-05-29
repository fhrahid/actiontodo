"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  animate,
  createScope,
  pulseGlow,
  staggerFadeInUp,
  cardHoverEffect,
  spinLoader,
} from "@/lib/anime-utils";
import { getItemIcon } from "@/components/IconMap";

type InventoryItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  slot?: string;
  tier: string;
  imageData: string;
  equipped: boolean;
  templateId: string;
};

const tierColors: Record<string, string> = {
  common: "bg-gray-600 text-gray-200",
  uncommon: "bg-green-700 text-green-100",
  rare: "bg-blue-700 text-blue-100",
  epic: "bg-purple-700 text-purple-100",
  legendary: "bg-yellow-700 text-yellow-100",
  mythic: "bg-gradient-to-r from-red-600 via-yellow-600 via-green-600 via-blue-600 to-purple-600 text-white",
};

const tierBorder: Record<string, string> = {
  common: "tier-common",
  uncommon: "tier-uncommon",
  rare: "tier-rare",
  epic: "tier-epic",
  legendary: "tier-legendary",
  mythic: "tier-mythic",
};

const tabs = ["AVATARS", "CARDS", "HEAD", "FACE", "BODY", "AURA"] as const;
type Tab = (typeof tabs)[number];

const categoryMap: Record<Tab, string> = {
  AVATARS: "avatar",
  CARDS: "card_design",
  HEAD: "equipment",
  FACE: "equipment",
  BODY: "equipment",
  AURA: "equipment",
};

export default function InventoryPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("AVATARS");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const loadoutRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(userItemId: string, action: "equip" | "unequip") {
    setActionId(userItemId);
    try {
      const res = await fetch("/api/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userItemId, action }),
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || items);
      }
    } finally {
      setActionId(null);
    }
  }

  const equippedItems = items.filter((item) => item.equipped);

  const filteredItems = items.filter((item) => {
    if (activeTab === "AVATARS") return item.category === "avatar";
    if (activeTab === "CARDS") return item.category === "card";
    if (["HEAD", "FACE", "BODY", "AURA"].includes(activeTab)) {
      return item.category === "equipment" && item.slot === activeTab.toLowerCase();
    }
    return false;
  });

  useEffect(() => {
    if (loading && loaderRef.current) {
      const scope = createScope({ root: loaderRef.current }).add(() => {
        spinLoader(".inv-spinner");
      });
      return () => scope.revert();
    }
  }, [loading]);

  useEffect(() => {
    if (loadoutRef.current && equippedItems.length > 0) {
      const scope = createScope({ root: loadoutRef.current }).add(() => {
        pulseGlow(".loadout-item");
      });
      return () => scope.revert();
    }
  }, [equippedItems.length]);

  useEffect(() => {
    if (!gridRef.current || loading || filteredItems.length === 0) return;
    const scope = createScope({ root: gridRef.current }).add(() => {
      staggerFadeInUp(".inv-card", 0, 50, 500);
    });
    return () => scope.revert();
  }, [activeTab, filteredItems.length, loading]);

  const handleCardMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    cardHoverEffect(e.currentTarget, true);
  }, []);

  const handleCardMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    cardHoverEffect(e.currentTarget, false);
  }, []);

  const handleButtonTap = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    animate(e.currentTarget, {
      scale: [1, 0.9, 1],
      duration: 200,
      ease: "outQuad",
    });
  }, []);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#0d0d1a" }}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black tracking-wider mb-8" style={{ color: "#00e5ff" }}>
          INVENTORY
        </h1>

        {equippedItems.length > 0 && (
          <div
            ref={loadoutRef}
            className="mb-8 p-5 border-2 rounded-none"
            style={{ borderColor: "rgba(0,229,255,0.3)", backgroundColor: "rgba(0,229,255,0.05)" }}
          >
            <h2 className="text-sm font-black tracking-[0.3em] mb-4" style={{ color: "#00e5ff" }}>
              ACTIVE LOADOUT
            </h2>
            <div className="flex flex-wrap gap-3">
              {equippedItems.map((item) => (
                <div
                  key={item.id}
                  className="loadout-item flex items-center gap-2 px-4 py-2 border-2 rounded-none"
                  style={{ borderColor: "rgba(0,229,255,0.5)", backgroundColor: "rgba(0,229,255,0.1)", boxShadow: "0 0 12px rgba(0,229,255,0.2)" }}
                >
                  <span className="inline-flex items-center text-cyan-400">
                    {item.category === "card" ? "🃏" : getItemIcon(item.templateId, { size: 24, className: "text-cyan-400" })}
                  </span>
                  <span className="text-sm font-bold text-white">
                    {item.name}
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-none tracking-wider" style={{ backgroundColor: "#00e5ff", color: "#0d0d1a" }}>
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-0 mb-8 border-b-2" style={{ borderColor: "#1a1a2e" }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-black text-xs tracking-widest transition-all border-b-2 -mb-[2px] ${
                activeTab === tab
                  ? "text-cyan-400 border-cyan-400"
                  : "text-gray-500 border-transparent hover:text-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div ref={loaderRef} className="flex justify-center py-20">
            <div
              className="inv-spinner w-10 h-10 border-4 rounded-none"
              style={{ borderColor: "#1a1a2e", borderTopColor: "#00e5ff" }}
            />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="mb-4 flex items-center justify-center">{getItemIcon("avatar_knight", { size: 64, className: "text-gray-500" })}</p>
            <p className="text-gray-500 text-lg tracking-wider uppercase">No items found</p>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onMouseEnter={handleCardMouseEnter}
                onMouseLeave={handleCardMouseLeave}
                className={`inv-card p-4 rounded-none border-2 relative ${
                  item.equipped
                    ? "border-cyan-500/50"
                    : tierBorder[item.tier] || "border-gray-700"
                }`}
                style={{
                  backgroundColor: "#1a1a2e",
                  opacity: 0,
                  ...(item.equipped ? { boxShadow: "0 0 20px rgba(0,229,255,0.15)" } : {}),
                }}
              >
                {item.equipped && (
                  <div className="absolute top-2 right-2 text-xs font-black px-2 py-1 rounded-none tracking-wider" style={{ backgroundColor: "#00e5ff", color: "#0d0d1a" }}>
                    EQUIPPED
                  </div>
                )}

                {item.category === "card" ? (
                  <div className={`w-full h-16 rounded-none border-2 mb-3 flex items-center justify-center ${item.imageData}`}>
                    <span className="text-xs font-black tracking-wider text-gray-500 uppercase">{item.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center mb-3 text-cyan-400">{getItemIcon(item.templateId, { size: 48, className: "text-cyan-400" })}</div>
                )}

                <h3 className="text-lg font-black text-white text-center tracking-wide">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500 text-center mb-3">
                  {item.description}
                </p>

                <div className="flex items-center justify-center mb-3">
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-none tracking-wider uppercase ${
                      tierColors[item.tier] || "bg-gray-600 text-gray-200"
                    }`}
                  >
                    {item.tier}
                  </span>
                </div>

                <div className="flex justify-center">
                  <button
                    onMouseDown={handleButtonTap}
                    onClick={() =>
                      handleAction(
                        item.id,
                        item.equipped ? "unequip" : "equip"
                      )
                    }
                    disabled={actionId === item.id}
                    className={`px-6 py-2 rounded-none text-sm font-black tracking-wider transition-all uppercase ${
                      item.equipped
                        ? "btn-outline"
                        : "btn-primary"
                    }`}
                  >
                    {actionId === item.id
                      ? "..."
                      : item.equipped
                      ? "UNEQUIP"
                      : "EQUIP"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
