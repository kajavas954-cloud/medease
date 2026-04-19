import React, { useState, useEffect, useRef } from 'react';
import { useToast } from './ToastProvider';
import PaymentSuccessPopup from './PaymentSuccessPopup';
import './Appointments.css';

// ─── Data ────────────────────────────────────────────────────────────────────
const SERVICES = [
  { id: 'full-checkup', name: 'Full Body\nCheckup',  icon: '🏥' },
  { id: 'diabetes',     name: 'Diabetes\nCheck',      icon: '🩺' },
  { id: 'heart',        name: 'Heart\nHealth',         icon: '❤️' },
  { id: 'blood-test',   name: 'Blood\nStudies',        icon: '🩸' },
  { id: 'vitamin',      name: 'Vitamin\nProfile',      icon: '💊' },
  { id: 'thyroid',      name: 'Thyroid\nTest',         icon: '🦋' },
  { id: 'kidney',       name: 'Kidney\nFunction',      icon: '🫘' },
  { id: 'liver',        name: 'Liver\nFunction',       icon: '🫀' },
  { id: 'womens',       name: "Women's\nHealth",       icon: '👩‍⚕️' },
  { id: 'eye-test',     name: 'Eye\nTest',             icon: '👁️' },
  { id: 'dental',       name: 'Dental\nCheck',         icon: '🦷' },
  { id: 'vaccination',  name: 'Vaccination',           icon: '💉' },
];

const SERVICE_PACKAGES = {
  'full-checkup': [
    { id: 'ess', name: 'Essential Check', tests: 45, badge: null,           price: 899,  original: 1499, discount: 40, desc: 'CBC · Lipid Profile · Blood Sugar · Liver & Kidney' },
    { id: 'adv', name: 'Advanced Check',  tests: 88, badge: 'MOST POPULAR', price: 1499, original: 2499, discount: 40, desc: 'Essential + Thyroid · Vitamin B12 & D · Urine Analysis' },
    { id: 'pre', name: 'Premium Check',   tests: 120,badge: 'COMPREHENSIVE', price: 2299, original: 3699, discount: 38, desc: 'Advanced + Hormone Panel · Allergy · Doctor Consult' },
  ],
  'diabetes': [
    { id: 'd1', name: 'Basic Diabetes',    tests: 5,  badge: null,           price: 299,  original: 499,  discount: 40, desc: 'HbA1c · Fasting Blood Sugar · Urine Sugar' },
    { id: 'd2', name: 'Diabetes Control',  tests: 10, badge: 'MOST POPULAR', price: 599,  original: 999,  discount: 40, desc: 'Basic + PPBS · Insulin Levels · Kidney Markers' },
    { id: 'd3', name: 'Diabetic Complete', tests: 18, badge: null,           price: 999,  original: 1699, discount: 41, desc: 'Control + Lipid Profile · Eye & Nerve Screening' },
  ],
  'heart': [
    { id: 'h1', name: 'Cardiac Basic',    tests: 8,  badge: null,           price: 499,  original: 849,  discount: 41, desc: 'ECG · Blood Pressure · Cholesterol · CRP' },
    { id: 'h2', name: 'Cardiac Standard', tests: 15, badge: 'MOST POPULAR', price: 999,  original: 1699, discount: 41, desc: 'Basic + Troponin · Echo Screening · Treadmill Test' },
    { id: 'h3', name: 'Cardiac Premium',  tests: 22, badge: 'COMPREHENSIVE', price: 1799, original: 2999, discount: 40, desc: 'Standard + Holter Monitor · Cardiology Consult' },
  ],
  'blood-test': [
    { id: 'b1', name: 'Basic Panel',         tests: 8,  badge: null,           price: 199,  original: 349,  discount: 43, desc: 'CBC · Blood Group · Hemoglobin · Blood Glucose' },
    { id: 'b2', name: 'Standard Panel',      tests: 25, badge: 'MOST POPULAR', price: 499,  original: 849,  discount: 41, desc: 'Basic + ESR · Platelet · WBC Differential · Iron' },
    { id: 'b3', name: 'Comprehensive Panel', tests: 60, badge: null,           price: 899,  original: 1499, discount: 40, desc: 'Standard + Electrolytes · Coagulation · Hormones' },
  ],
  'vitamin': [
    { id: 'v1', name: 'Core Vitamins',  tests: 4,  badge: null,           price: 349,  original: 599,  discount: 42, desc: 'Vitamin D · B12 · Folate · Iron' },
    { id: 'v2', name: 'Vital Profile',  tests: 9,  badge: 'MOST POPULAR', price: 699,  original: 1199, discount: 42, desc: 'Core + Calcium · Magnesium · Zinc · Copper' },
    { id: 'v3', name: 'Elite Profile',  tests: 16, badge: null,           price: 1099, original: 1899, discount: 42, desc: 'Vital + Omega-3 · CoQ10 · Anti-oxidant Panel' },
  ],
  'thyroid': [
    { id: 't1', name: 'Basic Thyroid',    tests: 3,  badge: null,           price: 249,  original: 449,  discount: 45, desc: 'T3 · T4 · TSH' },
    { id: 't2', name: 'Complete Thyroid', tests: 6,  badge: 'MOST POPULAR', price: 499,  original: 849,  discount: 41, desc: 'Basic + Free T3/T4 · Anti-TPO Antibody' },
    { id: 't3', name: 'Thyroid Plus',     tests: 10, badge: null,           price: 799,  original: 1399, discount: 43, desc: 'Complete + Thyroglobulin · Ultrasound Neck' },
  ],
  'kidney': [
    { id: 'k1', name: 'Basic KFT',       tests: 5,  badge: null,           price: 199,  original: 349,  discount: 43, desc: 'Creatinine · BUN · Uric Acid · Sodium · Potassium' },
    { id: 'k2', name: 'Complete KFT',    tests: 12, badge: 'MOST POPULAR', price: 449,  original: 749,  discount: 40, desc: 'Basic KFT + Urine R/M · GFR · Microalbumin' },
    { id: 'k3', name: 'Renal Screen',    tests: 20, badge: null,           price: 849,  original: 1399, discount: 39, desc: 'Complete KFT + Kidney Ultrasound · Iron Panel' },
  ],
  'liver': [
    { id: 'l1', name: 'Basic LFT',       tests: 6,  badge: null,           price: 199,  original: 349,  discount: 43, desc: 'SGOT · SGPT · Alkaline Phosphatase · Bilirubin' },
    { id: 'l2', name: 'Complete LFT',    tests: 11, badge: 'MOST POPULAR', price: 449,  original: 749,  discount: 40, desc: 'Basic LFT + Albumin · GGT · Protein Electrophoresis' },
    { id: 'l3', name: 'Liver Premium',   tests: 18, badge: null,           price: 799,  original: 1299, discount: 39, desc: 'Complete LFT + Hepatitis Panel · Liver Ultrasound' },
  ],
  'womens': [
    { id: 'w1', name: 'Basic Wellness',    tests: 12, badge: null,           price: 499,  original: 849,  discount: 41, desc: 'CBC · Thyroid · Iron · Calcium · Vitamin D · B12' },
    { id: 'w2', name: 'Advanced Wellness', tests: 25, badge: 'MOST POPULAR', price: 999,  original: 1699, discount: 41, desc: 'Basic + Hormones · PCOD Screen · Breast Exam Ref.' },
    { id: 'w3', name: "Women's Complete",  tests: 38, badge: 'COMPREHENSIVE', price: 1799, original: 2999, discount: 40, desc: 'Advanced + Pap Smear · Bone Density · Gyn Consult' },
  ],
  'eye-test': [
    { id: 'e1', name: 'Vision Check',    tests: null, badge: null,           price: 199,  original: 349,  discount: 43, desc: 'Visual Acuity · Refraction · Colour Blindness Test' },
    { id: 'e2', name: 'Eye Wellness',    tests: null, badge: 'MOST POPULAR', price: 499,  original: 849,  discount: 41, desc: 'Vision Check + Retinal Scan · IOP · Slit Lamp' },
    { id: 'e3', name: 'Premium Eye',     tests: null, badge: null,           price: 899,  original: 1499, discount: 40, desc: 'Eye Wellness + Dry Eye · OCT Scan · Ophthalmologist Consult' },
  ],
  'dental': [
    { id: 'dn1', name: 'Dental Hygiene', tests: null, badge: null,           price: 299,  original: 499,  discount: 40, desc: 'Scaling · Polishing · Oral Hygiene Instructions' },
    { id: 'dn2', name: 'Dental Health',  tests: null, badge: 'MOST POPULAR', price: 699,  original: 1199, discount: 42, desc: 'Hygiene + Dental X-Ray · Cavity Check · Gum Analysis' },
    { id: 'dn3', name: 'Dental Plus',    tests: null, badge: null,           price: 1099, original: 1799, discount: 39, desc: 'Health + Teeth Whitening · Root Canal Assessment' },
  ],
  'vaccination': [
    { id: 'va1', name: 'Single Vaccine',    tests: null, badge: null,           price: 199,  original: 299,  discount: 33, desc: 'One vaccine of your choice as per doctor advice' },
    { id: 'va2', name: 'Dual Vaccine',      tests: null, badge: 'MOST POPULAR', price: 349,  original: 549,  discount: 36, desc: 'Two vaccines as per doctor recommendation' },
    { id: 'va3', name: 'Family Protect',    tests: null, badge: null,           price: 599,  original: 999,  discount: 40, desc: 'Up to 4 vaccines · Family health coverage plan' },
  ],
};

