import React, { useState } from "react";
import "./Prescription.css";

const mockPrescriptions = [
  // Medicines
  { id: "RX-10029", medicine: "Paracetamol 500mg", patient: "Alex Johnson", doctor: "Dr. Sarah Smith", date: "2023-10-15", dosage: "1 tablet every 8 hours after meals", diagnosis: "Viral Fever", validTill: "2023-11-15", status: "Active" },
  { id: "RX-10034", medicine: "Vitamin C Tablets", patient: "Alex Johnson", doctor: "Dr. Emily Chen", date: "2024-01-01", dosage: "1 tablet daily after breakfast", diagnosis: "Immunity Booster", validTill: "2024-12-31", status: "Active" },
  { id: "RX-10030", medicine: "Amoxicillin", patient: "Alex Johnson", doctor: "Dr. Rahul Sharma", date: "2023-10-12", dosage: "500mg every 12 hours for 5 days", diagnosis: "Throat Infection", validTill: "2023-10-17", status: "Completed" },
  { id: "RX-10045", medicine: "Cetirizine", patient: "Alex Johnson", doctor: "Dr. Anil Gupta", date: "2024-02-10", dosage: "1 tablet at night before sleep", diagnosis: "Allergic Rhinitis", validTill: "2024-03-10", status: "Active" },
  { id: "RX-10046", medicine: "Aspirin 100mg", patient: "Alex Johnson", doctor: "Dr. Peter Norton", date: "2023-11-05", dosage: "1 tablet daily after food", diagnosis: "Heart Care Preventative", validTill: "2024-11-05", status: "Active" },
  { id: "RX-10047", medicine: "Metformin 500mg", patient: "Alex Johnson", doctor: "Dr. Priya Patel", date: "2024-01-15", dosage: "1 tablet twice a day with meals", diagnosis: "Type 2 Diabetes", validTill: "2024-07-15", status: "Active" },
  { id: "RX-10048", medicine: "Atorvastatin 10mg", patient: "Alex Johnson", doctor: "Dr. Peter Norton", date: "2024-01-15", dosage: "1 tablet daily at night", diagnosis: "High Cholesterol", validTill: "2024-07-15", status: "Active" },
  // Devices
  { id: "DEV-2001", medicine: "Digital Thermometer", patient: "Alex Johnson", doctor: "Dr. Sarah Smith", date: "2023-12-01", dosage: "Use under tongue or armpit when fever suspected", diagnosis: "Home Monitoring", validTill: "Lifetime", status: "Completed" },
  { id: "DEV-2002", medicine: "BP Monitor", patient: "Alex Johnson", doctor: "Dr. Peter Norton", date: "2023-12-01", dosage: "Check BP twice weekly morning and night", diagnosis: "Hypertension Monitoring", validTill: "Lifetime", status: "Active" },
  { id: "DEV-2003", medicine: "Pulse Oximeter", patient: "Alex Johnson", doctor: "Dr. Rahul Sharma", date: "2023-10-12", dosage: "Check O2 levels if experiencing shortness of breath", diagnosis: "Respiratory Monitoring", validTill: "Lifetime", status: "Active" },
  { id: "DEV-2004", medicine: "Glucometer Kit", patient: "Alex Johnson", doctor: "Dr. Priya Patel", date: "2024-01-15", dosage: "Check fasting blood sugar every Monday", diagnosis: "Type 2 Diabetes Monitoring", validTill: "Lifetime", status: "Active" },
  { id: "DEV-2005", medicine: "Nebulizer Machine", patient: "Alex Johnson", doctor: "Dr. Anil Gupta", date: "2024-02-10", dosage: "Use with prescribed respules twice daily during flare-ups", diagnosis: "Asthma/Rhinitis", validTill: "Lifetime", status: "Active" },
  // Personal Care
  { id: "PC-3001", medicine: "Face Wash", patient: "Alex Johnson", doctor: "Dr. Olivia Dermat", date: "2024-02-20", dosage: "Wash face twice daily (morning & night)", diagnosis: "Acne Control", validTill: "2024-08-20", status: "Active" },
  { id: "PC-3002", medicine: "Hand Sanitizer", patient: "Alex Johnson", doctor: "Self Prescribed", date: "2024-01-01", dosage: "Apply palmful to hands briskly until dry", diagnosis: "Hygiene", validTill: "N/A", status: "Active" },
  { id: "PC-3003", medicine: "Sunscreen SPF 50", patient: "Alex Johnson", doctor: "Dr. Olivia Dermat", date: "2024-02-20", dosage: "Apply 20 mins before sun exposure, reapply every 3 hrs", diagnosis: "UV Protection", validTill: "2024-08-20", status: "Active" },
  { id: "PC-3004", medicine: "Moisturizing Lotion", patient: "Alex Johnson", doctor: "Dr. Olivia Dermat", date: "2024-02-20", dosage: "Apply generously post shower on damp skin", diagnosis: "Dry Skin Care", validTill: "2024-08-20", status: "Active" },
  // Surgicals
  { id: "SUR-4001", medicine: "Surgical Mask (50pcs)", patient: "Alex Johnson", doctor: "Preventative", date: "2024-01-10", dosage: "Wear standard 3-ply when visiting clinics", diagnosis: "Infection Prevention", validTill: "N/A", status: "Active" },
  { id: "SUR-4002", medicine: "Crepe Bandage", patient: "Alex Johnson", doctor: "Dr. Ortho Singh", date: "2024-03-01", dosage: "Wrap firmly around sprained ankle, remove while sleeping", diagnosis: "Ankle Sprain", validTill: "2024-04-01", status: "Active" },
  { id: "SUR-4003", medicine: "Sterile Gauze", patient: "Alex Johnson", doctor: "Dr. Ortho Singh", date: "2024-03-01", dosage: "Use to dress wound daily with antiseptic", diagnosis: "Wound Care", validTill: "2024-04-01", status: "Active" },
  // Fitness
  { id: "FIT-5001", medicine: "Fitness Band", patient: "Alex Johnson", doctor: "Dietitian Mark", date: "2024-01-05", dosage: "Wear daily. Target 10,000 steps minimum", diagnosis: "Weight Management", validTill: "Lifetime", status: "Active" },
  { id: "FIT-5002", medicine: "Whey Protein 1kg", patient: "Alex Johnson", doctor: "Dietitian Mark", date: "2024-01-05", dosage: "1 scoop post-workout with water", diagnosis: "Muscle Recovery", validTill: "2024-06-05", status: "Active" },
  { id: "FIT-5003", medicine: "Yoga Mat", patient: "Alex Johnson", doctor: "Physical Trainer", date: "2024-01-05", dosage: "Use for 30 minutes morning stretching routine", diagnosis: "Flexibility & Core", validTill: "Lifetime", status: "Active" },
  // Pet Care
  { id: "PET-6001", medicine: "Pet Shampoo", patient: "Max (Dog)", doctor: "Vet Dr. Barker", date: "2024-02-15", dosage: "Bathe once every 15 days", diagnosis: "Flea Prevention & Hygiene", validTill: "2025-02-15", status: "Active" },
  { id: "PET-6002", medicine: "Tick & Flea Spray", patient: "Max (Dog)", doctor: "Vet Dr. Barker", date: "2024-02-15", dosage: "Spray lightly on coat before parks. Avoid eyes.", diagnosis: "Tick Infestation Preventative", validTill: "2024-08-15", status: "Active" },
  { id: "PET-6003", medicine: "Pet Multivitamins", patient: "Max (Dog)", doctor: "Vet Dr. Barker", date: "2024-02-15", dosage: "1 chewable tablet daily with dinner", diagnosis: "Joint & Coat Health", validTill: "2024-05-15", status: "Active" },
  // Ayush & Homeopathy
  { id: "AYU-7001", medicine: "Ayush Kadha", patient: "Alex Johnson", doctor: "Ayurvedic Dr. Rao", date: "2023-11-20", dosage: "1 cup warm decoction early morning empty stomach", diagnosis: "Immune Support", validTill: "2024-05-20", status: "Completed" },
  { id: "AYU-7002", medicine: "Ashwagandha Powder", patient: "Alex Johnson", doctor: "Ayurvedic Dr. Rao", date: "2024-02-01", dosage: "1 tsp with warm milk before bedtime", diagnosis: "Stress & Sleep Management", validTill: "2024-08-01", status: "Active" },
  { id: "AYU-7003", medicine: "Triphala Churna", patient: "Alex Johnson", doctor: "Ayurvedic Dr. Rao", date: "2024-02-01", dosage: "1 tsp with warm water post dinner", diagnosis: "Digestive Health", validTill: "2024-08-01", status: "Active" },
  { id: "HOM-8001", medicine: "Homeo Cold Drops", patient: "Alex Johnson", doctor: "Homeopath Dr. Hahn", date: "2023-12-10", dosage: "10 drops in 1/4 cup water thrice daily", diagnosis: "Acute Coryza", validTill: "2023-12-25", status: "Completed" },
  { id: "HOM-8002", medicine: "Homeo Digest Syrup", patient: "Alex Johnson", doctor: "Homeopath Dr. Hahn", date: "2024-03-10", dosage: "2 teaspoons before major meals", diagnosis: "Gastric Disturbance", validTill: "2024-05-10", status: "Active" }
];

