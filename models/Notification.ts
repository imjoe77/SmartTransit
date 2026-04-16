import mongoose, { Schema, model, type InferSchemaType, type Types } from "mongoose";

const notificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["delay", "arrival", "alert", "info"],
      required: true,
    },
    message: { type: String, required: true },
    busId: { type: String, default: null },
    routeId: { type: String, default: null },
    targetRole: {
      type: String,
      enum: ["all", "student", "driver", "admin"],
      default: "all",
      index: true,
    },
    timestamp: { type: Date, default: Date.now, index: true },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

export type NotificationDocument = InferSchemaType<typeof notificationSchema> & {
  _id: Types.ObjectId;
};
export const NotificationModel = mongoose.models?.Notification || model("Notification", notificationSchema);
