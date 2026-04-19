import React, { useState, useMemo } from "react";
import "./Adviser.css";

// ─── Comprehensive medical knowledge base ────────────────────────────────────
const CONDITIONS = [
  {
    id: 'fever',
    label: 'Fever',
    icon: '🤒',
    keywords: ['fever', 'temperature', 'hot', 'burning body', 'pyrexia', 'high temp', 'bukhar'],
    medicines: ['Paracetamol 500mg', 'Digital Thermometer'],
    advice: 'Rest well, drink plenty of fluids, sponge with lukewarm water, and monitor temperature every 4 hours. Seek medical help if temperature exceeds 103°F.',
    severity: 'mild',
    specialist: 'General Physician',
  },
  {
    id: 'headache',
    label: 'Headache / Migraine',
    icon: '🤕',
    keywords: ['headache', 'head pain', 'migraine', 'head ache', 'temple pain', 'forehead pain', 'head hurts', 'head throbbing'],
    medicines: ['Aspirin 100mg', 'Paracetamol 500mg'],
    advice: 'Rest in a quiet, dark room. Stay hydrated, avoid screen time, and apply a cold compress on your forehead. Persistent migraines may need prescription medication.',
    severity: 'mild',
    specialist: 'Neurologist',
  },
  {
    id: 'cough',
    label: 'Cough / Sore Throat',
    icon: '😷',
    keywords: ['cough', 'sore throat', 'throat pain', 'dry cough', 'wet cough', 'itchy throat', 'phlegm', 'mucus', 'gala kharab'],
    medicines: ['Homeo Cold Drops', 'Ayush Kadha', 'Vitamin C Tablets'],
    advice: 'Gargle with warm salt water, drink warm fluids (ginger/honey tea), use cough drops, and avoid cold beverages. See a doctor if cough lasts more than 2 weeks.',
    severity: 'mild',
    specialist: 'ENT Specialist',
  },
  {
    id: 'cold',
    label: 'Common Cold / Flu',
    icon: '🤧',
    keywords: ['cold', 'flu', 'sneezing', 'running nose', 'runny nose', 'blocked nose', 'nasal congestion', 'stuffy nose', 'influenza', 'sardi'],
    medicines: ['Cetirizine', 'Homeo Cold Drops', 'Ayush Kadha', 'Vitamin C Tablets'],
    advice: 'Rest, stay hydrated, use steam inhalation, and saline nasal drops. Eat warm nutritious food and avoid cold environments.',
    severity: 'mild',
    specialist: 'General Physician',
  },
  {
    id: 'stomachache',
    label: 'Stomach Ache / Digestion',
    icon: '🤢',
    keywords: ['stomach', 'stomach ache', 'stomachache', 'stomach pain', 'belly pain', 'abdominal pain', 'tummy ache', 'cramps', 'bloating', 'gas', 'indigestion', 'nausea', 'pet dard'],
    medicines: ['Homeo Digest Syrup', 'Triphala Churna'],
    advice: 'Eat small frequent meals, avoid spicy and oily foods, drink chamomile or ginger tea. Apply a warm compress on the abdomen. Seek help if pain is severe or persistent.',
    severity: 'moderate',
    specialist: 'Gastroenterologist',
  },
  {
    id: 'allergy',
    label: 'Allergy / Rashes',
    icon: '🤧',
    keywords: ['allergy', 'allergic', 'rash', 'rashes', 'hives', 'itching', 'itchy', 'hay fever', 'pollen', 'dust allergy', 'food allergy', 'swelling'],
    medicines: ['Cetirizine'],
    advice: 'Identify and avoid allergens, keep windows closed during pollen season, use air purifiers, and wear a mask outdoors. For severe reactions (difficulty breathing), seek emergency help immediately.',
    severity: 'moderate',
    specialist: 'Allergist / Immunologist',
  },
  {
    id: 'pain',
    label: 'Body Pain / Muscle Pain',
    icon: '💪',
    keywords: ['pain', 'body pain', 'muscle pain', 'body ache', 'joint pain', 'back pain', 'knee pain', 'shoulder pain', 'neck pain', 'leg pain', 'arm pain', 'sprain', 'soreness'],
    medicines: ['Aspirin 100mg', 'Paracetamol 500mg', 'Crepe Bandage'],
    advice: 'Apply ice for the first 48 hours, then switch to heat therapy. Gentle stretching and rest are essential. OTC pain relievers can help — see a doctor if pain persists beyond a week.',
    severity: 'mild',
    specialist: 'Orthopedic',
  },
  {
    id: 'acidity',
    label: 'Acidity / Heartburn',
    icon: '🔥',
    keywords: ['acidity', 'acid reflux', 'heartburn', 'gastric', 'gerd', 'burning chest', 'sour taste', 'burping', 'acid'],
    medicines: ['Homeo Digest Syrup', 'Triphala Churna'],
    advice: 'Avoid lying down immediately after eating, reduce spicy/fried food intake, eat dinner at least 2 hours before bed. Elevate your head while sleeping. Drink cold milk for temporary relief.',
    severity: 'mild',
    specialist: 'Gastroenterologist',
  },
  {
    id: 'diabetes',
    label: 'Diabetes / Blood Sugar',
    icon: '🩸',
    keywords: ['diabetes', 'sugar', 'blood sugar', 'glucose', 'high sugar', 'diabetic', 'insulin', 'type 2', 'type 1', 'madhumeh'],
    medicines: ['Metformin 500mg', 'Glucometer Kit'],
    advice: 'Monitor blood sugar levels regularly, maintain a balanced diet low in refined carbs, exercise 30 min daily, take medications on time, and schedule regular HbA1c tests.',
    severity: 'chronic',
    specialist: 'Endocrinologist',
  },
  {
    id: 'pressure',
    label: 'Blood Pressure / Hypertension',
    icon: '❤️‍🩹',
    keywords: ['blood pressure', 'bp', 'hypertension', 'high bp', 'low bp', 'pressure', 'high blood pressure', 'low blood pressure'],
    medicines: ['Atorvastatin 10mg', 'BP Monitor'],
    advice: 'Monitor BP daily, reduce salt and processed food intake, exercise regularly, manage stress through meditation, limit alcohol, and take prescribed medications consistently.',
    severity: 'chronic',
    specialist: 'Cardiologist',
  },
  {
    id: 'injury',
    label: 'Injury / Wound Care',
    icon: '🩹',
    keywords: ['injury', 'wound', 'cut', 'bruise', 'scratch', 'bleeding', 'burn', 'fracture', 'chot'],
    medicines: ['Crepe Bandage', 'Sterile Gauze', 'Hand Sanitizer'],
    advice: 'Clean the wound with running water, apply antiseptic, cover with sterile bandage. For deep cuts or suspected fractures, visit the nearest hospital immediately.',
    severity: 'moderate',
    specialist: 'General Surgeon',
  },
  {
    id: 'skin',
    label: 'Skin Care / Dermatology',
    icon: '🧴',
    keywords: ['skin', 'acne', 'pimple', 'pimples', 'dry skin', 'oily skin', 'dark spots', 'sunburn', 'eczema', 'dermatitis', 'psoriasis', 'skin care', 'complexion'],
    medicines: ['Face Wash', 'Sunscreen SPF 50', 'Moisturizing Lotion'],
    advice: 'Cleanse twice daily, always wear SPF 30+ sunscreen, moisturize regularly, stay hydrated, and avoid touching your face. Consult a dermatologist for persistent issues.',
    severity: 'mild',
    specialist: 'Dermatologist',
  },
  {
    id: 'asthma',
    label: 'Asthma / Breathing Issues',
    icon: '🫁',
    keywords: ['asthma', 'breathing', 'breathless', 'shortness of breath', 'wheezing', 'chest tightness', 'bronchitis', 'saans', 'oxygen'],
    medicines: ['Nebulizer Machine', 'Pulse Oximeter'],
    advice: 'Monitor oxygen levels with a pulse oximeter, use nebulizer as prescribed, avoid smoke/dust/pollution triggers, always carry your emergency inhaler.',
    severity: 'chronic',
    specialist: 'Pulmonologist',
  },
  {
    id: 'infection',
    label: 'Infection / Hygiene',
    icon: '🦠',
    keywords: ['infection', 'bacterial', 'viral', 'fungal', 'hygiene', 'antibiotics', 'septic', 'pus', 'swollen glands'],
    medicines: ['Amoxicillin', 'Hand Sanitizer', 'Surgical Mask (50pcs)'],
    advice: 'Complete the full course of antibiotics, maintain good hand hygiene, wear masks in crowded places, and keep infected areas clean and dry.',
    severity: 'moderate',
    specialist: 'Infectious Disease Specialist',
  },
  {
    id: 'immunity',
    label: 'Immunity / Wellness',
    icon: '🛡️',
    keywords: ['immunity', 'immune', 'weakness', 'fatigue', 'tired', 'tiredness', 'energy', 'vitamin', 'supplement', 'low energy', 'lethargy', 'weakness'],
    medicines: ['Vitamin C Tablets', 'Ashwagandha Powder', 'Whey Protein 1kg'],
    advice: 'Eat a balanced diet rich in fruits and vegetables, sleep 7-8 hours, exercise regularly, stay hydrated, and manage stress levels.',
    severity: 'mild',
    specialist: 'General Physician',
  },
  {
    id: 'eye',
    label: 'Eye Problems',
    icon: '👁️',
    keywords: ['eye', 'eyes', 'vision', 'blurry', 'red eye', 'dry eyes', 'watery eyes', 'eye pain', 'eye strain', 'spectacles', 'sight'],
    medicines: ['Face Wash'],
    advice: 'Follow the 20-20-20 rule (every 20 min, look 20 ft away for 20 sec), reduce screen brightness, use lubricating eye drops, and wear UV-protective sunglasses outdoors.',
    severity: 'mild',
    specialist: 'Ophthalmologist',
  },
  {
    id: 'dental',
    label: 'Dental / Tooth Pain',
    icon: '🦷',
    keywords: ['dental', 'tooth', 'toothache', 'tooth pain', 'cavity', 'gum', 'gums bleeding', 'mouth pain', 'dant dard'],
    medicines: ['Paracetamol 500mg'],
    advice: 'Rinse with warm salt water, use clove oil for temporary relief, avoid very hot or cold foods, and visit a dentist as soon as possible.',
    severity: 'moderate',
    specialist: 'Dentist',
  },
  {
    id: 'anxiety',
    label: 'Stress / Anxiety / Sleep',
    icon: '😰',
    keywords: ['anxiety', 'stress', 'tension', 'nervous', 'panic', 'depression', 'sad', 'insomnia', 'sleep', 'cant sleep', 'sleepless', 'mental health', 'overthinking'],
    medicines: ['Ashwagandha Powder'],
    advice: 'Practice deep breathing exercises, maintain a regular sleep schedule, limit caffeine after 2 PM, exercise daily, try meditation or yoga. Reach out to a mental health professional if symptoms persist.',
    severity: 'moderate',
    specialist: 'Psychiatrist / Psychologist',
  },
  {
    id: 'diarrhea',
    label: 'Diarrhea / Loose Motion',
    icon: '🚽',
    keywords: ['diarrhea', 'diarrhoea', 'loose motion', 'loose stool', 'watery stool', 'food poisoning', 'dehydration', 'vomiting', 'ulti', 'dast'],
    medicines: ['Homeo Digest Syrup', 'Triphala Churna'],
    advice: 'Stay hydrated with ORS (oral rehydration solution), eat the BRAT diet (bananas, rice, applesauce, toast), avoid dairy and heavy foods. Seek medical help if symptoms persist beyond 48 hours.',
    severity: 'moderate',
    specialist: 'Gastroenterologist',
  },
  {
    id: 'urinary',
    label: 'Urinary / UTI',
    icon: '🚰',
    keywords: ['urinary', 'uti', 'urine', 'burning urine', 'frequent urination', 'bladder', 'kidney stone', 'kidney', 'peshab'],
    medicines: ['Amoxicillin'],
    advice: 'Drink 8-10 glasses of water daily, don\'t hold urine for long, consume cranberry juice, maintain hygiene, and complete the full antibiotic course if prescribed.',
    severity: 'moderate',
    specialist: 'Urologist / Nephrologist',
  },
  {
    id: 'pregnancy',
    label: "Women's Health / Period Issues",
    icon: '👩‍⚕️',
    keywords: ['period', 'periods', 'menstrual', 'cramps', 'irregular periods', 'pcos', 'pcod', 'womens health', 'pregnancy', 'pregnant', 'prenatal'],
    medicines: ['Paracetamol 500mg'],
    advice: 'Maintain a healthy lifestyle, track your menstrual cycle, use a heating pad for cramps, exercise regularly, and consult a gynecologist for persistent irregularities or PCOS.',
    severity: 'moderate',
    specialist: 'Gynecologist',
  },
  {
    id: 'heart',
    label: 'Heart / Chest Pain',
    icon: '❤️',
    keywords: ['heart', 'chest pain', 'chest', 'palpitation', 'heartbeat', 'heart attack', 'cardiac', 'cholesterol', 'heart burn'],
    medicines: ['Atorvastatin 10mg', 'BP Monitor', 'Pulse Oximeter'],
    advice: '⚠️ Chest pain can be a medical emergency — call your emergency number if pain is severe. For mild cases: reduce stress, exercise regularly, monitor cholesterol, and follow a heart-healthy diet.',
    severity: 'severe',
    specialist: 'Cardiologist',
  },
  {
    id: 'thyroid',
    label: 'Thyroid Issues',
    icon: '🦋',
    keywords: ['thyroid', 'hypothyroid', 'hyperthyroid', 'tsh', 'weight gain', 'weight loss unexplained', 'thyroid gland'],
    medicines: ['Glucometer Kit'],
    advice: 'Get TSH levels tested regularly, take thyroid medication on an empty stomach (30 min before breakfast), monitor weight changes, and maintain an iodine-balanced diet.',
    severity: 'chronic',
    specialist: 'Endocrinologist',
  },
  {
    id: 'pet',
    label: 'Pet Health / Vet Care',
    icon: '🐾',
    keywords: ['pet', 'dog', 'cat', 'pet health', 'vet', 'tick', 'flea', 'pet care', 'animal'],
    medicines: ['Pet Shampoo', 'Tick & Flea Spray', 'Pet Multivitamins'],
    advice: 'Ensure regular vet checkups, keep vaccinations up to date, check for ticks/fleas regularly, maintain proper diet and hygiene, and provide regular exercise.',
    severity: 'mild',
    specialist: 'Veterinarian',
  },
];

