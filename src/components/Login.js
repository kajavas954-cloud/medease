import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [loginMode, setLoginMode] = useState("social"); // "social" or "email"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

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
        navigate("/home");
      } else {
        alert(data.message || "Invalid email or password. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      alert("Server is unreachable. Please try again later.");
    }
  };

  const handleGoogleLogin = () => {
    const googleUser = {
      name: "Google User",
      email: "user@gmail.com",
    };
    localStorage.setItem("registeredUser", JSON.stringify(googleUser));
    navigate("/home");
  };

  return (
    <div className="auth-background">
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

        {loginMode === "social" ? (
          <div className="social-login-stacked">
            <button type="button" className="social-btn-large google-btn" onClick={handleGoogleLogin}>
               <span className="social-icon">G</span> Continue with Google
            </button>
            <button type="button" className="social-btn-large email-btn" onClick={() => setLoginMode("email")}>
               <span className="social-icon">✉️</span> Continue with Email
            </button>
          </div>
        ) : (
          <div className="email-login-form fade-in">
            <button type="button" className="back-btn" onClick={() => setLoginMode("social")}>
              ← Back to options
            </button>
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="auth-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <span className="forgot-password">Forgot Password?</span>
              </div>

              <button type="submit" className="primary-btn" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Login to Account"}
              </button>
            </form>
          </div>
        )}

        <div className="social-divider">
          <span>or</span>
        </div>

        <p className="auth-footer">
          New user? <span className="auth-link" onClick={() => navigate("/register")}>Create an account</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
