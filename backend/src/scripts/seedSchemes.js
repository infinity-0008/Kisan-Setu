import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const schemeSchema = new mongoose.Schema(
  {
    schemeCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    eligibilityCriteria: { type: String, required: true },
    benefits: [{ type: String }],
    category: { type: String },
    state: { type: String },
    centralSector: { type: Boolean, default: false },
    documentsRequired: [{ type: String }],
    applicationProcess: { type: String },
    embedding: { type: [Number] },
    source: { type: String, default: "kisan-setu-curated" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Scheme = mongoose.model("Scheme", schemeSchema);

const schemes = [
  {
    schemeCode: "PM-KISAN",
    name: "PM-KISAN Samman Nidhi",
    description:
      "Income support of ₹6,000 per year to all farmer families, paid in 3 equal instalments of ₹2,000.",
    eligibilityCriteria:
      "All farmer families with cultivable land holding. Subject to exclusions: institutional landholders, former/current constitutional post holders, serving/retired officers, income taxpayers, professionals.",
    benefits: [
      "₹6,000 per year in 3 instalments of ₹2,000 each",
      "Direct benefit transfer to bank account",
      "No application needed if already registered",
    ],
    category: "income-support",
    state: "All India",
    centralSector: true,
    documentsRequired: [
      "Aadhaar card",
      "Bank account details",
      "Land registration documents",
    ],
    applicationProcess:
      "Register at pm-kisan.gov.in or through nearest CSC. Verification done by state government.",
    source: "pm-kisan.gov.in",
  },
  {
    schemeCode: "PMFBY",
    name: "Pradhan Mantri Fasal Bima Yojana",
    description:
      "Crop insurance scheme providing protection against crop loss due to natural calamities, pests, and diseases.",
    eligibilityCriteria:
      "All farmers including sharecroppers and tenant farmers growing notified crops in notified areas. Premium: 2% for Kharif, 1.5% for Rabi, 5% for commercial/horticultural crops.",
    benefits: [
      "Low premium rates (1.5% to 5% of sum insured)",
      "Full sum insured coverage",
      "Quick claim settlement through remote sensing and drones",
    ],
    category: "insurance",
    state: "All India",
    centralSector: false,
    documentsRequired: [
      "Aadhaar card",
      "Bank account details",
      "Land records (khata/khasra)",
      "Sowing certificate",
    ],
    applicationProcess:
      "Apply through CSC, bank, or insurance company before cut-off date. Coverage is automatic for loanee farmers.",
    source: "pmfby.gov.in",
  },
  {
    schemeCode: "KCC",
    name: "Kisan Credit Card",
    description:
      "Provides affordable credit to farmers for their agricultural needs including crop production, post-harvest expenses, and maintenance of farm assets.",
    eligibilityCriteria:
      "All farmers, sharecroppers, tenant farmers, and Self Help Groups (SHGs) or Joint Liability Groups (JLGs) of farmers.",
    benefits: [
      "Credit at 4% p.a. (with prompt repayment)",
      "Flexible repayment schedule",
      "Coverage under PMJJBY and PMSBY",
      "Covers crop production, animal husbandry, fisheries",
    ],
    category: "credit",
    state: "All India",
    centralSector: false,
    documentsRequired: [
      "Aadhaar card",
      "PAN card",
      "Land documents",
      "Passport-size photo",
    ],
    applicationProcess:
      "Apply at any commercial bank, cooperative bank, or RRB with land documents.",
    source: "nabard.org",
  },
  {
    schemeCode: "PM-DDKY",
    name: "PM Dhan Dhanya Krishi Yojana",
    description:
      "Comprehensive scheme to improve crop productivity, promote sustainable agriculture, and enhance farmer income through convergence of existing schemes.",
    eligibilityCriteria:
      "Farmers in identified 100 districts with low productivity, moderate crop intensity, and below-average credit parameters. Priority to small and marginal farmers.",
    benefits: [
      "Convergence of PM-KISAN, PMFBY, KCC benefits",
      "Soil health card based recommendations",
      "Water conservation through micro-irrigation",
      "Formation of FPOs for collective bargaining",
    ],
    category: "subsidy",
    state: "All India",
    centralSector: true,
    documentsRequired: [
      "Aadhaar card",
      "Land records",
      "Soil health card",
      "Bank account details",
    ],
    applicationProcess:
      "Apply through District Agriculture Office or CSC. District-level selection based on convergence of multiple parameters.",
    source: "agricoop.nic.in",
  },
  {
    schemeCode: "PM-KUSUM",
    name: "PM-KUSUM Solar Pump Scheme",
    description:
      "Provides solar energy solutions to farmers for grid connectivity, standalone solar pumps, and solarization of existing pumps.",
    eligibilityCriteria:
      "All farmers, including those with existing diesel pumps. Priority to small and marginal farmers and those in water-stressed areas.",
    benefits: [
      "60% subsidy on solar pump cost",
      "Solar power plant on barren land earns income",
      "Reduced electricity bills",
    ],
    category: "subsidy",
    state: "All India",
    centralSector: true,
    documentsRequired: [
      "Aadhaar card",
      "Land records",
      "Bank account details",
    ],
    applicationProcess:
      "Apply at DISCOM office or through state agriculture department portal.",
    source: "mnre.gov.in",
  },
  {
    schemeCode: "SMAM",
    name: "Sub-Mission on Agricultural Mechanization",
    description:
      "Promotes farm mechanization through subsidies on purchase of agricultural machinery and equipment.",
    eligibilityCriteria:
      "All farmers. Higher subsidy for SC/ST, small and marginal farmers, and tribes. 50% subsidy for general, 60% for SC/ST, and 80% for tribal.",
    benefits: [
      "Up to 80% subsidy on farm machinery",
      "Custom Hiring Centers support",
      "Agricultural Machinery Banks",
    ],
    category: "subsidy",
    state: "All India",
    centralSector: false,
    documentsRequired: [
      "Aadhaar card",
      "Land records",
      "Bank account details",
      "Caste certificate (for SC/ST)",
    ],
    applicationProcess:
      "Apply through dbtagriculture.nic.in or nearest CSC.",
    source: "agricoop.nic.in",
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "Abhayyadav" });
    console.log("Connected to MongoDB");

    // Drop old indexes that conflict
    try {
      await Scheme.collection.dropIndex("slug_1");
      console.log("Dropped slug_1 index");
    } catch (e) {
      // Index doesn't exist, that's fine
    }

    await Scheme.deleteMany({});
    console.log("Cleared existing schemes");

    await Scheme.insertMany(schemes);
    console.log(`Seeded ${schemes.length} schemes`);

    await mongoose.connection.close();
    console.log("Done!");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedDB();
