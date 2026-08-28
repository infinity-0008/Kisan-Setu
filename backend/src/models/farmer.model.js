import mongoose, { Schema, model } from "mongoose";

const landParcelsSchema = new Schema({
  area: { type: Number, required: true },
  geoRef: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      validate: [arr => arr.length === 2, "Coordinates must be [lon, lat]"],
    },
  },
  soilType: { type: String, enum: ["clay", "sandy", "loamy", "black", "alluvial"], default: "loamy" },
  irrigation: { type: String, enum: ["rainfed", "canal", "wells", "tank"], default: "rainfed" },
}, { _id: false, timestamps: true });

const cropSownSchema = new Schema({
  parcelId: { type: Schema.Types.ObjectId, ref: "LandParcel" },
  cropType: { type: String, required: true },
  sownDate: { type: Date, default: Date.now },
}, { _id: false });

const farmerSchema = new Schema(
  {
    kisanId: {
      type: String,
      required: [true, "Kisan ID is required"],
      unique: true,
    },
    name: { type: String, required: [true, "Farmer name is required"] },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      validate: {
        validator: (v) => /^\d{10}$/.test(v),
        message: "Mobile number must be 10 digits",
      },
    },
    email: { type: String, lowercase: true, validate: { validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: "Invalid email" } },
    state: { type: String, required: true },
    district: { type: String, required: true },
    village: { type: String },
    landHolding: { type: Number, default: 0, description: "Total land holding in acres" },
    landParcels: [landParcelsSchema],
    cropsGrown: [{ type: String, trim: true }],
    beneficiaryStatus: {
      pmKisan: { type: Boolean, default: false },
      pmfby: { type: Boolean, default: false },
      kcc: { type: Boolean, default: false },
      pmDhanDhanyaKrishi: { type: Boolean, default: false },
    },
    profileVerified: { type: Boolean, default: false },
    agriStackLastSynced: { type: Date },
    avatar: { type: String },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    role: { type: String, enum: ["farmer", "cscOperator", "admin"], default: "farmer" },
    sessionToken: { type: String, select: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for geo queries
farmerSchema.index({ "landParcels.geoRef": "2dsphere" });

export default model("Farmer", farmerSchema);