// Quick-pick chip categories
const CHIP_CATEGORIES = [
  { label: '🤒 Fever',           conditionId: 'fever' },
  { label: '🤕 Headache',        conditionId: 'headache' },
  { label: '🤧 Cold & Flu',      conditionId: 'cold' },
  { label: '🤢 Stomach',         conditionId: 'stomachache' },
  { label: '💪 Body Pain',       conditionId: 'pain' },
  { label: '😷 Cough',           conditionId: 'cough' },
  { label: '🔥 Acidity',         conditionId: 'acidity' },
  { label: '🤧 Allergy',         conditionId: 'allergy' },
  { label: '🩸 Diabetes',        conditionId: 'diabetes' },
  { label: '❤️ Heart / BP',      conditionId: 'pressure' },
  { label: '🫁 Breathing',       conditionId: 'asthma' },
  { label: '😰 Stress / Sleep',  conditionId: 'anxiety' },
  { label: '🦷 Dental',          conditionId: 'dental' },
  { label: '👁️ Eye',             conditionId: 'eye' },
  { label: '🧴 Skin',            conditionId: 'skin' },
  { label: '🩹 Injury',          conditionId: 'injury' },
  { label: '🚽 Diarrhea',        conditionId: 'diarrhea' },
  { label: '👩‍⚕️ Women\'s Health', conditionId: 'pregnancy' },
  { label: '🛡️ Immunity',        conditionId: 'immunity' },
  { label: '🐾 Pet Care',        conditionId: 'pet' },
];

