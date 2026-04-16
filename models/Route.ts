import mongoose, { Schema, model, type InferSchemaType, type Types } from "mongoose";

const routeStopSchema = new Schema(
  {
    stopId: { type: String, required: true },
    name: { type: String, required: true },
    lat: { type: Number, required: true, default: 0 },
    lng: { type: Number, required: true, default: 0 },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const routeSchema = new Schema(
  {
    routeId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    stops: { type: [routeStopSchema], default: [] },
    assignedBuses: { type: [String], default: [] },
    schedule: {
      morningDeparture: { type: String, default: "" },
      eveningDeparture: { type: String, default: "" },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

export type RouteStop = InferSchemaType<typeof routeStopSchema>;
export type RouteDocument = InferSchemaType<typeof routeSchema> & { _id: Types.ObjectId };

export const RouteModel = mongoose.models?.Route || model("Route", routeSchema);
