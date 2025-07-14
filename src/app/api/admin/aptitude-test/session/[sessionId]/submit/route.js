// app/api/test/submit/route.js
import { NextResponse } from 'next/server';
import TestSession from '../../../../../../../../models/AptitudeTest/TestSession.model';
import Student from '../../../../../../../../models/AptitudeTest/Student.model';
import Question from '../../../../../../../../models/Question.model';
import { calculateScore } from '../../../../../../../../utils/AptitudeTest/calculateTestScore';
import _db from '../../../../../../../../utils/db';

export async function POST(request) {
  try {
    await _db(); // Connect to the database

    const { sessionId, answers } = await request.json();

    // Validate answers format
    if (!Array.isArray(answers) || !answers.every(a => 
      typeof a === 'object' && 
      'questionId' in a && 
      'selectedAnswer' in a && 
      'timeSpent' in a
    )) {
      return NextResponse.json(
        { success: false, message: 'Invalid answers format' },
        { status: 400 }
      );
    }

    // Find the test session and populate questions with full question details
    const session = await TestSession.findById(sessionId).populate({
      path: 'questions.question',
      model: Question,
      select: 'question options correctAnswer explanation'
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Test session not found' },
        { status: 404 }
      );
    }

    if (session.status === 'completed') {
      return NextResponse.json(
        { success: false, message: 'Test has already been submitted' },
        { status: 400 }
      );
    }

    // Calculate score using the updated calculateScore function
    const { score, percentage, correctedAnswers, isPassed } = calculateScore(
      session.questions,
      answers,
      session.passingPercentage
    );

    // Update session with results
    session.questions = correctedAnswers;
    session.endTime = new Date();
    session.score = score;
    session.percentage = percentage;
    session.status = 'completed';
    session.isPassed = isPassed;

    await session.save();

    // Update student test status
    await Student.findByIdAndUpdate(session.student, {
      testStatus: 'completed',
      testEndTime: new Date(),
      lastTestScore: score,
      lastTestPercentage: percentage,
      lastTestPassed: isPassed
    });

    // Format the response to avoid undefined question references
    const formattedAnswers = correctedAnswers.map(answer => {
      // Ensure we have the question object before accessing its properties
      const questionData = answer.question || {};
      
      return {
        questionId: questionData._id || answer._id,
        question: questionData.question || '',
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: answer.correctAnswer,
        isCorrect: answer.isCorrect,
        explanation: questionData.explanation || '',
        timeSpent: answer.timeSpent || 0
      };
    });

    return NextResponse.json({
      success: true,
      score,
      percentage,
      totalQuestions: session.questions.length,
      isPassed,
      correctedAnswers: formattedAnswers,
      message: isPassed ? 'Congratulations! You have passed the test.' : 'Unfortunately, you did not pass the test.'
    });
  } catch (error) {
    console.error('Error in test submission:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while submitting the test' },
      { status: 500 }
    );
  }
}