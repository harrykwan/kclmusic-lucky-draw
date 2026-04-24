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
        const end = Date.now() + 2500;
        const frame = () => {
          confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.65 }, colors: ["#a78bfa", "#e879f9", "#818cf8"] });
          confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.65 }, colors: ["#a78bfa", "#e879f9", "#818cf8"] });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      }
    } catch { setError("Network error, please try again"); }
    finally { setSubmitting(false); }
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body {
          background: #08060f;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .page {
          min-height: 100svh;
          background: radial-gradient(ellipse 80% 60% at 30% 20%, rgba(120,40,200,0.18) 0%, transparent 70%),
                      radial-gradient(ellipse 60% 50% at 75% 70%, rgba(60,40,180,0.12) 0%, transparent 70%),
                      linear-gradient(160deg, #0c0816 0%, #080612 50%, #060c14 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 20px;
        }
        .wrap { width: 100%; max-width: 360px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .artist { font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(167,139,250,0.5); font-weight: 300; }
        .card {
          width: 100%;
          background: linear-gradient(160deg, #1c1430 0%, #130f22 100%);
          border: 1px solid rgba(167,139,250,0.2);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 32px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03) inset;
        }
        .card-accent { height: 1px; background: linear-gradient(90deg, transparent, rgba(167,139,250,0.5) 40%, rgba(129,140,248,0.5) 60%, transparent); }
        .card-body { padding: 32px 28px; display: flex; flex-direction: column; gap: 24px; }
        .card-header { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
        .icon-wrap {
          width: 56px; height: 56px; border-radius: 16px;
          background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.15));
          border: 1px solid rgba(139,92,246,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
        }
        .card-title { color: #fff; font-size: 22px; font-weight: 600; letter-spacing: 0.02em; }
        .card-sub { color: rgba(255,255,255,0.3); font-size: 13px; line-height: 1.6; margin-top: 2px; }
        .form { display: flex; flex-direction: column; gap: 14px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .label { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.3); font-weight: 500; }
        .input {
          width: 100%; padding: 14px 16px; border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          color: #fff; font-size: 15px;
          outline: none; transition: border-color 0.2s;
          -webkit-appearance: none; appearance: none;
          caret-color: #a78bfa;
        }
        .input::placeholder { color: rgba(255,255,255,0.18); }
        .input:focus { border-color: rgba(167,139,250,0.45); }
        .error-box {
          padding: 12px 16px; border-radius: 12px;
          background: rgba(239,68,68,0.07);
          border: 1px solid rgba(239,68,68,0.18);
          color: rgba(252,165,165,0.85); font-size: 13px;
          display: flex; align-items: center; gap: 8px;
        }
        .btn {
          width: 100%; padding: 15px; border-radius: 12px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 50%, #4f46e5 100%);
          color: #fff; font-size: 15px; font-weight: 600; letter-spacing: 0.06em;
          box-shadow: 0 4px 20px rgba(124,58,237,0.4), 0 1px 0 rgba(255,255,255,0.08) inset;
          transition: opacity 0.15s, transform 0.1s;
          margin-top: 4px;
        }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn:not(:disabled):active { transform: scale(0.98); }
        .success { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 16px 0; text-align: center; }
        .success-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.1));
          border: 1px solid rgba(139,92,246,0.2);
          display: flex; align-items: center; justify-content: center; font-size: 28px;
        }
        .success-title { color: #fff; font-size: 20px; font-weight: 600; }
        .success-sub { color: rgba(255,255,255,0.35); font-size: 14px; margin-top: 2px; }
        .success-email {
          padding: 8px 16px; border-radius: 99px; font-size: 12px; font-family: monospace;
          background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.15);
          color: rgba(167,139,250,0.6);
        }
        .footer { font-size: 11px; letter-spacing: 0.15em; color: rgba(255,255,255,0.1); }
      `}</style>

      <div className="page">
        <div className="wrap">
          <p className="artist">Harry Kwan · 關誌諾</p>

          <div className="card">
            <div className="card-accent" />
            <div className="card-body">
              <div className="card-header">
                <div className="icon-wrap">🎟</div>
                <div>
                  <h1 className="card-title">抽獎登記</h1>
                  <p className="card-sub">登記電郵，有機會獲得驚喜獎品</p>
                </div>
              </div>

              {success ? (
                <div className="success">
                  <div className="success-icon">🎉</div>
                  <div>
                    <p className="success-title">成功登記！</p>
                    <p className="success-sub">等待抽獎結果，祝你好運 🍀</p>
                  </div>
                  <div className="success-email">{email}</div>
                </div>
              ) : (
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
                  {error && <div className="error-box"><span>⚠</span>{error}</div>}
                  <button className="btn" type="submit" disabled={submitting}>
                    {submitting ? "登記中..." : "立即登記"}
                  </button>
                </form>
              )}
            </div>
            <div className="card-accent" />
          </div>

          <p className="footer">kclmusic.com</p>
        </div>
      </div>
    </>
  );
}
