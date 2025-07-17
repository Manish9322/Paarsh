import { NextResponse } from "next/server";
import Question from "../../../../../../models/Question.model";
import Papa from "papaparse";

export async function POST(req) {
  try {
    const data = await req.json();
    const { fileContent, fileType } = data;

    let questions = [];
    
    if (fileType === "json") {
      const parsedJson = JSON.parse(fileContent);
      // Extract questions array from the JSON structure
      const rawQuestions = parsedJson.questions || (Array.isArray(parsedJson) ? parsedJson : [parsedJson]);

      questions = rawQuestions.map(q => {
        // Find the correct option
        const correctOption = q.options.find(opt => opt.isCorrect);
        if (!correctOption) {
          throw new Error(`Question "${q.question}" has no correct option marked`);
        }

        return {
          question: q.question.trim(),
          options: q.options.map(opt => ({
            text: opt.text.trim(),
            isCorrect: opt.isCorrect
          })),
          correctAnswer: correctOption.text.trim(),
          category: q.category.toLowerCase().trim(),
          explanation: q.explanation ? q.explanation.trim() : "",
          isActive: true
        };
      });
    } else if (fileType === "csv") {
      const parsedData = Papa.parse(fileContent, { 
        header: true,
        skipEmptyLines: true 
      });
      
      if (!Array.isArray(parsedData.data)) {
        throw new Error("Invalid CSV format");
      }

      console.log("Raw CSV data:", parsedData.data);

      questions = parsedData.data
        .filter(row => row.question && row.correctAnswer && row.category)
        .map((row) => {
          // Create options array with correct structure
          const options = [
            { text: row.option1 || "", isCorrect: row.correctAnswer === row.option1 },
            { text: row.option2 || "", isCorrect: row.correctAnswer === row.option2 },
            { text: row.option3 || "", isCorrect: row.correctAnswer === row.option3 },
            { text: row.option4 || "", isCorrect: row.correctAnswer === row.option4 }
          ].filter(opt => opt.text); // Remove any empty options

          const question = {
            question: row.question.trim(),
            options,
            correctAnswer: row.correctAnswer.trim(),
            category: row.category.toLowerCase().trim(),
            explanation: row.explanation ? row.explanation.trim() : "",
            isActive: true
          };

          console.log("Transformed question:", question);
          return question;
        });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { message: "No valid questions found in file" },
        { status: 400 }
      );
    }

    console.log("Total questions to validate:", questions.length);

    // Validate each question against schema requirements
    const validCategories = ["aptitude", "logical", "quantitative", "verbal", "technical"];
    
    const validationResults = questions.map((q, index) => {
      const errors = [];

      // Basic field validation
      if (!q.question || typeof q.question !== 'string') errors.push('Invalid or missing question text');
      if (!q.correctAnswer || typeof q.correctAnswer !== 'string') errors.push('Invalid or missing correctAnswer');
      if (!q.category || !validCategories.includes(q.category)) errors.push(`Invalid category: ${q.category}. Must be one of: ${validCategories.join(', ')}`);
      
      // Options validation
      if (!Array.isArray(q.options)) {
        errors.push('Options must be an array');
      } else if (q.options.length !== 4) {
        errors.push(`Found ${q.options.length} options, exactly 4 required`);
      } else {
        // Validate each option
        q.options.forEach((opt, i) => {
          if (!opt.text || typeof opt.text !== 'string') {
            errors.push(`Option ${i + 1} has invalid or missing text`);
          }
          if (typeof opt.isCorrect !== 'boolean') {
            errors.push(`Option ${i + 1} has invalid or missing isCorrect flag`);
          }
        });

        // Validate that correctAnswer matches one of the options
        const hasCorrectAnswer = q.options.some(opt => 
          opt.text === q.correctAnswer && opt.isCorrect
        );
        if (!hasCorrectAnswer) {
          errors.push(`correctAnswer "${q.correctAnswer}" must match exactly one option text and be marked as correct`);
        }
      }

      return { index, question: q, errors };
    });

    const invalidQuestions = validationResults.filter(result => result.errors.length > 0);

    if (invalidQuestions.length > 0) {
      console.log("Validation failures:", invalidQuestions);
      return NextResponse.json(
        { 
          message: "Invalid question format in file",
          details: "Some questions failed validation. Check the specific errors below.",
          validationErrors: invalidQuestions.map(({ index, errors }) => ({
            questionIndex: index,
            errors
          }))
        },
        { status: 400 }
      );
    }

    // Insert questions
    await Question.insertMany(questions);

    return NextResponse.json({
      message: "Questions added successfully",
      success: true,
      count: questions.length
    });

  } catch (error) {
    console.error("Error in bulk upload:", error);
    return NextResponse.json(
      { 
        message: "Error processing file", 
        error: error.message,
        details: "Make sure your file follows the required format and contains valid data"
      },
      { status: 500 }
    );
  }
}
