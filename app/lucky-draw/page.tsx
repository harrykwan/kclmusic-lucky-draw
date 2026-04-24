"use client";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

function FloatingNote({ char, style }: { char: string; style: React.CSSProperties }) {
  return <span className="absolute select-none pointer-events-none opacity-10 text-white" style={style}>{char}</span>;
}

const notes = ["♩", "♪", "♫", "♬", "𝄞", "𝄢"];

export default function LuckyDrawPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [floaters, setFloaters] = useState<{ char: string; style: React.CSSProperties }[]>([]);

  useEffect(() => {
    const items = Array.from({ length: 18 }, (_, i) => ({
      char: notes[i % notes.length],
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        fontSize: `${Math.random() * 28 + 12}px`,
        transform: `rotate(${Math.random() * 40 - 20}deg)`,
        animationDelay: `${Math.random() * 6}s`,
        animationDuration: `${Math.random() * 8 + 8}s`,
      } as React.CSSProperties,
    }));
    setFloaters(items);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/draw/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSuccess(true);
        const end = Date.now() + 2000;
        const frame = () => {
          confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#c084fc", "#f0abfc", "#818cf8", "#fff"] });
          confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#c084fc", "#f0abfc", "#818cf8", "#fff"] });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      }
    } catch {
      setError("Network error, please try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-12" style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 40%, #0a0f1a 100%)" }}>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl" style={{ background: "radial-gradient(circle, #4f46e5, transparent)" }} />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 rounded-full opacity-6 blur-3xl" style={{ background: "radial-gradient(circle, #be185d, transparent)" }} />
      </div>

      {/* Floating music notes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floaters.map((f, i) => <FloatingNote key={i} char={f.char} style={f.style} />)}
      </div>

      {/* Thin top border accent */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #7c3aed 40%, #4f46e5 60%, transparent)" }} />

      <div className="relative w-full max-w-sm">
        {/* Artist tag */}
        <div className="flex justify-center mb-6">
          <span className="text-xs tracking-[0.3em] uppercase text-purple-400/60 font-light">Harry Kwan 關誌諾</span>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl overflow-hidden" style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 0 60px rgba(124,58,237,0.12), 0 24px 48px rgba(0,0,0,0.5)"
        }}>

          {/* Top shimmer line */}
          <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(192,132,252,0.4), transparent)" }} />

          <div className="p-8 flex flex-col gap-7">
            {/* Header */}
            <div className="text-center flex flex-col gap-2">
              <div className="text-3xl">🎟</div>
              <h1 className="text-2xl font-semibold tracking-wide" style={{
                background: "linear-gradient(135deg, #e9d5ff, #c084fc, #818cf8)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>
                抽獎登記
              </h1>
              <p className="text-white/30 text-xs tracking-wider leading-relaxed">
                登記電郵，有機會獲得驚喜獎品
              </p>
            </div>

            {success ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(192,132,252,0.2)" }}>
                  🎉
                </div>
                <div className="text-center">
                  <p className="text-white font-medium text-lg mb-1">成功登記！</p>
                  <p className="text-white/40 text-sm">等待抽獎結果，祝你好運 🍀</p>
                </div>
                <div className="mt-2 px-4 py-2 rounded-full text-xs text-purple-300/50 font-mono" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}>
                  {email}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-white/40 text-xs tracking-widest uppercase">姓名</label>
                  <input
                    type="text" placeholder="你的名字" value={name}
                    onChange={(e) => setName(e.target.value)} required
                    className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder:text-white/15 outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                    onFocus={e => (e.target.style.borderColor = "rgba(192,132,252,0.4)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-white/40 text-xs tracking-widest uppercase">電郵</label>
                  <input
                    type="email" placeholder="your@email.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} required
                    className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder:text-white/15 outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                    onFocus={e => (e.target.style.borderColor = "rgba(192,132,252,0.4)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-300/80" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                    <span className="text-red-400">⚠</span> {error}
                  </div>
                )}

                <button
                  type="submit" disabled={submitting}
                  className="relative w-full py-3.5 rounded-xl text-sm font-medium tracking-wide text-white transition-all overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed mt-1"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                >
                  <span className="relative z-10">{submitting ? "登記中..." : "立即登記"}</span>
                  <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(135deg, #6d28d9, #4338ca)" }} />
                </button>
              </form>
            )}
          </div>

          {/* Bottom shimmer */}
          <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent)" }} />
        </div>

        {/* Footer */}
        <p className="text-center text-white/15 text-xs mt-6 tracking-wider">kclmusic.com</p>
      </div>

      <style>{`
        @keyframes floatNote {
          0%, 100% { transform: translateY(0px) rotate(var(--r, 0deg)); opacity: 0.06; }
          50% { transform: translateY(-20px) rotate(var(--r, 0deg)); opacity: 0.12; }
        }
        .absolute.select-none { animation: floatNote var(--dur, 12s) ease-in-out infinite; --dur: inherit; }
      `}</style>
    </div>
  );
}
