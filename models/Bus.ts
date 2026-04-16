import mongoose, { Schema, model, type InferSchemaType, type Types } from "mongoose";

const busSchema = new Schema(
  {
    busId: { type: String, required: true, unique: true, index: true },
    routeId: { type: Schema.Types.ObjectId, ref: "Route", required: true, index: true },
    driverName: { type: String, default: "" },
    driverEmail: { type: String, default: "", index: true },
    status: {
      type: String,
      enum: ["active", "idle", "offline"],
      default: "idle",
      index: true,
    },
    currentStop: { type: String, default: "" },
    nextStop: { type: String, default: "" },
    eta: { type: Number, default: 0 },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    seatCapacity: { type: Number, default: 40 },
    seatsOccupied: { type: Number, default: 0 },
    departureTime: { type: String, default: "" }, // e.g., "08:30"
    direction: { 
      type: String, 
      enum: ["Towards College", "Towards Transit Loop"], 
      default: "Towards College" 
    },
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

export type BusDocument = InferSchemaType<typeof busSchema> & { _id: Types.ObjectId };
export const BusModel = mongoose.models?.Bus || model("Bus", busSchema);
