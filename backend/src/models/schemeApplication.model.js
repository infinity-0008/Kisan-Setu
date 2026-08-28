import mongoose, { Schema, model } from "mongoose";

const schemeApplicationSchema = new Schema(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: "Farmer", required: true },
    schemeCode: { type: String, required: true },
    schemeName: { type: String, required: true },
    status: {
      type: String,
      enum: ["eligible", "applied", "pending_documents", "approved", "rejected", "escalated"],
      default: "eligible",
    },
    documentsSubmitted: [{ type: String }],
    remarks: { type: String },
    appliedAt: { type: Date },
    decidedAt: { type: Date },
    escaltionReason: { type: String },
  },
  { timestamps: true }
);

schemeApplicationSchema.index({ farmerId: 1, schemeCode: 1 });
schemeApplicationSchema.index({ farmerId: 1, status: 1 });

export default model("SchemeApplication", schemeApplicationSchema);
