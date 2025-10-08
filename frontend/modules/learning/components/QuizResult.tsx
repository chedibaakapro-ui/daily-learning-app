'use client';

import { QuizResult } from '../core/LearningApi';

interface QuizResultProps {
  result: QuizResult;
  onBackToDaily: () => void;
  darkMode?: boolean;
}

export default function QuizResultView({ result, onBackToDaily, darkMode = false }: QuizResultProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Celebration Header */}
      <div className="text-center mb-12 animate-completion-appear">
        {/* Trophy */}
        <div className="mb-8 animate-trophy-bounce">
          <span className="text-9xl">{result.passed ? '' : ''}</span>
        </div>

        {/* Title */}
        <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
          darkMode ? 'text-slate-100' : 'text-slate-900'
        }`}>
          <span className={`bg-gradient-to-r ${
            darkMode
              ? 'from-blue-300 via-purple-300 to-indigo-300'
              : 'from-blue-700 via-purple-700 to-indigo-700'
          } bg-clip-text text-transparent`}>
            {result.passed ? 'Excellent Work!' : 'Good Effort!'}
          </span>
        </h2>

        <p className={`text-lg font-medium ${
          darkMode ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {result.passed 
            ? 'You\'ve mastered this topic! ' 
            : 'Keep learning and try again next time'}
        </p>
      </div>

      {/* Score Card */}
      <div className={`rounded-3xl overflow-hidden border-2 backdrop-blur-xl shadow-2xl mb-8 ${
        darkMode
          ? 'bg-gradient-to-br from-slate-900/95 via-purple-900/30 to-blue-900/30 border-purple-600'
          : 'bg-gradient-to-br from-white/95 via-purple-50 to-blue-50 border-purple-400'
      }`}>
        <div className="p-12">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
              darkMode
                ? 'bg-slate-800/50 border-slate-700'
                : 'bg-white/70 border-slate-200'
            }`}>
              <p className={`text-sm font-medium mb-2 ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Your Score
              </p>
              <p className={`text-3xl font-bold ${
                darkMode ? 'text-purple-400' : 'text-purple-700'
              }`}>
                {result.score}/{result.totalQuestions}
              </p>
            </div>

            <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
              darkMode
                ? 'bg-slate-800/50 border-slate-700'
                : 'bg-white/70 border-slate-200'
            }`}>
              <p className={`text-sm font-medium mb-2 ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Percentage
              </p>
              <p className={`text-3xl font-bold ${
                darkMode ? 'text-blue-400' : 'text-blue-700'
              }`}>
                {result.percentage}%
              </p>
            </div>

            <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
              darkMode
                ? 'bg-slate-800/50 border-slate-700'
                : 'bg-white/70 border-slate-200'
            }`}>
              <p className={`text-sm font-medium mb-2 ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Status
              </p>
              <p className={`text-3xl font-bold ${
                result.passed
                  ? darkMode ? 'text-green-400' : 'text-green-700'
                  : darkMode ? 'text-orange-400' : 'text-orange-700'
              }`}>
                {result.passed ? ' Passed' : 'Review'}
              </p>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={onBackToDaily}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-xl hover:scale-105 bg-gradient-to-r ${
              darkMode
                ? 'from-blue-600 via-purple-600 to-indigo-600'
                : 'from-blue-700 via-purple-700 to-indigo-700'
            } text-white`}
          >
             Continue Learning 
          </button>
        </div>
      </div>

      {/* Answer Review */}
      <div className="space-y-6">
        <h3 className={`text-2xl font-bold mb-6 ${
          darkMode ? 'text-slate-100' : 'text-slate-900'
        }`}>
          Review Your Answers
        </h3>

        {result.results.map((answer, index) => (
          <div
            key={answer.questionId}
            className={`rounded-2xl overflow-hidden border-2 backdrop-blur-xl shadow-lg ${
              answer.isCorrect
                ? darkMode
                  ? 'bg-green-900/20 border-green-700'
                  : 'bg-green-50 border-green-300'
                : darkMode
                ? 'bg-red-900/20 border-red-700'
                : 'bg-red-50 border-red-300'
            }`}
          >
            <div className="p-6">
              {/* Question Number & Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                    answer.isCorrect
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                      : 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`text-lg font-bold ${
                    answer.isCorrect
                      ? darkMode ? 'text-green-400' : 'text-green-700'
                      : darkMode ? 'text-red-400' : 'text-red-700'
                  }`}>
                    {answer.isCorrect ? ' Correct' : ' Incorrect'}
                  </span>
                </div>
              </div>

              {/* Answer Details */}
              <div className="space-y-2">
                <p className={`text-sm font-medium ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Your answer: <span className="font-bold">{answer.selectedOption}</span>
                </p>
                {!answer.isCorrect && (
                  <p className={`text-sm font-medium ${
                    darkMode ? 'text-green-400' : 'text-green-700'
                  }`}>
                    Correct answer: <span className="font-bold">{answer.correctOption}</span>
                  </p>
                )}
                {answer.explanation && (
                  <p className={`text-sm mt-3 p-3 rounded-xl ${
                    darkMode
                      ? 'bg-slate-800/50 text-slate-300'
                      : 'bg-white/70 text-slate-700'
                  }`}>
                    <span className="font-bold">Explanation:</span> {answer.explanation}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes completion-appear {
          0% { transform: scale(0.9) translateY(50px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        @keyframes trophy-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }

        .animate-completion-appear {
          animation: completion-appear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-trophy-bounce {
          animation: trophy-bounce 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
