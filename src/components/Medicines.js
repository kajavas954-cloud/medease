import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Medicines.css";

const categoryImages = {
  Medicine: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2070&auto=format&fit=crop",
  Device: "https://images.unsplash.com/photo-1583946210796-c4d9da09516c?q=80&w=2070&auto=format&fit=crop",
  "Personal Care": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1974&auto=format&fit=crop",
  Surgicals: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop",
  Fitness: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop",
  "Pet Care": "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2069&auto=format&fit=crop",
  Ayush: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop",
  Homeopathy: "https://images.unsplash.com/photo-1612061483321-715bd0ee7949?q=80&w=1974&auto=format&fit=crop"
};

function Medicines({ searchQuery, onSearchChange, setActiveTab }) {
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
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [pendingCartItem, setPendingCartItem] = useState(null);
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionRedirect, setPrescriptionRedirect] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const scrollContainer = document.querySelector('.dashboard-content') || window;
    const handleScroll = () => {
      const scrollY = scrollContainer === window ? window.scrollY : scrollContainer.scrollTop;
      setIsScrolled(scrollY > 20);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    if (location.state && location.state.openProduct) {
      setSelectedItem(location.state.openProduct);
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
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

  const addToCartFlow = (product, redirect = false) => {
    if (product.requiresPrescription) {
      setPendingCartItem(product);
      setPrescriptionRedirect(redirect);
      setShowPrescriptionModal(true);
      return;
    }
    executeAddToCart(product, null, redirect);
  };

  const executeAddToCart = (product, prescriptionUrl = null, redirect = false) => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItemIndex = existingCart.findIndex(item => item.name === product.name);
    
    if (existingItemIndex !== -1) {
      existingCart[existingItemIndex].quantity = (existingCart[existingItemIndex].quantity || 1) + 1;
      if (prescriptionUrl) existingCart[existingItemIndex].prescriptionUrl = prescriptionUrl;
    } else {
      existingCart.push({
        ...product,
        quantity: 1,
        img: product.imageUrl || categoryImages[product.category] || categoryImages.Medicine,
        prescriptionUrl: prescriptionUrl
      });
    }
    
    localStorage.setItem("cart", JSON.stringify(existingCart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    if (redirect) {
      if (setActiveTab) setActiveTab("cart");
    } else {
      setAddedItem(product.name);
      setTimeout(() => setAddedItem(null), 2000);
    }
  };

  const handleUploadPrescription = (e) => {
    e.preventDefault();
    if (!prescriptionFile) return;
    
    // Create a mock localized URL for the file attachment
    const mockUrl = "local_mock_" + prescriptionFile.name;
    executeAddToCart(pendingCartItem, mockUrl, prescriptionRedirect);
    
    setShowPrescriptionModal(false);
    setPendingCartItem(null);
    setPrescriptionFile(null);
  };

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
        <div className={`sticky-dashboard-header ${isScrolled ? 'scrolled' : ''}`}>
          {/* <h2>Medicines & Healthcare</h2> */}

          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="search-bar"
              placeholder="Search medicines..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="category-scroll-wrapper">
            <button className="scroll-arrow left" onClick={() => {
              document.querySelector('.category-dashboard').scrollBy({ left: -200, behavior: 'smooth' });
            }}>&#8249;</button>
            
            <div className="category-dashboard">
              {[
                { name: "All", icon: "💠" },
                { name: "Medicine", icon: "💊" },
                { name: "Device", icon: "🩺" },
                { name: "Personal Care", icon: "🧴" },
                { name: "Surgicals", icon: "🧤" },
                { name: "First Aid", icon: "🚑" },
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

            <button className="scroll-arrow right" onClick={() => {
              document.querySelector('.category-dashboard').scrollBy({ left: 200, behavior: 'smooth' });
            }}>&#8250;</button>
          </div>
        </div>

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
                <span className="badge-expiry">⏳ Exp: {item.expiry || "2027"}</span>
                {item.requiresPrescription && (
                  <span className="badge-prescription" style={{ background: '#fdf5f5', color: '#e74c3c', padding: '4px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: 'bold' }}>⚠️ Rx Required</span>
                )}
                {item.stockQuantity <= 0 ? (
                  <span className="badge-stock out-of-stock">❌ Out of Stock</span>
                ) : item.stockQuantity <= 10 ? (
                  <span className="badge-stock low-stock">⚠️ Only {item.stockQuantity} left</span>
                ) : (
                  <span className="badge-stock in-stock">✅ {item.stockQuantity} in stock</span>
                )}
              </div>
              <div className="medicines-card-actions" style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button 
                  onClick={() => addToCartFlow(item)}
                  disabled={item.stockQuantity <= 0}
                  className={`${addedItem === item.name ? "added" : ""} ${item.stockQuantity <= 0 ? "disabled-btn" : ""}`}
                  style={{ flex: 1, padding: '8px 4px', fontSize: '0.9rem' }}
                >
                  {item.stockQuantity <= 0 ? "Out of Stock" : (addedItem === item.name ? "✓ Added" : "Add to Cart")}
                </button>
                <button 
                  onClick={() => addToCartFlow(item, true)}
                  disabled={item.stockQuantity <= 0}
                  className={`buy-now-btn ${item.stockQuantity <= 0 ? "disabled-btn" : ""}`}
                  style={{ flex: 1, backgroundColor: item.stockQuantity <= 0 ? '#bdc3c7' : '#e67e22', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: item.stockQuantity <= 0 ? 'not-allowed' : 'pointer', fontSize: '0.9rem', padding: '8px 4px' }}
                >
                  {item.stockQuantity <= 0 ? "Unavailable" : "Buy Now"}
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

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
                  <div className="detail-item">
                    <strong>📦 Availability:</strong> 
                    <p style={{ 
                      color: selectedItem.stockQuantity <= 0 ? '#e74c3c' : (selectedItem.stockQuantity <= 10 ? '#f39c12' : '#27ae60'),
                      fontWeight: 'bold'
                    }}>
                      {selectedItem.stockQuantity <= 0 ? "Currently Out of Stock" : 
                       (selectedItem.stockQuantity <= 10 ? `Low Stock: Only ${selectedItem.stockQuantity} remaining` : `${selectedItem.stockQuantity} Units available`)}
                    </p>
                  </div>
                </div>

                <div className="modal-actions">
                  <button 
                    className={addedItem === selectedItem.name ? "add-btn added" : (selectedItem.stockQuantity <= 0 ? "add-btn disabled-btn" : "add-btn")} 
                    disabled={selectedItem.stockQuantity <= 0}
                    onClick={() => addToCartFlow(selectedItem)}
                  >
                    {selectedItem.stockQuantity <= 0 ? "Out of Stock" : (addedItem === selectedItem.name ? "✓ Added to Cart" : "Add to Cart")}
                  </button>
                  <button 
                    className="buy-now-btn add-btn" 
                    disabled={selectedItem.stockQuantity <= 0}
                    onClick={() => addToCartFlow(selectedItem, true)}
                    style={{ backgroundColor: selectedItem.stockQuantity <= 0 ? '#bdc3c7' : '#e67e22', cursor: selectedItem.stockQuantity <= 0 ? 'not-allowed' : 'pointer' }}
                  >
                    {selectedItem.stockQuantity <= 0 ? "Sold Out" : "Buy Now"}
                  </button>
                  <button 
                    className="modal-wishlist-btn"
                    onClick={() => toggleWishlist(selectedItem)}
                  >
                    {wishlist.some(w => w.name === selectedItem.name) ? "❤️ Remove" : "🤍 Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Upload Interceptor Modal */}
      {showPrescriptionModal && pendingCartItem && (
        <div className="medicine-modal-overlay">
          <div className="medicine-modal" style={{ maxWidth: '420px', padding: '30px' }}>
            <button className="close-modal" onClick={() => { setShowPrescriptionModal(false); setPendingCartItem(null); setPrescriptionFile(null); }}>✖</button>
            <h2 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>⚠️</span> Rx Required
            </h2>
            <p style={{ color: '#555', marginBottom: '20px', fontSize: '14px', lineHeight: '1.5' }}>
              <strong>{pendingCartItem.name}</strong> is a restricted prescription drug. Please upload a valid doctor's note or prescription file to proceed safely.
            </p>
            <form onSubmit={handleUploadPrescription}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Select PDF or Image 📄</label>
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  required 
                  onChange={(e) => setPrescriptionFile(e.target.files[0])}
                  style={{ width: '100%', padding: '12px', border: '2px dashed #1abc9c', borderRadius: '8px', cursor: 'pointer', background: '#f8f9fa' }}
                />
              </div>
              <button 
                type="submit" 
                style={{ width: '100%', background: '#1abc9c', color: 'white', padding: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: 'background 0.2s' }}
              >
                Upload & Continue
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Medicines;
