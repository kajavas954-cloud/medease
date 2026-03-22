import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [registerMode, setRegisterMode] = useState("social"); // "social" or "email"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (res.ok) {
        // Auto login
        const loginRes = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        
        setIsLoading(false);

        if (loginRes.ok) {
          localStorage.setItem("authToken", loginData.token);
          localStorage.setItem("registeredUser", JSON.stringify(loginData.user));
          navigate("/home");
        } else {
          alert("Account created, but auto-login failed. Please login manually.");
          navigate("/");
        }
      } else {
        setIsLoading(false);
        alert(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      alert("Server is unreachable. Please try again later.");
    }
  };

  const handleGoogleRegister = () => {
    const googleUser = {
      name: "Google User",
      email: "user@gmail.com",
    };
    localStorage.setItem("registeredUser", JSON.stringify(googleUser));
    alert("Successfully registered with Google!");
    navigate("/"); 
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
        
        <h3>Create Account</h3>
        <p className="auth-subtitle">Join us for a healthier tomorrow</p>

        {registerMode === "social" ? (
          <div className="social-login-stacked">
            <button type="button" className="social-btn-large google-btn" onClick={handleGoogleRegister}>
               <span className="social-icon">G</span> Sign up with Google
            </button>
            <button type="button" className="social-btn-large email-btn" onClick={() => setRegisterMode("email")}>
               <span className="social-icon">✉️</span> Sign up with Email
            </button>
          </div>
        ) : (
          <div className="email-login-form fade-in">
            <button type="button" className="back-btn" onClick={() => setRegisterMode("social")}>
              ← Back to options
            </button>
            <form onSubmit={handleRegister}>
              <div className="input-group">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

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

              <button type="submit" className="primary-btn mt-extra" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>
        )}

        <div className="social-divider">
          <span>or</span>
        </div>

        <p className="auth-footer">
          Already have an account? <span className="auth-link" onClick={() => navigate("/")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Register;
