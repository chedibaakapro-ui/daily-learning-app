'use client';

import { useState } from 'react';
import { QuizQuestion } from '../core/LearningApi';

interface QuizViewProps {
  questions: QuizQuestion[];
  onSubmit: (answers: { questionId: string; selectedOption: string }[]) => void;
  darkMode?: boolean;
}

export default function QuizView({ questions, onSubmit, darkMode = false }: QuizViewProps) {
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});

  const handleOptionSelect = (questionId: string, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmit = () => {
    const answerArray = Object.entries(answers).map(([questionId, selectedOption]) => ({
      questionId,
      selectedOption
    }));

    if (answerArray.length !== questions.length) {
      alert('Please answer all questions');
      return;
    }

    onSubmit(answerArray);
  };

  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className={`text-3xl font-bold mb-4 ${
          darkMode ? 'text-slate-100' : 'text-slate-900'
        }`}>
          <span className={`bg-gradient-to-r ${
            darkMode
              ? 'from-blue-300 via-purple-300 to-indigo-300'
              : 'from-blue-700 via-purple-700 to-indigo-700'
          } bg-clip-text text-transparent`}>
            Quiz Time! 
          </span>
        </h2>
        <p className={`text-lg font-medium ${
          darkMode ? 'text-slate-400' : 'text-slate-600'
        }`}>
          Answer {questions.length} questions to complete this topic
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((question, index) => {
          const selectedAnswer = answers[question.id];

          return (
            <div
              key={question.id}
              className={`rounded-3xl overflow-hidden border-2 backdrop-blur-xl shadow-xl ${
                darkMode
                  ? 'bg-slate-900/90 border-slate-700'
                  : 'bg-white/95 border-slate-200'
              }`}
            >
              <div className="p-8">
                {/* Question Number */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                    selectedAnswer
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : darkMode
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {index + 1}
                  </div>
                  <h3 className={`text-lg font-bold ${
                    darkMode ? 'text-slate-100' : 'text-slate-900'
                  }`}>
                    Question {index + 1}
                  </h3>
                </div>

                {/* Question Text */}
                <p className={`text-lg mb-6 ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {question.questionText}
                </p>

                {/* Options */}
                <div className="space-y-3">
                  {Object.entries(question.options).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => handleOptionSelect(question.id, key)}
                      className={`w-full text-left p-4 rounded-xl font-medium transition-all ${
                        selectedAnswer === key
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                          : darkMode
                          ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span className="font-bold mr-3">{key}.</span>
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      <div className="mt-12 text-center">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl ${
            allAnswered
              ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white hover:scale-105'
              : darkMode
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {allAnswered ? 'Submit Quiz ' : `Answer All Questions (${Object.keys(answers).length}/${questions.length})`}
        </button>
      </div>
    </div>
  );
}
