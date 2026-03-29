import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SplashLoader from "./SplashLoader";
import { useToast } from "./ToastProvider";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const [showSplash, setShowSplash] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (email === "admin") {
      try {
        const res = await fetch("http://localhost:5000/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: email, password })
        });
        const data = await res.json();
        setIsLoading(false);
        if (res.ok) {
          localStorage.setItem("adminToken", data.token);
          navigate("/admin/dashboard");
        } else {
          toast(data.message || "Invalid admin credentials.", "error");
        }
      } catch (error) {
        setIsLoading(false);
        toast("Server is unreachable.", "error");
      }
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      setIsLoading(false);

      if (res.ok) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("registeredUser", JSON.stringify(data.user));
        setShowSplash(true);
        setTimeout(() => navigate("/home"), 2200);
      } else {
        toast(data.message || "Invalid email or password. Please try again.", "error");
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      toast("Server is unreachable. Please try again later.", "error");
    }
  };

  return (
    <div className="auth-background">
      {showSplash && <SplashLoader />}
      <div className="glass-card">
        <div className="auth-brand">
          <div className="brand-logo-icon">
             <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 6V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V6L12 2Z" fill="#1abc9c"/>
              <path d="M16 11.5H13V8.5H11V11.5H8V13.5H11V16.5H13V13.5H16V11.5Z" fill="white"/>
            </svg>
          </div>
          <h2>MedEase</h2>
        </div>
        
        <h3>Welcome Back</h3>
        <p className="auth-subtitle">Login to your account</p>

        <div className="email-login-form fade-in">
          <form onSubmit={handleLogin}>
              <div className="input-group">
                <span className="input-icon">📧</span>
                <input
                  type="text"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group" style={{ position: 'relative' }}>
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              <div className="auth-options">

                <span className="forgot-password" onClick={() => navigate("/forgot-password")}>Forgot Password?</span>
              </div>

              <button type="submit" className="primary-btn" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Login to Account"}
              </button>
            </form>
          </div>

        <p className="auth-footer">
          New user? <span className="auth-link" onClick={() => navigate("/register")}>Create an account</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
