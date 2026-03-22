import React, { useState } from "react";
import "./Adviser.css";

const medicineRecommendations = {
  fever: {
    medicines: ["Paracetamol 500mg", "Digital Thermometer"],
    advice: "Rest, drink plenty of fluids, and monitor your temperature.",
  },
  headache: {
    medicines: ["Aspirin 100mg", "Paracetamol 500mg"],
    advice: "Rest in a quiet, dark room. Drink water if you are dehydrated.",
  },
  cough: {
    medicines: ["Homeo Cold Drops", "Ayush Kadha"],
    advice: "Drink warm liquids, use a humidifier, or try honey and lemon.",
  },
  cold: {
    medicines: ["Cetirizine", "Homeo Cold Drops", "Ayush Kadha"],
    advice: "Get plenty of rest, stay hydrated, and use saline nasal drops.",
  },
  stomachache: {
    medicines: ["Homeo Digest Syrup", "Triphala Churna"],
    advice: "Eat smaller meals, avoid spicy foods, and drink chamomile tea.",
  },
  allergy: {
    medicines: ["Cetirizine"],
    advice: "Avoid known allergens, keep windows closed during high pollen seasons.",
  },
  pain: {
    medicines: ["Aspirin 100mg", "Paracetamol 500mg"],
    advice: "Apply ice or heat to the affected area, depending on the injury.",
  },
  acidity: {
    medicines: ["Homeo Digest Syrup", "Triphala Churna"],
    advice: "Avoid heavy meals before bed and eat slowly.",
  },
  diabetes: {
    medicines: ["Metformin 500mg", "Glucometer Kit"],
    advice: "Monitor blood sugar regularly and maintain a healthy diet.",
  },
  pressure: {
    medicines: ["Atorvastatin 10mg", "BP Monitor"],
    advice: "Check blood pressure regularly, reduce salt intake, and exercise.",
  },
  injury: {
    medicines: ["Crepe Bandage", "Sterile Gauze"],
    advice: "Clean the wound, apply an antiseptic, and cover it.",
  },
  skin: {
    medicines: ["Face Wash", "Sunscreen SPF 50", "Moisturizing Lotion"],
    advice: "Keep skin clean and always use sunscreen before going out.",
  },
  asthma: {
    medicines: ["Nebulizer Machine", "Pulse Oximeter"],
    advice: "Monitor oxygen levels and use inhaler/nebulizer as prescribed.",
  },
  infection: {
    medicines: ["Amoxicillin", "Hand Sanitizer", "Surgical Mask (50pcs)"],
    advice: "Maintain hygiene, wear a mask, and complete the antibiotic course.",
  },
  pet: {
    medicines: ["Pet Shampoo", "Tick & Flea Spray", "Pet Multivitamins"],
    advice: "Keep your pet clean, check for ticks regularly, and maintain their diet.",
  },
  immunity: {
    medicines: ["Vitamin C Tablets", "Ashwagandha Powder", "Whey Protein 1kg"],
    advice: "Maintain a healthy diet, exercise regularly, and ensure adequate sleep.",
  }
};

function Adviser({ onSelectMedicine }) {
  const [symptom, setSymptom] = useState("");
  const [recommendation, setRecommendation] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    const key = symptom.toLowerCase().trim();
    
    // Simple matching logic
    let found = false;
    for (const [disease, info] of Object.entries(medicineRecommendations)) {
      if (key.includes(disease) || disease.includes(key)) {
        if (key !== "") {
          setRecommendation({ type: disease, ...info });
          found = true;
          break;
        }
      }
    }

    if (!found) {
      if (key !== "") {
        setRecommendation({ notFound: true, query: symptom });
      } else {
        setRecommendation(null);
      }
    }
  };

  return (
    <div className="adviser-container">
      <h2>👨‍⚕️ Quick Doctor Connect</h2>
      <p className="adviser-subtitle">Enter your symptom to get medicine recommendations</p>

      <form className="adviser-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="e.g. fever, headache, cold..."
          value={symptom}
          onChange={(e) => {
            setSymptom(e.target.value);
            if (e.target.value === "") setRecommendation(null);
          }}
        />
        <button type="submit">Get Advice</button>
      </form>

      {recommendation && (
        <div className="adviser-results">
          {recommendation.notFound ? (
            <div className="no-result">
              <p>Sorry, we don't have recommendations for "<strong>{recommendation.query}</strong>" yet.</p>
              <p>Please consult a real doctor for professional medical advice.</p>
            </div>
          ) : (
            <div className="result-card">
              <h3>Recommendations for: <span className="highlight-symptom">{recommendation.type}</span></h3>
              <div className="result-section">
                <h4>💊 Suggested Medicines:</h4>
                <ul>
                  {recommendation.medicines.map((med, index) => (
                    <li 
                      key={index}
                      className="medicine-link"
                      onClick={() => onSelectMedicine && onSelectMedicine(med)}
                    >
                      {med} <span className="arrow">➔</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="result-section">
                <h4>💡 General Advice:</h4>
                <p>{recommendation.advice}</p>
              </div>
              <p className="disclaimer">
                *Disclaimer: This is just an AI suggestion. Please consult a qualified healthcare professional before taking any medication.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Adviser;
