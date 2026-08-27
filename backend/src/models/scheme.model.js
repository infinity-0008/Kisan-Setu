import mongoose, { Schema, model } from "mongoose";

const schemeSchema = new Schema(
  {
    schemeCode: {
      type: String,
      required: [true, "Scheme code is required"],
      unique: true,
    },
    name: { type: String, required: [true, "Scheme name is required"] },
    description: { type: String },
    eligibilityCriteria: { type: String, required: true },
    benefits: [{ type: String, trim: true }],
    category: { type: String, enum: ["income-support", "insurance", "credit", "subsidy", "procurement"], default: "income-support" },
    state: { type: String, required: true },
    centralSector: { type: Boolean, default: false },
    documentsRequired: [{ type: String, trim: true }],
    applicationProcess: { type: String },
    embedding: { type: [Number], index: "vector" }, // for RAG vector search
    source: { type: String, default: "kisan-setu-curated" }, // "bharat-vistaar" | "kisan-setu-curated"
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for state-based filtering + vector search
schemeSchema.index({ state: 1, isActive: 1 });
schemeSchema.index({ embedding: "vector" });

export default model("Scheme", schemeSchema);