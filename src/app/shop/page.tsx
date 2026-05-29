"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { getItemIcon } from "@/components/IconMap";
import {
  animate,
  createScope,
  stagger,
  useAnimeScope,
  staggerFadeInUp,
  cardHoverEffect,
  spinLoader,
  pulseGlow,
} from "@/lib/anime-utils";

type ShopItem = {
  id: string;
  name: string;
  description: string;
  type: string;
  tier: string;
  gemPrice: number | null;
  imageData: string;
  isGachaEligible: boolean;
  requiredLevel: number;
  requiredTasks: number;
  owned?: boolean;
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

const slotMap: Record<Tab, string | null> = {
  AVATARS: null,
  CARDS: null,
  HEAD: "head",
  FACE: "face",
  BODY: "body",
  AURA: "aura",
};

export default function ShopPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("AVATARS");
  const [gems, setGems] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const { root, initScope } = useAnimeScope();
  const loaderRef = useRef<HTMLDivElement>(null);
  const loaderScope = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (loading && loaderRef.current) {
      loaderScope.current?.revert();
      loaderScope.current = createScope({ root: loaderRef }).add(() => {
        spinLoader(".shop-loader");
      });
    }
    return () => {
      loaderScope.current?.revert();
    };
  }, [loading]);

  useEffect(() => {
    if (!loading && root.current) {
      initScope((self) => {
        staggerFadeInUp(".shop-item-card", 0, 50, 500);

        animate(".mythic-item", {
          filter: [
            "hue-rotate(0deg)",
            "hue-rotate(360deg)",
          ],
          duration: 4000,
          loop: true,
          ease: "linear",
        });

        pulseGlow(".legendary-item", "#ffd700");
      });
    }
  }, [loading, activeTab, items]);

  async function fetchItems() {
    try {
      const res = await fetch("/api/shop");
      const data = await res.json();
      const templates: ShopItem[] = data.items || [];
      const ownedIds: string[] = data.ownedIds || [];
      const mapped = templates.map((t: any) => ({
        ...t,
        owned: ownedIds.includes(t.id),
      }));
      setItems(mapped);

      const statsRes = await fetch("/api/user/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setGems(statsData.user?.gems ?? 0);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleBuy(itemTemplateId: string, price: number) {
    setBuyingId(itemTemplateId);
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemTemplateId }),
      });
      if (res.ok) {
        const data = await res.json();
        setGems(data.gemsRemaining ?? gems - price);
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemTemplateId ? { ...item, owned: true } : item
          )
        );
      }
    } finally {
      setBuyingId(null);
    }
  }

  const filteredItems = items.filter((item: any) => {
    if (activeTab === "AVATARS") return item.type === "avatar";
    if (activeTab === "CARDS") return item.type === "card";
    const slot = slotMap[activeTab];
    return item.type === "equipment" && item.equipSlot === slot;
  });

  const handleMouseEnter = (e: React.MouseEvent) => {
    cardHoverEffect(e.currentTarget as HTMLElement, true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    cardHoverEffect(e.currentTarget as HTMLElement, false);
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#0d0d1a" }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black tracking-wider" style={{ color: "#00e5ff" }}>
            ARMORY
          </h1>
          <div className="flex items-center gap-2 px-5 py-3 border-2 rounded-none" style={{ borderColor: "#00e5ff", backgroundColor: "rgba(0,229,255,0.08)" }}>
            <span className="text-2xl" style={{ color: "#00e5ff" }}>💎</span>
            <span className="text-xl font-black" style={{ color: "#00e5ff" }}>{gems}</span>
          </div>
        </div>

        <div className="flex gap-0 mb-8 border-b-2" style={{ borderColor: "#1a1a2e" }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-black text-sm tracking-widest transition-all border-b-2 -mb-[2px] ${
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
          <div className="flex justify-center py-20" ref={loaderRef}>
            <div
              className="shop-loader w-10 h-10 border-4 rounded-none"
              style={{ borderColor: "#1a1a2e", borderTopColor: "#00e5ff" }}
            />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">⚔️</p>
            <p className="text-gray-500 text-lg tracking-wider uppercase">
              No items in this category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" ref={root}>
            {filteredItems.map((item: any) => {
              const canAfford = item.gemPrice !== null && gems >= item.gemPrice;
              const isBuying = buyingId === item.id;
              const isMythic = item.tier === "mythic";
              const isLegendary = item.tier === "legendary";

              return (
                <div
                  key={item.id}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className={`shop-item-card ${isMythic ? "mythic-item" : ""} ${isLegendary ? "legendary-item" : ""} card-anime p-4 rounded-none border-2 ${
                    tierBorder[item.tier] || "border-gray-700"
                  } relative overflow-hidden`}
                  style={{ backgroundColor: "#1a1a2e" }}
                >
                  {item.owned && (
                    <div className="absolute top-2 right-2 text-xs font-black px-2 py-1 rounded-none tracking-wider" style={{ backgroundColor: "#7c4dff", color: "#fff" }}>
                      OWNED ✓
                    </div>
                  )}

                  {item.type === "card" ? (
                    <div className={`w-full h-20 rounded-none border-2 mb-3 flex items-center justify-center ${item.imageData}`}>
                      <span className="text-xs font-black tracking-wider text-gray-500 uppercase">{item.name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center mb-3 text-cyan-400">{getItemIcon(item.id, { size: 48, className: "text-cyan-400" })}</div>
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

                  {isMythic && !item.owned && (
                    <div className="text-center mb-3 space-y-1">
                      {item.requiredLevel > 0 && (
                        <p className="text-xs font-black tracking-wider" style={{ color: "#ff1744" }}>
                          🔒 REQUIRES LV. {item.requiredLevel}
                        </p>
                      )}
                      {item.requiredTasks > 0 && (
                        <p className="text-xs font-black tracking-wider" style={{ color: "#ff1744" }}>
                          🔒 REQUIRES {item.requiredTasks} TASKS
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 font-black" style={{ color: "#00e5ff" }}>
                      <span>💎</span>
                      {item.gemPrice ?? "—"}
                    </span>

                    <button
                      onClick={() => item.gemPrice && handleBuy(item.id, item.gemPrice)}
                      disabled={item.owned || !canAfford || isBuying}
                      className={`px-5 py-2 rounded-none text-sm font-black tracking-wider transition-all uppercase ${
                        item.owned
                          ? "opacity-40 cursor-not-allowed text-gray-500 border border-gray-700"
                          : !canAfford
                          ? "opacity-40 cursor-not-allowed text-gray-600 border border-gray-700"
                          : "btn-primary"
                      }`}
                    >
                      {isBuying
                        ? "..."
                        : item.owned
                        ? "OWNED ✓"
                        : "BUY"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
