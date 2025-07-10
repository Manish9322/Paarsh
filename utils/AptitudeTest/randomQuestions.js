// lib/questionUtils.js
import Question from '../../models/AptitudeTest/Question.model';

export const getRandomQuestions = async (count = 100) => {
  try {
    // Get questions by category to ensure balanced test
    const categories = ['aptitude', 'logical', 'quantitative', 'verbal', 'technical'];
    const questionsPerCategory = Math.floor(count / categories.length);
    const remainder = count % categories.length;
    
    let allQuestions = [];
    
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const categoryCount = questionsPerCategory + (i < remainder ? 1 : 0);
      
      const questions = await Question.aggregate([
        { $match: { category, isActive: true } },
        { $sample: { size: categoryCount } }
      ]);
      
      allQuestions = allQuestions.concat(questions);
    }
    
    // If we don't have enough questions, fill with random ones
    if (allQuestions.length < count) {
      const additionalNeeded = count - allQuestions.length;
      const additionalQuestions = await Question.aggregate([
        { 
          $match: { 
            isActive: true,
            _id: { $nin: allQuestions.map(q => q._id) }
          } 
        },
        { $sample: { size: additionalNeeded } }
      ]);
      
      allQuestions = allQuestions.concat(additionalQuestions);
    }
    
    // Shuffle the final array
    return shuffleArray(allQuestions);
  } catch (error) {
    console.error('Error getting random questions:', error);
    throw error;
  }
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};