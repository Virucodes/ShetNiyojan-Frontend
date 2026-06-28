import { useState, useRef, useEffect, useCallback } from "react";
import { otp } from "@/lib/api";
import { toast } from "sonner";
import { ShieldCheck, Smartphone, X, RefreshCw, CheckCircle2, Loader2 } from "lucide-react";

interface OtpModalProps {
  isOpen: boolean;
  mobile: string;
  onVerified: () => void;
  onClose: () => void;
  purpose?: "register" | "login";
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

const OtpModal = ({ isOpen, mobile, onVerified, onClose, purpose = "login" }: OtpModalProps) => {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [verified, setVerified] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback(() => {
    setCooldown(RESEND_COOLDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setDigits(Array(OTP_LENGTH).fill(""));
      setVerified(false);
      setShake(false);
      startCooldown();
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, startCooldown]);

  const handleChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);
    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const newDigits = [...digits];
    pasted.split("").forEach((char, i) => {
      newDigits[i] = char;
    });
    setDigits(newDigits);
    const nextEmpty = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextEmpty]?.focus();
  };

  const handleVerify = async () => {
    const code = digits.join("");
    if (code.length !== OTP_LENGTH) {
      toast.error("Please enter all 6 digits");
      return;
    }

    try {
      setIsVerifying(true);
      await otp.verify(mobile, code);
      setVerified(true);
      setTimeout(() => {
        onVerified();
      }, 900);
    } catch (error: any) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      const msg = error?.response?.data?.message || "Invalid OTP. Please try again.";
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    try {
      setIsResending(true);
      await otp.send(mobile);
      toast.success("OTP resent successfully!");
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      startCooldown();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to resend OTP.";
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  const maskedMobile = mobile
    ? `+91 ${mobile.slice(0, 2)}XXXXXX${mobile.slice(-2)}`
    : "";

  if (!isOpen) return null;

  return (
    <div className="otp-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`otp-modal ${shake ? "otp-shake" : ""} ${verified ? "otp-verified" : ""}`}>
        {/* Close Button */}
        <button className="otp-close-btn" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {/* Icon Header */}
        <div className="otp-icon-wrapper">
          {verified ? (
            <div className="otp-success-icon">
              <CheckCircle2 size={40} className="text-white" />
            </div>
          ) : (
            <div className="otp-shield-icon">
              <ShieldCheck size={36} className="text-white" />
            </div>
          )}
        </div>

        {verified ? (
          <div className="otp-verified-content">
            <h2 className="otp-title">Verified!</h2>
            <p className="otp-subtitle">You're being signed in…</p>
          </div>
        ) : (
          <>
            <h2 className="otp-title">
              {purpose === "register" ? "Verify Your Number" : "Two-Step Verification"}
            </h2>
            <p className="otp-subtitle">
              We sent a 6-digit code to
            </p>
            <div className="otp-phone-badge">
              <Smartphone size={14} />
              <span>{maskedMobile}</span>
            </div>

            {/* OTP Input Boxes */}
            <div className="otp-inputs-row" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`otp-digit-input ${digit ? "otp-digit-filled" : ""}`}
                  aria-label={`OTP digit ${i + 1}`}
                  disabled={isVerifying}
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              className="otp-verify-btn"
              onClick={handleVerify}
              disabled={isVerifying || digits.join("").length < OTP_LENGTH}
            >
              {isVerifying ? (
                <>
                  <Loader2 size={18} className="otp-spin" />
                  Verifying…
                </>
              ) : (
                "Verify OTP"
              )}
            </button>

            {/* Resend Section */}
            <div className="otp-resend-section">
              {cooldown > 0 ? (
                <p className="otp-resend-timer">
                  Resend code in <span className="otp-countdown">{cooldown}s</span>
                </p>
              ) : (
                <button
                  className="otp-resend-btn"
                  onClick={handleResend}
                  disabled={isResending}
                >
                  {isResending ? (
                    <><RefreshCw size={13} className="otp-spin" /> Sending…</>
                  ) : (
                    <><RefreshCw size={13} /> Resend OTP</>
                  )}
                </button>
              )}
            </div>

            {/* Helper text */}
            <p className="otp-helper-text">
              Didn't receive it? Check spam or try resending.
            </p>
          </>
        )}
      </div>

      <style>{`
        .otp-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: otp-fade-in 0.2s ease;
          padding: 1rem;
        }

        @keyframes otp-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .otp-modal {
          position: relative;
          background: #ffffff;
          border-radius: 24px;
          padding: 2.5rem 2rem 2rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          animation: otp-slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes otp-slide-up {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }

        .otp-shake {
          animation: otp-shake-anim 0.5s ease;
        }
        @keyframes otp-shake-anim {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-8px); }
          40%     { transform: translateX(8px); }
          60%     { transform: translateX(-6px); }
          80%     { transform: translateX(6px); }
        }

        .otp-verified {
          border: 2px solid #16a34a;
        }

        .otp-close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #f3f4f6;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #6b7280;
          transition: background 0.15s, color 0.15s;
        }
        .otp-close-btn:hover { background: #e5e7eb; color: #111; }

        .otp-icon-wrapper { margin-bottom: 0.25rem; }

        .otp-shield-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #16a34a, #15803d);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(22,163,74,0.35);
          animation: otp-pulse 2s infinite;
        }
        @keyframes otp-pulse {
          0%,100% { box-shadow: 0 8px 24px rgba(22,163,74,0.35); }
          50%      { box-shadow: 0 8px 32px rgba(22,163,74,0.55); }
        }

        .otp-success-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #16a34a, #15803d);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(22,163,74,0.4);
          animation: otp-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes otp-pop {
          from { transform: scale(0); }
          to   { transform: scale(1); }
        }

        .otp-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          text-align: center;
          margin: 0;
        }

        .otp-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          text-align: center;
          margin: 0;
        }

        .otp-phone-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #15803d;
        }

        .otp-inputs-row {
          display: flex;
          gap: 0.65rem;
          margin: 0.5rem 0;
        }

        .otp-digit-input {
          width: 48px;
          height: 56px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1.5rem;
          font-weight: 700;
          text-align: center;
          color: #111827;
          background: #f9fafb;
          outline: none;
          transition: border-color 0.15s, background 0.15s, transform 0.1s, box-shadow 0.15s;
          caret-color: transparent;
        }
        .otp-digit-input:focus {
          border-color: #16a34a;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(22,163,74,0.15);
          transform: translateY(-2px);
        }
        .otp-digit-filled {
          border-color: #16a34a;
          background: #f0fdf4;
          color: #15803d;
        }
        .otp-digit-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .otp-verify-btn {
          width: 100%;
          padding: 0.85rem;
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(22,163,74,0.35);
          margin-top: 0.25rem;
        }
        .otp-verify-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(22,163,74,0.45);
        }
        .otp-verify-btn:active:not(:disabled) { transform: translateY(0); }
        .otp-verify-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .otp-resend-section { text-align: center; }

        .otp-resend-timer {
          font-size: 0.82rem;
          color: #9ca3af;
          margin: 0;
        }
        .otp-countdown {
          font-weight: 700;
          color: #16a34a;
        }

        .otp-resend-btn {
          background: none;
          border: none;
          color: #16a34a;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 8px;
          border-radius: 8px;
          transition: background 0.15s;
        }
        .otp-resend-btn:hover { background: #f0fdf4; }
        .otp-resend-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .otp-helper-text {
          font-size: 0.75rem;
          color: #d1d5db;
          text-align: center;
          margin: 0;
        }

        .otp-spin {
          animation: otp-spin-anim 0.8s linear infinite;
        }
        @keyframes otp-spin-anim {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .otp-verified-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          padding-bottom: 1rem;
        }

        @media (max-width: 480px) {
          .otp-digit-input { width: 40px; height: 48px; font-size: 1.25rem; }
          .otp-inputs-row { gap: 0.45rem; }
          .otp-modal { padding: 2rem 1.25rem 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default OtpModal;
