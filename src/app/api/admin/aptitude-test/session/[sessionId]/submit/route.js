// app/api/test/submit/route.js
import { NextResponse } from 'next/server';
import TestSession from '../../../../../../../../models/AptitudeTest/TestSession.model';
import Student from '../../../../../../../../models/AptitudeTest/Student.model';
import { calculateScore } from '../../../../../../../../utils/AptitudeTest/calculateTestScore';
import _db from '../../../../../../../../utils/db';

export async function POST(request) {
  try {
    await _db(); // Connect to the database

    const { sessionId, answers } = await request.json();

    // Find the test session and populate questions
    const session = await TestSession.findById(sessionId).populate('questions.question');

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Test session not found' },
        { status: 404 }
      );
    }

    // Calculate score using the updated calculateScore function
    const { score, percentage, correctedAnswers } = calculateScore(session.questions, answers);

    // Update session with results
    session.questions = correctedAnswers;
    session.endTime = new Date();
    session.score = score;
    session.percentage = percentage;
    session.status = 'completed';

    await session.save();

    // Update student test status
    await Student.findByIdAndUpdate(session.student, {
      testStatus: 'completed',
      testEndTime: new Date(),
    });

    return NextResponse.json({
      success: true,
      score,
      percentage,
      totalQuestions: session.questions.length,
    });
  } catch (error) {
    console.error('Error in test submission:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}