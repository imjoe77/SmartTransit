import mongoose, { Schema, model, type InferSchemaType, type Types } from "mongoose";

const boardingSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    busId: { type: String, required: true, index: true },
    routeId: { type: Schema.Types.ObjectId, ref: "Route", required: true },
    direction: { type: String, enum: ["toCollege", "toHome"], required: true },
    passType: { type: String, enum: ["monthly", "dayPass"], required: true },
    paymentId: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export type BoardingDocument = InferSchemaType<typeof boardingSchema> & { _id: Types.ObjectId };
export const BoardingModel = mongoose.models?.Boarding || model("Boarding", boardingSchema);
