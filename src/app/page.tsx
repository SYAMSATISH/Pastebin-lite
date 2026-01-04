"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState<number | "">("");
  const [maxViews, setMaxViews] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: string; url: string } | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          ttl_seconds: ttl ? Number(ttl) : undefined,
          max_views: maxViews ? Number(maxViews) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create paste");
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4 selection:bg-indigo-500/30">
      <div className="w-full max-w-2xl bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl ring-1 ring-white/10">
        <h1 className="text-4xl font-black tracking-tight mb-2 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Pastebin Lite
        </h1>
        <p className="text-slate-400 mb-8">Share text securely with ephemeral links.</p>

        {result ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
              <h3 className="text-green-400 font-semibold mb-2">Paste Created!</h3>
              <p className="text-sm text-slate-400 mb-4">Your paste is ready to share.</p>

              <div className="flex gap-2">
                <input
                  readOnly
                  value={result.url}
                  className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-sm font-mono text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  onClick={(e) => e.currentTarget.select()}
                />
                <Link
                  href={`/p/${result.id}`}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
                >
                  View
                </Link>
              </div>
            </div>
            <button
              onClick={() => { setResult(null); setContent(""); setTtl(""); setMaxViews(""); }}
              className="text-sm text-slate-500 hover:text-indigo-400 transition-colors"
            >
              Create another paste
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="content" className="block text-sm font-medium text-slate-300">
                Content
              </label>
              <textarea
                id="content"
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your text here..."
                className="w-full h-64 bg-slate-950/50 border border-white/10 rounded-xl p-4 text-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="ttl" className="block text-sm font-medium text-slate-300">
                  TTL (Seconds) <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  id="ttl"
                  min="1"
                  value={ttl}
                  onChange={(e) => setTtl(e.target.value ? Number(e.target.value) : "")}
                  placeholder="e.g. 60"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="maxViews" className="block text-sm font-medium text-slate-300">
                  Max Views <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  id="maxViews"
                  min="1"
                  value={maxViews}
                  onChange={(e) => setMaxViews(e.target.value ? Number(e.target.value) : "")}
                  placeholder="e.g. 5"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
            >
              {loading ? "Creating..." : "Create Paste"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
