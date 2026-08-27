import mongoose, { Schema, model } from "mongoose";

const cropListingSchema = new Schema(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: "Farmer", required: true },
    cropType: { type: String, required: true, trim: true },
    variety: { type: String, trim: true },
    quantity: { type: Number, required: true },
    unit: { type: String, enum: ["quintal", "kg", "tonne"], default: "quintal" },
    expectedPrice: { type: Number },
    mandiPriceRef: { type: Schema.Types.ObjectId, ref: "MandiPriceCache" },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      state: { type: String },
      district: { type: String },
    },
    status: { type: String, enum: ["listed", "sold", "expired"], default: "listed" },
    soldPrice: { type: Number },
    soldTo: { type: String },
    listedAt: { type: Date, default: Date.now },
    soldAt: { type: Date },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

cropListingSchema.index({ "location.latitude": 1, "location.longitude": 1 });
cropListingSchema.index({ farmerId: 1, status: 1 });
cropListingSchema.index({ cropType: 1, status: 1 });
cropListingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model("CropListing", cropListingSchema);
