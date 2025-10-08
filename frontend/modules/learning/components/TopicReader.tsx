'use client';

import { TopicContent } from '../core/LearningApi';

interface TopicReaderProps {
  topic: TopicContent;
  onMarkAsRead: () => void;
  onBack: () => void;
  darkMode?: boolean;
}

export default function TopicReader({
  topic,
  onMarkAsRead,
  onBack,
  darkMode = false
}: TopicReaderProps) {
  const getDifficultyColor = () => {
    switch (topic.difficulty) {
      case 'SIMPLE':
        return darkMode ? 'from-green-500 to-emerald-500' : 'from-green-600 to-emerald-600';
      case 'MEDIUM':
        return darkMode ? 'from-blue-500 to-indigo-500' : 'from-blue-600 to-indigo-600';
      case 'ADVANCED':
        return darkMode ? 'from-purple-500 to-fuchsia-500' : 'from-purple-600 to-fuchsia-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className={`mb-6 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
          darkMode
            ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            : 'bg-white text-slate-800 hover:bg-slate-50'
        } border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}
      >
         Back to Topics
      </button>

      {/* Topic Card */}
      <div className={`rounded-3xl overflow-hidden border-2 backdrop-blur-xl shadow-2xl ${
        darkMode
          ? 'bg-slate-900/90 border-slate-700'
          : 'bg-white/95 border-slate-200'
      }`}>
        <div className="p-8 md:p-12">
          {/* Category & Difficulty */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`px-4 py-1.5 rounded-xl ${
              darkMode ? 'bg-slate-800/80' : 'bg-white/80'
            } backdrop-blur-sm border border-purple-400`}>
              <span className="text-base mr-2">{topic.category.icon || ''}</span>
              <span className={`text-xs font-bold uppercase tracking-wide ${
                darkMode ? 'text-purple-400' : 'text-purple-700'
              }`}>
                {topic.category.name}
              </span>
            </div>

            <div className={`px-4 py-1.5 rounded-xl bg-gradient-to-r ${getDifficultyColor()} text-white`}>
              <span className="text-xs font-bold uppercase tracking-wide">
                {topic.difficulty}
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className={`text-3xl md:text-4xl font-bold mb-6 ${
            darkMode ? 'text-slate-100' : 'text-slate-900'
          }`}>
            {topic.title}
          </h1>

          {/* Divider */}
          <div className={`h-1 w-24 rounded-full mb-8 bg-gradient-to-r ${getDifficultyColor()}`} />

          {/* Content */}
          <div className={`text-lg leading-relaxed mb-8 whitespace-pre-wrap ${
            darkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            {topic.content}
          </div>

          {/* Mark as Read Button */}
          <button
            onClick={onMarkAsRead}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-xl hover:scale-105 bg-gradient-to-r ${getDifficultyColor()} text-white`}
          >
            Mark as Read & Take Quiz 
          </button>
        </div>
      </div>
    </div>
  );
}
