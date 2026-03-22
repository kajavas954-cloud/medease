import React, { useState, useEffect } from "react";
import "./Wishlist.css"; 

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

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [addedItem, setAddedItem] = useState(null);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(list);
  }, []);

  const removeFromWishlist = (name) => {
    const updated = wishlist.filter(item => item.name !== name);
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
    
    setAddedItem(product.name);
    setTimeout(() => setAddedItem(null), 2000);
  };

  return (
    <div className="wishlist-container">
      <h2>❤️ Your Saved Collection</h2>
      
      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <h3>Your wishlist is empty</h3>
          <p>Go to the Medicines tab to discover and save products!</p>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((item, i) => (
            <div className="wishlist-card" key={i}>
              <button 
                className="remove-heart-btn" 
                onClick={() => removeFromWishlist(item.name)}
                title="Remove from Wishlist"
              >
                ❤️
              </button>
              
              <img
                src={categoryImages[item.category] || categoryImages.Medicine}
                alt={item.name}
              />
              
              <h4>{item.name}</h4>
              
              <div className="w-rating">
                {"★".repeat(Math.floor(item.rating))}
                <span>{item.rating} ({item.reviews})</span>
              </div>
              
              <p className="w-price">₹ {item.price}</p>
              <p className="w-cat">{item.category}</p>
              
              <button 
                onClick={() => addToCart(item)}
                className={`add-btn ${addedItem === item.name ? "added" : ""}`}
              >
                {addedItem === item.name ? "✓ Added to Cart" : "Add to Cart"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
