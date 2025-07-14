import { NextResponse } from "next/server";
import Question from "../../../../models/Question.model.js";
import _db from "../../../../utils/db.js";

await _db();

export async function GET() {
  try {
    const questions = await Question.find({});
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { message: "Error fetching questions" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const { questions } = await req.json();
    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { message: "Questions array is required" },
        { status: 400 },
      );
    }

    // Validate questions against schema
    const validQuestions = questions.filter((q) => {
      return (
        typeof q.question === "string" &&
        q.question.trim() !== "" &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.options.every(
          (opt) =>
            typeof opt.text === "string" &&
            opt.text.trim() !== "" &&
            typeof opt.isCorrect === "boolean",
        ) &&
        q.options.filter((opt) => opt.isCorrect).length === 1 &&
        typeof q.correctAnswer === "string" &&
        q.correctAnswer.trim() !== "" &&
        q.options.some(
          (opt) => opt.text === q.correctAnswer && opt.isCorrect,
        ) &&
        ["aptitude", "logical", "quantitative", "verbal", "technical"].includes(
          q.category,
        )
      );
    });

    if (validQuestions.length === 0) {
      return NextResponse.json(
        { message: "No valid questions provided" },
        { status: 400 },
      );
    }

    if (validQuestions.length > 100) {
      return NextResponse.json(
        { message: "Maximum 100 questions allowed" },
        { status: 400 },
      );
    }

    await Question.insertMany(validQuestions);
    return NextResponse.json(
      { message: `${validQuestions.length} questions added successfully` },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding questions:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
