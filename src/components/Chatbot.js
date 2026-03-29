import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Chatbot.css";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [productsData, setProductsData] = useState([]);
  const [latestOrder, setLatestOrder] = useState(null);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load backend data securely for AI native parsing
  useEffect(() => {
    const fetchData = async () => {
      try {
        const medRes = await fetch("http://localhost:5000/api/medicines");
        if (medRes.ok) {
          const mData = await medRes.json();
          setProductsData(mData);
        }
      } catch (err) {
         console.warn("AI Backend Medicine catalog fallback:", err);
      }

      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const ordRes = await fetch("http://localhost:5000/api/orders", {
            headers: { "x-auth-token": token }
          });
          if (ordRes.ok) {
            const oData = await ordRes.json();
            if (oData && oData.length > 0) {
              setLatestOrder(oData[0]);
            }
          }
        } catch (e) {
             let savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
             if(savedOrders.length > 0) setLatestOrder(savedOrders[0]);
        }
      } else {
         let savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
         if(savedOrders.length > 0) setLatestOrder(savedOrders[0]);
      }
    };
    fetchData();
  }, []);

  // Initialize Memory Greeting once
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      let greeting = "Hello! 👋 I’m your AI Health Assistant. How can I help you today?";
      if (latestOrder && latestOrder.OrderItems && latestOrder.OrderItems.length > 0) {
        const lastItemName = latestOrder.OrderItems[0].Medicine?.name || "your previous order";
        greeting += ` I noticed you recently ordered ${lastItemName}. Would you like to buy it again or track your order?`;
      } else if (latestOrder && latestOrder.items && latestOrder.items.length > 0) {
        greeting += ` I noticed you recently ordered ${latestOrder.items[0].name}. Would you like to buy it again or track your order?`;
      }
      setMessages([{ text: greeting, sender: "bot" }]);
      setHasGreeted(true);
    }
  }, [isOpen, hasGreeted, latestOrder]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const handleSend = (textOverride) => {
    const query = typeof textOverride === 'string' ? textOverride : input;
    if (!query.trim()) return;

    const userMessage = { text: query, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    
    // Check type since it could be an event passed natively
    if(typeof textOverride !== 'string') setInput("");
    setIsTyping(true);

    setTimeout(() => {
      generateResponse(query);
    }, 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const levenshtein = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + indicator);
      }
    }
    return matrix[b.length][a.length];
  };

  const fuzzySearch = (query, dbItemName) => {
    const qWords = query.toLowerCase().split(' ');
    const itemWords = dbItemName.toLowerCase().split(' ');
    for (let qw of qWords) {
      if (qw.length < 4) continue;
      for (let iw of itemWords) {
        if (iw.length < 4) continue;
        if (levenshtein(qw, iw) <= 2) return true;
      }
    }
    return false;
  };

  const generateResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    let botResponse = "Sorry, I didn’t understand. Please search in our store or consult a doctor.";
    let suggestedProducts = [];

    // Greeting Logic
    if (/\b(hi|hello|hey)\b/.test(lowerQuery)) {
      botResponse = "Hello! 👋 I’m your AI Health Assistant. How can I help you today?";
    }
    // Advanced Health Tips & Token Logic map
    else if (lowerQuery.includes("cold") || lowerQuery.includes("cough") || lowerQuery.includes("fever")) {
      botResponse = "Drink warm water for cold. I also suggest trying Homeo Cold Drops or Ayush Kadha.";
      suggestedProducts = productsData.filter(p => p.name.includes("Cold Drops") || p.name.includes("Kadha") || lowerQuery.includes(p.name.toLowerCase()));
    } else if (lowerQuery.includes("digestion") || lowerQuery.includes("stomach")) {
      botResponse = "For stomach and digestion issues, I strongly suggest Homeo Digest Syrup or Triphala Churna.";
      suggestedProducts = productsData.filter(p => p.name.includes("Digest") || p.name.includes("Triphala"));
    } else if (lowerQuery.includes("ashwagandha")) {
      botResponse = "Ashwagandha helps reduce stress and improve energy.";
      suggestedProducts = productsData.filter(p => p.name.toLowerCase().includes("ashwagandha"));
    } else if (lowerQuery.includes("pet")) {
      botResponse = "For pets, we have excellent products like Pet Shampoo, Tick & Flea Spray, and Pet Multivitamins.";
      suggestedProducts = productsData.filter(p => p.category === "Pet Care");
    } else if (lowerQuery.includes("fitness") || lowerQuery.includes("gym") || lowerQuery.includes("protein")) {
      botResponse = "For your fitness journey, I highly recommend Whey Protein 1kg, a Fitness Band, or a Yoga Mat.";
      suggestedProducts = productsData.filter(p => p.name.includes("Whey Protein") || p.name.includes("Fitness") || p.name.includes("Yoga Mat") || p.category === "Fitness");
    } else if (lowerQuery.includes("order") || lowerQuery.includes("track")) {
      if (latestOrder) {
        botResponse = `Your latest order #${latestOrder.id} is currently marked securely as: **${latestOrder.status}**. You can view full details natively in the Orders component section.`;
      } else {
        botResponse = "You can track your order natively in the Orders section of the application.";
      }
    } else {
      // Advanced NLP Fuzzy matching fallback
      suggestedProducts = productsData.filter(p => fuzzySearch(lowerQuery, p.name));
      if (suggestedProducts.length > 0) {
         botResponse = `Did you mean one of these products?`;
      }
    }

    // Safety fallback filter slice cap to keep UI clean
    if (suggestedProducts.length > 3) {
      suggestedProducts = suggestedProducts.slice(0, 3);
    }

    setMessages((prev) => [...prev, { text: botResponse, sender: "bot", products: suggestedProducts }]);
    setIsTyping(false);
  };

  const directAddToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const itemToAdd = {
      ...product,
      id: product.id || Math.floor(Math.random() * 10000), // Secure cart identifier mock
      quantity: 1,
      img: product.imageUrl
    };
    
    // Merge or increment correctly based on core Cart logic
    const existingItemIndex = existingCart.findIndex(item => item.name === product.name);
    
    if (existingItemIndex !== -1) {
      existingCart[existingItemIndex].quantity = (existingCart[existingItemIndex].quantity || 1) + 1;
    } else {
      existingCart.push(itemToAdd);
    }
    
    localStorage.setItem("cart", JSON.stringify(existingCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const navToMedicines = (product) => {
    // Specifically intercept router states to cleanly open Product Modals entirely across views 
    navigate("/medicines", { state: { openProduct: product } }); 
  };

  const quickReplies = ["Cold & Cough", "Pet Care", "Fitness", "Track Order", "Digestion"];

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chat-window fade-in-up">
          <div className="chat-header">
            <h3>AI Health Assistant 🤖</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>✖</button>
          </div>
          
          <div className="chat-messages">
            <div className="disclaimer-notice">
              ⚠️ This chatbot provides general information only and is not a substitute for professional medical advice.
            </div>
            
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.sender}`}>
                <div className={`message-bubble ${msg.sender}`}>
                  {msg.text}
                </div>
                {msg.products && msg.products.length > 0 && (
                  <div className="bot-products-scroll">
                    {msg.products.map((p, i) => (
                      <div key={i} className="bot-product-card">
                        <img src={p.imageUrl || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=150"} alt={p.name} />
                        <div className="bpc-info">
                          <h5>{p.name}</h5>
                          <span>₹ {p.price}</span>
                        </div>
                        <div className="bpc-actions">
                          <button className="bpc-btn add" onClick={() => directAddToCart(p)}>+ Cart</button>
                          <button className="bpc-btn view" onClick={() => navToMedicines(p)}>View</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="message-wrapper bot">
                <div className="message-bubble bot typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-quick-replies">
            {quickReplies.map((qr, idx) => (
              <button key={idx} className="qr-btn" onClick={() => handleSend(qr)}>{qr}</button>
            ))}
          </div>

          <div className="chat-input-area">
            <input 
              type="text" 
              placeholder="Type your health query..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSend} className="send-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="white"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {!isOpen && (
        <div className="chat-toggle-btn bounce-in" onClick={() => setIsOpen(true)}>
          <span className="chat-icon">💬</span>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
