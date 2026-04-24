"use client";
import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface DrawEntry { timestamp: string; name: string; email: string; entryId: string; }

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789關誌諾音樂抽獎贏取";

function scramble(target: string, progress: number): string {
  return target.split("").map((char, i) => {
    if (i < Math.floor(progress * target.length)) return char;
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }).join("");
}

function WinnerCard({ entry, index, isNew }: { entry: DrawEntry; index: number; isNew: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 16px", borderRadius: 12,
      background: isNew ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
      border: `1px solid ${isNew ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)"}`,
      transition: "all 0.5s ease",
      animation: isNew ? "slideIn 0.4s ease" : "none",
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        background: "rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600,
      }}>
        {index + 1}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "#fff", fontWeight: 600, fontSize: 15, letterSpacing: "0.01em" }}>{entry.name}</div>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.email}</div>
      </div>
    </div>
  );
}

export default function DrawShowPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");

  const [phase, setPhase] = useState<"idle" | "spinning" | "reveal">("idle");
  const [displayName, setDisplayName] = useState("———");
  const [winner, setWinner] = useState<DrawEntry | null>(null);
  const [winners, setWinners] = useState<DrawEntry[]>([]);
  const [newWinnerId, setNewWinnerId] = useState<string | null>(null);
  const [totalEntries, setTotalEntries] = useState<number | null>(null);
  const spinRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function login() {
    setAuthError("");
    const res = await fetch(`/api/draw/entries?password=${encodeURIComponent(password)}`);
    if (res.status === 401) { setAuthError("Wrong password"); return; }
    const data = await res.json();
    setTotalEntries((data.entries || []).length);
    setAuthed(true);
  }

  async function doDraw() {
    if (phase !== "idle") return;
    setPhase("spinning");
    setWinner(null);
    setDisplayName("———");

    // Fetch winner from API
    const res = await fetch("/api/draw/pick", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!data.winner) { setPhase("idle"); return; }
    const picked: DrawEntry = data.winner;

    // Check for repeat — skip if already won
    const alreadyWon = winners.find(w => w.entryId === picked.entryId);
    if (alreadyWon) {
      // try again silently by re-triggering
      setPhase("idle");
      setTimeout(doDraw, 100);
      return;
    }

    // Spin animation for 3 seconds
    const name = picked.name;
    const startTime = Date.now();
    const duration = 3000;

    spinRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress < 0.7 ? 0 : (progress - 0.7) / 0.3; // only start resolving at 70%
      setDisplayName(scramble(name, eased));
      if (elapsed >= duration) {
        clearInterval(spinRef.current!);
        setDisplayName(name);
        setPhase("reveal");
        setWinner(picked);
        setWinners(prev => [picked, ...prev]);
        setNewWinnerId(picked.entryId);
        setTimeout(() => setNewWinnerId(null), 2000);

        // Confetti burst
        const fire = (ratio: number, opts: object) =>
          confetti({ origin: { y: 0.5 }, ...opts, particleCount: Math.floor(200 * ratio) });
        fire(0.25, { spread: 26, startVelocity: 55, colors: ["#fff", "#eee"] });
        fire(0.2,  { spread: 60, colors: ["#fff", "#ccc"] });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ["#fff", "#aaa"] });
        fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      }
    }, 50);
  }

  function reset() {
    if (spinRef.current) clearInterval(spinRef.current);
    setPhase("idle");
    setWinner(null);
    setDisplayName("———");
  }

  useEffect(() => () => { if (spinRef.current) clearInterval(spinRef.current); }, []);

  // LOGIN
  if (!authed) return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #000; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif; }
      `}</style>
      <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <p style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>Harry Kwan</p>
            <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 600 }}>抽獎現場</h1>
          </div>
          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "14px 16px", color: "#fff", fontSize: 15, outline: "none", width: "100%", fontFamily: "inherit" }} />
          {authError && <p style={{ color: "rgba(255,80,80,0.8)", fontSize: 13, textAlign: "center" }}>{authError}</p>}
          <button onClick={login} style={{ background: "#fff", color: "#000", border: "none", borderRadius: 10, padding: "14px", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
            進入
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #000; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif; overflow: hidden; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes revealName {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div style={{ height: "100svh", display: "flex", flexDirection: "column", color: "#fff" }}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div>
            <span style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Harry Kwan · 抽獎現場</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {totalEntries !== null && (
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em" }}>{totalEntries} 人登記</span>
            )}
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em" }}>{winners.length} 位得獎</span>
          </div>
        </div>

        {/* Main layout */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* Center stage */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 60px", gap: 48 }}>

            {/* Name display */}
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 20 }}>
              <p style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>
                {phase === "idle" ? "準備抽獎" : phase === "spinning" ? "抽緊..." : "得獎者"}
              </p>

              <div style={{
                fontSize: "clamp(52px, 8vw, 96px)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1,
                color: phase === "reveal" ? "#fff" : "rgba(255,255,255,0.6)",
                fontVariantNumeric: "tabular-nums",
                minHeight: "1.1em",
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: phase === "reveal" ? "revealName 0.5s ease" : "none",
                fontFamily: "inherit",
                transition: "color 0.3s",
              }}>
                {displayName}
              </div>

              {phase === "reveal" && winner && (
                <div style={{ animation: "revealName 0.6s ease 0.2s both" }}>
                  <p style={{ fontSize: 16, color: "rgba(255,255,255,0.35)", letterSpacing: "0.02em" }}>{winner.email}</p>
                </div>
              )}

              {phase === "spinning" && (
                <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.4)",
                      animation: `pulse 0.8s ease ${i * 0.15}s infinite`,
                    }} />
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ width: "100%", maxWidth: 400, height: 1, background: "rgba(255,255,255,0.07)" }} />

            {/* Controls */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={phase === "reveal" ? reset : doDraw}
                disabled={phase === "spinning"}
                style={{
                  background: phase === "reveal" ? "rgba(255,255,255,0.06)" : "#fff",
                  color: phase === "reveal" ? "rgba(255,255,255,0.6)" : "#000",
                  border: phase === "reveal" ? "1px solid rgba(255,255,255,0.12)" : "none",
                  borderRadius: 12, padding: "16px 40px",
                  fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
                  cursor: phase === "spinning" ? "not-allowed" : "pointer",
                  opacity: phase === "spinning" ? 0.3 : 1,
                  transition: "all 0.3s ease",
                  fontFamily: "inherit",
                }}
              >
                {phase === "idle" ? "開始抽獎" : phase === "spinning" ? "抽緊..." : "再抽一次"}
              </button>
            </div>

          </div>

          {/* Winners sidebar */}
          <div style={{
            width: 280, borderLeft: "1px solid rgba(255,255,255,0.05)",
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            <div style={{ padding: "20px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>得獎名單</p>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              {winners.length === 0 ? (
                <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 13, textAlign: "center", marginTop: 24 }}>尚未抽獎</p>
              ) : (
                winners.map((w, i) => (
                  <WinnerCard key={w.entryId} entry={w} index={winners.length - 1 - i} isNew={w.entryId === newWinnerId} />
                ))
              )}
            </div>
            {winners.length > 0 && (
              <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <button onClick={() => { setWinners([]); reset(); }} style={{
                  width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8, padding: "10px", color: "rgba(255,255,255,0.25)", fontSize: 12,
                  letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.2s",
                }}>
                  清除名單
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
