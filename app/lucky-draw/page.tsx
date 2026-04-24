"use client";
import { useState } from "react";
import confetti from "canvas-confetti";

export default function LuckyDrawPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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
        const end = Date.now() + 2200;
        const frame = () => {
          confetti({ particleCount: 3, angle: 60, spread: 50, origin: { x: 0, y: 0.6 }, colors: ["#fff", "#aaa", "#666"] });
          confetti({ particleCount: 3, angle: 120, spread: 50, origin: { x: 1, y: 0.6 }, colors: ["#fff", "#aaa", "#666"] });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      }
    } catch { setError("Network error"); }
    finally { setSubmitting(false); }
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { height: 100%; }
        body { height: 100%; background: #000; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; }
        .page { min-height: 100svh; display: flex; flex-direction: column; padding: 48px 28px 40px; }
        .top { display: flex; justify-content: space-between; align-items: flex-start; }
        .logo { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.35); }
        .num { font-size: 11px; letter-spacing: 0.1em; color: rgba(255,255,255,0.2); }
        .main { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 60px 0 40px; }
        .eyebrow { font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 20px; }
        .headline { font-size: clamp(38px, 11vw, 56px); font-weight: 700; line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 40px; }
        .headline span { color: rgba(255,255,255,0.2); }
        .divider { height: 1px; background: rgba(255,255,255,0.1); margin-bottom: 40px; }
        .form { display: flex; flex-direction: column; gap: 0; }
        .field { border-bottom: 1px solid rgba(255,255,255,0.1); padding: 18px 0; display: flex; flex-direction: column; gap: 6px; transition: border-color 0.2s; }
        .field:focus-within { border-color: rgba(255,255,255,0.4); }
        .label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.25); }
        .input { background: transparent; border: none; outline: none; color: #fff; font-size: 16px; font-family: inherit; width: 100%; caret-color: #fff; -webkit-appearance: none; }
        .input::placeholder { color: rgba(255,255,255,0.12); }
        .error { font-size: 12px; color: rgba(255,80,80,0.8); letter-spacing: 0.03em; padding-top: 14px; }
        .btn {
          margin-top: 36px; width: 100%; padding: 18px 0; background: #fff; color: #000;
          border: none; border-radius: 0; cursor: pointer;
          font-size: 12px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
          font-family: inherit; transition: opacity 0.15s, transform 0.1s;
        }
        .btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .btn:not(:disabled):active { transform: scale(0.99); }
        .success-wrap { display: flex; flex-direction: column; gap: 16px; }
        .success-label { font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(255,255,255,0.3); }
        .success-headline { font-size: clamp(30px, 9vw, 44px); font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; }
        .success-email { font-size: 13px; color: rgba(255,255,255,0.3); font-family: 'SF Mono', 'Fira Code', monospace; margin-top: 8px; word-break: break-all; }
        .footer { display: flex; justify-content: space-between; align-items: flex-end; }
        .footer-left { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.15); }
        .footer-right { font-size: 10px; letter-spacing: 0.1em; color: rgba(255,255,255,0.12); }
      `}</style>

      <div className="page">
        {/* Top bar */}
        <div className="top">
          <span className="logo">Harry Kwan</span>
          <span className="num">01</span>
        </div>

        {/* Main content */}
        <div className="main">
          {success ? (
            <div className="success-wrap">
              <div className="divider" />
              <p className="success-label">登記完成</p>
              <h1 className="success-headline">已登記。<br /><span style={{color:"rgba(255,255,255,0.25)"}}>祝你好運。</span></h1>
              <p className="success-email">{email}</p>
              <div className="divider" style={{marginTop: 24}} />
            </div>
          ) : (
            <>
              <p className="eyebrow">抽獎登記</p>
              <h1 className="headline">登記電郵，<br /><span>贏取獎品。</span></h1>
              <div className="divider" />
              <form className="form" onSubmit={handleSubmit}>
                <div className="field">
                  <label className="label">姓名</label>
                  <input className="input" type="text" placeholder="你的名字"
                    value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="field">
                  <label className="label">電郵</label>
                  <input className="input" type="email" placeholder="your@email.com"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                {error && <p className="error">⚠ {error}</p>}
                <button className="btn" type="submit" disabled={submitting}>
                  {submitting ? "登記中" : "立即登記"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="footer">
          <span className="footer-left">kclmusic.com</span>
          <span className="footer-right">© 2025</span>
        </div>
      </div>
    </>
  );
}
