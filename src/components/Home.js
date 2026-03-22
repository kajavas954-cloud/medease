import "./Home.css";
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-card">
        <h2>Welcome to MedEase 💊</h2>
        <p>Your trusted online medicine store</p>

        <button onClick={() => navigate("/medicines")}>
          View Medicines
        </button>

        <button onClick={() => navigate("/cart")}>
          View Cart
        </button>

        <button onClick={() => navigate("/orders")}>
          My Orders
        </button>

        <button className="logout" onClick={() => navigate("/")}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Home;
