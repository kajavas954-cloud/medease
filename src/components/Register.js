import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SplashLoader from "./SplashLoader";
import { useToast } from "./ToastProvider";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const toast = useToast();
  const [showSplash, setShowSplash] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, age, gender, bloodGroup })
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
          setShowSplash(true);
          setTimeout(() => navigate("/home"), 2200);
        } else {
          toast("Account created, but auto-login failed. Please login manually.", "info");
          navigate("/");
        }
      } else {
        setIsLoading(false);
        toast(data.message || "Registration failed. Please try again.", "error");
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
        
        <h3>Create Account</h3>
        <p className="auth-subtitle">Join us for a healthier tomorrow</p>

        <div className="email-login-form fade-in">
          <form onSubmit={handleRegister}>
              <div className="input-group">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
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
                <span className="input-icon">📱</span>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={10}
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

              <div className="input-group">
                <span className="input-icon">🎂</span>
                <input
                  type="number"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="1"
                  max="120"
                  required
                />
              </div>

              <div className="input-group">
                <span className="input-icon">🚻</span>
                <select value={gender} onChange={(e) => setGender(e.target.value)} required className="form-select">
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="input-group">
                <span className="input-icon">🩸</span>
                <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} required className="form-select">
                  <option value="" disabled>Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="Rather not say">Rather not say</option>
                </select>
              </div>

              <button type="submit" className="primary-btn mt-extra" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>

        <p className="auth-footer">
          Already have an account? <span className="auth-link" onClick={() => navigate("/")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Register;
