import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import AdminModel from "../../../../../models/Admin.model";
import _db from "../../../../../utils/db";
import validator from "validator";


_db();

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    // Check if admin already exists
    const existingAdmin = await AdminModel.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json({ error: "Admin already registered" }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new AdminModel({
      name,
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    return NextResponse.json({ message: "Admin registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Admin Registration Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
