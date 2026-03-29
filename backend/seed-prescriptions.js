require('dotenv').config();
const { sequelize, User, Prescription } = require('./models');

// const mockPrescriptions = [
//   // Medicines
//   { rxId: "RX-10029", medicine: "Paracetamol 500mg", doctor: "Dr. Sarah Smith", date: "2023-10-15", dosage: "1 tablet every 8 hours after meals", diagnosis: "Viral Fever", validTill: "2023-11-15", status: "Active" },
//   { rxId: "RX-10034", medicine: "Vitamin C Tablets", doctor: "Dr. Emily Chen", date: "2024-01-01", dosage: "1 tablet daily after breakfast", diagnosis: "Immunity Booster", validTill: "2024-12-31", status: "Active" },
//   { rxId: "RX-10030", medicine: "Amoxicillin", doctor: "Dr. Rahul Sharma", date: "2023-10-12", dosage: "500mg every 12 hours for 5 days", diagnosis: "Throat Infection", validTill: "2023-10-17", status: "Completed" },
//   { rxId: "RX-10045", medicine: "Cetirizine", doctor: "Dr. Anil Gupta", date: "2024-02-10", dosage: "1 tablet at night before sleep", diagnosis: "Allergic Rhinitis", validTill: "2024-03-10", status: "Active" },
//   { rxId: "RX-10046", medicine: "Aspirin 100mg", doctor: "Dr. Peter Norton", date: "2023-11-05", dosage: "1 tablet daily after food", diagnosis: "Heart Care Preventative", validTill: "2024-11-05", status: "Active" },
//   { rxId: "RX-10047", medicine: "Metformin 500mg", doctor: "Dr. Priya Patel", date: "2024-01-15", dosage: "1 tablet twice a day with meals", diagnosis: "Type 2 Diabetes", validTill: "2024-07-15", status: "Active" },
//   { rxId: "RX-10048", medicine: "Atorvastatin 10mg", doctor: "Dr. Peter Norton", date: "2024-01-15", dosage: "1 tablet daily at night", diagnosis: "High Cholesterol", validTill: "2024-07-15", status: "Active" },
//   // Devices
//   { rxId: "DEV-2001", medicine: "Digital Thermometer", doctor: "Dr. Sarah Smith", date: "2023-12-01", dosage: "Use under tongue or armpit when fever suspected", diagnosis: "Home Monitoring", validTill: "Lifetime", status: "Completed" },
//   { rxId: "DEV-2002", medicine: "BP Monitor", doctor: "Dr. Peter Norton", date: "2023-12-01", dosage: "Check BP twice weekly morning and night", diagnosis: "Hypertension Monitoring", validTill: "Lifetime", status: "Active" },
//   { rxId: "DEV-2003", medicine: "Pulse Oximeter", doctor: "Dr. Rahul Sharma", date: "2023-10-12", dosage: "Check O2 levels if experiencing shortness of breath", diagnosis: "Respiratory Monitoring", validTill: "Lifetime", status: "Active" },
//   { rxId: "DEV-2004", medicine: "Glucometer Kit", doctor: "Dr. Priya Patel", date: "2024-01-15", dosage: "Check fasting blood sugar every Monday", diagnosis: "Type 2 Diabetes Monitoring", validTill: "Lifetime", status: "Active" },
//   { rxId: "DEV-2005", medicine: "Nebulizer Machine", doctor: "Dr. Anil Gupta", date: "2024-02-10", dosage: "Use with prescribed respules twice daily during flare-ups", diagnosis: "Asthma/Rhinitis", validTill: "Lifetime", status: "Active" },
//   // Personal Care
//   { rxId: "PC-3001", medicine: "Face Wash", doctor: "Dr. Olivia Dermat", date: "2024-02-20", dosage: "Wash face twice daily (morning & night)", diagnosis: "Acne Control", validTill: "2024-08-20", status: "Active" },
//   { rxId: "PC-3002", medicine: "Hand Sanitizer", doctor: "Self Prescribed", date: "2024-01-01", dosage: "Apply palmful to hands briskly until dry", diagnosis: "Hygiene", validTill: "N/A", status: "Active" },
//   { rxId: "PC-3003", medicine: "Sunscreen SPF 50", doctor: "Dr. Olivia Dermat", date: "2024-02-20", dosage: "Apply 20 mins before sun exposure, reapply every 3 hrs", diagnosis: "UV Protection", validTill: "2024-08-20", status: "Active" },
//   { rxId: "PC-3004", medicine: "Moisturizing Lotion", doctor: "Dr. Olivia Dermat", date: "2024-02-20", dosage: "Apply generously post shower on damp skin", diagnosis: "Dry Skin Care", validTill: "2024-08-20", status: "Active" },
//   // Surgicals
//   { rxId: "SUR-4001", medicine: "Surgical Mask (50pcs)", doctor: "Preventative", date: "2024-01-10", dosage: "Wear standard 3-ply when visiting clinics", diagnosis: "Infection Prevention", validTill: "N/A", status: "Active" },
//   { rxId: "SUR-4002", medicine: "Crepe Bandage", doctor: "Dr. Ortho Singh", date: "2024-03-01", dosage: "Wrap firmly around sprained ankle, remove while sleeping", diagnosis: "Ankle Sprain", validTill: "2024-04-01", status: "Active" },
//   { rxId: "SUR-4003", medicine: "Sterile Gauze", doctor: "Dr. Ortho Singh", date: "2024-03-01", dosage: "Use to dress wound daily with antiseptic", diagnosis: "Wound Care", validTill: "2024-04-01", status: "Active" },
//   // Fitness
//   { rxId: "FIT-5001", medicine: "Fitness Band", doctor: "Dietitian Mark", date: "2024-01-05", dosage: "Wear daily. Target 10,000 steps minimum", diagnosis: "Weight Management", validTill: "Lifetime", status: "Active" },
//   { rxId: "FIT-5002", medicine: "Whey Protein 1kg", doctor: "Dietitian Mark", date: "2024-01-05", dosage: "1 scoop post-workout with water", diagnosis: "Muscle Recovery", validTill: "2024-06-05", status: "Active" },
//   { rxId: "FIT-5003", medicine: "Yoga Mat", doctor: "Physical Trainer", date: "2024-01-05", dosage: "Use for 30 minutes morning stretching routine", diagnosis: "Flexibility & Core", validTill: "Lifetime", status: "Active" },
//   // Pet Care
//   { rxId: "PET-6001", medicine: "Pet Shampoo", doctor: "Vet Dr. Barker", date: "2024-02-15", dosage: "Bathe once every 15 days", diagnosis: "Flea Prevention & Hygiene", validTill: "2025-02-15", status: "Active" },
//   { rxId: "PET-6002", medicine: "Tick & Flea Spray", doctor: "Vet Dr. Barker", date: "2024-02-15", dosage: "Spray lightly on coat before parks. Avoid eyes.", diagnosis: "Tick Infestation Preventative", validTill: "2024-08-15", status: "Active" },
//   { rxId: "PET-6003", medicine: "Pet Multivitamins", doctor: "Vet Dr. Barker", date: "2024-02-15", dosage: "1 chewable tablet daily with dinner", diagnosis: "Joint & Coat Health", validTill: "2024-05-15", status: "Active" },
//   // Ayush & Homeopathy
//   { rxId: "AYU-7001", medicine: "Ayush Kadha", doctor: "Ayurvedic Dr. Rao", date: "2023-11-20", dosage: "1 cup warm decoction early morning empty stomach", diagnosis: "Immune Support", validTill: "2024-05-20", status: "Completed" },
//   { rxId: "AYU-7002", medicine: "Ashwagandha Powder", doctor: "Ayurvedic Dr. Rao", date: "2024-02-01", dosage: "1 tsp with warm milk before bedtime", diagnosis: "Stress & Sleep Management", validTill: "2024-08-01", status: "Active" },
//   { rxId: "AYU-7003", medicine: "Triphala Churna", doctor: "Ayurvedic Dr. Rao", date: "2024-02-01", dosage: "1 tsp with warm water post dinner", diagnosis: "Digestive Health", validTill: "2024-08-01", status: "Active" },
//   { rxId: "HOM-8001", medicine: "Homeo Cold Drops", doctor: "Homeopath Dr. Hahn", date: "2023-12-10", dosage: "10 drops in 1/4 cup water thrice daily", diagnosis: "Acute Coryza", validTill: "2023-12-25", status: "Completed" },
//   { rxId: "HOM-8002", medicine: "Homeo Digest Syrup", doctor: "Homeopath Dr. Hahn", date: "2024-03-10", dosage: "2 teaspoons before major meals", diagnosis: "Gastric Disturbance", validTill: "2024-05-10", status: "Active" }
// ];

async function seedPrescriptions() {
  try {
    const user = await User.findOne();
    if (!user) {
      console.log('No users found in database! Please register an account first on the frontend.');
      process.exit();
    }
    
    console.log(`Injecting prescriptions for active user: ${user.name} (ID: ${user.id})...`);
    
    // Wipe existing ones
    await Prescription.destroy({ where: {} });

    // Inject
    // const populated = mockPrescriptions.map(rx => ({
    //   ...rx,
    //   userId: user.id
    // }));
    
    await Prescription.bulkCreate(populated);
    console.log('Success! Prescriptions securely attached to your SQL database.');
    process.exit();
  } catch (error) {
    console.error('Fatal Seed Error:', error);
    process.exit(1);
  }
}

sequelize.sync({ alter: true }).then(seedPrescriptions).catch(err => {
  console.error('DB Sync Error:', err);
  process.exit(1);
});
