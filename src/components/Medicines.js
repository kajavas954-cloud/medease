import React, { useState, useEffect } from "react";
import "./Medicines.css";

/* =========================================
   ANIMATED CATEGORY SVG (OFFLINE & SAFE)
   ========================================= */
// Image assets mapped to categories
const categoryImages = {
  Medicine: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2070&auto=format&fit=crop", // Medicine bottle
  Device: "https://images.unsplash.com/photo-1583946210796-c4d9da09516c?q=80&w=2070&auto=format&fit=crop", // Medical devices
  "Personal Care": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1974&auto=format&fit=crop", // Skin care
  Surgicals: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop", // Mask/Gloves
  Fitness: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop", // Fitness gear
  "Pet Care": "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2069&auto=format&fit=crop", // Dog medicine/care
  Ayush: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop", // Yoga/Herbal
  Homeopathy: "https://images.unsplash.com/photo-1612061483321-715bd0ee7949?q=80&w=1974&auto=format&fit=crop" // Homeopathy bottles
};

/* =========================================
   DATA
   ========================================= */
function Medicines({ searchQuery, onSearchChange }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState("");
  const search = searchQuery !== undefined ? searchQuery : localSearch;

  useEffect(() => {
    fetch("http://localhost:5000/api/medicines")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch medicines:", err);
        setLoading(false);
      });
  }, []);
  
  const handleSearchChange = (val) => {
    if (onSearchChange) onSearchChange(val);
    else setLocalSearch(val);
  };

  const [category, setCategory] = useState("All");
  const [addedItem, setAddedItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Wishlist state
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem("wishlist")) || []);
  
  const toggleWishlist = (product) => {
    let updated;
    if (wishlist.some(item => item.name === product.name)) {
      updated = wishlist.filter(item => item.name !== product.name);
    } else {
      updated = [...wishlist, product];
    }
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  const addToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const itemToAdd = {
      ...product,
      img: categoryImages[product.category] || categoryImages.Medicine
    };
    
    const updatedCart = [...existingCart, itemToAdd];
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    
    // Show visual feedback
    setAddedItem(product.name);
    setTimeout(() => setAddedItem(null), 2000);
  };

  // Promo Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      title: "Mega Healthcare Sale! 🚀",
      desc: "Get Flat 20% OFF on all prescription medicines. Use code: SAVE20",
      bg: "linear-gradient(135deg, #024b40, #1abc9c)"
    },
    {
      title: "Why Choose MedEase? 💡",
      desc: "100% Genuine Medicines | Fast Delivery | Premium Support",
      bg: "linear-gradient(135deg, #8e44ad, #9b59b6)"
    },
    {
      title: "Winter Care Essentials ❄️",
      desc: "Up to 30% OFF on personal care, moisturizers, and Ayush items.",
      bg: "linear-gradient(135deg, #2980b9, #3498db)"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || p.category === category)
  );

  return (
    <div className="medicines-page">
      <div className="medicines-container">
        
        <div className="sticky-dashboard-header">
          <h2>Medicines & Healthcare</h2>

          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="search-bar"
              placeholder="Search medicines..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="category-dashboard">
            {[
              { name: "All", icon: "💠" },
              { name: "Medicine", icon: "💊" },
              { name: "Device", icon: "🩺" },
              { name: "Personal Care", icon: "🧴" },
              { name: "Surgicals", icon: "🧤" },
              { name: "Fitness", icon: "🏋️" },
              { name: "Pet Care", icon: "🐾" },
              { name: "Ayush", icon: "🌿" },
              { name: "Homeopathy", icon: "🧪" }
            ].map((cat) => (
              <div 
                key={cat.name} 
                className={`category-dash-card ${category === cat.name ? "active" : ""}`} 
                onClick={() => setCategory(cat.name)}
              >
                <div className="cat-dash-icon">{cat.icon}</div>
                <div className="cat-dash-info">
                  <h4>{cat.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promotional Sliding Banner */}
        <div className="promo-slider">
          <div 
            className="slides-wrapper" 
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, idx) => (
              <div 
                className="slide-item" 
                key={idx} 
                style={{ background: slide.bg }}
              >
                <div className="slide-content">
                  <h3>{slide.title}</h3>
                  <p>{slide.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="slider-dots">
            {slides.map((_, i) => (
              <span 
                key={i} 
                className={`dot ${i === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(i)}
              />
            ))}
          </div>
        </div>



        {loading ? (
           <div style={{ textAlign: "center", padding: "80px", color: "white", width: "100%" }}>
              <h3>Loading secure medication data...</h3>
           </div>
        ) : (
           <div className="medicine-grid">
             {filtered.map((item, i) => (
            <div className="medicine-card" key={i} style={{ animationDelay: `${i * 0.05}s` }}>
              <button 
                className="wishlist-btn" 
                onClick={() => toggleWishlist(item)}
                title="Save for later"
              >
                {wishlist.some(w => w.name === item.name) ? "❤️" : "🤍"}
              </button>
              <img
                src={item.imageUrl || categoryImages[item.category] || categoryImages.Medicine}
                alt={item.name}
                className="product-image modal-trigger"
                onClick={() => setSelectedItem(item)}
                title="Click for details"
              />
              <h4>{item.name}</h4>
              <div className="rating">
                <span className="stars">{"★".repeat(Math.floor(item.rating))}</span>
                <span className="rating-value">{item.rating}</span>
                <span className="review-count">({item.reviews})</span>
              </div>
              <p className="price">₹ {item.price}</p>
              <div className="card-badges">
                <span className="badge-cat">📁 {item.category}</span>
                <span className="badge-expiry">⏳ Exp: {item.expiry}</span>
              </div>
              <button 
                onClick={() => addToCart(item)}
                className={addedItem === item.name ? "added" : ""}
              >
                {addedItem === item.name ? "✓ Added" : "Add to Cart"}
              </button>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* MODAL */}
      {selectedItem && (
        <div className="medicine-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="medicine-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedItem(null)}>✖</button>
            <div className="modal-content-wrap">
              <div className="modal-image-col">
                <img 
                  src={selectedItem.imageUrl || categoryImages[selectedItem.category] || categoryImages.Medicine} 
                  alt={selectedItem.name} 
                />
              </div>
              <div className="modal-info-col">
                <h2>{selectedItem.name}</h2>
                <div className="rating">
                  <span className="stars">{"★".repeat(Math.floor(selectedItem.rating))}</span>
                  <span className="rating-value">{selectedItem.rating}</span>
                  <span className="review-count">({selectedItem.reviews} reviews)</span>
                </div>
                <h3 className="modal-price">₹ {selectedItem.price}</h3>
                
                <div className="modal-details">
                  <div className="detail-item">
                    <strong>✅ Uses:</strong> <p>{selectedItem.uses}</p>
                  </div>
                  <div className="detail-item">
                    <strong>⚠️ Warning:</strong> <p>{selectedItem.warning}</p>
                  </div>
                  <div className="detail-item">
                    <strong>⏳ Limit:</strong> <p>{selectedItem.limit}</p>
                  </div>
                  <div className="detail-item">
                    <strong>📅 Expiry:</strong> <p style={{color: '#e74c3c', fontWeight: 'bold'}}>{selectedItem.expiry}</p>
                  </div>
                  <div className="detail-item">
                    <strong>💡 Best Before Use:</strong> <p>{selectedItem.beforeUse}</p>
                  </div>
                </div>

                <div className="modal-actions">
                  <button 
                    className={addedItem === selectedItem.name ? "add-btn added" : "add-btn"} 
                    onClick={() => addToCart(selectedItem)}
                  >
                    {addedItem === selectedItem.name ? "✓ Added to Cart" : "Add to Cart"}
                  </button>
                  <button 
                    className="modal-wishlist-btn"
                    onClick={() => toggleWishlist(selectedItem)}
                  >
                    {wishlist.some(w => w.name === selectedItem.name) ? "❤️ Remove Wishlist" : "🤍 Save for Later"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Medicines;
