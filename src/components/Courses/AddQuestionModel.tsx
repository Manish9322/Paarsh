"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface Course {
  _id: string;
  courseName: string;
}

interface QuestionFormData {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
}

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({ isOpen, onClose, course }) => {
  const [formData, setFormData] = useState({
    qbName: "",
    skillTag: "",
    level: "Medium",
    questions: [
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
      },
    ],
  });

  const handleInputChange = (index: number, field: keyof QuestionFormData, value: string) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      return { ...prev, questions: newQuestions };
    });
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      const newOptions = [...newQuestions[questionIndex].options];
      newOptions[optionIndex] = value;
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        options: newOptions,
        correctAnswer: newOptions.includes(newQuestions[questionIndex].correctAnswer)
          ? newQuestions[questionIndex].correctAnswer
          : "",
      };
      return { ...prev, questions: newQuestions };
    });
  };

  const addNewQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: "",
          options: ["", "", "", ""],
          correctAnswer: "",
          explanation: "",
        },
      ],
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!course) {
      toast.error("No course selected.");
      return;
    }

    // Validate all questions
    for (const [index, question] of formData.questions.entries()) {
      if (!question.questionText || question.options.some((opt) => !opt) || !question.correctAnswer) {
        toast.error(`Please fill in all required fields for question ${index + 1}.`);
        return;
      }
      if (!question.options.includes(question.correctAnswer)) {
        toast.error(`Correct answer for question ${index + 1} must be one of the provided options.`);
        return;
      }
    }

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, courseId: course._id }),

      });

      const data = await response.json();
      
    } catch (error) {
      console.error("Error adding questions:", error);
      toast.error("Failed to add questions. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto invisible-scrollbar dark:bg-gray-800 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-lg">Add New Questions</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="qbName" className="text-sm">Question Bank Name</Label>
            <Input
              id="qbName"
              name="qbName"
              value={formData.qbName}
              onChange={(e) => setFormData((prev) => ({ ...prev, qbName: e.target.value }))}
              placeholder="e.g., JavaScript Basics"
              className="dark:bg-gray-700 text-sm py-1 h-9"
            />
          </div>
          <div>
            <Label htmlFor="skillTag" className="text-sm">Skill Tag</Label>
            <Input
              id="skillTag"
              name="skillTag"
              value={formData.skillTag}
              onChange={(e) => setFormData((prev) => ({ ...prev, skillTag: e.target.value }))}
              placeholder="e.g., Programming"
              className="dark:bg-gray-700 text-sm py-1 h-9"
            />
          </div>
          <div>
            <Label htmlFor="level" className="text-sm">Difficulty Level</Label>
            <Select
              value={formData.level}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, level: value }))}
            >
              <SelectTrigger className="dark:bg-gray-700 text-sm py-1 h-9">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.questions.map((question, qIndex) => (
            <div key={qIndex} className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Question {qIndex + 1}</Label>
                {formData.questions.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeQuestion(qIndex)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Remove
                  </Button>
                )}
              </div>
              <div>
                <Label htmlFor={`questionText-${qIndex}`} className="text-sm">Question Text</Label>
                <Textarea
                  id={`questionText-${qIndex}`}
                  value={question.questionText}
                  onChange={(e) => handleInputChange(qIndex, "questionText", e.target.value)}
                  placeholder="Enter the question"
                  className="dark:bg-gray-700 text-sm py-1 min-h-[80px]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Options</Label>
                {question.options.map((option, oIndex) => (
                  <Input
                    key={oIndex}
                    value={option}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                    placeholder={`Option ${oIndex + 1}`}
                    className="dark:bg-gray-700 text-sm py-1 h-9"
                    required
                  />
                ))}
              </div>
              <div>
                <Label htmlFor={`correctAnswer-${qIndex}`} className="text-sm">Correct Answer</Label>
                <Select
                  value={question.correctAnswer}
                  onValueChange={(value) => handleInputChange(qIndex, "correctAnswer", value)}
                  disabled={question.options.filter((opt) => opt.trim() !== "").length === 0}
                >
                  <SelectTrigger className="dark:bg-gray-700 text-sm py-1 h-9">
                    <SelectValue
                      placeholder={
                        question.options.filter((opt) => opt.trim() !== "").length === 0
                          ? "Enter options first"
                          : "Select correct answer"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {question.options
                      .filter((opt) => opt.trim() !== "")
                      .map((option, index) => (
                        <SelectItem key={index} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor={`explanation-${qIndex}`} className="text-sm">Explanation (Optional)</Label>
                <Textarea
                  id={`explanation-${qIndex}`}
                  value={question.explanation}
                  onChange={(e) => handleInputChange(qIndex, "explanation", e.target.value)}
                  placeholder="Explain why the correct answer is correct"
                  className="dark:bg-gray-700 text-sm py-1 min-h-[80px]"
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addNewQuestion}
            className="flex items-center gap-1 w-full"
          >
            <Plus size={16} /> Add Another Question
          </Button>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save
            </Button>
          </DialogFooter>
        </form>
        <style jsx>{`
          .invisible-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .invisible-scrollbar {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default AddQuestionModal;
