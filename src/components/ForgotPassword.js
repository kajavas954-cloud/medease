import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css"; // We will reuse the core Auth classes from Login.css, but keep a separate file just in case.

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (res.ok) {
        setStep(2);
        setMessage("OTP has been sent to your email.");
        if (data.url) setPreviewUrl(data.url);
      } else {
        setMessage(data.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server is unreachable. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setPreviewUrl("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      
      if (res.ok) {
        setStep(3);
        setMessage("OTP verified. Please enter your new password.");
      } else {
        setMessage(data.message || "Invalid or expired OTP.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server is unreachable. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setPreviewUrl("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage("Password reset successfully. Redirecting to login...");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setMessage(data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server is unreachable. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-background">
      <div className="glass-card forgot-password-card">
        <button className="back-btn" onClick={() => navigate("/")}>
          &#8592; Back to Login
        </button>
        
        <div className="auth-brand">
          <div className="brand-logo-icon">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 6V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V6L12 2Z" fill="#1abc9c"/>
              <path d="M16 11.5H13V8.5H11V11.5H8V13.5H11V16.5H13V13.5H16V11.5Z" fill="white"/>
            </svg>
          </div>
          <h2>MedEase</h2>
        </div>
        
        <h3>Forgot Password</h3>
        <p className="auth-subtitle">Reset your account password quickly</p>

        {message && <div className="status-message">{message}</div>}
        {previewUrl && (
          <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: '0.9rem' }}>
            <a href={previewUrl} target="_blank" rel="noreferrer" style={{ color: '#1abc9c', textDecoration: 'underline', fontWeight: 'bold' }}>
              View Developer Test Email (Ethereal Inbox)
            </a>
          </div>
        )}

        <div className="email-login-form fade-in">
          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <div className="input-group">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="primary-btn mt-extra" disabled={isLoading}>
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="fade-in">
              <div className="input-group">
                <span className="input-icon">🔑</span>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="primary-btn mt-extra" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="fade-in">
              <div className="input-group" style={{ position: 'relative' }}>
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingRight: '40px' }}
                  required
                />
                <span 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', opacity: 0.7, display: 'flex', alignItems: 'center' }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </span>
              </div>
              <button type="submit" className="primary-btn mt-extra" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
