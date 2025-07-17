import { NextResponse } from "next/server";
import Question from "../../../../../../models/Question.model";

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    
    const deletedQuestion = await Question.findByIdAndDelete(id);
    
    if (!deletedQuestion) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { message: "Error deleting question", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const data = await req.json();
    
    // Validate the question data
    if (!data.question || !data.options || !data.category || !data.correctAnswer) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure exactly one option is marked as correct
    const correctOptions = data.options.filter(opt => opt.isCorrect);
    if (correctOptions.length !== 1) {
      return NextResponse.json(
        { message: "Exactly one option must be marked as correct" },
        { status: 400 }
      );
    }

    // Ensure correctAnswer matches the correct option
    const correctOption = correctOptions[0];
    if (correctOption.text !== data.correctAnswer) {
      return NextResponse.json(
        { message: "correctAnswer must match the text of the correct option" },
        { status: 400 }
      );
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      {
        question: data.question,
        options: data.options,
        correctAnswer: data.correctAnswer,
        category: data.category,
        explanation: data.explanation,
        isActive: true
      },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedQuestion,
      message: "Question updated successfully"
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { message: "Error updating question", error: error.message },
      { status: 500 }
    );
  }
} 