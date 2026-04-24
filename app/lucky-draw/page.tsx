"use client";
import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export default function LuckyDrawPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated canvas background — works everywhere
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      // Background
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#08060f");
      bg.addColorStop(0.5, "#0d0818");
      bg.addColorStop(1, "#060c14");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Glow orbs
      const drawOrb = (x: number, y: number, r: number, color: string, alpha: number) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, color.replace(")", `, ${alpha})`).replace("rgb", "rgba"));
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      };
      drawOrb(w * 0.3, h * 0.3, 300, "rgb(120, 40, 200)", 0.12);
      drawOrb(w * 0.75, h * 0.65, 250, "rgb(60, 40, 180)", 0.08);

      // Particles
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,160,255,${p.opacity})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSubmitting(true);
    try {
      const res = await fetch("/api/draw/enter", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); }
      else {
        setSuccess(true);
        const end = Date.now() + 2500;
        const frame = () => {
          confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.65 }, colors: ["#a78bfa", "#e879f9", "#818cf8", "#f9a8d4"] });
          confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.65 }, colors: ["#a78bfa", "#e879f9", "#818cf8", "#f9a8d4"] });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      }
    } catch { setError("Network error, please try again"); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-5 py-12">
      {/* Canvas background */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }} />

      <div className="relative w-full max-w-[360px] flex flex-col items-center gap-5" style={{ zIndex: 1 }}>

        {/* Artist label */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs tracking-[0.35em] uppercase font-light" style={{ color: "rgba(167,139,250,0.55)" }}>
            Harry Kwan · 關誌諾
          </p>
        </div>

        {/* Card */}
        <div className="w-full rounded-3xl overflow-hidden" style={{
          background: "linear-gradient(160deg, #1a1228 0%, #120d1f 100%)",
          border: "1px solid rgba(167,139,250,0.18)",
          boxShadow: "0 2px 0 rgba(167,139,250,0.06) inset, 0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(120,40,200,0.08)",
        }}>
          {/* Top accent line */}
          <div className="h-[1px] w-full" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(167,139,250,0.5) 40%, rgba(129,140,248,0.5) 60%, transparent 100%)" }} />

          <div className="px-7 pt-8 pb-8 flex flex-col gap-6">
            {/* Icon + title */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.15))",
                border: "1px solid rgba(139,92,246,0.25)",
              }}>
                🎟
              </div>
              <div>
                <h1 className="text-white font-semibold text-xl tracking-wide leading-tight">抽獎登記</h1>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>
                  登記電郵，有機會獲得驚喜獎品
                </p>
              </div>
            </div>

            {success ? (
              /* Success state */
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{
                  background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.1))",
                  border: "1px solid rgba(139,92,246,0.2)",
                }}>🎉</div>
                <div>
                  <p className="text-white font-semibold text-lg">成功登記！</p>
                  <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>等待抽獎結果，祝你好運 🍀</p>
                </div>
                <div className="px-4 py-2 rounded-full text-xs font-mono" style={{
                  background: "rgba(139,92,246,0.08)",
                  border: "1px solid rgba(139,92,246,0.15)",
                  color: "rgba(167,139,250,0.6)",
                }}>{email}</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs tracking-widest uppercase font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>姓名</label>
                  <input
                    type="text" placeholder="你的名字" value={name}
                    onChange={e => setName(e.target.value)} required
                    className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      WebkitAppearance: "none",
                      caretColor: "#a78bfa",
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(167,139,250,0.45)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs tracking-widest uppercase font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>電郵</label>
                  <input
                    type="email" placeholder="your@email.com" value={email}
                    onChange={e => setEmail(e.target.value)} required
                    className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      WebkitAppearance: "none",
                      caretColor: "#a78bfa",
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(167,139,250,0.45)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
                  />
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-xl text-xs flex items-center gap-2" style={{
                    background: "rgba(239,68,68,0.07)",
                    border: "1px solid rgba(239,68,68,0.18)",
                    color: "rgba(252,165,165,0.8)",
                  }}>
                    <span>⚠</span> {error}
                  </div>
                )}

                <button
                  type="submit" disabled={submitting}
                  className="w-full py-4 rounded-xl text-white text-sm font-semibold tracking-wider mt-1 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed active:opacity-80"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)",
                    boxShadow: "0 4px 24px rgba(124,58,237,0.35), 0 1px 0 rgba(255,255,255,0.06) inset",
                    WebkitAppearance: "none",
                  }}
                >
                  {submitting ? "登記中..." : "立即登記"}
                </button>
              </form>
            )}
          </div>

          {/* Bottom accent */}
          <div className="h-[1px] w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)" }} />
        </div>

        {/* Footer */}
        <p className="text-xs tracking-wider" style={{ color: "rgba(255,255,255,0.12)" }}>kclmusic.com</p>
      </div>
    </div>
  );
}
