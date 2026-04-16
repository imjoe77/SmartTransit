import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { UserModel } from "@/models/User";
import { RouteModel } from "@/models/Route";
import { withAuth, toPlain } from "@/lib/api-utils";

const allowedDepartments = ["CSE", "ECE", "ME", "CIVIL", "MBA"];

async function findSessionUser(session) {
  const id = `${session?.user?.id || ""}`.trim();
  if (id && Types.ObjectId.isValid(id)) {
    const byId = await UserModel.findById(id).populate("studentProfile.preferredRouteId").lean();
    if (byId) return byId;
  }

  const email = `${session?.user?.email || ""}`.trim().toLowerCase();
  if (email) {
    return UserModel.findOne({ email })
      .populate("studentProfile.preferredRouteId")
      .lean();
  }

  return null;
}

async function ensureSessionUser(session) {
  const existing = await findSessionUser(session);
  if (existing) return existing;

  const email = `${session?.user?.email || ""}`.trim().toLowerCase();
  if (!email) return null;

  const role = session?.user?.role || "student";
  try {
    const created = await UserModel.create({
      name: session?.user?.name || "",
      email,
      image: session?.user?.image || "",
      role,
      studentProfile: {
        rollNumber: "",
        department: "",
        year: null,
        preferredRouteId: null,
        boardingStop: "",
      },
    });

    return UserModel.findById(created._id).populate("studentProfile.preferredRouteId").lean();
  } catch {
    return UserModel.findOne({ email })
      .populate("studentProfile.preferredRouteId")
      .lean();
  }
}

export async function GET() {
  return withAuth(async (session) => {
    try {
      const user = await ensureSessionUser(session);

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ user: toPlain(user) });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to load profile", details: error.message },
        { status: 500 }
      );
    }
  });
}

export async function PATCH(request) {
  return withAuth(async (session) => {
    try {
      console.log("[Profile PATCH] Session:", { 
        userId: session?.user?.id, 
        email: session?.user?.email,
        role: session?.user?.role 
      });
      
      const body = await request.json();
      console.log("[Profile PATCH] Body:", body);
      
      const profilePatch = {};

      if (typeof body.rollNumber === "string") {
        profilePatch["studentProfile.rollNumber"] = body.rollNumber.trim();
      }
      if (typeof body.department === "string" && allowedDepartments.includes(body.department)) {
        profilePatch["studentProfile.department"] = body.department;
      }
      if (typeof body.year === "number" && body.year >= 1 && body.year <= 4) {
        profilePatch["studentProfile.year"] = body.year;
      }
      if (typeof body.boardingStop === "string") {
        profilePatch["studentProfile.boardingStop"] = body.boardingStop.trim();
      }
      
      // Top-level user fields
      if (typeof body.name === "string" && body.name.trim()) {
        profilePatch["name"] = body.name.trim();
      }
      if (typeof body.image === "string") {
        profilePatch["image"] = body.image.trim();
      }

      if (body.preferredRouteId) {
        const routeFilter = Types.ObjectId.isValid(body.preferredRouteId)
          ? { _id: body.preferredRouteId }
          : { routeId: body.preferredRouteId };
        const route = await RouteModel.findOne(routeFilter).select("_id stops").lean();
        if (!route) {
          return NextResponse.json({ error: "Preferred route not found" }, { status: 404 });
        }
        profilePatch["studentProfile.preferredRouteId"] = route._id;
      }

      const currentUser = await ensureSessionUser(session);
      if (!currentUser?._id) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const user = await UserModel.findByIdAndUpdate(
        currentUser._id,
        { $set: profilePatch },
        { new: true }
      )
        .populate("studentProfile.preferredRouteId")
        .lean();
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ user: toPlain(user) });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to update profile", details: error.message },
        { status: 500 }
      );
    }
  });
}
