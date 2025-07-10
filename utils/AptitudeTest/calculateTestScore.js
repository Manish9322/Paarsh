// lib/scoreUtils.js
export const calculateScore = (questions, answers) => {
  let score = 0;
  const correctedAnswers = questions.map((q) => {
    const question = q.question; // Access the populated question object
    const studentAnswer = answers[question._id]; // Use question._id for answer lookup
    const correctAnswer = question.correctAnswer; // Directly use correctAnswer from Question model
    const isCorrect = studentAnswer === correctAnswer;

    if (isCorrect) {
      score++;
    }

    return {
      ...q,
      selectedAnswer: studentAnswer !== undefined ? studentAnswer : -1,
      isCorrect,
      correctAnswer,
    };
  });

  const percentage = Math.round((score / questions.length) * 100);

  return {
    score,
    percentage,
    correctedAnswers,
  };
};