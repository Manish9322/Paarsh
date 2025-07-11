// lib/scoreUtils.js
export const calculateScore = (questions, answers) => {
  let score = 0;
  const correctedAnswers = questions.map((q) => {
    const question = q.question; // Access the populated question object
    const studentAnswer = answers[question._id]; // Use question._id for answer lookup
    
    // Find the correct answer index from options array
    const correctAnswerIndex = question.options.findIndex(opt => opt.isCorrect);
    const isCorrect = studentAnswer === correctAnswerIndex;

    if (isCorrect) {
      score++;
    }

    return {
      ...q,
      selectedAnswer: studentAnswer !== undefined ? studentAnswer : -1,
      isCorrect,
      correctAnswer: correctAnswerIndex,
      explanation: question.explanation // Include explanation in response
    };
  });

  const percentage = Math.round((score / questions.length) * 100);

  return {
    score,
    percentage,
    correctedAnswers,
    totalQuestions: questions.length
  };
};