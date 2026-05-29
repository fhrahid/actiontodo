"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validate = (): boolean => {
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0d0d1a] min-h-screen flex items-center justify-center px-4">
      <div className="card-anime max-w-md w-full mx-auto mt-20 p-8">
        <h1 className="text-3xl font-bold text-center mb-2 uppercase text-cyan-400 drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">
          BEGIN YOUR JOURNEY
        </h1>
        <p className="text-center text-gray-500 mb-8 text-sm uppercase tracking-widest">
          Join the ranks
        </p>

        {error && (
          <div className="text-red-400 px-4 py-2 mb-4 text-sm text-center border border-red-400/30 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs tracking-wider text-gray-400 mb-1.5 uppercase">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider text-gray-400 mb-1.5 uppercase">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider text-gray-400 mb-1.5 uppercase">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Min 6 characters"
            />
          </div>

          <div>
            <label className="block text-xs tracking-wider text-gray-400 mb-1.5 uppercase">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "CREATING..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-gray-600 text-xs uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="btn-outline w-full py-3 font-medium uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          SIGN UP WITH GOOGLE
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already here?{" "}
          <Link
            href="/login"
            className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wide"
          >
            SIGN IN
          </Link>
        </p>
      </div>
    </div>
  );
}
