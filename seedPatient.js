require('dotenv').config();
const mongoose = require('mongoose');
const patientModel = require('./patient/model/patientModel');
const connectDB = require('./config/mongodb');

const sampleData = {
  // Replace this with a real User ID from your 'usermasters' collection if you have one
  userId: new mongoose.Types.ObjectId(), 
  patientMeta: {
    fullName: "Anurag Kumar",
    initials: "AK",
    patientId: "HD-8204",
    memberSince: "12 Mar 2023",
    city: "Pune",
    state: "Maharashtra",
    contact: "+91 98765 14320",
    email: "anurag.v@email.com",
    dob: "24 Aug 1992",
    age: 33,
    gender: "Male"
  },
  profileSections: [
    {
      key: "basic",
      title: "Basic Information",
      icon: "account-badge",
      accent: "#1B998B",
      allowsSectionEdit: true,
      items: [
        { label: "Full Name", value: "Anurag Kumar" },
        { label: "Gender", value: "Male" },
        { label: "Date of Birth", value: "24 Aug 1992", helper: "Age 33" },
        { label: "Mobile", value: "+91 98765 14320" },
        { label: "Email", value: "anurag.v@email.com" },
        { label: "Address", value: "Baner, Pune, Maharashtra" }
      ]
    },
    {
      key: "medical",
      title: "Medical Information",
      icon: "heart-pulse",
      accent: "#EF476F",
      allowsSectionEdit: true,
      items: [
        { label: "Blood Group", value: "O+" },
        { label: "Height", value: "165 cm" },
        { label: "Weight", value: "64 kg" },
        { label: "Existing Conditions", value: "Hypertension, Hypothyroidism", helper: "Managed with medication" }
      ]
    }
  ]
};

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB...");

    // Remove existing profile for this patientId to avoid duplicates
    await patientModel.deleteOne({ "patientMeta.patientId": sampleData.patientMeta.patientId });

    const newPatient = new patientModel(sampleData);
    await newPatient.save();

    console.log("✅ Sample Data Saved Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error.message);
    process.exit(1);
  }
};

seedDatabase();
