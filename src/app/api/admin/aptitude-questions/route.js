import { NextResponse } from "next/server";
import Question from "../../../../../models/Question.model";

export async function GET() {
  try {
    const questions = await Question.find({}).sort({ createdAt: -1 });
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { message: "Error fetching questions", error: error.message },
      { status: 500 }
    );
  }
} 