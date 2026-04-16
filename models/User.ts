import mongoose, { Schema, model, type InferSchemaType, type Types } from "mongoose";

const studentProfileSchema = new Schema(
  {
    rollNumber: { type: String, default: "" },
    department: {
      type: String,
      enum: ["CSE", "ECE", "ME", "CIVIL", "MBA"],
      default: "",
    },
    year: { type: Number, min: 1, max: 4, default: null },
    preferredRouteId: { type: Schema.Types.ObjectId, ref: "Route", default: null },
    boardingStop: { type: String, default: "" },
    hasMonthlyPass: { type: Boolean, default: false },
    activeTrip: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true, index: true },
    image: { type: String, default: "" },
    role: {
      type: String,
      enum: ["student", "driver", "admin"],
      default: "student",
      index: true,
    },
    studentProfile: { type: studentProfileSchema, default: () => ({}) },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

export type UserRole = "student" | "driver" | "admin";
export type StudentProfile = InferSchemaType<typeof studentProfileSchema> & {
  preferredRouteId: Types.ObjectId | null;
};
export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: Types.ObjectId;
};

export const UserModel = mongoose.models?.User || model("User", userSchema);
