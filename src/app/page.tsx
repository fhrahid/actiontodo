import Link from "next/link";
import EnergyParticles from "@/components/EnergyParticles";

const features = [
  { emoji: "⚔️", title: "COMBAT SYSTEM", description: "Roll gacha when creating tasks - Common to Legendary" },
  { emoji: "🌱", title: "LIVING GARDEN", description: "Watch your tasks grow from seeds to blooming plants" },
  { emoji: "👤", title: "CHARACTER CUSTOMIZATION", description: "Unlock avatars, equipment, and card designs" },
  { emoji: "🏆", title: "RANKING ARENA", description: "Climb the leaderboard and prove your worth" },
  { emoji: "💎", title: "GEM ECONOMY", description: "Earn gems, unlock rare items, collect them all" },
  { emoji: "🛡️", title: "FAIR PLAY", description: "Anti-cheat system keeps the competition real" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d0d1a] relative overflow-hidden">
      <EnergyParticles />

      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.05)_0%,transparent_70%)]">
        <div className="absolute top-1/4 left-1/4 w-64 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent rotate-12" />
        <div className="absolute top-1/3 right-1/4 w-48 h-[2px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent -rotate-6" />
        <div className="absolute bottom-1/3 left-1/3 w-56 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent rotate-45" />

        <span className="text-3xl mb-4 animate-pulse">⚡</span>
        <h1 className="text-6xl md:text-7xl font-black text-white tracking-tight leading-none">
          MASTER YOUR TASKS
        </h1>
        <p className="mt-6 text-3xl md:text-4xl font-black tracking-widest text-cyan-400 [text-shadow:0_0_30px_rgba(0,229,255,0.5),0_0_60px_rgba(0,229,255,0.2)]">
          FORGE YOUR LEGACY
        </p>
        <p className="mt-4 max-w-xl text-lg text-gray-400 font-medium">
          Complete tasks. Roll gacha. Build your empire.
        </p>
        <span className="text-2xl mt-2 animate-pulse">⚡</span>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/register"
            className="btn-primary px-8 py-4 text-lg font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50 hover:scale-105 transition-all duration-300"
          >
            BEGIN YOUR JOURNEY
          </Link>
          <Link
            href="/login"
            className="btn-outline px-8 py-4 text-lg font-bold border-2 border-cyan-500/60 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 hover:scale-105 transition-all duration-300"
          >
            SIGN IN
          </Link>
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24 bg-[#111128]/50 py-20">
        <h2 className="text-3xl md:text-4xl font-black text-center text-white mb-16 tracking-tight">
          ⚡ YOUR ARSENAL AWAITS
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card-anime group p-6 bg-[#111128] border border-cyan-500/10 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all duration-300"
            >
              <span className="text-4xl block mb-4">{feature.emoji}</span>
              <h3 className="text-lg font-bold text-cyan-400 uppercase tracking-wider mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 text-center py-8 text-gray-600 text-sm border-t border-cyan-500/10">
        Built with ⚡ by ActionToDo
      </footer>
    </div>
  );
}