const HOSPITALS_DB = [
  { id:1,  name:'Lilavati Hospital',            city:'mumbai',    address:'Bandra West, Mumbai',      rating:4.8, dist:2.1, type:'Multi-Speciality', color:'#1abc9c' },
  { id:2,  name:'Kokilaben Ambani Hospital',    city:'mumbai',    address:'Andheri West, Mumbai',     rating:4.9, dist:3.4, type:'Super-Speciality', color:'#3b82f6' },
  { id:3,  name:'Breach Candy Hospital',        city:'mumbai',    address:'Bhulabhai Desai Rd',       rating:4.7, dist:4.2, type:'Multi-Speciality', color:'#8b5cf6' },
  { id:4,  name:'Nanavati Max Hospital',        city:'mumbai',    address:'Vile Parle West, Mumbai',  rating:4.6, dist:5.1, type:'Super-Speciality', color:'#f59e0b' },
  { id:5,  name:'AIIMS New Delhi',              city:'delhi',     address:'Ansari Nagar, New Delhi',  rating:4.9, dist:1.8, type:'Government',        color:'#ef4444' },
  { id:6,  name:'Apollo Hospital Delhi',        city:'delhi',     address:'Sarita Vihar, New Delhi',  rating:4.8, dist:3.2, type:'Super-Speciality', color:'#1abc9c' },
  { id:7,  name:'Fortis Shalimar Bagh',         city:'delhi',     address:'Shalimar Bagh, New Delhi', rating:4.7, dist:4.6, type:'Multi-Speciality', color:'#3b82f6' },
  { id:8,  name:'Max Super Specialty Saket',    city:'delhi',     address:'Press Enclave Rd, Saket',  rating:4.6, dist:5.8, type:'Super-Speciality', color:'#8b5cf6' },
  { id:9,  name:'Manipal Hospital',             city:'bangalore', address:'HAL Airport Road, Bengaluru',rating:4.8,dist:2.3, type:'Super-Speciality', color:'#1abc9c' },
  { id:10, name:'Narayana Health City',         city:'bangalore', address:'Hosur Road, Bommasandra',  rating:4.9, dist:3.8, type:'Super-Speciality', color:'#f59e0b' },
  { id:11, name:'Apollo Hospital Bannerghatta', city:'bangalore', address:'Bannerghatta Rd, Bengaluru',rating:4.7,dist:4.1, type:'Multi-Speciality', color:'#8b5cf6' },
  { id:12, name:'Columbia Asia Referral',       city:'bangalore', address:'Rajajinagar, Bengaluru',   rating:4.6, dist:5.5, type:'Multi-Speciality', color:'#3b82f6' },
  { id:13, name:'Apollo Hospitals Chennai',     city:'chennai',   address:'Greams Road, Chennai',     rating:4.8, dist:2.0, type:'Super-Speciality', color:'#1abc9c' },
  { id:14, name:'MIOT International',           city:'chennai',   address:'Manapakkam, Chennai',      rating:4.7, dist:3.5, type:'Super-Speciality', color:'#ef4444' },
  { id:15, name:'Fortis Malar Hospital',        city:'chennai',   address:'Adyar, Chennai',           rating:4.6, dist:4.8, type:'Multi-Speciality', color:'#3b82f6' },
  { id:16, name:'Yashoda Hospitals',            city:'hyderabad', address:'Somajiguda, Hyderabad',    rating:4.8, dist:1.9, type:'Super-Speciality', color:'#f59e0b' },
  { id:17, name:'Continental Hospitals',        city:'hyderabad', address:'Gachibowli, Hyderabad',    rating:4.7, dist:3.6, type:'Super-Speciality', color:'#1abc9c' },
  { id:18, name:'Care Hospitals',               city:'hyderabad', address:'Banjara Hills, Hyderabad', rating:4.6, dist:4.3, type:'Multi-Speciality', color:'#8b5cf6' },
  { id:19, name:'KIMS Hospitals',               city:'hyderabad', address:'Secunderabad, Hyderabad',  rating:4.1, dist:6.3, type:'Multi-Speciality', color:'#3b82f6' },
  { id:20, name:'Ruby Hall Clinic',             city:'pune',      address:'Sassoon Road, Pune',       rating:4.8, dist:2.4, type:'Multi-Speciality', color:'#1abc9c' },
  { id:21, name:'Jehangir Hospital',            city:'pune',      address:'Sassoon Road, Pune',       rating:4.7, dist:3.1, type:'Multi-Speciality', color:'#ef4444' },
  { id:22, name:'Apollo Gleneagles',            city:'kolkata',   address:'Canal Circular Rd, Kolkata',rating:4.8,dist:2.6, type:'Super-Speciality', color:'#1abc9c' },
  { id:23, name:'AMRI Hospitals',               city:'kolkata',   address:'Salt Lake, Kolkata',       rating:4.7, dist:3.9, type:'Multi-Speciality', color:'#3b82f6' },
  { id:24, name:'Apollo Hospital Ahmedabad',    city:'ahmedabad', address:'Gandhinagar, Ahmedabad',   rating:4.7, dist:4.2, type:'Super-Speciality', color:'#f59e0b' },
  { id:25, name:'Sterling Hospital',            city:'ahmedabad', address:'Gurukul, Ahmedabad',       rating:4.6, dist:5.0, type:'Multi-Speciality', color:'#8b5cf6' },
  { id:26, name:'Fortis Escorts Hospital',      city:'jaipur',    address:'Malviya Nagar, Jaipur',    rating:4.7, dist:3.3, type:'Super-Speciality', color:'#1abc9c' },
  { id:27, name:'Mahatma Gandhi Hospital',      city:'jaipur',    address:'Sector 22, Jaipur',        rating:4.5, dist:5.7, type:'Government',        color:'#ef4444' },
  { id:28, name:'Kiran Hospital',               city:'surat',     address:'Magdalla Road, Surat',     rating:4.6, dist:2.8, type:'Multi-Speciality', color:'#1abc9c' },
  { id:29, name:'New Civil Hospital',           city:'surat',     address:'Majura Gate, Surat',       rating:4.4, dist:4.5, type:'Government',        color:'#3b82f6' },
];