function Prescription() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleShare = (rx) => {
    const shareText = `Digital Prescription: ${rx.id}\nPatient: ${rx.patient}\nMedicine: ${rx.medicine}\nDosage: ${rx.dosage}\nPrescribed by: ${rx.doctor}\nValid Till: ${rx.validTill}`;
    navigator.clipboard.writeText(shareText)
      .then(() => alert("✅ Prescription securely copied to clipboard! Ready to share via WhatsApp or Email."))
      .catch(() => alert("❌ Failed to copy prescription."));
  };

  // STRICT SEARCHING: Empty screen if searchTerm is empty!
  const filteredRx = searchTerm.trim() === "" 
    ? [] 
    : mockPrescriptions.filter(rx => 
        rx.medicine.toLowerCase().includes(searchTerm.toLowerCase()) || 
        rx.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="prescription-container">
      <div className="rx-header">
        <h2>📝 My Prescriptions</h2>
        <p>Manage, view, and share your digital medical prescriptions seamlessly.</p>
      </div>

      <div className="rx-search">
        <input 
          type="text" 
          placeholder="Type a medicine name to securely unlock its prescription..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rx-grid">
        {searchTerm.trim() === "" ? (
          <div className="rx-empty">
            <h3>🔒 Prescriptions Locked</h3>
            <p>Please enter a medicine name, device, or product in the search bar above to securely view its assigned prescription and dosage instructions.</p>
          </div>
        ) : filteredRx.length === 0 ? (
          <div className="rx-empty">
            <h3>No specific prescriptions found for "{searchTerm}"</h3>
            <p>Try searching for another medicine or doctor name.</p>
          </div>
        ) : (
          filteredRx.map((rx) => (
            <div className="rx-card" key={rx.id}>
              <div className="rx-card-top">
                <span className="rx-id">{rx.id}</span>
                <span className={`rx-status ${rx.status.toLowerCase()}`}>{rx.status}</span>
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
