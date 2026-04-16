import mongoose, { Schema, model, type InferSchemaType, type Types } from "mongoose";

const panicAlertSchema = new Schema(
  {
    driverId: { type: String, required: true },
    busId: { type: String, required: true },
    routeId: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export type PanicAlertDocument = InferSchemaType<typeof panicAlertSchema> & {
  _id: Types.ObjectId;
};

export const PanicAlertModel = mongoose.models?.PanicAlert || model("PanicAlert", panicAlertSchema);