const SUGGESTED_CITIES = ['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Pune','Kolkata','Ahmedabad','Jaipur','Surat'];

const HOW_IT_WORKS = [
  { icon: '🏥', label: 'Select Service' },
  { icon: '📦', label: 'Choose Plan' },
  { icon: '📍', label: 'Enter Location' },
  { icon: '🏨', label: 'Select Hospital' },
  { icon: '✅', label: 'Confirmed' },
];

// Generates the next 7 days
const getNext7Days = () => {
  const days = [];
  const now = new Date();
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push({
      key: d.toISOString().split('T')[0],
      day: i === 0 ? 'Today' : dayNames[d.getDay()],
      date: d.getDate(),
      month: monthNames[d.getMonth()],
    });
  }
  return days;
};

const TIME_SLOTS = [
  { time: '08:00 AM', slots: 4 }, { time: '09:00 AM', slots: 2 },
  { time: '10:00 AM', slots: 5 }, { time: '11:00 AM', slots: 1 },
  { time: '12:00 PM', slots: 3 }, { time: '02:00 PM', slots: 4 },
  { time: '03:00 PM', slots: 2 }, { time: '04:00 PM', slots: 3 },
  { time: '05:00 PM', slots: 1 },
];

const STEPS = ['Select Service', 'Choose Plan', 'Your Location', 'Hospital & Time', 'Payment'];

