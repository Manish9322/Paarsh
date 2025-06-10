     const mongoose = require("mongoose");
     
     const userPracticeAttemptSchema = new mongoose.Schema(
       {
         userId: {
           type: mongoose.Schema.Types.ObjectId,
           ref: "User",
           required: true,
         },
         practiceTestId: {
           type: mongoose.Schema.Types.ObjectId,
           ref: "PracticeTest",
           required: true,
         },
         completedAt: {
           type: Date,
           required: true,
           default: Date.now,
         },
         score: {
           type: Number,
           required: false,
         },
         answers: [
           {
             questionId: {
               type: mongoose.Schema.Types.ObjectId,
               required: true,
             },
             selectedAnswer: {
               type: String,
               required: true,
             },
             isCorrect: {
               type: Boolean,
               required: true,
             },
           },
         ],
       },
       { timestamps: true }
     );

     const UserPracticeAttemptModel =
       mongoose.models.UserPracticeAttempt ||
       mongoose.model("UserPracticeAttempt", userPracticeAttemptSchema);

     module.exports = UserPracticeAttemptModel;