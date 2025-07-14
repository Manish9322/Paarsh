// lib/scoreUtils.js
export const calculateScore = (questions, answers, passingPercentage = 40) => {
  let score = 0;
  let totalQuestions = questions.length;
  
  // Create a map of questionId to answer for easier lookup
  const answerMap = answers.reduce((map, answer) => {
    map[answer.questionId] = {
      selectedAnswer: answer.selectedAnswer,
      timeSpent: answer.timeSpent
    };
    return map;
  }, {});

  const correctedAnswers = questions.map((q) => {
    const question = q.question; // Access the populated question object
    const studentAnswer = answerMap[question._id.toString()]; // Get answer from map
    
    // Find the correct answer from options
    const correctOption = question.options.findIndex(opt => opt.text === question.correctAnswer);
    const isCorrect = studentAnswer && studentAnswer.selectedAnswer === correctOption;

    if (isCorrect) {
      score++;
    }

    return {
      ...q,
      selectedAnswer: studentAnswer ? studentAnswer.selectedAnswer : -1,
      timeSpent: studentAnswer ? studentAnswer.timeSpent : 0,
      isCorrect,
      correctAnswer: correctOption,
      explanation: question.explanation
    };
  });

  const percentage = Math.round((score / totalQuestions) * 100);
  const isPassed = percentage >= passingPercentage;

  return {
    score,
    percentage,
    correctedAnswers,
    totalQuestions,
    isPassed
  };
};