const SEVERITY_META = {
  mild:     { label: 'Mild',    color: '#16a34a', bg: '#f0fdf4' },
  moderate: { label: 'Moderate',color: '#d97706', bg: '#fffbeb' },
  severe:   { label: 'Urgent',  color: '#dc2626', bg: '#fef2f2' },
  chronic:  { label: 'Chronic', color: '#7c3aed', bg: '#f5f3ff' },
};

function Adviser({ onSelectMedicine }) {
  const [symptom, setSymptom] = useState("");
  const [result, setResult] = useState(null);  // { condition } or { notFound, query }

  // Smart matching — checks all keywords, supports partial & multi-word input
  const findCondition = (query) => {
    const q = query.toLowerCase().trim();
    if (!q) return null;

    // Exact ID match first
    const exactId = CONDITIONS.find(c => c.id === q);
    if (exactId) return exactId;

    // Keyword match (any keyword appears in query, or query appears in any keyword)
    const words = q.split(/\s+/);
    let bestMatch = null;
    let bestScore = 0;

    for (const condition of CONDITIONS) {
      let score = 0;
      for (const kw of condition.keywords) {
        if (q === kw) { score += 10; break; }          // exact keyword match
        if (q.includes(kw)) score += 5;                 // query contains keyword
        if (kw.includes(q)) score += 4;                 // keyword contains query
        for (const w of words) {
          if (w.length >= 3 && kw.includes(w)) score += 2;  // word-level partial
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = condition;
      }
    }
    return bestScore >= 2 ? bestMatch : null;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const condition = findCondition(symptom);
    if (condition) {
      setResult({ condition });
    } else if (symptom.trim()) {
      setResult({ notFound: true, query: symptom });
    } else {
      setResult(null);
    }
  };

  const handleChipClick = (conditionId) => {
    const condition = CONDITIONS.find(c => c.id === conditionId);
    if (condition) {
      setSymptom(condition.label);
      setResult({ condition });
    }
  };

  const sev = result?.condition ? SEVERITY_META[result.condition.severity] : null;

  return (
    <div className="adviser-container">
      <div className="adviser-header">
        <h2>👨‍⚕️ Quick Doctor Connect</h2>
        <p className="adviser-subtitle">
          Describe your symptom — we support <strong>{CONDITIONS.length}+ conditions</strong> with smart matching
        </p>
      </div>

      {/* Search */}
      <form className="adviser-search" onSubmit={handleSearch}>
        <div className="adviser-input-wrap">
          <span className="adviser-input-icon">🔍</span>
          <input
            type="text"
            placeholder="Type any symptom — e.g. chest pain, acne, can't sleep, stomach..."
            value={symptom}
            onChange={(e) => {
              setSymptom(e.target.value);
              if (e.target.value === "") setResult(null);
            }}
          />
        </div>
        <button type="submit">Get Advice</button>
      </form>

      {/* Quick pick chips — only when no result */}
      {!result && (
        <div className="adviser-chips-section">
          <p className="adviser-chips-label">Or tap a common condition:</p>
          <div className="adviser-chips-grid">
            {CHIP_CATEGORIES.map(chip => (
              <button
                key={chip.conditionId}
                type="button"
                className="adviser-chip"
                onClick={() => handleChipClick(chip.conditionId)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="adviser-results">
          {result.notFound ? (
            <div className="no-result">
              <div className="no-result-icon">🔍</div>
              <h4>No exact match for "<strong>{result.query}</strong>"</h4>
              <p>Try a different keyword, or pick from the conditions below.</p>
              <div className="adviser-chips-grid" style={{ marginTop: '16px' }}>
                {CHIP_CATEGORIES.slice(0, 10).map(chip => (
                  <button
                    key={chip.conditionId}
                    type="button"
                    className="adviser-chip"
                    onClick={() => handleChipClick(chip.conditionId)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="result-card">
              {/* Header */}
              <div className="result-header">
                <div className="result-title-row">
                  <span className="result-icon">{result.condition.icon}</span>
                  <div>
                    <h3>{result.condition.label}</h3>
                    <div className="result-badges">
                      {sev && (
                        <span className="result-badge" style={{ background: sev.bg, color: sev.color }}>
                          {sev.label}
                        </span>
                      )}
                      <span className="result-badge specialist-badge">
                        🩺 {result.condition.specialist}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  className="result-close"
                  onClick={() => { setResult(null); setSymptom(""); }}
                  title="Clear"
                >✕</button>
              </div>

              {/* Advice */}
              <div className="result-section advice-section">
                <h4>💡 Doctor's Advice</h4>
                <p>{result.condition.advice}</p>
              </div>

              {/* Medicines */}
              <div className="result-section">
                <h4>💊 Suggested Products</h4>
                <ul>
                  {result.condition.medicines.map((med, index) => (
                    <li
                      key={index}
                      className="medicine-link"
                      onClick={() => onSelectMedicine && onSelectMedicine(med)}
                    >
                      <span>{med}</span>
                      <span className="arrow">View →</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="disclaimer">
                ⚠️ This is health guidance, not a diagnosis. Always consult a qualified healthcare professional before taking any medication.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Adviser;