// ─── Component ────────────────────────────────────────────────────────────────
function Appointments() {
  const toast = useToast();
  const token = localStorage.getItem('authToken');
  const CACHE_KEY = `appts_cache_${localStorage.getItem('userId') || 'user'}`;

  // Stepper
  const [step, setStep]   = useState(0);
  const [booked, setBooked] = useState(false);
  const [showPayPopup, setShowPayPopup] = useState(false);

  // Selections
  const [selectedService,  setSelectedService]  = useState(null);
  const [selectedPackage,  setSelectedPackage]  = useState(null);
  const [cityInput,        setCityInput]         = useState('');
  const [confirmedCity,    setConfirmedCity]     = useState('');
  const [hospitals,        setHospitals]         = useState([]);
  const [selectedHospital, setSelectedHospital]  = useState(null);
  const [selectedDate,     setSelectedDate]      = useState(null);
  const [selectedTime,     setSelectedTime]      = useState(null);
  const [selectedPayment,  setSelectedPayment]   = useState('upi');
  const [booking,          setBooking]           = useState(false);

  // Payment form state
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiId,       setUpiId]       = useState('');
  const [bankName,    setBankName]    = useState('');
  const [nbAccNo,     setNbAccNo]     = useState('');
  const [nbIfsc,      setNbIfsc]      = useState('');
  const [nbAccType,   setNbAccType]   = useState('Savings');

  // Recent cities (localStorage)
  const [recentCities, setRecentCities] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recent_cities')) || []; } catch { return []; }
  });

  // My appointments (localStorage cache + DB)
  const [myAppts,      setMyAppts]      = useState(() => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || []; } catch { return []; }
  });
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [fetchError,   setFetchError]   = useState(false);

  const dates = getNext7Days();
  const dateStripRef = useRef(null);

  // ── Fetch My Appointments ─────────────────────────────────────────────────
  const fetchMyAppts = async () => {
    if (!token) { setLoadingAppts(false); return; }
    setFetchError(false);
    try {
      const res = await fetch('http://localhost:5000/api/appointments/my', {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setMyAppts(list);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(list)); } catch {}
      } else { setFetchError(true); }
    } catch { setFetchError(true); }
    setLoadingAppts(false);
  };

  useEffect(() => { fetchMyAppts(); }, []);

  // ── Select service → go to step 1 ────────────────────────────────────────
  const handleSelectService = (svc) => {
    setSelectedService(svc);
    setSelectedPackage(null);
    setStep(1);
  };

  // ── Search hospitals by city ──────────────────────────────────────────────
  const handleCityConfirm = (city) => {
    const q = city.trim().toLowerCase();
    if (!q) { toast('Please enter a city.', 'error'); return; }
    const results = HOSPITALS_DB.filter(h => h.city.includes(q) || q.includes(h.city));
    if (results.length === 0) {
      toast('No hospitals found. Try: Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune…', 'error');
      return;
    }
    setConfirmedCity(city);
    setHospitals(results);
    setSelectedHospital(null);
    setSelectedDate(null);
    setSelectedTime(null);
    // Save to recent cities
    const updated = [city, ...recentCities.filter(c => c.toLowerCase() !== q)].slice(0, 5);
    setRecentCities(updated);
    try { localStorage.setItem('recent_cities', JSON.stringify(updated)); } catch {}
    setStep(3);
  };

  // ── Card input handlers ───────────────────────────────────────────────────
  const handleCardNumber = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardDetails(p => ({ ...p, number: val }));
  };
  const handleExpiry = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
    setCardDetails(p => ({ ...p, expiry: val }));
  };
  const handleCvv = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCardDetails(p => ({ ...p, cvv: val }));
  };
  const handleCardName = (e) => {
    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setCardDetails(p => ({ ...p, name: val }));
  };

  // ── Book appointment ──────────────────────────────────────────────────────
  const handleBook = async () => {
    if (!token) { toast('Please log in to book.', 'error'); return; }
    if (!selectedHospital || !selectedDate || !selectedTime) {
      toast('Please select hospital, date and time.', 'error'); return;
    }

    // Payment validation
    if (selectedPayment === 'card') {
      if (!cardDetails.number || cardDetails.number.length < 16) {
        toast('Please enter a valid 16-digit Card Number.', 'error'); return;
      }
      if (!cardDetails.expiry || cardDetails.expiry.length < 5) {
        toast('Please enter a valid Expiry Date (MM/YY).', 'error'); return;
      }
      if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
        toast('Please enter a valid 3-digit CVV.', 'error'); return;
      }
      if (!cardDetails.name.trim()) {
        toast('Card Holder Name is required.', 'error'); return;
      }
    } else if (selectedPayment === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        toast('Please enter a valid UPI ID (e.g. name@bank).', 'error'); return;
      }
    } else if (selectedPayment === 'netbank') {
      if (!bankName) {
        toast('Please select a Bank.', 'error'); return;
      }
      if (!nbAccNo || nbAccNo.length < 8) {
        toast('Please enter a valid Account Number (min 8 digits).', 'error'); return;
      }
      if (!nbIfsc || nbIfsc.length < 11) {
        toast('Please enter a valid 11-character IFSC Code.', 'error'); return;
      }
    }

    setBooking(true);
    try {
      const res = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({
          service: selectedService.name.replace('\n', ' '),
          hospitalName: selectedHospital.name,
          hospitalCity: selectedHospital.city,
          hospitalAddress: selectedHospital.address,
          appointmentDate: selectedDate.key,
          appointmentTime: selectedTime,
          notes: selectedPackage
            ? `Plan: ${selectedPackage.name} · ₹${selectedPackage.price}`
            : '',
        })
      });
      if (res.ok) {
        await fetchMyAppts();
        setBooked(true);
        setShowPayPopup(true);   // show GPay-style popup first
      } else {
        const d = await res.json();
        toast(d.message || 'Booking failed.', 'error');
      }
    } catch { toast('Connection error. Please try again.', 'error'); }
    setBooking(false);
  };

  // ── Cancel appointment ────────────────────────────────────────────────────
  const handleCancel = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/${id}`, {
        method: 'DELETE', headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        toast('Appointment cancelled.');
        const updated = myAppts.filter(a => a.id !== id);
        setMyAppts(updated);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(updated)); } catch {}
      } else { toast('Failed to cancel.', 'error'); }
    } catch { toast('Connection error.', 'error'); }
  };

  const resetBooking = () => {
    setStep(0); setBooked(false);
    setSelectedService(null); setSelectedPackage(null);
    setCityInput(''); setConfirmedCity('');
    setHospitals([]); setSelectedHospital(null);
    setSelectedDate(null); setSelectedTime(null);
  };

  const statusColor = (s) => s === 'Confirmed' ? '#0d9488' : s === 'Cancelled' ? '#dc2626' : '#b45309';
  const statusBg    = (s) => s === 'Confirmed' ? '#f0fdf9' : s === 'Cancelled' ? '#fef2f2' : '#fffbeb';

  const svcDisplayName = (svc) => svc?.name?.replace('\n', ' ');

  // ── Render helpers ────────────────────────────────────────────────────────
  const renderHospitalInitials = (name, color) => {
    const words = name.split(' ');
    const initials = words.slice(0, 2).map(w => w[0]).join('');
    return (
      <div className="hosp-initials" style={{ background: color }}>
        {initials}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SUCCESS SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (booked) return (
    <div className="appt-wrap">
      {showPayPopup && (
        <PaymentSuccessPopup
          amount={selectedPackage ? selectedPackage.price + 49 : null}
          subtitle="Your appointment has been confirmed!"
          onClose={() => { setShowPayPopup(false); }}
          autoClose={3500}
        />
      )}
      <div className="appt-success-screen">
        <div className="success-tick">✅</div>
        <h2>Appointment Confirmed!</h2>
        <p>Please arrive 10 minutes early at the hospital.</p>
        <div className="success-summary-card">
          <div className="ss-row"><span className="ss-label">Service</span><span className="ss-value">{svcDisplayName(selectedService)}</span></div>
          {selectedPackage && <div className="ss-row"><span className="ss-label">Plan</span><span className="ss-value">{selectedPackage.name}</span></div>}
          <div className="ss-row"><span className="ss-label">Hospital</span><span className="ss-value">{selectedHospital?.name}</span></div>
          <div className="ss-row"><span className="ss-label">Date</span><span className="ss-value">{selectedDate?.day}, {selectedDate?.date} {selectedDate?.month}</span></div>
          <div className="ss-row"><span className="ss-label">Time</span><span className="ss-value">{selectedTime}</span></div>
          {selectedPackage && <div className="ss-row ss-total"><span className="ss-label">Amount Paid</span><span className="ss-value teal">₹{selectedPackage.price}</span></div>}
        </div>
        <button className="appt-primary-btn" onClick={resetBooking}>+ Book Another Appointment</button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="appt-wrap">

      {/* ── Step Header Bar ── */}
      <div className="appt-step-bar">
        {STEPS.map((label, i) => (
          <div key={label} className={`appt-step-item${i < step ? ' done' : ''}${i === step ? ' active' : ''}`}>
            <div className="asb-circle">{i < step ? '✓' : i + 1}</div>
            <span className="asb-label">{label}</span>
            {i < STEPS.length - 1 && <div className={`asb-line${i < step ? ' done' : ''}`} />}
          </div>
        ))}
      </div>

      {/* ════════════════════════════════════════
          STEP 0: Select Service
      ════════════════════════════════════════ */}
      {step === 0 && (
        <div className="appt-body">
          <div className="appt-section-title">
            <h2>Book a Health Checkup</h2>
            <p>Choose a health checkup category</p>
          </div>
          <div className="service-cat-grid">
            {SERVICES.map(svc => (
              <button
                key={svc.id}
                className="service-cat-card"
                onClick={() => handleSelectService(svc)}
              >
                <div className="scc-icon">{svc.icon}</div>
                <div className="scc-name">{svc.name.replace('\n', '\n')}</div>
              </button>
            ))}
          </div>

          {/* How it works */}
          <div className="how-it-works">
            {HOW_IT_WORKS.map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="hiw-step">
                  <div className="hiw-icon">{step.icon}</div>
                  <div className="hiw-label">{step.label}</div>
                </div>
                {i < HOW_IT_WORKS.length - 1 && <div className="hiw-arrow">→</div>}
              </React.Fragment>
            ))}
          </div>

          {/* ── My Appointments ── */}
          <div className="my-appts-section">
            <div className="my-appts-header">
              <h3>Your Appointments</h3>
              <button className="view-all-btn" onClick={() => fetchMyAppts()}>🔄 Refresh</button>
            </div>
            {fetchError && (
              <div className="appt-warn-bar">⚠️ Could not reach server — showing last saved data.</div>
            )}
            {!token ? (
              <div className="no-appts-msg">Log in to see your appointments.</div>
            ) : loadingAppts ? (
              <div className="appt-loading-msg">Loading…</div>
            ) : myAppts.length === 0 ? (
              <div className="no-appts-msg">No appointments booked yet.</div>
            ) : (
              <div className="my-appt-mini-list">
                {myAppts.map(a => (
                  <div key={a.id} className="my-appt-mini-card">
                    <div className="mamc-left">
                      <div className="mamc-service">{a.service}</div>
                      <div className="mamc-hospital">{a.hospitalName}, {a.hospitalCity}</div>
                      <div className="mamc-datetime">
                        {new Date(a.appointmentDate + 'T00:00:00').toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                        &nbsp;·&nbsp;{a.appointmentTime}
                      </div>
                      {a.notes && <div className="mamc-notes">{a.notes}</div>}
                    </div>
                    <div className="mamc-right">
                      <span className="mamc-badge" style={{ background: statusBg(a.status), color: statusColor(a.status) }}>
                        {a.status}
                      </span>
                      {a.status !== 'Cancelled' && (
                        <button className="mamc-cancel" onClick={() => handleCancel(a.id)}>✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          STEP 1: Choose Plan
      ════════════════════════════════════════ */}
      {step === 1 && (
        <div className="appt-body">
          <div className="appt-back-row">
            <button className="appt-back-btn" onClick={() => setStep(0)}>← Back</button>
            <div className="appt-section-title inline">
              <h2>{svcDisplayName(selectedService)}</h2>
              <p>Choose a plan that suits you</p>
            </div>
          </div>
          <div className="pkg-list">
            {(SERVICE_PACKAGES[selectedService?.id] || []).map(pkg => (
              <div
                key={pkg.id}
                className={`pkg-card${selectedPackage?.id === pkg.id ? ' selected' : ''}`}
                onClick={() => setSelectedPackage(pkg)}
              >
                <div className="pkg-left">
                  <div className="pkg-icon-circle" style={{ background: selectedPackage?.id === pkg.id ? '#1abc9c' : '#f0fdf9' }}>
                    <span>🧪</span>
                  </div>
                  <div className="pkg-info">
                    <div className="pkg-name">{pkg.name}</div>
                    {pkg.tests && <div className="pkg-tests">{pkg.tests} Tests Included</div>}
                    <div className="pkg-desc">{pkg.desc}</div>
                    {pkg.badge && <span className="pkg-badge">{pkg.badge}</span>}
                  </div>
                </div>
                <div className="pkg-right">
                  <div className="pkg-price-wrap">
                    <span className="pkg-orig">₹{pkg.original}</span>
                    <span className="pkg-discount">{pkg.discount}% off</span>
                  </div>
                  <div className="pkg-price">₹{pkg.price}</div>
                  <button
                    className={`pkg-add-btn${selectedPackage?.id === pkg.id ? ' added' : ''}`}
                    onClick={e => { e.stopPropagation(); setSelectedPackage(pkg); }}
                  >
                    {selectedPackage?.id === pkg.id ? '✓ Selected' : 'Add'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Cart bar — only shown when a plan is selected */}
          {selectedPackage && (
            <div className="cart-bar">
              <div className="cart-bar-info">
                <span className="cb-label">1 Plan Selected</span>
                <span className="cb-price">₹{selectedPackage.price}</span>
              </div>
              <button className="cart-bar-btn" onClick={() => setStep(2)}>
                Continue to Location →
              </button>
            </div>
          )}
          {!selectedPackage && (
            <div className="pkg-must-select">
              👆 Please select a plan to continue
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
          STEP 2: Enter Location
      ════════════════════════════════════════ */}
      {step === 2 && (
        <div className="appt-body">
          <div className="appt-back-row">
            <button className="appt-back-btn" onClick={() => setStep(1)}>← Back</button>
            <div className="appt-section-title inline">
              <h2>Enter Location</h2>
              <p>We'll find hospitals near you</p>
            </div>
          </div>

          <div className="location-search-wrap">
            <div className="loc-input-row">
              <span className="loc-search-icon">🔍</span>
              <input
                className="loc-input"
                placeholder="Enter your city (Mumbai, Delhi, Bangalore…)"
                value={cityInput}
                onChange={e => setCityInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCityConfirm(cityInput)}
                autoFocus
              />
            </div>
          </div>

          <div className="loc-label">Suggested Cities</div>
          <div className="city-chips">
            {SUGGESTED_CITIES.map(c => (
              <button key={c} className="city-chip" onClick={() => { setCityInput(c); handleCityConfirm(c); }}>
                📍 {c}
              </button>
            ))}
          </div>

          {recentCities.length > 0 && (
            <>
              <div className="loc-label" style={{ marginTop: 20 }}>Recent Searches</div>
              <div className="recent-city-list">
                {recentCities.map(c => (
                  <button key={c} className="recent-city-item" onClick={() => { setCityInput(c); handleCityConfirm(c); }}>
                    <span className="rci-icon">🕐</span>
                    <span>{c}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          <button className="appt-primary-btn" style={{ marginTop: 28 }} onClick={() => handleCityConfirm(cityInput)}>
            Find Nearby Hospitals →
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════
          STEP 3: Select Hospital & Time
      ════════════════════════════════════════ */}
      {step === 3 && (
        <div className="appt-body">
          <div className="appt-back-row">
            <button className="appt-back-btn" onClick={() => setStep(2)}>← Back</button>
            <div className="appt-section-title inline">
              <h2>Select Hospital</h2>
              <p>Showing results for {confirmedCity}</p>
            </div>
          </div>

          {/* Hospital list */}
          <div className="hosp-list">
            {hospitals.map(h => (
              <div
                key={h.id}
                className={`hosp-item${selectedHospital?.id === h.id ? ' selected' : ''}`}
                onClick={() => setSelectedHospital(h)}
              >
                {renderHospitalInitials(h.name, h.color)}
                <div className="hosp-item-info">
                  <div className="hi-name">{h.name}</div>
                  <div className="hi-city">{h.address}</div>
                  <div className="hi-meta">
                    <span className="hi-dist">📍 {h.dist} km away</span>
                    <span className="hi-rating">★ {h.rating}</span>
                    <span className={`hi-type ${h.type === 'Government' ? 'govt' : ''}`}>{h.type}</span>
                  </div>
                </div>
                <div className={`hosp-radio${selectedHospital?.id === h.id ? ' checked' : ''}`} />
              </div>
            ))}
          </div>

          {/* Date strip */}
          <div className="date-strip-section">
            <div className="ds-label">Select Date</div>
            <div className="date-strip" ref={dateStripRef}>
              {dates.map(d => (
                <button
                  key={d.key}
                  className={`date-cell${selectedDate?.key === d.key ? ' selected' : ''}`}
                  onClick={() => setSelectedDate(d)}
                >
                  <span className="dc-day">{d.day}</span>
                  <span className="dc-date">{d.date}</span>
                  <span className="dc-month">{d.month}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time slots */}
          <div className="time-slot-section">
            <div className="ds-label">
              Select Time Slot
              {selectedDate && <span className="slots-avail">{TIME_SLOTS.length} slots available</span>}
            </div>
            <div className="time-slot-grid">
              {TIME_SLOTS.map(ts => (
                <button
                  key={ts.time}
                  className={`ts-card${selectedTime === ts.time ? ' selected' : ''}`}
                  onClick={() => setSelectedTime(ts.time)}
                >
                  <div className="tsc-time">{ts.time}</div>
                  <div className="tsc-slots">{ts.slots} left</div>
                </button>
              ))}
            </div>
          </div>

          {/* Summary + Continue to Payment */}
          {selectedHospital && selectedDate && selectedTime && (
            <div className="booking-footer">
              <div className="bf-summary">
                <div className="bf-row"><span>{svcDisplayName(selectedService)}</span>{selectedPackage && <span className="bf-pkg">{selectedPackage.name}</span>}</div>
                <div className="bf-row muted"><span>{selectedHospital.name}</span><span>{selectedDate.day}, {selectedDate.date} {selectedDate.month} · {selectedTime}</span></div>
              </div>
              <button className="appt-primary-btn" onClick={() => setStep(4)}>
                Continue to Payment →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
          STEP 4: Payment
      ════════════════════════════════════════ */}
      {step === 4 && (() => {
        const convFee = 49;
        const total   = (selectedPackage?.price || 0) + convFee;
        const PAYMENT_METHODS = [
          { id: 'upi',    label: 'UPI',                 icons: ['🟢', 'G', 'P'] },
          { id: 'card',   label: 'Credit / Debit Card', icons: ['💳'] },
          { id: 'netbank',label: 'Net Banking',          icons: ['🏦'] },
        ];
        const NETBANKS = [
          { id: 'sbi',    name: 'SBI',      color: '#1a237e', abbr: 'SBI'  },
          { id: 'hdfc',   name: 'HDFC',     color: '#004c8c', abbr: 'HDFC' },
          { id: 'icici',  name: 'ICICI',    color: '#f57c00', abbr: 'ICICI'},
          { id: 'axis',   name: 'Axis',     color: '#8d1b3d', abbr: 'AXIS' },
          { id: 'kotak',  name: 'Kotak',    color: '#e50027', abbr: 'KMB'  },
          { id: 'pnb',    name: 'PNB',      color: '#155724', abbr: 'PNB'  },
          { id: 'bob',    name: 'BoB',      color: '#d97706', abbr: 'BOB'  },
          { id: 'canara', name: 'Canara',   color: '#1565c0', abbr: 'CAN'  },
          { id: 'yes',    name: 'Yes Bank', color: '#0288d1', abbr: 'YES'  },
          { id: 'iob',    name: 'IOB',      color: '#558b2f', abbr: 'IOB'  },
        ];
        return (
          <div className="appt-body">
            <div className="appt-back-row">
              <button className="appt-back-btn" onClick={() => setStep(3)}>← Back</button>
              <div className="appt-section-title inline">
                <h2>Payment</h2>
                <p>Complete payment to confirm your appointment</p>
              </div>
            </div>

            <div className="pay-layout">
              {/* LEFT: Summary + Price */}
              <div className="pay-left">
                <div className="pay-card">
                  <div className="pay-card-title">Appointment Summary</div>
                  <div className="pay-summary-rows">
                    <div className="psr">
                      <span className="psr-label">Service</span>
                      <span className="psr-value">{svcDisplayName(selectedService)}</span>
                    </div>
                    {selectedPackage && (
                      <div className="psr">
                        <span className="psr-label">Plan</span>
                        <span className="psr-value">{selectedPackage.name}</span>
                      </div>
                    )}
                    <div className="psr">
                      <span className="psr-label">Hospital</span>
                      <span className="psr-value">{selectedHospital?.name}</span>
                    </div>
                    <div className="psr">
                      <span className="psr-label">Date &amp; Time</span>
                      <span className="psr-value">{selectedDate?.day}, {selectedDate?.date} {selectedDate?.month} &middot; {selectedTime}</span>
                    </div>
                  </div>
                </div>

                {selectedPackage && (
                  <div className="pay-card" style={{ marginTop: 16 }}>
                    <div className="pay-card-title">Price Details</div>
                    <div className="pay-price-rows">
                      <div className="ppr">
                        <span>Plan Price</span>
                        <span>₹{selectedPackage.original}</span>
                      </div>
                      <div className="ppr green">
                        <span>Discount ({selectedPackage.discount}% off)</span>
                        <span>- ₹{selectedPackage.original - selectedPackage.price}</span>
                      </div>
                      <div className="ppr">
                        <span>Convenience Fee</span>
                        <span>₹{convFee}</span>
                      </div>
                      <div className="ppr total">
                        <span>Total Amount</span>
                        <span>₹{total}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: Payment Methods + Form */}
              <div className="pay-right">
                <div className="pay-card">
                  <div className="pay-card-title">Select Payment Method</div>
                  <div className="pay-methods">
                    {PAYMENT_METHODS.map(pm => (
                      <label
                        key={pm.id}
                        className={`pay-method-row${selectedPayment === pm.id ? ' selected' : ''}`}
                        onClick={() => setSelectedPayment(pm.id)}
                      >
                        <div className={`pm-radio${selectedPayment === pm.id ? ' checked' : ''}`} />
                        <span className="pm-label">{pm.label}</span>
                        <span className="pm-icons">
                          {pm.icons.map((ic, i) => (
                            <span key={i} className="pm-icon-chip">{ic}</span>
                          ))}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* ── UPI Form ── */}
                  {selectedPayment === 'upi' && (
                    <div className="appt-pay-form">
                      <div className="appt-pay-upi-apps">
                        {['GPay','PhonePe','Paytm','BHIM'].map(app => (
                          <div key={app} className="appt-upi-app-chip">{app}</div>
                        ))}
                      </div>
                      <div className="appt-pay-field">
                        <label className="appt-pay-label">UPI ID</label>
                        <input
                          className="appt-pay-input"
                          type="text"
                          placeholder="yourname@bank"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                        />
                        <span className="appt-pay-hint">e.g. john@oksbi · priya@ybl · 9876543210@paytm</span>
                      </div>
                    </div>
                  )}

                  {/* ── Card Form ── */}
                  {selectedPayment === 'card' && (
                    <div className="appt-pay-form">
                      <div className="appt-card-visual">
                        <div className="acv-chip">▬▬</div>
                        <div className="acv-number">
                          {(cardDetails.number || '').padEnd(16, '•').replace(/(\d{4})/g, '$1 ').trim()
                            .split('').map((ch, i) => (
                              <span key={i} className={ch === '•' ? 'acv-dot' : ''}>{ch}</span>
                            ))}
                        </div>
                        <div className="acv-bottom">
                          <div>
                            <div className="acv-mini-label">Card Holder</div>
                            <div className="acv-mini-val">{cardDetails.name || 'FULL NAME'}</div>
                          </div>
                          <div>
                            <div className="acv-mini-label">Expires</div>
                            <div className="acv-mini-val">{cardDetails.expiry || 'MM/YY'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="appt-pay-field">
                        <label className="appt-pay-label">Card Number</label>
                        <input
                          className="appt-pay-input"
                          type="text"
                          inputMode="numeric"
                          placeholder="1234 5678 9012 3456"
                          maxLength="16"
                          value={cardDetails.number}
                          onChange={handleCardNumber}
                        />
                      </div>
                      <div className="appt-pay-row">
                        <div className="appt-pay-field">
                          <label className="appt-pay-label">Expiry Date</label>
                          <input
                            className="appt-pay-input"
                            type="text"
                            inputMode="numeric"
                            placeholder="MM / YY"
                            maxLength="5"
                            value={cardDetails.expiry}
                            onChange={handleExpiry}
                          />
                        </div>
                        <div className="appt-pay-field">
                          <label className="appt-pay-label">CVV</label>
                          <input
                            className="appt-pay-input"
                            type="password"
                            inputMode="numeric"
                            placeholder="•••"
                            maxLength="3"
                            value={cardDetails.cvv}
                            onChange={handleCvv}
                          />
                        </div>
                      </div>
                      <div className="appt-pay-field">
                        <label className="appt-pay-label">Card Holder Name</label>
                        <input
                          className="appt-pay-input"
                          type="text"
                          placeholder="Name as on card"
                          value={cardDetails.name}
                          onChange={handleCardName}
                        />
                      </div>
                    </div>
                  )}

                  {/* ── Net Banking Form ── */}
                  {selectedPayment === 'netbank' && (
                    <div className="appt-pay-form">
                      {/* Bank tile grid */}
                      <div className="appt-pay-field">
                        <label className="appt-pay-label">Select Your Bank</label>
                        <div className="appt-nb-grid">
                          {NETBANKS.map(b => (
                            <button
                              key={b.id}
                              type="button"
                              className={`appt-nb-tile${bankName === b.id ? ' selected' : ''}`}
                              onClick={() => setBankName(b.id)}
                            >
                              <div className="appt-nb-logo" style={{ background: b.color }}>{b.abbr}</div>
                              <span className="appt-nb-name">{b.name}</span>
                              {bankName === b.id && <span className="appt-nb-check">✓</span>}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Account Number */}
                      <div className="appt-pay-field">
                        <label className="appt-pay-label">Account Number</label>
                        <input
                          className="appt-pay-input"
                          type="text"
                          inputMode="numeric"
                          placeholder="Enter your bank account number"
                          value={nbAccNo}
                          maxLength={18}
                          onChange={e => setNbAccNo(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>

                      {/* IFSC Code */}
                      <div className="appt-pay-field">
                        <label className="appt-pay-label">IFSC Code</label>
                        <input
                          className="appt-pay-input"
                          type="text"
                          placeholder="e.g. SBIN0001234"
                          value={nbIfsc}
                          maxLength={11}
                          onChange={e => setNbIfsc(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                        />
                        <span className="appt-pay-hint">11-character IFSC code printed on your cheque book</span>
                      </div>

                      {/* Account Type */}
                      <div className="appt-pay-field">
                        <label className="appt-pay-label">Account Type</label>
                        <div className="appt-nb-actype-row">
                          {['Savings', 'Current', 'Salary'].map(type => (
                            <button
                              key={type}
                              type="button"
                              className={`appt-nb-actype-btn${nbAccType === type ? ' selected' : ''}`}
                              onClick={() => setNbAccType(type)}
                            >{type}</button>
                          ))}
                        </div>
                      </div>

                      <div className="appt-nb-secure-note">
                        🔒 Your credentials are verified directly with your bank via encrypted channel. We do not store any banking details.
                      </div>
                    </div>
                  )}

                  <button
                    className="appt-primary-btn"
                    style={{ marginTop: 20 }}
                    disabled={booking}
                    onClick={handleBook}
                  >
                    {booking ? '⏳ Processing Payment…' : `🔒 Pay ₹${selectedPackage ? total : 0} Securely`}
                  </button>
                  <p className="pay-secure-note">🔒 256-bit SSL Encrypted &amp; Secure Payment</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default Appointments;
