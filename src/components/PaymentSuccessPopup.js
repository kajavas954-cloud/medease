import React, { useEffect, useRef } from 'react';
import './PaymentSuccessPopup.css';

// Confetti colours matching GPay
const CONFETTI_COLORS = ['#1a73e8','#34a853','#fbbc04','#ea4335','#46bdc6','#ff6d00'];

// Random confetti dot positions
const DOTS = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * 2 * Math.PI;
  const dist  = 90 + Math.random() * 60;
  const tx    = Math.cos(angle) * dist;
  const ty    = Math.sin(angle) * dist;
  const size  = 5 + Math.random() * 7;
  const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
  const delay = (Math.random() * 0.25).toFixed(2);
  const isRect = i % 3 === 0;
  return { tx, ty, size, color, delay, isRect };
});

/**
 * PaymentSuccessPopup
 * Props:
 *   amount    — string/number, e.g. "₹1548" or 1548
 *   subtitle  — secondary line e.g. "Order placed successfully"
 *   onClose   — called when user clicks Done or after auto-close
 *   autoClose — ms to auto-close (default 3500), pass 0 to disable
 */
function PaymentSuccessPopup({ amount, subtitle, onClose, autoClose = 3500 }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (autoClose > 0) {
      timerRef.current = setTimeout(() => {
        onClose && onClose();
      }, autoClose);
    }
    return () => clearTimeout(timerRef.current);
  }, [autoClose, onClose]);

  const handleDone = () => {
    clearTimeout(timerRef.current);
    onClose && onClose();
  };

  const txId = 'ME' + Math.floor(1e9 + Math.random() * 9e9);
  const now  = new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="psp-overlay" onClick={handleDone}>
      <div className="psp-card" onClick={e => e.stopPropagation()}>

        {/* Auto-close progress bar */}
        {autoClose > 0 && (
          <div
            className="psp-progress"
            style={{ '--duration': `${autoClose}ms` }}
          />
        )}

        {/* Confetti */}
        <div className="psp-confetti">
          {DOTS.map((d, i) => (
            <span
              key={i}
              className="psp-dot"
              style={{
                width: d.size,
                height: d.isRect ? d.size * 0.5 : d.size,
                background: d.color,
                borderRadius: d.isRect ? '2px' : '50%',
                top: '50%',
                left: '50%',
                marginTop: -d.size / 2,
                marginLeft: -d.size / 2,
                '--tx': `${d.tx}px`,
                '--ty': `${d.ty}px`,
                animationDelay: `${d.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Blue circle with checkmark */}
        <div className="psp-circle-wrap">
          <div className="psp-circle">
            <svg className="psp-check" viewBox="0 0 52 52" fill="none">
              <path
                className="psp-check-path"
                d="M14 27 L22 35 L38 19"
                stroke="#fff"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Text */}
        <h2 className="psp-title">Payment Successful!</h2>
        <p className="psp-subtitle">
          {subtitle || 'Your transaction was completed successfully.'}
        </p>

        {amount != null && (
          <div className="psp-amount">
            {typeof amount === 'number' ? `₹${amount.toLocaleString('en-IN')}` : amount}
          </div>
        )}

        <p className="psp-meta">Txn ID: {txId} &nbsp;·&nbsp; {now}</p>

        <button className="psp-done-btn" onClick={handleDone}>
          Done
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccessPopup;
