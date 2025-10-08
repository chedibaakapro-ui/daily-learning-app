'use client';

import { useLearning } from '@/modules/learning/core/LearningContainer';
import DailyTopicsView from '@/modules/learning/components/DailyTopicsView';
import TopicReader from '@/modules/learning/components/TopicReader';
import QuizView from '@/modules/learning/components/QuizView';
import QuizResultView from '@/modules/learning/components/QuizResult';
import { useState, useEffect, useRef } from 'react';

export default function HomePage() {
  const learning = useLearning();
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) setDarkMode(savedMode === 'true');
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
  };

  const getGreeting = () => {
    if (!mounted) return "Welcome Back";
    const hour = new Date().getHours();
    const name = "Champion";
    if (hour < 12) return `Good Morning, ${name}`;
    if (hour < 18) return `Good Afternoon, ${name}`;
    return `Good Evening, ${name}`;
  };

  if (learning.loading && learning.dailyTopics.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📚</div>
          <p className="text-slate-300 text-lg">Loading your daily topics...</p>
        </div>
      </div>
    );
  }

  if (learning.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
        <div className="text-center">
          <div className="text-6xl mb-4"></div>
          <p className="text-red-400 text-lg mb-4">{learning.error}</p>
          <button
            onClick={learning.loadDailyTopics}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`min-h-screen overflow-hidden relative transition-all duration-700 ${
        darkMode 
          ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950' 
          : 'bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50'
      }`}
    >
      {/* Ambient effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-20 -left-32 w-[600px] h-[600px] rounded-full blur-3xl transition-all duration-1000 ${
          darkMode ? 'bg-blue-900/20' : 'bg-blue-300/30'
        }`} style={{ animation: 'drift 25s ease-in-out infinite' }} />
        <div className={`absolute top-60 right-20 w-[700px] h-[700px] rounded-full blur-3xl transition-all duration-1000 ${
          darkMode ? 'bg-purple-900/20' : 'bg-purple-300/30'
        }`} style={{ animation: 'drift-reverse 30s ease-in-out infinite' }} />
      </div>

      {/* Floating particles */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className={`absolute animate-float-gentle transition-all duration-700 ${
                darkMode ? 'opacity-15' : 'opacity-25'
              }`}
              style={{
                left: `${(i * 6 + 5) % 95}%`,
                top: `${(i * 9 + 3) % 95}%`,
                animationDelay: `${(i * 0.5) % 15}s`,
                fontSize: `${10 + (i % 4) * 3}px`,
              }}
            >
              
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <header className="p-6 pt-6">
          <div className="max-w-7xl mx-auto">
            {/* Top Navigation Bar */}
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <div className={`text-xl font-bold bg-gradient-to-r ${
                  darkMode ? 'from-blue-400 to-purple-400' : 'from-blue-700 to-purple-700'
                } bg-clip-text text-transparent`}>
                  DL
                </div>
                <span className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  Daily Learning
                </span>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`px-3 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                  darkMode
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                } shadow-lg`}
              >
                <span className="text-base">{darkMode ? '' : ''}</span>
              </button>
            </div>

            {/* Greeting */}
            {learning.viewMode === 'daily' && (
              <div className="text-center mb-12">
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase ${
                    darkMode
                      ? 'bg-blue-900/30 text-blue-300 border border-blue-800'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  } backdrop-blur-sm`}>
                    Premium Learning
                  </span>
                </div>
                <h1 className="text-3xl font-bold mb-3 tracking-tight">
                  <span className={`bg-gradient-to-r ${
                    darkMode
                      ? 'from-blue-300 via-purple-300 to-indigo-300'
                      : 'from-blue-700 via-purple-700 to-indigo-700'
                  } bg-clip-text text-transparent`}>
                    {getGreeting()}
                  </span>
                </h1>
                <p className={`text-sm font-medium ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Your daily dose of brilliance awaits 
                </p>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            {learning.viewMode === 'daily' && (
              <DailyTopicsView
                topics={learning.dailyTopics}
                completedCount={learning.completedCount}
                onSelectTopic={learning.selectTopic}
                darkMode={darkMode}
              />
            )}

            {learning.viewMode === 'reading' && learning.selectedTopic && (
              <TopicReader
                topic={learning.selectedTopic}
                onMarkAsRead={learning.markAsRead}
                onBack={learning.goBackToDaily}
                darkMode={darkMode}
              />
            )}

            {learning.viewMode === 'quiz' && (
              <QuizView
                questions={learning.quizQuestions}
                onSubmit={learning.submitQuiz}
                darkMode={darkMode}
              />
            )}

            {learning.viewMode === 'result' && learning.quizResult && (
              <QuizResultView
                result={learning.quizResult}
                onBackToDaily={learning.goBackToDaily}
                darkMode={darkMode}
              />
            )}
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -40px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
        }

        @keyframes drift-reverse {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.1); }
          66% { transform: translate(30px, -40px) scale(0.9); }
        }

        @keyframes float-gentle {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.25; }
          50% { transform: translateY(-25px) rotate(10deg); opacity: 0.4; }
        }

        .animate-float-gentle {
          animation: float-gentle 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
