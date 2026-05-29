"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { animate, stagger } from "animejs";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/shop", label: "Shop" },
  { href: "/inventory", label: "Inventory" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);

  const user = session?.user as
    | { id?: string; role?: string; gems?: number; level?: number; name?: string; email?: string; image?: string }
    | undefined;

  const isAdmin = user?.role === "admin";
  const gems = user?.gems ?? 0;
  const level = user?.level ?? 1;

  useEffect(() => {
    if (mobileOpen && mobileRef.current) {
      animate(mobileRef.current, {
        height: [0, "auto"],
        opacity: [0, 1],
        duration: 250,
        ease: "outQuad",
      });
    }
  }, [mobileOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-cyan-500/20 bg-[#0d0d1a]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        <Link
          href="/dashboard"
          className="text-xl font-bold tracking-tight text-cyan-400"
          style={{ textShadow: "0 0 12px #00e5ff80, 0 0 24px #00e5ff40" }}
        >
          ⚡ ActionToDo
        </Link>

        {session ? (
          <>
            <div className="hidden items-center gap-5 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="border-b-2 border-transparent px-1 py-1 text-xs uppercase tracking-wider font-semibold text-gray-500 transition-colors hover:border-cyan-500/50 hover:text-cyan-400"
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="border-b-2 border-transparent px-1 py-1 text-xs uppercase tracking-wider font-semibold text-gray-500 transition-colors hover:border-cyan-500/50 hover:text-cyan-400"
                >
                  Admin
                </Link>
              )}
            </div>

            <div className="hidden items-center gap-4 md:flex">
              <span className="flex items-center gap-1 bg-cyan-500/10 px-3 py-1 text-sm font-bold text-cyan-400">
                💎 {gems}
              </span>
              <span className="bg-cyan-500/20 px-3 py-1 text-sm font-bold text-cyan-400">
                LV. {level}
              </span>
              <Link
                href="/profile"
                className="border-b-2 border-transparent px-1 py-1 text-xs uppercase tracking-wider font-semibold text-gray-500 transition-colors hover:border-cyan-500/50 hover:text-cyan-400"
              >
                Profile
              </Link>
              <button
                onClick={() => signOut()}
                className="cursor-pointer text-xs uppercase tracking-wider font-semibold text-gray-400 transition-colors hover:text-red-400"
              >
                Sign Out
              </button>
            </div>

            <button
              className="flex flex-col gap-1 md:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              <span className="block h-0.5 w-6 bg-cyan-400" />
              <span className="block h-0.5 w-6 bg-cyan-400" />
              <span className="block h-0.5 w-6 bg-cyan-400" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="border border-cyan-500/30 px-4 py-1.5 text-xs uppercase tracking-wider font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/10"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-cyan-500/20 px-4 py-1.5 text-xs uppercase tracking-wider font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/30"
            >
              Register
            </Link>
          </div>
        )}
      </div>

      {mobileOpen && session && (
        <div
          ref={mobileRef}
          className="overflow-hidden border-t border-cyan-500/20 bg-[#0d0d1a]/95 backdrop-blur-xl md:hidden"
          style={{ height: 0, opacity: 0 }}
        >
          <div className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 text-xs uppercase tracking-wider font-semibold text-gray-500 transition-colors hover:bg-cyan-500/10 hover:text-cyan-400"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 text-xs uppercase tracking-wider font-semibold text-gray-500 transition-colors hover:bg-cyan-500/10 hover:text-cyan-400"
              >
                Admin
              </Link>
            )}
            <div className="my-1 flex items-center gap-2">
              <span className="flex items-center gap-1 bg-cyan-500/10 px-3 py-1 text-sm font-bold text-cyan-400">
                💎 {gems}
              </span>
              <span className="bg-cyan-500/20 px-3 py-1 text-sm font-bold text-cyan-400">
                LV. {level}
              </span>
            </div>
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-xs uppercase tracking-wider font-semibold text-gray-500 transition-colors hover:bg-cyan-500/10 hover:text-cyan-400"
            >
              Profile
            </Link>
            <button
              onClick={() => {
                setMobileOpen(false);
                signOut();
              }}
              className="px-3 py-2 text-left text-xs uppercase tracking-wider font-semibold text-gray-400 transition-colors hover:text-red-400"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
