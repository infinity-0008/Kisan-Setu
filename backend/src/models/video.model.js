import mongoose, { Schema, model } from "mongoose";

const videoSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    embedUrl: { type: String, required: true }, // YouTube embed URL
    thumbnail: { type: String },
    category: {
      type: String,
      enum: ["pest-management", "irrigation", "soil-health", "fertilizer", "general-farming", "market-prices", "scheme-guidance"],
      required: true,
    },
    cropTags: [{ type: String, trim: true }], // ["wheat", "rice", etc.]
    language: { type: String, default: "hi" }, // Hindi by default
    sourceChannel: { type: String, default: "DD Kisan" },
    duration: { type: Number }, // seconds
    views: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "Farmer" }, // admin who added it
  },
  { timestamps: true }
);

videoSchema.index({ category: 1, isActive: 1 });
videoSchema.index({ cropTags: 1 });
videoSchema.index({ language: 1 });

export default model("Video", videoSchema);
