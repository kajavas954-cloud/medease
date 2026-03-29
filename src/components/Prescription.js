import React, { useState, useEffect } from "react";
import { useToast } from "./ToastProvider";
import "./Prescription.css";

function Prescription() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Debounced API call — waits 500ms after user stops typing
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token || searchTerm.trim() === "") {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    const debounceTimer = setTimeout(() => {
      setLoading(true);
      fetch(`http://localhost:5000/api/prescriptions?q=${encodeURIComponent(searchTerm.trim())}`, {
        headers: { "x-auth-token": token },
        signal: controller.signal
      })
        .then(res => res.ok ? res.json() : [])
        .then(data => { setResults(data); setLoading(false); })
        .catch(err => { if (err.name !== 'AbortError') setLoading(false); });
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [searchTerm]);

  const handleShare = (rx) => {
    const shareText = `Digital Prescription: ${rx.rxId}\nMedicine: ${rx.medicine}\nDosage: ${rx.dosage}\nPrescribed by: ${rx.doctor}\nValid Till: ${rx.validTill}`;
    navigator.clipboard.writeText(shareText)
      .then(() => toast("Prescription copied to clipboard!"))
      .catch(() => toast("Failed to copy prescription.", "error"));
  };

  return (
    <div className="prescription-container">
      <div className="rx-header">
        <h2>📝 My Prescriptions</h2>
        <p>Manage, view, and share your digital medical prescriptions seamlessly.</p>
      </div>

      <div className="rx-search">
        <input
          type="text"
          placeholder="Type a medicine name, doctor, or diagnosis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {loading && <span style={{ marginLeft: '10px', color: '#1abc9c', fontSize: '13px' }}>Searching...</span>}
      </div>

      <div className="rx-grid">
        {searchTerm.trim() === "" ? (
          <div className="rx-empty">
            <h3>🔒 Prescriptions Locked</h3>
            <p>Please enter a medicine name, device, or doctor name to securely view your prescriptions.</p>
          </div>
        ) : results.length === 0 && !loading ? (
          <div className="rx-empty">
            <h3>No prescriptions found for "{searchTerm}"</h3>
            <p>Try searching by a different medicine or doctor name.</p>
          </div>
        ) : (
          results.map((rx) => (
            <div className="rx-card" key={rx.rxId}>
              <div className="rx-card-top">
                <span className="rx-id">{rx.rxId}</span>
                <span className={`rx-status ${rx.status ? rx.status.toLowerCase() : 'active'}`}>{rx.status}</span>
              </div>

              <h3 className="rx-medName">{rx.medicine}</h3>

              <div className="rx-details">
                <div className="rx-row">
                  <span>👨‍⚕️ Doctor:</span>
                  <strong>{rx.doctor}</strong>
                </div>
                <div className="rx-row">
                  <span>📅 Date:</span>
                  <strong>{rx.date}</strong>
                </div>
                <div className="rx-row">
                  <span>🩺 Diagnosis:</span>
                  <strong>{rx.diagnosis}</strong>
                </div>
                <div className="rx-dosage-box">
                  <strong>⭐ Verified Instructions:</strong>
                  <p>{rx.dosage}</p>
                </div>
              </div>

              <div className="rx-actions">
                <button className="rx-share-btn" onClick={() => handleShare(rx)}>
                  📤 Copy & Share Prescription
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Prescription;


