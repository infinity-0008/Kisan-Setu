import mongoose, { Schema, model } from "mongoose";

const mandiPriceCacheSchema = new Schema(
  {
    cropType: { type: String, required: true },
    mandiName: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, enum: ["quintal", "kg", "tonne"], default: "quintal" },
    fetchedAt: { type: Date, default: Date.now },
    state: { type: String }, // which state/mandi this price is for
  },
  { timestamps: true }
);

// Index for cron-based refresh
mandiPriceCacheSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 86400 }); // auto-delete after 24h

export default model("MandiPriceCache", mandiPriceCacheSchema);