"use client";
import { useState } from "react";
import confetti from "canvas-confetti";

interface DrawEntry { timestamp: string; name: string; email: string; entryId: string; }

function boom() {
  const fire = (particleRatio: number, opts: object) =>
    confetti({ origin: { y: 0.7 }, ...opts, particleCount: Math.floor(200 * particleRatio) });
  fire(0.25, { spread: 26, startVelocity: 55, colors: ["#fbbf24", "#f59e0b"] });
  fire(0.2,  { spread: 60, colors: ["#c084fc", "#818cf8"] });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ["#fff", "#fde68a"] });
  fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ["#fbbf24"] });
  fire(0.1,  { spread: 120, startVelocity: 45, colors: ["#c084fc"] });
}

export default function AdminDrawPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [entries, setEntries] = useState<DrawEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [picking, setPicking] = useState(false);
  const [winner, setWinner] = useState<DrawEntry | null>(null);
  const [msg, setMsg] = useState("");

  async function login() {
    setMsg("");
    const res = await fetch(`/api/draw/entries?password=${encodeURIComponent(password)}`);
    if (res.status === 401) { setMsg("Wrong password"); return; }
    const data = await res.json();
    setEntries(data.entries || []);
    setAuthed(true);
  }

  async function refresh() {
    setLoading(true);
    const res = await fetch(`/api/draw/entries?password=${encodeURIComponent(password)}`);
    const data = await res.json();
    setEntries(data.entries || []);
    setLoading(false);
  }

  async function pick() {
    setWinner(null); setPicking(true);
    const res = await fetch("/api/draw/pick", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setPicking(false);
    if (data.winner) { setWinner(data.winner); setTimeout(boom, 200); }
    else setMsg(data.error || "Error picking winner");
  }

  function exportCSV() {
    const csv = ["Timestamp,Name,Email,EntryID",
      ...entries.map(e => `"${e.timestamp}","${e.name}","${e.email}","${e.entryId}"`)
    ].join("\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
      download: `draw-entries-${new Date().toISOString().slice(0,10)}.csv`
    });
    a.click();
  }

  // LOGIN
  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #0a0a0f, #0f0a1a)" }}>
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <p className="text-white/20 text-xs tracking-[0.3em] uppercase mb-2">Harry Kwan</p>
          <h1 className="text-white text-xl font-medium tracking-wide">抽獎管理</h1>
        </div>
        <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()}
            className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder:text-white/20 outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
          {msg && <p className="text-red-400/80 text-xs text-center">{msg}</p>}
          <button onClick={login}
            className="w-full py-3 rounded-xl text-white text-sm font-medium tracking-wide transition-opacity hover:opacity-80"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
            Enter
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-white px-4 py-10" style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 40%, #0a0f1a 100%)" }}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-3xl" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-[0.04] blur-3xl" style={{ background: "radial-gradient(circle, #4f46e5, transparent)" }} />
      </div>

      <div className="relative max-w-3xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/25 text-xs tracking-[0.25em] uppercase mb-1">Harry Kwan</p>
            <h1 className="text-xl font-semibold tracking-wide" style={{
              background: "linear-gradient(135deg, #e9d5ff, #c084fc)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>抽獎管理</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={refresh} disabled={loading}
              className="px-4 py-2 rounded-xl text-xs text-white/50 hover:text-white/80 transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {loading ? "..." : "↻ 重新整理"}
            </button>
            <button onClick={exportCSV}
              className="px-4 py-2 rounded-xl text-xs text-white/50 hover:text-white/80 transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              ↓ CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="rounded-2xl p-6 flex items-center gap-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="text-5xl font-light" style={{ background: "linear-gradient(135deg, #c084fc, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {entries.length}
          </div>
          <div>
            <div className="text-white text-base font-medium">登記人數</div>
            <div className="text-white/30 text-xs mt-0.5">Total Entries</div>
          </div>
        </div>

        {/* Draw button */}
        <button onClick={pick} disabled={picking || entries.length === 0}
          className="relative w-full py-5 rounded-2xl text-white font-medium tracking-wider text-lg overflow-hidden disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{ background: "linear-gradient(135deg, #6d28d9 0%, #4f46e5 50%, #7c3aed 100%)", boxShadow: "0 0 40px rgba(124,58,237,0.3)" }}>
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.05), transparent)" }} />
          <span className="relative">{picking ? "抽緊..." : "🎰  抽獎"}</span>
        </button>

        {msg && <p className="text-red-400/60 text-center text-sm">{msg}</p>}

        {/* Winner */}
        {winner && (
          <div className="relative rounded-2xl p-7 flex flex-col items-center gap-3 text-center overflow-hidden"
            style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.2)", boxShadow: "0 0 60px rgba(251,191,36,0.06)" }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.4), transparent)" }} />
            <div className="text-4xl mb-1">🏆</div>
            <div className="text-2xl font-semibold" style={{ background: "linear-gradient(135deg, #fde68a, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {winner.name}
            </div>
            <div className="text-amber-300/70 text-base">{winner.email}</div>
            <div className="text-white/20 font-mono text-xs mt-1">{winner.entryId}</div>
            <div className="text-white/20 text-xs">{new Date(winner.timestamp).toLocaleString("zh-HK")}</div>
            <button onClick={pick} disabled={picking}
              className="mt-3 px-6 py-2 rounded-xl text-xs text-white/50 hover:text-white/80 transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              再抽
            </button>
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="px-5 py-4 flex justify-between items-center" style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-white/50 text-sm">所有登記</span>
            <span className="text-white/20 text-xs">{entries.length} entries</span>
          </div>
          {entries.length === 0 ? (
            <div className="py-12 text-center text-white/15 text-sm">暫時未有登記</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/20 text-xs uppercase" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {["#", "時間", "姓名", "電郵", "ID"].map(h => (
                      <th key={h} className="text-left px-5 py-3 font-normal tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr key={e.entryId}
                      className="transition-colors"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: winner?.entryId === e.entryId ? "rgba(251,191,36,0.06)" : "transparent",
                      }}>
                      <td className="px-5 py-3.5 text-white/20">{i + 1}</td>
                      <td className="px-5 py-3.5 text-white/30 text-xs whitespace-nowrap">{new Date(e.timestamp).toLocaleString("zh-HK")}</td>
                      <td className={`px-5 py-3.5 font-medium ${winner?.entryId === e.entryId ? "text-amber-300" : "text-white/80"}`}>{e.name}</td>
                      <td className={`px-5 py-3.5 ${winner?.entryId === e.entryId ? "text-amber-300/70" : "text-white/50"}`}>{e.email}</td>
                      <td className="px-5 py-3.5 text-white/15 font-mono text-xs">{e.entryId.slice(0, 8)}…</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
